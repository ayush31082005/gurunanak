import PageHero from "../components/common/PageHero";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();

  return (
    <>
      <PageHero title="My Cart" description="Your selected medicines and wellness products will appear here." />
      <section className="bg-bg py-10">
        <div className="container-padded">
          {cartItems.length === 0 ? (
            <div className="rounded-card border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              <p>Your cart is empty right now.</p>
              <Link
                to="/products"
                className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-2xl bg-slate-50 object-contain p-3"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {item.category}
                      </p>
                      <h2 className="mt-1 text-base font-bold text-slate-900">
                        {item.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">{item.qty}</p>
                      <p className="mt-3 text-lg font-extrabold text-slate-900">
                        Rs {item.price}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition hover:bg-white"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                ))}
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Order Summary
                </p>
                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Items</span>
                    <span>{cartItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Quantity</span>
                    <span>{cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
                    <span>Total</span>
                    <span>Rs {cartTotal}</span>
                  </div>
                </div>

                <button className="mt-5 w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Cart;
