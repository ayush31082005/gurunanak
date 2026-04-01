import React from "react";
import { Clock3, Truck, BadgeCheck } from "lucide-react";
import { ordersData } from "../../data/adminData";
import StatusBadge from "../../components/admin/StatusBadge";

const OrdersPage = () => {
    const cards = [
        { title: "Pending Orders", value: "36", icon: Clock3 },
        { title: "Shipped Orders", value: "58", icon: Truck },
        { title: "Delivered Orders", value: "190", icon: BadgeCheck },
    ];

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Orders Management</h2>
            <p className="mt-1 text-sm text-slate-500">Manage all customer orders from here.</p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.title} className="rounded-2xl bg-slate-50 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">{card.title}</p>
                                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{card.value}</h3>
                                </div>
                                <div className="rounded-2xl bg-[#ff6f61]/15 p-3 text-[#ff6f61]">
                                    <Icon size={22} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                            <th className="pb-3 font-semibold">Order ID</th>
                            <th className="pb-3 font-semibold">Customer</th>
                            <th className="pb-3 font-semibold">Amount</th>
                            <th className="pb-3 font-semibold">Status</th>
                            <th className="pb-3 font-semibold">Payment</th>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersPage;
