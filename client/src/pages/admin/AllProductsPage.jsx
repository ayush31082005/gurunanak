import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import API from "../../api";
import AdminProductModal from "../../components/admin/AdminProductModal";
import AdminProductViewModal from "../../components/admin/AdminProductViewModal";
import StatusBadge from "../../components/admin/StatusBadge";
import {
    adminProductPages,
    getAdminProductPageBySlug,
} from "../../data/adminProductPages";
import { normalizeProductForClient } from "../../utils/productTransforms";

const getStockStatus = (stock) => {
    const safeStock = Number(stock) || 0;

    if (safeStock <= 0) return "Out of Stock";
    if (safeStock <= 10) return "Low Stock";
    return "In Stock";
};

const extractProducts = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.products)) return responseData.products;
    if (Array.isArray(responseData?.data)) return responseData.data;
    return [];
};

const extractCategories = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.categories)) return responseData.categories;
    if (Array.isArray(responseData?.data)) return responseData.data;
    return [];
};

const AllProductsPage = () => {
    const { groupSlug } = useParams();
    const [searchParams] = useSearchParams();

    const selectedCategoryId = searchParams.get("category") || "";
    const pageConfig = getAdminProductPageBySlug(groupSlug);
    const selectedGroupName = pageConfig?.label || "";
    const selectedCategoryName =
        searchParams.get("name") || selectedGroupName || "All Products";

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const allowedAdminCategoryNames = useMemo(
        () => new Set(adminProductPages.map((page) => page.label.trim().toLowerCase())),
        []
    );

    const adminCategories = useMemo(
        () =>
            categories.filter((category) =>
                allowedAdminCategoryNames.has(category?.name?.trim()?.toLowerCase())
            ),
        [allowedAdminCategoryNames, categories]
    );

    const defaultCategoryIdForForm = useMemo(() => {
        if (selectedCategoryId) return selectedCategoryId;
        if (!selectedGroupName) return "";

        const matchedCategory = adminCategories.find(
            (category) => category?.name?.trim()?.toLowerCase() === selectedGroupName.trim().toLowerCase()
        );

        return matchedCategory?._id || "";
    }, [adminCategories, selectedCategoryId, selectedGroupName]);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            setError("");

            const productParams = {};
            if (selectedCategoryId) {
                productParams.category = selectedCategoryId;
            }

            const [productsResponse, categoriesResponse] = await Promise.all([
                API.get("/products", { params: productParams }),
                API.get("/categories"),
            ]);

            setProducts(extractProducts(productsResponse.data));
            setCategories(extractCategories(categoriesResponse.data));
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                requestError?.response?.data?.error ||
                requestError?.message ||
                "Failed to load products."
            );
            setProducts([]);
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [selectedCategoryId, selectedGroupName]);

    const normalizedProducts = useMemo(() => {
        let mappedProducts = products.map((product) => {
            const normalizedProduct = normalizeProductForClient(product);

            return {
                ...normalizedProduct,
                category: normalizedProduct.categoryId,
                categoryName: normalizedProduct.category || "Uncategorized",
                status: normalizedProduct.status || getStockStatus(normalizedProduct.stock),
            };
        });

        if (selectedCategoryId) {
            mappedProducts = mappedProducts.filter(
                (product) => String(product.category) === String(selectedCategoryId)
            );
        } else if (selectedGroupName) {
            mappedProducts = mappedProducts.filter(
                (product) =>
                    product.categoryName.trim().toLowerCase() ===
                    selectedGroupName.trim().toLowerCase()
            );
        }

        return mappedProducts;
    }, [products, categories, selectedCategoryId, selectedGroupName]);

    const handleView = (product) => {
        setSelectedProduct(product);
        setIsViewModalOpen(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (product) => {
        const shouldDelete = window.confirm(
            `Delete "${product.name}"? This action cannot be undone.`
        );

        if (!shouldDelete) return;

        try {
            await API.delete(`/products/${product.id}`);
            await loadProducts();
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                requestError?.response?.data?.error ||
                requestError?.message ||
                "Failed to delete product."
            );
        }
    };

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/admin/products"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                            <ChevronLeft size={16} /> Back
                        </Link>

                        <span className="rounded-full bg-[#fff1ef] px-3 py-1 text-xs font-semibold text-[#ff6f61]">
                            {selectedCategoryName}
                        </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-slate-900">All Products</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Tumhare backend se live fetched product list.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6f61] px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {isLoading ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm font-medium text-slate-500">
                    Loading products...
                </div>
            ) : error ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm font-medium text-rose-700">
                    {error}
                </div>
            ) : (
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                                <th className="pb-3 font-semibold">Product</th>
                                <th className="pb-3 font-semibold">Category</th>
                                <th className="pb-3 font-semibold">Price</th>
                                <th className="pb-3 font-semibold">Stock</th>
                                <th className="pb-3 font-semibold">Status</th>
                                <th className="pb-3 font-semibold">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {normalizedProducts.map((product) => (
                                <tr key={product.id} className="border-b border-slate-100 text-sm">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs font-semibold text-slate-400">
                                                        N/A
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-900">{product.name}</p>
                                                <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                                    {product.qty || product.description || "No description"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 text-slate-600">{product.categoryName}</td>

                                    <td className="py-4 text-slate-600">
                                        <div>
                                            <p>Rs {product.price}</p>
                                            {product.oldPrice ? (
                                                <p className="text-xs text-slate-400 line-through">
                                                    Rs {product.oldPrice}
                                                </p>
                                            ) : null}
                                            {product.discount ? (
                                                <p className="text-xs font-semibold text-emerald-600">
                                                    {product.discount}% off
                                                </p>
                                            ) : null}
                                        </div>
                                    </td>

                                    <td className="py-4 text-slate-600">{product.stock}</td>

                                    <td className="py-4">
                                        <StatusBadge text={product.status} />
                                    </td>

                                    <td className="py-4">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(product)}
                                                className="rounded-xl bg-slate-100 px-3 py-2 font-medium text-slate-700"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleView(product)}
                                                className="rounded-xl bg-[#ff6f61] px-3 py-2 font-medium text-white"
                                            >
                                                View
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(product)}
                                                className="inline-flex items-center gap-1 rounded-xl bg-rose-100 px-3 py-2 font-medium text-rose-700"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {normalizedProducts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                            <p className="text-sm font-semibold text-slate-700">
                                {selectedCategoryName} mein abhi koi product nahi mila.
                            </p>
                        </div>
                    ) : null}
                </div>
            )}

            <AdminProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                categories={adminCategories}
                onCreated={loadProducts}
                defaultCategoryId={defaultCategoryIdForForm}
            />

            <AdminProductModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                }}
                categories={adminCategories}
                onCreated={loadProducts}
                defaultCategoryId={defaultCategoryIdForForm}
                mode="edit"
                product={selectedProduct}
            />

            <AdminProductViewModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
            />
        </div>
    );
};

export default AllProductsPage;
