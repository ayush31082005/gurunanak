const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const getCategoryName = (category) => {
    if (!category) return "";
    if (typeof category === "string") return category;
    return category.name || "";
};

const getCategoryId = (category) => {
    if (!category) return "";
    if (typeof category === "string" && /^[a-fA-F0-9]{24}$/.test(category)) {
        return category;
    }

    if (typeof category === "object") {
        return category._id || "";
    }

    return "";
};

const FALLBACK_PRODUCT_IMAGE = "/product/meyer.png";

const normalizeImageUrl = (image) => {
    if (!image) return FALLBACK_PRODUCT_IMAGE;

    const normalizedImage = String(image).trim();

    if (!normalizedImage) return FALLBACK_PRODUCT_IMAGE;
    if (/^https?:\/\//i.test(normalizedImage)) return normalizedImage;

    if (normalizedImage.startsWith("/uploads/")) {
        return `${API_ORIGIN}${normalizedImage}`;
    }

    if (normalizedImage.startsWith("uploads/")) {
        return `${API_ORIGIN}/${normalizedImage}`;
    }

    if (normalizedImage.startsWith("/")) {
        return normalizedImage;
    }

    if (normalizedImage.startsWith("product/")) {
        return `/${normalizedImage}`;
    }

    return `${API_ORIGIN}/${normalizedImage}`;
};

const deriveDiscount = (price, oldPrice, discount) => {
    const numericDiscount = Number(discount) || 0;
    if (numericDiscount > 0) return numericDiscount;
    if (oldPrice > price && oldPrice > 0) {
        return Math.round(((oldPrice - price) / oldPrice) * 100);
    }
    return 0;
};

const deriveStatus = (stock) => {
    const safeStock = Number(stock) || 0;
    if (safeStock <= 0) return "Out of Stock";
    if (safeStock <= 10) return "Low Stock";
    return "In Stock";
};

export const normalizeProductForClient = (product = {}) => {
    const price = Number(product.price) || 0;
    const oldPrice = Number(product.oldPrice ?? product.originalPrice) || 0;
    const categoryName = getCategoryName(product.category) || product.categoryName || "";
    const ratingCount = Number(product.ratingCount ?? product.reviews) || 0;
    const qty = product.qty || product.size || product.pack || "";

    return {
        ...product,
        id: String(product._id || product.id || `${product.name || "product"}-${categoryName || "general"}`),
        _id: product._id || product.id || "",
        name: product.name || "Untitled Product",
        brand: product.brand || "Generic",
        description: product.description || "",
        category: categoryName,
        categoryName,
        categoryId: getCategoryId(product.category),
        image: normalizeImageUrl(product.image),
        qty,
        size: qty,
        pack: qty,
        price,
        oldPrice,
        originalPrice: oldPrice,
        discount: deriveDiscount(price, oldPrice, product.discount),
        rating: Number(product.rating) || 0,
        ratingCount,
        reviews: ratingCount,
        stock: Number(product.stock) || 0,
        status: product.status || deriveStatus(product.stock),
        approvalStatus: product.approvalStatus || "approved",
        createdByRole: product.createdByRole || "",
        createdBy: product.createdBy || null,
        delivery: product.delivery || "Delivery in 30 mins",
    };
};
