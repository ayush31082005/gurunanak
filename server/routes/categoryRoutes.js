import express from "express";
import { createCategory, getCategories } from "../controller/categoryController.js";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getCategories);

export default router;
