import React from "react";
import { Plus } from "lucide-react";
import { products } from "../../data/adminData";
import StatusBadge from "../../components/admin/StatusBadge";

const ProductsPage = () => {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Products Management</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Add, edit and manage all pharmacy products.
                    </p>
                </div>

                <button className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6f61] px-5 py-3 text-sm font-semibold text-white">
                    <Plus size={18} /> Add Product
                </button>
            </div>

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
                        {products.map((product) => (
                            <tr key={product.name} className="border-b border-slate-100 text-sm">
                                <td className="py-4 font-semibold text-slate-900">{product.name}</td>
                                <td className="py-4 text-slate-600">{product.category}</td>
                                <td className="py-4 text-slate-600">{product.price}</td>
                                <td className="py-4 text-slate-600">{product.stock}</td>
                                <td className="py-4">
                                    <StatusBadge text={product.status} />
                                </td>
                                <td className="py-4">
                                    <div className="flex gap-2">
                                        <button className="rounded-xl bg-slate-100 px-3 py-2 font-medium text-slate-700">
                                            Edit
                                        </button>
                                        <button className="rounded-xl bg-[#ff6f61] px-3 py-2 font-medium text-white">
                                            View
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsPage;
