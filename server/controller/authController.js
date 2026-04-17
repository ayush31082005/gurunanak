import User from "../models/User.js";
import Otp from "../models/Otp.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import PrescriptionRequest from "../models/PrescriptionRequest.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import generateOtp from "../utils/generateOtp.js";
import generateToken from "../utils/generateToken.js";
import sendEmailOtp from "../utils/sendEmailOtp.js";
import { sendAccountNotificationEmail } from "../utils/sendEmailOtp.js";

const MR_PENDING_STATUS = "pending";
const MR_APPROVED_STATUS = "approved";
const MR_REJECTED_STATUS = "rejected";
const NON_MR_STATUS = "not_applicable";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.join(__dirname, "..", "uploads");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizeEmail = (email = "") => email.toLowerCase().trim();

const normalizeText = (value = "") => String(value).trim();

const normalizeLicenseNumber = (value = "") =>
    normalizeText(value).replace(/\s+/g, "").toUpperCase();

const normalizeUppercaseIdentifier = (value = "") =>
    normalizeText(value).replace(/\s+/g, "").toUpperCase();

const buildUploadedFilePath = (file) => (file ? `/uploads/${file.filename}` : "");
const buildUploadedFileName = (file) => (file ? file.originalname || file.filename : "");

const resolveUploadedFilePath = (fileUrl = "") => {
    const fileName = String(fileUrl || "")
        .replace(/^\/?uploads\//, "")
        .trim();

    if (!fileName) {
        return "";
    }

    return path.join(uploadsDirectory, fileName);
};

const deleteUploadedFiles = async (fileUrls = []) => {
    await Promise.all(
        fileUrls
            .filter(Boolean)
            .map(async (fileUrl) => {
                const absolutePath = resolveUploadedFilePath(fileUrl);

                if (!absolutePath) {
                    return;
                }

                try {
                    await fs.promises.unlink(absolutePath);
                } catch (error) {
                    if (error.code !== "ENOENT") {
                        console.error(`Failed to delete upload ${absolutePath}:`, error.message);
                    }
                }
            })
    );
};

const cleanupMrOtpRecords = async (otpRecords = []) => {
    if (!otpRecords.length) {
        return;
    }

    await Promise.all(
        otpRecords.map((otpRecord) =>
            deleteUploadedFiles([
                otpRecord?.mrRegistrationData?.gstCertificateUrl,
                otpRecord?.mrRegistrationData?.drugLicenseDocumentUrl,
            ])
        )
    );

    await Otp.deleteMany({
        _id: {
            $in: otpRecords.map((otpRecord) => otpRecord._id),
        },
    });
};

const formatDisplayName = (user = {}) => {
    const rawName = normalizeText(user.name || "");

    if (rawName) {
        return rawName;
    }

    const localPart = user.email?.split("@")[0] || "";

    if (!localPart) {
        return "User";
    }

    return localPart
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatUserResponse = (user) => ({
    _id: user._id,
    name: formatDisplayName(user),
    email: user.email,
    phone: user.phone || "",
    city: user.city || "",
    state: user.state || "",
    medicalStoreName: user.medicalStoreName || "",
    gstNumber: user.gstNumber || "",
    panNumber: user.panNumber || "",
    drugLicenseNumber: user.drugLicenseNumber || "",
    gstCertificateUrl: user.gstCertificateUrl || "",
    drugLicenseDocumentUrl: user.drugLicenseDocumentUrl || "",
    isHealthCareExpert: user.isHealthCareExpert,
    isVerified: user.isVerified,
    role: user.role,
    mrApprovalStatus: user.mrApprovalStatus || NON_MR_STATUS,
    mrApprovedAt: user.mrApprovedAt || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const ensureApprovedMrAccount = (user) =>
    user.role === "mr" && user.mrApprovalStatus !== MR_APPROVED_STATUS;

const getPendingMrRequestPayload = (user) => ({
    _id: user._id,
    name: formatDisplayName(user),
    email: user.email,
    phone: user.phone || "",
    city: user.city || "",
    state: user.state || "",
    medicalStoreName: user.medicalStoreName || "",
    gstNumber: user.gstNumber || "",
    panNumber: user.panNumber || "",
    drugLicenseNumber: user.drugLicenseNumber || "",
    gstCertificateUrl: user.gstCertificateUrl || "",
    drugLicenseDocumentUrl: user.drugLicenseDocumentUrl || "",
    mrApprovalStatus: user.mrApprovalStatus,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
});

export const sendRegisterOtp = async (req, res) => {
    try {
        const { email, role = "user", isHealthCareExpert = false } = req.body;

        if (String(role).trim().toLowerCase() !== "user") {
            return res.status(400).json({
                success: false,
                message: "Use the MR registration form to create an MR account",
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered. Please login.",
            });
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.deleteMany({ email: normalizedEmail, purpose: "register" });

        await Otp.create({
            email: normalizedEmail,
            otp,
            purpose: "register",
            isHealthCareExpert: !!isHealthCareExpert,
            expiresAt,
        });

        await sendEmailOtp(normalizedEmail, otp, "register");

        return res.status(200).json({
            success: true,
            message: "Register OTP sent to your email",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send register OTP",
            error: error.message,
        });
    }
};

export const verifyRegisterOtp = async (req, res) => {
    try {
        const { email, otp, role = "user" } = req.body;

        if (String(role).trim().toLowerCase() !== "user") {
            return res.status(400).json({
                success: false,
                message: "Use the MR registration form to create an MR account",
            });
        }

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered. Please login.",
            });
        }

        const otpDoc = await Otp.findOne({
            email: normalizedEmail,
            purpose: "register",
        });

        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: "Register OTP not found. Please request again.",
            });
        }

        if (otpDoc.expiresAt < new Date()) {
            await Otp.deleteMany({ email: normalizedEmail, purpose: "register" });
            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request again.",
            });
        }

        if (otpDoc.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        const user = await User.create({
            email: normalizedEmail,
            isHealthCareExpert: otpDoc.isHealthCareExpert,
            isVerified: true,
            role: "user",
            mrApprovalStatus: NON_MR_STATUS,
        });

        await Otp.deleteMany({ email: normalizedEmail, purpose: "register" });

        const token = generateToken(user._id);
        await sendAccountNotificationEmail(normalizedEmail, "register");

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
        });
    }
};

export const sendMrRegisterOtp = async (req, res) => {
    try {
        const requiredFields = [
            "name",
            "email",
            "phone",
            "city",
            "state",
            "medicalStoreName",
            "gstNumber",
            "panNumber",
            "drugLicenseNumber",
        ];

        const missingField = requiredFields.find(
            (field) => !normalizeText(req.body[field])
        );

        if (missingField) {
            await deleteUploadedFiles([
                buildUploadedFilePath(req.files?.gstCertificate?.[0]),
                buildUploadedFilePath(req.files?.drugLicenseDocument?.[0]),
            ]);

            return res.status(400).json({
                success: false,
                message: `${missingField} is required`,
            });
        }

        const gstCertificateFile = req.files?.gstCertificate?.[0];
        const drugLicenseFile = req.files?.drugLicenseDocument?.[0];

        if (!gstCertificateFile || !drugLicenseFile) {
            await deleteUploadedFiles([
                buildUploadedFilePath(gstCertificateFile),
                buildUploadedFilePath(drugLicenseFile),
            ]);

            return res.status(400).json({
                success: false,
                message: "GST certificate and license document are required",
            });
        }

        const normalizedEmail = normalizeEmail(req.body.email);

        if (!isValidEmail(normalizedEmail)) {
            await deleteUploadedFiles([
                buildUploadedFilePath(gstCertificateFile),
                buildUploadedFilePath(drugLicenseFile),
            ]);

            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        const normalizedGstNumber = normalizeUppercaseIdentifier(req.body.gstNumber);
        const normalizedPanNumber = normalizeUppercaseIdentifier(req.body.panNumber);
        const normalizedLicenseNumber = normalizeLicenseNumber(
            req.body.drugLicenseNumber
        );

        const [existingEmailUser, existingGstUser, existingPanUser, existingLicenseUser] =
            await Promise.all([
            User.findOne({ email: normalizedEmail }),
            User.findOne({
                gstNumber: normalizedGstNumber,
                role: "mr",
            }),
            User.findOne({
                panNumber: normalizedPanNumber,
                role: "mr",
            }),
            User.findOne({
                drugLicenseNumber: normalizedLicenseNumber,
                role: "mr",
            }),
            ]);

        if (existingEmailUser) {
            await deleteUploadedFiles([
                buildUploadedFilePath(gstCertificateFile),
                buildUploadedFilePath(drugLicenseFile),
            ]);

            return res.status(400).json({
                success: false,
                message: "This email is already registered. Please login.",
            });
        }

        if (existingGstUser) {
            await deleteUploadedFiles([
                buildUploadedFilePath(gstCertificateFile),
                buildUploadedFilePath(drugLicenseFile),
            ]);

            return res.status(400).json({
                success: false,
                message: "This GST number is already registered",
            });
        }

        if (existingPanUser) {
            await deleteUploadedFiles([
                buildUploadedFilePath(gstCertificateFile),
                buildUploadedFilePath(drugLicenseFile),
            ]);

            return res.status(400).json({
                success: false,
                message: "This PAN number is already registered",
            });
        }

        if (existingLicenseUser) {
            await deleteUploadedFiles([
                buildUploadedFilePath(gstCertificateFile),
                buildUploadedFilePath(drugLicenseFile),
            ]);

            return res.status(400).json({
                success: false,
                message: "This drug license number is already registered",
            });
        }

        const existingMrOtpRecords = await Otp.find({
            email: normalizedEmail,
            purpose: "mr_register",
        });

        await cleanupMrOtpRecords(existingMrOtpRecords);

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.create({
            email: normalizedEmail,
            otp,
            purpose: "mr_register",
            role: "mr",
            isHealthCareExpert: true,
            expiresAt,
            mrRegistrationData: {
                name: normalizeText(req.body.name),
                phone: normalizeText(req.body.phone),
                city: normalizeText(req.body.city),
                state: normalizeText(req.body.state),
                medicalStoreName: normalizeText(req.body.medicalStoreName),
                gstNumber: normalizedGstNumber,
                panNumber: normalizedPanNumber,
                drugLicenseNumber: normalizedLicenseNumber,
                gstCertificateUrl: buildUploadedFilePath(gstCertificateFile),
                gstCertificateName: buildUploadedFileName(gstCertificateFile),
                drugLicenseDocumentUrl: buildUploadedFilePath(drugLicenseFile),
                drugLicenseDocumentName: buildUploadedFileName(drugLicenseFile),
            },
        });

        await sendEmailOtp(normalizedEmail, otp, "mr_register");

        return res.status(200).json({
            success: true,
            message: "MR registration OTP sent to your email",
        });
    } catch (error) {
        await deleteUploadedFiles([
            buildUploadedFilePath(req.files?.gstCertificate?.[0]),
            buildUploadedFilePath(req.files?.drugLicenseDocument?.[0]),
        ]);

        if (req.body?.email) {
            await Otp.deleteMany({
                email: normalizeEmail(req.body.email),
                purpose: "mr_register",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to send MR registration OTP",
            error: error.message,
        });
    }
};

export const verifyMrRegisterOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            const existingMrOtpRecords = await Otp.find({
                email: normalizedEmail,
                purpose: "mr_register",
            });
            await cleanupMrOtpRecords(existingMrOtpRecords);

            return res.status(400).json({
                success: false,
                message: "This email is already registered. Please login.",
            });
        }

        const otpDoc = await Otp.findOne({
            email: normalizedEmail,
            purpose: "mr_register",
        });

        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: "MR register OTP not found. Please submit the form again.",
            });
        }

        if (otpDoc.expiresAt < new Date()) {
            await cleanupMrOtpRecords([otpDoc]);

            return res.status(400).json({
                success: false,
                message: "OTP expired. Please submit the form again.",
            });
        }

        if (otpDoc.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        const mrRegistrationData = otpDoc.mrRegistrationData || {};

        const [existingGstUser, existingPanUser, existingLicenseUser] =
            await Promise.all([
                User.findOne({
                    gstNumber: mrRegistrationData.gstNumber,
                    role: "mr",
                }),
                User.findOne({
                    panNumber: mrRegistrationData.panNumber,
                    role: "mr",
                }),
                User.findOne({
                    drugLicenseNumber: mrRegistrationData.drugLicenseNumber,
                    role: "mr",
                }),
            ]);

        if (existingGstUser || existingPanUser || existingLicenseUser) {
            await cleanupMrOtpRecords([otpDoc]);

            return res.status(400).json({
                success: false,
                message:
                    "A matching GST, PAN, or drug license number is already registered",
            });
        }

        const user = await User.create({
            name: mrRegistrationData.name,
            email: normalizedEmail,
            phone: mrRegistrationData.phone,
            city: mrRegistrationData.city,
            state: mrRegistrationData.state,
            medicalStoreName: mrRegistrationData.medicalStoreName,
            gstNumber: mrRegistrationData.gstNumber,
            panNumber: mrRegistrationData.panNumber,
            drugLicenseNumber: mrRegistrationData.drugLicenseNumber,
            gstCertificateUrl: mrRegistrationData.gstCertificateUrl,
            drugLicenseDocumentUrl: mrRegistrationData.drugLicenseDocumentUrl,
            isHealthCareExpert: true,
            mrApprovalStatus: MR_PENDING_STATUS,
            isVerified: false,
            role: "mr",
        });

        await Otp.deleteMany({
            email: normalizedEmail,
            purpose: "mr_register",
        });

        return res.status(201).json({
            success: true,
            message:
                "MR registration submitted successfully. Please wait for admin approval.",
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to verify MR registration OTP",
            error: error.message,
        });
    }
};

export const sendLoginOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "This email is not registered. Please register first.",
            });
        }

        if (ensureApprovedMrAccount(existingUser)) {
            return res.status(403).json({
                success: false,
                message: "Your account is not approved",
            });
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.deleteMany({ email: normalizedEmail, purpose: "login" });

        await Otp.create({
            email: normalizedEmail,
            otp,
            purpose: "login",
            expiresAt,
        });

        await sendEmailOtp(normalizedEmail, otp, "login");

        return res.status(200).json({
            success: true,
            message: "Login OTP sent to your email",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send login OTP",
            error: error.message,
        });
    }
};

export const verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "This email is not registered. Please register first.",
            });
        }

        if (ensureApprovedMrAccount(user)) {
            await Otp.deleteMany({ email: normalizedEmail, purpose: "login" });
            return res.status(403).json({
                success: false,
                message: "Your account is not approved",
            });
        }

        const otpDoc = await Otp.findOne({
            email: normalizedEmail,
            purpose: "login",
        });

        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: "Login OTP not found. Please request again.",
            });
        }

        if (otpDoc.expiresAt < new Date()) {
            await Otp.deleteMany({ email: normalizedEmail, purpose: "login" });
            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request again.",
            });
        }

        if (otpDoc.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        user.isVerified = true;
        await user.save();

        await Otp.deleteMany({ email: normalizedEmail, purpose: "login" });

        const token = generateToken(user._id);
        await sendAccountNotificationEmail(normalizedEmail, "login");

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: formatUserResponse(req.user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message,
        });
    }
};

export const createAdminUser = async (req, res) => {
    try {
        const { email, isHealthCareExpert = false, adminSetupKey } = req.body;
        const expectedSetupKey = process.env.ADMIN_SETUP_KEY?.trim();

        if (!expectedSetupKey) {
            return res.status(500).json({
                success: false,
                message: "ADMIN_SETUP_KEY is not configured on the server",
            });
        }

        const providedSetupKey =
            req.headers["x-admin-setup-key"]?.toString().trim() ||
            String(adminSetupKey || "").trim();

        if (!providedSetupKey || providedSetupKey !== expectedSetupKey) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin setup key",
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered",
            });
        }

        const user = await User.create({
            email: normalizedEmail,
            isHealthCareExpert: !!isHealthCareExpert,
            isVerified: true,
            role: "admin",
            mrApprovalStatus: NON_MR_STATUS,
        });

        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            message: "Admin created successfully",
            token,
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create admin user",
            error: error.message,
        });
    }
};

export const getPendingMrRequests = async (req, res) => {
    try {
        const mrRequests = await User.find({
            role: "mr",
            mrApprovalStatus: MR_PENDING_STATUS,
        })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            totalRequests: mrRequests.length,
            mrRequests: mrRequests.map(getPendingMrRequestPayload),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending MR requests",
            error: error.message,
        });
    }
};

export const approveMrRequest = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            role: "mr",
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "MR request not found",
            });
        }

        user.mrApprovalStatus = MR_APPROVED_STATUS;
        user.isVerified = true;
        user.mrApprovedAt = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: "MR account approved successfully",
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to approve MR request",
            error: error.message,
        });
    }
};

export const rejectMrRequest = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            role: "mr",
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "MR request not found",
            });
        }

        user.mrApprovalStatus = MR_REJECTED_STATUS;
        user.isVerified = false;
        user.mrApprovedAt = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "MR account rejected successfully",
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to reject MR request",
            error: error.message,
        });
    }
};

export const getAdminCustomers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" })
            .sort({ createdAt: -1 })
            .lean();

        const userIds = users.map((user) => user._id);
        const orders = userIds.length
            ? await Order.find({ user: { $in: userIds } })
                  .sort({ createdAt: -1 })
                  .select("user shippingInfo createdAt")
                  .lean()
            : [];

        const orderCountByUser = new Map();
        const latestShippingByUser = new Map();

        orders.forEach((order) => {
            const userId = String(order.user);

            orderCountByUser.set(userId, (orderCountByUser.get(userId) || 0) + 1);

            if (!latestShippingByUser.has(userId)) {
                latestShippingByUser.set(userId, order.shippingInfo || {});
            }
        });

        const customers = users.map((user) => {
            const userId = String(user._id);
            const shippingInfo = latestShippingByUser.get(userId) || {};

            return {
                _id: user._id,
                name: shippingInfo.fullName || formatDisplayName(user),
                email: user.email,
                phone: shippingInfo.phone || user.phone || "N/A",
                city: shippingInfo.city || user.city || "N/A",
                orders: orderCountByUser.get(userId) || 0,
                joined: user.createdAt,
                isVerified: user.isVerified,
            };
        });

        return res.status(200).json({
            success: true,
            totalUsers: users.length,
            customers,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch customers",
            error: error.message,
        });
    }
};

export const getAdminDashboard = async (req, res) => {
    try {
        const [orders, totalUsers, pendingMrRequests, lowStockItems, prescriptionCount] =
            await Promise.all([
                Order.find({})
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate("user", "email")
                    .lean(),
                User.countDocuments({ role: "user" }),
                User.countDocuments({
                    role: "mr",
                    mrApprovalStatus: MR_PENDING_STATUS,
                }),
                Product.countDocuments({
                    $or: [
                        { stock: { $lte: 10 } },
                        { status: { $in: ["Low Stock", "Out of Stock"] } },
                    ],
                }),
                PrescriptionRequest.countDocuments({}),
            ]);

        const salesSummary = await Order.aggregate([
            {
                $match: {
                    status: { $ne: "cancelled" },
                },
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" },
                    totalOrders: { $sum: 1 },
                },
            },
        ]);

        const totals = salesSummary[0] || { totalSales: 0, totalOrders: 0 };

        const recentOrders = orders.map((order) => ({
            _id: order._id,
            customer:
                order.shippingInfo?.fullName ||
                order.user?.email ||
                order.shippingInfo?.email ||
                "N/A",
            amount: order.total || 0,
            status: order.status,
            payment: order.paymentMethod,
            createdAt: order.createdAt,
        }));

        return res.status(200).json({
            success: true,
            stats: {
                totalSales: totals.totalSales || 0,
                totalOrders: totals.totalOrders || 0,
                activeCustomers: totalUsers,
                pendingMrRequests,
                lowStockItems,
                prescriptions: prescriptionCount,
            },
            recentOrders,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};
