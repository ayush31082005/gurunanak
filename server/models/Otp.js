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
            enum: ["register", "login", "mr_register"],
            required: true
        },
        isHealthCareExpert: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum: ["user", "admin", "mr"],
            default: "user",
        },
        mrRegistrationData: {
            name: {
                type: String,
                trim: true,
                default: "",
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
            gstCertificateName: {
                type: String,
                trim: true,
                default: "",
            },
            drugLicenseDocumentUrl: {
                type: String,
                trim: true,
                default: "",
            },
            drugLicenseDocumentName: {
                type: String,
                trim: true,
                default: "",
            },
        },
        registrationData: {
            name: {
                type: String,
                trim: true,
                default: "",
            },
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Otp", otpSchema);
