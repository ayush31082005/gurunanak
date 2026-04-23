import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        accountHolderName: {
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
        mobileNumber: {
            type: String,
            trim: true,
            default: "",
        },
        bankName: {
            type: String,
            required: true,
            trim: true,
        },
        accountNumber: {
            type: String,
            required: true,
            trim: true,
        },
        ifscCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        branchName: {
            type: String,
            trim: true,
            default: "",
        },
        upiId: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const BankAccount = mongoose.model("BankAccount", bankAccountSchema);

export default BankAccount;
