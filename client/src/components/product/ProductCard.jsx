import { Link } from "react-router-dom";
import { ShoppingCart, Star, Zap } from "lucide-react";

const FALLBACK_PRODUCT_IMAGE = "/product/meyer.png";

const ProductCard = ({ product, selected = false, onAddToCart, onBuyNow }) => {
  const {
    id,
    name,
    image,
    category,
    qty,
    price,
    oldPrice,
    discount,
    rating,
    reviews,
    delivery,
    prescriptionRequired,
  } = product;

  return (
    <div
      className={`group h-full overflow-hidden rounded-[22px] border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        selected ? "border-sky-400 ring-2 ring-sky-100" : "border-slate-200"
      }`}
    >
      <div className="relative bg-slate-50 p-2 sm:p-2.5">
        {discount ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
            {discount}% OFF
          </span>
        ) : null}

        {prescriptionRequired ? (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-blue-100 px-2 py-1 text-[9px] font-semibold text-blue-700 sm:right-3 sm:top-3 sm:px-3 sm:text-[11px]">
            Rx Required
          </span>
        ) : null}

        <Link to={`/products/${id}`} className="block">
          <img
            src={image || FALLBACK_PRODUCT_IMAGE}
            alt={name}
            className="mx-auto h-16 w-full object-contain transition-transform duration-300 group-hover:scale-105 sm:h-28"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
            }}
          />
        </Link>
      </div>

      <div className="p-2.5 sm:p-2.5">
        {category ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
            {category}
          </p>
        ) : null}

        <Link to={`/products/${id}`}>
          <h3 className="min-h-[34px] text-[11px] font-bold leading-4 text-slate-800 transition-colors hover:text-sky-500 sm:min-h-[34px] sm:text-[13px] sm:leading-5">
            {name}
          </h3>
        </Link>

        {qty ? <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">{qty}</p> : null}

        <div className="mt-2 flex items-center gap-1.5">
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 sm:px-2.5 sm:text-xs">
            <Star size={12} className="fill-current" />
            {rating || "4.5"}
          </div>

          <span className="text-[10px] text-slate-500 sm:text-xs">
            {reviews ? `${reviews} reviews` : "Popular choice"}
          </span>
        </div>

        {delivery ? (
          <p className="mt-2 text-[10px] font-medium text-emerald-600 sm:text-xs">
            {delivery}
          </p>
        ) : null}

        <div className="mt-2 flex items-end gap-1.5">
          <span className="text-[16px] font-extrabold text-slate-900 sm:text-[17px]">
            ₹{price}
          </span>

          {oldPrice ? (
            <span className="text-[10px] font-medium text-slate-400 line-through sm:text-xs">
              ₹{oldPrice}
            </span>
          ) : null}
        </div>

        <div className="mt-2 space-y-1.5 sm:space-y-1.5">
          <Link
            to={`/products/${id}`}
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-2 py-1.5 text-[10px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:px-3 sm:text-xs"
          >
            View Details
          </Link>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={() => onAddToCart?.(product)}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-sky-400 px-2 py-1.5 text-[10px] font-semibold text-sky-500 transition hover:bg-sky-50 sm:gap-2 sm:px-3 sm:text-xs"
            >
              <ShoppingCart size={12} />
              Add Cart
            </button>

            <button
              onClick={() => onBuyNow?.(product)}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-[#0EA5E9] px-2 py-1.5 text-[10px] font-semibold text-white transition hover:bg-[#0284C7] sm:gap-2 sm:px-3 sm:text-xs"
            >
              <Zap size={12} />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
