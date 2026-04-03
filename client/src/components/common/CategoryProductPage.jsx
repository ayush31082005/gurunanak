import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Star,
    SlidersHorizontal,
    ArrowUpDown,
    X,
    Check,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { proceedToCheckoutWithAuth } from "../../utils/checkout";

const CategoryProductPage = ({
    pageTitle,
    allLabel,
    allHeading,
    headingEyebrow,
    headingDescription,
    heroEyebrow,
    heroDescription,
    heroImage,
    filterOptions,
    products,
    searchPlaceholder,
    hideBrokenImages = false,
}) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [searchParams] = useSearchParams();

    const [selectedFilter, setSelectedFilter] = useState(allLabel);
    const [tempFilter, setTempFilter] = useState(allLabel);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [tempBrands, setTempBrands] = useState([]);
    const [activeFilterGroup, setActiveFilterGroup] = useState("brands");
    const [filterSearchTerm, setFilterSearchTerm] = useState("");
    const [searchTerm] = useState("");
    const [failedImageIds, setFailedImageIds] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortBy, setSortBy] = useState("relevance");

    useEffect(() => {
        const filterFromUrl = searchParams.get("filter");

        if (filterFromUrl && filterOptions.includes(filterFromUrl)) {
            setSelectedFilter(filterFromUrl);
            setTempFilter(filterFromUrl);
            return;
        }

        setSelectedFilter(allLabel);
        setTempFilter(allLabel);
    }, [allLabel, filterOptions, searchParams]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                setIsFilterOpen(false);
                setIsSortOpen(false);
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const filterCards = useMemo(() => {
        return filterOptions.map((option) => {
            const previewImage =
                option === allLabel
                    ? heroImage
                    : products.find((item) => item.category === option)?.image || heroImage;

            return {
                label: option,
                image: previewImage,
            };
        });
    }, [allLabel, filterOptions, heroImage, products]);

    const filteredProducts = useMemo(() => {
        let result = products.filter((item) => {
            const matchesFilter = selectedFilter === allLabel || item.category === selectedFilter;
            const query = searchTerm.toLowerCase();
            const itemName = item.name?.toLowerCase() || "";
            const itemBrand = item.brand?.toLowerCase() || "";
            const itemDescription = item.description?.toLowerCase() || "";
            const itemCategory = item.category?.toLowerCase() || "";
            const matchesSearch =
                itemName.includes(query) ||
                itemBrand.includes(query) ||
                itemDescription.includes(query) ||
                itemCategory.includes(query);
            const matchesBrand =
                selectedBrands.length === 0 || selectedBrands.includes(item.brand || "");

            const hasWorkingImage = !hideBrokenImages || !failedImageIds.includes(item.id);

            return (
                matchesFilter &&
                matchesSearch &&
                matchesBrand &&
                hasWorkingImage
            );
        });

        if (sortBy === "price-low-high") {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high-low") {
            result = [...result].sort((a, b) => b.price - a.price);
        } else if (sortBy === "name-a-z") {
            result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [
        allLabel,
        failedImageIds,
        hideBrokenImages,
        products,
        searchTerm,
        selectedFilter,
        selectedBrands,
        sortBy,
    ]);

    const handleAddToCart = (product) => {
        addToCart({
            ...product,
            pack: product.size || product.pack || product.qty,
        });
        navigate("/cart");
    };

    const handleBuyNow = (product) => {
        proceedToCheckoutWithAuth(navigate, product);
    };

    const handleViewDetails = (product) => {
        navigate(`/products/${product.id}`);
    };

    const openFilterPopup = () => {
        setTempFilter(selectedFilter);
        setTempBrands(selectedBrands);
        setActiveFilterGroup("brands");
        setFilterSearchTerm("");
        setIsSortOpen(false);
        setIsFilterOpen(true);
    };

    const openSortPopup = () => {
        setIsFilterOpen(false);
        setIsSortOpen(true);
    };

    const applyFilter = () => {
        setSelectedFilter(tempFilter);
        setSelectedBrands(tempBrands);
        setIsFilterOpen(false);
    };

    const clearFilter = () => {
        setTempFilter(allLabel);
        setSelectedFilter(allLabel);
        setTempBrands([]);
        setSelectedBrands([]);
        setFilterSearchTerm("");
        setIsFilterOpen(false);
    };

    const sortOptions = [
        { id: "relevance", label: "Relevance" },
        { id: "price-low-high", label: "Price: Low to High" },
        { id: "price-high-low", label: "Price: High to Low" },
        { id: "name-a-z", label: "Name: A to Z" },
    ];

    const visibleFilterCards = filterCards;
    const filterGroups = [
        { id: "brands", label: "Brands" },
        { id: "categories", label: "Category" },
    ];

    const brandOptions = useMemo(
        () =>
            [...new Set(products.map((item) => item.brand).filter(Boolean))].map((brand) => ({
                id: brand,
                label: brand,
            })),
        [products]
    );

    const categoryOptions = useMemo(
        () =>
            filterOptions.map((option) => ({
                id: option,
                label: option === allLabel ? allHeading : option,
            })),
        [allHeading, allLabel, filterOptions]
    );

    const popupOptions =
        activeFilterGroup === "categories"
            ? categoryOptions.map((option) => ({
                ...option,
                checked: tempFilter === option.id,
            }))
            : brandOptions.map((option) => ({
                ...option,
                checked: tempBrands.includes(option.label),
            }));

    const searchedPopupOptions = popupOptions.filter((option) =>
        option.label.toLowerCase().includes(filterSearchTerm.toLowerCase())
    );
    const hasAnyActiveFilters =
        tempFilter !== allLabel || tempBrands.length > 0;

    return (
        <section className="min-h-screen bg-[#f6f6f6] pb-10 pt-6">
            <div className="w-full px-0 sm:px-0 lg:px-0">
                <div className="flex items-start gap-5">
                    <aside className="hidden self-start lg:block lg:w-[118px] lg:shrink-0">
                        <div className="lg:sticky lg:top-[118px] lg:pr-1">
                            <div className="lg:max-h-[calc(100vh-230px)] lg:overflow-y-auto lg:overscroll-contain scrollbar-hide">
                                <div className="space-y-3">
                                    {visibleFilterCards.map((option, index) => {
                                        const isActive = selectedFilter === option.label;
                                        const isAllCard = index === 0;

                                        return (
                                            <button
                                                key={option.label}
                                                type="button"
                                                onClick={() => setSelectedFilter(option.label)}
                                                className={`relative flex w-full flex-col items-center rounded-[18px] px-2 py-4 text-center transition ${isActive
                                                    ? "bg-white shadow-sm"
                                                    : "bg-[#ececec] hover:bg-white"
                                                    }`}
                                            >
                                                {isActive ? (
                                                    <span className="absolute right-0 top-0 h-full w-[4px] rounded-full bg-[#a63a76]" />
                                                ) : null}

                                                <div className="mb-3 flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-[14px] bg-white">
                                                    <img
                                                        src={option.image}
                                                        alt={option.label}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                <span
                                                    className={`text-center text-[11px] font-medium leading-4 ${isAllCard ? "text-black" : "text-[#3b3b3b]"
                                                        }`}
                                                >
                                                    {option.label === allLabel ? allHeading : option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1 pl-2 pr-3 sm:pl-3 sm:pr-4 lg:pl-4 lg:pr-5">
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-[24px] font-bold leading-tight text-[#111827] sm:text-[34px]">
                                    {selectedFilter === allLabel ? allHeading : selectedFilter}
                                </h1>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={openSortPopup}
                                    className="inline-flex h-[38px] items-center gap-2 rounded-full border border-[#d1d5db] bg-white px-4 text-[14px] font-medium text-[#111827] hover:bg-[#f9fafb]"
                                >
                                    Sort
                                    <ArrowUpDown size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={openFilterPopup}
                                    className="inline-flex h-[38px] items-center gap-2 rounded-full border border-[#d1d5db] bg-white px-4 text-[14px] font-medium text-[#111827] hover:bg-[#f9fafb]"
                                >
                                    All filters
                                    <SlidersHorizontal size={15} />
                                </button>
                            </div>
                        </div>

                        <div className="mb-8 overflow-hidden rounded-[10px] bg-[#edf2f7]">
                            <img
                                src={heroImage}
                                alt={pageTitle}
                                className="h-[120px] w-full object-cover sm:h-[150px] lg:h-[160px]"
                            />
                        </div>

                        <div className="mb-5 flex justify-end">
                            <span className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-slate-600">
                                {filteredProducts.length} products
                            </span>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                                <h3 className="text-lg font-bold text-slate-800">No products found</h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Search change karo ya doosra filter select karo.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {filteredProducts.map((item) => {
                                    const discount = item.originalPrice
                                        ? Math.round(
                                            ((item.originalPrice - item.price) / item.originalPrice) * 100
                                        )
                                        : null;

                                    const subtitle = item.size || item.pack || item.qty || item.brand;

                                    return (
                                        <article
                                            key={item.id}
                                            className="rounded-[16px] border border-[#e5e7eb] bg-white p-3 transition hover:shadow-md"
                                        >
                                            <div className="mx-auto flex h-[170px] w-full items-center justify-center overflow-hidden rounded-[12px] bg-[#f8fafc]">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    onError={() =>
                                                        hideBrokenImages
                                                            ? setFailedImageIds((prev) =>
                                                                prev.includes(item.id)
                                                                    ? prev
                                                                    : [...prev, item.id]
                                                            )
                                                            : undefined
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="pt-3">
                                                <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold leading-6 text-slate-900">
                                                    {item.name}
                                                </h3>

                                                {subtitle ? (
                                                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                                                ) : null}

                                                {item.rating ? (
                                                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                                                        <div className="flex items-center gap-0.5 text-teal-600">
                                                            {[...Array(5)].map((_, index) => (
                                                                <Star
                                                                    key={`${item.id}-star-${index}`}
                                                                    size={13}
                                                                    className={`${index < Math.round(item.rating)
                                                                        ? "fill-current"
                                                                        : "text-slate-300"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="font-semibold text-slate-700">
                                                            {item.rating}
                                                        </span>
                                                        {item.reviews ? (
                                                            <span className="text-slate-400">
                                                                ({item.reviews})
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                ) : null}

                                                <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
                                                    <span className="text-[16px] font-bold text-slate-900">
                                                        ₹{item.price}
                                                    </span>
                                                    {item.originalPrice ? (
                                                        <span className="text-[13px] text-slate-400 line-through">
                                                            ₹{item.originalPrice}
                                                        </span>
                                                    ) : null}
                                                    {discount ? (
                                                        <span className="text-[13px] font-semibold text-[#0f9d58]">
                                                            {discount}% off
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <div className="mt-3 space-y-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDetails(item)}
                                                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                    >
                                                        View Details
                                                    </button>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddToCart(item)}
                                                            className="rounded-xl border border-[#ff6f61] px-4 py-2 text-sm font-semibold text-[#ff6f61] transition hover:bg-[#ff6f61] hover:text-white"
                                                        >
                                                            Add
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleBuyNow(item)}
                                                            className="rounded-xl bg-[#ff6f61] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#f45d4f]"
                                                        >
                                                            Buy Now
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                    <div className="flex max-h-[calc(100vh-60px)] w-full max-w-[520px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22)]">
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

                        <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)]">
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
                                            onChange={(e) => setFilterSearchTerm(e.target.value)}
                                            placeholder={`Search ${filterGroups
                                                .find((group) => group.id === activeFilterGroup)
                                                ?.label.toLowerCase()}`}
                                            className="h-[48px] w-full rounded-[12px] border border-[#cbd5e1] bg-white pl-12 pr-4 text-[14px] text-slate-700 outline-none transition placeholder:text-[#9ca3af] focus:border-[#94a3b8]"
                                        />
                                    </div>
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto">
                                    {searchedPopupOptions.length === 0 ? (
                                        <div className="px-5 py-10 text-sm text-slate-500">
                                            No options found.
                                        </div>
                                    ) : (
                                        searchedPopupOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => {
                                                    if (activeFilterGroup === "categories") {
                                                        setTempFilter(option.id);
                                                        return;
                                                    }

                                                    setTempBrands((prev) =>
                                                        prev.includes(option.label)
                                                            ? prev.filter((value) => value !== option.label)
                                                            : [...prev, option.label]
                                                    );
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
                                        onClick={clearFilter}
                                        className="text-[16px] font-semibold text-[#374151] transition hover:text-[#111827]"
                                    >
                                        Clear all
                                    </button>
                                    <button
                                        type="button"
                                        onClick={applyFilter}
                                        className={`inline-flex min-w-[170px] items-center justify-center rounded-[10px] px-6 py-3 text-[15px] font-semibold transition ${hasAnyActiveFilters
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
        </section>
    );
};

export default CategoryProductPage;
