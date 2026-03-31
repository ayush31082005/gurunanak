import { Link, useParams } from "react-router-dom";
import PageHero from "../components/common/PageHero";
import { getSubcategory } from "../data/categories";

const tips = [
  "Best sellers and category highlights",
  "Popular brands and price-friendly options",
  "Fast delivery and quick reorder support",
  "Prescription guidance where applicable",
];

const SubcategoryPage = () => {
  const { categorySlug, subSlug } = useParams();
  const result = getSubcategory(categorySlug, subSlug);

  if (!result) {
    return (
      <>
        <PageHero title="Page not found" description="This subcategory page is not available." />
        <section className="bg-bg py-10">
          <div className="container-padded">
            <Link to="/categories" className="font-medium text-primary">
              Go back to all categories
            </Link>
          </div>
        </section>
      </>
    );
  }

  const { category, link } = result;

  return (
    <>
      <PageHero
        title={link.label}
        description={`Browse ${link.label.toLowerCase()} under ${category.label}.`}
        crumbs={["Home", category.label, link.label]}
      />

      <section className="bg-bg py-10">
        <div className="container-padded grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <div className="rounded-card border border-gray-200 bg-white p-7 shadow-card">
            <h2 className="mb-3 text-h2 text-textMain">About this page</h2>
            <p className="text-body-lg text-gray-600">
              This page was added so every dropdown item in your header opens its own route. You can now replace this
              content with real products, filters, banners or API data whenever you are ready.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {tips.map((tip) => (
                <div key={tip} className="rounded-card bg-bg p-4">
                  <p className="text-body font-medium text-textMain">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-gray-200 bg-white p-7 shadow-card">
            <h3 className="text-h3 text-textMain">Quick links</h3>
            <div className="mt-4 space-y-3">
              <Link to={`/shop/${category.slug}`} className="block font-medium text-primary">
                ← Back to {category.label}
              </Link>
              <Link to="/products" className="block font-medium text-primary">
                Browse all products
              </Link>
              <Link to="/upload-prescription" className="block font-medium text-primary">
                Upload prescription
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SubcategoryPage;
