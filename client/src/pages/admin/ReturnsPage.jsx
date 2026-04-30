import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import StatusBadge from "../../components/admin/StatusBadge";

const formatPrice = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const getCurrentReturnStatus = (request) => {
    if (request?.status === "rejected" || request?.refundStatus === "rejected") {
        return "rejected";
    }

    if (request?.type === "replacement") {
        if (request?.status === "replacement_created") {
            return "replacement_created";
        }

        if (request?.status === "approved") {
            return "approved";
        }

        return "pending";
    }

    if (request?.refundStatus === "manual_completed" || request?.status === "refund_completed") {
        return "refund_completed";
    }

    if (request?.refundStatus === "manual_pending") {
        return "manual_pending";
    }

    if (request?.refundStatus === "picked_up") {
        return "picked_up";
    }

    if (request?.refundStatus === "approved" || request?.status === "approved") {
        return "approved";
    }

    return "pending";
};

const ReturnsPage = () => {
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [updatingReturnId, setUpdatingReturnId] = useState("");

    const fetchReturns = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const { data } = await API.get("/admin/returns");
            setReturnRequests(Array.isArray(data.returnRequests) ? data.returnRequests : []);
        } catch (error) {
            setReturnRequests([]);
            setErrorMessage(error?.response?.data?.message || "Failed to fetch return requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const stats = useMemo(
        () => ({
            total: returnRequests.length,
            pending: returnRequests.filter((request) => request.status === "pending").length,
            refunds: returnRequests.filter((request) => request.type === "refund").length,
            replacements: returnRequests.filter((request) => request.type === "replacement").length,
            completed: returnRequests.filter(
                (request) =>
                    request.status === "refund_completed" ||
                    request.status === "replacement_created"
            ).length,
        }),
        [returnRequests]
    );

    const handleAction = async (requestId, action) => {
        const adminNote =
            action === "reject"
                ? window.prompt("Add an optional rejection note for the customer:", "") || ""
                : "";

        try {
            setUpdatingReturnId(requestId);

            const { data } = await API.put(`/admin/returns/${requestId}`, {
                action,
                adminNote,
            });

            if (data?.success && data?.returnRequest) {
                setReturnRequests((currentRequests) =>
                    currentRequests.map((request) =>
                        request._id === requestId ? data.returnRequest : request
                    )
                );
            }
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to update return request");
        } finally {
            setUpdatingReturnId("");
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">Return Management</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Review refund and replacement requests, then complete the required manual steps.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Total Requests</p>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</h3>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Pending</p>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.pending}</h3>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Refund Requests</p>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.refunds}</h3>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Replacements</p>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.replacements}</h3>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Completed</p>
                        <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.completed}</h3>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">All Return Requests</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Use the actions below to approve, reject, or finish manual refunds.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchReturns}
                        className="rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
                    >
                        Refresh Requests
                    </button>
                </div>

                {loading ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        Loading return requests...
                    </div>
                ) : errorMessage ? (
                    <div className="mt-6 rounded-2xl bg-rose-50 p-8 text-center text-rose-600">
                        {errorMessage}
                    </div>
                ) : returnRequests.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        No return requests found.
                    </div>
                ) : (
                    <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                        <div className="overflow-x-auto">
                        <table className="min-w-[1450px] w-full table-auto border-separate border-spacing-0">
                            <thead className="bg-slate-100">
                                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    <th className="border-b border-r border-slate-200 px-4 py-4">Request</th>
                                    <th className="border-b border-r border-slate-200 px-4 py-4">Customer</th>
                                    <th className="border-b border-r border-slate-200 px-4 py-4">Items</th>
                                    <th className="border-b border-r border-slate-200 px-4 py-4">Reason</th>
                                    <th className="border-b border-r border-slate-200 px-4 py-4">Proof</th>
                                    <th className="border-b border-r border-slate-200 px-4 py-4">Statuses</th>
                                    <th className="border-b border-slate-200 px-4 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returnRequests.map((request) => {
                                    const isUpdating = updatingReturnId === request._id;
                                    const canApproveRefund =
                                        request.type === "refund" && request.status === "pending";
                                    const canApproveReplacement =
                                        request.type === "replacement" &&
                                        request.status === "pending";
                                    const canReject = request.status === "pending";
                                    const canMarkPickupProduct =
                                        request.type === "refund" &&
                                        request.refundStatus === "approved";
                                    const canMarkManualPending =
                                        request.type === "refund" &&
                                        request.refundStatus === "picked_up";
                                    const canCompleteRefund =
                                        request.type === "refund" &&
                                        request.refundStatus === "manual_pending";

                                    return (
                                        <tr key={request._id} className="align-top text-sm transition hover:bg-slate-50/70">
                                            <td className="border-b border-r border-slate-200 px-4 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    #{String(request.order?._id || request.orderSnapshot?.orderId || "").slice(-8).toUpperCase()}
                                                </p>
                                                <p className="mt-1 text-slate-500">
                                                    {new Date(request.createdAt).toLocaleDateString("en-IN")}
                                                </p>
                                                <p className="mt-2">
                                                    <StatusBadge text={request.type} />
                                                </p>
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Amount: {formatPrice(request.orderSnapshot?.total)}
                                                </p>
                                            </td>

                                            <td className="border-b border-r border-slate-200 px-4 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {request.user?.name || request.order?.shippingInfo?.fullName || "N/A"}
                                                </p>
                                                <p className="mt-1 text-slate-500">
                                                    {request.user?.email || request.order?.shippingInfo?.email || "N/A"}
                                                </p>
                                                {request.replacementOrder?._id ? (
                                                    <p className="mt-2 text-xs font-semibold text-sky-700">
                                                        Replacement: #{String(request.replacementOrder._id).slice(-8).toUpperCase()}
                                                    </p>
                                                ) : null}
                                            </td>

                                            <td className="border-b border-r border-slate-200 px-4 py-4">
                                                <div className="space-y-2">
                                                    {(request.items || []).map((item, index) => (
                                                        <div key={`${request._id}-${item.productId || index}`}>
                                                            <p className="font-medium text-slate-800">{item.name}</p>
                                                            <p className="mt-1 text-slate-500">
                                                                Qty: {item.quantity}
                                                                {item.pack ? ` | ${item.pack}` : ""}
                                                                {` | ${formatPrice(item.price)}`}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="border-b border-r border-slate-200 px-4 py-4">
                                                <p className="max-w-[260px] leading-6 text-slate-600">
                                                    {request.reason}
                                                </p>
                                                {request.adminNote ? (
                                                    <p className="mt-2 text-xs font-medium text-slate-500">
                                                        Admin note: {request.adminNote}
                                                    </p>
                                                ) : null}
                                            </td>

                                            <td className="border-b border-r border-slate-200 px-4 py-4">
                                                {request.proofImage?.url ? (
                                                    <a
                                                        href={request.proofImage.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        View Proof
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400">N/A</span>
                                                )}
                                            </td>

                                            <td className="border-b border-r border-slate-200 px-4 py-4">
                                                <div className="space-y-2">
                                                    <StatusBadge text={getCurrentReturnStatus(request)} />
                                                    <p className="text-xs font-medium text-slate-400">
                                                        Current status
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="border-b border-slate-200 px-4 py-4">
                                                <div className="flex max-w-[320px] flex-wrap gap-2">
                                                    {canApproveRefund ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAction(request._id, "approve_refund")}
                                                            disabled={isUpdating}
                                                            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Approve Refund
                                                        </button>
                                                    ) : null}

                                                    {canApproveReplacement ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAction(request._id, "approve_replacement")}
                                                            disabled={isUpdating}
                                                            className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Approve Replacement
                                                        </button>
                                                    ) : null}

                                                    {canReject ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAction(request._id, "reject")}
                                                            disabled={isUpdating}
                                                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Reject
                                                        </button>
                                                    ) : null}

                                                    {canMarkPickupProduct ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAction(request._id, "mark_pickup_product")}
                                                            disabled={isUpdating}
                                                            className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Pick Up Product
                                                        </button>
                                                    ) : null}

                                                    {canMarkManualPending ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAction(request._id, "mark_manual_pending")}
                                                            disabled={isUpdating}
                                                            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Start Manual Refund
                                                        </button>
                                                    ) : null}

                                                    {canCompleteRefund ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAction(request._id, "mark_refund_completed")}
                                                            disabled={isUpdating}
                                                            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Mark Refund Completed
                                                        </button>
                                                    ) : null}

                                                    {!canApproveRefund &&
                                                    !canApproveReplacement &&
                                                    !canReject &&
                                                    !canMarkPickupProduct &&
                                                    !canMarkManualPending &&
                                                    !canCompleteRefund ? (
                                                        <span className="text-xs font-medium text-slate-400">
                                                            No further action required
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReturnsPage;
