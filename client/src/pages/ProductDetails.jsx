import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Headphones, ShoppingCart, Star, Truck, Zap } from "lucide-react";
import ProductGrid from "../components/product/ProductGrid";
import { useCart } from "../context/CartContext";
import { allProducts } from "../data/products";
import useManagedProducts from "../hooks/useManagedProducts";
import { proceedToCheckoutWithAuth } from "../utils/checkout";

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { products: managedProducts, isLoaded } = useManagedProducts({
    fallbackProducts: allProducts,
    returnMeta: true,
  });

  const product = useMemo(
    () =>
      managedProducts.find(
        (item) => String(item.id) === String(productId) || String(item._id) === String(productId)
      ) || null,
    [managedProducts, productId]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [productId]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const currentCategory = normalizeText(product.category);
    const currentBrand = normalizeText(product.brand);
    const currentNameWords = new Set(
      normalizeText(product.name)
        .split(" ")
        .filter((word) => word.length > 2)
    );

    return managedProducts
      .filter(
        (item) =>
          item.id !== product.id &&
          normalizeText(item.category) === currentCategory
      )
      .map((item) => {
        const itemBrand = normalizeText(item.brand);
        const itemNameWords = normalizeText(item.name)
          .split(" ")
          .filter((word) => word.length > 2);
        const sharedWordCount = itemNameWords.filter((word) =>
          currentNameWords.has(word)
        ).length;

        return {
          ...item,
          relevanceScore:
            (itemBrand && itemBrand === currentBrand ? 3 : 0) + sharedWordCount,
        };
      })
      .sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }

        return (b.rating ?? 0) - (a.rating ?? 0);
      })
      .slice(0, 4);
  }, [managedProducts, product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      pack: product.size || product.pack || product.qty,
    });
    navigate("/cart");
  };

  const handleBuyNow = () => {
    proceedToCheckoutWithAuth(navigate, product);
  };

  if (!isLoaded && !product) {
    return (
      <section className="bg-[#f6f7fb] py-10">
        <div className="container-padded">
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
            <div className="animate-pulse space-y-5">
              <div className="h-8 w-52 rounded-xl bg-slate-200" />
              <div className="h-6 w-72 rounded-xl bg-slate-100" />
              <div className="h-[320px] rounded-[24px] bg-slate-100" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <>
        <section className="bg-[#f6f7fb] py-10">
          <div className="container-padded">
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <p className="text-base text-slate-500">
                This product is not available right now.
              </p>
              <Link
                to="/products"
                className="mt-5 inline-flex rounded-xl bg-[#87CEEB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6EC6E8]"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const description =
    product.description ||
    `${product.name} is a trusted healthcare product designed to support ${(
      product.category || "wellness"
    ).toLowerCase()} needs.`;

  return (
    <>
      <section className="bg-[#f6f7fb] py-6 sm:py-10">
        <div className="container-padded">
          <div className="mx-auto max-w-[1080px]">
          <div className="grid gap-5 lg:grid-cols-[0.92fr_0.88fr]">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="overflow-hidden rounded-[20px] bg-slate-50 p-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="mx-auto h-[210px] w-full object-contain sm:h-[290px]"
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 px-1 py-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#87CEEB]">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Fast Delivery</p>
                    <p className="text-xs text-slate-500">Quick doorstep service available</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-1 py-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#87CEEB]">
                    <Headphones size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">24/7 Support</p>
                    <p className="text-xs text-slate-500">Help whenever you need assistance</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Available Stock
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {product.stock ?? 0} units
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Quantity
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {product.qty || "Standard pack"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                {product.category ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {product.category}
                  </p>
                ) : null}

                <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-4xl">
                  {product.name}
                </h1>

                {product.qty ? (
                  <p className="mt-3 text-sm text-slate-500 sm:text-base">{product.qty}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    <Star size={14} className="fill-current" />
                    {product.rating || "4.5"}
                  </div>

                  <span className="text-sm text-slate-500">
                    {product.reviews ? `(${product.reviews} ratings)` : "Popular product"}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-end gap-3">
                  <span className="text-3xl font-extrabold text-slate-900">₹{product.price}</span>
                  {product.oldPrice ? (
                    <span className="text-lg text-slate-400 line-through">₹{product.oldPrice}</span>
                  ) : null}
                  {product.discount ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {product.discount}% off
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#87CEEB] px-5 py-3 text-sm font-semibold text-[#87CEEB] transition hover:bg-[#87CEEB] hover:text-white"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#87CEEB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6EC6E8]"
                  >
                    <Zap size={16} />
                    Buy Now
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold text-slate-900">Product Details</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
              </div>
            </div>
          </div>

          {relatedProducts.length ? (
            <div className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900">Related Products</h2>
                <p className="mt-1 text-sm text-slate-500">
                  More products you may like from this category.
                </p>
              </div>

              <ProductGrid
                products={relatedProducts}
                onAddToCart={(relatedProduct) => {
                  addToCart({
                    ...relatedProduct,
                    pack:
                      relatedProduct.size || relatedProduct.pack || relatedProduct.qty,
                  });
                  navigate("/cart");
                }}
                onBuyNow={(relatedProduct) => {
                  proceedToCheckoutWithAuth(navigate, relatedProduct);
                }}
              />
            </div>
          ) : null}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetails;
