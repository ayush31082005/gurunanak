import express from "express";
import {
    submitPrescription,
    getMyPrescriptions,
    getAdminPrescriptions,
    updatePrescriptionStatus,
    deletePrescription,
} from "../controller/prescriptionController.js";
import { optionalProtect, protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", optionalProtect, submitPrescription);
router.get("/my", protect, getMyPrescriptions);
router.get("/admin/all", protect, requireAdmin, getAdminPrescriptions);
router.put("/admin/:id/status", protect, requireAdmin, updatePrescriptionStatus);
router.delete("/admin/:id", protect, requireAdmin, deletePrescription);

export default router;
