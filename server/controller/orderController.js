import crypto from "crypto";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Return from "../models/Return.js";
import sendEmail from "../utils/sendEmail.js";
import { sendOrderNotification } from "../utils/sendOrderNotification.js";

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const stockReservedStatuses = new Set([
    "pending",
    "pick_product",
    "placed",
    "shipped",
    "out_for_delivery",
    "delivered",
]);

const deriveProductStatus = (stock) => {
    const safeStock = Number(stock) || 0;

    if (safeStock <= 0) return "Out of Stock";
    if (safeStock <= 10) return "Low Stock";
    return "In Stock";
};

const createInventoryError = (message) => {
    const error = new Error(message);
    error.code = "INVENTORY_ERROR";
    return error;
};

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
        .filter(
            (item) =>
                item.name &&
                Number.isFinite(item.price) &&
                Number.isFinite(item.quantity)
        );

const getProductOwnershipMap = async (items = []) => {
    const productIds = [
        ...new Set(
            items
                .map((item) => String(item?.productId || ""))
                .filter((productId) => mongoose.Types.ObjectId.isValid(productId))
        ),
    ];

    if (!productIds.length) {
        return new Map();
    }

    const products = await Product.find({ _id: { $in: productIds } })
        .select("_id createdBy createdByRole")
        .lean();

    return new Map(products.map((product) => [String(product._id), product]));
};

const attachProductOwnershipToItems = async (items = []) => {
    const ownershipMap = await getProductOwnershipMap(items);

    return items.map((item) => {
        const ownership = ownershipMap.get(String(item?.productId || ""));
        const productOwnerRole = ownership?.createdByRole === "mr" ? "mr" : "admin";

        return {
            ...item,
            productOwnerRole,
            mrId: productOwnerRole === "mr" ? ownership?.createdBy || null : null,
        };
    });
};

const getMrOwnedOrderItems = (items = []) => {
    const seenItems = new Set();

    return items.filter((item) => {
        if (item?.productOwnerRole !== "mr" || !item?.mrId) {
            return false;
        }

        const uniqueKey = `${String(item.mrId)}:${String(item.productId || item.name)}`;

        if (seenItems.has(uniqueKey)) {
            return false;
        }

        seenItems.add(uniqueKey);
        return true;
    });
};

const createMrNotificationsForOrderItems = async ({
    items = [],
    orderId,
    title,
    messageBuilder,
}) => {
    const mrItems = getMrOwnedOrderItems(items);

    if (!mrItems.length) {
        return;
    }

    await Notification.insertMany(
        mrItems.map((item) => ({
            mrId: item.mrId,
            title,
            message: messageBuilder(item),
            relatedOrder: orderId,
            relatedProduct: mongoose.Types.ObjectId.isValid(item.productId)
                ? item.productId
                : null,
        }))
    );
};

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
    const subtotal =
        Number(pricing.subtotal) ||
        normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const discount = Number(pricing.discount) || 0;

    return {
        subtotal,
        discount,
    };
};

const getTrackedOrderItems = (items = []) => {
    const quantityByProductId = new Map();

    items.forEach((item) => {
        if (!mongoose.Types.ObjectId.isValid(item.productId)) {
            return;
        }

        const productId = String(item.productId);
        const quantity = Number(item.quantity) || 0;

        if (quantity <= 0) {
            return;
        }

        quantityByProductId.set(
            productId,
            (quantityByProductId.get(productId) || 0) + quantity
        );
    });

    return quantityByProductId;
};

export const adjustInventoryForItems = async (items = [], action = "decrement") => {
    const quantityByProductId = getTrackedOrderItems(items);

    if (quantityByProductId.size === 0) {
        return;
    }

    const stockMultiplier = action === "increment" ? 1 : -1;
    const appliedUpdates = [];

    try {
        for (const [productId, quantity] of quantityByProductId.entries()) {
            const query =
                action === "decrement"
                    ? { _id: productId, stock: { $gte: quantity } }
                    : { _id: productId };

            const updatedProduct = await Product.findOneAndUpdate(
                query,
                { $inc: { stock: stockMultiplier * quantity } },
                { new: true }
            );

            if (!updatedProduct) {
                const currentProduct = await Product.findById(productId);

                if (!currentProduct) {
                    throw createInventoryError("One of the ordered products no longer exists");
                }

                if (action === "decrement") {
                    throw createInventoryError(
                        `Only ${currentProduct.stock} units are available for ${currentProduct.name}`
                    );
                }

                throw createInventoryError(`Failed to update stock for ${currentProduct.name}`);
            }

            const nextStatus = deriveProductStatus(updatedProduct.stock);

            if (updatedProduct.status !== nextStatus) {
                updatedProduct.status = nextStatus;
                await updatedProduct.save();
            }

            appliedUpdates.push({ productId, quantity });
        }
    } catch (error) {
        if (action === "decrement" && appliedUpdates.length > 0) {
            await Promise.all(
                appliedUpdates.map(async ({ productId, quantity }) => {
                    const revertedProduct = await Product.findByIdAndUpdate(
                        productId,
                        { $inc: { stock: quantity } },
                        { new: true }
                    );

                    if (revertedProduct) {
                        const nextStatus = deriveProductStatus(revertedProduct.stock);

                        if (revertedProduct.status !== nextStatus) {
                            revertedProduct.status = nextStatus;
                            await revertedProduct.save();
                        }
                    }
                })
            );
        }

        throw error;
    }
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
    const itemSummary = items.map((item) => `${item.name} x ${item.quantity}`).join(", ");

    return sendEmail(
        email,
        `Order Confirmed: #${orderIdShort}`,
        `Dear customer,

Your order has been placed successfully.

Order ID: #${orderIdShort}
Items: ${itemSummary}
Total: Rs ${total}

Thank you for shopping with us.`
    );
};

const allowedAdminStatuses = new Set([
    "pending",
    "payment_pending",
    "pick_product",
    "placed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
]);

const cancellableUserStatuses = new Set([
    "pending",
    "payment_pending",
    "placed",
]);

const statusMessages = {
    pending: "Order marked as pending by admin",
    payment_pending: "Order marked as awaiting payment by admin",
    pick_product: "Product is being picked from inventory",
    placed: "Order confirmed by admin",
    shipped: "Order shipped by admin",
    out_for_delivery: "Order is out for delivery",
    delivered: "Order delivered successfully",
    cancelled: "Order cancelled by admin",
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

const isOnlinePaymentMethod = (paymentMethod = "") =>
    ["card", "upi"].includes(String(paymentMethod || "").trim().toLowerCase());

export const createOrder = async (req, res) => {
    let normalizedItems = [];
    let stockReduced = false;

    try {
        const {
            items,
            shippingInfo,
            paymentMethod,
            pricing = {},
        } = req.body;

        if (paymentMethod !== "cod") {
            return res.status(400).json({
                success: false,
                message: "Online payments must be completed through Razorpay checkout",
            });
        }

        const validationResult = validateOrderPayload({ items, shippingInfo });
        const { error } = validationResult;
        normalizedItems = validationResult.normalizedItems || [];

        if (error) {
            return res.status(400).json({
                success: false,
                message: error,
            });
        }

        normalizedItems = await attachProductOwnershipToItems(normalizedItems);

        const { subtotal, discount } = getPricing(normalizedItems, pricing);
        const isFirstOrder = !(await hasPreviousConfirmedOrder(req.user._id));
        const codFee = getCodFee({ subtotal, paymentMethod, isFirstOrder });
        const total = Math.max(subtotal + codFee - discount, 0);
        const normalizedShippingInfo = {
            ...shippingInfo,
            email: normalizeEmail(req.user.email),
        };

        await adjustInventoryForItems(normalizedItems, "decrement");
        stockReduced = true;

        const order = await Order.create({
            user: req.user._id,
            items: normalizedItems,
            shippingInfo: normalizedShippingInfo,
            paymentMethod,
            subtotal,
            deliveryFee: 0,
            codFee,
            platformFee: 0,
            discount,
            total,
            status: "placed",
            stockReduced: true,
            tracking: [
                {
                    status: "placed",
                    message: "Cash on delivery order placed successfully",
                    timestamp: new Date(),
                },
            ],
        });

        sendOrderConfirmationEmail(req.user.email, order._id, normalizedItems, total).catch(
            (error) => {
                console.error("Order confirmation email failed:", error.message);
            }
        );

        sendOrderNotification(order).catch((error) => {
            console.error("Admin order notification failed:", error.message);
        });

        createMrNotificationsForOrderItems({
            items: normalizedItems,
            orderId: order._id,
            title: "New order received",
            messageBuilder: (item) =>
                `Your product "${item.name}" has been ordered by a customer.`,
        }).catch((error) => {
            console.error("MR order notification failed:", error.message);
        });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.error("Create order error:", error);

        if (stockReduced) {
            await adjustInventoryForItems(normalizedItems, "increment").catch((rollbackError) => {
                console.error("Create order stock rollback failed:", rollbackError);
            });
        }

        if (error.code === "INVENTORY_ERROR") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to place order",
        });
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
            return res.status(400).json({
                success: false,
                message: "Please select an online payment method",
            });
        }

        const { error, normalizedItems } = validateOrderPayload({ items, shippingInfo });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error,
            });
        }

        const enrichedItems = await attachProductOwnershipToItems(normalizedItems);
        const { subtotal, discount } = getPricing(enrichedItems, pricing);
        const total = Math.max(subtotal - discount, 0);
        const amountInPaise = Math.round(total * 100);
        const receipt = `rcpt_${Date.now()}`;
        const razorpayOrder = await createRazorpayApiOrder(amountInPaise, receipt);
        const normalizedShippingInfo = {
            ...shippingInfo,
            email: normalizeEmail(req.user.email),
        };

        const order = await Order.create({
            user: req.user._id,
            items: enrichedItems,
            shippingInfo: normalizedShippingInfo,
            paymentMethod,
            subtotal,
            deliveryFee: 0,
            codFee: 0,
            platformFee: 0,
            discount,
            total,
            razorpayOrderId: razorpayOrder.id,
            status: "payment_pending",
            stockReduced: false,
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
                name: normalizedShippingInfo.fullName,
                email: normalizedShippingInfo.email,
                contact: normalizedShippingInfo.phone,
            },
        });
    } catch (error) {
        console.error("Create razorpay order error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to start online payment",
        });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    let inventoryReducedInRequest = false;
    let order = null;

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({
                success: false,
                message: "Razorpay payment details are required",
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
            razorpayOrderId: razorpay_order_id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found for payment verification",
            });
        }

        if (!order.stockReduced) {
            await adjustInventoryForItems(order.items, "decrement");
            order.stockReduced = true;
            inventoryReducedInRequest = true;
        }

        order.razorpayPaymentId = razorpay_payment_id;
        order.status = "placed";
        order.tracking.push({
            status: "placed",
            message: "Payment received and order confirmed",
            timestamp: new Date(),
        });

        await order.save();

        sendOrderConfirmationEmail(req.user.email, order._id, order.items, order.total).catch(
            (error) => {
                console.error("Order confirmation email failed:", error.message);
            }
        );

        sendOrderNotification(order).catch((error) => {
            console.error("Admin order notification failed:", error.message);
        });

        createMrNotificationsForOrderItems({
            items: order.items,
            orderId: order._id,
            title: "New order received",
            messageBuilder: (item) =>
                `Your product "${item.name}" has been ordered by a customer.`,
        }).catch((error) => {
            console.error("MR order notification failed:", error.message);
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified and order confirmed",
            order,
        });
    } catch (error) {
        console.error("Verify payment error:", error);

        if (inventoryReducedInRequest && order?.stockReduced) {
            await adjustInventoryForItems(order.items, "increment").catch((rollbackError) => {
                console.error("Verify payment stock rollback failed:", rollbackError);
            });
            order.stockReduced = false;
        }

        if (error.code === "INVENTORY_ERROR") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to verify payment",
        });
    }
};

export const myOrders = async (req, res) => {
    try {
        const userEmail = normalizeEmail(req.user.email);
        const orders = await Order.find({
            "shippingInfo.email": userEmail,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("My orders error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

export const getMySingleOrder = async (req, res) => {
    try {
        const userEmail = normalizeEmail(req.user.email);
        const order = await Order.findOne({
            _id: req.params.id,
            "shippingInfo.email": userEmail,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const returnRequest = await Return.findOne({ order: order._id })
            .select("type status refundStatus replacementOrder requestedAt processedAt pickedUpAt manualPendingAt refundCompletedAt createdAt updatedAt")
            .lean();

        const originalOrder =
            order.originalOrderId
                ? await Order.findOne({
                    _id: order.originalOrderId,
                    "shippingInfo.email": userEmail,
                })
                    .select("_id status createdAt deliveredAt paymentMethod tracking")
                    .lean()
                : null;

        return res.status(200).json({
            success: true,
            order: {
                ...order.toObject(),
                returnRequest,
                originalOrder,
            },
        });
    } catch (error) {
        console.error("Single order error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch order",
        });
    }
};

export const cancelMyOrder = async (req, res) => {
    let stockRestored = false;
    let order = null;

    try {
        const userEmail = normalizeEmail(req.user.email);
        order = await Order.findOne({
            _id: req.params.id,
            "shippingInfo.email": userEmail,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.orderType === "replacement") {
            return res.status(400).json({
                success: false,
                message: "Replacement orders cannot be cancelled",
            });
        }

        if (!cancellableUserStatuses.has(order.status)) {
            return res.status(400).json({
                success: false,
                message: "This order cannot be cancelled now",
            });
        }

        if (order.stockReduced) {
            await adjustInventoryForItems(order.items, "increment");
            order.stockReduced = false;
            stockRestored = true;
        }

        order.status = "cancelled";
        order.tracking.push({
            status: "cancelled",
            message: "Order cancelled by user",
            timestamp: new Date(),
        });

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        console.error("Cancel my order error:", error);

        if (stockRestored && order) {
            await adjustInventoryForItems(order.items, "decrement").catch((rollbackError) => {
                console.error("Cancel order stock rollback failed:", rollbackError);
            });
            order.stockReduced = true;
        }

        return res.status(500).json({
            success: false,
            message: "Failed to cancel order",
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate("user", "email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Get all orders error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch all orders",
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    let order = null;
    let inventoryAction = null;

    try {
        const nextStatus = String(req.body.status || "").trim().toLowerCase();

        if (!allowedAdminStatuses.has(nextStatus)) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid order status",
            });
        }

        order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const hasActiveReturnFlow =
            Boolean(order.isReturnRequested) ||
            (order.returnStatus && order.returnStatus !== "not_requested");

        if (
            nextStatus === "cancelled" &&
            (order.orderType === "replacement" || hasActiveReturnFlow)
        ) {
            return res.status(400).json({
                success: false,
                message: "Replacement or return-in-process orders cannot be cancelled",
            });
        }

        if (order.paymentMethod === "cod" && nextStatus === "payment_pending") {
            return res.status(400).json({
                success: false,
                message: "Cash on delivery orders cannot be marked as payment pending",
            });
        }

        if (
            isOnlinePaymentMethod(order.paymentMethod) &&
            !order.razorpayPaymentId &&
            nextStatus !== "payment_pending" &&
            nextStatus !== "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: "This order is waiting for Razorpay payment confirmation",
            });
        }

        const shouldReserveStock = stockReservedStatuses.has(nextStatus);

        if (shouldReserveStock && !order.stockReduced) {
            await adjustInventoryForItems(order.items, "decrement");
            order.stockReduced = true;
            inventoryAction = "decrement";
        }

        if (!shouldReserveStock && order.stockReduced) {
            await adjustInventoryForItems(order.items, "increment");
            order.stockReduced = false;
            inventoryAction = "increment";
        }

        order.status = nextStatus;
        if (nextStatus === "delivered" && !order.deliveredAt) {
            order.deliveredAt = new Date();
        }
        order.tracking.push({
            status: nextStatus,
            message: statusMessages[nextStatus] || "Order updated by admin",
            timestamp: new Date(),
        });

        await order.save();

        createMrNotificationsForOrderItems({
            items: order.items,
            orderId: order._id,
            title: "Order status updated",
            messageBuilder: (item) =>
                `Order status for "${item.name}" is now ${nextStatus}.`,
        }).catch((notificationError) => {
            console.error("MR status notification failed:", notificationError.message);
        });

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error("Update order status error:", error);

        if (order && inventoryAction === "decrement") {
            await adjustInventoryForItems(order.items, "increment").catch((rollbackError) => {
                console.error("Update order status stock rollback failed:", rollbackError);
            });
            order.stockReduced = false;
        }

        if (order && inventoryAction === "increment") {
            await adjustInventoryForItems(order.items, "decrement").catch((rollbackError) => {
                console.error("Update order status stock rollback failed:", rollbackError);
            });
            order.stockReduced = true;
        }

        if (error.code === "INVENTORY_ERROR") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update order status",
        });
    }
};
