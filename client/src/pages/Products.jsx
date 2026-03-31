import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import PageHero from "../components/common/PageHero";
import ProductGrid from "../components/product/ProductGrid";
import { useCart } from "../context/CartContext";
import { allProducts } from "../data/products";

const priceRanges = [
  { id: "all", label: "All prices", min: 0, max: Number.POSITIVE_INFINITY },
  { id: "under-300", label: "Under Rs 300", min: 0, max: 300 },
  { id: "300-600", label: "Rs 300 - Rs 600", min: 300, max: 600 },
  { id: "600-1000", label: "Rs 600 - Rs 1000", min: 600, max: 1000 },
  { id: "1000-plus", label: "Above Rs 1000", min: 1000, max: Number.POSITIVE_INFINITY },
];

const ratingOptions = [
  { id: "all", label: "All ratings", value: 0 },
  { id: "4plus", label: "4.0 and above", value: 4 },
  { id: "4.5plus", label: "4.5 and above", value: 4.5 },
];

const discountOptions = [
  { id: "all", label: "All discounts", value: 0 },
  { id: "10plus", label: "10% or more", value: 10 },
  { id: "20plus", label: "20% or more", value: 20 },
  { id: "30plus", label: "30% or more", value: 30 },
];

const Products = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedDiscount, setSelectedDiscount] = useState("all");
  const [onlyFastDelivery, setOnlyFastDelivery] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const search = searchParams.get("search") || "";

  const categories = useMemo(
    () => [...new Set(allProducts.map((item) => item.category).filter(Boolean))].sort(),
    []
  );

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPrice("all");
    setSelectedRating("all");
    setSelectedDiscount("all");
    setOnlyFastDelivery(false);
    setSortBy("featured");
  };

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const activePriceRange = priceRanges.find((range) => range.id === selectedPrice) || priceRanges[0];
    const activeRating = ratingOptions.find((option) => option.id === selectedRating)?.value ?? 0;
    const activeDiscount = discountOptions.find((option) => option.id === selectedDiscount)?.value ?? 0;

    const results = allProducts.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.qty.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesCategory =
        !selectedCategories.length || selectedCategories.includes(item.category);
      const matchesPrice =
        item.price >= activePriceRange.min && item.price < activePriceRange.max;
      const matchesRating = (item.rating ?? 0) >= activeRating;
      const matchesDiscount = (item.discount ?? 0) >= activeDiscount;
      const matchesDelivery =
        !onlyFastDelivery ||
        item.delivery.toLowerCase().includes("30 mins") ||
        item.delivery.toLowerCase().includes("today");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesRating &&
        matchesDiscount &&
        matchesDelivery
      );
    });

    if (sortBy === "price-low") {
      return [...results].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      return [...results].sort((a, b) => b.price - a.price);
    }

    if (sortBy === "rating-high") {
      return [...results].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    if (sortBy === "discount-high") {
      return [...results].sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
    }

    return results;
  }, [
    onlyFastDelivery,
    search,
    selectedCategories,
    selectedDiscount,
    selectedPrice,
    selectedRating,
    sortBy,
  ]);

  return (
    <>
      <PageHero
        title="All Products"
        crumbs={["Home", "Products"]}
        backgroundImage="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80"
      />
      <section className="bg-bg py-10">
        <div className="container-padded">
          <div className="min-w-0">
            <div className="mb-5 rounded-card border border-gray-200 bg-white p-4 shadow-card sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-[#ff6f61] hover:text-[#ff6f61]"
                  >
                    {isFilterOpen ? <X size={18} /> : <SlidersHorizontal size={18} />}
                    <span>Filter</span>
                  </button>

                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {filtered.length} product{filtered.length === 1 ? "" : "s"} found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {search ? (
                        <>
                          Search results for <span className="font-semibold text-slate-700">{search}</span>
                        </>
                      ) : (
                        "Use filters to narrow down the product list."
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor="sort-products" className="text-sm font-medium text-slate-600">
                    Sort by
                  </label>
                  <select
                    id="sort-products"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#ff6f61]"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating-high">Rating</option>
                    <option value="discount-high">Discount</option>
                  </select>
                </div>
              </div>

              {isFilterOpen ? (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">Filters</p>
                      <p className="mt-1 text-sm text-slate-500">Refine product results</p>
                    </div>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm font-semibold text-[#ff6f61] transition hover:text-[#f45d4f]"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Categories</p>
                      <div className="mt-3 max-h-64 space-y-2.5 overflow-y-auto pr-1">
                        {categories.map((category) => (
                          <label key={category} className="flex items-center gap-3 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => toggleCategory(category)}
                              className="h-4 w-4 rounded border-slate-300 text-[#ff6f61] focus:ring-[#ff6f61]"
                            />
                            <span>{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">Price</p>
                      <div className="mt-3 space-y-2.5">
                        {priceRanges.map((range) => (
                          <label key={range.id} className="flex items-center gap-3 text-sm text-slate-600">
                            <input
                              type="radio"
                              name="price-range"
                              checked={selectedPrice === range.id}
                              onChange={() => setSelectedPrice(range.id)}
                              className="h-4 w-4 border-slate-300 text-[#ff6f61] focus:ring-[#ff6f61]"
                            />
                            <span>{range.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">Ratings</p>
                      <div className="mt-3 space-y-2.5">
                        {ratingOptions.map((option) => (
                          <label key={option.id} className="flex items-center gap-3 text-sm text-slate-600">
                            <input
                              type="radio"
                              name="rating-filter"
                              checked={selectedRating === option.id}
                              onChange={() => setSelectedRating(option.id)}
                              className="h-4 w-4 border-slate-300 text-[#ff6f61] focus:ring-[#ff6f61]"
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">Discount & Delivery</p>
                      <div className="mt-3 space-y-2.5">
                        {discountOptions.map((option) => (
                          <label key={option.id} className="flex items-center gap-3 text-sm text-slate-600">
                            <input
                              type="radio"
                              name="discount-filter"
                              checked={selectedDiscount === option.id}
                              onChange={() => setSelectedDiscount(option.id)}
                              className="h-4 w-4 border-slate-300 text-[#ff6f61] focus:ring-[#ff6f61]"
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}

                        <label className="flex items-center gap-3 pt-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={onlyFastDelivery}
                            onChange={(event) => setOnlyFastDelivery(event.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-[#ff6f61] focus:ring-[#ff6f61]"
                          />
                          <span>Fast delivery only</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <ProductGrid
              products={filtered}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Products;
