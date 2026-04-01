import crypto from "crypto";
import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";

const normalizeItems = (items = []) =>
    items
        .map((item) => ({
            productId: item.productId ? String(item.productId) : String(item.id ?? ""),
            name: item.name?.trim(),
            image: item.image?.trim() || "",
            pack: item.pack?.trim() || "",
            price: Number(item.price),
            quantity: Number(item.quantity),
        }))
        .filter((item) => item.name && Number.isFinite(item.price) && Number.isFinite(item.quantity));

const validateOrderPayload = ({ items, shippingInfo }) => {
    const normalizedItems = normalizeItems(items);

    if (!normalizedItems.length) {
        return { error: "Order items are required" };
    }

    if (
        !shippingInfo?.fullName ||
        !shippingInfo?.phone ||
        !shippingInfo?.email ||
        !shippingInfo?.address ||
        !shippingInfo?.city ||
        !shippingInfo?.state ||
        !shippingInfo?.pincode
    ) {
        return { error: "Complete shipping information is required" };
    }

    if (!/^\d{10}$/.test(String(shippingInfo.phone))) {
        return { error: "Please enter a valid 10 digit mobile number" };
    }

    if (!/^\d{6}$/.test(String(shippingInfo.pincode))) {
        return { error: "Please enter a valid 6 digit pincode" };
    }

    return { normalizedItems };
};

const getPricing = (normalizedItems, pricing = {}) => {
    const subtotal = Number(pricing.subtotal) || normalizedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const discount = Number(pricing.discount) || 0;

    return {
        subtotal,
        discount,
    };
};

const hasPreviousConfirmedOrder = async (userId) => {
    const existingOrder = await Order.exists({
        user: userId,
        status: { $ne: "payment_pending" },
    });

    return Boolean(existingOrder);
};

const getCodFee = ({ subtotal, paymentMethod, isFirstOrder }) => {
    if (paymentMethod !== "cod") {
        return 0;
    }

    if (isFirstOrder) {
        return 0;
    }

    return subtotal < 100 ? 30 : 5;
};

const sendOrderConfirmationEmail = (email, orderId, items, total) => {
    const orderIdShort = orderId.toString().slice(-8).toUpperCase();
    const itemSummary = items
        .map((item) => `${item.name} x ${item.quantity}`)
        .join(", ");

    return sendEmail(
        email,
        `Order Confirmed: #${orderIdShort}`,
        `Dear customer,\n\nYour order has been placed successfully.\n\nOrder ID: #${orderIdShort}\nItems: ${itemSummary}\nTotal: Rs ${total}\n\nThank you for shopping with us.`
    );
};

const createRazorpayApiOrder = async (amount, receipt) => {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret || keyId === "xxxx" || keySecret === "xxxx") {
        throw new Error("Razorpay keys are not configured");
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            amount,
            currency: "INR",
            receipt,
            payment_capture: 1,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.description || "Failed to create Razorpay order");
    }

    return data;
};

export const createOrder = async (req, res) => {
    try {
        const {
            items,
            shippingInfo,
            paymentMethod,
            pricing = {},
        } = req.body;

        if (paymentMethod !== "cod") {
            return res.status(400).json({
                message: "Online payments must be completed through Razorpay checkout",
            });
        }

        const { error, normalizedItems } = validateOrderPayload({ items, shippingInfo });

        if (error) {
            return res.status(400).json({ message: error });
        }

        const { subtotal, discount } = getPricing(normalizedItems, pricing);
        const isFirstOrder = !(await hasPreviousConfirmedOrder(req.user._id));
        const codFee = getCodFee({ subtotal, paymentMethod, isFirstOrder });
        const total = Math.max(subtotal + codFee - discount, 0);

        const order = await Order.create({
            user: req.user._id,
            items: normalizedItems,
            shippingInfo,
            paymentMethod,
            subtotal,
            deliveryFee: 0,
            codFee,
            platformFee: 0,
            discount,
            total,
            status: paymentMethod === "cod" ? "pending" : "placed",
            tracking: [
                {
                    status: paymentMethod === "cod" ? "pending" : "placed",
                    message: "Order placed successfully",
                    timestamp: new Date(),
                },
            ],
        });

        sendOrderConfirmationEmail(req.user.email, order._id, normalizedItems, total).catch((error) => {
            console.error("Order confirmation email failed:", error.message);
        });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.error("Order error:", error);
        return res.status(500).json({ message: "Failed to place order" });
    }
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const {
            items,
            shippingInfo,
            paymentMethod,
            pricing = {},
        } = req.body;

        if (!["card", "upi"].includes(paymentMethod)) {
            return res.status(400).json({ message: "Please select an online payment method" });
        }

        const { error, normalizedItems } = validateOrderPayload({ items, shippingInfo });

        if (error) {
            return res.status(400).json({ message: error });
        }

        const { subtotal, discount } = getPricing(normalizedItems, pricing);
        const total = Math.max(subtotal - discount, 0);
        const amountInPaise = Math.round(total * 100);
        const receipt = `rcpt_${Date.now()}`;
        const razorpayOrder = await createRazorpayApiOrder(amountInPaise, receipt);

        const order = await Order.create({
            user: req.user._id,
            items: normalizedItems,
            shippingInfo,
            paymentMethod,
            subtotal,
            deliveryFee: 0,
            codFee: 0,
            platformFee: 0,
            discount,
            total,
            razorpayOrderId: razorpayOrder.id,
            status: "payment_pending",
            tracking: [
                {
                    status: "payment_pending",
                    message: "Waiting for Razorpay payment",
                    timestamp: new Date(),
                },
            ],
        });

        return res.status(201).json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: order._id,
            customer: {
                name: shippingInfo.fullName,
                email: shippingInfo.email,
                contact: shippingInfo.phone,
            },
        });
    } catch (error) {
        console.error("Razorpay order error:", error);
        return res.status(500).json({
            message: error.message || "Failed to start online payment",
        });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Razorpay payment details are required" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        const order = await Order.findOne({
            _id: req.body.orderId,
            user: req.user._id,
            razorpayOrderId: razorpay_order_id,
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found for payment verification" });
        }

        order.razorpayPaymentId = razorpay_payment_id;
        order.status = "placed";
        order.tracking.push({
            status: "placed",
            message: "Payment received and order confirmed",
            timestamp: new Date(),
        });
        await order.save();

        sendOrderConfirmationEmail(req.user.email, order._id, order.items, order.total).catch((error) => {
            console.error("Order confirmation email failed:", error.message);
        });

        return res.json({
            success: true,
            message: "Payment verified and order confirmed",
            order,
        });
    } catch (error) {
        console.error("Razorpay verification error:", error);
        return res.status(500).json({ message: "Failed to verify payment" });
    }
};

export const myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
        return res.json(orders);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch orders" });
    }
};
