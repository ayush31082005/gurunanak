import React from "react";
import { X } from "lucide-react";
import StatusBadge from "./StatusBadge";

const AdminProductViewModal = ({ isOpen, onClose, product }) => {
    if (!isOpen || !product) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 z-[100] bg-black/40" onClick={onClose} />

            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div className="w-full max-w-[560px] rounded-3xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Product Details</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Product ka full preview yahan dikhega.
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

                    <div className="space-y-5 px-6 py-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-semibold text-slate-400">N/A</span>
                                )}
                            </div>

                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-slate-900">{product.name}</h4>
                                <p className="mt-1 text-sm text-slate-500">{product.categoryName}</p>
                                <div className="mt-3">
                                    <StatusBadge text={product.status} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Price
                                </p>
                                <p className="mt-2 text-lg font-bold text-slate-900">
                                    Rs {product.price}
                                </p>
                                {product.oldPrice ? (
                                    <p className="mt-1 text-sm text-slate-400 line-through">
                                        Rs {product.oldPrice}
                                    </p>
                                ) : null}
                                {product.discount ? (
                                    <p className="mt-1 text-sm font-semibold text-emerald-600">
                                        {product.discount}% off
                                    </p>
                                ) : null}
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Stock
                                </p>
                                <p className="mt-2 text-lg font-bold text-slate-900">
                                    {product.stock}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Product ID
                                </p>
                                <p className="mt-2 truncate text-sm font-semibold text-slate-900">
                                    {product.id}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Quantity
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                    {product.qty || "N/A"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Rating
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                    {product.rating || 0}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Rating Quantity
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                    {product.ratingCount || 0}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Description
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                {product.description || "No description available."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminProductViewModal;
