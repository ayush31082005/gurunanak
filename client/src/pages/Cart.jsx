import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();

  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <section className="min-h-screen bg-[#f6f7fb] py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div
            className={`grid grid-cols-1 lg:items-start lg:grid-cols-[1.15fr_0.85fr] ${
              cartItems.length === 0 ? "min-h-[650px]" : ""
            }`}
          >
            {/* Left Side */}
            <div className="border-b border-slate-200 bg-[#fafafa] px-4 py-5 sm:px-6 sm:py-6 lg:border-b-0 lg:border-r lg:px-8 lg:py-8">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                    <ShoppingBag size={22} className="text-[#87CEEB]" />
                  </div>

                  <div>
                    <h1 className="text-[34px] font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                      My Cart
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-500 sm:text-base">
                      Review your selected medicines and wellness products.
                    </p>
                  </div>
                </div>

                {cartItems.length === 0 ? (
                  <div className="mt-10 rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:p-10">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                      <ShoppingBag size={32} className="text-slate-500" />
                    </div>

                    <h2 className="mt-5 text-2xl font-bold text-slate-900">
                      Your cart is empty
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                      Add medicines and healthcare products to continue shopping.
                    </p>

                    <Link
                      to="/products"
                      className="mt-6 inline-flex rounded-xl bg-[#87CEEB] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#6EC6E8]"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[24px] border border-slate-200 bg-white p-3.5 shadow-sm transition hover:shadow-md sm:p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex justify-center sm:block">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-20 w-20 rounded-2xl bg-slate-50 object-contain p-2.5"
                            />
                          </div>

                          <div className="min-w-0 flex-1 text-center sm:text-left">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {item.category}
                            </p>

                            <h2 className="mt-1 text-[15px] font-bold text-slate-900 sm:text-lg">
                              {item.name}
                            </h2>

                            {item.qty ? (
                              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{item.qty}</p>
                            ) : null}

                            <p className="mt-3 text-xl font-extrabold text-slate-900">
                              ₹{item.price}
                            </p>
                          </div>

                          <div className="flex flex-col items-center gap-2.5 sm:items-end">
                            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition hover:bg-white"
                                aria-label={`Decrease quantity for ${item.name}`}
                              >
                                <Minus size={14} />
                              </button>

                              <span className="min-w-8 text-center text-sm font-semibold text-slate-900">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition hover:bg-white"
                                aria-label={`Increase quantity for ${item.name}`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-start justify-center px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className="w-full max-w-md">
                <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Order Summary
                  </p>

                  <div className="mt-5 space-y-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Items</span>
                      <span className="font-semibold text-slate-900">
                        {cartItems.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Total Quantity</span>
                      <span className="font-semibold text-slate-900">
                        {totalQuantity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Delivery</span>
                      <span className="font-semibold text-emerald-600">Free</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-lg font-extrabold text-slate-900">
                      <span>Total</span>
                      <span>₹{cartTotal}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/checkout")}
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#87CEEB] px-5 text-sm font-bold text-white transition hover:bg-[#6EC6E8]"
                  >
                    Proceed to Checkout
                  </button>

                  <Link
                    to="/products"
                    className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Continue Shopping
                  </Link>

                  <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <div className="flex items-center gap-2 font-semibold">
                      <ShieldCheck size={16} />
                      <span>Safe & Secure Checkout</span>
                    </div>
                    <p className="mt-1 text-xs leading-6 text-emerald-700/90">
                      Your order details and payment information are protected.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">
                    Why shop with Gurunanak?
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li>• Genuine medicines and healthcare products</li>
                    <li>• Fast delivery and easy checkout</li>
                    <li>• Trusted support for your pharmacy needs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
