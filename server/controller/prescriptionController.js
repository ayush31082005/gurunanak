import PrescriptionRequest from "../models/PrescriptionRequest.js";
import { uploadPrescriptionToCloudinary } from "../utils/cloudinary.js";
import { sendPrescriptionNotification } from "../utils/sendPrescriptionNotification.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
        const { name, mobile, address, fileData, fileName, fileType } = req.body;

        if (!name || !mobile || !address || !fileData || !fileName || !fileType) {
            return res.status(400).json({
                success: false,
                message: "Name, mobile number, address, and prescription file are required.",
            });
        }

        const sanitizedName = name.trim();
        const sanitizedMobile = String(mobile).replace(/\D/g, "").slice(0, 10);
        const sanitizedAddress = address.trim();

        if (!sanitizedName) {
            return res.status(400).json({
                success: false,
                message: "Please enter your full name.",
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
            name: sanitizedName,
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
