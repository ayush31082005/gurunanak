import express from "express";
import {
    sendRegisterOtp,
    verifyRegisterOtp,
    sendLoginOtp,
    verifyLoginOtp,
    getMyProfile,
    createAdminUser,
} from "../controller/authController.js";
import { isAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register/send-otp", sendRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtp);

router.post("/login/send-otp", sendLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);
router.post("/admin/create", createAdminUser);

router.get("/me", isAuth, getMyProfile);

export default router;
