import cron from "node-cron";
import mongoose from "mongoose";
import Reminder from "../models/Reminder.js";
import { sendReminderEmail, isReminderEmailConfigured } from "./reminderEmailService.js";

const REMINDER_TIMEZONE =
    process.env.REMINDER_TIMEZONE ||
    process.env.TZ ||
    "Asia/Kolkata";

let reminderCronJob = null;
let missingEmailConfigLogged = false;
let missingDbConnectionLogged = false;

const formatDateParts = (date) => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: REMINDER_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getValue = (type) => parts.find((part) => part.type === type)?.value || "";

    return {
        dateKey: `${getValue("year")}-${getValue("month")}-${getValue("day")}`,
        timeKey: `${getValue("hour")}:${getValue("minute")}`,
    };
};

const formatDateKeyForReminder = (value) => {
    if (!value) {
        return "";
    }

    const date = value instanceof Date ? value : new Date(value);
    return formatDateParts(date).dateKey;
};

const shouldSendForDate = (reminder, dateKey) => {
    const startDateKey = formatDateKeyForReminder(reminder.startDate);
    const endDateKey = formatDateKeyForReminder(reminder.endDate);

    if (!startDateKey || !endDateKey) {
        return false;
    }

    return dateKey >= startDateKey && dateKey <= endDateKey;
};

const processReminderSlot = async (reminder, dateKey, timeKey) => {
    const sentKey = `${dateKey}_${timeKey}`;

    if (reminder.lastSentKeys?.includes(sentKey)) {
        return;
    }

    await sendReminderEmail({
        to: reminder.email,
        medicineName: reminder.medicineName,
        dose: reminder.dose,
        reminderTime: timeKey,
    });

    await Reminder.updateOne(
        { _id: reminder._id },
        { $addToSet: { lastSentKeys: sentKey } }
    );
};

export const runReminderDispatch = async () => {
    if (mongoose.connection.readyState !== 1) {
        if (!missingDbConnectionLogged) {
            console.warn("Reminder cron skipped because MongoDB is not connected.");
            missingDbConnectionLogged = true;
        }
        return;
    }

    missingDbConnectionLogged = false;

    if (!isReminderEmailConfigured()) {
        if (!missingEmailConfigLogged) {
            console.warn(
                "Reminder emails are disabled because EMAIL or EMAIL_PASS is missing."
            );
            missingEmailConfigLogged = true;
        }
        return;
    }

    missingEmailConfigLogged = false;

    const { dateKey, timeKey } = formatDateParts(new Date());
    const reminders = await Reminder.find({
        isActive: true,
        times: timeKey,
    }).lean();

    for (const reminder of reminders) {
        if (!shouldSendForDate(reminder, dateKey)) {
            continue;
        }

        try {
            await processReminderSlot(reminder, dateKey, timeKey);
        } catch (error) {
            console.error(
                `Failed to send reminder ${reminder._id} for ${timeKey}:`,
                error.message
            );
        }
    }
};

export const startReminderCron = () => {
    if (reminderCronJob) {
        return reminderCronJob;
    }

    reminderCronJob = cron.schedule(
        "* * * * *",
        async () => {
            try {
                await runReminderDispatch();
            } catch (error) {
                console.error("Reminder cron run failed:", error?.message || error);
            }
        },
        {
            timezone: REMINDER_TIMEZONE,
        }
    );

    console.log(`Reminder cron started in timezone ${REMINDER_TIMEZONE}`);
    return reminderCronJob;
};

export default startReminderCron;
