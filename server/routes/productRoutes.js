import express from "express";
import upload from "../middleware/upload.js";
import {
    createProduct,
    deleteProduct,
    getProducts,
    getSingleProduct,
    updateProduct,
} from "../controller/productController.js";

const router = express.Router();

router.post("/", upload.single("image"), createProduct);
router.post("/add", upload.single("image"), createProduct);
router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
