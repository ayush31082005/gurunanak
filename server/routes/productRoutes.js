import express from "express";
import { imageMemoryUpload } from "../middleware/upload.js";
import {
    createProduct,
    deleteProduct,
    getProducts,
    getMyProducts,
    getSingleProduct,
    updateProduct,
} from "../controller/productController.js";
import { protect, requireAdminOrMr, requireMr } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/mine", protect, requireMr, getMyProducts);
router.get("/:id", getSingleProduct);
router.post("/", protect, requireAdminOrMr, imageMemoryUpload.single("image"), createProduct);
router.post("/add", protect, requireAdminOrMr, imageMemoryUpload.single("image"), createProduct);
router.put("/:id", protect, requireAdminOrMr, imageMemoryUpload.single("image"), updateProduct);
router.delete("/:id", protect, requireAdminOrMr, deleteProduct);

export default router;
