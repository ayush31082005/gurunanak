import express from "express";
import {
    getMrNotifications,
    markMrNotificationAsRead,
} from "../controller/notificationController.js";
import { protect, requireMr } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mr", protect, requireMr, getMrNotifications);
router.patch("/mr/:id/read", protect, requireMr, markMrNotificationAsRead);

export default router;
