import mongoose from "mongoose";

const prescriptionRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        mobile: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        fileName: {
            type: String,
            required: true,
            trim: true,
        },
        fileType: {
            type: String,
            required: true,
            trim: true,
        },
        fileSize: {
            type: Number,
            required: true,
            min: 1,
        },
        fileUrl: {
            type: String,
            required: true,
            trim: true,
        },
        cloudinaryPublicId: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["submitted", "reviewed", "processed", "rejected"],
            default: "submitted",
        },
        notificationSent: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const PrescriptionRequest = mongoose.model(
    "PrescriptionRequest",
    prescriptionRequestSchema
);

export default PrescriptionRequest;
