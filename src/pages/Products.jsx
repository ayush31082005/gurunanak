import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageHero from "../components/common/PageHero";
import ProductGrid from "../components/product/ProductGrid";
import { allProducts } from "../data/products";

const Products = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const filtered = useMemo(() => {
    if (!search.trim()) return allProducts;
    const q = search.toLowerCase();
    return allProducts.filter((item) => item.name.toLowerCase().includes(q) || item.qty.toLowerCase().includes(q));
  }, [search]);

  return (
    <>
      <PageHero
        title="All Products"
        description="Browse medicines, supplements, personal care and wellness products in a clean ecommerce layout."
      />
      <section className="py-10 bg-bg">
        <div className="container-padded">
          {search ? <p className="mb-5 text-body text-gray-600">Search results for: <strong>{search}</strong></p> : null}
          <ProductGrid products={filtered} />
        </div>
      </section>
    </>
  );
};

export default Products;
