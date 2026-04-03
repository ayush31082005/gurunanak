import express from "express";
import {
    sendRegisterOtp,
    verifyRegisterOtp,
    sendLoginOtp,
    verifyLoginOtp,
    getMyProfile,
    createAdminUser,
    getAdminCustomers,
    getAdminDashboard,
} from "../controller/authController.js";
import { isAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register/send-otp", sendRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtp);

router.post("/login/send-otp", sendLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);
router.post("/admin/create", createAdminUser);

router.get("/me", isAuth, getMyProfile);
router.get("/admin/dashboard", isAuth, requireAdmin, getAdminDashboard);
router.get("/admin/customers", isAuth, requireAdmin, getAdminCustomers);

export default router;
