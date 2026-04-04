import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShoppingCart, Star, Zap } from "lucide-react";
import ProductGrid from "../components/product/ProductGrid";
import { useCart } from "../context/CartContext";
import { allProducts } from "../data/products";
import useManagedProducts from "../hooks/useManagedProducts";
import { proceedToCheckoutWithAuth } from "../utils/checkout";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const managedProducts = useManagedProducts({
    fallbackProducts: allProducts,
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

    const sameCategoryProducts = managedProducts.filter(
      (item) => item.id !== product.id && item.category === product.category
    );

    if (sameCategoryProducts.length >= 4) {
      return sameCategoryProducts.slice(0, 4);
    }

    const fallbackProducts = managedProducts.filter((item) => item.id !== product.id);

    return [...sameCategoryProducts, ...fallbackProducts]
      .filter(
        (item, index, array) =>
          array.findIndex((currentItem) => currentItem.id === item.id) === index
      )
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

  if (!product) {
    return (
      <>
        <section className="bg-[#f6f7fb] py-10">
          <div className="container-padded">
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <p className="text-base text-slate-500">
                Yeh product abhi available nahi mila.
              </p>
              <Link
                to="/products"
                className="mt-5 inline-flex rounded-xl bg-[#ff6f61] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#f45d4f]"
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
    `${product.name} ek trusted healthcare product hai jo ${(
      product.category || "wellness"
    ).toLowerCase()} needs ke liye suitable hai.`;

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
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ff6f61] px-5 py-3 text-sm font-semibold text-[#ff6f61] transition hover:bg-[#ff6f61] hover:text-white"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff6f61] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#f45d4f]"
                  >
                    <Zap size={16} />
                    Buy Now
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold text-slate-900">Product Details</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
            </div>
          </div>

          {relatedProducts.length ? (
            <div className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900">Related Products</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Isi category ke aur products jo tum dekh sakte ho.
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
