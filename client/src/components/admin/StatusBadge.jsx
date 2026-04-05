import React from "react";

const statusStyles = {
    Delivered: "bg-[#87CEEB]/15 text-[#87CEEB]",
    Processing: "bg-amber-100 text-amber-700",
    Shipped: "bg-sky-100 text-sky-700",
    Pending: "bg-rose-100 text-rose-700",
    Paid: "bg-[#87CEEB]/15 text-[#87CEEB]",
    COD: "bg-violet-100 text-violet-700",
    "Pending Review": "bg-orange-100 text-orange-700",
    Approved: "bg-[#87CEEB]/15 text-[#87CEEB]",
    "Low Stock": "bg-orange-100 text-orange-700",
    "In Stock": "bg-[#87CEEB]/15 text-[#87CEEB]",
    "Out of Stock": "bg-rose-100 text-rose-700",
    pending: "bg-rose-100 text-rose-700",
    placed: "bg-[#87CEEB]/15 text-[#87CEEB]",
    shipped: "bg-sky-100 text-sky-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-slate-200 text-slate-700",
    payment_pending: "bg-amber-100 text-amber-700",
    cod: "bg-violet-100 text-violet-700",
    card: "bg-[#87CEEB]/15 text-[#87CEEB]",
    upi: "bg-[#87CEEB]/15 text-[#87CEEB]",
    submitted: "bg-orange-100 text-orange-700",
    reviewed: "bg-sky-100 text-sky-700",
    processed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
};

const StatusBadge = ({ text }) => {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[text] || "bg-slate-100 text-slate-700"
                }`}
        >
            {text}
        </span>
    );
};

export default StatusBadge;
