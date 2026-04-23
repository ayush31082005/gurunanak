import React from "react";

const statusStyles = {
    Delivered: "bg-emerald-100 text-emerald-700",
    Processing: "bg-amber-100 text-amber-700",
    Shipped: "bg-sky-100 text-sky-700",
    Pending: "bg-rose-100 text-rose-700",
    Paid: "bg-[#0EA5E9]/15 text-[#0EA5E9]",
    "Cash on Delivery": "bg-violet-100 text-violet-700",
    COD: "bg-violet-100 text-violet-700",
    Replacement: "bg-sky-100 text-sky-700",
    "Razorpay Paid": "bg-emerald-100 text-emerald-700",
    "Awaiting Payment": "bg-amber-100 text-amber-700",
    "Pick Product": "bg-orange-100 text-orange-700",
    "Out For Delivery": "bg-sky-100 text-sky-700",
    Placed: "bg-[#0EA5E9]/15 text-[#0EA5E9]",
    Cancelled: "bg-slate-200 text-slate-700",
    "Pending Review": "bg-orange-100 text-orange-700",
    Approved: "bg-[#0EA5E9]/15 text-[#0EA5E9]",
    "Low Stock": "bg-orange-100 text-orange-700",
    "In Stock": "bg-[#0EA5E9]/15 text-[#0EA5E9]",
    "Out of Stock": "bg-rose-100 text-rose-700",
    pending: "bg-rose-100 text-rose-700",
    approved: "bg-emerald-100 text-emerald-700",
    picked_up: "bg-orange-100 text-orange-700",
    placed: "bg-[#0EA5E9]/15 text-[#0EA5E9]",
    shipped: "bg-sky-100 text-sky-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-slate-200 text-slate-700",
    payment_pending: "bg-amber-100 text-amber-700",
    pick_product: "bg-orange-100 text-orange-700",
    cod: "bg-violet-100 text-violet-700",
    card: "bg-[#0EA5E9]/15 text-[#0EA5E9]",
    upi: "bg-[#0EA5E9]/15 text-[#0EA5E9]",
    out_for_delivery: "bg-sky-100 text-sky-700",
    submitted: "bg-orange-100 text-orange-700",
    reviewed: "bg-sky-100 text-sky-700",
    processed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    refund: "bg-emerald-100 text-emerald-700",
    replacement: "bg-sky-100 text-sky-700",
    refund_completed: "bg-emerald-100 text-emerald-700",
    replacement_created: "bg-sky-100 text-sky-700",
    not_applicable: "bg-slate-100 text-slate-600",
    not_requested: "bg-slate-100 text-slate-600",
    manual_pending: "bg-amber-100 text-amber-700",
    manual_completed: "bg-emerald-100 text-emerald-700",
    replacement_order: "bg-sky-100 text-sky-700",
};

const StatusBadge = ({ text }) => {
    const displayText = String(text || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[text] || "bg-slate-100 text-slate-700"
                }`}
        >
            {displayText}
        </span>
    );
};

export default StatusBadge;
