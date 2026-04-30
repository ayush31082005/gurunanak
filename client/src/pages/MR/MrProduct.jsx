import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Area,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    Bell,
    Eye,
    IndianRupee,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Pencil,
    Plus,
    ShoppingBag,
    Trash2,
    TrendingUp,
    Wallet,
    X,
} from "lucide-react";
import API from "../../api";
import { getMrOrders } from "../../api/mrApi";
import { getMrNotifications } from "../../api/notificationApi";
import {
    deleteProduct,
    getMyProducts,
} from "../../api/productApi";
import AdminProductModal from "../../components/admin/AdminProductModal";
import AdminProductViewModal from "../../components/admin/AdminProductViewModal";
import WhatsAppChatBox from "../../components/common/WhatsAppChatBox";
import StatusBadge from "../../components/admin/StatusBadge";
import { featuredBrands, ayurvedaBrands } from "../../data/brands";
import { adminProductPages } from "../../data/adminProductPages";
import { normalizeProductForClient } from "../../utils/productTransforms";

const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "My Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "earnings", label: "Earning", icon: Wallet },
];

const mrBrandDropdownOptions = [
    "Diabetes",
    "Heart Care",
    "Stomach Care",
    "Liver Care",
    "Bone & Muscle",
    "Eye Care",
    "Mental Wellness",
    "Respiratory",
    "Himalaya",
    "Wellman",
    "Biotique",
    "Patanjali",
    "Organic India",
    "Dr. Morepen",
    "Dabur",
    "Baidyanath",
    "Dhootapapeshwar",
    "Himalaya Since 1930",
    "Jiva Ayurveda",
    "Kerala Ayurveda",
    "Sri Sri Tattva",
];

const extractProducts = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.products)) return responseData.products;
    if (Array.isArray(responseData?.data)) return responseData.data;
    return [];
};

const extractCategories = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.categories)) return responseData.categories;
    if (Array.isArray(responseData?.data)) return responseData.data;
    return [];
};

const extractOrders = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.orders)) return responseData.orders;
    if (Array.isArray(responseData?.data)) return responseData.data;
    return [];
};

const extractNotifications = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.notifications)) return responseData.notifications;
    if (Array.isArray(responseData?.data)) return responseData.data;
    return [];
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const formatCompactCurrency = (value) => {
    const amount = Number(value) || 0;

    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }

    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }

    return `₹${amount}`;
};

const chartGrid = "rgba(148, 163, 184, 0.16)";

const getOrderLineTotal = (order = {}) =>
    Number(order?.lineTotal) ||
    (Number(order?.unitPrice) || 0) * (Number(order?.quantity) || 0);

const buildRecentDateBuckets = (days = 7) => {
    const today = new Date();

    return Array.from({ length: days }, (_, index) => {
        const date = new Date(today);
        date.setHours(0, 0, 0, 0);
        date.setDate(today.getDate() - (days - index - 1));

        return {
            key: date.toISOString().slice(0, 10),
            label: date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
            }),
        };
    });
};

const buildMrEarningsTrend = (orders = []) => {
    const buckets = buildRecentDateBuckets();
    const earningsMap = new Map();

    orders.forEach((order) => {
        const sourceDate = order?.deliveredAt || order?.orderDate;

        if (!sourceDate) {
            return;
        }

        const date = new Date(sourceDate);

        if (Number.isNaN(date.getTime())) {
            return;
        }

        const bucketKey = date.toISOString().slice(0, 10);
        const earning = getOrderLineTotal(order);

        earningsMap.set(bucketKey, (earningsMap.get(bucketKey) || 0) + earning);
    });

    return buckets.map((bucket) => ({
        label: bucket.label,
        earnings: earningsMap.get(bucket.key) || 0,
    }));
};

const summarizeEarningsByProduct = (orders = []) => {
    const earningsMap = new Map();

    orders.forEach((order) => {
        const productName = order?.productName || "Unnamed Product";
        const productKey = String(order?.productId || productName);
        const lineTotal = getOrderLineTotal(order);
        const quantity = Number(order?.quantity) || 0;
        const existingEntry = earningsMap.get(productKey);

        if (existingEntry) {
            existingEntry.amount += lineTotal;
            existingEntry.quantity += quantity;
            return;
        }

        earningsMap.set(productKey, {
            id: productKey,
            productName,
            amount: lineTotal,
            quantity,
        });
    });

    return Array.from(earningsMap.values()).sort((firstProduct, secondProduct) => {
        if (secondProduct.amount !== firstProduct.amount) {
            return secondProduct.amount - firstProduct.amount;
        }

        return firstProduct.productName.localeCompare(secondProduct.productName);
    });
};

const summarizeOrdersByProduct = (orders = []) => {
    const productSummaryMap = new Map();

    orders.forEach((order) => {
        const productName = order?.productName || "Unnamed Product";
        const productKey = String(order?.productId || productName);
        const quantity = Number(order?.quantity) || 0;
        const existingProduct = productSummaryMap.get(productKey);

        if (existingProduct) {
            existingProduct.quantity += quantity;
            return;
        }

        productSummaryMap.set(productKey, {
            id: productKey,
            productName,
            quantity,
        });
    });

    return Array.from(productSummaryMap.values()).sort((firstProduct, secondProduct) => {
        if (secondProduct.quantity !== firstProduct.quantity) {
            return secondProduct.quantity - firstProduct.quantity;
        }

        return firstProduct.productName.localeCompare(secondProduct.productName);
    });
};

const getProductPriceValue = (product = {}) => Number(product?.price) || 0;

const buildMrProductValueTrend = (products = []) => {
    const buckets = buildRecentDateBuckets();
    const latestBucketKey = buckets[buckets.length - 1]?.key;
    const validBucketKeys = new Set(buckets.map((bucket) => bucket.key));
    const valueMap = new Map();

    products.forEach((product) => {
        const sourceDate = product?.createdAt || product?.updatedAt;
        let bucketKey = latestBucketKey;

        if (sourceDate) {
            const date = new Date(sourceDate);

            if (!Number.isNaN(date.getTime())) {
                bucketKey = date.toISOString().slice(0, 10);
            }
        }

        if (!bucketKey) {
            return;
        }

        if (!validBucketKeys.has(bucketKey)) {
            bucketKey = latestBucketKey;
        }

        valueMap.set(bucketKey, (valueMap.get(bucketKey) || 0) + getProductPriceValue(product));
    });

    return buckets.map((bucket) => ({
        label: bucket.label,
        earnings: valueMap.get(bucket.key) || 0,
    }));
};

const summarizeProductsByValue = (products = []) =>
    [...products]
        .map((product, index) => ({
            id: String(product?.id || product?._id || `${product?.name || "product"}-${index}`),
            productName: product?.name || "Unnamed Product",
            amount: getProductPriceValue(product),
            stock: Number(product?.stock) || 0,
        }))
        .sort((firstProduct, secondProduct) => {
            if (secondProduct.amount !== firstProduct.amount) {
                return secondProduct.amount - firstProduct.amount;
            }

            return firstProduct.productName.localeCompare(secondProduct.productName);
        });

const PaginationControls = ({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
    label = "Page",
}) => {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
                {label} {currentPage} of {totalPages}
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={currentPage === 1}
                    className="min-w-[88px] border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Prev
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={currentPage === totalPages}
                    className="min-w-[88px] border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subtitle, icon: Icon }) => {
    return (
        <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">{value}</h3>
                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 sm:h-12 sm:w-12">
                    <Icon size={22} />
                </div>
            </div>
        </div>
    );
};

const SectionHeading = ({ title, subtitle }) => {
    return (
        <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
    );
};

const EarningsTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-xl">
            <p className="mb-2 font-semibold text-slate-900">{label}</p>
            <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    Earnings
                </span>
                <span className="font-semibold text-slate-900">
                    {formatCurrency(payload[0]?.value)}
                </span>
            </div>
        </div>
    );
};

const DashboardHome = ({
    totalProducts,
    totalOrders = 0,
    currentBalance = 0,
    products = [],
    orders = [],
    onViewEarnings,
}) => {
    const earningsTrend = useMemo(
        () => buildMrProductValueTrend(products),
        [products]
    );
    const totalEarnings = useMemo(
        () => products.reduce((sum, product) => sum + getProductPriceValue(product), 0),
        [products]
    );
    const averageEarning =
        products.length > 0 ? totalEarnings / products.length : 0;
    const topEarningProduct = useMemo(() => {
        const rankedProducts = summarizeProductsByValue(products);
        return rankedProducts[0] || null;
    }, [products]);

    return (
        <div className="space-y-8">
            <SectionHeading
                title="Welcome Back"
                subtitle="Here is your business overview today."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    title="Total Products"
                    value={totalProducts}
                    subtitle="Products in your catalog"
                    icon={Package}
                />
                <StatCard
                    title="Total Orders"
                    value={totalOrders}
                    subtitle="Orders received"
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Current Balance"
                    value={formatCurrency(currentBalance)}
                    subtitle="Total value of your listed products"
                    icon={Wallet}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:col-span-2">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Earnings Trend
                        </h3>
                        <button
                            type="button"
                            onClick={onViewEarnings}
                            className="bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                        >
                            View All
                        </button>
                    </div>

                    {products.length > 0 ? (
                        <div className="h-[240px] sm:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={earningsTrend} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                                    <defs>
                                        <linearGradient id="mrDashboardEarningsFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke={chartGrid} vertical={true} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => formatCompactCurrency(value)}
                                    />
                                    <Tooltip content={<EarningsTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="none"
                                        fill="url(#mrDashboardEarningsFill)"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, fill: "#4f46e5", stroke: "#c7d2fe", strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                            No product-value data found yet.
                        </div>
                    )}
                </div>

                <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <h3 className="mb-5 text-lg font-semibold text-slate-900">
                        Earnings Summary
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-indigo-50 p-4">
                            <p className="text-sm text-slate-600">Total Earnings</p>
                            <h4 className="mt-1 text-2xl font-bold text-indigo-700">
                                {formatCurrency(totalEarnings)}
                            </h4>
                        </div>

                        <div className="bg-emerald-50 p-4">
                            <p className="text-sm text-slate-600">Average Earning</p>
                            <h4 className="mt-1 text-2xl font-bold text-emerald-700">
                                {formatCurrency(averageEarning)}
                            </h4>
                        </div>

                        <div className="bg-slate-100 p-4">
                            <p className="text-sm text-slate-600">Top Earning Product</p>
                            <h4 className="mt-1 text-2xl font-bold text-slate-900">
                                {topEarningProduct?.productName || "N/A"}
                            </h4>
                            {topEarningProduct ? (
                                <p className="mt-1 text-sm text-slate-500">
                                    {formatCurrency(topEarningProduct.amount)}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductsSection = ({
    brands,
    categories,
    error,
    loading,
    products,
    onRefresh,
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const productsPerPage = 6;
    const [productsPage, setProductsPage] = useState(1);
    const totalProductPages = Math.max(1, Math.ceil(products.length / productsPerPage));
    const paginatedProducts = products.slice(
        (productsPage - 1) * productsPerPage,
        productsPage * productsPerPage
    );

    useEffect(() => {
        setProductsPage((currentPage) => Math.min(currentPage, totalProductPages));
    }, [totalProductPages]);

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const openViewModal = (product) => {
        setSelectedProduct(product);
        setIsViewModalOpen(true);
    };

    const handleDeleteProduct = async (productId, productName) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${productName}"?`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteProduct(productId);
            await onRefresh();
        } catch (requestError) {
            window.alert(
                requestError?.response?.data?.message ||
                "Failed to delete product."
            );
        }
    };

    return (
        <div>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SectionHeading
                    title="My Products"
                    subtitle="Manage your listed products here."
                />

                <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex w-full items-center justify-center gap-2 bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {loading ? (
                <div className="border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                    Loading products...
                </div>
            ) : error ? (
                <div className="border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700 shadow-sm">
                    {error}
                </div>
            ) : products.length === 0 ? (
                <div className="border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                    No products added yet.
                </div>
            ) : (
                <div>
                    <div className="space-y-4 md:hidden">
                        {paginatedProducts.map((product) => (
                            <article
                                key={`mobile-${product.id}`}
                                className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
                            >
                                <div className="flex items-start gap-3">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="text-base font-bold text-slate-900">
                                            {product.name}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {product.description || "No description available."}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            Category
                                        </p>
                                        <p className="mt-1 font-medium text-slate-700">
                                            {product.categoryName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            Price
                                        </p>
                                        <p className="mt-1 font-semibold text-slate-900">
                                            {formatCurrency(product.price)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            Stock
                                        </p>
                                        <p className="mt-1 font-medium text-slate-700">
                                            {product.stock} items
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            Status
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            <StatusBadge text={product.status} />
                                            <StatusBadge text={product.approvalStatus} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openViewModal(product)}
                                        className="inline-flex flex-1 items-center justify-center gap-2 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                    >
                                        <Eye size={15} />
                                        View
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openEditModal(product)}
                                        className="inline-flex flex-1 items-center justify-center gap-2 bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                                    >
                                        <Pencil size={15} />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                        className="inline-flex w-full items-center justify-center gap-2 bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                                    >
                                        <Trash2 size={15} />
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)] md:block">
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-separate border-spacing-0 text-left">
                                <thead className="bg-slate-100">
                                    <tr className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                        <th className="border-b border-r border-slate-200 px-5 py-4 font-semibold">
                                            Product
                                        </th>
                                        <th className="border-b border-r border-slate-200 px-5 py-4 font-semibold">
                                            Category
                                        </th>
                                        <th className="border-b border-r border-slate-200 px-5 py-4 font-semibold">
                                            Price
                                        </th>
                                        <th className="border-b border-r border-slate-200 px-5 py-4 font-semibold">
                                            Stock
                                        </th>
                                        <th className="border-b border-r border-slate-200 px-5 py-4 font-semibold">
                                            Stock Status
                                        </th>
                                        <th className="border-b border-r border-slate-200 px-5 py-4 font-semibold">
                                            Approval
                                        </th>
                                        <th className="border-b border-slate-200 px-5 py-4 font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedProducts.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="align-top text-sm transition hover:bg-slate-50/70"
                                        >
                                            <td className="border-b border-r border-slate-200 px-5 py-4">
                                                <div className="flex min-w-[240px] items-start gap-4">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-16 w-16 border border-slate-200 object-cover"
                                                    />

                                                    <div>
                                                        <p className="text-base font-bold text-slate-900">
                                                            {product.name}
                                                        </p>
                                                        <p className="mt-1 max-w-xs text-sm text-slate-500">
                                                            {product.description ||
                                                                "No description available."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="border-b border-r border-slate-200 px-5 py-4 text-sm text-slate-700">
                                                <span className="inline-flex bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                    {product.categoryName}
                                                </span>
                                            </td>

                                            <td className="border-b border-r border-slate-200 px-5 py-4 text-sm font-semibold text-slate-900">
                                                {formatCurrency(product.price)}
                                            </td>

                                            <td className="border-b border-r border-slate-200 px-5 py-4 text-sm text-slate-700">
                                                {product.stock} items
                                            </td>

                                            <td className="border-b border-r border-slate-200 px-5 py-4 whitespace-nowrap">
                                                <StatusBadge text={product.status} />
                                            </td>

                                            <td className="border-b border-r border-slate-200 px-5 py-4 whitespace-nowrap">
                                                <StatusBadge text={product.approvalStatus} />
                                            </td>

                                            <td className="border-b border-slate-200 px-5 py-4 whitespace-nowrap">
                                                <div className="flex min-w-[220px] flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openViewModal(product)}
                                                        className="inline-flex shrink-0 items-center justify-center gap-2 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                                    >
                                                        <Eye size={15} />
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(product)}
                                                        className="inline-flex shrink-0 items-center justify-center gap-2 bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                                                    >
                                                        <Pencil size={15} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteProduct(
                                                                product.id,
                                                                product.name
                                                            )
                                                        }
                                                        className="inline-flex shrink-0 items-center justify-center gap-2 bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                                                    >
                                                        <Trash2 size={15} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <PaginationControls
                        currentPage={productsPage}
                        totalPages={totalProductPages}
                        onPrevious={() =>
                            setProductsPage((currentPage) => Math.max(currentPage - 1, 1))
                        }
                        onNext={() =>
                            setProductsPage((currentPage) =>
                                Math.min(currentPage + 1, totalProductPages)
                            )
                        }
                        label="Products page"
                    />
                </div>
            )}

            <AdminProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                brands={brands}
                categories={categories}
                onCreated={onRefresh}
            />

            <AdminProductModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                }}
                brands={brands}
                categories={categories}
                onCreated={onRefresh}
                mode="edit"
                product={selectedProduct}
            />

            <AdminProductViewModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
            />
        </div>
    );
};

const OrdersSection = ({ orders, loading, error }) => {
    const summarizedOrders = useMemo(() => summarizeOrdersByProduct(orders), [orders]);
    const ordersPerPage = 8;
    const [ordersPage, setOrdersPage] = useState(1);
    const totalOrderPages = Math.max(1, Math.ceil(summarizedOrders.length / ordersPerPage));
    const paginatedOrders = summarizedOrders.slice(
        (ordersPage - 1) * ordersPerPage,
        ordersPage * ordersPerPage
    );

    useEffect(() => {
        setOrdersPage((currentPage) => Math.min(currentPage, totalOrderPages));
    }, [totalOrderPages]);

    return (
        <div>
            <SectionHeading
                title="Orders"
                subtitle="See which of your products sold and how many units sold."
            />

            <div className="space-y-4 md:hidden">
                {loading ? (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                        Loading orders...
                    </div>
                ) : error ? (
                    <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600 shadow-sm">
                        {error}
                    </div>
                ) : paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                        <article
                            key={`mobile-order-${order.id}`}
                            className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                Product Name
                            </p>
                            <p className="mt-1 text-base font-bold text-slate-900">
                                {order.productName}
                            </p>
                            <div className="mt-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Quantity Sold
                                </p>
                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {order.quantity}
                                </p>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                        No MR-linked product sales found yet.
                    </div>
                )}
            </div>

            <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)] md:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0 text-left">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border-b border-r border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700">
                                    Product Name
                                </th>
                                <th className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700">
                                    Quantity Sold
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="2"
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan="2"
                                        className="px-5 py-10 text-center text-sm text-rose-600"
                                    >
                                        {error}
                                    </td>
                                </tr>
                            ) : paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="transition hover:bg-slate-50/70"
                                    >
                                        <td className="border-b border-r border-slate-200 px-5 py-4 text-sm text-slate-600">
                                            {order.productName}
                                        </td>
                                        <td className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-900">
                                            {order.quantity}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="2"
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        No MR-linked product sales found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PaginationControls
                currentPage={ordersPage}
                totalPages={totalOrderPages}
                onPrevious={() =>
                    setOrdersPage((currentPage) => Math.max(currentPage - 1, 1))
                }
                onNext={() =>
                    setOrdersPage((currentPage) =>
                        Math.min(currentPage + 1, totalOrderPages)
                    )
                }
                label="Orders page"
            />
        </div>
    );
};

const EarningsSection = ({ products, orders }) => {
    const totalProducts = products.length;
    const earningsPerPage = 5;
    const [earningsPage, setEarningsPage] = useState(1);
    const earningsTrend = useMemo(
        () => buildMrProductValueTrend(products),
        [products]
    );
    const topEarningProducts = useMemo(
        () => summarizeProductsByValue(products),
        [products]
    );
    const totalEarnings = useMemo(
        () => products.reduce((sum, product) => sum + getProductPriceValue(product), 0),
        [products]
    );
    const averageProductValue =
        totalProducts > 0 ? totalEarnings / totalProducts : 0;
    const totalEarningsPages = Math.max(
        1,
        Math.ceil(topEarningProducts.length / earningsPerPage)
    );
    const paginatedProducts = topEarningProducts.slice(
        (earningsPage - 1) * earningsPerPage,
        earningsPage * earningsPerPage
    );
    const highestValueProduct = useMemo(() => {
        if (!topEarningProducts.length) {
            return null;
        }

        return topEarningProducts[0];
    }, [topEarningProducts]);

    useEffect(() => {
        setEarningsPage((currentPage) => Math.min(currentPage, totalEarningsPages));
    }, [totalEarningsPages]);

    return (
        <div>
            <SectionHeading
                title="Earnings"
                subtitle="Track total earning value by adding all your product prices."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    title="Total Earnings"
                    value={formatCurrency(totalEarnings)}
                    subtitle="Combined value of all your product prices"
                    icon={IndianRupee}
                />
                <StatCard
                    title="Total Products"
                    value={totalProducts}
                    subtitle="Products included in earning value"
                    icon={Wallet}
                />
                <StatCard
                    title="Average Earning"
                    value={formatCurrency(averageProductValue)}
                    subtitle="Average price per product"
                    icon={TrendingUp}
                />
            </div>

            <div className="mt-6 border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Earnings Trend
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Last 7 days product-price value movement.
                    </p>
                </div>

                <div className="h-[220px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={earningsTrend} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                            <defs>
                                <linearGradient id="mrEarningsFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke={chartGrid} vertical={true} />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => formatCompactCurrency(value)}
                            />
                            <Tooltip content={<EarningsTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="earnings"
                                stroke="none"
                                fill="url(#mrEarningsFill)"
                            />
                            <Line
                                type="monotone"
                                dataKey="earnings"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: "#4f46e5", stroke: "#c7d2fe", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-6 border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold text-slate-900">
                    Top Product Earnings
                </h3>

                {topEarningProducts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {paginatedProducts.map((product) => (
                            <div
                                key={product.id}
                                className="w-fit min-w-[140px] border border-slate-200 bg-slate-50 p-2.5"
                            >
                                <div className="space-y-1.5">
                                    <h4 className="text-sm font-semibold text-slate-900">
                                        {product.productName}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Stock: {product.stock}
                                    </p>
                                    <span className="inline-flex bg-white px-2.5 py-1 text-xs font-bold text-slate-900">
                                        {formatCurrency(product.amount)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                        No products found yet.
                    </div>
                )}

                <PaginationControls
                    currentPage={earningsPage}
                    totalPages={totalEarningsPages}
                    onPrevious={() =>
                        setEarningsPage((currentPage) => Math.max(currentPage - 1, 1))
                    }
                    onNext={() =>
                        setEarningsPage((currentPage) =>
                            Math.min(currentPage + 1, totalEarningsPages)
                        )
                    }
                    label="Earnings page"
                />

                {highestValueProduct ? (
                    <div className="mt-5 border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        Highest earning product:{" "}
                        <span className="font-semibold text-slate-900">
                            {highestValueProduct.productName}
                        </span>{" "}
                        ({formatCurrency(highestValueProduct.amount)})
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const MrDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("earnings");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState("");
    const [mrOrders, setMrOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState("");
    const [, setMrNotifications] = useState([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch (error) {
            return null;
        }
    }, []);

    const userInitials = useMemo(() => {
        const rawName =
            currentUser?.name ||
            currentUser?.email?.split("@")[0] ||
            "MR";

        return rawName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("");
    }, [currentUser]);

    const normalizedProducts = useMemo(
        () =>
            products.map((product) => {
                const normalizedProduct = normalizeProductForClient(product);

                return {
                    ...normalizedProduct,
                    categoryName: normalizedProduct.category || "Uncategorized",
                };
            }),
        [products]
    );

    const allowedMrCategoryNames = useMemo(
        () => new Set(adminProductPages.map((page) => page.label.trim().toLowerCase())),
        []
    );

    const mrCategories = useMemo(
        () =>
            categories.filter((category) =>
                allowedMrCategoryNames.has(category?.name?.trim()?.toLowerCase())
            ),
        [allowedMrCategoryNames, categories]
    );
    const currentBalance = useMemo(
        () =>
            normalizedProducts.reduce(
                (sum, product) => sum + getProductPriceValue(product),
                0
            ),
        [normalizedProducts]
    );

    const brandOptions = useMemo(() => {
        const knownBrands = [
            ...mrBrandDropdownOptions,
            ...featuredBrands.map((brand) => brand.name),
            ...ayurvedaBrands.map((brand) => brand.name),
            ...products.map((product) => product.brand).filter(Boolean),
        ];

        return [...new Set(knownBrands.filter(Boolean))].sort((firstBrand, secondBrand) =>
            String(firstBrand).localeCompare(String(secondBrand))
        );
    }, [products]);

    const loadMrProducts = async () => {
        try {
            setProductsLoading(true);
            setProductsError("");

            const [productsResponse, categoriesResponse] = await Promise.all([
                getMyProducts(),
                API.get("/categories"),
            ]);

            setProducts(extractProducts(productsResponse.data));
            setCategories(extractCategories(categoriesResponse.data));
        } catch (requestError) {
            setProducts([]);
            setCategories([]);
            setProductsError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to load your products."
            );
        } finally {
            setProductsLoading(false);
        }
    };

    const loadMrOrders = async () => {
        try {
            setOrdersLoading(true);
            setOrdersError("");

            const response = await getMrOrders();
            setMrOrders(extractOrders(response.data));
        } catch (requestError) {
            setMrOrders([]);
            setOrdersError(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to load your orders."
            );
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadMrNotifications = async () => {
        try {
            const response = await getMrNotifications();
            const notifications = extractNotifications(response.data);

            setMrNotifications(notifications);
            setUnreadNotificationCount(
                Number(response?.data?.unreadCount) ||
                notifications.filter((notification) => !notification?.isRead).length
            );
        } catch (_requestError) {
            setMrNotifications([]);
            setUnreadNotificationCount(0);
        }
    };

    useEffect(() => {
        loadMrProducts();
        loadMrOrders();
        loadMrNotifications();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setSidebarOpen(false);
        navigate("/login", { replace: true });
    };

    const renderContent = () => {
        switch (activeTab) {
            case "products":
                return (
                    <ProductsSection
                        brands={brandOptions}
                        categories={mrCategories}
                        error={productsError}
                        loading={productsLoading}
                        products={normalizedProducts}
                        onRefresh={loadMrProducts}
                    />
                );

            case "orders":
                return (
                    <OrdersSection
                        orders={mrOrders}
                        loading={ordersLoading}
                        error={ordersError}
                    />
                );

            case "earnings":
                return <EarningsSection products={normalizedProducts} orders={mrOrders} />;

            default:
                return (
                    <DashboardHome
                        totalProducts={normalizedProducts.length}
                        totalOrders={mrOrders.length}
                        currentBalance={currentBalance}
                        products={normalizedProducts}
                        orders={mrOrders}
                        onViewEarnings={() => setActiveTab("earnings")}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="flex">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside
                    className={`fixed left-0 top-0 z-50 flex h-screen w-[88vw] max-w-72 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-lg transition-transform duration-300 lg:w-72 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">
                                MR Panel
                            </h1>
                            {/* <p className="text-sm text-slate-500">User Dashboard</p> */}
                        </div>

                        <button
                            className="border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
                        <nav className="space-y-2">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setSidebarOpen(false);
                                        }}
                                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition ${isActive
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        <Icon size={20} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="mt-6 border-t border-slate-200 pt-4">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-rose-600"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>

                        <div className="mt-10 bg-gradient-to-br from-indigo-600 to-purple-600 p-5 text-white">
                            <p className="text-sm text-indigo-100">Current Balance</p>
                            <h3 className="mt-2 text-3xl font-bold">
                                {formatCurrency(currentBalance)}
                            </h3>
                            <p className="mt-2 text-sm text-indigo-100">
                                Keep growing your orders and earnings.
                            </p>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 lg:pl-72">
                    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <button
                                    className="border border-slate-200 p-2 text-slate-700 lg:hidden"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu size={22} />
                                </button>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                        My Dashboard
                                    </h2>
                                    <p className="text-xs text-slate-500 sm:text-sm">
                                        Manage your products, orders and earnings
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* <div className="hidden items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 sm:flex">
                                    <Bell size={16} />
                                    <span>{unreadNotificationCount} unread</span>
                                </div> */}

                                <div className="hidden text-right sm:block">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {currentUser?.name || currentUser?.email || "MR User"}
                                    </p>
                                    <p className="text-xs text-slate-500">MR User</p>
                                </div>



                                <div className="flex h-11 w-11 items-center justify-center bg-indigo-600 text-sm font-bold text-white">
                                    {userInitials || "MR"}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="p-3 sm:p-6 lg:p-8">{renderContent()}</main>
                </div>
            </div>
            <WhatsAppChatBox bottomOffsetClassName="bottom-6 sm:bottom-6" />
        </div>
    );
};

export default MrDashboard;
