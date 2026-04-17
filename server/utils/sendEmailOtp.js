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

const getEmailTemplate = ({ otp, purpose }) => {
    const isRegister = purpose === "register" || purpose === "mr_register";
    const isMrRegister = purpose === "mr_register";
    const heading = isRegister
        ? isMrRegister
            ? "Complete Your MR Registration"
            : "Complete Your Registration"
        : "Complete Your Login";
    const subject = isRegister
        ? isMrRegister
            ? "Gurunanak MR Registration Verification Code"
            : "Welcome to Gurunanak - Verify Your Email"
        : "Gurunanak Login Verification Code";
    const intro = isRegister
        ? isMrRegister
            ? "Thank you for applying as a Medical Representative. Please use the verification code below to confirm your email and submit your MR registration."
            : "Thank you for choosing Gurunanak. Please use the verification code below to complete your account registration."
        : "We received a login request for your Gurunanak account. Please use the verification code below to continue securely.";
    const footer = isRegister
        ? isMrRegister
            ? "Once verified, your MR profile will be submitted for admin approval."
            : "Once verified, you will be able to access your account and continue shopping with ease."
        : "If you did not try to sign in, please ignore this email and consider securing your account.";

    return {
        subject,
        html: `
      <div style="margin:0;padding:24px;background-color:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#ff6f61,#f45d4f);padding:24px 32px;color:#ffffff;">
            <h1 style="margin:0;font-size:24px;font-weight:700;">Gurunanak Health Products</h1>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.95;">Secure email verification</p>
          </div>

          <div style="padding:32px;">
            <h2 style="margin:0 0 12px;font-size:22px;color:#111827;">${heading}</h2>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4b5563;">${intro}</p>

            <div style="margin:24px 0;padding:20px;border:1px dashed #ff6f61;border-radius:14px;background:#fff7f5;text-align:center;">
              <p style="margin:0 0 10px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">Your OTP Code</p>
              <div style="font-size:32px;font-weight:700;letter-spacing:10px;color:#ff6f61;">${otp}</div>
              <p style="margin:12px 0 0;font-size:13px;color:#6b7280;">This OTP is valid for 5 minutes.</p>
            </div>

            <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#4b5563;">${footer}</p>
            <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563;">Need help? Reply to this email and our team will assist you.</p>
          </div>

          <div style="padding:18px 32px;border-top:1px solid #e5e7eb;background:#f9fafb;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">This is an automated message from Gurunanak Health Products. Please do not share your OTP with anyone.</p>
          </div>
        </div>
      </div>
    `,
    };
};

const getNotificationTemplate = ({ purpose }) => {
    const isRegister = purpose === "register";

    return {
        subject: isRegister
            ? "Welcome to Gurunanak - Registration Successful"
            : "Gurunanak Login Alert",
        html: `
      <div style="margin:0;padding:24px;background-color:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#ff6f61,#f45d4f);padding:24px 32px;color:#ffffff;">
            <h1 style="margin:0;font-size:24px;font-weight:700;">Gurunanak Health Products</h1>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.95;">Account notification</p>
          </div>

          <div style="padding:32px;">
            <h2 style="margin:0 0 12px;font-size:22px;color:#111827;">
              ${isRegister ? "Your account has been created successfully" : "Login completed successfully"}
            </h2>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4b5563;">
              ${isRegister
                ? "Welcome to Gurunanak. Your email has been verified and your account is now active."
                : "Your Gurunanak account was accessed successfully using OTP verification."}
            </p>
            <div style="margin:24px 0;padding:18px 20px;border-radius:14px;background:#fff7f5;border:1px solid #ffd1cb;">
              <p style="margin:0;font-size:14px;line-height:1.8;color:#4b5563;">
                ${isRegister
                    ? "You can now log in, upload prescriptions, and continue your medicine orders with confidence."
                    : "If this login was not performed by you, please reply to this email immediately so our team can help secure your account."}
              </p>
            </div>
            <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563;">
              Thank you for choosing Gurunanak Health Products.
            </p>
          </div>

          <div style="padding:18px 32px;border-top:1px solid #e5e7eb;background:#f9fafb;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">This is an automated message from Gurunanak Health Products.</p>
          </div>
        </div>
      </div>
    `,
    };
};

const sendEmailOtp = async (email, otp, purpose = "register") => {
    const { smtpUser, transporter } = createTransporter();
    const template = getEmailTemplate({ otp, purpose });

    const mailOptions = {
        from: `"Gurunanak" <${smtpUser}>`,
        to: email,
        subject: template.subject,
        html: template.html,
    };

    await transporter.sendMail(mailOptions);
};

export const sendAccountNotificationEmail = async (email, purpose = "register") => {
    const { smtpUser, transporter } = createTransporter();
    const template = getNotificationTemplate({ purpose });

    const mailOptions = {
        from: `"Gurunanak" <${smtpUser}>`,
        to: email,
        subject: template.subject,
        html: template.html,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmailOtp;
