import express from "express";
import {
    approveMrRequest,
    deleteMrRequest,
    getPendingMrRequests,
    rejectMrRequest,
    updateMrRequest,
} from "../controller/authController.js";
import {
    approveProduct,
    getAdminProducts,
    rejectProduct,
} from "../controller/productController.js";
import { isAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mr-requests", isAuth, requireAdmin, getPendingMrRequests);
router.patch("/mr-requests/:id", isAuth, requireAdmin, updateMrRequest);
router.patch("/mr-requests/:id/approve", isAuth, requireAdmin, approveMrRequest);
router.patch("/mr-requests/:id/reject", isAuth, requireAdmin, rejectMrRequest);
router.delete("/mr-requests/:id", isAuth, requireAdmin, deleteMrRequest);

router.get("/products", isAuth, requireAdmin, getAdminProducts);
router.patch("/products/:id/approve", isAuth, requireAdmin, approveProduct);
router.patch("/products/:id/reject", isAuth, requireAdmin, rejectProduct);

export default router;
