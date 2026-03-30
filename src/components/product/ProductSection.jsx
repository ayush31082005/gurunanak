import ProductCard from "./ProductCard";
import SectionHeader from "../common/SectionHeader";

const ProductSection = ({
  title,
  products = [],
  highlightIndex = -1,
  to = "/products",
  onAddToCart,
  onBuyNow,
}) => {
  return (
    <section className="bg-transparent py-8 sm:py-10 lg:py-12">
      <div className="container-padded">
        <SectionHeader title={title} to={to} align="left" />

        <div className="mt-6 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-3 scrollbar-hide sm:gap-5">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="w-[64vw] min-w-[170px] max-w-[190px] flex-shrink-0 snap-start sm:w-[240px] sm:min-w-[240px] sm:max-w-none lg:w-[250px]"
            >
              <ProductCard
                product={product}
                selected={index === highlightIndex}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
