import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    CreditCard,
    Wallet,
    Truck,
    Tag,
    ShieldCheck,
    ChevronRight,
    ArrowLeft,
    Phone,
    Mail,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import API from "../api";

const buildOrderPayload = ({
    checkoutItems,
    address,
    paymentMethod,
    subtotal,
    codFee,
    appliedDiscount,
    total,
}) => ({
    items: checkoutItems.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        pack: item.pack,
        price: item.price,
        quantity: item.quantity,
    })),
    shippingInfo: {
        fullName: address.fullName,
        phone: address.phone,
        email: address.email,
        address: `${address.house}, ${address.area}`,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
    },
    paymentMethod,
    pricing: {
        subtotal,
        codFee,
        discount: appliedDiscount,
        total,
    },
});

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [placingOrder, setPlacingOrder] = useState(false);
    const [hasPreviousOrder, setHasPreviousOrder] = useState(false);

    const checkoutItems = useMemo(() => {
        const items = location.state?.checkoutItems;
        return Array.isArray(items) ? items : [];
    }, [location.state]);

    const address = location.state?.address;
    const appliedDiscount = Number(location.state?.appliedDiscount) || 0;

    const subtotal = useMemo(
        () => checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [checkoutItems]
    );

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setHasPreviousOrder(false);
            return;
        }

        let isMounted = true;

        const loadOrders = async () => {
            try {
                const { data } = await API.get("/orders/my");

                if (!isMounted) {
                    return;
                }

                const validOrders = Array.isArray(data)
                    ? data.filter((order) => order.status !== "payment_pending")
                    : [];

                setHasPreviousOrder(validOrders.length > 0);
            } catch (error) {
                if (isMounted) {
                    setHasPreviousOrder(false);
                }
            }
        };

        loadOrders();

        return () => {
            isMounted = false;
        };
    }, []);

    const codFee = useMemo(() => {
        if (paymentMethod !== "cod") {
            return 0;
        }

        if (!hasPreviousOrder) {
            return 0;
        }

        return subtotal < 100 ? 30 : 5;
    }, [hasPreviousOrder, paymentMethod, subtotal]);

    const total = Math.max(subtotal + codFee - appliedDiscount, 0);

    const handlePlaceOrder = async () => {
        if (!checkoutItems.length || !address) {
            alert("Please complete checkout details first");
            navigate("/checkout");
            return;
        }

        try {
            setPlacingOrder(true);

            const payload = buildOrderPayload({
                checkoutItems,
                address,
                paymentMethod,
                subtotal,
                codFee,
                appliedDiscount,
                total,
            });

            if (paymentMethod === "cod") {
                await API.post("/orders/create", payload);
                clearCart();
                alert("Order placed successfully");
                navigate("/");
                return;
            }

            if (!window.Razorpay) {
                throw new Error("Razorpay checkout failed to load");
            }

            const { data } = await API.post("/orders/razorpay", payload);

            const razorpay = new window.Razorpay({
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: "Gurunanak Pharmacy",
                description: "Medicine order payment",
                order_id: data.razorpayOrderId,
                prefill: {
                    name: data.customer.name,
                    email: data.customer.email,
                    contact: data.customer.contact,
                },
                theme: { color: "#ff6f61" },
                handler: async (response) => {
                    try {
                        await API.post("/orders/verify-payment", {
                            orderId: data.orderId,
                            ...response,
                        });
                        clearCart();
                        alert("Payment successful and order confirmed");
                        navigate("/");
                    } catch (verifyError) {
                        console.error(verifyError);
                        alert(
                            verifyError.response?.data?.message ||
                                "Payment received but verification failed. Please contact support."
                        );
                    }
                },
                modal: {
                    ondismiss: () => {
                        setPlacingOrder(false);
                    },
                },
            });

            razorpay.open();
        } catch (error) {
            console.error(error);
            const status = error.response?.status;
            const message =
                error.response?.data?.message ||
                error.message ||
                (status === 401
                    ? "Please login first to place your order"
                    : "Failed to place order");
            alert(message);

            if (status === 401) {
                navigate("/login");
            }
        } finally {
            setPlacingOrder(false);
        }
    };

    if (!checkoutItems.length || !address) {
        return (
            <section className="min-h-screen bg-[#f6f7fb] py-6 sm:py-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-12">
                        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                            Complete checkout first
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                            Fill your delivery details on checkout before opening the payment page.
                        </p>
                        <Link
                            to="/checkout"
                            className="mt-6 inline-flex rounded-xl bg-[#ff6f61] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#f45d4f]"
                        >
                            Go To Checkout
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-[#f6f7fb] py-6 sm:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => navigate("/checkout", { state: location.state })}
                        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                    >
                        <ArrowLeft size={16} />
                        Back to checkout
                    </button>
                    <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                        Payment
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Choose your payment option and complete the order.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Payment Method
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Choose your preferred payment option
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => setPaymentMethod("cod")}
                                    />
                                    <Truck className="text-[#ff6f61]" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            Cash on Delivery
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {!hasPreviousOrder
                                                ? "First order COD is free"
                                                : subtotal < 100
                                                    ? "Repeat order below Rs 100: Rs 30 COD fee"
                                                    : "Repeat order above Rs 100: Rs 5 COD fee"}
                                        </p>
                                    </div>
                                </label>

                                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={paymentMethod === "card"}
                                        onChange={() => setPaymentMethod("card")}
                                    />
                                    <CreditCard className="text-violet-600" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            Credit / Debit Card
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            No extra charge. Pay exact order amount.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={paymentMethod === "upi"}
                                        onChange={() => setPaymentMethod("upi")}
                                    />
                                    <Wallet className="text-emerald-600" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-800">UPI / Wallet</p>
                                        <p className="text-sm text-slate-500">
                                            No extra charge. Pay exact order amount.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Delivery Details
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Review your shipping information
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600">
                                <p className="font-semibold text-slate-900">{address.fullName}</p>
                                <p>{address.house}, {address.area}</p>
                                <p>{address.city}, {address.state} - {address.pincode}</p>
                                <p>{address.phone}</p>
                                <p>{address.email}</p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-lg font-bold text-slate-900">Price Details</h2>

                            <div className="mt-5 space-y-3 text-sm">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>Rs {subtotal}</span>
                                </div>

                                <div className="flex items-center justify-between text-slate-600">
                                    <span>
                                        {paymentMethod === "cod"
                                            ? "Cash on Delivery Fee"
                                            : "Online Payment Charge"}
                                    </span>
                                    <span>{codFee === 0 ? "FREE" : `Rs ${codFee}`}</span>
                                </div>

                                <div className="flex items-center justify-between text-emerald-600">
                                    <span>Discount</span>
                                    <span>- Rs {appliedDiscount}</span>
                                </div>

                                <div className="border-t border-slate-200 pt-3">
                                    <div className="flex items-center justify-between text-base font-bold text-slate-900">
                                        <span>Total Amount</span>
                                        <span>Rs {total}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={placingOrder}
                                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6f61] px-5 text-sm font-bold text-white transition hover:bg-[#f45d4f] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {placingOrder
                                    ? paymentMethod === "cod"
                                        ? "Placing Order..."
                                        : "Opening Razorpay..."
                                    : paymentMethod === "cod"
                                        ? "Place Order"
                                        : "Pay with Razorpay"}
                                <ChevronRight size={18} />
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-700">
                                <ShieldCheck size={14} />
                                <span>Safe and secure payment</span>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h3 className="text-base font-bold text-slate-900">
                                Need Help?
                            </h3>
                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-[#ff6f61]" />
                                    <span>+91 98765 43210</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-[#ff6f61]" />
                                    <span>support@gurunanak.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Payment;
