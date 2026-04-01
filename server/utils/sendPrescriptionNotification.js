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

const getPrescriptionTemplate = ({
    name,
    mobile,
    address,
    fileUrl,
    fileName,
    submittedAt,
}) => ({
    subject: `New Prescription Upload from ${name}`,
    html: `
      <div style="margin:0;padding:24px;background-color:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#ff6f61,#f45d4f);padding:24px 32px;color:#ffffff;">
            <h1 style="margin:0;font-size:24px;font-weight:700;">Prescription Upload Alert</h1>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.95;">A new customer prescription was submitted.</p>
          </div>

          <div style="padding:32px;">
            <div style="margin:0 0 20px;padding:18px;border-radius:14px;background:#fff7f5;border:1px solid #ffd1cb;">
              <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Name:</strong> ${name}</p>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Mobile:</strong> ${mobile}</p>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Address:</strong> ${address}</p>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>File:</strong> ${fileName}</p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Submitted:</strong> ${submittedAt}</p>
            </div>

            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4b5563;">
              Review the uploaded prescription using the secure link below and contact the customer to confirm the order.
            </p>

            <a
              href="${fileUrl}"
              target="_blank"
              rel="noreferrer"
              style="display:inline-block;padding:12px 20px;border-radius:999px;background:#ff6f61;color:#ffffff;text-decoration:none;font-weight:700;"
            >
              View Prescription
            </a>

            <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#6b7280;word-break:break-all;">
              Direct file link: ${fileUrl}
            </p>
          </div>
        </div>
      </div>
    `,
});

export const sendPrescriptionNotification = async (prescription) => {
    const { smtpUser, transporter } = createTransporter();
    const recipient =
        process.env.PRESCRIPTION_NOTIFICATION_EMAIL ||
        process.env.EMAIL_USER ||
        process.env.EMAIL;

    if (!recipient) {
        throw new Error("Prescription notification recipient is missing");
    }

    const template = getPrescriptionTemplate({
        name: prescription.name,
        mobile: prescription.mobile,
        address: prescription.address,
        fileUrl: prescription.fileUrl,
        fileName: prescription.fileName,
        submittedAt: prescription.createdAt.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        }),
    });

    await transporter.sendMail({
        from: `"Gurunanak" <${smtpUser}>`,
        to: recipient,
        subject: template.subject,
        html: template.html,
    });
};
