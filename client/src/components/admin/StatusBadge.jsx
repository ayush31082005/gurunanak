import React from "react";

const statusStyles = {
    Delivered: "bg-[#ff6f61]/15 text-[#ff6f61]",
    Processing: "bg-amber-100 text-amber-700",
    Shipped: "bg-sky-100 text-sky-700",
    Pending: "bg-rose-100 text-rose-700",
    Paid: "bg-[#ff6f61]/15 text-[#ff6f61]",
    COD: "bg-violet-100 text-violet-700",
    "Pending Review": "bg-orange-100 text-orange-700",
    Approved: "bg-[#ff6f61]/15 text-[#ff6f61]",
    "Low Stock": "bg-orange-100 text-orange-700",
    "In Stock": "bg-[#ff6f61]/15 text-[#ff6f61]",
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
