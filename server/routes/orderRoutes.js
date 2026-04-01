import express from "express";
import {
    createOrder,
    createRazorpayOrder,
    myOrders,
    verifyRazorpayPayment,
} from "../controller/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createOrder);
router.post("/razorpay", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyRazorpayPayment);
router.get("/my", protect, myOrders);

export default router;
