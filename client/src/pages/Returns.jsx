import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";
import { useToast } from "../context/ToastContext";

const RETURN_WINDOW_DAYS = 7;

const formatPrice = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const getItemsTotal = (items = []) =>
    items.reduce(
        (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
        0
    );

const getRefundableAmount = (order) => {
    const itemsTotal = getItemsTotal(order?.items);

    if (order?.orderType === "replacement") {
        return itemsTotal;
    }

    const orderTotal = Number(order?.total) || 0;
    return orderTotal > 0 ? orderTotal : itemsTotal;
};

const getReturnItemName = (item = {}) =>
    item.name ||
    item.title ||
    item.productName ||
    item.medicineName ||
    item.product?.name ||
    "Product";

const buildInitialSelectedItems = (items = []) =>
    items.reduce((selection, item, index) => {
        selection[index] = {
            selected: true,
            quantity: Math.max(Number(item?.quantity) || 1, 1),
        };
        return selection;
    }, {});

const getDeliveredAt = (order) => {
    if (order?.deliveredAt) {
        return new Date(order.deliveredAt);
    }

    const deliveredEntry = [...(order?.tracking || [])]
        .reverse()
        .find((entry) => String(entry?.status || "").toLowerCase() === "delivered");

    if (deliveredEntry?.timestamp) {
        return new Date(deliveredEntry.timestamp);
    }

    return order?.status === "delivered" && order?.updatedAt
        ? new Date(order.updatedAt)
        : null;
};

const getReturnDeadline = (order) => {
    const deliveredAt = getDeliveredAt(order);

    if (!deliveredAt) {
        return null;
    }

    const deadline = new Date(deliveredAt);
    deadline.setDate(deadline.getDate() + RETURN_WINDOW_DAYS);
    return deadline;
};

const getReturnBlockReason = (order) => {
    if (!order) {
        return "Select a delivered order to continue.";
    }

    if (String(order.status || "").toLowerCase() !== "delivered") {
        return "Only delivered orders are eligible for return or replacement.";
    }

    if (order.isReturnRequested) {
        return "A return request has already been submitted for this order.";
    }

    const deadline = getReturnDeadline(order);

    if (!deadline) {
        return "Delivered date is unavailable for this order.";
    }

    if (Date.now() > deadline.getTime()) {
        return "This order is outside the 7 day return window.";
    }

    return "";
};

const Returns = () => {
    const navigate = useNavigate();
    const { success: showSuccessToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [form, setForm] = useState({
        orderId: searchParams.get("orderId") || "",
        type: "refund",
        reason: "",
    });
    const [previewUrl, setPreviewUrl] = useState("");
    const [proofFile, setProofFile] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});

    const loadData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const ordersResponse = await API.get("/orders/my");

            const nextOrders = Array.isArray(ordersResponse.data?.orders)
                ? ordersResponse.data.orders
                : [];

            setOrders(nextOrders);
        } catch (error) {
            setOrders([]);
            setErrorMessage(error?.response?.data?.message || "Failed to load return data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const eligibleOrders = useMemo(
        () => orders.filter((order) => !getReturnBlockReason(order)),
        [orders]
    );

    useEffect(() => {
        if (!orders.length) {
            return;
        }

        const requestedOrderId = searchParams.get("orderId");
        const fallbackOrderId = eligibleOrders[0]?._id || "";
        const nextOrderId =
            requestedOrderId && orders.some((order) => order._id === requestedOrderId)
                ? requestedOrderId
                : fallbackOrderId;

        setForm((currentForm) => ({
            ...currentForm,
            orderId:
                currentForm.orderId &&
                eligibleOrders.some((order) => order._id === currentForm.orderId)
                ? currentForm.orderId
                : nextOrderId,
        }));

        if (requestedOrderId !== nextOrderId) {
            setSearchParams(nextOrderId ? { orderId: nextOrderId } : {}, { replace: true });
        }
    }, [eligibleOrders, orders, searchParams, setSearchParams]);

    const selectedOrder = useMemo(
        () => orders.find((order) => order._id === form.orderId) || null,
        [form.orderId, orders]
    );
    const requestedOrderId = searchParams.get("orderId") || "";
    const isLockedToRequestedOrder =
        Boolean(requestedOrderId) && selectedOrder?._id === requestedOrderId;

    const blockedReason = getReturnBlockReason(selectedOrder);
    const deadline = getReturnDeadline(selectedOrder);

    useEffect(() => {
        if (!selectedOrder?.items?.length) {
            setSelectedItems({});
            return;
        }

        setSelectedItems(buildInitialSelectedItems(selectedOrder.items));
    }, [selectedOrder?._id]);

    const selectedReturnItems = useMemo(() => {
        if (!selectedOrder?.items?.length) {
            return [];
        }

        return selectedOrder.items
            .map((item, index) => {
                const currentSelection = selectedItems[index];

                if (!currentSelection?.selected) {
                    return null;
                }

                const maxQuantity = Math.max(Number(item?.quantity) || 1, 1);
                const nextQuantity = Math.min(
                    Math.max(Number(currentSelection.quantity) || 1, 1),
                    maxQuantity
                );

                return {
                    index,
                    name: getReturnItemName(item),
                    price: Number(item.price) || 0,
                    quantity: nextQuantity,
                    maxQuantity,
                    pack: item.pack || "",
                    image: item.image || "",
                };
            })
            .filter(Boolean);
    }, [selectedItems, selectedOrder]);

    const selectedRefundableAmount = useMemo(
        () =>
            selectedReturnItems.reduce(
                (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
                0
            ),
        [selectedReturnItems]
    );

    const handleOrderChange = (event) => {
        const nextOrderId = event.target.value;

        setForm((currentForm) => ({
            ...currentForm,
            orderId: nextOrderId,
        }));

        setSearchParams(nextOrderId ? { orderId: nextOrderId } : {}, { replace: true });
        setErrorMessage("");
    };

    const handleItemSelectionChange = (index) => {
        setSelectedItems((currentSelection) => ({
            ...currentSelection,
            [index]: {
                ...currentSelection[index],
                selected: !currentSelection[index]?.selected,
            },
        }));
        setErrorMessage("");
    };

    const handleItemQuantityChange = (index, value, maxQuantity) => {
        const parsedQuantity = Math.min(
            Math.max(Number(value) || 1, 1),
            Math.max(Number(maxQuantity) || 1, 1)
        );

        setSelectedItems((currentSelection) => ({
            ...currentSelection,
            [index]: {
                ...currentSelection[index],
                quantity: parsedQuantity,
            },
        }));
        setErrorMessage("");
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl("");
            setProofFile(null);
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(URL.createObjectURL(file));
        setProofFile(file);
        setErrorMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedOrder) {
            setErrorMessage("Select an order before submitting your request.");
            return;
        }

        if (blockedReason) {
            setErrorMessage(blockedReason);
            return;
        }

        if (!selectedReturnItems.length) {
            setErrorMessage("Select at least one product to continue with the return request.");
            return;
        }

        if (!proofFile) {
            setErrorMessage("Upload a proof image before submitting your request.");
            return;
        }

        try {
            setSubmitting(true);
            setErrorMessage("");

            const formData = new FormData();
            formData.append("orderId", selectedOrder._id);
            formData.append("reason", form.reason);
            formData.append("type", form.type);
            formData.append(
                "selectedItems",
                JSON.stringify(
                    selectedReturnItems.map((item) => ({
                        index: item.index,
                        quantity: item.quantity,
                    }))
                )
            );
            formData.append("file", proofFile);

            const { data } = await API.post("/returns", formData);

            if (data?.success) {
                showSuccessToast("Return request submitted successfully.", {
                    title: "Return Request Submitted",
                });
                setOrders((currentOrders) =>
                    currentOrders.map((order) =>
                        order._id === selectedOrder._id
                            ? {
                                ...order,
                                isReturnRequested: true,
                                returnStatus: "pending",
                                refundStatus: form.type === "refund" ? "pending" : "not_applicable",
                            }
                            : order
                    )
                );
                setForm((currentForm) => ({
                    ...currentForm,
                    orderId: "",
                    reason: "",
                }));
                setProofFile(null);
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl("");
            }
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || "Failed to submit return request");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    return (
        <section className="bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_32%,#f8fafc_100%)] py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-[32px] border border-orange-100 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0EA5E9]">
                                Returns & Replacements
                            </p>
                            <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                                Raise a request within 7 days of delivery
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                Your order details are auto-filled from delivered orders. Upload a proof image, choose refund or replacement, and our team will review it manually.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/user-dashboard?tab=orders")}
                            className="inline-flex items-center justify-center rounded-none border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Back to Orders
                        </button>
                    </div>

                    {loading ? (
                        <div className="mt-8 rounded-none bg-slate-50 p-8 text-center text-slate-500">
                            Loading return details...
                        </div>
                    ) : (
                        <div className="mt-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="rounded-none border border-slate-200 bg-slate-50/80 p-5">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Eligible order
                                    </label>
                                    {isLockedToRequestedOrder && selectedOrder ? (
                                        <div className="rounded-none border border-slate-200 bg-white px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-900">
                                                #{String(selectedOrder._id).slice(-8).toUpperCase()} | {formatPrice(getRefundableAmount(selectedOrder))}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                This return request is locked to the order you selected from your orders page.
                                            </p>
                                        </div>
                                    ) : (
                                        <select
                                            value={form.orderId}
                                            onChange={handleOrderChange}
                                            className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0EA5E9]"
                                        >
                                            {eligibleOrders.length ? (
                                                eligibleOrders.map((order) => (
                                                    <option key={order._id} value={order._id}>
                                                        #{String(order._id).slice(-8).toUpperCase()} | {formatPrice(getRefundableAmount(order))}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="">No eligible delivered orders found</option>
                                            )}
                                        </select>
                                    )}

                                    {blockedReason ? (
                                        <p className="mt-3 text-sm font-medium text-rose-600">{blockedReason}</p>
                                    ) : deadline ? (
                                        <p className="mt-3 text-sm text-slate-500">
                                            Return window closes on {deadline.toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="grid gap-5 rounded-none border border-slate-200 bg-white p-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Order ID
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={selectedOrder?._id || ""}
                                            className="w-full rounded-none border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Request type
                                        </label>
                                        <select
                                            value={form.type}
                                            onChange={(event) =>
                                                setForm((currentForm) => ({
                                                    ...currentForm,
                                                    type: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0EA5E9]"
                                        >
                                            <option value="refund">Refund</option>
                                            <option value="replacement">Replacement</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Select products to return
                                        </label>
                                        <div className="rounded-none border border-slate-200 bg-slate-50 px-4 py-4">
                                            {selectedOrder?.items?.length ? (
                                                <div className="space-y-3">
                                                    {selectedOrder.items.map((item, index) => (
                                                        <div
                                                            key={`${selectedOrder._id}-${item.productId || index}`}
                                                            className="flex flex-col gap-3 border-b border-slate-200 pb-3 last:border-0 last:pb-0"
                                                        >
                                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                <label className="flex items-start gap-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={Boolean(selectedItems[index]?.selected)}
                                                                        onChange={() => handleItemSelectionChange(index)}
                                                                        className="mt-1 h-4 w-4 rounded-none border-slate-300 text-[#0EA5E9] focus:ring-[#0EA5E9]"
                                                                    />
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-slate-900">
                                                                            {item.name}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500">
                                                                            Ordered Qty: {item.quantity || 1}
                                                                            {item.pack ? ` | ${item.pack}` : ""}
                                                                        </p>
                                                                    </div>
                                                                </label>
                                                                <p className="text-sm font-bold text-[#0EA5E9]">
                                                                    {formatPrice(item.price)}
                                                                </p>
                                                            </div>

                                                            {Number(item.quantity) > 1 ? (
                                                                <div className="sm:max-w-[220px]">
                                                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                        Return quantity
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max={item.quantity}
                                                                        value={selectedItems[index]?.quantity || 1}
                                                                        onChange={(event) =>
                                                                            handleItemQuantityChange(
                                                                                index,
                                                                                event.target.value,
                                                                                item.quantity
                                                                            )
                                                                        }
                                                                        disabled={!selectedItems[index]?.selected}
                                                                        className="w-full rounded-none border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0EA5E9] disabled:cursor-not-allowed disabled:bg-slate-100"
                                                                    />
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500">
                                                    Product information will appear here.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Refundable amount
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={selectedOrder ? formatPrice(selectedRefundableAmount) : ""}
                                            className="w-full rounded-none border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Delivered on
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={
                                                selectedOrder
                                                    ? getDeliveredAt(selectedOrder)?.toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    }) || ""
                                                    : ""
                                            }
                                            className="w-full rounded-none border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Reason
                                        </label>
                                        <textarea
                                            value={form.reason}
                                            onChange={(event) =>
                                                setForm((currentForm) => ({
                                                    ...currentForm,
                                                    reason: event.target.value,
                                                }))
                                            }
                                            rows="5"
                                            placeholder="Describe what went wrong with this order"
                                            className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0EA5E9]"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Proof image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            onChange={handleFileChange}
                                            className="block w-full rounded-none border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600"
                                            required
                                        />

                                        {previewUrl ? (
                                            <div className="mt-4 overflow-hidden rounded-none border border-slate-200 bg-white">
                                                <img
                                                    src={previewUrl}
                                                    alt="Return proof preview"
                                                    className="h-64 w-full object-cover"
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {errorMessage ? (
                                    <div className="rounded-none border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                                        {errorMessage}
                                    </div>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={submitting || Boolean(blockedReason) || !selectedOrder}
                                    className="inline-flex rounded-none bg-[#0EA5E9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0284C7] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? "Submitting..." : "Submit Return Request"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Returns;
