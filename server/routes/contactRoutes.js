import express from "express";
import {
    submitContactMessage,
    submitCallbackRequest,
} from "../controller/contactController.js";

const router = express.Router();

router.post("/", submitContactMessage);
router.post("/callback", submitCallbackRequest);

export default router;
