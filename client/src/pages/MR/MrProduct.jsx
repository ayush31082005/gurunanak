import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle2,
    Clock3,
    Eye,
    IndianRupee,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Pencil,
    Plus,
    RotateCcw,
    ShoppingBag,
    Trash2,
    TrendingUp,
    Wallet,
    X,
} from "lucide-react";
import API from "../../api";
import {
    deleteProduct,
    getMyProducts,
} from "../../api/productApi";
import AdminProductModal from "../../components/admin/AdminProductModal";
import AdminProductViewModal from "../../components/admin/AdminProductViewModal";
import StatusBadge from "../../components/admin/StatusBadge";
import { featuredBrands, ayurvedaBrands } from "../../data/brands";
import { adminProductPages } from "../../data/adminProductPages";
import { normalizeProductForClient } from "../../utils/productTransforms";

const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "My Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "returns", label: "Return Product", icon: RotateCcw },
    { id: "earnings", label: "Earning", icon: Wallet },
];

const ordersData = [
    {
        id: "#ORD1024",
        customer: "Rahul Verma",
        product: "Herbal Protein Powder",
        date: "12 Apr 2026",
        amount: 899,
        status: "Delivered",
    },
    {
        id: "#ORD1025",
        customer: "Priya Singh",
        product: "Immunity Booster",
        date: "13 Apr 2026",
        amount: 499,
        status: "Pending",
    },
    {
        id: "#ORD1026",
        customer: "Amit Kumar",
        product: "Skin Care Combo Pack",
        date: "14 Apr 2026",
        amount: 1299,
        status: "Shipped",
    },
    {
        id: "#ORD1027",
        customer: "Sneha Patel",
        product: "Herbal Protein Powder",
        date: "15 Apr 2026",
        amount: 899,
        status: "Delivered",
    },
];

const earningsHistory = [
    {
        id: 1,
        title: "Order Commission",
        date: "10 Apr 2026",
        amount: 2500,
        type: "Credit",
    },
    {
        id: 2,
        title: "Referral Bonus",
        date: "12 Apr 2026",
        amount: 1200,
        type: "Credit",
    },
    {
        id: 3,
        title: "Withdrawal",
        date: "14 Apr 2026",
        amount: 2000,
        type: "Debit",
    },
    {
        id: 4,
        title: "Level Income",
        date: "15 Apr 2026",
        amount: 1800,
        type: "Credit",
    },
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


const StatCard = ({ title, value, subtitle, icon: Icon }) => {
    return (
        <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center bg-indigo-50 text-indigo-600">
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

const DashboardHome = ({ totalProducts, totalReturns }) => {
    const totalOrders = ordersData.length;
    const deliveredOrders = ordersData.filter(
        (item) => item.status === "Delivered"
    ).length;

    const totalEarning = useMemo(() => {
        return earningsHistory.reduce((acc, item) => {
            return item.type === "Credit" ? acc + item.amount : acc - item.amount;
        }, 0);
    }, []);

    return (
        <div className="space-y-8">
            <SectionHeading
                title="Welcome Back"
                subtitle="Here is your business overview today."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                    title="Delivered"
                    value={deliveredOrders}
                    subtitle="Successfully delivered orders"
                    icon={CheckCircle2}
                />
                <StatCard
                    title="Return Requests"
                    value={totalReturns}
                    subtitle="Returned product requests"
                    icon={RotateCcw}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Recent Orders
                        </h3>
                        <button className="bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {ordersData.slice(0, 4).map((order) => (
                            <div
                                key={order.id}
                                className="flex flex-col gap-3 border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-slate-900">{order.id}</p>
                                    <p className="text-sm text-slate-500">
                                        {order.customer} â€¢ {order.product}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-slate-700">
                                        â‚¹{order.amount}
                                    </span>
                                    <span
                                        className={`px-3 py-1 text-xs font-semibold ${
                                            order.status === "Delivered"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : order.status === "Pending"
                                                  ? "bg-amber-100 text-amber-700"
                                                  : "bg-blue-100 text-blue-700"
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 text-lg font-semibold text-slate-900">
                        Earnings Summary
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-indigo-50 p-4">
                            <p className="text-sm text-slate-600">This Month</p>
                            <h4 className="mt-1 text-2xl font-bold text-indigo-700">
                                â‚¹8,450
                            </h4>
                        </div>

                        <div className="bg-emerald-50 p-4">
                            <p className="text-sm text-slate-600">Last Withdrawal</p>
                            <h4 className="mt-1 text-2xl font-bold text-emerald-700">
                                â‚¹2,000
                            </h4>
                        </div>

                        <div className="bg-amber-50 p-4">
                            <p className="text-sm text-slate-600">Pending Settlement</p>
                            <h4 className="mt-1 text-2xl font-bold text-amber-700">
                                â‚¹1,250
                            </h4>
                        </div>

                        <div className="bg-slate-100 p-4">
                            <p className="text-sm text-slate-600">Net Earnings</p>
                            <h4 className="mt-1 text-2xl font-bold text-slate-900">
                                â‚¹{totalEarning}
                            </h4>
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
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
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
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="overflow-hidden border border-slate-200 bg-white shadow-sm"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-52 w-full object-cover"
                            />

                            <div className="p-5">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <span className="bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                        {product.categoryName}
                                    </span>

                                    <StatusBadge text={product.approvalStatus} />
                                </div>

                                <h3 className="text-lg font-bold text-slate-900">
                                    {product.name}
                                </h3>

                                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                                    {product.description || "No description available."}
                                </p>

                                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                                    <span>Stock: {product.stock} items</span>
                                    <StatusBadge text={product.status} />
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xl font-bold text-slate-900">
                                        â‚¹{product.price}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openViewModal(product)}
                                        className="flex items-center justify-center gap-2 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                    >
                                        <Eye size={15} />
                                        View
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openEditModal(product)}
                                        className="flex items-center justify-center gap-2 bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                                    >
                                        <Pencil size={15} />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteProduct(product.id, product.name)
                                        }
                                        className="flex items-center justify-center gap-2 bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                                    >
                                        <Trash2 size={15} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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

const OrdersSection = () => {
    return (
        <div>
            <SectionHeading
                title="Orders"
                subtitle="Track all your recent product orders."
            />

            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Order ID
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Customer
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Product
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Date
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Amount
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {ordersData.map((order) => (
                                <tr key={order.id} className="border-t border-slate-200">
                                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                        {order.id}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {order.customer}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {order.product}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {order.date}
                                    </td>
                                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                                        â‚¹{order.amount}
                                    </td>
                                    <td className="px-5 py-4 text-sm">
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold ${
                                                order.status === "Delivered"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : order.status === "Pending"
                                                      ? "bg-amber-100 text-amber-700"
                                                      : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ReturnsSection = ({ returns }) => {
    return (
        <div>
            <SectionHeading
                title="Return Product"
                subtitle="View all returned product requests here."
            />

            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Return ID
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Order ID
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Customer
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Product
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Amount
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Reason
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Date
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {returns.length > 0 ? (
                                returns.map((item) => (
                                    <tr key={item.id} className="border-t border-slate-200">
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                            RTN-{item.id}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {item.orderId}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {item.customer}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {item.product}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-medium text-slate-800">
                                            â‚¹{item.amount}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {item.reason}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {item.date}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold ${
                                                    item.status === "Pending"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : item.status === "Approved"
                                                          ? "bg-emerald-100 text-emerald-700"
                                                          : "bg-rose-100 text-rose-700"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        No return products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const EarningsSection = () => {
    const totalCredit = earningsHistory
        .filter((item) => item.type === "Credit")
        .reduce((acc, item) => acc + item.amount, 0);

    const totalDebit = earningsHistory
        .filter((item) => item.type === "Debit")
        .reduce((acc, item) => acc + item.amount, 0);

    const balance = totalCredit - totalDebit;

    return (
        <div>
            <SectionHeading
                title="Earnings"
                subtitle="View your earnings, withdrawals and growth."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    title="Total Credit"
                    value={`â‚¹${totalCredit}`}
                    subtitle="All credited income"
                    icon={IndianRupee}
                />
                <StatCard
                    title="Total Debit"
                    value={`â‚¹${totalDebit}`}
                    subtitle="Withdrawals and deductions"
                    icon={Clock3}
                />
                <StatCard
                    title="Available Balance"
                    value={`â‚¹${balance}`}
                    subtitle="Current wallet balance"
                    icon={TrendingUp}
                />
            </div>

            <div className="mt-8 border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold text-slate-900">
                    Earnings History
                </h3>

                <div className="space-y-4">
                    {earningsHistory.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col gap-3 border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                                <p className="text-sm text-slate-500">{item.date}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span
                                    className={`px-3 py-1 text-xs font-semibold ${
                                        item.type === "Credit"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-rose-100 text-rose-700"
                                    }`}
                                >
                                    {item.type}
                                </span>

                                <span
                                    className={`text-lg font-bold ${
                                        item.type === "Credit"
                                            ? "text-emerald-700"
                                            : "text-rose-700"
                                    }`}
                                >
                                    {item.type === "Credit" ? "+" : "-"}â‚¹{item.amount}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
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

    const [returns] = useState([
        {
            id: 1001,
            orderId: "#ORD1025",
            customer: "Priya Singh",
            product: "Immunity Booster",
            amount: 499,
            reason: "Damaged product received",
            status: "Pending",
            date: "16 Apr 2026",
        },
    ]);

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

    useEffect(() => {
        loadMrProducts();
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
                return <OrdersSection />;

            case "returns":
                return <ReturnsSection returns={returns} />;

            case "earnings":
                return <EarningsSection />;

            default:
                return (
                    <DashboardHome
                        totalProducts={normalizedProducts.length}
                        totalReturns={returns.length}
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
                    className={`fixed left-0 top-0 z-50 h-screen w-72 transform border-r border-slate-200 bg-white p-5 shadow-lg transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">
                                MR Panel
                            </h1>
                            <p className="text-sm text-slate-500">User Dashboard</p>
                        </div>

                        <button
                            className="border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <nav className="mt-8 space-y-2">
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
                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition ${
                                        isActive
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
                        <h3 className="mt-2 text-3xl font-bold">â‚¹3,500</h3>
                        <p className="mt-2 text-sm text-indigo-100">
                            Keep growing your orders and earnings.
                        </p>
                    </div>
                </aside>

                <div className="flex-1">
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

                    <main className="p-4 sm:p-6 lg:p-8">{renderContent()}</main>
                </div>
            </div>
        </div>
    );
};

export default MrDashboard;

