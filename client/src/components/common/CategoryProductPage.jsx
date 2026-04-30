import { useEffect, useMemo, useRef, useState } from "react";
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

const normalizeValue = (value = "") =>
    String(value)
        .trim()
        .toLowerCase();

const filterStopWords = new Set(["all", "and", "by", "product", "products"]);

const getSingularKeyword = (keyword = "") => {
    if (keyword.length > 3 && keyword.endsWith("ies")) {
        return `${keyword.slice(0, -3)}y`;
    }

    if (keyword.length > 3 && keyword.endsWith("s")) {
        return keyword.slice(0, -1);
    }

    return keyword;
};

const getFilterGroups = (filterLabel = "") =>
    normalizeValue(filterLabel)
        .split(/\s*(?:&|and|\/|,)\s*/g)
        .map((group) =>
            group
                .split(/\s+/)
                .map((keyword) => keyword.replace(/[^a-z0-9]/g, ""))
                .filter((keyword) => keyword && !filterStopWords.has(keyword))
                .map((keyword) => {
                    const singularKeyword = getSingularKeyword(keyword);
                    return singularKeyword !== keyword
                        ? [keyword, singularKeyword]
                        : [keyword];
                })
        )
        .filter((group) => group.length > 0);

const matchesSelectedFilter = (item, selectedFilter, allLabel) => {
    if (selectedFilter === allLabel) {
        return true;
    }

    const itemCategory = normalizeValue(item.category);
    const normalizedFilter = normalizeValue(selectedFilter);

    if (itemCategory === normalizedFilter) {
        return true;
    }

    const searchableText = normalizeValue(
        `${item.name || ""} ${item.brand || ""} ${item.description || ""} ${item.category || ""}`
    );

    const filterGroups = getFilterGroups(selectedFilter);

    return filterGroups.some((group) =>
        group.every((keywordAlternatives) =>
            keywordAlternatives.some((keyword) => searchableText.includes(keyword))
        )
    );
};

const CategoryProductPage = ({
    pageTitle,
    allLabel,
    allHeading,
    headingEyebrow,
    headingDescription,
    heroEyebrow,
    heroDescription,
    heroImage,
    heroImageFit = "cover",
    heroImagePosition = "center",
    heroHeightClass = "h-[90px] sm:h-[110px] lg:h-[120px]",
    filterOptions,
    products,
    searchPlaceholder,
    hideBrokenImages = false,
    isLoading = false,
}) => {
    const productsPerPage = 10;
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
    const [currentPage, setCurrentPage] = useState(1);
    const [shouldScrollSidebar, setShouldScrollSidebar] = useState(false);
    const sidebarListRef = useRef(null);
    const contentAreaRef = useRef(null);

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
            const matchesFilter = matchesSelectedFilter(item, selectedFilter, allLabel);
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

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedFilter, selectedBrands, sortBy, failedImageIds]);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    useEffect(() => {
        const updateSidebarScrollState = () => {
            if (typeof window === "undefined" || window.innerWidth < 1024) {
                setShouldScrollSidebar(false);
                return;
            }

            const sidebarList = sidebarListRef.current;
            const contentArea = contentAreaRef.current;

            if (!sidebarList || !contentArea) {
                setShouldScrollSidebar(false);
                return;
            }

            setShouldScrollSidebar(sidebarList.scrollHeight > contentArea.offsetHeight);
        };

        updateSidebarScrollState();

        const resizeObserver =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(() => updateSidebarScrollState())
                : null;

        if (resizeObserver && sidebarListRef.current && contentAreaRef.current) {
            resizeObserver.observe(sidebarListRef.current);
            resizeObserver.observe(contentAreaRef.current);
        }

        window.addEventListener("resize", updateSidebarScrollState);

        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener("resize", updateSidebarScrollState);
        };
    }, [filteredProducts.length, isLoading, selectedFilter, selectedBrands.length, totalPages]);

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
        return filteredProducts.slice(startIndex, startIndex + productsPerPage);
    }, [currentPage, filteredProducts]);

    const paginationRange = useMemo(
        () => Array.from({ length: totalPages }, (_, index) => index + 1),
        [totalPages]
    );

    const startProductNumber =
        filteredProducts.length === 0 ? 0 : (currentPage - 1) * productsPerPage + 1;
    const endProductNumber = Math.min(
        currentPage * productsPerPage,
        filteredProducts.length
    );

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
        <section className="min-h-screen bg-[#f6f6f6] pb-8 pt-4 sm:pt-5">
            <div className="w-full px-0 sm:px-0 lg:px-0">
                <div className="flex items-stretch gap-5">
                    <aside className="hidden lg:block lg:w-[118px] lg:shrink-0 lg:self-stretch">
                        <div className="h-full min-h-full border-r border-slate-200 bg-[#f1f3f5] pr-1">
                            <div
                                className={`h-full px-0 py-1 ${shouldScrollSidebar ? "lg:sticky lg:top-[118px]" : ""}`}
                            >
                                <div
                                    ref={sidebarListRef}
                                    className={`space-y-3 ${shouldScrollSidebar
                                        ? "lg:max-h-[calc(100vh-230px)] lg:overflow-y-auto lg:overscroll-contain scrollbar-hide"
                                        : ""
                                        }`}
                                >
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

                    <div
                        ref={contentAreaRef}
                        className="min-w-0 flex-1 self-start pl-2 pr-3 sm:pl-3 sm:pr-4 lg:pl-4 lg:pr-5"
                    >
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h1 className="text-[22px] font-bold leading-tight text-[#111827] sm:text-[28px]">
                                    {selectedFilter === allLabel ? allHeading : selectedFilter}
                                </h1>
                            </div>

                            <div className="flex shrink-0 items-center gap-3 self-start sm:self-auto">
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

                        <div className="mb-2 overflow-hidden rounded-[10px] bg-[#edf2f7]">
                            <img
                                src={heroImage}
                                alt={pageTitle}
                                className={`w-full ${heroHeightClass} ${heroImageFit === "contain" ? "object-contain" : "object-cover"}`}
                                style={{ objectPosition: heroImagePosition }}
                            />
                        </div>

                        <div className="mb-2 flex justify-end">
                            <span className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3.5 text-sm font-semibold text-slate-600">
                                {isLoading ? "Loading..." : `${filteredProducts.length} products`}
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <article
                                        key={`category-skeleton-${index}`}
                                        className="rounded-[16px] border border-[#e5e7eb] bg-white p-3"
                                    >
                                        <div className="animate-pulse space-y-3">
                                            <div className="h-[170px] rounded-[12px] bg-slate-100" />
                                            <div className="h-5 w-3/4 rounded bg-slate-200" />
                                            <div className="h-4 w-1/2 rounded bg-slate-100" />
                                            <div className="h-4 w-2/3 rounded bg-slate-100" />
                                            <div className="h-10 rounded-xl bg-slate-100" />
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                                <h3 className="text-lg font-bold text-slate-800">No products found</h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Try changing your search or selecting a different filter.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
                                {paginatedProducts.map((item) => {
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
                                                            className="rounded-xl border border-[#0EA5E9] px-4 py-2 text-sm font-semibold text-[#0EA5E9] transition hover:bg-[#0EA5E9] hover:text-white"
                                                        >
                                                            Add
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleBuyNow(item)}
                                                            className="rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
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

                        {!isLoading && filteredProducts.length > 0 ? (
                            <div className="mt-6 flex flex-col gap-4 rounded-[16px] border border-[#e5e7eb] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing {startProductNumber}-{endProductNumber} of{" "}
                                    {filteredProducts.length} products
                                </p>

                                {totalPages > 1 ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((page) => Math.max(page - 1, 1))
                                            }
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
                                                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                                    currentPage === pageNumber
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
                                                setCurrentPage((page) =>
                                                    Math.min(page + 1, totalPages)
                                                )
                                            }
                                            disabled={currentPage === totalPages}
                                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
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
                                            ? "bg-[#0EA5E9] text-white hover:bg-[#0284C7]"
                                            : "bg-[#ffd8d4] text-white"
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
