import { Link } from "react-router-dom";
import PageHero from "../components/common/PageHero";
import { categoryMenu } from "../data/categories";

const Categories = () => {
  return (
    <>
      <PageHero
        title="Shop by Category"
        description="Browse every top-level health and wellness category from the sticky header menu."
      />

      <section className="bg-bg py-10">
        <div className="container-padded grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categoryMenu.map((category) => (
            <Link
              key={category.slug}
              to={`/shop/${category.slug}`}
              className="rounded-card border border-gray-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-hover"
            >
              <h3 className="text-h3 text-textMain">{category.label}</h3>
              <p className="mt-2 text-body text-gray-600">
                {category.sections.reduce((count, section) => count + section.links.length, 0)} subcategories
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default Categories;
