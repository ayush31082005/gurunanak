import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Reminder from "../models/Reminder.js";
import { extractTextFromImage } from "../services/ocrService.js";
import { parseReminderText } from "../services/reminderParser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.join(__dirname, "..", "uploads");
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const normalizeText = (value = "") => String(value || "").trim();
const normalizeEmail = (value = "") => String(value || "").trim().toLowerCase();

const normalizeDateInput = (value, fieldName) => {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
        throw new Error(`${fieldName} is required`);
    }

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`${fieldName} is invalid`);
    }

    return date;
};

const normalizeTimes = (value) => {
    const rawTimes = Array.isArray(value)
        ? value
        : typeof value === "string"
          ? value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
          : [];

    const sanitizedTimes = [...new Set(rawTimes.map((time) => normalizeText(time)))].sort(
        (left, right) => left.localeCompare(right)
    );

    if (!sanitizedTimes.length) {
        throw new Error("At least one reminder time is required");
    }

    const invalidTime = sanitizedTimes.find((time) => !timePattern.test(time));
    if (invalidTime) {
        throw new Error(`Invalid reminder time: ${invalidTime}`);
    }

    return sanitizedTimes;
};

const buildPublicUploadPath = (fileName = "") => {
    const sanitizedFileName = normalizeText(fileName).replace(/^\/?uploads\//, "");
    return sanitizedFileName ? `/uploads/${sanitizedFileName}` : "";
};

const resolveUploadPath = (fileUrl = "") => {
    const fileName = normalizeText(fileUrl).replace(/^\/?uploads\//, "");
    return fileName ? path.join(uploadsDirectory, fileName) : "";
};

const deleteUploadIfExists = async (fileUrl = "") => {
    const absolutePath = resolveUploadPath(fileUrl);

    if (!absolutePath) {
        return;
    }

    try {
        await fs.promises.unlink(absolutePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error(`Failed to delete upload ${absolutePath}:`, error.message);
        }
    }
};

const validateDateRange = (startDate, endDate) => {
    if (endDate < startDate) {
        throw new Error("End date cannot be earlier than start date");
    }
};

const buildReminderPayload = (body, user, currentReminder = null) => {
    const medicineName = normalizeText(body.medicineName);
    const frequency = normalizeText(body.frequency);
    const dose = normalizeText(body.dose);
    const rawScanText = normalizeText(body.rawScanText);
    const image = buildPublicUploadPath(body.image || currentReminder?.image || "");
    const startDate = normalizeDateInput(body.startDate, "Start date");
    const endDate = normalizeDateInput(body.endDate, "End date");
    const times = normalizeTimes(body.times);
    const isActive =
        typeof body.isActive === "boolean"
            ? body.isActive
            : typeof body.isActive === "string"
              ? body.isActive === "true"
              : currentReminder?.isActive ?? true;

    if (!medicineName) {
        throw new Error("Medicine name is required");
    }

    if (!frequency) {
        throw new Error("Frequency is required");
    }

    validateDateRange(startDate, endDate);

    return {
        medicineName,
        dose,
        rawScanText,
        frequency,
        image,
        times,
        startDate,
        endDate,
        email: normalizeEmail(user.email),
        user: user._id,
        isActive,
    };
};

const serializeReminder = (reminder) => ({
    _id: reminder._id,
    user: reminder.user,
    medicineName: reminder.medicineName,
    dose: reminder.dose,
    rawScanText: reminder.rawScanText,
    frequency: reminder.frequency,
    image: reminder.image,
    times: reminder.times || [],
    startDate: reminder.startDate,
    endDate: reminder.endDate,
    email: reminder.email,
    isActive: reminder.isActive,
    lastSentKeys: reminder.lastSentKeys || [],
    history: reminder.history || [],
    createdAt: reminder.createdAt,
    updatedAt: reminder.updatedAt,
});

export const scanReminderImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a medicine image to scan",
            });
        }

        const { text, confidence } = await extractTextFromImage(req.file.path);
        const parsedReminder = parseReminderText(text);

        return res.status(200).json({
            success: true,
            message: "Medicine scan completed",
            image: buildPublicUploadPath(req.file.filename),
            rawScanText: parsedReminder.rawScanText,
            confidence,
            parsedReminder: {
                medicineName: parsedReminder.medicineName,
                dose: parsedReminder.dose,
                frequency: parsedReminder.frequency,
                times: parsedReminder.times,
            },
        });
    } catch (error) {
        console.error("Reminder OCR scan failed:", error.message);

        if (req.file?.filename) {
            await deleteUploadIfExists(req.file.filename);
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to scan medicine image",
        });
    }
};

export const createReminder = async (req, res) => {
    try {
        const payload = buildReminderPayload(req.body, req.user);
        const reminder = await Reminder.create(payload);

        return res.status(201).json({
            success: true,
            message: "Reminder saved successfully",
            reminder: serializeReminder(reminder),
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to save reminder",
        });
    }
};

export const getMyReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.user._id })
            .sort({ isActive: -1, startDate: 1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: reminders.length,
            reminders: reminders.map(serializeReminder),
        });
    } catch (error) {
        console.error("Fetch reminders failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reminders",
        });
    }
};

export const updateReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: "Reminder not found",
            });
        }

        const previousImage = reminder.image;
        const payload = buildReminderPayload(req.body, req.user, reminder);

        Object.assign(reminder, payload);
        await reminder.save();

        if (previousImage && payload.image && previousImage !== payload.image) {
            await deleteUploadIfExists(previousImage);
        }

        return res.status(200).json({
            success: true,
            message: "Reminder updated successfully",
            reminder: serializeReminder(reminder),
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update reminder",
        });
    }
};

export const deleteReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: "Reminder not found",
            });
        }

        await reminder.deleteOne();

        if (reminder.image) {
            await deleteUploadIfExists(reminder.image);
        }

        return res.status(200).json({
            success: true,
            message: "Reminder deleted successfully",
        });
    } catch (error) {
        console.error("Delete reminder failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to delete reminder",
        });
    }
};

export const toggleReminderStatus = async (req, res) => {
    try {
        const reminder = await Reminder.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: "Reminder not found",
            });
        }

        reminder.isActive = !reminder.isActive;
        await reminder.save();

        return res.status(200).json({
            success: true,
            message: `Reminder ${reminder.isActive ? "activated" : "paused"} successfully`,
            reminder: serializeReminder(reminder),
        });
    } catch (error) {
        console.error("Toggle reminder failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update reminder status",
        });
    }
};

export const logDoseStatus = async (req, res) => {
    try {
        const { date, time, status } = req.body;

        if (!date || !time || !status) {
            return res.status(400).json({
                success: false,
                message: "Date, time, and status are required",
            });
        }

        if (!["taken", "skipped"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'taken' or 'skipped'",
            });
        }

        const reminder = await Reminder.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: "Reminder not found",
            });
        }

        // Normalize date to start of day for consistent comparison
        const logDate = new Date(date);
        logDate.setHours(0, 0, 0, 0);

        // Optional: Remove existing logs for the same date and time to avoid duplicates
        reminder.history = reminder.history.filter(
            (item) =>
                new Date(item.date).getTime() !== logDate.getTime() || item.time !== time
        );

        reminder.history.push({
            date: logDate,
            time,
            status,
        });

        // Limit history to last 100 entries to prevent document bloating
        if (reminder.history.length > 100) {
            reminder.history = reminder.history.slice(-100);
        }

        await reminder.save();

        return res.status(200).json({
            success: true,
            message: `Dose marked as ${status}`,
            reminder: serializeReminder(reminder),
        });
    } catch (error) {
        console.error("Log dose status failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to log dose status",
        });
    }
};
