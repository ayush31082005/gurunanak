import sendEmail from "../utils/sendEmail.js";

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
