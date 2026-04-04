import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
    FileText,
    House,
    LogOut,
    Menu,
    Package,
    ShoppingCart,
    TriangleAlert,
    X,
} from "lucide-react";
import API from "../api";
import Header from "../components/layout/Header";

const CHECKOUT_ADDRESS_STORAGE_KEY = "checkoutAddress";

const getStoredCheckoutAddress = () => {
    try {
        const storedAddress = localStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY);
        return storedAddress ? JSON.parse(storedAddress) : null;
    } catch {
        return null;
    }
};

const buildAddressText = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;

    const parts = [
        value.house,
        value.area,
        value.city,
        value.state,
        value.pincode ? `- ${value.pincode}` : "",
    ].filter(Boolean);

    return parts.join(", ").replace(", - ", " - ");
};

const mergeProfileData = (baseUser = {}, checkoutAddress = null, shippingInfo = null) => {
    const nextUser = { ...baseUser };
    const sourceAddress = shippingInfo || checkoutAddress;

    if (shippingInfo?.phone || checkoutAddress?.phone) {
        nextUser.phone = shippingInfo?.phone || checkoutAddress?.phone;
    }

    if (sourceAddress) {
        nextUser.address = buildAddressText(
            shippingInfo
                ? {
                    house: shippingInfo.address,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    pincode: shippingInfo.pincode,
                }
                : checkoutAddress
        );
    }

    return nextUser;
};

const statusTone = {
    pending: "bg-amber-100 text-amber-700",
    placed: "bg-emerald-100 text-emerald-700",
    shipped: "bg-sky-100 text-sky-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
    payment_pending: "bg-amber-100 text-amber-700",
    open: "bg-[#ffe7e3] text-[#FF6F61]",
    "in-progress": "bg-blue-100 text-blue-700",
    resolved: "bg-emerald-100 text-emerald-700",
    closed: "bg-slate-200 text-slate-700",
};

const UserDashboard = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("home");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [displayName, setDisplayName] = useState("User");
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState("");
    const [prescriptions, setPrescriptions] = useState([]);
    const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [complaintsLoading, setComplaintsLoading] = useState(false);

    const [complainForm, setComplainForm] = useState({
        subject: "",
        orderId: "",
        complaintType: "",
        message: "",
    });

    const pageRef = useRef(null);
    const sidebarRef = useRef(null);
    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const floatingBlobOneRef = useRef(null);
    const floatingBlobTwoRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        const storedCheckoutAddress = getStoredCheckoutAddress();

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        let isMounted = true;
        let parsedUser = null;

        try {
            parsedUser = storedUser ? JSON.parse(storedUser) : null;
            const rawName =
                parsedUser?.name ||
                parsedUser?.fullName ||
                parsedUser?.username ||
                parsedUser?.userName ||
                parsedUser?.email?.split("@")[0] ||
                "";

            const formattedName = rawName
                ? rawName
                    .replace(/[._-]+/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())
                : "User";

            const mergedUser = mergeProfileData(parsedUser || {}, storedCheckoutAddress);

            setDisplayName(formattedName);
            setUserData(mergedUser);
        } catch {
            setDisplayName("User");
            setUserData(null);
        }

        const loadLatestShippingInfo = async () => {
            try {
                if (isMounted) {
                    setOrdersLoading(true);
                    setPrescriptionsLoading(true);
                }

                const [ordersResponse, prescriptionsResponse] = await Promise.all([
                    API.get("/orders/my"),
                    API.get("/prescriptions/my"),
                ]);

                if (!isMounted) return;

                const nextOrders = Array.isArray(ordersResponse.data?.orders)
                    ? ordersResponse.data.orders
                    : [];
                const nextPrescriptions = Array.isArray(prescriptionsResponse.data?.prescriptions)
                    ? prescriptionsResponse.data.prescriptions.filter(
                        (prescription) =>
                            (prescription?.email || "").toLowerCase() ===
                            (parsedUser?.email || "").toLowerCase()
                    )
                    : [];

                setOrders(nextOrders);
                setPrescriptions(nextPrescriptions);

                if (!nextOrders.length) return;

                const latestOrderWithShipping = nextOrders.find((order) => order?.shippingInfo);

                if (!latestOrderWithShipping?.shippingInfo) return;

                setUserData((currentUser) =>
                    mergeProfileData(
                        currentUser || parsedUser || {},
                        storedCheckoutAddress,
                        latestOrderWithShipping.shippingInfo
                    )
                );
            } catch {
                if (isMounted) {
                    setOrders([]);
                    setPrescriptions([]);
                }
            } finally {
                if (isMounted) {
                    setOrdersLoading(false);
                    setPrescriptionsLoading(false);
                }
            }
        };

        loadLatestShippingInfo();
        window.addEventListener("profiledatachange", loadLatestShippingInfo);

        return () => {
            isMounted = false;
            window.removeEventListener("profiledatachange", loadLatestShippingInfo);
        };
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        fetchMyComplaints();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set([heroRef.current, contentRef.current], {
                opacity: 0,
                y: 28,
            });

            gsap.set(sidebarRef.current, { opacity: 1 });

            gsap.to(heroRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.12,
                ease: "power3.out",
            });

            gsap.to(contentRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.85,
                delay: 0.2,
                ease: "power3.out",
            });

            if (floatingBlobOneRef.current) {
                gsap.to(floatingBlobOneRef.current, {
                    y: -18,
                    x: 14,
                    duration: 4,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            }

            if (floatingBlobTwoRef.current) {
                gsap.to(floatingBlobTwoRef.current, {
                    y: 16,
                    x: -12,
                    duration: 5,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            }

            gsap.fromTo(
                ".dashboard-menu-item",
                { opacity: 0, x: -18 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.55,
                    stagger: 0.08,
                    delay: 0.18,
                    ease: "power3.out",
                }
            );
        }, pageRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".dashboard-panel-card",
                { opacity: 0, y: 20, scale: 0.98 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.55,
                    stagger: 0.08,
                    ease: "power2.out",
                }
            );
        }, contentRef);

        return () => ctx.revert();
    }, [activeTab, orders, prescriptions, complaints]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("authchange"));
        setIsMobileSidebarOpen(false);
        navigate("/login", { replace: true });
    };

    const cartItems = useMemo(() => {
        try {
            const storedCart = localStorage.getItem("cartItems");
            return storedCart ? JSON.parse(storedCart) : [];
        } catch {
            return [];
        }
    }, []);

    const fetchMyComplaints = async () => {
        try {
            setComplaintsLoading(true);
            const { data } = await API.get("/complaints/my");

            if (data.success) {
                setComplaints(data.complaints || []);
                return;
            }

            setComplaints([]);
        } catch {
            setComplaints([]);
        } finally {
            setComplaintsLoading(false);
        }
    };

    const handleComplaintChange = (e) => {
        const { name, value } = e.target;
        setComplainForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleComplaintSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await API.post("/complaints/create", {
                subject: complainForm.subject,
                orderId: complainForm.orderId || "",
                complaintType: complainForm.complaintType,
                message: complainForm.message,
            });

            if (data.success) {
                alert("Complaint submitted successfully");

                setComplainForm({
                    subject: "",
                    orderId: "",
                    complaintType: "",
                    message: "",
                });

                fetchMyComplaints();
            }
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to submit complaint");
        }
    };

    const handleOrderCancel = async (orderId) => {
        try {
            setCancellingOrderId(orderId);

            const { data } = await API.put(`/orders/my/${orderId}/cancel`);

            if (data.success) {
                setOrders((currentOrders) =>
                    currentOrders.map((order) =>
                        order._id === orderId ? { ...order, ...data.order } : order
                    )
                );
            }
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to cancel order");
        } finally {
            setCancellingOrderId("");
        }
    };

    const menuItems = [
        { key: "home", label: "Home", icon: House },
        { key: "cart", label: "Cart", icon: ShoppingCart },
        { key: "orders", label: "Orders", icon: Package },
        { key: "prescription", label: "Prescription", icon: FileText },
        { key: "complain", label: "Complain", icon: TriangleAlert },
    ];

    const quickStats = [
        {
            label: "Total Orders",
            value: orders.length,
            bg: "from-[#FF6F61] to-[#FF6F61]",
        },
        {
            label: "Prescriptions",
            value: prescriptions.length,
            bg: "from-sky-500 to-cyan-400",
        },
        {
            label: "Complaints",
            value: complaints.length,
            bg: "from-violet-500 to-fuchsia-400",
        },
    ];

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 3);
    }, [orders]);

    const PanelShell = ({ title, subtitle, children }) => (
        <div className="dashboard-panel-card overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
                    {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
                </div>
            </div>
            {children}
        </div>
    );

    const InfoCard = ({ label, value }) => (
        <div className="dashboard-panel-card h-fit rounded-[22px] border border-slate-200/70 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-bold leading-6 text-slate-800">
                {value || "Not available"}
            </p>
        </div>
    );

    const renderHome = () => (
        <div className="space-y-6">
            <div
                ref={heroRef}
                className="dashboard-panel-card relative overflow-hidden rounded-[34px] border border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-[#FF6F61] px-6 py-7 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:px-8 sm:py-8"
            >
                <div className="absolute right-0 top-0 h-full w-[220px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.22),_transparent_62%)]" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Welcome back, {displayName}
                        </h1>
                        {/* <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                            Manage orders, prescriptions, cart items and complaints from one modern dashboard.
                        </p> */}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {quickStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center backdrop-blur-sm"
                            >
                                <p className="text-2xl font-extrabold">{stat.value}</p>
                                <p className="mt-1 text-xs text-white/70">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid max-w-full items-start gap-4 md:grid-cols-2 xl:grid-cols-12">
                <div className="xl:col-span-2">
                    <InfoCard label="User Name" value={displayName} />
                </div>
                <div className="xl:col-span-3">
                    <InfoCard label="Email Address" value={userData?.email} />
                </div>
                <div className="xl:col-span-2">
                    <InfoCard label="Phone Number" value={userData?.phone || userData?.mobile} />
                </div>
                <div className="xl:col-span-5">
                    <InfoCard label="Address" value={buildAddressText(userData?.address) || "No address added yet"} />
                </div>
            </div>

            <PanelShell title="Recent Orders" subtitle="Your latest orders are shown here.">
                {ordersLoading ? (
                    <div className="rounded-[24px] bg-slate-50 p-6 text-center text-slate-500">
                        Loading orders...
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="rounded-[24px] bg-slate-50 p-6 text-center text-slate-500">
                        No recent orders found.
                    </div>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-3">
                        {recentOrders.map((order) => (
                            <div
                                key={order._id}
                                className="dashboard-panel-card rounded-[24px] border border-slate-200 bg-white p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-mono text-xs font-semibold text-slate-500">
                                            {order._id}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone[order.status] || "bg-[#ffe7e3] text-[#FF6F61]"
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {order.items?.slice(0, 2).map((item, index) => (
                                        <div
                                            key={`${order._id}-${index}`}
                                            className="rounded-2xl bg-slate-50 px-3 py-2"
                                        >
                                            <p className="text-sm font-semibold text-slate-800">
                                                {item.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Qty: {item.quantity || 1}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-slate-500">
                                        {order.items?.length || 0} items
                                    </p>
                                    <p className="text-lg font-extrabold text-[#FF6F61]">
                                        Rs. {order.total ?? 0}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </PanelShell>
        </div>
    );

    const renderCart = () => (
        <PanelShell title="My Cart" subtitle="Your saved cart items at a glance.">
            {cartItems.length === 0 ? (
                <div className="dashboard-panel-card rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <h3 className="text-lg font-bold text-slate-800">No items in cart</h3>
                    <p className="mt-2 text-sm text-slate-500">Add products to your cart and they will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {cartItems.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="dashboard-panel-card flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-gradient-to-r from-white to-[#fff4f1]/60 p-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-start gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{item.name || item.title || "Product"}</h3>
                                    <p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity || 1}</p>
                                </div>
                            </div>
                            <p className="text-lg font-extrabold text-[#FF6F61]">₹{item.price || item.salePrice || 0}</p>
                        </div>
                    ))}
                </div>
            )}
        </PanelShell>
    );

    const renderOrders = () => (
        <PanelShell title="My Orders" subtitle="Track all the products you have ordered.">
            {ordersLoading ? (
                <div className="rounded-[24px] bg-slate-50 p-8 text-center text-slate-500">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="rounded-[24px] bg-slate-50 p-8 text-center text-slate-500">No orders found.</div>
            ) : (
                <div className="dashboard-panel-card overflow-hidden rounded-[26px] border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-[#fff4f1]/80 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Order</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Items</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Payment</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Amount</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const canCancel = ["pending", "payment_pending", "placed"].includes(order.status);

                                    return (
                                        <tr
                                            key={`table-${order._id}`}
                                            className="border-t border-slate-100 align-top transition hover:bg-slate-50/70"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="font-mono text-xs font-semibold text-slate-700">{order._id}</p>
                                                <p className="mt-2 text-sm font-medium text-slate-800">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-2">
                                                    {order.items?.length ? (
                                                        order.items.map((item, index) => (
                                                            <div
                                                                key={`${order._id}-${index}`}
                                                                className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                                                            >
                                                                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    Qty: {item.quantity || 1}
                                                                    {item.pack ? ` • ${item.pack}` : ""}
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-slate-500">No items found</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-2 text-sm text-slate-600">
                                                    <p className="font-semibold text-slate-800">{order.paymentMethod || "N/A"}</p>
                                                    <p>Subtotal: Rs. {order.subtotal ?? 0}</p>
                                                    <p>Discount: Rs. {order.discount ?? 0}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-lg font-extrabold text-[#FF6F61]">Rs. {order.total ?? 0}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone[order.status] || "bg-[#ffe7e3] text-[#FF6F61]"
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {canCancel ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOrderCancel(order._id)}
                                                        disabled={cancellingOrderId === order._id}
                                                        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {cancellingOrderId === order._id ? "Cancelling..." : "Cancel Order"}
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-slate-400">Not available</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {false ? orders.map((order) => (
                        <div
                            key={order._id}
                            className="dashboard-panel-card overflow-hidden rounded-[26px] border border-slate-200 bg-white"
                        >
                            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-[#fff4f1]/80 px-4 py-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Order ID: {order._id}</h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Date: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <span
                                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone[order.status] || "bg-[#ffe7e3] text-[#FF6F61]"
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                {["pending", "payment_pending", "placed"].includes(order.status) ? (
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleOrderCancel(order._id)}
                                            disabled={cancellingOrderId === order._id}
                                            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {cancellingOrderId === order._id ? "Cancelling..." : "Cancel Order"}
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            <div className="space-y-2.5 p-4">
                                {order.items?.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-800">{item.name}</p>
                                            <p className="mt-1 text-sm text-slate-500">Qty: {item.quantity}</p>
                                            {item.pack ? <p className="text-sm text-slate-500">{item.pack}</p> : null}
                                        </div>
                                        <p className="text-base font-bold text-[#FF6F61]">₹{item.price}</p>
                                    </div>
                                ))}

                                <div className="grid gap-2 pt-1 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3">Payment: {order.paymentMethod}</div>
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3">Total: ₹{order.total}</div>
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3">Subtotal: ₹{order.subtotal}</div>
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3">Discount: ₹{order.discount}</div>
                                </div>
                            </div>
                        </div>
                    )) : null}
                </div>
            )}
        </PanelShell>
    );

    const renderPrescription = () => (
        <PanelShell title="Prescription Details" subtitle="All your uploaded prescriptions in one place.">
            {prescriptionsLoading ? (
                <div className="rounded-[24px] bg-slate-50 p-8 text-center text-slate-500">
                    Loading prescriptions...
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="rounded-[24px] bg-slate-50 p-8 text-center text-slate-500">
                    No prescriptions found.
                </div>
            ) : (
                <div className="dashboard-panel-card overflow-hidden rounded-[26px] border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] border-collapse">
                            <thead>
                                <tr className="bg-slate-50/90 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Prescription</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Patient</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Contact</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Address</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.map((prescription) => (
                                    <tr
                                        key={prescription._id}
                                        className="border-t border-slate-100 align-top transition hover:bg-slate-50/70"
                                    >
                                        <td className="px-4 py-4">
                                            <p className="font-mono text-xs font-semibold text-slate-700">{prescription._id}</p>
                                            <p className="mt-2 text-sm font-medium text-slate-800">
                                                {new Date(prescription.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500">
                                                {prescription.fileName || "No file name"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-2 text-sm text-slate-600">
                                                <p className="font-semibold text-slate-800">{prescription.name || "N/A"}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-2 text-sm text-slate-600">
                                                <p>{prescription.email || "N/A"}</p>
                                                <p>{prescription.mobile || "N/A"}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="max-w-[240px] text-sm text-slate-600">
                                                {prescription.address || "N/A"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone[prescription.status] || "bg-[#ffe7e3] text-[#FF6F61]"
                                                    }`}
                                            >
                                                {prescription.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {prescription.fileUrl ? (
                                                <a
                                                    href={prescription.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-full bg-[#FF6F61] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#f56557]"
                                                >
                                                    View File
                                                </a>
                                            ) : (
                                                <span className="text-sm text-slate-400">Not available</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </PanelShell>
    );

    const renderComplain = () => (
        <PanelShell title="Register Complaint" subtitle="Submit and track your complaint requests easily.">
            <div>
                <form onSubmit={handleComplaintSubmit} className="dashboard-panel-card rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={complainForm.subject}
                                onChange={handleComplaintChange}
                                placeholder="Enter complaint subject"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#FF6F61]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Order ID</label>
                            <input
                                type="text"
                                name="orderId"
                                value={complainForm.orderId}
                                onChange={handleComplaintChange}
                                placeholder="Enter related order id"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#FF6F61]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Complaint Type</label>
                            <select
                                name="complaintType"
                                value={complainForm.complaintType}
                                onChange={handleComplaintChange}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#FF6F61]"
                                required
                            >
                                <option value="">Select complaint type</option>
                                <option value="late-delivery">Late Delivery</option>
                                <option value="wrong-product">Wrong Product</option>
                                <option value="damaged-product">Damaged Product</option>
                                <option value="payment-issue">Payment Issue</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Complaint Message</label>
                            <textarea
                                name="message"
                                value={complainForm.message}
                                onChange={handleComplaintChange}
                                rows="6"
                                placeholder="Write your complaint here..."
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#FF6F61]"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="inline-flex rounded-full bg-[#FF6F61] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#f56557]"
                            >
                                Submit Complaint
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
                <h3 className="text-xl font-bold text-slate-800">My Complaints</h3>

                {complaintsLoading ? (
                    <div className="mt-4 rounded-[24px] bg-slate-50 p-8 text-center text-slate-500">
                        Loading complaints...
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="mt-4 rounded-[24px] bg-slate-50 p-8 text-center text-slate-500">
                        No complaints found.
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        {complaints.map((complaint) => (
                            <div
                                key={complaint._id}
                                className="dashboard-panel-card rounded-[24px] border border-slate-200 bg-white p-5"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <h4 className="text-lg font-bold text-slate-800">{complaint.subject}</h4>
                                    <span
                                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone[complaint.status] || "bg-[#ffe7e3] text-[#FF6F61]"
                                            }`}
                                    >
                                        {complaint.status}
                                    </span>
                                </div>

                                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                    <p>Type: {complaint.complaintType}</p>
                                    <p>Date: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                                    <p>Order ID: {complaint.order?._id || complaint.orderId || "N/A"}</p>
                                </div>

                                <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                                    {complaint.message}
                                </p>

                                {complaint.adminReply ? (
                                    <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-slate-700">
                                        <span className="font-semibold text-emerald-700">Admin Reply:</span>{" "}
                                        {complaint.adminReply}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PanelShell>
    );

    const renderContent = () => {
        switch (activeTab) {
            case "cart":
                return renderCart();
            case "orders":
                return renderOrders();
            case "prescription":
                return renderPrescription();
            case "complain":
                return renderComplain();
            case "home":
            default:
                return renderHome();
        }
    };

    const handleMenuItemClick = (tabKey) => {
        setActiveTab(tabKey);
        setIsMobileSidebarOpen(false);
    };

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    return (
        <>
        <Header />
        <section
            ref={pageRef}
            className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,237,213,0.9),_transparent_35%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_28%,#f8fafc_100%)] pt-[114px] md:pt-[94px] lg:pt-[98px]"
        >
            <div
                ref={floatingBlobOneRef}
                className="pointer-events-none absolute left-[-60px] top-[140px] h-56 w-56 rounded-full bg-[#ffc1ba]/30 blur-3xl"
            />
            <div
                ref={floatingBlobTwoRef}
                className="pointer-events-none absolute right-[-50px] top-[220px] h-64 w-64 rounded-full bg-sky-200/30 blur-3xl"
            />

            {isMobileSidebarOpen ? (
                <div
                    className="fixed inset-x-0 bottom-0 top-[114px] z-30 bg-slate-900/50 md:top-[94px] lg:hidden"
                    onClick={closeMobileSidebar}
                    onTouchEnd={closeMobileSidebar}
                />
            ) : null}

            <aside
                ref={sidebarRef}
                className={`fixed left-0 top-[114px] z-40 flex h-[calc(100vh-114px)] w-[280px] flex-col overflow-hidden border-r border-slate-200 bg-white transition-transform duration-300 md:top-[94px] md:h-[calc(100vh-94px)] lg:top-[98px] lg:h-[calc(100vh-98px)] lg:translate-x-0 ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Gurunanak Pharmacy</h1>
                    </div>

                    <button
                        type="button"
                        className="relative z-10 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        onClick={closeMobileSidebar}
                        onTouchEnd={closeMobileSidebar}
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                    <div className="rounded-3xl bg-gradient-to-br from-[#ff6f61] to-[#f45d4f] px-4 py-5 text-white shadow-lg shadow-[#ff6f61]/20">
                        <p className="text-sm font-semibold text-white/80">Logged in as</p>
                        <h2 className="mt-2 text-xl font-bold">{displayName}</h2>
                        <p className="mt-1 break-words text-sm text-white/80">
                            {userData?.email || "user@email.com"}
                        </p>
                    </div>

                    <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Main Menu
                    </p>

                    <nav className="mt-4 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = activeTab === item.key;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => handleMenuItemClick(item.key)}
                                    className={`dashboard-menu-item flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${isActive
                                        ? "bg-[#ff6f61] text-white shadow-lg shadow-[#ff6f61]/25"
                                        : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-8 border-t border-slate-200 pt-6">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="dashboard-menu-item flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#ff6f61]"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            <div className="lg:pl-[280px]">
                <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 sm:pt-5 lg:px-8">
                    <div className="mb-4 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                        >
                            <Menu size={18} />
                            Menu
                        </button>
                    </div>

                    <div ref={contentRef} className="min-w-0">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </section>
        </>
    );
};

export default UserDashboard;
