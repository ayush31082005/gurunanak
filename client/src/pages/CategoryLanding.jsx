import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "../components/common/PageHero";
import { getCategoryBySlug } from "../data/categories";

const CategoryLanding = () => {
  const { categorySlug } = useParams();

  if (categorySlug === "health-resource-center") {
    return <Navigate to="/health-resource-center" replace />;
  }

  if (categorySlug === "hair-care") {
    return <Navigate to="/hair-care" replace />;
  }

  if (categorySlug === "fitness-health") {
    return <Navigate to="/fitness-health" replace />;
  }

  if (categorySlug === "sexual-wellness") {
    return <Navigate to="/sexual-wellness" replace />;
  }

  if (categorySlug === "vitamins-nutrition") {
    return <Navigate to="/vitamins-nutrition" replace />;
  }

  if (categorySlug === "supports-braces") {
    return <Navigate to="/supports-braces" replace />;
  }

  if (categorySlug === "immunity-boosters") {
    return <Navigate to="/immunity-boosters" replace />;
  }

  if (categorySlug === "homeopathy") {
    return <Navigate to="/homeopathy" replace />;
  }

  if (categorySlug === "pet-care") {
    return <Navigate to="/pet-care" replace />;
  }

  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return (
      <>
        <PageHero title="Category not found" description="The selected category does not exist." />
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

  return (
    <>
      <PageHero
        title={category.label}
        description={`Explore ${category.label.toLowerCase()} products and health essentials.`}
        crumbs={["Home", "Categories", category.label]}
      />

      <section className="bg-bg py-10">
        <div className="container-padded grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {category.sections.flatMap((section) =>
            section.links.map((link) => (
              <Link
                key={link.slug}
                to={`/shop/${category.slug}/${link.slug}`}
                className="rounded-card border border-gray-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-hover"
              >
                <p className="text-h3 text-textMain">{link.label}</p>
                <p className="mt-2 text-body text-gray-600">
                  View products, offers and information for {link.label.toLowerCase()}.
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  );
};

export default CategoryLanding;
