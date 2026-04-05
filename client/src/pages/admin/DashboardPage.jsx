import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee, ShoppingCart, Users, AlertTriangle, Eye } from "lucide-react";
import API from "../../api";
import StatusBadge from "../../components/admin/StatusBadge";

const icons = [IndianRupee, ShoppingCart, Users, AlertTriangle];

const formatPrice = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        activeCustomers: 0,
        lowStockItems: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const { data } = await API.get("/auth/admin/dashboard");

            setStats(data.stats || {});
            setRecentOrders(Array.isArray(data.recentOrders) ? data.recentOrders : []);
        } catch (error) {
            setStats({
                totalSales: 0,
                totalOrders: 0,
                activeCustomers: 0,
                lowStockItems: 0,
            });
            setRecentOrders([]);
            setErrorMessage(error?.response?.data?.message || "Failed to fetch dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const statCards = useMemo(
        () => [
            {
                title: "Total Sales",
                value: formatPrice(stats.totalSales),
                change: "Live sales from placed orders",
            },
            {
                title: "Total Orders",
                value: Number(stats.totalOrders || 0).toLocaleString("en-IN"),
                change: "Live order count from database",
            },
            {
                title: "Active Customers",
                value: Number(stats.activeCustomers || 0).toLocaleString("en-IN"),
                change: "Registered users in the system",
            },
            {
                title: "Low Stock Items",
                value: Number(stats.lowStockItems || 0).toLocaleString("en-IN"),
                change: "Products needing stock attention",
            },
        ],
        [stats]
    );

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
                                    <p className="mt-2 text-sm text-[#87CEEB]">{card.change}</p>
                                </div>
                                <div className="rounded-2xl bg-[#87CEEB]/10 p-3 text-[#87CEEB]">
                                    <Icon size={22} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Track the latest live orders from your store.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchDashboardData}
                            className="rounded-xl bg-[#87CEEB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6EC6E8]"
                        >
                            Refresh Dashboard
                        </button>
                    </div>

                    {loading ? (
                        <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                            Loading dashboard data...
                        </div>
                    ) : errorMessage ? (
                        <div className="mt-6 rounded-2xl bg-rose-50 p-8 text-center text-rose-600">
                            {errorMessage}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                            No recent orders found.
                        </div>
                    ) : (
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
                                    {recentOrders.map((order) => (
                                        <tr key={order._id} className="border-b border-slate-100 text-sm">
                                            <td className="py-4 font-semibold text-slate-900">
                                                {order._id}
                                            </td>
                                            <td className="py-4 text-slate-600">{order.customer}</td>
                                            <td className="py-4 text-slate-600">
                                                {formatPrice(order.amount)}
                                            </td>
                                            <td className="py-4">
                                                <StatusBadge text={order.status} />
                                            </td>
                                            <td className="py-4">
                                                <StatusBadge text={order.payment} />
                                            </td>
                                            <td className="py-4">
                                                <Link
                                                    to="/admin/orders"
                                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 font-medium text-slate-700"
                                                >
                                                    <Eye size={15} /> View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
