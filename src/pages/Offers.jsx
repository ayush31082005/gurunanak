import PageHero from "../components/common/PageHero";
import ProductGrid from "../components/product/ProductGrid";
import { dealsProducts } from "../data/products";

const Offers = () => {
  return (
    <>
      <PageHero
        title="Best Offers"
        description="Grab discounted products from our deals section. This page can later be connected with real offer APIs."
      />
      <section className="py-10 bg-bg">
        <div className="container-padded">
          <ProductGrid products={dealsProducts} />
        </div>
      </section>
    </>
  );
};

export default Offers;
