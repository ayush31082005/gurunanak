import express from "express";
import {
    createReturnRequest,
    getAdminReturns,
    getMyReturns,
    updateReturnRequest,
} from "../controller/returnController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { imageMemoryUpload } from "../middleware/upload.js";

const router = express.Router();

router.post("/returns", protect, imageMemoryUpload.single("file"), createReturnRequest);
router.get("/returns/my", protect, getMyReturns);
router.get("/admin/returns", protect, requireAdmin, getAdminReturns);
router.put("/admin/returns/:id", protect, requireAdmin, updateReturnRequest);

export default router;
