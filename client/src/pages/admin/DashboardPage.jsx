import React from "react";
import { IndianRupee, ShoppingCart, Users, AlertTriangle, Eye } from "lucide-react";
import { statCards, ordersData } from "../../data/adminData";
import StatusBadge from "../../components/admin/StatusBadge";

const icons = [IndianRupee, ShoppingCart, Users, AlertTriangle];

const DashboardPage = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card, index) => {
                    const Icon = icons[index];
                    return (
                        <div
                            key={card.title}
                            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                                    <h3 className="mt-3 text-2xl font-bold text-slate-900">{card.value}</h3>
                                    <p className="mt-2 text-sm text-[#ff6f61]">{card.change}</p>
                                </div>
                                <div className="rounded-2xl bg-[#ff6f61]/10 p-3 text-[#ff6f61]">
                                    <Icon size={22} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Track all medicine and wellness product orders.
                    </p>

                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                                    <th className="pb-3 font-semibold">Order ID</th>
                                    <th className="pb-3 font-semibold">Customer</th>
                                    <th className="pb-3 font-semibold">Amount</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold">Payment</th>
                                    <th className="pb-3 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersData.map((order) => (
                                    <tr key={order.id} className="border-b border-slate-100 text-sm">
                                        <td className="py-4 font-semibold text-slate-900">{order.id}</td>
                                        <td className="py-4 text-slate-600">{order.customer}</td>
                                        <td className="py-4 text-slate-600">{order.amount}</td>
                                        <td className="py-4">
                                            <StatusBadge text={order.status} />
                                        </td>
                                        <td className="py-4">
                                            <StatusBadge text={order.payment} />
                                        </td>
                                        <td className="py-4">
                                            <button className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 font-medium text-slate-700">
                                                <Eye size={15} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
