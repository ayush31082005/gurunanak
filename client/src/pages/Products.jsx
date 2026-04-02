import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowUpDown,
  Check,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import PageHero from "../components/common/PageHero";
import ProductGrid from "../components/product/ProductGrid";
import { useCart } from "../context/CartContext";
import { allProducts } from "../data/products";
import useManagedProducts from "../hooks/useManagedProducts";

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

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating-high", label: "Rating" },
  { id: "discount-high", label: "Discount" },
];

const filterGroups = [
  { id: "categories", label: "Category" },
  { id: "price", label: "Price" },
  { id: "rating", label: "Ratings" },
  { id: "discount", label: "Discount" },
  { id: "delivery", label: "Delivery" },
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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeFilterGroup, setActiveFilterGroup] = useState("categories");
  const [filterSearchTerm, setFilterSearchTerm] = useState("");

  const [tempCategories, setTempCategories] = useState([]);
  const [tempPrice, setTempPrice] = useState("all");
  const [tempRating, setTempRating] = useState("all");
  const [tempDiscount, setTempDiscount] = useState("all");
  const [tempFastDelivery, setTempFastDelivery] = useState(false);

  const search = searchParams.get("search") || "";
  const managedProducts = useManagedProducts({
    fallbackProducts: allProducts,
  });

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsFilterOpen(false);
        setIsSortOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const categories = useMemo(
    () => [...new Set(managedProducts.map((item) => item.category).filter(Boolean))].sort(),
    [managedProducts]
  );

  const openFilterPopup = () => {
    setTempCategories(selectedCategories);
    setTempPrice(selectedPrice);
    setTempRating(selectedRating);
    setTempDiscount(selectedDiscount);
    setTempFastDelivery(onlyFastDelivery);
    setActiveFilterGroup("categories");
    setFilterSearchTerm("");
    setIsSortOpen(false);
    setIsFilterOpen(true);
  };

  const openSortPopup = () => {
    setIsFilterOpen(false);
    setIsSortOpen(true);
  };

  const applyFilter = () => {
    setSelectedCategories(tempCategories);
    setSelectedPrice(tempPrice);
    setSelectedRating(tempRating);
    setSelectedDiscount(tempDiscount);
    setOnlyFastDelivery(tempFastDelivery);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setTempCategories([]);
    setSelectedCategories([]);
    setTempPrice("all");
    setSelectedPrice("all");
    setTempRating("all");
    setSelectedRating("all");
    setTempDiscount("all");
    setSelectedDiscount("all");
    setTempFastDelivery(false);
    setOnlyFastDelivery(false);
    setFilterSearchTerm("");
    setIsFilterOpen(false);
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
    const activePriceRange =
      priceRanges.find((range) => range.id === selectedPrice) || priceRanges[0];
    const activeRating =
      ratingOptions.find((option) => option.id === selectedRating)?.value ?? 0;
    const activeDiscount =
      discountOptions.find((option) => option.id === selectedDiscount)?.value ?? 0;

    let results = managedProducts.filter((item) => {
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
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      results = [...results].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-high") {
      results = [...results].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "discount-high") {
      results = [...results].sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
    }

    return results;
  }, [
    managedProducts,
    onlyFastDelivery,
    search,
    selectedCategories,
    selectedDiscount,
    selectedPrice,
    selectedRating,
    sortBy,
  ]);

  const popupOptions = useMemo(() => {
    if (activeFilterGroup === "categories") {
      return categories.map((category) => ({
        id: category,
        label: category,
        checked: tempCategories.includes(category),
      }));
    }

    if (activeFilterGroup === "price") {
      return priceRanges.map((range) => ({
        id: range.id,
        label: range.label,
        checked: tempPrice === range.id,
      }));
    }

    if (activeFilterGroup === "rating") {
      return ratingOptions.map((option) => ({
        id: option.id,
        label: option.label,
        checked: tempRating === option.id,
      }));
    }

    if (activeFilterGroup === "discount") {
      return discountOptions.map((option) => ({
        id: option.id,
        label: option.label,
        checked: tempDiscount === option.id,
      }));
    }

    return [
      {
        id: "fast-delivery",
        label: "Fast delivery only",
        checked: tempFastDelivery,
      },
    ];
  }, [
    activeFilterGroup,
    categories,
    tempCategories,
    tempDiscount,
    tempFastDelivery,
    tempPrice,
    tempRating,
  ]);

  const searchedPopupOptions = popupOptions.filter((option) =>
    option.label.toLowerCase().includes(filterSearchTerm.toLowerCase())
  );

  const hasAnyActiveFilters =
    tempCategories.length > 0 ||
    tempPrice !== "all" ||
    tempRating !== "all" ||
    tempDiscount !== "all" ||
    tempFastDelivery;

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
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {filtered.length} product{filtered.length === 1 ? "" : "s"} found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {search ? (
                      <>
                        Search results for{" "}
                        <span className="font-semibold text-slate-700">{search}</span>
                      </>
                    ) : (
                      "Use filters to narrow down the product list."
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={openSortPopup}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#ff6f61] hover:text-[#ff6f61]"
                  >
                    Sort
                    <ArrowUpDown size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={openFilterPopup}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#ff6f61] hover:text-[#ff6f61]"
                  >
                    All filters
                    <SlidersHorizontal size={16} />
                  </button>
                </div>
              </div>
            </div>

            <ProductGrid
              products={filtered}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        </div>
      </section>

      {(isFilterOpen || isSortOpen) && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
          onClick={() => {
            setIsFilterOpen(false);
            setIsSortOpen(false);
          }}
        />
      )}

      {isFilterOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto p-4">
          <div className="flex max-h-[calc(100vh-60px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#1f2937]">All filters</h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f6] text-slate-600 transition hover:bg-[#e5e7eb]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)]">
              <div className="min-h-0 overflow-y-auto border-b border-[#e5e7eb] bg-white sm:border-b-0 sm:border-r">
                <div className="py-3">
                  {filterGroups.map((group) => {
                    const isActive = activeFilterGroup === group.id;

                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          setActiveFilterGroup(group.id);
                          setFilterSearchTerm("");
                        }}
                        className={`relative flex w-full items-center px-4 py-3 text-left text-[15px] transition ${
                          isActive
                            ? "font-semibold text-[#111827]"
                            : "font-normal text-[#374151] hover:bg-slate-50"
                        }`}
                      >
                        {group.label}
                        {isActive ? (
                          <span className="absolute right-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#111827]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex min-h-0 flex-col">
                <div className="border-b border-[#e5e7eb] px-5 py-4">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                    />
                    <input
                      type="text"
                      value={filterSearchTerm}
                      onChange={(event) => setFilterSearchTerm(event.target.value)}
                      placeholder={`Search ${filterGroups
                        .find((group) => group.id === activeFilterGroup)
                        ?.label.toLowerCase()}`}
                      className="h-[48px] w-full rounded-[12px] border border-[#cbd5e1] bg-white pl-12 pr-4 text-[14px] text-slate-700 outline-none transition placeholder:text-[#9ca3af] focus:border-[#94a3b8]"
                    />
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {searchedPopupOptions.length === 0 ? (
                    <div className="px-5 py-10 text-sm text-slate-500">No options found.</div>
                  ) : (
                    searchedPopupOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          if (activeFilterGroup === "categories") {
                            setTempCategories((prev) =>
                              prev.includes(option.label)
                                ? prev.filter((item) => item !== option.label)
                                : [...prev, option.label]
                            );
                            return;
                          }

                          if (activeFilterGroup === "price") {
                            setTempPrice(option.id);
                            return;
                          }

                          if (activeFilterGroup === "rating") {
                            setTempRating(option.id);
                            return;
                          }

                          if (activeFilterGroup === "discount") {
                            setTempDiscount(option.id);
                            return;
                          }

                          setTempFastDelivery((prev) => !prev);
                        }}
                        className="flex w-full items-center gap-3 border-b border-[#f1f5f9] px-5 py-[13px] text-left transition hover:bg-slate-50"
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border ${
                            option.checked
                              ? "border-[#94a3b8] bg-[#f8fafc] text-[#111827]"
                              : "border-[#94a3b8] bg-white text-transparent"
                          }`}
                        >
                          {option.checked ? <Check size={14} /> : null}
                        </span>

                        <span className="text-[15px] font-normal text-[#1f2937]">
                          {option.label}
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#e5e7eb] bg-white px-5 py-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[16px] font-semibold text-[#374151] transition hover:text-[#111827]"
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={applyFilter}
                    className={`inline-flex min-w-[170px] items-center justify-center rounded-[10px] px-6 py-3 text-[15px] font-semibold transition ${
                      hasAnyActiveFilters
                        ? "bg-[#dbe4f0] text-[#64748b] hover:bg-[#d1dbe8]"
                        : "bg-[#e5e7eb] text-[#9ca3af]"
                    }`}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isSortOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto p-4">
          <div className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#1f2937]">Sort by</h2>
              <button
                type="button"
                onClick={() => setIsSortOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f6] text-slate-600 transition hover:bg-[#e5e7eb]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {sortOptions.map((option) => {
                const isActive = sortBy === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSortBy(option.id);
                      setIsSortOpen(false);
                    }}
                    className="flex w-full items-center gap-3 border-b border-[#f1f5f9] px-5 py-[14px] text-left transition hover:bg-slate-50"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border ${
                        isActive
                          ? "border-[#94a3b8] bg-[#f8fafc] text-[#111827]"
                          : "border-[#94a3b8] bg-white text-transparent"
                      }`}
                    >
                      {isActive ? <Check size={14} /> : null}
                    </span>

                    <span className="text-[15px] font-normal text-[#1f2937]">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Products;
