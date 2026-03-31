import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        otp: {
            type: String,
            required: true
        },
        purpose: {
            type: String,
            enum: ["register", "login"],
            required: true
        },
        isHealthCareExpert: {
            type: Boolean,
            default: false
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Otp", otpSchema);
