import mongoose from "mongoose";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const reminderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        medicineName: {
            type: String,
            required: true,
            trim: true,
        },
        dose: {
            type: String,
            trim: true,
            default: "",
        },
        rawScanText: {
            type: String,
            trim: true,
            default: "",
        },
        frequency: {
            type: String,
            trim: true,
            default: "",
        },
        image: {
            type: String,
            trim: true,
            default: "",
        },
        times: {
            type: [String],
            default: [],
            validate: {
                validator(value = []) {
                    return value.every((time) => timePattern.test(time));
                },
                message: "Reminder times must be in HH:mm format",
            },
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        lastSentKeys: {
            type: [String],
            default: [],
        },
        history: [
            {
                date: { type: Date, required: true },
                time: { type: String, required: true },
                status: { type: String, enum: ["taken", "skipped"], required: true },
            },
        ],
    },
    { timestamps: true }
);

reminderSchema.index({ isActive: 1, times: 1 });
reminderSchema.index({ user: 1, createdAt: -1 });

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
