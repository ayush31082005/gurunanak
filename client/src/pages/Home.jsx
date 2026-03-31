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
} from "../data/products";

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    navigate("/cart");
  };

  const handleBuyNow = (product) => {
    navigate("/checkout", {
      state: {
        checkoutItems: [{ ...product, quantity: 1 }],
        source: "buy-now",
      },
    });
  };

  return (
    <>
      <HeroBanner />
      <HealthConcerns />
      <FeaturedBrands />

      <ProductSection
        title="Featured Products"
        products={featuredProducts}
        highlightIndex={1}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* <PersonalCare /> */}

      <ProductSection
        title="Trending now"
        products={trendingProducts}
        highlightIndex={1}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <AyurvedaBrands />

      <ProductSection
        title="Deals of the day"
        products={dealsProducts}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <ProductSection
        title="Skincare Picks Just for You"
        products={skincareProducts}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <PromoStrip />
    </>
  );
};

export default Home;
