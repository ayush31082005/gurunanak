import express from "express";
import { submitPrescription } from "../controller/prescriptionController.js";

const router = express.Router();

router.post("/", submitPrescription);

export default router;
