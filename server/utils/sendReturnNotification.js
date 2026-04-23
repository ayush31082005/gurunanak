import nodemailer from "nodemailer";

const formatAmount = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

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

const getAdminRecipient = () =>
    process.env.RETURN_NOTIFICATION_EMAIL ||
    process.env.ORDER_NOTIFICATION_EMAIL ||
    process.env.PRESCRIPTION_NOTIFICATION_EMAIL ||
    process.env.EMAIL_USER ||
    process.env.EMAIL;

const getItemSummary = (items = []) =>
    items
        .map((item) => `${item.name} x ${item.quantity}`)
        .join(", ");

const sendMail = async ({ to, subject, html }) => {
    const { smtpUser, transporter } = createTransporter();

    await transporter.sendMail({
        from: `"Gurunanak" <${smtpUser}>`,
        to,
        subject,
        html,
    });
};

export const sendReturnRequestNotification = async ({ returnRequest, order, user }) => {
    const recipient = getAdminRecipient();

    if (!recipient) {
        throw new Error("Return notification recipient is missing");
    }

    await sendMail({
        to: recipient,
        subject: `Return Requested: #${String(order._id).slice(-8).toUpperCase()}`,
        html: `
            <div style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
                <div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                    <div style="padding:24px 28px;background:linear-gradient(135deg,#ff8a65,#ef5350);color:#fff;">
                        <h1 style="margin:0;font-size:24px;">New Return Request</h1>
                        <p style="margin:8px 0 0;font-size:14px;opacity:0.95;">A customer has submitted a ${returnRequest.type} request.</p>
                    </div>
                    <div style="padding:28px;">
                        <p style="margin:0 0 10px;"><strong>Order ID:</strong> ${order._id}</p>
                        <p style="margin:0 0 10px;"><strong>Customer:</strong> ${user?.name || order.shippingInfo?.fullName || "N/A"}</p>
                        <p style="margin:0 0 10px;"><strong>Email:</strong> ${user?.email || order.shippingInfo?.email || "N/A"}</p>
                        <p style="margin:0 0 10px;"><strong>Type:</strong> ${returnRequest.type}</p>
                        <p style="margin:0 0 10px;"><strong>Amount:</strong> ${formatAmount(order.total)}</p>
                        <p style="margin:0 0 10px;"><strong>Items:</strong> ${getItemSummary(returnRequest.items)}</p>
                        <p style="margin:0 0 10px;"><strong>Reason:</strong> ${returnRequest.reason}</p>
                        <p style="margin:0;"><strong>Proof:</strong> <a href="${returnRequest.proofImage.url}" target="_blank" rel="noreferrer">View uploaded image</a></p>
                    </div>
                </div>
            </div>
        `,
    });
};

export const sendReturnDecisionEmail = async ({ returnRequest, order, user, decision }) => {
    const recipient = user?.email || order.shippingInfo?.email;

    if (!recipient) {
        throw new Error("User email is missing for return decision notification");
    }

    const decisionTitle = decision === "approved" ? "approved" : "rejected";

    await sendMail({
        to: recipient,
        subject: `Return Request ${decisionTitle}: #${String(order._id).slice(-8).toUpperCase()}`,
        html: `
            <div style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
                <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                    <div style="padding:24px 28px;background:${decision === "approved" ? "linear-gradient(135deg,#34d399,#059669)" : "linear-gradient(135deg,#f87171,#dc2626)"};color:#fff;">
                        <h1 style="margin:0;font-size:24px;">Return Request ${decisionTitle}</h1>
                    </div>
                    <div style="padding:28px;">
                        <p style="margin:0 0 10px;">Your ${returnRequest.type} request for order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> has been ${decisionTitle}.</p>
                        <p style="margin:0 0 10px;"><strong>Items:</strong> ${getItemSummary(returnRequest.items)}</p>
                        <p style="margin:0 0 10px;"><strong>Reason submitted:</strong> ${returnRequest.reason}</p>
                        ${
                            returnRequest.adminNote
                                ? `<p style="margin:0;"><strong>Admin note:</strong> ${returnRequest.adminNote}</p>`
                                : ""
                        }
                    </div>
                </div>
            </div>
        `,
    });
};

export const sendRefundCompletedEmail = async ({ returnRequest, order, user }) => {
    const recipient = user?.email || order.shippingInfo?.email;

    if (!recipient) {
        throw new Error("User email is missing for refund completion notification");
    }

    await sendMail({
        to: recipient,
        subject: `Refund Completed: #${String(order._id).slice(-8).toUpperCase()}`,
        html: `
            <div style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
                <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                    <div style="padding:24px 28px;background:linear-gradient(135deg,#38bdf8,#0284c7);color:#fff;">
                        <h1 style="margin:0;font-size:24px;">Refund Completed</h1>
                    </div>
                    <div style="padding:28px;">
                        <p style="margin:0 0 10px;">Your refund for order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> has been completed manually by our team.</p>
                        <p style="margin:0 0 10px;"><strong>Refund amount:</strong> ${formatAmount(order.total)}</p>
                        <p style="margin:0;"><strong>Items:</strong> ${getItemSummary(returnRequest.items)}</p>
                    </div>
                </div>
            </div>
        `,
    });
};

export const sendReplacementCreatedEmail = async ({
    returnRequest,
    order,
    replacementOrder,
    user,
}) => {
    const recipient = user?.email || order.shippingInfo?.email;

    if (!recipient) {
        throw new Error("User email is missing for replacement notification");
    }

    await sendMail({
        to: recipient,
        subject: `Replacement Created: #${String(replacementOrder._id).slice(-8).toUpperCase()}`,
        html: `
            <div style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
                <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                    <div style="padding:24px 28px;background:linear-gradient(135deg,#60a5fa,#2563eb);color:#fff;">
                        <h1 style="margin:0;font-size:24px;">Replacement Order Created</h1>
                    </div>
                    <div style="padding:28px;">
                        <p style="margin:0 0 10px;">Your replacement request for order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> has been approved.</p>
                        <p style="margin:0 0 10px;"><strong>Replacement order ID:</strong> ${replacementOrder._id}</p>
                        <p style="margin:0 0 10px;"><strong>Payment required:</strong> No</p>
                        <p style="margin:0;"><strong>Items:</strong> ${getItemSummary(returnRequest.items)}</p>
                    </div>
                </div>
            </div>
        `,
    });
};
