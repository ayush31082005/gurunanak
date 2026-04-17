import PageHero from "../components/common/PageHero";
import ProductGrid from "../components/product/ProductGrid";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { allProducts, dealsProducts } from "../data/products";
import useManagedProducts from "../hooks/useManagedProducts";
import { proceedToCheckoutWithAuth } from "../utils/checkout";

const Offers = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const {
    products: managedProducts,
    isLoaded,
    hasError,
  } = useManagedProducts({
    fallbackProducts: allProducts,
    returnMeta: true,
  });
  const isProductsLoading = !isLoaded && !hasError;

  const offerProducts = useMemo(() => {
    if (!managedProducts.length) {
      return dealsProducts;
    }

    const discountedProducts = managedProducts.filter(
      (product) =>
        (product.discount ?? 0) > 0 ||
        (product.oldPrice ?? 0) > (product.price ?? 0)
    );

    return discountedProducts.length ? discountedProducts : managedProducts;
  }, [managedProducts]);

  const handleAddToCart = (product) => {
    addToCart(product);
    navigate("/cart");
  };

  const handleBuyNow = (product) => {
    proceedToCheckoutWithAuth(navigate, product);
  };

  return (
    <>
      <PageHero
        title="Best Offers"
        description="Grab discounted products from the live catalog managed by admin."
      />
      <section className="py-10 bg-bg">
        <div className="container-padded">
          <ProductGrid
            products={offerProducts}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isLoading={isProductsLoading}
          />
        </div>
      </section>
    </>
  );
};

export default Offers;
