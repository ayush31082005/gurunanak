import nodemailer from "nodemailer";

const createTransporter = () => {
    const smtpUser = process.env.EMAIL_USER || process.env.EMAIL;
    const smtpPass = process.env.EMAIL_PASS;

    if (!smtpUser || !smtpPass) {
        throw new Error("Email credentials are missing in environment variables");
    }

    return {
        smtpUser,
        transporter: nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        }),
    };
};

export const sendCallbackRequestNotification = async (callbackRequest) => {
    const { smtpUser, transporter } = createTransporter();
    const recipient =
        process.env.CALLBACK_NOTIFICATION_EMAIL ||
        process.env.CONTACT_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        process.env.ORDER_NOTIFICATION_EMAIL ||
        process.env.EMAIL_USER ||
        process.env.EMAIL;

    if (!recipient) {
        throw new Error("Callback notification recipient is missing");
    }

    const submittedAt = new Date(callbackRequest.createdAt || Date.now()).toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    );

    await transporter.sendMail({
        from: `"Gurunanak" <${smtpUser}>`,
        to: recipient,
        subject: `New Callback Request: ${callbackRequest.phone}`,
        html: `
            <div style="margin:0;padding:24px;background-color:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
                <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
                    <div style="background:linear-gradient(135deg,#ff6f61,#f45d4f);padding:24px 32px;color:#ffffff;">
                        <h1 style="margin:0;font-size:24px;font-weight:700;">New Callback Request</h1>
                        <p style="margin:8px 0 0;font-size:14px;opacity:0.95;">A customer requested a phone callback.</p>
                    </div>

                    <div style="padding:32px;">
                        <div style="padding:18px;border-radius:14px;background:#fff7f5;border:1px solid #ffd1cb;">
                            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Phone:</strong> ${callbackRequest.phone}</p>
                            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Email:</strong> ${callbackRequest.email || "Not provided"}</p>
                            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Source:</strong> ${callbackRequest.source || "website"}</p>
                            <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Requested At:</strong> ${submittedAt}</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
    });
};
