import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import sendEmail from "../utils/sendEmail.js";

const slugify = (text = "") =>
    text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

const parseNumber = (value, fallback = 0) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const deriveStatus = (stock) => {
    const safeStock = parseNumber(stock, 0);

    if (safeStock <= 0) return "Out of Stock";
    if (safeStock <= 10) return "Low Stock";
    return "In Stock";
};

const sendOutOfStockAlert = async ({ name, categoryName = "Uncategorized", stock }) => {
    const alertEmail =
        process.env.STOCK_ALERT_EMAIL ||
        process.env.PRESCRIPTION_NOTIFICATION_EMAIL ||
        process.env.EMAIL_USER ||
        process.env.EMAIL;

    if (!alertEmail) {
        return;
    }

    await sendEmail(
        alertEmail,
        `Out of stock alert: ${name}`,
        `Product "${name}" is out of stock.\nCategory: ${categoryName}\nCurrent stock: ${stock}\n\nPlease restock this product in the admin panel.`
    );
};

const resolveCategory = async (categoryValue) => {
    if (!categoryValue) {
        return null;
    }

    if (mongoose.Types.ObjectId.isValid(categoryValue)) {
        const categoryById = await Category.findById(categoryValue);
        if (categoryById) {
            return categoryById;
        }
    }

    return Category.findOne({
        $or: [{ name: categoryValue }, { slug: slugify(categoryValue) }],
    });
};

const buildImagePath = (req, existingImage = "") => {
    if (req.file?.filename) {
        return `/uploads/${req.file.filename}`;
    }

    if (typeof req.body.image === "string" && req.body.image.trim()) {
        return req.body.image.trim();
    }

    return existingImage;
};

const buildProductPayload = async (req, existingProduct = null) => {
    const categoryDocument = await resolveCategory(req.body.category);

    if (!categoryDocument) {
        return {
            error: "Invalid category",
        };
    }

    const price = parseNumber(req.body.price);
    const oldPrice = parseNumber(req.body.oldPrice);
    const stock = parseNumber(req.body.stock);
    const discount = parseNumber(
        req.body.discount,
        oldPrice > price && oldPrice > 0
            ? Math.round(((oldPrice - price) / oldPrice) * 100)
            : 0
    );

    return {
        payload: {
            name: req.body.name?.trim(),
            brand: req.body.brand?.trim() || existingProduct?.brand || "Generic",
            qty: req.body.qty?.trim() || "",
            category: categoryDocument._id,
            price,
            oldPrice,
            discount,
            rating: parseNumber(req.body.rating),
            ratingCount: parseNumber(req.body.ratingCount),
            stock,
            status: deriveStatus(stock),
            description: req.body.description?.trim() || "",
            image: buildImagePath(req, existingProduct?.image || ""),
        },
        meta: {
            categoryName: categoryDocument.name,
        },
    };
};

export const createProduct = async (req, res) => {
    try {
        if (!req.body.name || req.body.price === undefined || req.body.stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, category, price and stock are required",
            });
        }

        const { payload, error, meta } = await buildProductPayload(req);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error,
            });
        }

        const product = await Product.create(payload);
        const populatedProduct = await Product.findById(product._id).populate("category", "name slug");

        if (payload.stock <= 0) {
            sendOutOfStockAlert({
                name: payload.name,
                categoryName: meta?.categoryName,
                stock: payload.stock,
            }).catch((mailError) => {
                console.error("Out of stock email failed:", mailError.message);
            });
        }

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: populatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        const filter = {};

        if (category && category !== "All Products") {
            const foundCategory = await resolveCategory(category);
            filter.category = foundCategory?._id || null;
        }

        if (search?.trim()) {
            filter.name = { $regex: search.trim(), $options: "i" };
        }

        const products = await Product.find(filter)
            .populate("category", "name slug")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category", "name slug");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.json({
            success: true,
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const existingProduct = await Product.findById(req.params.id);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const { payload, error, meta } = await buildProductPayload(req, existingProduct);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error,
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, payload, {
            new: true,
        }).populate("category", "name slug");

        if (payload.stock <= 0 && Number(existingProduct.stock) > 0) {
            sendOutOfStockAlert({
                name: payload.name,
                categoryName: meta?.categoryName,
                stock: payload.stock,
            }).catch((mailError) => {
                console.error("Out of stock email failed:", mailError.message);
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
