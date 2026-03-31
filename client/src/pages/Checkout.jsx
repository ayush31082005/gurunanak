import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    MapPin,
    Phone,
    Mail,
    CreditCard,
    Wallet,
    Truck,
    Tag,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const Checkout = () => {
    const location = useLocation();
    const { cartItems } = useCart();
    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        email: "",
        house: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [coupon, setCoupon] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [placingOrder, setPlacingOrder] = useState(false);

    const checkoutItems = useMemo(() => {
        const stateItems = location.state?.checkoutItems;
        const sourceItems =
            Array.isArray(stateItems) && stateItems.length ? stateItems : cartItems;

        return sourceItems.map((item) => ({
            ...item,
            quantity: item.quantity ?? item.qty ?? 1,
            pack: item.pack ?? item.qty ?? "1 unit",
        }));
    }, [cartItems, location.state]);

    const subtotal = useMemo(() => {
        return checkoutItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    }, [checkoutItems]);

    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const platformFee = 9;
    const total = subtotal + deliveryFee + platformFee - appliedDiscount;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleApplyCoupon = () => {
        const code = coupon.trim().toUpperCase();

        if (code === "SAVE50") {
            setAppliedDiscount(50);
            alert("Coupon applied successfully");
        } else if (code === "SAVE100" && subtotal >= 999) {
            setAppliedDiscount(100);
            alert("Coupon applied successfully");
        } else {
            setAppliedDiscount(0);
            alert("Invalid coupon code");
        }
    };

    const handlePlaceOrder = async () => {
        if (!checkoutItems.length) {
            alert("Your checkout is empty");
            return;
        }

        if (
            !address.fullName ||
            !address.phone ||
            !address.email ||
            !address.house ||
            !address.area ||
            !address.city ||
            !address.state ||
            !address.pincode
        ) {
            alert("Please fill all delivery details");
            return;
        }

        if (address.phone.length !== 10) {
            alert("Please enter valid 10 digit mobile number");
            return;
        }

        if (address.pincode.length !== 6) {
            alert("Please enter valid 6 digit pincode");
            return;
        }

        try {
            setPlacingOrder(true);

            // Backend connect yahan karna hai
            // Example:
            // await axios.post(`${import.meta.env.VITE_API_URL}/orders/create`, {
            //   address,
            //   paymentMethod,
            //   items: checkoutItems,
            //   pricing: {
            //     subtotal,
            //     deliveryFee,
            //     platformFee,
            //     discount: appliedDiscount,
            //     total,
            //   },
            // });

            setTimeout(() => {
                alert("Order placed successfully");
                setPlacingOrder(false);
            }, 1200);
        } catch (error) {
            console.error(error);
            alert("Failed to place order");
            setPlacingOrder(false);
        }
    };

    if (!checkoutItems.length) {
        return (
            <section className="min-h-screen bg-[#f6f7fb] py-6 sm:py-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-12">
                        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                            Your checkout is empty
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                            Add products to cart or use Buy Now to continue with checkout.
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex rounded-xl bg-[#ff6f61] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#f45d4f]"
                        >
                            Browse Products
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
                    <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                        Checkout
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Complete your order with delivery and payment details.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-[#ff6f61]">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Delivery Address
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Enter where you want your order delivered
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={address.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#ff6f61]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={address.phone}
                                        onChange={(e) =>
                                            setAddress((prev) => ({
                                                ...prev,
                                                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                                            }))
                                        }
                                        placeholder="Enter mobile number"
                                        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#ff6f61]"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={address.email}
                                        onChange={handleChange}
                                        placeholder="Enter email address"
                                        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#ff6f61]"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        House No. / Flat / Building
                                    </label>
                                    <input
                                        type="text"
                                        name="house"
                                        value={address.house}
                                        onChange={handleChange}
                                        placeholder="Flat, house number, building name"
                                        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#ff6f61]"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Area / Street / Locality
                                    </label>
                                    <input
                                        type="text"
                                        name="area"
                                        value={address.area}
                                        onChange={handleChange}
                                        placeholder="Area, street, sector, landmark"
                                        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#ff6f61]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={address.city}
                                        onChange={handleChange}
                                        placeholder="Enter city"
                                        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#ff6f61]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={address.state}
                                        onChange={handleChange}
                                        placeholder="Enter state"
                                        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#ff6f61]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={address.pincode}
                                        onChange={(e) =>
                                            setAddress((prev) => ({
                                                ...prev,
                                                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                                            }))
                                        }
                                        placeholder="Enter pincode"
                                        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#ff6f61]"
                                    />
                                </div>
                            </div>
                        </div>

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
                                            Pay when your order arrives
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
                                            Secure card payment
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
                                            Pay using UPI apps or wallet
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
                                        Apply Coupon
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Use SAVE50 or SAVE100
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={coupon}
                                    onChange={(e) => setCoupon(e.target.value)}
                                    placeholder="Enter coupon code"
                                    className="h-12 flex-1 rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#ff6f61]"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    className="rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-lg font-bold text-slate-900">
                                Order Summary
                            </h2>

                            <div className="mt-5 space-y-4">
                                {checkoutItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 border-b border-slate-100 pb-4"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-16 w-16 rounded-2xl object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="line-clamp-1 font-semibold text-slate-800">
                                                {item.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-500">{item.pack}</p>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-sm text-slate-600">
                                                    Qty: {item.quantity}
                                                </span>
                                                <span className="font-bold text-slate-900">
                                                    Rs {item.price * item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                    <span>Delivery Fee</span>
                                    <span>{deliveryFee === 0 ? "FREE" : `Rs ${deliveryFee}`}</span>
                                </div>

                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Platform Fee</span>
                                    <span>Rs {platformFee}</span>
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
                                {placingOrder ? "Placing Order..." : "Place Order"}
                                <ChevronRight size={18} />
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-700">
                                <ShieldCheck size={14} />
                                <span>Safe and secure checkout</span>
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

export default Checkout;
