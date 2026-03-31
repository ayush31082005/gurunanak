import ProductCard from "./ProductCard";

const ProductGrid = ({ products = [], onAddToCart, onBuyNow }) => {
  if (!products.length) {
    return (
      <div className="rounded-card border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
