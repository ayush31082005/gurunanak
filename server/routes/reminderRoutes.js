import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
import {
    scanReminderImage,
    createReminder,
    getMyReminders,
    updateReminder,
    deleteReminder,
    toggleReminderStatus,
    logDoseStatus,
} from "../controller/reminderController.js";

const router = express.Router();

router.post("/scan", protect, upload.single("image"), scanReminderImage);
router.post("/", protect, createReminder);
router.get("/my", protect, getMyReminders);
router.put("/:id", protect, updateReminder);
router.delete("/:id", protect, deleteReminder);
router.patch("/:id/toggle", protect, toggleReminderStatus);
router.patch("/:id/log-dose", protect, logDoseStatus);

export default router;
