import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import sendEmail from "../utils/sendEmail.js";
import { uploadMediaToCloudinary } from "../utils/cloudinary.js";

const PRODUCT_APPROVAL_PENDING = "pending";
const PRODUCT_APPROVAL_APPROVED = "approved";
const PRODUCT_APPROVAL_REJECTED = "rejected";

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

const deriveStockStatus = (stock) => {
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

const buildImagePath = async (req, existingImage = "") => {
    if (req.file?.buffer) {
        const uploadResult = await uploadMediaToCloudinary({
            fileBuffer: req.file.buffer,
            fileName: req.file.originalname || "product-image.jpg",
            fileType: req.file.mimetype || "image/jpeg",
            folder: "gurunanak/products",
        });

        return uploadResult.secure_url || uploadResult.url || "";
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
            status: deriveStockStatus(stock),
            description: req.body.description?.trim() || "",
            image: await buildImagePath(req, existingProduct?.image || ""),
        },
        meta: {
            categoryName: categoryDocument.name,
        },
    };
};

const productPopulateConfig = [
    { path: "category", select: "name slug" },
    { path: "createdBy", select: "name email role medicalStoreName" },
];

const applyProductPopulates = (query) =>
    productPopulateConfig.reduce(
        (currentQuery, populateConfig) => currentQuery.populate(populateConfig),
        query
    );

const canManageProduct = (user, product) => {
    if (!user || !product) {
        return false;
    }

    if (user.role === "admin") {
        return true;
    }

    return user.role === "mr" && String(product.createdBy) === String(user._id);
};

const buildProductListFilter = async ({
    category,
    search,
    createdByRole,
    approvalStatus,
    createdBy,
} = {}) => {
    const filter = {};

    if (category && category !== "All Products") {
        const foundCategory = await resolveCategory(category);
        filter.category = foundCategory?._id || null;
    }

    if (search?.trim()) {
        filter.name = { $regex: search.trim(), $options: "i" };
    }

    if (createdByRole) {
        filter.createdByRole = createdByRole;
    }

    if (approvalStatus) {
        filter.approvalStatus = approvalStatus;
    }

    if (createdBy) {
        filter.createdBy = createdBy;
    }

    return filter;
};

const buildPublicApprovedFilter = (baseFilter = {}) => ({
    ...baseFilter,
    $or: [
        { approvalStatus: PRODUCT_APPROVAL_APPROVED },
        { approvalStatus: { $exists: false } },
        { approvalStatus: null },
    ],
});

const maybeSendOutOfStockAlert = ({ payload, meta, previousStock = null }) => {
    const shouldSend =
        payload.stock <= 0 && (previousStock === null || Number(previousStock) > 0);

    if (!shouldSend) {
        return;
    }

    sendOutOfStockAlert({
        name: payload.name,
        categoryName: meta?.categoryName,
        stock: payload.stock,
    }).catch((mailError) => {
        console.error("Out of stock email failed:", mailError.message);
    });
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

        const ownershipPayload = {
            createdBy: req.user._id,
            createdByRole: req.user.role,
            approvalStatus:
                req.user.role === "admin"
                    ? PRODUCT_APPROVAL_APPROVED
                    : PRODUCT_APPROVAL_PENDING,
        };

        const product = await Product.create({
            ...payload,
            ...ownershipPayload,
        });

        const populatedProduct = await applyProductPopulates(
            Product.findById(product._id)
        );

        maybeSendOutOfStockAlert({
            payload,
            meta,
        });

        return res.status(201).json({
            success: true,
            message:
                req.user.role === "admin"
                    ? "Product added successfully"
                    : "Product submitted for admin approval",
            product: populatedProduct,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const filter = await buildProductListFilter({
            category: req.query.category,
            search: req.query.search,
        });

        const products = await applyProductPopulates(
            Product.find(buildPublicApprovedFilter(filter))
        ).sort({ createdAt: -1 });

        return res.json({
            success: true,
            products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getSingleProduct = async (req, res) => {
    try {
        const product = await applyProductPopulates(
            Product.findOne(
                buildPublicApprovedFilter({
                    _id: req.params.id,
                })
            )
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.json({
            success: true,
            product,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const products = await applyProductPopulates(
            Product.find({
                createdBy: req.user._id,
            })
        ).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAdminProducts = async (req, res) => {
    try {
        const { ownerType, createdByRole, approvalStatus, category, search } = req.query;

        const normalizedCreatedByRole = ownerType || createdByRole || "";
        const filter = await buildProductListFilter({
            category,
            search,
            createdByRole: normalizedCreatedByRole || undefined,
            approvalStatus: approvalStatus || undefined,
        });

        const products = await applyProductPopulates(Product.find(filter)).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateProductApprovalStatus = async ({ productId, approvalStatus, actingUser }) => {
    const product = await Product.findById(productId);

    if (!product) {
        return {
            error: "Product not found",
            statusCode: 404,
        };
    }

    product.approvalStatus = approvalStatus;
    product.createdByRole = product.createdByRole || "admin";
    product.createdBy = product.createdBy || actingUser?._id;
    await product.save();

    const populatedProduct = await applyProductPopulates(
        Product.findById(product._id)
    );

    return {
        product: populatedProduct,
    };
};

export const approveProduct = async (req, res) => {
    try {
        const { product, error, statusCode } = await updateProductApprovalStatus({
            productId: req.params.id,
            approvalStatus: PRODUCT_APPROVAL_APPROVED,
            actingUser: req.user,
        });

        if (error) {
            return res.status(statusCode).json({
                success: false,
                message: error,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product approved successfully",
            product,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const rejectProduct = async (req, res) => {
    try {
        const { product, error, statusCode } = await updateProductApprovalStatus({
            productId: req.params.id,
            approvalStatus: PRODUCT_APPROVAL_REJECTED,
            actingUser: req.user,
        });

        if (error) {
            return res.status(statusCode).json({
                success: false,
                message: error,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product rejected successfully",
            product,
        });
    } catch (error) {
        return res.status(500).json({
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

        if (!canManageProduct(req.user, existingProduct)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to update this product",
            });
        }

        const { payload, error, meta } = await buildProductPayload(req, existingProduct);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error,
            });
        }

        const ownershipUpdate =
            req.user.role === "mr"
                ? { approvalStatus: PRODUCT_APPROVAL_PENDING }
                : {
                      approvalStatus: PRODUCT_APPROVAL_APPROVED,
                      createdBy: existingProduct.createdBy || req.user._id,
                      createdByRole: existingProduct.createdByRole || "admin",
                  };

        const updatedProduct = await applyProductPopulates(
            Product.findByIdAndUpdate(
                req.params.id,
                {
                    ...payload,
                    ...ownershipUpdate,
                },
                {
                    new: true,
                }
            )
        );

        maybeSendOutOfStockAlert({
            payload,
            meta,
            previousStock: existingProduct.stock,
        });

        return res.status(200).json({
            success: true,
            message:
                req.user.role === "admin"
                    ? "Product updated successfully"
                    : "Product updated and resubmitted for admin approval",
            product: updatedProduct,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const existingProduct = await Product.findById(req.params.id);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (!canManageProduct(req.user, existingProduct)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to delete this product",
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
