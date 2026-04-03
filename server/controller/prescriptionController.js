import PrescriptionRequest from "../models/PrescriptionRequest.js";
import {
    uploadPrescriptionToCloudinary,
    deletePrescriptionFromCloudinary,
} from "../utils/cloudinary.js";
import { sendPrescriptionNotification } from "../utils/sendPrescriptionNotification.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ADMIN_PRESCRIPTION_STATUSES = new Set(["submitted", "reviewed", "processed", "rejected"]);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const parseBase64File = (fileData) => {
    const matches = fileData.match(/^data:(.+);base64,(.+)$/);

    if (!matches) {
        throw new Error("Invalid file payload");
    }

    return {
        mimeType: matches[1],
        buffer: Buffer.from(matches[2], "base64"),
    };
};

export const submitPrescription = async (req, res) => {
    try {
        const { name, email, mobile, address, fileData, fileName, fileType } = req.body;

        if (!name || !email || !mobile || !address || !fileData || !fileName || !fileType) {
            return res.status(400).json({
                success: false,
                message: "Name, email, mobile number, address, and prescription file are required.",
            });
        }

        const sanitizedName = name.trim();
        const sanitizedEmail = req.user?.email
            ? normalizeEmail(req.user.email)
            : normalizeEmail(email);
        const sanitizedMobile = String(mobile).replace(/\D/g, "").slice(0, 10);
        const sanitizedAddress = address.trim();

        if (!sanitizedName) {
            return res.status(400).json({
                success: false,
                message: "Please enter your full name.",
            });
        }

        if (!isValidEmail(sanitizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        if (!/^\d{10}$/.test(sanitizedMobile)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10-digit mobile number.",
            });
        }

        if (!sanitizedAddress) {
            return res.status(400).json({
                success: false,
                message: "Please enter your delivery address.",
            });
        }

        if (!ALLOWED_TYPES.includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: "Only JPG, PNG, and PDF prescriptions are allowed.",
            });
        }

        const { mimeType, buffer } = parseBase64File(fileData);

        if (mimeType !== fileType) {
            return res.status(400).json({
                success: false,
                message: "Uploaded file metadata does not match the file content.",
            });
        }

        if (buffer.length > MAX_FILE_SIZE) {
            return res.status(400).json({
                success: false,
                message: "File size must be 5MB or less.",
            });
        }

        const cloudinaryUpload = await uploadPrescriptionToCloudinary({
            fileBuffer: buffer,
            fileName,
            fileType,
        });

        const prescription = await PrescriptionRequest.create({
            user: req.user?._id || null,
            name: sanitizedName,
            email: sanitizedEmail,
            mobile: sanitizedMobile,
            address: sanitizedAddress,
            fileName,
            fileType,
            fileSize: buffer.length,
            fileUrl: cloudinaryUpload.secure_url,
            cloudinaryPublicId: cloudinaryUpload.public_id,
        });

        try {
            await sendPrescriptionNotification(prescription);
            prescription.notificationSent = true;
            await prescription.save();
        } catch (notificationError) {
            console.error("Prescription notification failed:", notificationError.message);
        }

        return res.status(201).json({
            success: true,
            message: "Prescription submitted successfully.",
            prescription: {
                id: prescription._id,
                fileUrl: prescription.fileUrl,
                status: prescription.status,
                notificationSent: prescription.notificationSent,
            },
        });
    } catch (error) {
        console.error("Prescription submission failed:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to submit prescription. Please try again.",
        });
    }
};

export const getMyPrescriptions = async (req, res) => {
    try {
        const userEmail = normalizeEmail(req.user.email);
        const prescriptions = await PrescriptionRequest.find({
            email: userEmail,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: prescriptions.length,
            prescriptions,
        });
    } catch (error) {
        console.error("Fetch prescriptions failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch prescriptions.",
        });
    }
};

export const getAdminPrescriptions = async (req, res) => {
    try {
        const prescriptions = await PrescriptionRequest.find({})
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: prescriptions.length,
            prescriptions,
        });
    } catch (error) {
        console.error("Fetch admin prescriptions failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch prescriptions.",
        });
    }
};

export const updatePrescriptionStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!ADMIN_PRESCRIPTION_STATUSES.has(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid prescription status",
            });
        }

        const prescription = await PrescriptionRequest.findById(req.params.id);

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found",
            });
        }

        prescription.status = status;
        await prescription.save();

        return res.status(200).json({
            success: true,
            message: "Prescription status updated successfully",
            prescription,
        });
    } catch (error) {
        console.error("Update prescription status failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update prescription status.",
        });
    }
};

export const deletePrescription = async (req, res) => {
    try {
        const prescription = await PrescriptionRequest.findById(req.params.id);

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found",
            });
        }

        await prescription.deleteOne();

        if (prescription.cloudinaryPublicId) {
            deletePrescriptionFromCloudinary(prescription.cloudinaryPublicId).catch((error) => {
                console.error("Cloudinary prescription delete failed:", error.message);
            });
        }

        return res.status(200).json({
            success: true,
            message: "Prescription deleted from database successfully",
        });
    } catch (error) {
        console.error("Delete prescription failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete prescription.",
        });
    }
};
