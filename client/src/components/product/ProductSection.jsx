import ProductCard from "./ProductCard";
import SectionHeader from "../common/SectionHeader";

const ProductSection = ({
  title,
  products = [],
  highlightIndex = -1,
  to = "/products",
  onAddToCart,
  onBuyNow,
  isLoading = false,
}) => {
  return (
    <section className="bg-transparent py-4 sm:py-5 lg:py-6">
      <div className="container-padded">
        <SectionHeader title={title} to={to} align="left" />

        <div className="mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 scrollbar-hide sm:gap-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`section-skeleton-${title}-${index}`}
                  className="w-[60vw] min-w-[158px] max-w-[178px] flex-shrink-0 snap-start rounded-card border border-gray-200 bg-white p-3 sm:w-[220px] sm:min-w-[220px] sm:max-w-none lg:w-[228px]"
                >
                  <div className="animate-pulse space-y-3">
                    <div className="h-40 rounded-2xl bg-slate-100" />
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                    <div className="h-10 rounded-xl bg-slate-100" />
                  </div>
                </div>
              ))
            : products.map((product, index) => (
                <div
                  key={product.id}
                  className="w-[60vw] min-w-[158px] max-w-[178px] flex-shrink-0 snap-start sm:w-[220px] sm:min-w-[220px] sm:max-w-none lg:w-[228px]"
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
