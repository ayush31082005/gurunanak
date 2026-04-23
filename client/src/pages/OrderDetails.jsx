import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    BadgeIndianRupee,
    CheckCircle2,
    Clock3,
    CreditCard,
    Download,
    Home,
    MapPin,
    Package2,
    Phone,
    RefreshCcw,
    ShoppingBag,
    Truck,
    UserRound,
} from "lucide-react";
import { jsPDF } from "jspdf";
import API from "../api";

const formatPrice = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
const formatDisplayDate = (value, options = {}) =>
    value
        ? new Date(value).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            ...options,
        })
        : "N/A";
const formatDisplayDateTime = (value) =>
    value
        ? new Date(value).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
        : "N/A";
const numberToWords = (value) => {
    const units = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
    ];
    const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
    ];

    const toWordsUnderThousand = (num) => {
        if (num === 0) return "";
        if (num < 20) return units[num];
        if (num < 100) {
            return `${tens[Math.floor(num / 10)]}${num % 10 ? ` ${units[num % 10]}` : ""}`;
        }
        return `${units[Math.floor(num / 100)]} Hundred${num % 100 ? ` ${toWordsUnderThousand(num % 100)}` : ""}`;
    };

    const safeValue = Math.max(0, Math.floor(Number(value) || 0));
    if (safeValue === 0) return "Zero Rupees Only";

    const parts = [];
    const crore = Math.floor(safeValue / 10000000);
    const lakh = Math.floor((safeValue % 10000000) / 100000);
    const thousand = Math.floor((safeValue % 100000) / 1000);
    const remainder = safeValue % 1000;

    if (crore) parts.push(`${toWordsUnderThousand(crore)} Crore`);
    if (lakh) parts.push(`${toWordsUnderThousand(lakh)} Lakh`);
    if (thousand) parts.push(`${toWordsUnderThousand(thousand)} Thousand`);
    if (remainder) parts.push(toWordsUnderThousand(remainder));

    return `${parts.join(" ").trim()} Rupees Only`;
};

const downloadInvoicePdf = (order, helpers) => {
    const { humanize, getDisplayStatus } = helpers;
    const orderId = String(order?._id || "").slice(-8).toUpperCase();
    const invoiceNumber = `INV-${orderId || "00000000"}`;
    const issueDate = order?.deliveredAt || order?.createdAt;
    const amountInWords = numberToWords(order?.total);
    const shippingAddress = [
        order?.shippingInfo?.address,
        order?.shippingInfo?.city,
        order?.shippingInfo?.state,
        order?.shippingInfo?.pincode,
    ]
        .filter(Boolean)
        .join(", ");
    const doc = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
    });
    doc.setDisplayMode("fullwidth", "single", "UseOutlines");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 32;
    const contentWidth = pageWidth - margin * 2;
    const headerRightWidth = 170;
    const headerRightX = pageWidth - margin - headerRightWidth;
    const headerLeftWidth = headerRightX - margin - 18;
    let y = margin;
    const colors = {
        text: [30, 41, 59],
        heading: [15, 41, 66],
        muted: [100, 116, 139],
        softBorder: [223, 231, 239],
        panel: [248, 251, 253],
        tableHead: [237, 244, 248],
        accent: [135, 206, 235],
    };

    const ensureSpace = (heightNeeded) => {
        if (y + heightNeeded <= pageHeight - 36) {
            return;
        }
        doc.addPage();
        y = margin;
    };

    const drawText = (text, x, yPos, options = {}) => {
        const {
            size = 11,
            color = colors.text,
            style = "normal",
            align = "left",
            maxWidth,
            lineHeightFactor = 1.25,
        } = options;

        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.setLineHeightFactor(lineHeightFactor);

        if (maxWidth) {
            const lines = doc.splitTextToSize(String(text), maxWidth);
            doc.text(lines, x, yPos, { align });
            return lines.length;
        }

        doc.text(String(text), x, yPos, { align });
        return 1;
    };

    const getWrappedLines = (value, width, size = 11) => {
        doc.setFontSize(size);
        return doc.splitTextToSize(String(value || "N/A"), width);
    };

    const drawTableHeader = () => {
        const top = y;
        doc.setDrawColor(...colors.softBorder);
        doc.line(margin, top, pageWidth - margin, top);
        const columns = [
            { label: "#", x: margin + 10 },
            { label: "Product Description", x: margin + 44 },
            { label: "Qty", x: margin + 330 },
            { label: "Unit Price", x: margin + 388 },
            { label: "Net Amount", x: margin + 478 },
        ];

        columns.forEach((column) => {
            drawText(column.label, column.x, top + 18, {
                size: 8,
                style: "bold",
                color: [51, 65, 85],
            });
        });
        doc.line(margin, top + 24, pageWidth - margin, top + 24);
        y += 30;
    };

    drawText("ORIGINAL FOR RECIPIENT", margin + 14, y + 19, {
        size: 8,
        style: "bold",
        color: colors.muted,
    });
    drawText(`Generated on ${formatDisplayDateTime(new Date())}`, pageWidth - margin - 14, y + 19, {
        size: 8,
        color: colors.muted,
        align: "right",
    });
    doc.setDrawColor(...colors.softBorder);
    doc.line(margin, y + 28, pageWidth - margin, y + 28);
    y += 48;

    drawText("GURUNANAK PHARMACY", margin, y, {
        size: 24,
        style: "bold",
        color: colors.heading,
    });
    drawText("TAX INVOICE", margin, y + 18, {
        size: 11,
        style: "bold",
        color: [71, 85, 105],
    });
    drawText(
        [
            "Gurunanak Pharmacy",
            "Mirzapur, Uttar Pradesh, India",
            "Email: support@gurunanakpharmacy.com",
            "Phone: +91 8000 000 000",
        ],
        margin,
        y + 38,
        {
            size: 10.5,
            color: colors.muted,
            maxWidth: headerLeftWidth,
        }
    );

    drawText("INVOICE NUMBER", headerRightX, y + 6, {
        size: 8,
        style: "bold",
        color: colors.muted,
    });
    drawText(invoiceNumber, headerRightX, y + 30, {
        size: 17,
        style: "bold",
        color: colors.heading,
        maxWidth: headerRightWidth,
    });
    drawText(`Order #${orderId}`, headerRightX, y + 52, {
        size: 10.5,
        color: [71, 85, 105],
        maxWidth: headerRightWidth,
    });
    drawText(`Issue Date: ${formatDisplayDate(issueDate)}`, headerRightX, y + 70, {
        size: 10.5,
        color: [71, 85, 105],
        maxWidth: headerRightWidth,
    });
    doc.line(margin, y + 92, pageWidth - margin, y + 92);
    y += 112;

    const metaColumns = 4;
    const metaWidth = contentWidth / metaColumns;
    const metaTop = y;
    const metaItems = [
        ["Order Date", formatDisplayDate(order?.createdAt)],
        ["Payment Method", humanize(order?.paymentMethod || "cod")],
        ["Order Status", getDisplayStatus(order)],
        ["Delivery Date", formatDisplayDate(order?.deliveredAt || order?.createdAt)],
    ];

    doc.line(margin, metaTop, pageWidth - margin, metaTop);
    metaItems.forEach(([label, value], index) => {
        const boxX = margin + metaWidth * index;
        drawText(label, boxX + 12, metaTop + 16, {
            size: 8,
            style: "bold",
            color: [123, 147, 168],
        });
        drawText(value, boxX + 12, metaTop + 34, {
            size: 10.5,
            color: [30, 41, 59],
            maxWidth: metaWidth - 24,
        });
        if (index < metaItems.length - 1) {
            doc.line(boxX + metaWidth, metaTop + 8, boxX + metaWidth, metaTop + 44);
        }
    });
    doc.line(margin, metaTop + 52, pageWidth - margin, metaTop + 52);
    y += 68;

    const blockGap = 14;
    const blockWidth = (contentWidth - blockGap * 2) / 3;
    const blockTop = y;
    const partySections = [
        {
            title: "SOLD BY",
            x: margin,
            lines: [
                "Gurunanak Pharmacy",
                "Mirzapur, Uttar Pradesh",
                "India",
                "GST/Tax details available on request",
            ],
        },
        {
            title: "BILL TO",
            x: margin + blockWidth + blockGap,
            lines: [
                order?.shippingInfo?.fullName || "Customer",
                order?.shippingInfo?.email || "N/A",
                order?.shippingInfo?.phone || "N/A",
            ],
        },
        {
            title: "SHIP TO",
            x: margin + (blockWidth + blockGap) * 2,
            lines: [
                order?.shippingInfo?.fullName || "Customer",
                shippingAddress || "N/A",
            ],
        },
    ];
    const partyHeights = partySections.map((section) => {
        const wrapped = section.lines.flatMap((line) => getWrappedLines(line, blockWidth - 8, 10.5));
        return 26 + wrapped.length * 13;
    });
    const partyHeight = Math.max(...partyHeights, 72);
    doc.line(margin, blockTop, pageWidth - margin, blockTop);
    partySections.forEach((section, index) => {
        drawText(section.title, section.x + 2, blockTop + 14, {
            size: 8,
            style: "bold",
            color: [123, 147, 168],
        });
        drawText(section.lines, section.x + 2, blockTop + 32, {
            size: 10.5,
            maxWidth: blockWidth - 8,
        });
        if (index < partySections.length - 1) {
            doc.line(section.x + blockWidth + blockGap / 2, blockTop + 6, section.x + blockWidth + blockGap / 2, blockTop + partyHeight);
        }
    });
    doc.line(margin, blockTop + partyHeight + 8, pageWidth - margin, blockTop + partyHeight + 8);
    y += partyHeight + 26;

    ensureSpace(100);
    drawTableHeader();

    (order?.items || []).forEach((item, index) => {
        const quantity = Number(item?.quantity) || 1;
        const unitPrice = Number(item?.price) || 0;
        const lineTotal = quantity * unitPrice;
        const description = `${item?.name || "Product"}${item?.pack ? ` (${item.pack})` : " (Standard pack)"}`;
        const descriptionLines = getWrappedLines(description, 274, 10.5);
        const rowHeight = Math.max(34, descriptionLines.length * 14 + 12);

        ensureSpace(rowHeight + 24);
        if (y === margin) {
            drawTableHeader();
        }

        doc.setDrawColor(230, 238, 245);
        drawText(index + 1, margin + 10, y + 20, { size: 10.5 });
        drawText(descriptionLines, margin + 44, y + 16, {
            size: 10.5,
            maxWidth: 274,
        });
        drawText(quantity, margin + 330, y + 20, { size: 10.5 });
        drawText(formatPrice(unitPrice), margin + 388, y + 20, { size: 10.5 });
        drawText(formatPrice(lineTotal), margin + 478, y + 20, { size: 10.5 });
        doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
        y += rowHeight;
    });

    y += 22;
    const amountWordsWidth = contentWidth - 260 - 24;
    const amountWordLines = getWrappedLines(amountInWords, amountWordsWidth, 10.5);
    const amountWordsHeight = 34 + amountWordLines.length * 13;
    const totalsHeight = 126;
    const summaryHeight = Math.max(amountWordsHeight, totalsHeight);

    ensureSpace(summaryHeight + 36);

    drawText("AMOUNT IN WORDS", margin + 14, y + 18, {
        size: 8,
        style: "bold",
        color: [123, 147, 168],
    });
    drawText(amountWordLines, margin + 14, y + 40, {
        size: 10.5,
        style: "bold",
        maxWidth: amountWordsWidth,
    });

    const totalsWidth = 236;
    const totalsX = pageWidth - margin - totalsWidth;
    const totals = [
        ["Subtotal", formatPrice(order?.subtotal)],
        ["Discount", formatPrice(order?.discount)],
        ["Shipping Charges", "Free"],
    ];

    doc.line(totalsX, y, totalsX, y + summaryHeight);
    totals.forEach(([label, value], index) => {
        const rowY = y + 18 + index * 22;
        drawText(label, totalsX + 16, rowY, { size: 10.5 });
        drawText(value, totalsX + totalsWidth - 2, rowY, {
            size: 10.5,
            style: "bold",
            align: "right",
        });
    });
    doc.setDrawColor(207, 224, 234);
    doc.line(totalsX + 16, y + 76, totalsX + totalsWidth, y + 76);
    drawText("Total Amount", totalsX + 16, y + 102, {
        size: 13,
        style: "bold",
        color: colors.heading,
    });
    drawText(formatPrice(order?.total), totalsX + totalsWidth, y + 102, {
        size: 13,
        style: "bold",
        color: colors.heading,
        align: "right",
    });
    doc.line(margin, y + summaryHeight + 10, pageWidth - margin, y + summaryHeight + 10);
    y += summaryHeight + 20;

    ensureSpace(120);
    const declarationWidth = contentWidth - 220 - 24;
    const declarationLines = getWrappedLines(
        "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct to the best of our knowledge.",
        declarationWidth,
        10.5
    );
    const declarationHeight = Math.max(92, 34 + declarationLines.length * 13);
    drawText("DECLARATION", margin + 14, y + 18, {
        size: 8,
        style: "bold",
        color: [123, 147, 168],
    });
    drawText(declarationLines, margin + 14, y + 36, {
        size: 10.5,
        maxWidth: declarationWidth,
    });

    const signatureWidth = 220;
    const signatureX = pageWidth - margin - signatureWidth;
    doc.line(signatureX, y + 6, signatureX, y + declarationHeight);
    drawText("AUTHORIZED SIGNATORY", signatureX + 14, y + 18, {
        size: 8,
        style: "bold",
        color: [123, 147, 168],
    });
    drawText("For Gurunanak Pharmacy", signatureX + signatureWidth - 14, y + 50, {
        size: 10.5,
        align: "right",
    });
    drawText("Digitally generated document", signatureX + signatureWidth - 14, y + declarationHeight - 16, {
        size: 9,
        color: colors.muted,
        align: "right",
    });
    doc.line(margin, y + declarationHeight + 8, pageWidth - margin, y + declarationHeight + 8);
    y += declarationHeight + 20;

    drawText(
        `Need help with this invoice? Contact Gurunanak Pharmacy support and share invoice number ${invoiceNumber}.`,
        margin,
        y,
        {
            size: 9,
            color: colors.muted,
            maxWidth: contentWidth,
        }
    );

    doc.save(`invoice-${invoiceNumber}.pdf`);
};

const statusConfig = {
    pending: {
        label: "Order Placed",
        description: "Your order has been received and is waiting for confirmation.",
        icon: Clock3,
    },
    payment_pending: {
        label: "Awaiting Payment",
        description: "We are waiting for payment confirmation for this order.",
        icon: CreditCard,
    },
    placed: {
        label: "Confirmed",
        description: "Your order has been confirmed and is now being prepared.",
        icon: CheckCircle2,
    },
    shipped: {
        label: "Shipped",
        description: "Your package has left our pharmacy and is on the way.",
        icon: Truck,
    },
    delivered: {
        label: "Delivered",
        description: "Your order has been delivered successfully.",
        icon: Home,
    },
    pick_product: {
        label: "Pick Product",
        description: "Your replacement item is being picked from inventory.",
        icon: ShoppingBag,
    },
    out_for_delivery: {
        label: "Out for Delivery",
        description: "Your replacement order is out for delivery.",
        icon: MapPin,
    },
    cancelled: {
        label: "Cancelled",
        description: "This order was cancelled before delivery.",
        icon: Package2,
    },
};

const returnStatusConfig = {
    pending: {
        label: "Returning",
        description: "Your return request has been submitted and is waiting for review.",
        icon: RefreshCcw,
    },
    approved: {
        label: "Return Approved",
        description: "Your return request has been approved by our team.",
        icon: CheckCircle2,
    },
    pickup_product: {
        label: "Pick Up Product",
        description: "Our pickup partner will collect the returned product from you.",
        icon: ShoppingBag,
    },
    manual_pending: {
        label: "Refund In Process",
        description: "Your approved refund is being processed manually.",
        icon: RefreshCcw,
    },
    refund_completed: {
        label: "Refund Completed",
        description: "Your refund has been completed successfully.",
        icon: CheckCircle2,
    },
    replacement_created: {
        label: "Replacement Created",
        description: "A replacement order has been created for this return request.",
        icon: Package2,
    },
    rejected: {
        label: "Return Rejected",
        description: "Your return request was reviewed and rejected.",
        icon: Package2,
    },
};

const trackingSequence = ["pending", "payment_pending", "placed", "shipped", "out_for_delivery", "delivered"];

const humanize = (value = "") =>
    String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const getNormalizedOrderStatus = (order) => {
    const rawStatus = String(order?.status || "").toLowerCase();
    const paymentMethod = String(order?.paymentMethod || "").toLowerCase();

    if (paymentMethod === "cod" && ["pending", "payment_pending"].includes(rawStatus)) {
        return "placed";
    }

    return rawStatus || "pending";
};

const getDisplayStatus = (order) => {
    if (order?.isReturnRequested) {
        return `Return ${humanize(order.returnStatus || "pending")}`;
    }

    const normalizedStatus = getNormalizedOrderStatus(order);

    if (normalizedStatus === "payment_pending") {
        return "Awaiting Payment";
    }

    return humanize(normalizedStatus);
};

const getReturnStepTimestamp = (order, stepKey) => {
    const returnRequest = order?.returnRequest || {};
    const requestedAt =
        returnRequest?.requestedAt || returnRequest?.createdAt || order?.updatedAt || null;
    const processedAt =
        returnRequest?.processedAt || returnRequest?.updatedAt || order?.updatedAt || null;
    const pickedUpAt =
        returnRequest?.pickedUpAt || returnRequest?.updatedAt || order?.updatedAt || null;
    const manualPendingAt =
        returnRequest?.manualPendingAt || returnRequest?.updatedAt || order?.updatedAt || null;
    const refundCompletedAt =
        returnRequest?.refundCompletedAt || processedAt || order?.updatedAt || null;

    switch (stepKey) {
        case "pending":
            return requestedAt;
        case "approved":
            return processedAt;
        case "pickup_product":
            return pickedUpAt;
        case "manual_pending":
            return manualPendingAt;
        case "refund_completed":
            return refundCompletedAt;
        case "replacement_created":
            return processedAt;
        case "rejected":
            return processedAt;
        default:
            return order?.updatedAt || null;
    }
};

const getDeliveredTimestamp = (order) => {
    if (order?.deliveredAt) {
        return order.deliveredAt;
    }

    const deliveredTrackingEntry = [...(order?.tracking || [])]
        .reverse()
        .find((entry) => String(entry?.status || "").toLowerCase() === "delivered");

    return deliveredTrackingEntry?.timestamp || null;
};

const getNormalizedTrackingEntries = (tracking = []) =>
    tracking.map((entry) => ({
        ...entry,
        normalizedStatus: String(entry?.status || "").toLowerCase(),
    }));

const getFallbackStepTimestamp = ({
    order,
    sequence = [],
    status,
    index,
    currentIndex,
    trackingEntries = [],
}) => {
    if (index > currentIndex) {
        return null;
    }

    if (status === "pending") {
        return order?.createdAt || null;
    }

    for (let pointer = index + 1; pointer < sequence.length; pointer += 1) {
        const nextStatus = sequence[pointer];
        const nextEntry = trackingEntries.find((entry) => entry.normalizedStatus === nextStatus);

        if (nextEntry?.timestamp) {
            return nextEntry.timestamp;
        }
    }

    return order?.updatedAt || order?.createdAt || null;
};

const buildBaseOrderTrackingSteps = (order, options = {}) => {
    const currentStatus = getNormalizedOrderStatus(order);
    const paymentMethod = String(order?.paymentMethod || "").toLowerCase();
    const trackingEntries = getNormalizedTrackingEntries(
        Array.isArray(order?.tracking) ? order.tracking : []
    );
    const baseSequence =
        paymentMethod === "cod" || paymentMethod === "replacement"
            ? ["pending", "placed", "shipped", "out_for_delivery", "delivered"]
            : trackingSequence;
    const sequence =
        currentStatus === "cancelled" ? ["pending", "placed", "cancelled"] : baseSequence;
    const currentIndex = sequence.indexOf(currentStatus);
    const labelPrefix = options.labelPrefix || "";
    const descriptionPrefix = options.descriptionPrefix || "";

    return sequence.map((status, index) => {
        const config = statusConfig[status] || statusConfig.pending;
        const matchedEntry = trackingEntries.find((entry) => entry.normalizedStatus === status);

        return {
            status: `${options.statusPrefix || ""}${status}`,
            label: `${labelPrefix}${config.label}`,
            description:
                matchedEntry?.message ||
                `${descriptionPrefix}${config.description}`.trim(),
            timestamp:
                matchedEntry?.timestamp ||
                getFallbackStepTimestamp({
                    order,
                    sequence,
                    status,
                    index,
                    currentIndex,
                    trackingEntries,
                }),
            isCompleted: matchedEntry ? true : index <= currentIndex,
            isCurrent: Boolean(options.allowCurrent) && status === currentStatus,
            icon: config.icon,
        };
    });
};

const buildReturnTrackingSteps = (order) => {
    if (!order?.isReturnRequested) {
        return [];
    }

    const returnStatus = String(order?.returnStatus || "pending").toLowerCase();
    const refundStatus = String(order?.refundStatus || "").toLowerCase();
    const returnType = String(order?.returnRequest?.type || "").toLowerCase();
    const isReplacementFlow =
        returnType === "replacement" || refundStatus === "not_applicable";

    if (returnStatus === "rejected" || refundStatus === "rejected") {
        return [
            {
                key: "pending",
                ...returnStatusConfig.pending,
            },
            {
                key: "rejected",
                ...returnStatusConfig.rejected,
            },
        ].map((step, index, steps) => ({
            ...step,
            timestamp: getReturnStepTimestamp(order, step.key),
            isCompleted: index < steps.findIndex((item) => item.key === "rejected"),
            isCurrent: step.key === "rejected",
        }));
    }

    if (isReplacementFlow) {
        const sequence = [
            {
                key: "pending",
                ...returnStatusConfig.pending,
            },
            {
                key: "approved",
                ...returnStatusConfig.approved,
            },
            {
                key: "replacement_created",
                ...returnStatusConfig.replacement_created,
            },
        ];

        const currentKey =
            returnStatus === "replacement_created" ? "replacement_created" : "pending";
        const currentIndex = sequence.findIndex((step) => step.key === currentKey);

        return sequence.map((step, index) => ({
            ...step,
            description:
                step.key === "replacement_created" && order?.returnRequest?.replacementOrder
                    ? `A replacement order #${String(order.returnRequest.replacementOrder).slice(-8).toUpperCase()} has been created for this request.`
                    : step.description,
            timestamp:
                index <= currentIndex || index === currentIndex
                    ? getReturnStepTimestamp(order, step.key)
                    : null,
            isCompleted: index < currentIndex,
            isCurrent: index === currentIndex,
        }));
    }

    const sequence = [
        {
            key: "pending",
            ...returnStatusConfig.pending,
        },
        {
            key: "approved",
            ...returnStatusConfig.approved,
        },
        {
            key: "pickup_product",
            ...returnStatusConfig.pickup_product,
        },
        {
            key: "manual_pending",
            ...returnStatusConfig.manual_pending,
        },
        {
            key: "refund_completed",
            ...returnStatusConfig.refund_completed,
        },
    ];

    let currentKey = "pending";

    if (returnStatus === "refund_completed") {
        currentKey = "refund_completed";
    } else if (refundStatus === "manual_pending") {
        currentKey = "manual_pending";
    } else if (refundStatus === "picked_up") {
        currentKey = "pickup_product";
    } else if (returnStatus === "approved" || refundStatus === "approved") {
        currentKey = "approved";
    }

    const currentIndex = sequence.findIndex((step) => step.key === currentKey);

    return sequence.map((step, index) => ({
        ...step,
        timestamp:
            index <= currentIndex || index === currentIndex
                ? getReturnStepTimestamp(order, step.key)
                : null,
        isCompleted: index < currentIndex,
        isCurrent: index === currentIndex,
    }));
};

const buildTrackingSteps = (order) => {
    const currentStatus = getNormalizedOrderStatus(order);
    const paymentMethod = String(order?.paymentMethod || "").toLowerCase();
    const trackingEntries = getNormalizedTrackingEntries(
        Array.isArray(order?.tracking) ? order.tracking : []
    );

    if (order?.orderType === "replacement") {
        const originalOrderSteps = buildBaseOrderTrackingSteps(order?.originalOrder, {
            statusPrefix: "original_",
            allowCurrent: false,
        }).map((step) => ({
            ...step,
            description:
                step.status === "original_delivered" && order?.originalOrder?._id
                    ? `Original order #${String(order.originalOrder._id).slice(-8).toUpperCase()} was delivered successfully.`
                    : step.description,
        }));

        const replacementCreatedEntry =
            trackingEntries.find((entry) => entry.normalizedStatus === "pending") || trackingEntries[0];
        const placedEntry = trackingEntries.find((entry) => entry.normalizedStatus === "placed");
        const shippedEntry = trackingEntries.find((entry) => entry.normalizedStatus === "shipped");
        const outForDeliveryEntry = trackingEntries.find(
            (entry) => entry.normalizedStatus === "out_for_delivery"
        );
        const deliveredEntry = trackingEntries.find((entry) => entry.normalizedStatus === "delivered");

        const replacementFlowSteps = [
            {
                status: "replacement_created",
                label: "Replacement Created",
                description:
                    replacementCreatedEntry?.message ||
                    "Your replacement order has been created and will now be processed.",
                timestamp: replacementCreatedEntry?.timestamp || order?.createdAt || null,
                isCompleted: true,
                isCurrent: false,
                icon: RefreshCcw,
            },
            {
                status: "replacement_pick_product",
                label: statusConfig.pick_product.label,
                description: statusConfig.pick_product.description,
                timestamp:
                    placedEntry?.timestamp ||
                    shippedEntry?.timestamp ||
                    outForDeliveryEntry?.timestamp ||
                    deliveredEntry?.timestamp ||
                    replacementCreatedEntry?.timestamp ||
                    order?.createdAt ||
                    null,
                isCompleted: ["placed", "shipped", "out_for_delivery", "delivered"].includes(currentStatus),
                isCurrent: currentStatus === "pick_product" || currentStatus === "pending",
                icon: statusConfig.pick_product.icon,
            },
            {
                status: "replacement_placed",
                label: "Placed",
                description:
                    placedEntry?.message || "Your replacement order has been placed successfully.",
                timestamp:
                    placedEntry?.timestamp ||
                    shippedEntry?.timestamp ||
                    outForDeliveryEntry?.timestamp ||
                    deliveredEntry?.timestamp ||
                    order?.updatedAt ||
                    order?.createdAt ||
                    null,
                isCompleted: ["shipped", "out_for_delivery", "delivered"].includes(currentStatus),
                isCurrent: currentStatus === "placed",
                icon: statusConfig.placed.icon,
            },
            {
                status: "replacement_shipped",
                label: statusConfig.shipped.label,
                description: shippedEntry?.message || statusConfig.shipped.description,
                timestamp:
                    shippedEntry?.timestamp ||
                    outForDeliveryEntry?.timestamp ||
                    deliveredEntry?.timestamp ||
                    null,
                isCompleted: ["out_for_delivery", "delivered"].includes(currentStatus),
                isCurrent: currentStatus === "shipped",
                icon: statusConfig.shipped.icon,
            },
            {
                status: "replacement_out_for_delivery",
                label: statusConfig.out_for_delivery.label,
                description: statusConfig.out_for_delivery.description,
                timestamp:
                    outForDeliveryEntry?.timestamp ||
                    (currentStatus === "delivered" ? deliveredEntry?.timestamp || null : null),
                isCompleted: currentStatus === "delivered",
                isCurrent: currentStatus === "out_for_delivery",
                icon: statusConfig.out_for_delivery.icon,
            },
            {
                status: "replacement_delivered",
                label: statusConfig.delivered.label,
                description: deliveredEntry?.message || statusConfig.delivered.description,
                timestamp: deliveredEntry?.timestamp || null,
                isCompleted: currentStatus === "delivered",
                isCurrent: currentStatus === "delivered",
                icon: statusConfig.delivered.icon,
            },
        ];

        return [...originalOrderSteps, ...replacementFlowSteps];
    }

    const steps = buildBaseOrderTrackingSteps(order, {
        allowCurrent: !order?.isReturnRequested,
    });

    return [...steps, ...buildReturnTrackingSteps(order).map((step) => ({
        status: `return_${step.key}`,
        label: step.label,
        description: step.description,
        timestamp: step.timestamp,
        isCompleted: step.isCompleted,
        isCurrent: step.isCurrent,
        icon: step.icon,
    }))];
};

const OrderDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadOrder = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const { data } = await API.get(`/orders/my/${id}`);

                if (!isMounted) {
                    return;
                }

                setOrder(data?.order || null);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setOrder(null);
                setErrorMessage(error?.response?.data?.message || "Failed to fetch order details");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadOrder();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const trackingSteps = useMemo(() => buildTrackingSteps(order), [order]);
    const primaryItem = order?.items?.[0] || null;
    const canDownloadInvoice = String(order?.status || "").toLowerCase() === "delivered";

    const handleInvoiceDownload = () => {
        if (!canDownloadInvoice || !order) {
            return;
        }
        downloadInvoicePdf(order, { humanize, getDisplayStatus });
    };

    return (
        <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.28),_transparent_26%),linear-gradient(180deg,#f8fdff_0%,#eef7fc_42%,#f8fafc_100%)] pb-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-6 print:hidden">
                        <button
                            type="button"
                            onClick={() => navigate("/user-dashboard?tab=orders")}
                            className="inline-flex min-h-12 items-center gap-2 self-start rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#0EA5E9] hover:text-[#0f2942]"
                        >
                            <ArrowLeft size={16} />
                            Back to Orders
                        </button>

                        <button
                            type="button"
                            onClick={handleInvoiceDownload}
                            disabled={!canDownloadInvoice}
                            className={`inline-flex min-h-12 items-center gap-2 self-start rounded-[18px] px-5 py-3 text-sm font-semibold text-white transition sm:self-auto ${
                                canDownloadInvoice
                                    ? "bg-[#0EA5E9] hover:bg-[#0284C7]"
                                    : "cursor-not-allowed bg-slate-300 text-slate-100"
                            }`}
                        >
                            <Download size={16} />
                            {canDownloadInvoice ? "Download Invoice" : "Invoice After Delivery"}
                        </button>
                    </div>

                    {loading ? (
                        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                            Loading order details...
                        </div>
                    ) : errorMessage ? (
                        <div className="rounded-[32px] border border-rose-200 bg-rose-50 p-10 text-center text-rose-600 shadow-sm">
                            {errorMessage}
                        </div>
                    ) : !order ? (
                        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                            Order not found.
                        </div>
                    ) : (
                        <div className="grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
                            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
                                <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f2942_0%,#173b5d_58%,#0EA5E9_180%)] px-6 py-6 text-white sm:px-8">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
                                                Order Details
                                            </p>
                                            <h1 className="mt-3 text-3xl font-black tracking-tight">
                                                #{String(order._id).slice(-8).toUpperCase()}
                                            </h1>
                                            <p className="mt-2 text-sm text-white/75">
                                                Ordered on{" "}
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>

                                        <div className="rounded-[22px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                                                Current Status
                                            </p>
                                            <p className="mt-2 text-lg font-bold text-white">
                                                {getDisplayStatus(order)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-8 sm:px-8">
                                    <div className="space-y-6">
                                        {trackingSteps.map((step, index) => {
                                            const Icon = step.icon;
                                            const hasConnector = index !== trackingSteps.length - 1;
                                            const isActiveStep = step.isCompleted || step.isCurrent;
                                            const nextStep = trackingSteps[index + 1];
                                            const isConnectorActive = Boolean(
                                                nextStep && (nextStep.isCompleted || nextStep.isCurrent)
                                            );

                                            return (
                                                <div key={`${step.status}-${index}`} className="flex gap-4">
                                                    <div className="flex w-12 shrink-0 flex-col items-center">
                                                        <div
                                                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                                                                isActiveStep
                                                                    ? "border-[#0EA5E9]/35 bg-[#0EA5E9]/20 text-[#0f2942] shadow-[0_0_0_6px_rgba(14,165,233,0.14)]"
                                                                    : "border-slate-200 bg-slate-50 text-slate-400"
                                                            }`}
                                                        >
                                                            <Icon size={18} />
                                                        </div>
                                                        {hasConnector ? (
                                                            <div
                                                                className={`mt-2 h-full min-h-10 w-px ${
                                                                    isConnectorActive ? "bg-[#0EA5E9]/60" : "bg-slate-200"
                                                                }`}
                                                            />
                                                        ) : null}
                                                    </div>

                                                    <div className="flex-1 rounded-[22px] border border-slate-100 bg-slate-50/80 px-5 py-4">
                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-[#0f2942]">
                                                                    {step.label}
                                                                </h3>
                                                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                                                    {step.description}
                                                                </p>
                                                            </div>
                                                            <div className="text-sm font-semibold text-slate-500">
                                                                {step.timestamp
                                                                    ? new Date(step.timestamp).toLocaleString("en-IN", {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                        hour: "numeric",
                                                                        minute: "2-digit",
                                                                    })
                                                                    : step.isCurrent
                                                                        ? "Current stage"
                                                                        : "Pending"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
                                    <div className="border-b border-slate-100 px-5 py-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                            Order Item
                                        </p>
                                    </div>

                                    {primaryItem ? (
                                        <div className="flex gap-4 px-5 py-5">
                                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#f3fbff_0%,#e3f4fb_100%)]">
                                                {primaryItem.image ? (
                                                    <img
                                                        src={primaryItem.image}
                                                        alt={primaryItem.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <ShoppingBag size={28} className="text-[#0EA5E9]" />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="text-lg font-bold text-[#0f2942]">
                                                    {primaryItem.name}
                                                </h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Quantity: {primaryItem.quantity || 1}
                                                </p>
                                                {primaryItem.pack ? (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Pack: {primaryItem.pack}
                                                    </p>
                                                ) : null}
                                                <p className="mt-3 text-2xl font-black text-[#0EA5E9]">
                                                    {formatPrice(primaryItem.price)}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="px-5 py-6 text-sm text-slate-500">
                                            No items found for this order.
                                        </div>
                                    )}

                                    {(order.items?.length || 0) > 1 ? (
                                        <div className="border-t border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
                                            +{order.items.length - 1} more item{order.items.length - 1 > 1 ? "s" : ""}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E0F2FE] text-[#0f2942]">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                Invoice
                                            </p>
                                            <h3 className="text-base font-bold text-[#0f2942]">
                                                Payment Details
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3 text-sm text-slate-600">
                                        <div className="flex items-center justify-between">
                                            <span>Method</span>
                                            <span className="font-semibold text-slate-900">
                                                {humanize(order.paymentMethod || "cod")}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(order.subtotal)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Discount</span>
                                            <span>{formatPrice(order.discount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Status</span>
                                            <span className="font-semibold text-[#0f2942]">
                                                {humanize(order.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-bold text-[#0f2942]">
                                            <span>Total</span>
                                            <span>{formatPrice(order.total)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E0F2FE] text-[#0f2942]">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                Delivery Address
                                            </p>
                                            <h3 className="text-base font-bold text-[#0f2942]">
                                                Shipping Information
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3 text-sm text-slate-600">
                                        <div className="flex items-start gap-3">
                                            <UserRound size={16} className="mt-0.5 text-[#0EA5E9]" />
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {order.shippingInfo?.fullName || "N/A"}
                                                </p>
                                                <p>{order.shippingInfo?.email || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone size={16} className="mt-0.5 text-[#0EA5E9]" />
                                            <p>{order.shippingInfo?.phone || "N/A"}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Home size={16} className="mt-0.5 text-[#0EA5E9]" />
                                            <p className="leading-6">
                                                {[
                                                    order.shippingInfo?.address,
                                                    order.shippingInfo?.city,
                                                    order.shippingInfo?.state,
                                                    order.shippingInfo?.pincode,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ") || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate("/products")}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-[#0f2942] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#173b5d] print:hidden"
                                >
                                    <BadgeIndianRupee size={16} />
                                    Shop More
                                </button>
                            </div>
                        </div>
                    )}
                </div>
        </section>
    );
};

export default OrderDetails;
