import React, { useEffect, useState } from "react";
import { LoaderCircle, Plus, Upload, X } from "lucide-react";
import API from "../../api";

const initialFormState = {
    name: "",
    qty: "",
    price: "",
    oldPrice: "",
    discount: "",
    rating: "",
    ratingCount: "",
    stock: "",
    description: "",
    category: "",
    image: null,
};

const AdminProductModal = ({
    isOpen,
    onClose,
    categories,
    onCreated,
    defaultCategoryId = "",
    mode = "create",
    product = null,
}) => {
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === "edit" && product) {
            setFormData({
                name: product.name || "",
                qty: product.qty || "",
                price: product.price?.toString() || "",
                oldPrice: product.oldPrice?.toString() || "",
                discount: product.discount?.toString() || "",
                rating: product.rating?.toString() || "",
                ratingCount: product.ratingCount?.toString() || "",
                stock: product.stock?.toString() || "",
                description: product.description || "",
                category:
                    (typeof product.category === "string"
                        ? product.category
                        : product.category?._id) ||
                    defaultCategoryId ||
                    categories[0]?._id ||
                    "",
                image: null,
            });
            setError("");
            setIsSubmitting(false);
            return;
        }

        setFormData({
            ...initialFormState,
            category: defaultCategoryId || categories[0]?._id || "",
        });
        setError("");
        setIsSubmitting(false);
    }, [categories, defaultCategoryId, isOpen, mode, product]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value, files } = event.target;

        if (name === "image") {
            setFormData((prev) => ({
                ...prev,
                image: files?.[0] || null,
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim() || !formData.price || !formData.stock || !formData.category) {
            setError("Name, price, stock, and category are required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const payload = new FormData();
            payload.append("name", formData.name.trim());
            payload.append("qty", formData.qty.trim());
            payload.append("price", formData.price);
            payload.append("oldPrice", formData.oldPrice);
            payload.append("discount", formData.discount);
            payload.append("rating", formData.rating);
            payload.append("ratingCount", formData.ratingCount);
            payload.append("stock", formData.stock);
            payload.append("description", formData.description.trim());
            payload.append("category", formData.category);

            if (formData.image) {
                payload.append("image", formData.image);
            }

            if (mode === "edit" && product?._id) {
                await API.put(`/products/${product._id}`, payload, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                await API.post("/products", payload, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            onCreated?.();
            onClose();
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    requestError?.response?.data?.error ||
                    requestError?.message ||
                    "Failed to save product."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] bg-black/40" onClick={onClose} />

            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div className="max-h-[calc(100vh-40px)] w-full max-w-[620px] overflow-y-auto rounded-3xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {mode === "edit" ? "Edit Product" : "Add Product"}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {mode === "edit"
                                    ? "Product details update karo."
                                    : "Naya product admin panel se create karo."}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-[#87CEEB]"
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Quantity
                                </label>
                                <input
                                    type="text"
                                    name="qty"
                                    value={formData.qty}
                                    onChange={handleChange}
                                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-[#87CEEB]"
                                    placeholder="Enter quantity"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-[#87CEEB]"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-[#87CEEB]"
                                    placeholder="Enter price"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Old Price
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    name="oldPrice"
                                    value={formData.oldPrice}
                                    onChange={handleChange}
                                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-[#87CEEB]"
                                    placeholder="Enter old price"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-[#87CEEB]"
                                    placeholder="Enter stock"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Discount
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    name="discount"
                                    value={formData.discount}
                                    onChange={handleChange}
                                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-[#87CEEB]"
                                    placeholder="Enter discount %"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Rating
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleChange}
                                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-[#87CEEB]"
                                    placeholder="Enter rating"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Rating Quantity
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    name="ratingCount"
                                    value={formData.ratingCount}
                                    onChange={handleChange}
                                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-[#87CEEB]"
                                    placeholder="Enter rating quantity"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#87CEEB]"
                                placeholder="Enter product description"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Product Image
                            </label>
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600 transition hover:border-[#87CEEB] hover:text-[#87CEEB]">
                                <Upload size={16} />
                                {formData.image
                                    ? formData.image.name
                                    : mode === "edit"
                                      ? "Choose new image (optional)"
                                      : "Choose image"}
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {error ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                {error}
                            </div>
                        ) : null}

                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#87CEEB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6EC6E8] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <LoaderCircle size={16} className="animate-spin" />
                                ) : (
                                    <Plus size={16} />
                                )}
                                {isSubmitting
                                    ? mode === "edit"
                                        ? "Saving..."
                                        : "Creating..."
                                    : mode === "edit"
                                      ? "Save Changes"
                                      : "Create Product"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminProductModal;
