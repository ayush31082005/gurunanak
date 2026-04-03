import { useMemo } from "react";
import HeroBanner from "../components/home/HeroBanner";
import HealthConcerns from "../components/home/HealthConcerns";
import FeaturedBrands from "../components/home/FeaturedBrands";
import PersonalCare from "../components/home/PersonalCare";
import AyurvedaBrands from "../components/home/AyurvedaBrands";
import PromoStrip from "../components/home/PromoStrip";
import ProductSection from "../components/product/ProductSection";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  featuredProducts,
  trendingProducts,
  dealsProducts,
  skincareProducts,
  allProducts,
} from "../data/products";
import useManagedProducts from "../hooks/useManagedProducts";
import { proceedToCheckoutWithAuth } from "../utils/checkout";

const skincareCategories = new Set([
  "Acne Care",
  "Bath & Body",
  "Body Care",
  "Face Care",
  "Face Wash",
  "Skin Care",
  "Skin Supplements",
  "Skincare",
]);

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const managedProducts = useManagedProducts({
    fallbackProducts: allProducts,
  });

  const featuredSectionProducts = useMemo(() => {
    if (managedProducts.length) {
      return managedProducts.slice(0, 8);
    }

    return featuredProducts;
  }, [managedProducts]);

  const trendingSectionProducts = useMemo(() => {
    if (!managedProducts.length) {
      return trendingProducts;
    }

    return [...managedProducts]
      .sort(
        (a, b) =>
          (b.rating ?? 0) - (a.rating ?? 0) ||
          (b.reviews ?? 0) - (a.reviews ?? 0)
      )
      .slice(0, 8);
  }, [managedProducts]);

  const dealsSectionProducts = useMemo(() => {
    if (!managedProducts.length) {
      return dealsProducts;
    }

    const discountedProducts = managedProducts.filter(
      (product) =>
        (product.discount ?? 0) > 0 ||
        (product.oldPrice ?? 0) > (product.price ?? 0)
    );

    return discountedProducts.length
      ? discountedProducts.slice(0, 8)
      : managedProducts.slice(0, 8);
  }, [managedProducts]);

  const skincareSectionProducts = useMemo(() => {
    if (!managedProducts.length) {
      return skincareProducts;
    }

    const skincareMatches = managedProducts.filter((product) =>
      skincareCategories.has(product.category)
    );

    return skincareMatches.length
      ? skincareMatches.slice(0, 8)
      : managedProducts.slice(0, 8);
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
      <HeroBanner />
      <HealthConcerns />
      <FeaturedBrands />

      <ProductSection
        title="Featured Products"
        products={featuredSectionProducts}
        highlightIndex={1}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* <PersonalCare /> */}

      <ProductSection
        title="Trending now"
        products={trendingSectionProducts}
        highlightIndex={1}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <AyurvedaBrands />

      <ProductSection
        title="Deals of the day"
        products={dealsSectionProducts}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <ProductSection
        title="Skincare Picks Just for You"
        products={skincareSectionProducts}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <PromoStrip />
    </>
  );
};

export default Home;
