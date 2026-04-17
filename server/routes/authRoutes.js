import express from "express";
import {
    sendRegisterOtp,
    verifyRegisterOtp,
    sendMrRegisterOtp,
    verifyMrRegisterOtp,
    sendLoginOtp,
    verifyLoginOtp,
    getMyProfile,
    createAdminUser,
    deleteMrRequest,
    getPendingMrRequests,
    approveMrRequest,
    rejectMrRequest,
    updateMrRequest,
    getAdminCustomers,
    getAdminDashboard,
} from "../controller/authController.js";
import { mrDocumentUpload } from "../middleware/upload.js";
import { isAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register/send-otp", sendRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtp);
router.post(
    "/mr/register/send-otp",
    mrDocumentUpload.fields([
        { name: "gstCertificate", maxCount: 1 },
        { name: "drugLicenseDocument", maxCount: 1 },
    ]),
    sendMrRegisterOtp
);
router.post("/mr/register/verify-otp", verifyMrRegisterOtp);

router.post("/login/send-otp", sendLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);
router.post("/admin/create", createAdminUser);

router.get("/me", isAuth, getMyProfile);
router.get("/admin/dashboard", isAuth, requireAdmin, getAdminDashboard);
router.get("/admin/customers", isAuth, requireAdmin, getAdminCustomers);
router.get("/admin/mr-requests", isAuth, requireAdmin, getPendingMrRequests);
router.patch("/admin/mr-requests/:id", isAuth, requireAdmin, updateMrRequest);
router.patch("/admin/mr-requests/:id/approve", isAuth, requireAdmin, approveMrRequest);
router.patch("/admin/mr-requests/:id/reject", isAuth, requireAdmin, rejectMrRequest);
router.delete("/admin/mr-requests/:id", isAuth, requireAdmin, deleteMrRequest);

export default router;
