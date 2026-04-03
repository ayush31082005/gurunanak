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

const buildItemsMarkup = (items = []) =>
    items
        .map(
            (item) => `
                <tr>
                    <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#1f2937;">${item.name}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#4b5563;">${item.quantity}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#4b5563;">Rs ${Number(item.price || 0).toLocaleString("en-IN")}</td>
                </tr>
            `
        )
        .join("");

const getOrderTemplate = ({ order }) => {
    const submittedAt = new Date(order.createdAt || Date.now()).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    return {
        subject: `New Order Received: #${String(order._id).slice(-8).toUpperCase()}`,
        html: `
            <div style="margin:0;padding:24px;background-color:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
                <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
                    <div style="background:linear-gradient(135deg,#ff6f61,#f45d4f);padding:24px 32px;color:#ffffff;">
                        <h1 style="margin:0;font-size:24px;font-weight:700;">New Customer Order</h1>
                        <p style="margin:8px 0 0;font-size:14px;opacity:0.95;">A new order has been placed on the store.</p>
                    </div>

                    <div style="padding:32px;">
                        <div style="margin:0 0 20px;padding:18px;border-radius:14px;background:#fff7f5;border:1px solid #ffd1cb;">
                            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Order ID:</strong> ${order._id}</p>
                            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Customer:</strong> ${order.shippingInfo?.fullName || "N/A"}</p>
                            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Email:</strong> ${order.shippingInfo?.email || "N/A"}</p>
                            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Phone:</strong> ${order.shippingInfo?.phone || "N/A"}</p>
                            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Payment:</strong> ${order.paymentMethod || "N/A"}</p>
                            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Status:</strong> ${order.status || "N/A"}</p>
                            <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Total:</strong> Rs ${Number(order.total || 0).toLocaleString("en-IN")}</p>
                            <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563;"><strong>Placed At:</strong> ${submittedAt}</p>
                        </div>

                        <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Ordered Items</h2>
                        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                            <thead>
                                <tr style="background:#f8fafc;">
                                    <th style="padding:10px 12px;text-align:left;font-size:13px;color:#374151;">Item</th>
                                    <th style="padding:10px 12px;text-align:left;font-size:13px;color:#374151;">Qty</th>
                                    <th style="padding:10px 12px;text-align:left;font-size:13px;color:#374151;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${buildItemsMarkup(order.items)}
                            </tbody>
                        </table>

                        <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#4b5563;">
                            <strong>Delivery Address:</strong> ${[
                                order.shippingInfo?.address,
                                order.shippingInfo?.city,
                                order.shippingInfo?.state,
                                order.shippingInfo?.pincode,
                            ]
                                .filter(Boolean)
                                .join(", ") || "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        `,
    };
};

export const sendOrderNotification = async (order) => {
    const { smtpUser, transporter } = createTransporter();
    const recipient =
        process.env.ORDER_NOTIFICATION_EMAIL ||
        process.env.PRESCRIPTION_NOTIFICATION_EMAIL ||
        process.env.EMAIL_USER ||
        process.env.EMAIL;

    if (!recipient) {
        throw new Error("Order notification recipient is missing");
    }

    const template = getOrderTemplate({ order });

    await transporter.sendMail({
        from: `"Gurunanak" <${smtpUser}>`,
        to: recipient,
        subject: template.subject,
        html: template.html,
    });
};
