import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createComplaint,
    getMyComplaints,
    getMySingleComplaint,
    getAllComplaints,
    updateComplaintStatus,
} from "../controller/complaintController.js";

const router = express.Router();

// user routes
router.post("/create", protect, createComplaint);
router.get("/my", protect, getMyComplaints);
router.get("/my/:id", protect, getMySingleComplaint);

// admin routes
router.get("/all", protect, getAllComplaints);
router.put("/update/:id", protect, updateComplaintStatus);

export default router;