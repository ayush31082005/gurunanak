import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        complaintType: {
            type: String,
            required: true,
            enum: [
                "late-delivery",
                "wrong-product",
                "damaged-product",
                "payment-issue",
                "refund-issue",
                "other",
            ],
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["open", "in-progress", "resolved", "closed"],
            default: "open",
        },

        adminReply: {
            type: String,
            default: "",
            trim: true,
        },
    },
    { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;