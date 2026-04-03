import mongoose from "mongoose";

const callbackRequestSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },
        source: {
            type: String,
            default: "website",
            trim: true,
        },
        status: {
            type: String,
            enum: ["new", "contacted", "closed"],
            default: "new",
        },
    },
    { timestamps: true }
);

const CallbackRequest = mongoose.model("CallbackRequest", callbackRequestSchema);

export default CallbackRequest;
