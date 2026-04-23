import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        mrId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        relatedOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },
        relatedProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ mrId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
