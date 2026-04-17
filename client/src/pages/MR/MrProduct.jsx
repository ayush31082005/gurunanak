import { useMemo, useState } from "react";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Wallet,
    Menu,
    X,
    IndianRupee,
    TrendingUp,
    Clock3,
    CheckCircle2,
    Eye,
    Pencil,
    Trash2,
    Plus,
    RotateCcw,
} from "lucide-react";

const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "My Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "returns", label: "Return Product", icon: RotateCcw },
    { id: "earnings", label: "Earning", icon: Wallet },
];

const initialProductsData = [
    {
        id: 1,
        name: "Herbal Protein Powder",
        category: "Nutrition",
        price: 899,
        stock: 34,
        status: "Active",
        image:
            "https://images.unsplash.com/photo-1579722821273-0f6c1f3f8b2f?auto=format&fit=crop&w=800&q=80",
        description: "High quality protein supplement for daily nutrition support.",
    },
    {
        id: 2,
        name: "Ayurvedic Immunity Booster",
        category: "Wellness",
        price: 499,
        stock: 18,
        status: "Active",
        image:
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
        description: "Ayurvedic formula that helps support immunity naturally.",
    },
    {
        id: 3,
        name: "Skin Care Combo Pack",
        category: "Beauty",
        price: 1299,
        stock: 8,
        status: "Low Stock",
        image:
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        description: "Complete skincare combo pack for healthy and glowing skin.",
    },
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
                                        {order.customer} • {order.product}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-slate-700">
                                        ₹{order.amount}
                                    </span>
                                    <span
                                        className={`px-3 py-1 text-xs font-semibold ${order.status === "Delivered"
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
                                ₹8,450
                            </h4>
                        </div>

                        <div className="bg-emerald-50 p-4">
                            <p className="text-sm text-slate-600">Last Withdrawal</p>
                            <h4 className="mt-1 text-2xl font-bold text-emerald-700">
                                ₹2,000
                            </h4>
                        </div>

                        <div className="bg-amber-50 p-4">
                            <p className="text-sm text-slate-600">Pending Settlement</p>
                            <h4 className="mt-1 text-2xl font-bold text-amber-700">
                                ₹1,250
                            </h4>
                        </div>

                        <div className="bg-slate-100 p-4">
                            <p className="text-sm text-slate-600">Net Earnings</p>
                            <h4 className="mt-1 text-2xl font-bold text-slate-900">
                                ₹{totalEarning}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductModal = ({
    isOpen,
    mode,
    formData,
    setFormData,
    onClose,
    onSave,
    viewProduct,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h3 className="text-lg font-bold text-slate-900">
                        {mode === "add" && "Add Product"}
                        {mode === "edit" && "Edit Product"}
                        {mode === "view" && "View Product"}
                    </h3>

                    <button
                        onClick={onClose}
                        className="border border-slate-300 p-2 text-slate-700 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {mode === "view" ? (
                    <div className="p-5">
                        <img
                            src={viewProduct.image}
                            alt={viewProduct.name}
                            className="h-64 w-full object-cover"
                        />

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Product Name
                                </p>
                                <p className="mt-1 text-base font-semibold text-slate-900">
                                    {viewProduct.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Category
                                </p>
                                <p className="mt-1 text-base text-slate-800">
                                    {viewProduct.category}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Price
                                </p>
                                <p className="mt-1 text-base text-slate-800">
                                    ₹{viewProduct.price}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Stock
                                </p>
                                <p className="mt-1 text-base text-slate-800">
                                    {viewProduct.stock}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Status
                                </p>
                                <p className="mt-1 text-base text-slate-800">
                                    {viewProduct.status}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Image URL
                                </p>
                                <p className="mt-1 break-all text-sm text-slate-700">
                                    {viewProduct.image}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-xs font-semibold uppercase text-slate-500">
                                Description
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-700">
                                {viewProduct.description}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={onClose}
                                className="bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter product name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter category"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    className="w-full border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                    className="w-full border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter price"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                    className="w-full border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter stock"
                                    value={formData.stock}
                                    onChange={(e) =>
                                        setFormData({ ...formData, stock: e.target.value })
                                    }
                                    className="w-full border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    placeholder="Paste image url"
                                    value={formData.image}
                                    onChange={(e) =>
                                        setFormData({ ...formData, image: e.target.value })
                                    }
                                    className="w-full border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>
                                <textarea
                                    rows="4"
                                    placeholder="Enter product description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={onSave}
                                className="bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                {mode === "add" ? "Add Product" : "Update Product"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductsSection = ({ products, setProducts }) => {
    const emptyForm = {
        name: "",
        category: "",
        price: "",
        stock: "",
        status: "Active",
        image: "",
        description: "",
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [formData, setFormData] = useState(emptyForm);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const openAddModal = () => {
        setModalMode("add");
        setFormData(emptyForm);
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setModalMode("edit");
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            status: product.status,
            image: product.image,
            description: product.description,
        });
        setIsModalOpen(true);
    };

    const openViewModal = (product) => {
        setModalMode("view");
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setFormData(emptyForm);
    };

    const handleSaveProduct = () => {
        if (
            !formData.name ||
            !formData.category ||
            !formData.price ||
            !formData.stock ||
            !formData.image ||
            !formData.description
        ) {
            alert("Please fill all fields");
            return;
        }

        if (modalMode === "add") {
            const newProduct = {
                id: Date.now(),
                name: formData.name,
                category: formData.category,
                price: Number(formData.price),
                stock: Number(formData.stock),
                status: formData.status,
                image: formData.image,
                description: formData.description,
            };

            setProducts([newProduct, ...products]);
        }

        if (modalMode === "edit" && selectedProduct) {
            const updatedProducts = products.map((item) =>
                item.id === selectedProduct.id
                    ? {
                        ...item,
                        name: formData.name,
                        category: formData.category,
                        price: Number(formData.price),
                        stock: Number(formData.stock),
                        status: formData.status,
                        image: formData.image,
                        description: formData.description,
                    }
                    : item
            );

            setProducts(updatedProducts);
        }

        closeModal();
    };

    const handleDeleteProduct = (productId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmDelete) return;

        const updatedProducts = products.filter((item) => item.id !== productId);
        setProducts(updatedProducts);
    };

    return (
        <div>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SectionHeading
                    title="My Products"
                    subtitle="Manage your listed products here."
                />

                <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

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
                                    {product.category}
                                </span>

                                <span
                                    className={`px-3 py-1 text-xs font-semibold ${product.status === "Active"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : product.status === "Low Stock"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-rose-100 text-rose-700"
                                        }`}
                                >
                                    {product.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900">
                                {product.name}
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                {product.description}
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                Stock: {product.stock} items
                            </p>

                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xl font-bold text-slate-900">
                                    ₹{product.price}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => openViewModal(product)}
                                    className="flex items-center justify-center gap-2 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                    <Eye size={15} />
                                    View
                                </button>

                                <button
                                    onClick={() => openEditModal(product)}
                                    className="flex items-center justify-center gap-2 bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                                >
                                    <Pencil size={15} />
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
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

            <ProductModal
                isOpen={isModalOpen}
                mode={modalMode}
                formData={formData}
                setFormData={setFormData}
                onClose={closeModal}
                onSave={handleSaveProduct}
                viewProduct={selectedProduct}
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
                                        ₹{order.amount}
                                    </td>
                                    <td className="px-5 py-4 text-sm">
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold ${order.status === "Delivered"
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
                                            ₹{item.amount}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {item.reason}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {item.date}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold ${item.status === "Pending"
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
                    value={`₹${totalCredit}`}
                    subtitle="All credited income"
                    icon={IndianRupee}
                />
                <StatCard
                    title="Total Debit"
                    value={`₹${totalDebit}`}
                    subtitle="Withdrawals and deductions"
                    icon={Clock3}
                />
                <StatCard
                    title="Available Balance"
                    value={`₹${balance}`}
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
                                    className={`px-3 py-1 text-xs font-semibold ${item.type === "Credit"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-rose-100 text-rose-700"
                                        }`}
                                >
                                    {item.type}
                                </span>

                                <span
                                    className={`text-lg font-bold ${item.type === "Credit"
                                            ? "text-emerald-700"
                                            : "text-rose-700"
                                        }`}
                                >
                                    {item.type === "Credit" ? "+" : "-"}₹{item.amount}
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
    const [activeTab, setActiveTab] = useState("earnings");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState(initialProductsData);

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

    const renderContent = () => {
        switch (activeTab) {
            case "products":
                return <ProductsSection products={products} setProducts={setProducts} />;

            case "orders":
                return <OrdersSection />;

            case "returns":
                return <ReturnsSection returns={returns} />;

            case "earnings":
                return <EarningsSection />;

            default:
                return (
                    <DashboardHome
                        totalProducts={products.length}
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
                    className={`fixed left-0 top-0 z-50 h-screen w-72 transform border-r border-slate-200 bg-white p-5 shadow-lg transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
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

                    <div className="mt-10 bg-gradient-to-br from-indigo-600 to-purple-600 p-5 text-white">
                        <p className="text-sm text-indigo-100">Current Balance</p>
                        <h3 className="mt-2 text-3xl font-bold">₹3,500</h3>
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
                                        Akash Gupta
                                    </p>
                                    <p className="text-xs text-slate-500">MR User</p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center bg-indigo-600 text-sm font-bold text-white">
                                    AG
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