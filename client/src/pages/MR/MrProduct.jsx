import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    CheckCircle2,
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

const calculateProductsBalance = (products = []) =>
    products.reduce(
        (totalBalance, product) => totalBalance + (Number(product?.price) || 0),
        0
    );

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
        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">
                {label} {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={currentPage === 1}
                    className="border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Prev
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={currentPage === totalPages}
                    className="border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
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

const DashboardHome = ({
    totalProducts,
    totalOrders = 0,
    deliveredOrders = 0,
    currentBalance = 0,
    recentSales = [],
    onViewOrders,
}) => {
    const averageProductValue = totalProducts > 0 ? currentBalance / totalProducts : 0;
    const productSalesPerPage = 4;
    const [salesPage, setSalesPage] = useState(1);
    const totalSalesPages = Math.max(
        1,
        Math.ceil(recentSales.length / productSalesPerPage)
    );
    const paginatedSales = recentSales.slice(
        (salesPage - 1) * productSalesPerPage,
        salesPage * productSalesPerPage
    );

    useEffect(() => {
        setSalesPage((currentPage) => Math.min(currentPage, totalSalesPages));
    }, [totalSalesPages]);

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
                    title="Current Balance"
                    value={formatCurrency(currentBalance)}
                    subtitle="Total value of added products"
                    icon={Wallet}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Product Sales
                        </h3>
                        <button
                            type="button"
                            onClick={onViewOrders}
                            className="bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                        >
                            View All
                        </button>
                    </div>

                    {recentSales.length > 0 ? (
                        <div className="space-y-4">
                            {paginatedSales.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between border border-slate-200 p-4"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {product.productName}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Quantity sold
                                        </p>
                                    </div>

                                    <span className="text-lg font-bold text-slate-900">
                                        {product.quantity}
                                    </span>
                                </div>
                            ))}

                            <PaginationControls
                                currentPage={salesPage}
                                totalPages={totalSalesPages}
                                onPrevious={() =>
                                    setSalesPage((currentPage) => Math.max(currentPage - 1, 1))
                                }
                                onNext={() =>
                                    setSalesPage((currentPage) =>
                                        Math.min(currentPage + 1, totalSalesPages)
                                    )
                                }
                            />
                        </div>
                    ) : (
                        <div className="border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                            No product sales found yet.
                        </div>
                    )}
                </div>

                <div className="border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 text-lg font-semibold text-slate-900">
                        Earnings Summary
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-indigo-50 p-4">
                            <p className="text-sm text-slate-600">Products Added</p>
                            <h4 className="mt-1 text-2xl font-bold text-indigo-700">
                                {totalProducts}
                            </h4>
                        </div>

                        <div className="bg-emerald-50 p-4">
                            <p className="text-sm text-slate-600">Average Product Value</p>
                            <h4 className="mt-1 text-2xl font-bold text-emerald-700">
                                {formatCurrency(averageProductValue)}
                            </h4>
                        </div>

                        <div className="bg-slate-100 p-4">
                            <p className="text-sm text-slate-600">Total Balance</p>
                            <h4 className="mt-1 text-2xl font-bold text-slate-900">
                                {formatCurrency(currentBalance)}
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
                <div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {paginatedProducts.map((product) => (
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
                                            {formatCurrency(product.price)}
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

            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                    Product Name
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
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
                                        className="border-t border-slate-200"
                                    >
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {order.productName}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
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

const EarningsSection = ({ products }) => {
    const totalProducts = products.length;
    const totalBalance = useMemo(() => calculateProductsBalance(products), [products]);
    const averageProductPrice = totalProducts > 0 ? totalBalance / totalProducts : 0;
    const highestValueProduct = useMemo(() => {
        if (!products.length) {
            return null;
        }

        return products.reduce((highestProduct, product) => {
            if ((Number(product?.price) || 0) > (Number(highestProduct?.price) || 0)) {
                return product;
            }

            return highestProduct;
        }, products[0]);
    }, [products]);

    return (
        <div>
            <SectionHeading
                title="Earnings"
                subtitle="See the total balance of all products you have added."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    title="Total Products"
                    value={totalProducts}
                    subtitle="Products added by you"
                    icon={IndianRupee}
                />
                <StatCard
                    title="Average Price"
                    value={formatCurrency(averageProductPrice)}
                    subtitle="Average value per product"
                    icon={Wallet}
                />
                <StatCard
                    title="Total Balance"
                    value={formatCurrency(totalBalance)}
                    subtitle="Sum of all added product prices"
                    icon={TrendingUp}
                />
            </div>

            <div className="mt-8 border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold text-slate-900">
                    Added Products Balance
                </h3>

                {products.length > 0 ? (
                    <div className="space-y-4">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="flex flex-col gap-3 border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <h4 className="font-semibold text-slate-900">
                                        {product.name}
                                    </h4>
                                    <p className="text-sm text-slate-500">
                                        {product.categoryName || "Uncategorized"}
                                    </p>
                                </div>

                                <span className="text-lg font-bold text-slate-900">
                                    {formatCurrency(product.price)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                        No products added yet, so balance is {formatCurrency(0)}.
                    </div>
                )}

                {highestValueProduct ? (
                    <div className="mt-5 bg-slate-50 p-4 text-sm text-slate-700">
                        Highest value product:{" "}
                        <span className="font-semibold text-slate-900">
                            {highestValueProduct.name}
                        </span>{" "}
                        ({formatCurrency(highestValueProduct.price)})
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

    const summarizedMrOrders = useMemo(
        () => summarizeOrdersByProduct(mrOrders),
        [mrOrders]
    );

    const totalBalance = useMemo(
        () => calculateProductsBalance(normalizedProducts),
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
                return <EarningsSection products={normalizedProducts} />;

            default:
                return (
                    <DashboardHome
                        totalProducts={normalizedProducts.length}
                        totalOrders={mrOrders.length}
                        deliveredOrders={
                            mrOrders.filter((order) => order.orderStatus === "delivered").length
                        }
                        currentBalance={totalBalance}
                        recentSales={summarizedMrOrders}
                        onViewOrders={() => setActiveTab("orders")}
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
                    className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
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
                            <h3 className="mt-2 text-3xl font-bold">
                                {formatCurrency(totalBalance)}
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
                                <div className="hidden items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 sm:flex">
                                    <Bell size={16} />
                                    <span>{unreadNotificationCount} unread</span>
                                </div>

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

