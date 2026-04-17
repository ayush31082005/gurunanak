import ProductCard from "./ProductCard";

const ProductGrid = ({ products = [], onAddToCart, onBuyNow, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={`product-skeleton-${index}`}
            className="min-w-0 overflow-hidden rounded-card border border-gray-200 bg-white p-3"
          >
            <div className="animate-pulse space-y-3">
              <div className="h-40 rounded-2xl bg-slate-100" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="h-5 w-1/3 rounded bg-slate-200" />
              <div className="h-10 rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-card border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {products.map((product) => (
        <div key={product.id} className="min-w-0">
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
