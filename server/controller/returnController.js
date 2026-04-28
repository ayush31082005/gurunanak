import mongoose from "mongoose";
import Order from "../models/Order.js";
import Return from "../models/Return.js";
import {
    sendRefundCompletedEmail,
    sendReplacementCreatedEmail,
    sendReturnDecisionEmail,
    sendReturnRequestNotification,
} from "../utils/sendReturnNotification.js";
import { uploadReturnProofToCloudinary } from "../utils/cloudinary.js";
import { adjustInventoryForItems } from "./orderController.js";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const RETURN_WINDOW_DAYS = 7;

const updateActions = new Set([
    "approve_refund",
    "mark_pickup_product",
    "approve_replacement",
    "reject",
    "mark_manual_pending",
    "mark_refund_completed",
]);

const parseBase64File = (fileData = "") => {
    const matches = String(fileData).match(/^data:(.+);base64,(.+)$/);

    if (!matches) {
        throw new Error("Invalid file payload");
    }

    return {
        mimeType: matches[1],
        buffer: Buffer.from(matches[2], "base64"),
    };
};

const getUploadedFilePayload = (req) => {
    if (req.file?.buffer) {
        return {
            mimeType: req.file.mimetype,
            buffer: req.file.buffer,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
        };
    }

    if (req.body?.fileData && req.body?.fileName && req.body?.fileType) {
        const { mimeType, buffer } = parseBase64File(req.body.fileData);

        return {
            mimeType,
            buffer,
            fileName: req.body.fileName,
            fileType: req.body.fileType,
        };
    }

    throw new Error("Proof image is required");
};

const cloneOrderItemsForReturn = (items = []) =>
    items.map((item) => ({
        productId: item.productId || "",
        name:
            item.name ||
            item.title ||
            item.productName ||
            item.medicineName ||
            item.product?.name ||
            "Product",
        image: item.image || "",
        pack: item.pack || "",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
    }));

const parseSelectedItems = (selectedItemsInput = []) => {
    if (Array.isArray(selectedItemsInput)) {
        return selectedItemsInput;
    }

    if (typeof selectedItemsInput === "string" && selectedItemsInput.trim()) {
        try {
            const parsedItems = JSON.parse(selectedItemsInput);
            return Array.isArray(parsedItems) ? parsedItems : [];
        } catch {
            return [];
        }
    }

    return [];
};

const getSelectedOrderItems = (orderItems = [], selectedItemsInput = []) => {
    const parsedSelectedItems = parseSelectedItems(selectedItemsInput);

    if (!parsedSelectedItems.length) {
        return [];
    }

    return parsedSelectedItems
        .map((entry) => {
            const itemIndex = Number(entry?.index);
            const requestedQuantity = Number(entry?.quantity) || 1;

            if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= orderItems.length) {
                return null;
            }

            const sourceItem = orderItems[itemIndex];
            const maxQuantity = Math.max(Number(sourceItem?.quantity) || 1, 1);

            return {
                ...sourceItem,
                quantity: Math.min(Math.max(requestedQuantity, 1), maxQuantity),
            };
        })
        .filter(Boolean);
};

const cloneOrderItemsForReplacement = (items = []) =>
    items.map((item) => ({
        productId: item.productId || "",
        name:
            item.name ||
            item.title ||
            item.productName ||
            item.medicineName ||
            item.product?.name ||
            "Product",
        image: item.image || "",
        pack: item.pack || "",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        mrId: item.mrId || null,
        productOwnerRole: item.productOwnerRole || "admin",
    }));

const getDeliveredTimestamp = (order) => {
    if (order?.deliveredAt) {
        return new Date(order.deliveredAt);
    }

    const deliveredTrackingEntry = [...(order?.tracking || [])]
        .reverse()
        .find((entry) => String(entry?.status || "").toLowerCase() === "delivered");

    if (deliveredTrackingEntry?.timestamp) {
        return new Date(deliveredTrackingEntry.timestamp);
    }

    return order?.status === "delivered" && order?.updatedAt
        ? new Date(order.updatedAt)
        : null;
};

const isWithinReturnWindow = (deliveredAt) => {
    if (!deliveredAt) {
        return false;
    }

    const deadline = new Date(deliveredAt);
    deadline.setDate(deadline.getDate() + RETURN_WINDOW_DAYS);

    return Date.now() <= deadline.getTime();
};

const getItemsTotal = (items = []) =>
    items.reduce(
        (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
        0
    );

const getRefundableAmount = (order) => {
    const itemsTotal = getItemsTotal(order?.items);

    if (order?.orderType === "replacement") {
        return itemsTotal;
    }

    const orderTotal = Number(order?.total) || 0;
    return orderTotal > 0 ? orderTotal : itemsTotal;
};

const buildReplacementOrderPayload = (originalOrder, replacementItems = []) => {
    const subtotal = getItemsTotal(replacementItems);

    return {
        user: originalOrder.user,
        items: cloneOrderItemsForReplacement(replacementItems),
        shippingInfo: { ...(originalOrder.shippingInfo || {}) },
        paymentMethod: "replacement",
        subtotal,
        deliveryFee: 0,
        codFee: 0,
        platformFee: 0,
        discount: subtotal,
        total: 0,
        status: "pending",
        stockReduced: true,
        orderType: "replacement",
        originalOrderId: originalOrder._id,
        tracking: [
            {
                status: "pending",
                message: `Replacement order created for original order ${originalOrder._id}`,
                timestamp: new Date(),
            },
        ],
    };
};

export const createReturnRequest = async (req, res) => {
    try {
        const { orderId, reason, type, selectedItems } = req.body;

        if (!orderId || !reason || !type) {
            return res.status(400).json({
                success: false,
                message: "Order, reason, return type, and proof image are required",
            });
        }

        if (!["refund", "replacement"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Return type must be refund or replacement",
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.status !== "delivered") {
            return res.status(400).json({
                success: false,
                message: "Returns are allowed only for delivered orders",
            });
        }

        const deliveredAt = getDeliveredTimestamp(order);

        if (!isWithinReturnWindow(deliveredAt)) {
            return res.status(400).json({
                success: false,
                message: "The 7 day return window has expired for this order",
            });
        }

        const existingReturn = await Return.findOne({ order: order._id }).select("_id");

        if (order.isReturnRequested || existingReturn) {
            return res.status(400).json({
                success: false,
                message: "A return request has already been raised for this order",
            });
        }

        const { mimeType, buffer, fileName, fileType } = getUploadedFilePayload(req);

        if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: "Only JPG and PNG proof images are allowed",
            });
        }

        if (mimeType !== fileType) {
            return res.status(400).json({
                success: false,
                message: "Uploaded image metadata does not match the file content",
            });
        }

        if (buffer.length > MAX_FILE_SIZE) {
            return res.status(400).json({
                success: false,
                message: "Proof image size must be 5MB or less",
            });
        }

        const cloudinaryUpload = await uploadReturnProofToCloudinary({
            fileBuffer: buffer,
            fileName,
            fileType,
        });

        const selectedOrderItems = getSelectedOrderItems(order.items, selectedItems);

        if (!selectedOrderItems.length) {
            return res.status(400).json({
                success: false,
                message: "Select at least one product for the return request",
            });
        }

        const refundableAmount = getItemsTotal(selectedOrderItems);
        const snapshotSubtotal =
            order?.orderType === "replacement"
                ? refundableAmount
                : refundableAmount;
        const snapshotDiscount = 0;

        const returnRequest = await Return.create({
            user: req.user._id,
            order: order._id,
            type,
            reason: String(reason).trim(),
            items: cloneOrderItemsForReturn(selectedOrderItems),
            orderSnapshot: {
                orderId: String(order._id),
                subtotal: snapshotSubtotal,
                discount: snapshotDiscount,
                total: refundableAmount,
                deliveredAt,
            },
            proofImage: {
                url: cloudinaryUpload.secure_url,
                publicId: cloudinaryUpload.public_id,
                fileName,
                fileType,
                bytes: buffer.length,
            },
            refundStatus: type === "refund" ? "pending" : "not_applicable",
        });

        order.isReturnRequested = true;
        order.returnStatus = "pending";
        order.refundStatus = type === "refund" ? "pending" : "not_applicable";
        await order.save();

        sendReturnRequestNotification({
            returnRequest,
            order,
            user: req.user,
        }).catch((error) => {
            console.error("Return request notification failed:", error.message);
        });

        return res.status(201).json({
            success: true,
            message: "Return request submitted successfully",
            returnRequest,
        });
    } catch (error) {
        console.error("Create return request error:", error);

        if (error?.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "A return request has already been raised for this order",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to submit return request",
        });
    }
};

export const getMyReturns = async (req, res) => {
    try {
        const returnRequests = await Return.find({ user: req.user._id })
            .populate("order", "_id status total deliveredAt returnStatus refundStatus")
            .populate("replacementOrder", "_id status createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: returnRequests.length,
            returnRequests,
        });
    } catch (error) {
        console.error("Get my returns error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch return requests",
        });
    }
};

export const getAdminReturns = async (_req, res) => {
    try {
        const returnRequests = await Return.find({})
            .populate("user", "name email")
            .populate(
                "order",
                "_id status total subtotal discount deliveredAt returnStatus refundStatus paymentMethod shippingInfo orderType"
            )
            .populate("replacementOrder", "_id status createdAt")
            .populate("processedBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: returnRequests.length,
            returnRequests,
        });
    } catch (error) {
        console.error("Get admin returns error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch return requests",
        });
    }
};

export const updateReturnRequest = async (req, res) => {
    let replacementOrder = null;
    let replacementStockReserved = false;
    let replacementStockItems = [];

    try {
        const action = String(req.body.action || "").trim();
        const adminNote = String(req.body.adminNote || "").trim();

        if (!updateActions.has(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid return action",
            });
        }

        const returnRequest = await Return.findById(req.params.id)
            .populate("order")
            .populate("user", "name email");

        if (!returnRequest || !returnRequest.order) {
            return res.status(404).json({
                success: false,
                message: "Return request not found",
            });
        }

        const order = returnRequest.order;

        if (adminNote) {
            returnRequest.adminNote = adminNote;
        }

        if (action === "reject") {
            if (returnRequest.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: "Only pending return requests can be rejected",
                });
            }

            returnRequest.status = "rejected";
            returnRequest.refundStatus =
                returnRequest.type === "refund" ? "rejected" : "not_applicable";
            returnRequest.processedBy = req.user._id;
            returnRequest.processedAt = new Date();

            order.returnStatus = "rejected";
            order.refundStatus =
                returnRequest.type === "refund" ? "rejected" : "not_applicable";

            await Promise.all([returnRequest.save(), order.save()]);

            sendReturnDecisionEmail({
                returnRequest,
                order,
                user: returnRequest.user,
                decision: "rejected",
            }).catch((error) => {
                console.error("Return rejection email failed:", error.message);
            });
        }

        if (action === "approve_refund") {
            if (returnRequest.type !== "refund") {
                return res.status(400).json({
                    success: false,
                    message: "This request is not a refund request",
                });
            }

            if (returnRequest.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: "Only pending refund requests can be approved",
                });
            }

            returnRequest.status = "approved";
            returnRequest.refundStatus = "approved";
            returnRequest.processedBy = req.user._id;
            returnRequest.processedAt = new Date();

            order.returnStatus = "approved";
            order.refundStatus = "approved";

            await Promise.all([returnRequest.save(), order.save()]);

            sendReturnDecisionEmail({
                returnRequest,
                order,
                user: returnRequest.user,
                decision: "approved",
            }).catch((error) => {
                console.error("Refund approval email failed:", error.message);
            });
        }

        if (action === "mark_manual_pending") {
            if (returnRequest.type !== "refund") {
                return res.status(400).json({
                    success: false,
                    message: "This request is not a refund request",
                });
            }

            if (returnRequest.refundStatus !== "picked_up") {
                return res.status(400).json({
                    success: false,
                    message: "Product pickup must be completed before manual refund can start",
                });
            }

            returnRequest.refundStatus = "manual_pending";
            returnRequest.manualPendingAt = new Date();
            returnRequest.processedBy = req.user._id;
            order.refundStatus = "manual_pending";

            await Promise.all([returnRequest.save(), order.save()]);
        }

        if (action === "mark_pickup_product") {
            if (returnRequest.type !== "refund") {
                return res.status(400).json({
                    success: false,
                    message: "This request is not a refund request",
                });
            }

            if (returnRequest.refundStatus !== "approved") {
                return res.status(400).json({
                    success: false,
                    message: "Refund must be approved before product pickup",
                });
            }

            returnRequest.refundStatus = "picked_up";
            returnRequest.pickedUpAt = new Date();
            returnRequest.processedBy = req.user._id;
            order.refundStatus = "picked_up";

            await Promise.all([returnRequest.save(), order.save()]);
        }

        if (action === "mark_refund_completed") {
            if (returnRequest.type !== "refund") {
                return res.status(400).json({
                    success: false,
                    message: "This request is not a refund request",
                });
            }

            if (!["approved", "manual_pending"].includes(returnRequest.refundStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "Refund must be approved before it can be completed",
                });
            }

            returnRequest.status = "refund_completed";
            returnRequest.refundStatus = "manual_completed";
            returnRequest.refundCompletedAt = new Date();
            returnRequest.processedBy = req.user._id;
            returnRequest.processedAt = new Date();

            order.returnStatus = "refund_completed";
            order.refundStatus = "manual_completed";

            await Promise.all([returnRequest.save(), order.save()]);

            sendRefundCompletedEmail({
                returnRequest,
                order,
                user: returnRequest.user,
            }).catch((error) => {
                console.error("Refund completed email failed:", error.message);
            });
        }

        if (action === "approve_replacement") {
            if (returnRequest.type !== "replacement") {
                return res.status(400).json({
                    success: false,
                    message: "This request is not a replacement request",
                });
            }

            if (returnRequest.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: "Only pending replacement requests can be approved",
                });
            }

            if (returnRequest.replacementOrder) {
                return res.status(400).json({
                    success: false,
                    message: "Replacement order has already been created for this request",
                });
            }

            const replacementItems = Array.isArray(returnRequest.items) ? returnRequest.items : [];

            if (!replacementItems.length) {
                return res.status(400).json({
                    success: false,
                    message: "No selected return items found for this replacement request",
                });
            }

            await adjustInventoryForItems(replacementItems, "decrement");
            replacementStockReserved = true;
            replacementStockItems = replacementItems;

            replacementOrder = await Order.create(
                buildReplacementOrderPayload(order, replacementItems)
            );

            returnRequest.status = "replacement_created";
            returnRequest.replacementOrder = replacementOrder._id;
            returnRequest.processedBy = req.user._id;
            returnRequest.processedAt = new Date();
            returnRequest.refundStatus = "not_applicable";

            order.returnStatus = "replacement_created";
            order.refundStatus = "not_applicable";

            await Promise.all([returnRequest.save(), order.save()]);

            sendReturnDecisionEmail({
                returnRequest: { ...returnRequest.toObject(), status: "approved" },
                order,
                user: returnRequest.user,
                decision: "approved",
            }).catch((error) => {
                console.error("Replacement approval email failed:", error.message);
            });

            sendReplacementCreatedEmail({
                returnRequest,
                order,
                replacementOrder,
                user: returnRequest.user,
            }).catch((error) => {
                console.error("Replacement created email failed:", error.message);
            });
        }

        const refreshedReturnRequest = await Return.findById(returnRequest._id)
            .populate("user", "name email")
            .populate(
                "order",
                "_id status total subtotal discount deliveredAt returnStatus refundStatus paymentMethod shippingInfo orderType"
            )
            .populate("replacementOrder", "_id status createdAt")
            .populate("processedBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Return request updated successfully",
            returnRequest: refreshedReturnRequest,
        });
    } catch (error) {
        console.error("Update return request error:", error);

        if (replacementOrder?._id) {
            await Order.findByIdAndDelete(replacementOrder._id).catch((rollbackError) => {
                console.error("Replacement order rollback failed:", rollbackError);
            });
        }

        if (replacementStockReserved) {
            await adjustInventoryForItems(replacementStockItems, "increment").catch(
                (rollbackError) => {
                    console.error("Replacement stock rollback failed:", rollbackError);
                }
            );
        }

        if (error.code === "INVENTORY_ERROR") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update return request",
        });
    }
};
