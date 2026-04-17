import express from "express";
import { checkDeliveryTime } from "../controller/deliveryController.js";

const router = express.Router();

router.post("/check-delivery", checkDeliveryTime);

export default router;
