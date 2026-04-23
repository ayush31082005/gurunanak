import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            trim: true,
            default: "",
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            trim: true,
            default: "",
        },
        pack: {
            type: String,
            trim: true,
            default: "",
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
);

const returnSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true,
        },
        replacementOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },
        type: {
            type: String,
            enum: ["refund", "replacement"],
            required: true,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
                "refund_completed",
                "replacement_created",
            ],
            default: "pending",
        },
        refundStatus: {
            type: String,
            enum: [
                "not_applicable",
                "pending",
                "approved",
                "picked_up",
                "manual_pending",
                "manual_completed",
                "rejected",
            ],
            default: "not_applicable",
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        items: {
            type: [returnItemSchema],
            default: [],
        },
        orderSnapshot: {
            orderId: {
                type: String,
                required: true,
                trim: true,
            },
            subtotal: {
                type: Number,
                default: 0,
            },
            discount: {
                type: Number,
                default: 0,
            },
            total: {
                type: Number,
                default: 0,
            },
            deliveredAt: {
                type: Date,
                default: null,
            },
        },
        proofImage: {
            url: {
                type: String,
                required: true,
                trim: true,
            },
            publicId: {
                type: String,
                required: true,
                trim: true,
            },
            fileName: {
                type: String,
                trim: true,
                default: "",
            },
            fileType: {
                type: String,
                trim: true,
                default: "",
            },
            bytes: {
                type: Number,
                default: 0,
            },
        },
        adminNote: {
            type: String,
            trim: true,
            default: "",
        },
        processedAt: {
            type: Date,
            default: null,
        },
        pickedUpAt: {
            type: Date,
            default: null,
        },
        manualPendingAt: {
            type: Date,
            default: null,
        },
        refundCompletedAt: {
            type: Date,
            default: null,
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

returnSchema.index({ user: 1, createdAt: -1 });
returnSchema.index({ status: 1, createdAt: -1 });
returnSchema.index({ type: 1, createdAt: -1 });

const Return = mongoose.model("Return", returnSchema);

export default Return;
