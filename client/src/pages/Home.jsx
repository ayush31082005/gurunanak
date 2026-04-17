import { useMemo } from "react";
import HeroBanner from "../components/home/HeroBanner";
import QuickPharmacyServices from "../components/home/QuickPharmacyServices";
import HealthConcerns from "../components/home/HealthConcerns";
import FeaturedBrands from "../components/home/FeaturedBrands";
import PersonalCare from "../components/home/PersonalCare";
import AyurvedaBrands from "../components/home/AyurvedaBrands";
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

const skincareKeywords = [
  "acne care",
  "bath body",
  "body care",
  "face care",
  "face wash",
  "skin care",
  "skin supplements",
  "skincare",
];

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isSkincareProduct = (product = {}) => {
  const haystack = [
    product.category,
    product.name,
    product.description,
    product.brand,
  ]
    .map(normalizeText)
    .join(" ");
  const compactHaystack = haystack.replace(/\s+/g, "");

  return skincareKeywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    const compactKeyword = normalizedKeyword.replace(/\s+/g, "");

    return (
      haystack.includes(normalizedKeyword) ||
      compactHaystack.includes(compactKeyword)
    );
  });
};

const Home = () => {
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

    const skincareMatches = managedProducts.filter(isSkincareProduct);

    return skincareMatches.slice(0, 8);
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
      <QuickPharmacyServices />
      <HealthConcerns />
      <FeaturedBrands />

      <ProductSection
        title="Featured Products"
        products={featuredSectionProducts}
        highlightIndex={1}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isLoading={isProductsLoading}
      />

      {/* <PersonalCare /> */}

      <ProductSection
        title="Trending now"
        products={trendingSectionProducts}
        highlightIndex={1}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isLoading={isProductsLoading}
      />

      <AyurvedaBrands />

      <ProductSection
        title="Deals of the day"
        products={dealsSectionProducts}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isLoading={isProductsLoading}
      />

      {isProductsLoading || skincareSectionProducts.length ? (
        <ProductSection
          title="Skincare Picks Just for You"
          products={skincareSectionProducts}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isLoading={isProductsLoading}
        />
      ) : null}
    </>
  );
};

export default Home;
