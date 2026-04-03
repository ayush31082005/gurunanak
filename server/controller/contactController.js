import sendEmail from "../utils/sendEmail.js";
import CallbackRequest from "../models/CallbackRequest.js";
import { sendCallbackRequestNotification } from "../utils/sendCallbackRequestNotification.js";

export const submitContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required",
            });
        }

        const supportInbox =
            process.env.CONTACT_EMAIL ||
            process.env.SUPPORT_EMAIL ||
            process.env.EMAIL;

        if (!supportInbox) {
            return res.status(500).json({
                success: false,
                message: "Support email is not configured",
            });
        }

        await sendEmail(
            supportInbox,
            `New Contact Message from ${name.trim()}`,
            `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`
        );

        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
        });
    } catch (error) {
        console.error("Contact message error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to send message",
        });
    }
};

export const submitCallbackRequest = async (req, res) => {
    try {
        const phone = String(req.body.phone || "").replace(/\D/g, "").slice(0, 10);
        const email = String(req.body.email || "").trim().toLowerCase();
        const source = String(req.body.source || "website").trim();

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10-digit mobile number",
            });
        }

        const callbackRequest = await CallbackRequest.create({
            phone,
            email,
            source,
        });

        sendCallbackRequestNotification(callbackRequest).catch((error) => {
            console.error("Callback request email failed:", error.message);
        });

        return res.status(201).json({
            success: true,
            message: "Callback request sent successfully",
            callbackRequest,
        });
    } catch (error) {
        console.error("Callback request error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to send callback request",
        });
    }
};
