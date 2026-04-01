import express from "express";
import { submitContactMessage } from "../controller/contactController.js";

const router = express.Router();

router.post("/", submitContactMessage);

export default router;
