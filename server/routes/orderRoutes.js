import express from "express";
import {
    createOrder,
    createRazorpayOrder,
    myOrders,
    verifyRazorpayPayment,
    getMySingleOrder,
    cancelMyOrder,
    getAllOrders,
    updateOrderStatus,
} from "../controller/orderController.js";
import { getMrOrders } from "../controller/mrController.js";
import { protect, requireAdmin, requireMr } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createOrder);
router.post("/razorpay", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyRazorpayPayment);

router.get("/mr", protect, requireMr, getMrOrders);
router.get("/my", protect, myOrders);
router.get("/my/:id", protect, getMySingleOrder);
router.put("/my/:id/cancel", protect, cancelMyOrder);
router.get("/admin/all", protect, requireAdmin, getAllOrders);
router.put("/admin/:id/status", protect, requireAdmin, updateOrderStatus);

export default router;
