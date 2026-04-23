import express from "express";
import {
    createBankAccount,
    deleteMyBankAccount,
    getAdminBankAccounts,
    getMyBankAccounts,
} from "../controller/bankController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBankAccount);
router.get("/my", protect, getMyBankAccounts);
router.delete("/:id", protect, deleteMyBankAccount);
router.get("/admin/all", protect, requireAdmin, getAdminBankAccounts);

export default router;
