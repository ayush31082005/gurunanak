import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { gsap } from "gsap";
import {
    FileText,
    House,
    LogOut,
    Menu,
    Package,
    Plus,
    ShoppingCart,
    Landmark,
    X,
    Bell,
    Trash2,
} from "lucide-react";
import Reminder from "./Reminder";
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

const mapShippingInfoToCheckoutAddress = (shippingInfo = {}) => {
    const addressParts = String(shippingInfo.address || "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    const [house = "", ...restAddressParts] = addressParts;

    return {
        fullName: shippingInfo.fullName || shippingInfo.name || "",
        phone: shippingInfo.phone || shippingInfo.mobile || "",
        email: shippingInfo.email || "",
        house,
        area: restAddressParts.join(", "),
        city: shippingInfo.city || "",
        state: shippingInfo.state || "",
        pincode: shippingInfo.pincode ? String(shippingInfo.pincode) : "",
    };
};

const mapOrderItemsToCheckoutItems = (items = []) =>
    items
        .map((item) => ({
            id: item.productId || item.id || "",
            productId: item.productId || item.id || "",
            name: item.name || "Product",
            image: item.image || "",
            pack: item.pack || item.qty || "1 unit",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
        }))
        .filter((item) => item.name && Number.isFinite(item.price));

const getOrderDeliveredAt = (order) => {
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

const isReturnWindowOpen = (order) => {
    const deliveredAt = getOrderDeliveredAt(order);

    if (!deliveredAt) {
        return false;
    }

    const deadline = new Date(deliveredAt);
    deadline.setDate(deadline.getDate() + 7);

    return Date.now() <= deadline.getTime();
};

const canOrderBeReturned = (order) =>
    order?.orderType !== "replacement" &&
    String(order?.status || "").toLowerCase() === "delivered" &&
    !order?.isReturnRequested &&
    isReturnWindowOpen(order);

const humanize = (value = "") =>
    String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const statusTone = {
    pending: "bg-amber-100 text-amber-700",
    pick_product: "bg-orange-100 text-orange-700",
    placed: "bg-emerald-100 text-emerald-700",
    shipped: "bg-sky-100 text-sky-700",
    out_for_delivery: "bg-sky-100 text-sky-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
    payment_pending: "bg-amber-100 text-amber-700",
    open: "bg-[#E0F2FE] text-[#0EA5E9]",
    "in-progress": "bg-blue-100 text-blue-700",
    resolved: "bg-emerald-100 text-emerald-700",
    closed: "bg-slate-200 text-slate-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    refund_completed: "bg-emerald-100 text-emerald-700",
    replacement_created: "bg-sky-100 text-sky-700",
};

const getNormalizedOrderStatus = (order) => {
    const rawStatus = String(order?.status || "").toLowerCase();
    const paymentMethod = String(order?.paymentMethod || "").toLowerCase();

    if (paymentMethod === "cod" && ["pending", "payment_pending"].includes(rawStatus)) {
        return "placed";
    }

    return rawStatus || "pending";
};

const getOrderStatusLabel = (order) => {
    const normalizedStatus = getNormalizedOrderStatus(order);

    if (normalizedStatus === "payment_pending") {
        return "Awaiting Payment";
    }

    return humanize(normalizedStatus);
};

const getOrderPaymentLabel = (order) => {
    if (order?.orderType === "replacement") {
        return "Replacement";
    }

    const paymentMethod = String(order?.paymentMethod || "").toLowerCase();

    if (paymentMethod === "cod") {
        return "COD";
    }

    if (["card", "upi"].includes(paymentMethod)) {
        return order?.razorpayPaymentId ? "Razorpay Paid" : "Awaiting Payment";
    }

    return humanize(order?.paymentMethod || "N/A");
};

const getOrderSortTimestamp = (order) =>
    new Date(order?.updatedAt || order?.createdAt || 0).getTime();

const getReturnStatusLabel = (order) => {
    if (!order?.isReturnRequested) {
        return "";
    }

    const returnStatus = String(order?.returnStatus || "").toLowerCase();
    const refundStatus = String(order?.refundStatus || "").toLowerCase();

    if (returnStatus === "replacement_created") {
        return "Replacement Created";
    }

    if (returnStatus === "refund_completed" || refundStatus === "manual_completed") {
        return "Refund Completed";
    }

    if (refundStatus === "picked_up") {
        return "Pick Up Product";
    }

    if (refundStatus === "manual_pending") {
        return "Refund In Process";
    }

    if (returnStatus === "approved" || refundStatus === "approved") {
        return "Return Approved";
    }

    if (returnStatus === "rejected" || refundStatus === "rejected") {
        return "Return Rejected";
    }

    return "Return Requested";
};

const validDashboardTabs = new Set([
    "home",
    "cart",
    "orders",
    "prescription",
    "bank",
    "reminders",
]);

const PanelShell = ({ title, subtitle, headerAction = null, children, shellClassName = "" }) => (
    <div className={`dashboard-panel-card overflow-hidden rounded-none border border-white/60 bg-white/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5 ${shellClassName}`}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
                {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            {headerAction ? <div className="flex items-center">{headerAction}</div> : null}
        </div>
        {children}
    </div>
);

const InfoCard = ({ label, value }) => (
    <div className="dashboard-panel-card h-fit rounded-none border border-slate-200/70 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-bold leading-6 text-slate-800">
            {value || "Not available"}
        </p>
    </div>
);

const UserDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState("home");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [displayName, setDisplayName] = useState("User");
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState("");
    const [activeOrderFilter, setActiveOrderFilter] = useState("all");
    const [ordersPage, setOrdersPage] = useState(1);
    const [prescriptions, setPrescriptions] = useState([]);
    const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
    const [reorderingPrescriptionId, setReorderingPrescriptionId] = useState("");
    const [reminders, setReminders] = useState([]);
    const [remindersLoading, setRemindersLoading] = useState(false);
    const [savedBanks, setSavedBanks] = useState([]);
    const [banksLoading, setBanksLoading] = useState(false);
    const [bankSubmitting, setBankSubmitting] = useState(false);
    const [deletingBankId, setDeletingBankId] = useState("");
    const [bankForm, setBankForm] = useState({
        accountHolderName: "",
        email: "",
        mobileNumber: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        branchName: "",
        upiId: "",
    });

    const pageRef = useRef(null);
    const sidebarRef = useRef(null);
    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const floatingBlobOneRef = useRef(null);
    const floatingBlobTwoRef = useRef(null);

    useEffect(() => {
        const requestedTab = searchParams.get("tab");
        const normalizedRequestedTab = requestedTab === "complain" ? "bank" : requestedTab;
        const nextTab =
            normalizedRequestedTab && validDashboardTabs.has(normalizedRequestedTab)
                ? normalizedRequestedTab
                : "home";

        setActiveTab(nextTab);
    }, [searchParams]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        const storedCheckoutAddress = getStoredCheckoutAddress();

        if (!token) {
            navigate("/login", {
                replace: true,
                state: {
                    redirectTo: `${location.pathname}${location.search}`,
                },
            });
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
                    setRemindersLoading(true);
                    setBanksLoading(true);
                }

                const [ordersResponse, prescriptionsResponse, remindersResponse, bankAccountsResponse] = await Promise.all([
                    API.get("/orders/my"),
                    API.get("/prescriptions/my"),
                    API.get("/reminders/my"),
                    API.get("/banks/my"),
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
                setReminders(Array.isArray(remindersResponse.data?.reminders) ? remindersResponse.data.reminders : []);
                setSavedBanks(Array.isArray(bankAccountsResponse.data?.bankAccounts) ? bankAccountsResponse.data.bankAccounts : []);

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
                    setSavedBanks([]);
                }
            } finally {
                if (isMounted) {
                    setOrdersLoading(false);
                    setPrescriptionsLoading(false);
                    setRemindersLoading(false);
                    setBanksLoading(false);
                }
            }
        };

        loadLatestShippingInfo();
        window.addEventListener("profiledatachange", loadLatestShippingInfo);

        return () => {
            isMounted = false;
            window.removeEventListener("profiledatachange", loadLatestShippingInfo);
        };
    }, [location.pathname, location.search, navigate]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const initialTargets = [contentRef.current].filter(Boolean);
            if (heroRef.current) initialTargets.unshift(heroRef.current);

            if (initialTargets.length) {
                gsap.set(initialTargets, {
                    opacity: 0,
                    y: 28,
                });
            }

            if (sidebarRef.current) {
                gsap.set(sidebarRef.current, { opacity: 1 });
            }

            if (heroRef.current) {
                gsap.to(heroRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: 0.12,
                    ease: "power3.out",
                });
            }

            if (contentRef.current) {
                gsap.to(contentRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.85,
                    delay: 0.2,
                    ease: "power3.out",
                });
            }

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
        }, pageRef.current);

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
        }, contentRef.current);

        return () => ctx.revert();
    }, [activeTab, orders, prescriptions, savedBanks]);

    useEffect(() => {
        setBankForm((currentForm) => ({
            ...currentForm,
            email: currentForm.email || userData?.email || "",
            mobileNumber: currentForm.mobileNumber || userData?.phone || "",
        }));
    }, [userData?.email, userData?.phone]);

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

    const fetchMyBanks = async () => {
        try {
            setBanksLoading(true);
            const { data } = await API.get("/banks/my");
            setSavedBanks(Array.isArray(data.bankAccounts) ? data.bankAccounts : []);
        } catch {
            setSavedBanks([]);
        } finally {
            setBanksLoading(false);
        }
    };

    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setBankForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBankSubmit = async (e) => {
        e.preventDefault();

        try {
            setBankSubmitting(true);
            const { data } = await API.post("/banks", {
                accountHolderName: bankForm.accountHolderName.trim(),
                email: bankForm.email.trim().toLowerCase(),
                mobileNumber: bankForm.mobileNumber.trim(),
                bankName: bankForm.bankName.trim(),
                accountNumber: bankForm.accountNumber.trim(),
                ifscCode: bankForm.ifscCode.trim().toUpperCase(),
                branchName: bankForm.branchName.trim(),
                upiId: bankForm.upiId.trim(),
            });

            if (data?.success && data?.bankAccount) {
                setSavedBanks((currentBanks) => [data.bankAccount, ...currentBanks]);
                setBankForm({
                    accountHolderName: "",
                    email: userData?.email || "",
                    mobileNumber: userData?.phone || "",
                    bankName: "",
                    accountNumber: "",
                    ifscCode: "",
                    branchName: "",
                    upiId: "",
                });
                alert("Bank account added successfully");
            }
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to add bank account");
        } finally {
            setBankSubmitting(false);
        }
    };

    const handleDeleteBank = async (bankId) => {
        try {
            setDeletingBankId(bankId);
            await API.delete(`/banks/${bankId}`);
            setSavedBanks((currentBanks) => currentBanks.filter((bank) => bank._id !== bankId));
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to remove bank account");
        } finally {
            setDeletingBankId("");
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

    const handleOrderReturn = (orderId) => {
        navigate(`/returns?orderId=${orderId}`);
    };

    const handleOrderDetails = (orderId) => {
        navigate(`/order-details/${orderId}`);
    };

    const handleReorder = (order) => {
        const checkoutItems = mapOrderItemsToCheckoutItems(order?.items);

        if (!checkoutItems.length) {
            alert("No products found in this order to reorder");
            return;
        }

        navigate("/checkout", {
            state: {
                checkoutItems,
                address: mapShippingInfoToCheckoutAddress(order?.shippingInfo),
            },
        });
    };

    const handlePrescriptionReorder = async (prescriptionId) => {
        try {
            setReorderingPrescriptionId(prescriptionId);

            const { data } = await API.post(`/prescriptions/${prescriptionId}/reorder`);

            if (data?.success && data?.prescription) {
                setPrescriptions((currentPrescriptions) => [
                    data.prescription,
                    ...currentPrescriptions,
                ]);
                alert("Prescription reordered successfully");
            }
        } catch (error) {
            alert(
                error?.response?.data?.message || "Failed to reorder prescription"
            );
        } finally {
            setReorderingPrescriptionId("");
        }
    };

    const menuItems = [
        { key: "home", label: "Home", icon: House },
        { key: "cart", label: "Cart", icon: ShoppingCart },
        { key: "orders", label: "Orders", icon: Package },
        { key: "prescription", label: "Prescription", icon: FileText },
        { key: "bank", label: "Add Bank", icon: Landmark },
        { key: "reminders", label: "Reminders", icon: Bell },
    ];

    const quickStats = [
        {
            label: "Total Orders",
            value: orders.length,
            bg: "from-[#0EA5E9] to-[#0EA5E9]",
        },
        {
            label: "Prescriptions",
            value: prescriptions.length,
            bg: "from-sky-500 to-cyan-400",
        },
        {
            label: "Bank Accounts",
            value: savedBanks.length,
            bg: "from-violet-500 to-fuchsia-400",
        },
    ];

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => getOrderSortTimestamp(b) - getOrderSortTimestamp(a))
            .slice(0, 3);
    }, [orders]);

    const orderTabs = useMemo(
        () => [
            { key: "all", label: "All Orders" },
            { key: "pending", label: "Pending" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
        ],
        []
    );

    const filteredOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => getOrderSortTimestamp(b) - getOrderSortTimestamp(a))
            .filter((order) => {
                const status = getNormalizedOrderStatus(order);
                const matchesFilter =
                    activeOrderFilter === "all" ||
                    (activeOrderFilter === "active" &&
                        ["pending", "payment_pending", "pick_product", "placed", "shipped", "out_for_delivery"].includes(status)) ||
                    (activeOrderFilter === "pending" &&
                        ["pending", "payment_pending", "pick_product", "placed"].includes(status)) ||
                    (activeOrderFilter === "delivered" && status === "delivered") ||
                    (activeOrderFilter === "cancelled" && status === "cancelled");

                return matchesFilter;
            });
    }, [activeOrderFilter, orders]);

    const ordersPerPage = 5;
    const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));

    const paginatedOrders = useMemo(() => {
        const startIndex = (ordersPage - 1) * ordersPerPage;
        return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
    }, [filteredOrders, ordersPage]);

    const [prescriptionsPage, setPrescriptionsPage] = useState(1);
    const prescriptionsPerPage = 5;
    const totalPrescriptionPages = Math.max(1, Math.ceil(prescriptions.length / prescriptionsPerPage));

    const paginatedPrescriptions = useMemo(() => {
        const startIndex = (prescriptionsPage - 1) * prescriptionsPerPage;
        return prescriptions.slice(startIndex, startIndex + prescriptionsPerPage);
    }, [prescriptions, prescriptionsPage]);

    useEffect(() => {
        setOrdersPage(1);
    }, [activeOrderFilter]);

    useEffect(() => {
        if (ordersPage > totalOrderPages) {
            setOrdersPage(totalOrderPages);
        }
    }, [ordersPage, totalOrderPages]);

    useEffect(() => {
        setPrescriptionsPage(1);
    }, [prescriptions]);

    useEffect(() => {
        if (prescriptionsPage > totalPrescriptionPages) {
            setPrescriptionsPage(totalPrescriptionPages);
        }
    }, [prescriptionsPage, totalPrescriptionPages]);

    const renderHome = () => (
        <div className="space-y-6">
            <div
                ref={heroRef}
                className="dashboard-panel-card relative overflow-hidden rounded-none border border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-[#0EA5E9] px-6 py-7 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:px-8 sm:py-8"
            >
                <div className="absolute right-0 top-0 h-full w-[220px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.22),_transparent_62%)]" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Welcome back, {displayName}
                        </h1>
                        {/* <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                            Manage orders, prescriptions, cart items and bank details from one modern dashboard.
                        </p> */}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {quickStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-none border border-white/10 bg-white/10 px-4 py-4 text-center backdrop-blur-sm"
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

            <PanelShell title="Recent Orders" subtitle="Your latest orders are shown here." shellClassName="rounded-none">
                {ordersLoading ? (
                    <div className="rounded-none bg-slate-50 p-6 text-center text-slate-500">
                        Loading orders...
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="rounded-none bg-slate-50 p-6 text-center text-slate-500">
                        No recent orders found.
                    </div>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-3">
                        {recentOrders.map((order) => (
                            <div
                                key={order._id}
                                className="dashboard-panel-card rounded-none border border-slate-200 bg-white p-5"
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
                                        className={`inline-flex rounded-none px-3 py-1 text-xs font-semibold ${statusTone[getNormalizedOrderStatus(order)] || "bg-[#E0F2FE] text-[#0EA5E9]"
                                            }`}
                                    >
                                        {getOrderStatusLabel(order)}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {order.items?.slice(0, 2).map((item, index) => (
                                        <div
                                            key={`${order._id}-${index}`}
                                            className="rounded-none bg-slate-50 px-3 py-2"
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
                                    <p className="text-lg font-extrabold text-[#0EA5E9]">
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
        <PanelShell
            title="My Cart"
            subtitle="Your saved cart items at a glance."
            shellClassName="rounded-none"
            headerAction={
                <button
                    type="button"
                    onClick={() => navigate(cartItems.length ? "/checkout" : "/products")}
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-none bg-[#0EA5E9] px-5 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
                >
                    <Plus size={16} />
                    Order Now
                </button>
            }
        >
            {cartItems.length === 0 ? (
                <div className="dashboard-panel-card rounded-none border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <h3 className="text-lg font-bold text-slate-800">No items in cart</h3>
                    <p className="mt-2 text-sm text-slate-500">Add products to your cart and they will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {cartItems.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="dashboard-panel-card flex flex-col gap-4 rounded-none border border-slate-200 bg-gradient-to-r from-white to-[#fff4f1]/60 p-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-start gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{item.name || item.title || "Product"}</h3>
                                    <p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity || 1}</p>
                                </div>
                            </div>
                            <p className="text-lg font-extrabold text-[#0EA5E9]">₹{item.price || item.salePrice || 0}</p>
                        </div>
                    ))}
                </div>
            )}
        </PanelShell>
    );

    const renderOrders = () => (
        <PanelShell
            title="Orders"
            subtitle="Track all the products you have ordered."
            headerAction={
                <button
                    type="button"
                    onClick={() => navigate("/products")}
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-none bg-[#0EA5E9] px-5 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
                >
                    <Plus size={16} />
                    New Order
                </button>
            }
        >
            {ordersLoading ? (
                <div className="rounded-none bg-slate-50 p-8 text-center text-slate-500">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="rounded-none bg-slate-50 p-8 text-center text-slate-500">No orders found.</div>
            ) : (
                <div>
                    <div className="border-b border-slate-200 px-0 py-1 sm:py-2">
                        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200/80 pt-4">
                            {orderTabs.map((tab) => {
                                const isActive = activeOrderFilter === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveOrderFilter(tab.key)}
                                        className={`rounded-none px-4 py-2 text-sm font-semibold transition ${isActive
                                            ? "bg-[#0EA5E9] text-white shadow-[0_12px_30px_rgba(14,165,233,0.35)]"
                                            : "bg-white text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="overflow-x-auto pt-4">
                        <table className="w-full min-w-[980px] border-separate border-spacing-0">
                            <thead>
                                <tr className="text-left">
                                    <th className="rounded-l-[20px] bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">Order ID</th>
                                    <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">Product / Item</th>
                                    <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">Status</th>
                                    <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">Total</th>
                                    <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">Date</th>
                                    <th className="rounded-r-[20px] bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const normalizedStatus = getNormalizedOrderStatus(order);
                                    const canCancel =
                                        order.orderType !== "replacement" &&
                                        ["pending", "payment_pending", "placed"].includes(normalizedStatus);
                                    const canReturn = canOrderBeReturned(order);

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
                                                                className="rounded-none border border-slate-100 bg-slate-50 px-3 py-2"
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
                                                    <p className="font-semibold text-slate-800">{getOrderPaymentLabel(order)}</p>
                                                    <p>Subtotal: Rs. {order.subtotal ?? 0}</p>
                                                    <p>Discount: Rs. {order.discount ?? 0}</p>
                                                    {order.isReturnRequested ? (
                                                        <p className="font-semibold text-sky-700">
                                                            Return: {String(order.returnStatus || "pending").replace(/_/g, " ")}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-lg font-extrabold text-[#0EA5E9]">Rs. {order.total ?? 0}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex rounded-none px-3 py-1 text-xs font-semibold ${statusTone[normalizedStatus] || "bg-[#E0F2FE] text-[#0EA5E9]"
                                                        }`}
                                                >
                                                    {getOrderStatusLabel(order)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col items-start gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReorder(order)}
                                                        className="rounded-none border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                                                    >
                                                        Reorder
                                                    </button>

                                                    {canCancel ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOrderCancel(order._id)}
                                                            disabled={cancellingOrderId === order._id}
                                                            className="rounded-none border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {cancellingOrderId === order._id ? "Cancelling..." : "Cancel Order"}
                                                        </button>
                                                    ) : null}

                                                    {canReturn ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOrderReturn(order._id)}
                                                            className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            Return
                                                        </button>
                                                    ) : null}
                                                </div>
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
                            className="dashboard-panel-card overflow-hidden rounded-none border border-slate-200 bg-white"
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
                                        className={`w-fit rounded-none px-3 py-1 text-xs font-semibold ${statusTone[getNormalizedOrderStatus(order)] || "bg-[#E0F2FE] text-[#0EA5E9]"
                                            }`}
                                    >
                                        {getOrderStatusLabel(order)}
                                    </span>
                                </div>
                                {["pending", "payment_pending", "placed"].includes(getNormalizedOrderStatus(order)) ? (
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleOrderCancel(order._id)}
                                            disabled={cancellingOrderId === order._id}
                                            className="rounded-none border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
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
                                        className="flex items-center justify-between rounded-none bg-slate-50 px-4 py-3"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-800">{item.name}</p>
                                            <p className="mt-1 text-sm text-slate-500">Qty: {item.quantity}</p>
                                            {item.pack ? <p className="text-sm text-slate-500">{item.pack}</p> : null}
                                        </div>
                                        <p className="text-base font-bold text-[#0EA5E9]">₹{item.price}</p>
                                    </div>
                                ))}

                                <div className="grid gap-2 pt-1 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-none bg-slate-50 px-4 py-3">Payment: {getOrderPaymentLabel(order)}</div>
                                    <div className="rounded-none bg-slate-50 px-4 py-3">Total: ₹{order.total}</div>
                                    <div className="rounded-none bg-slate-50 px-4 py-3">Subtotal: ₹{order.subtotal}</div>
                                    <div className="rounded-none bg-slate-50 px-4 py-3">Discount: ₹{order.discount}</div>
                                </div>
                            </div>
                        </div>
                    )) : null}
                </div>
            )}
        </PanelShell>
    );

    const renderOrdersModern = () => (
        <PanelShell
            title="Orders"
            subtitle="Track all the products you have ordered."
            shellClassName="rounded-none"
            headerAction={
                <button
                    type="button"
                    onClick={() => navigate("/products")}
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-none bg-[#0EA5E9] px-5 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
                >
                    <Plus size={16} />
                    New Order
                </button>
            }
        >
            {ordersLoading ? (
                <div className="rounded-none bg-slate-50 p-8 text-center text-slate-500">
                    Loading orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-none bg-slate-50 p-8 text-center text-slate-500">
                    No orders found.
                </div>
            ) : (
                <div>
                    <div className="border-b border-slate-200 px-0 py-1 sm:py-2">
                        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200/80 pt-4">
                            {orderTabs.map((tab) => {
                                const isActive = activeOrderFilter === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveOrderFilter(tab.key)}
                                        className={`rounded-none px-4 py-2 text-sm font-semibold transition ${isActive
                                            ? "bg-[#0EA5E9] text-white shadow-[0_12px_30px_rgba(14,165,233,0.35)]"
                                            : "bg-white text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="overflow-x-auto px-0 py-3 sm:py-5">
                        <table className="w-full min-w-[1120px] border-separate border-spacing-0">
                            <thead>
                                <tr className="text-left">
                                    <th className="rounded-none bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                        Order ID
                                    </th>
                                    <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                        Product / Item
                                    </th>
                                    <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                        Total
                                    </th>
                                    <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                        Date
                                    </th>
                                    <th className="rounded-none bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedOrders.map((order) => {
                                    const normalizedStatus = getNormalizedOrderStatus(order);
                                    const canCancel =
                                        order.orderType !== "replacement" &&
                                        ["pending", "payment_pending", "placed"].includes(normalizedStatus);
                                    const canReturn = canOrderBeReturned(order);
                                    const primaryItem = order.items?.[0];
                                    const extraItemsCount = Math.max((order.items?.length || 0) - 1, 0);

                                    return (
                                        <React.Fragment key={`modern-${order._id}`}>
                                            <tr className="align-top">
                                                <td className="border-b border-slate-100 bg-white px-4 py-4 text-sm font-semibold text-slate-800">
                                                    <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                                        #{String(order._id).slice(-8).toUpperCase()}
                                                    </p>
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        {getOrderPaymentLabel(order)}
                                                    </p>
                                                    {order.isReturnRequested ? (
                                                        <p className="mt-2 text-xs font-semibold text-sky-700">
                                                            {getReturnStatusLabel(order)}
                                                        </p>
                                                    ) : null}
                                                </td>

                                                <td className="border-b border-slate-100 bg-white px-4 py-4">
                                                    {primaryItem ? (
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">
                                                                {primaryItem.name}
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Qty: {primaryItem.quantity || 1}
                                                                {primaryItem.pack ? ` | ${primaryItem.pack}` : ""}
                                                            </p>
                                                            {order.isReturnRequested ? (
                                                                <p className="mt-2 text-xs font-semibold text-sky-700">
                                                                    {getReturnStatusLabel(order)}
                                                                </p>
                                                            ) : null}
                                                            {extraItemsCount ? (
                                                                <p className="mt-2 text-xs font-semibold text-[#0EA5E9]">
                                                                    +{extraItemsCount} more item{extraItemsCount > 1 ? "s" : ""}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-500">No items found</p>
                                                    )}
                                                </td>

                                                <td className="border-b border-slate-100 bg-white px-4 py-4">
                                                    <p className="text-lg font-extrabold text-[#0EA5E9]">
                                                        ₹{Number(order.total ?? 0).toFixed(2)}
                                                    </p>
                                                </td>

                                                <td className="border-b border-slate-100 bg-white px-4 py-4 text-sm text-slate-600">
                                                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </td>

                                                <td className="border-b border-slate-100 bg-white px-4 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOrderDetails(order._id)}
                                                            className="rounded-none border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                                                        >
                                                            Details
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleReorder(order)}
                                                            className="rounded-none border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                                                        >
                                                            Reorder
                                                        </button>

                                                        {canCancel ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOrderCancel(order._id)}
                                                                disabled={cancellingOrderId === order._id}
                                                                className="rounded-none border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                {cancellingOrderId === order._id ? "Cancelling..." : "Cancel"}
                                                            </button>
                                                        ) : null}

                                                        {canReturn ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOrderReturn(order._id)}
                                                                className="rounded-none border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                            >
                                                                Return
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            </tr>

                                        </React.Fragment>
                                    );
                                })}

                                {!paginatedOrders.length ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                                            No orders match your current search or filter.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                    {filteredOrders.length > ordersPerPage ? (
                        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Page {ordersPage} of {totalOrderPages}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setOrdersPage((page) => Math.max(page - 1, 1))}
                                    disabled={ordersPage === 1}
                                    className="rounded-none border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                {Array.from({ length: totalOrderPages }, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() => setOrdersPage(pageNumber)}
                                        className={`rounded-none px-4 py-2 text-sm font-semibold transition ${ordersPage === pageNumber
                                            ? "bg-[#0EA5E9] text-white"
                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOrdersPage((page) => Math.min(page + 1, totalOrderPages))
                                    }
                                    disabled={ordersPage === totalOrderPages}
                                    className="rounded-none border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : null}

                </div>
            )}
        </PanelShell>
    );

    const renderPrescription = () => (
        <PanelShell
            title="Prescription Details"
            subtitle="All your uploaded prescriptions in one place."
            shellClassName="rounded-none"
            headerAction={
                <button
                    type="button"
                    onClick={() => navigate("/upload-prescription")}
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-none bg-[#0EA5E9] px-5 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
                >
                    <Plus size={16} />
                    New Prescription
                </button>
            }
        >
            {prescriptionsLoading ? (
                <div className="rounded-none bg-slate-50 p-8 text-center text-slate-500">
                    Loading prescriptions...
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="rounded-none bg-slate-50 p-8 text-center text-slate-500">
                    No prescriptions found.
                </div>
            ) : (
                <div className="overflow-x-auto px-0 py-3 sm:py-5">
                    <table className="w-full min-w-[1120px] border-separate border-spacing-0">
                        <thead>
                            <tr className="text-left">
                                <th className="rounded-none bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                    Prescription
                                </th>
                                <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                    Patient
                                </th>
                                <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                    Contact
                                </th>
                                <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                    Address
                                </th>
                                <th className="bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                    Status
                                </th>
                                <th className="rounded-none bg-slate-900 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPrescriptions.map((prescription) => (
                                <tr key={prescription._id} className="align-top">
                                    <td className="border-b border-slate-100 bg-white px-4 py-4 text-sm font-semibold text-slate-800">
                                        <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                            #{String(prescription._id).slice(-8).toUpperCase()}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {new Date(prescription.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-700">{prescription.fileName || "No file name"}</p>
                                    </td>

                                    <td className="border-b border-slate-100 bg-white px-4 py-4">
                                        <p className="text-sm font-semibold text-slate-900">{prescription.name || "N/A"}</p>
                                        <p className="mt-1 text-xs text-slate-500">Patient</p>
                                    </td>

                                    <td className="border-b border-slate-100 bg-white px-4 py-4">
                                        <p className="text-sm text-slate-700">{prescription.email || "N/A"}</p>
                                        <p className="mt-1 text-xs text-slate-500">{prescription.mobile || "N/A"}</p>
                                    </td>

                                    <td className="border-b border-slate-100 bg-white px-4 py-4 text-sm text-slate-600">
                                        {prescription.address || "N/A"}
                                    </td>

                                    <td className="border-b border-slate-100 bg-white px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-none px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusTone[prescription.status] || "bg-[#E0F2FE] text-[#0EA5E9]"}`}
                                        >
                                            {String(prescription.status || "pending").replace(/_/g, " ")}
                                        </span>
                                    </td>

                                    <td className="border-b border-slate-100 bg-white px-4 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handlePrescriptionReorder(prescription._id)}
                                                disabled={reorderingPrescriptionId === prescription._id}
                                                className="rounded-none border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {reorderingPrescriptionId === prescription._id ? "Reordering..." : "Reorder"}
                                            </button>

                                            {prescription.fileUrl ? (
                                                <a
                                                    href={prescription.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-none border border-[#0EA5E9] bg-[#0EA5E9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0284C7]"
                                                >
                                                    View File
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400">Not available</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalPrescriptionPages > 1 ? (
                        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Page {prescriptionsPage} of {totalPrescriptionPages}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPrescriptionsPage((page) => Math.max(page - 1, 1))}
                                    disabled={prescriptionsPage === 1}
                                    className="rounded-none border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                {Array.from({ length: totalPrescriptionPages }, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() => setPrescriptionsPage(pageNumber)}
                                        className={`rounded-none px-4 py-2 text-sm font-semibold transition ${prescriptionsPage === pageNumber
                                            ? "bg-[#0EA5E9] text-white"
                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setPrescriptionsPage((page) => Math.min(page + 1, totalPrescriptionPages))}
                                    disabled={prescriptionsPage === totalPrescriptionPages}
                                    className="rounded-none border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </PanelShell>
    );

    const renderAddBank = () => (
        <PanelShell
            title="Add Bank"
            subtitle="Save your bank account details for future refund and support processes."
            shellClassName="rounded-none"
            headerAction={
                <button
                    type="button"
                    onClick={fetchMyBanks}
                    className="inline-flex rounded-none bg-[#0EA5E9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
                >
                    Refresh Bank Details
                </button>
            }
        >
            <div>
                <form onSubmit={handleBankSubmit} className="dashboard-panel-card rounded-none border border-slate-200 bg-slate-50/70 p-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Account Holder Name</label>
                            <input
                                type="text"
                                name="accountHolderName"
                                value={bankForm.accountHolderName}
                                onChange={handleBankChange}
                                placeholder="Enter account holder name"
                                className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0EA5E9]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Email ID</label>
                            <input
                                type="email"
                                name="email"
                                value={bankForm.email}
                                onChange={handleBankChange}
                                placeholder="Enter registered email address"
                                className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0EA5E9]"
                                required
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                Jo app me register time email diya hai use hi yaha add kare.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Mobile Number</label>
                            <input
                                type="text"
                                name="mobileNumber"
                                value={bankForm.mobileNumber}
                                onChange={handleBankChange}
                                placeholder="Enter mobile number"
                                className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0EA5E9]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Bank Name</label>
                            <input
                                type="text"
                                name="bankName"
                                value={bankForm.bankName}
                                onChange={handleBankChange}
                                placeholder="Enter bank name"
                                className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0EA5E9]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Account Number</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={bankForm.accountNumber}
                                onChange={handleBankChange}
                                placeholder="Enter account number"
                                className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0EA5E9]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">IFSC Code</label>
                            <input
                                type="text"
                                name="ifscCode"
                                value={bankForm.ifscCode}
                                onChange={handleBankChange}
                                placeholder="Enter IFSC code"
                                className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0EA5E9]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Branch Name</label>
                            <input
                                type="text"
                                name="branchName"
                                value={bankForm.branchName}
                                onChange={handleBankChange}
                                placeholder="Enter branch name"
                                className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0EA5E9]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">UPI ID</label>
                            <input
                                type="text"
                                name="upiId"
                                value={bankForm.upiId}
                                onChange={handleBankChange}
                                placeholder="Enter UPI id if available"
                                className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0EA5E9]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={bankSubmitting}
                                className="inline-flex rounded-none bg-[#0EA5E9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
                            >
                                {bankSubmitting ? "Saving..." : "Save Bank Details"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
                <h3 className="text-xl font-bold text-slate-800">Saved Bank Accounts</h3>

                {banksLoading ? (
                    <div className="mt-4 rounded-none bg-slate-50 p-8 text-center text-slate-500">
                        Loading bank accounts...
                    </div>
                ) : savedBanks.length === 0 ? (
                    <div className="mt-4 rounded-none bg-slate-50 p-8 text-center text-slate-500">
                        No bank accounts added yet.
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        {savedBanks.map((bank) => (
                            <div
                                key={bank._id}
                                className="dashboard-panel-card rounded-none border border-slate-200 bg-white p-5"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <h4 className="text-lg font-bold text-slate-800">{bank.bankName}</h4>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteBank(bank._id)}
                                        disabled={deletingBankId === bank._id}
                                        className="inline-flex items-center gap-2 rounded-none border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                                    >
                                        <Trash2 size={14} />
                                        {deletingBankId === bank._id ? "Removing..." : "Remove"}
                                    </button>
                                </div>

                                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                    <p>Account Holder: {bank.accountHolderName}</p>
                                    <p>Email: {bank.email || userData?.email || "N/A"}</p>
                                    <p>Mobile Number: {bank.mobileNumber || userData?.phone || "N/A"}</p>
                                    <p>Account Number: {bank.accountNumber}</p>
                                    <p>IFSC: {bank.ifscCode}</p>
                                    <p>Branch: {bank.branchName || "N/A"}</p>
                                    <p>UPI ID: {bank.upiId || "N/A"}</p>
                                    <p>Added On: {new Date(bank.createdAt).toLocaleDateString("en-IN")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PanelShell>
    );

    const renderReminderHistory = () => {
        const history = reminders.flatMap(r => 
            (r.history || []).map(h => ({
                ...h,
                medicineName: r.medicineName,
                reminderId: r._id
            }))
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        return (
            <PanelShell 
                title="Reminder History" 
                subtitle="Track your medication adherence history."
            >
                {remindersLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No dose history logged yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="pb-4 pt-2 font-semibold text-slate-900">Medicine</th>
                                    <th className="pb-4 pt-2 font-semibold text-slate-900">Date</th>
                                    <th className="pb-4 pt-2 font-semibold text-slate-900">Time</th>
                                    <th className="pb-4 pt-2 font-semibold text-slate-900">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((entry, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 last:border-0">
                                        <td className="py-4 font-medium text-slate-800">{entry.medicineName}</td>
                                        <td className="py-4 text-slate-600">{new Date(entry.date).toLocaleDateString()}</td>
                                        <td className="py-4 text-slate-600">{entry.time}</td>
                                        <td className="py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                entry.status === 'taken' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </PanelShell>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case "cart":
                return renderCart();
            case "orders":
                return renderOrdersModern();
            case "prescription":
                return renderPrescription();
            case "bank":
                return renderAddBank();
            case "reminders":
                return renderReminderHistory();
            case "home":
            default:
                return renderHome();
        }
    };

    const handleMenuItemClick = (tabKey) => {
        setSearchParams(
            tabKey === "home" ? {} : { tab: tabKey },
            { replace: true }
        );
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
                            className="relative z-10 rounded-none p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                            onClick={closeMobileSidebar}
                            onTouchEnd={closeMobileSidebar}
                            aria-label="Close sidebar"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                        <div className="rounded-none bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] px-4 py-5 text-white shadow-lg shadow-[#0EA5E9]/20">
                            <p className="text-sm font-semibold text-white/80">Logged in as</p>
                            <h2 className="mt-2 text-xl font-bold">{displayName}</h2>
                            <p className="mt-1 break-words text-sm text-white/80">
                                {userData?.email || "user@email.com"}
                            </p>
                        </div>

                        {/* <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Main Menu
                        </p> */}

                        <nav className="mt-4 space-y-2">
                            {menuItems.map((item) => {
                                const isActive = activeTab === item.key;
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => handleMenuItemClick(item.key)}
                                        className={`dashboard-menu-item flex w-full items-center gap-3 rounded-none px-4 py-3 text-left text-sm font-medium transition ${isActive
                                            ? "bg-[#0EA5E9] text-white shadow-lg shadow-[#0EA5E9]/25"
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
                                className="dashboard-menu-item flex w-full items-center gap-3 rounded-none px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#0EA5E9]"
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
                                className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
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
