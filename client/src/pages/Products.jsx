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
import { proceedToCheckoutWithAuth } from "../utils/checkout";

const staticCategories = [
  "Hair Care",
  "Fitness & Health",
  "Sexual Wellness",
  "Vitamins & Nutrition",
  "Supports & Braces",
  "Immunity Boosters",
  "Homeopathy",
  "Pet Care",
];

const staticConcerns = [
  "Diabetes",
  "Heart Care",
  "Stomach Care",
  "Liver Care",
  "Bone & Muscle",
  "Eye Care",
  "Mental Wellness",
  "Respiratory",
];

const staticBrands = [
  "Himalaya",
  "Wellman",
  "Biotique",
  "Patanjali",
  "Organic India",
  "Dr. Morepen",
  "Dabur",
  "Baidyanath",
  "Dhootapapeshwar",
  "Himalaya Since 1930",
  "Jiva Ayurveda",
  "Kerala Ayurveda",
  "Sri Sri Tattva",
];

const priceRanges = [
  { id: "all", label: "All prices", min: 0, max: Number.POSITIVE_INFINITY },
  { id: "under-300", label: "Under Rs 300", min: 0, max: 300 },
  { id: "300-600", label: "Rs 300 - Rs 600", min: 300, max: 600 },
  { id: "600-1000", label: "Rs 600 - Rs 1000", min: 600, max: 1000 },
  {
    id: "1000-plus",
    label: "Above Rs 1000",
    min: 1000,
    max: Number.POSITIVE_INFINITY,
  },
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
  { id: "brands", label: "Brand" },
  { id: "concerns", label: "Health Concern" },
  { id: "price", label: "Price" },
  { id: "rating", label: "Ratings" },
  { id: "discount", label: "Discount" },
  { id: "delivery", label: "Delivery" },
];

const normalizeValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const inferBrandFromProduct = (item) => {
  const explicitBrand = item.brand || item.company || item.manufacturer || "";

  if (explicitBrand && normalizeValue(explicitBrand) !== "generic") {
    return explicitBrand;
  }

  const searchableText = `${item.name || ""} ${item.description || ""}`.toLowerCase();
  const matchedStaticBrand = staticBrands.find((brand) =>
    searchableText.includes(String(brand).toLowerCase())
  );

  return matchedStaticBrand || explicitBrand;
};

const getBrandValue = (item) => inferBrandFromProduct(item);

const getConcernValues = (item) => {
  const raw =
    item.concern ||
    item.concerns ||
    item.healthConcern ||
    item.healthConcerns ||
    item.issue ||
    item.issues ||
    "";

  if (Array.isArray(raw)) {
    return raw.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const Products = () => {
  const productsPerPage = 10;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedDiscount, setSelectedDiscount] = useState("all");
  const [onlyFastDelivery, setOnlyFastDelivery] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeFilterGroup, setActiveFilterGroup] = useState("categories");
  const [filterSearchTerm, setFilterSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [tempCategories, setTempCategories] = useState([]);
  const [tempBrands, setTempBrands] = useState([]);
  const [tempConcerns, setTempConcerns] = useState([]);
  const [tempPrice, setTempPrice] = useState("all");
  const [tempRating, setTempRating] = useState("all");
  const [tempDiscount, setTempDiscount] = useState("all");
  const [tempFastDelivery, setTempFastDelivery] = useState(false);

  const search = searchParams.get("search") || "";
  const {
    products: managedProducts,
    isLoaded,
    hasError,
  } = useManagedProducts({
    fallbackProducts: allProducts,
    returnMeta: true,
  });
  const isProductsLoading = !isLoaded && !hasError;

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

  const categories = useMemo(() => {
    const dynamicCategories = managedProducts
      .map((item) => item.category)
      .filter(Boolean);

    return [...new Set([...staticCategories, ...dynamicCategories])].sort();
  }, [managedProducts]);

  const brands = useMemo(() => {
    const dynamicBrands = managedProducts
      .map((item) => getBrandValue(item))
      .filter(Boolean);

    return [...new Set([...staticBrands, ...dynamicBrands])].sort();
  }, [managedProducts]);

  const concerns = useMemo(() => {
    const dynamicConcerns = managedProducts.flatMap((item) =>
      getConcernValues(item)
    );

    return [...new Set([...staticConcerns, ...dynamicConcerns])].sort();
  }, [managedProducts]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const concernParam = searchParams.get("concern");
    const priceParam = searchParams.get("price");
    const ratingParam = searchParams.get("rating");
    const discountParam = searchParams.get("discount");
    const deliveryParam = searchParams.get("delivery");

    setSelectedCategories(categoryParam ? [categoryParam] : []);
    setSelectedBrands(brandParam ? [brandParam] : []);
    setSelectedConcerns(concernParam ? [concernParam] : []);

    setSelectedPrice(
      priceParam && priceRanges.some((item) => item.id === priceParam)
        ? priceParam
        : "all"
    );

    setSelectedRating(
      ratingParam && ratingOptions.some((item) => item.id === ratingParam)
        ? ratingParam
        : "all"
    );

    setSelectedDiscount(
      discountParam &&
        discountOptions.some((item) => item.id === discountParam)
        ? discountParam
        : "all"
    );

    setOnlyFastDelivery(deliveryParam === "fast");
  }, [searchParams]);

  const updateUrlFilters = ({
    category = "",
    brand = "",
    concern = "",
    price = "all",
    rating = "all",
    discount = "all",
    delivery = false,
  }) => {
    const params = new URLSearchParams(searchParams);

    if (category) params.set("category", category);
    else params.delete("category");

    if (brand) params.set("brand", brand);
    else params.delete("brand");

    if (concern) params.set("concern", concern);
    else params.delete("concern");

    if (price && price !== "all") params.set("price", price);
    else params.delete("price");

    if (rating && rating !== "all") params.set("rating", rating);
    else params.delete("rating");

    if (discount && discount !== "all") params.set("discount", discount);
    else params.delete("discount");

    if (delivery) params.set("delivery", "fast");
    else params.delete("delivery");

    setSearchParams(params);
  };

  const openFilterPopup = () => {
    setTempCategories(selectedCategories);
    setTempBrands(selectedBrands);
    setTempConcerns(selectedConcerns);
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
    setSelectedBrands(tempBrands);
    setSelectedConcerns(tempConcerns);
    setSelectedPrice(tempPrice);
    setSelectedRating(tempRating);
    setSelectedDiscount(tempDiscount);
    setOnlyFastDelivery(tempFastDelivery);
    setIsFilterOpen(false);

    updateUrlFilters({
      category: tempCategories[0] || "",
      brand: tempBrands[0] || "",
      concern: tempConcerns[0] || "",
      price: tempPrice,
      rating: tempRating,
      discount: tempDiscount,
      delivery: tempFastDelivery,
    });
  };

  const clearFilters = () => {
    setTempCategories([]);
    setTempBrands([]);
    setTempConcerns([]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedConcerns([]);
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

    updateUrlFilters({
      category: "",
      brand: "",
      concern: "",
      price: "all",
      rating: "all",
      discount: "all",
      delivery: false,
    });
  };

  const handleRemoveFilter = (type) => {
    if (type === "category") {
      setSelectedCategories([]);
      updateUrlFilters({
        category: "",
        brand: selectedBrands[0] || "",
        concern: selectedConcerns[0] || "",
        price: selectedPrice,
        rating: selectedRating,
        discount: selectedDiscount,
        delivery: onlyFastDelivery,
      });
    }

    if (type === "brand") {
      setSelectedBrands([]);
      updateUrlFilters({
        category: selectedCategories[0] || "",
        brand: "",
        concern: selectedConcerns[0] || "",
        price: selectedPrice,
        rating: selectedRating,
        discount: selectedDiscount,
        delivery: onlyFastDelivery,
      });
    }

    if (type === "concern") {
      setSelectedConcerns([]);
      updateUrlFilters({
        category: selectedCategories[0] || "",
        brand: selectedBrands[0] || "",
        concern: "",
        price: selectedPrice,
        rating: selectedRating,
        discount: selectedDiscount,
        delivery: onlyFastDelivery,
      });
    }

    if (type === "price") {
      setSelectedPrice("all");
      updateUrlFilters({
        category: selectedCategories[0] || "",
        brand: selectedBrands[0] || "",
        concern: selectedConcerns[0] || "",
        price: "all",
        rating: selectedRating,
        discount: selectedDiscount,
        delivery: onlyFastDelivery,
      });
    }

    if (type === "rating") {
      setSelectedRating("all");
      updateUrlFilters({
        category: selectedCategories[0] || "",
        brand: selectedBrands[0] || "",
        concern: selectedConcerns[0] || "",
        price: selectedPrice,
        rating: "all",
        discount: selectedDiscount,
        delivery: onlyFastDelivery,
      });
    }

    if (type === "discount") {
      setSelectedDiscount("all");
      updateUrlFilters({
        category: selectedCategories[0] || "",
        brand: selectedBrands[0] || "",
        concern: selectedConcerns[0] || "",
        price: selectedPrice,
        rating: selectedRating,
        discount: "all",
        delivery: onlyFastDelivery,
      });
    }

    if (type === "delivery") {
      setOnlyFastDelivery(false);
      updateUrlFilters({
        category: selectedCategories[0] || "",
        brand: selectedBrands[0] || "",
        concern: selectedConcerns[0] || "",
        price: selectedPrice,
        rating: selectedRating,
        discount: selectedDiscount,
        delivery: false,
      });
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    navigate("/cart");
  };

  const handleBuyNow = (product) => {
    proceedToCheckoutWithAuth(navigate, product);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const activePriceRange =
      priceRanges.find((range) => range.id === selectedPrice) || priceRanges[0];
    const activeRating =
      ratingOptions.find((option) => option.id === selectedRating)?.value ?? 0;
    const activeDiscount =
      discountOptions.find((option) => option.id === selectedDiscount)?.value ??
      0;

    let results = managedProducts.filter((item) => {
      const itemCategory = item.category || "";
      const itemBrand = getBrandValue(item);
      const itemConcerns = getConcernValues(item);

      const matchesSearch =
        !q ||
        String(item.name || "").toLowerCase().includes(q) ||
        String(item.qty || "").toLowerCase().includes(q) ||
        String(itemCategory).toLowerCase().includes(q) ||
        String(itemBrand).toLowerCase().includes(q) ||
        itemConcerns.some((entry) => entry.toLowerCase().includes(q));

      const matchesCategory =
        !selectedCategories.length ||
        selectedCategories.some(
          (category) => normalizeValue(category) === normalizeValue(itemCategory)
        );

      const matchesBrand =
        !selectedBrands.length ||
        selectedBrands.some(
          (brand) => normalizeValue(brand) === normalizeValue(itemBrand)
        );

      const matchesConcern =
        !selectedConcerns.length ||
        selectedConcerns.some((concern) =>
          itemConcerns.some(
            (entry) => normalizeValue(entry) === normalizeValue(concern)
          )
        );

      const itemPrice = Number(item.price || 0);
      const itemRating = Number(item.rating || 0);
      const itemDiscount = Number(item.discount || 0);
      const itemDelivery = String(item.delivery || "").toLowerCase();

      const matchesPrice =
        itemPrice >= activePriceRange.min && itemPrice < activePriceRange.max;

      const matchesRating = itemRating >= activeRating;
      const matchesDiscount = itemDiscount >= activeDiscount;

      const matchesDelivery =
        !onlyFastDelivery ||
        itemDelivery.includes("30 mins") ||
        itemDelivery.includes("today");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesConcern &&
        matchesPrice &&
        matchesRating &&
        matchesDiscount &&
        matchesDelivery
      );
    });

    if (sortBy === "price-low") {
      results = [...results].sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0)
      );
    } else if (sortBy === "price-high") {
      results = [...results].sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0)
      );
    } else if (sortBy === "rating-high") {
      results = [...results].sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
      );
    } else if (sortBy === "discount-high") {
      results = [...results].sort(
        (a, b) => Number(b.discount || 0) - Number(a.discount || 0)
      );
    }

    return results;
  }, [
    managedProducts,
    onlyFastDelivery,
    search,
    selectedBrands,
    selectedCategories,
    selectedConcerns,
    selectedDiscount,
    selectedPrice,
    selectedRating,
    sortBy,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    selectedCategories,
    selectedBrands,
    selectedConcerns,
    selectedDiscount,
    selectedPrice,
    selectedRating,
    onlyFastDelivery,
    sortBy,
  ]);

  const totalPages = Math.ceil(filtered.length / productsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filtered.slice(startIndex, startIndex + productsPerPage);
  }, [currentPage, filtered]);

  const paginationRange = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  const startProductNumber =
    filtered.length === 0 ? 0 : (currentPage - 1) * productsPerPage + 1;
  const endProductNumber = Math.min(currentPage * productsPerPage, filtered.length);

  const popupOptions = useMemo(() => {
    if (activeFilterGroup === "categories") {
      return categories.map((category) => ({
        id: category,
        label: category,
        checked: tempCategories.includes(category),
      }));
    }

    if (activeFilterGroup === "brands") {
      return brands.map((brand) => ({
        id: brand,
        label: brand,
        checked: tempBrands.includes(brand),
      }));
    }

    if (activeFilterGroup === "concerns") {
      return concerns.map((concern) => ({
        id: concern,
        label: concern,
        checked: tempConcerns.includes(concern),
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
    brands,
    categories,
    concerns,
    tempBrands,
    tempCategories,
    tempConcerns,
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
    tempBrands.length > 0 ||
    tempConcerns.length > 0 ||
    tempPrice !== "all" ||
    tempRating !== "all" ||
    tempDiscount !== "all" ||
    tempFastDelivery;

  const activeFilterChips = [
    selectedCategories[0]
      ? { type: "category", label: selectedCategories[0] }
      : null,
    selectedBrands[0] ? { type: "brand", label: selectedBrands[0] } : null,
    selectedConcerns[0]
      ? { type: "concern", label: selectedConcerns[0] }
      : null,
    selectedPrice !== "all"
      ? {
        type: "price",
        label:
          priceRanges.find((item) => item.id === selectedPrice)?.label ||
          selectedPrice,
      }
      : null,
    selectedRating !== "all"
      ? {
        type: "rating",
        label:
          ratingOptions.find((item) => item.id === selectedRating)?.label ||
          selectedRating,
      }
      : null,
    selectedDiscount !== "all"
      ? {
        type: "discount",
        label:
          discountOptions.find((item) => item.id === selectedDiscount)?.label ||
          selectedDiscount,
      }
      : null,
    onlyFastDelivery ? { type: "delivery", label: "Fast delivery only" } : null,
  ].filter(Boolean);

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
                    {isProductsLoading
                      ? "Loading products..."
                      : `${filtered.length} product${filtered.length === 1 ? "" : "s"} found`}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {search ? (
                      <>
                        Search results for{" "}
                        <span className="font-semibold text-slate-700">{search}</span>
                      </>
                    ) : (
                      "Browse products using search, sort, and filters."
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={openSortPopup}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#0EA5E9] hover:text-[#0EA5E9]"
                  >
                    Sort
                    <ArrowUpDown size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={openFilterPopup}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#0EA5E9] hover:text-[#0EA5E9]"
                  >
                    All filters
                    <SlidersHorizontal size={16} />
                  </button>
                </div>
              </div>

              {activeFilterChips.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeFilterChips.map((chip) => (
                    <button
                      key={`${chip.type}-${chip.label}`}
                      type="button"
                      onClick={() => handleRemoveFilter(chip.type)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#0EA5E9] bg-[#E0F2FE] px-3 py-1.5 text-sm font-medium text-[#1e3a5f]"
                    >
                      {chip.label}
                      <X size={14} />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                  >
                    Clear all
                  </button>
                </div>
              ) : null}
            </div>

            <ProductGrid
              products={paginatedProducts}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              isLoading={isProductsLoading}
            />

            {!isProductsLoading && filtered.length > 0 ? (
              <div className="mt-6 flex flex-col gap-4 rounded-card border border-gray-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <p className="text-sm text-slate-500">
                  Showing {startProductNumber}-{endProductNumber} of {filtered.length} products
                </p>

                {totalPages > 1 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Prev
                    </button>

                    {paginationRange.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${currentPage === pageNumber
                            ? "bg-[#0EA5E9] text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.min(page + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            ) : !isProductsLoading ? (
              <div className="mt-6 rounded-card border border-gray-200 bg-white p-8 text-center shadow-card">
                <p className="text-base font-semibold text-slate-800">
                  No products found
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Try changing your filters or search term.
                </p>
              </div>
            ) : null}
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
                        className={`relative flex w-full items-center px-4 py-3 text-left text-[15px] transition ${isActive
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
                              prev.includes(option.label) ? [] : [option.label]
                            );
                            return;
                          }

                          if (activeFilterGroup === "brands") {
                            setTempBrands((prev) =>
                              prev.includes(option.label) ? [] : [option.label]
                            );
                            return;
                          }

                          if (activeFilterGroup === "concerns") {
                            setTempConcerns((prev) =>
                              prev.includes(option.label) ? [] : [option.label]
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
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border ${option.checked
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
                    className={`inline-flex min-w-[170px] items-center justify-center rounded-[10px] px-6 py-3 text-[15px] font-semibold transition ${hasAnyActiveFilters
                        ? "bg-[#0EA5E9] text-white hover:bg-[#0284C7]"
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
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border ${isActive
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
