import User from "../models/User.js";
import Otp from "../models/Otp.js";
import generateOtp from "../utils/generateOtp.js";
import generateToken from "../utils/generateToken.js";
import sendEmailOtp from "../utils/sendEmailOtp.js";
import { sendAccountNotificationEmail } from "../utils/sendEmailOtp.js";

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const formatUserResponse = (user) => ({
    _id: user._id,
    email: user.email,
    isHealthCareExpert: user.isHealthCareExpert,
    isVerified: user.isVerified,
    role: user.role,
});

export const sendRegisterOtp = async (req, res) => {
    try {
        const { email, isHealthCareExpert } = req.body;

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

        const normalizedEmail = email.toLowerCase().trim();
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
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

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

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "This email is not registered. Please register first.",
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

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "This email is not registered. Please register first.",
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
            user: req.user,
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

        const normalizedEmail = email.toLowerCase().trim();
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
