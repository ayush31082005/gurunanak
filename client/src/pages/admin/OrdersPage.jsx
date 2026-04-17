import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../api";
import StatusBadge from "../../components/admin/StatusBadge";

const adminStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "payment_pending", label: "Payment Pending" },
    { value: "placed", label: "Placed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

const formatPrice = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const OrdersPage = () => {
    const ordersPerPage = 10;
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const { data } = await API.get("/orders/admin/all");
            setOrders(Array.isArray(data.orders) ? data.orders : []);
        } catch (error) {
            setOrders([]);
            setErrorMessage(error?.response?.data?.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();

    const stats = useMemo(() => {
        return {
            total: orders.length,
            pending: orders.filter((order) =>
                ["pending", "payment_pending"].includes(order.status)
            ).length,
            shipped: orders.filter((order) => order.status === "shipped").length,
            delivered: orders.filter((order) => order.status === "delivered").length,
        };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery) {
            return orders;
        }

        return orders.filter((order) => {
            const itemNames = (order.items || [])
                .map((item) => `${item.name || ""} ${item.pack || ""} ${item.quantity || ""}`)
                .join(" ");

            const searchableText = [
                order._id,
                order.status,
                order.paymentMethod,
                order.shippingInfo?.fullName,
                order.shippingInfo?.email,
                order.shippingInfo?.phone,
                order.shippingInfo?.address,
                order.shippingInfo?.city,
                order.shippingInfo?.state,
                order.shippingInfo?.pincode,
                itemNames,
                order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "",
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(searchQuery);
        });
    }, [orders, searchQuery]);

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        if (totalPages === 0) {
            setCurrentPage(1);
            return;
        }

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ordersPerPage;
        return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
    }, [currentPage, filteredOrders]);

    const paginationRange = useMemo(
        () => Array.from({ length: totalPages }, (_, index) => index + 1),
        [totalPages]
    );

    const startOrderNumber =
        filteredOrders.length === 0 ? 0 : (currentPage - 1) * ordersPerPage + 1;
    const endOrderNumber = Math.min(currentPage * ordersPerPage, filteredOrders.length);

    const handleStatusChange = async (orderId, status) => {
        try {
            setUpdatingOrderId(orderId);

            const { data } = await API.put(`/orders/admin/${orderId}/status`, { status });

            if (data.success) {
                setOrders((currentOrders) =>
                    currentOrders.map((order) =>
                        order._id === orderId ? { ...order, ...data.order } : order
                    )
                );
            }
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to update order status");
        } finally {
            setUpdatingOrderId("");
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">Orders Management</h2>
                <p className="mt-1 text-sm text-slate-500">
                    View all customer orders and update their delivery status.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Total Orders</p>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</h3>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Pending Orders</p>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.pending}</h3>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Shipped Orders</p>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.shipped}</h3>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Delivered Orders</p>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.delivered}</h3>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">All Orders</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Admin can control every placed order from here.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchOrders}
                        className="rounded-xl bg-[#87CEEB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6EC6E8]"
                    >
                        Refresh Orders
                    </button>
                </div>

                {loading ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        Loading orders...
                    </div>
                ) : errorMessage ? (
                    <div className="mt-6 rounded-2xl bg-rose-50 p-8 text-center text-rose-600">
                        {errorMessage}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        No orders found{searchQuery ? " for this search." : "."}
                    </div>
                ) : (
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-[1200px] w-full">
                            <thead>
                                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    <th className="pb-3 pr-4">Order</th>
                                    <th className="pb-3 pr-4">Customer</th>
                                    <th className="pb-3 pr-4">Items</th>
                                    <th className="pb-3 pr-4">Amount</th>
                                    <th className="pb-3 pr-4">Payment</th>
                                    <th className="pb-3 pr-4">Status</th>
                                    <th className="pb-3 pr-4">Update</th>
                                    <th className="pb-3">Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-slate-100 align-top text-sm">
                                        <td className="py-4 pr-4">
                                            <p className="font-semibold text-slate-900">{order._id}</p>
                                            <p className="mt-1 text-slate-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <p className="font-medium text-slate-800">
                                                {order.shippingInfo?.fullName || "N/A"}
                                            </p>
                                            <p className="mt-1 text-slate-500">
                                                {order.shippingInfo?.email || order.user?.email || "N/A"}
                                            </p>
                                            <p className="mt-1 text-slate-500">
                                                {order.shippingInfo?.phone || "N/A"}
                                            </p>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="space-y-2">
                                                {(order.items || []).map((item, index) => (
                                                    <div key={`${order._id}-${item.productId || index}`}>
                                                        <p className="font-medium text-slate-800">{item.name}</p>
                                                        <p className="mt-1 text-slate-500">
                                                            Qty: {item.quantity}
                                                            {item.pack ? ` | ${item.pack}` : ""}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <p className="font-semibold text-[#87CEEB]">
                                                {formatPrice(order.total)}
                                            </p>
                                            <p className="mt-1 text-slate-500">
                                                Subtotal: {formatPrice(order.subtotal)}
                                            </p>
                                            <p className="mt-1 text-slate-500">
                                                Discount: {formatPrice(order.discount)}
                                            </p>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <StatusBadge text={order.paymentMethod} />
                                        </td>
                                        <td className="py-4 pr-4">
                                            <StatusBadge text={order.status} />
                                        </td>
                                        <td className="py-4 pr-4">
                                            <select
                                                value={order.status}
                                                onChange={(event) =>
                                                    handleStatusChange(order._id, event.target.value)
                                                }
                                                disabled={updatingOrderId === order._id}
                                                className="min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-[#87CEEB] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {adminStatusOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-4">
                                            <p className="max-w-[260px] leading-6 text-slate-600">
                                                {[
                                                    order.shippingInfo?.address,
                                                    order.shippingInfo?.city,
                                                    order.shippingInfo?.state,
                                                    order.shippingInfo?.pincode,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ") || "N/A"}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing {startOrderNumber}-{endOrderNumber} of {filteredOrders.length} orders
                            </p>

                            {totalPages > 1 ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Prev
                                    </button>

                                    {paginationRange.map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            type="button"
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                                currentPage === pageNumber
                                                    ? "bg-[#87CEEB] text-white"
                                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((page) => Math.min(page + 1, totalPages))
                                        }
                                        disabled={currentPage === totalPages}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
