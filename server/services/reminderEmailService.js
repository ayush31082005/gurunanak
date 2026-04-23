import nodemailer from "nodemailer";

let cachedTransporter = null;

const getReminderTransporter = () => {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    cachedTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
    });

    return cachedTransporter;
};

export const isReminderEmailConfigured = () =>
    Boolean(process.env.EMAIL && process.env.EMAIL_PASS);

export const sendReminderEmail = async ({
    to,
    medicineName,
    dose,
    reminderTime,
}) => {
    if (!isReminderEmailConfigured()) {
        throw new Error("Reminder email credentials are not configured");
    }

    const transporter = getReminderTransporter();
    const subject = `Medicine reminder: ${medicineName || "Your medicine"}`;
    const text = [
        "Time to take your medicine.",
        "",
        `Medicine: ${medicineName || "N/A"}`,
        `Dose: ${dose || "As prescribed"}`,
        `Reminder time: ${reminderTime}`,
    ].join("\n");

    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject,
        text,
    });
};

export default sendReminderEmail;
