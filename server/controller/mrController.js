import Order from "../models/Order.js";
import Product from "../models/Product.js";

const buildAddressString = (shippingInfo = {}) => {
    const addressParts = [
        shippingInfo?.address,
        shippingInfo?.city,
        shippingInfo?.state,
        shippingInfo?.pincode,
    ].filter(Boolean);

    return addressParts.join(", ") || "N/A";
};

const buildPaymentStatus = (order = {}) => {
    if (order?.status === "cancelled") {
        return "Cancelled";
    }

    if (order?.paymentMethod === "cod") {
        return "Cash on Delivery";
    }

    if (order?.razorpayPaymentId) {
        return "Paid";
    }

    if (order?.status === "payment_pending") {
        return "Pending";
    }

    return "Pending";
};

export const getMrOrders = async (req, res) => {
    try {
        const mrProductIds = (
            await Product.find({
                createdBy: req.user._id,
                createdByRole: "mr",
            })
                .select("_id")
                .lean()
        ).map((product) => String(product._id));

        if (!mrProductIds.length) {
            return res.status(200).json({
                success: true,
                count: 0,
                orders: [],
            });
        }

        const mrProductIdSet = new Set(mrProductIds);

        const orders = await Order.find({
            $or: [
                { "items.mrId": req.user._id },
                { "items.productId": { $in: mrProductIds } },
            ],
        })
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .lean();

        const mrOrders = orders.flatMap((order) => {
            const relevantItems = (order.items || []).filter((item) => {
                const itemMrId = item?.mrId ? String(item.mrId) : "";
                const productId = String(item?.productId || "");

                return (
                    itemMrId === String(req.user._id) ||
                    mrProductIdSet.has(productId)
                );
            });

            return relevantItems.map((item) => ({
                orderId: order._id,
                orderNumber: `#${String(order._id).slice(-8).toUpperCase()}`,
                productId: item.productId || null,
                productName: item.name,
                unitPrice: Number(item.price) || 0,
                lineTotal: (Number(item.price) || 0) * (Number(item.quantity) || 0),
                quantity: item.quantity,
                customerName:
                    order.user?.name ||
                    order.shippingInfo?.fullName ||
                    order.user?.email ||
                    "Customer",
                address: buildAddressString(order.shippingInfo),
                paymentStatus: buildPaymentStatus(order),
                orderStatus: order.status,
                orderDate: order.createdAt,
                deliveredAt: order.deliveredAt || null,
                paymentMethod: order.paymentMethod || "cod",
            }));
        });

        return res.status(200).json({
            success: true,
            count: mrOrders.length,
            orders: mrOrders,
        });
    } catch (error) {
        console.error("Get MR orders error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch MR orders",
        });
    }
};
