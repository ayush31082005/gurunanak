import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        city: {
            type: String,
            trim: true,
            default: "",
        },
        state: {
            type: String,
            trim: true,
            default: "",
        },
        medicalStoreName: {
            type: String,
            trim: true,
            default: "",
        },
        gstNumber: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },
        panNumber: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },
        drugLicenseNumber: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },
        gstCertificateUrl: {
            type: String,
            trim: true,
            default: "",
        },
        gstCertificatePublicId: {
            type: String,
            trim: true,
            default: "",
        },
        gstCertificateResourceType: {
            type: String,
            trim: true,
            default: "image",
        },
        drugLicenseDocumentUrl: {
            type: String,
            trim: true,
            default: "",
        },
        drugLicenseDocumentPublicId: {
            type: String,
            trim: true,
            default: "",
        },
        drugLicenseDocumentResourceType: {
            type: String,
            trim: true,
            default: "image",
        },
        isHealthCareExpert: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        mrApprovalStatus: {
            type: String,
            enum: ["not_applicable", "pending", "approved", "rejected"],
            default: "not_applicable",
        },
        mrApprovedAt: {
            type: Date,
            default: null,
        },
        role: {
            type: String,
            enum: ["user", "admin", "mr"],
            default: "user",
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
