import { useEffect, useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CategoryHeroBanner from "./CategoryHeroBanner";

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
    const [searchTerm, setSearchTerm] = useState("");
    const [failedImageIds, setFailedImageIds] = useState([]);

    useEffect(() => {
        const filterFromUrl = searchParams.get("filter");

        if (filterFromUrl && filterOptions.includes(filterFromUrl)) {
            setSelectedFilter(filterFromUrl);
            return;
        }

        setSelectedFilter(allLabel);
    }, [allLabel, filterOptions, searchParams]);

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
        return products.filter((item) => {
            const matchesFilter = selectedFilter === allLabel || item.category === selectedFilter;
            const query = searchTerm.toLowerCase();
            const matchesSearch =
                item.name.toLowerCase().includes(query) ||
                item.brand.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query);
            const hasWorkingImage = !hideBrokenImages || !failedImageIds.includes(item.id);

            return matchesFilter && matchesSearch && hasWorkingImage;
        });
    }, [allLabel, failedImageIds, hideBrokenImages, products, searchTerm, selectedFilter]);

    const activeDescription =
        selectedFilter === allLabel
            ? headingDescription
            : products.find((item) => item.category === selectedFilter)?.description ||
              headingDescription;

    const handleAddToCart = (product) => {
        addToCart({
            ...product,
            pack: product.size || product.pack || product.qty,
        });
        navigate("/cart");
    };

    const handleBuyNow = (product) => {
        navigate("/checkout", {
            state: {
                checkoutItems: [
                    {
                        ...product,
                        pack: product.size || product.pack || product.qty,
                        quantity: 1,
                    },
                ],
                source: "buy-now",
            },
        });
    };

    return (
        <section className="min-h-screen bg-white pt-0 pb-4">
            <div className="w-full px-0">
                <CategoryHeroBanner
                    eyebrow={heroEyebrow}
                    title={pageTitle}
                    description={heroDescription}
                    image={heroImage}
                    centered
                />

                <div className="mx-auto flex max-w-[1460px] flex-col gap-3 px-2 sm:px-3 lg:flex-row lg:px-4">
                    <aside className="lg:w-[84px] lg:shrink-0 lg:self-start">
                        <div className="lg:sticky lg:top-[112px]">
                            <div className="space-y-2 lg:max-h-[calc(100vh-132px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
                                {filterCards.map((option) => {
                                    const isActive = selectedFilter === option.label;

                                    return (
                                        <button
                                            key={option.label}
                                            type="button"
                                            onClick={() => setSelectedFilter(option.label)}
                                            className={`relative flex min-h-[88px] w-full flex-col items-center justify-center rounded-[16px] border px-1 py-2 text-center transition ${
                                                isActive
                                                    ? "border-[#a2487d] bg-white shadow-[0_10px_20px_rgba(15,23,42,0.08)] ring-2 ring-[#f6d6e7]"
                                                    : "border-transparent bg-[#f6f8fb] hover:border-slate-200 hover:bg-white"
                                            }`}
                                        >
                                            <div className="mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-[12px] bg-white">
                                                <img
                                                    src={option.image}
                                                    alt={option.label}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <span className="text-[10px] font-semibold leading-4 text-slate-800">
                                                {option.label === allLabel ? allHeading : option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1">
                        <div className="relative mb-4 flex flex-col gap-3 lg:min-h-[72px] lg:justify-center">
                            <div className="text-center">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6f61]">
                                    {headingEyebrow}
                                </p>
                                <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                                    {selectedFilter === allLabel ? allHeading : selectedFilter}
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    {activeDescription}
                                </p>
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:flex-row lg:absolute lg:right-0 lg:top-1/2 lg:w-auto lg:-translate-y-1/2 lg:items-center">
                                <div className="relative w-full sm:w-[290px]">
                                    <Search
                                        size={16}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder={searchPlaceholder}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#ff6f61] focus:ring-4 focus:ring-[#ff6f61]/10"
                                    />
                                </div>

                                <span className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#f6f8fb] px-4 text-sm font-semibold text-slate-600">
                                    {filteredProducts.length} products
                                </span>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                                <h3 className="text-lg font-bold text-slate-800">No products found</h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Search change karo ya doosra filter select karo.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
                                            className="rounded-[18px] border border-slate-200 bg-white p-3 transition hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
                                        >
                                            <div className="relative">
                                                {item.badge ? (
                                                    <span className="absolute left-3 top-3 rounded-md bg-[#fff2ea] px-2.5 py-1 text-xs font-semibold text-[#ff6f61]">
                                                        {item.badge}
                                                    </span>
                                                ) : null}

                                                <div className="mx-auto flex h-[156px] w-full max-w-[168px] items-center justify-center overflow-hidden rounded-[12px] bg-[#f8fafc]">
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
                                            </div>

                                            <div className="px-1 pb-1 pt-3">
                                                <h3 className="line-clamp-2 min-h-[44px] text-[16px] font-bold leading-6 text-slate-900">
                                                    {item.name}
                                                </h3>

                                                {subtitle ? (
                                                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                                                ) : null}

                                                {item.rating ? (
                                                    <div className="mt-2.5 flex items-center gap-1.5 text-sm">
                                                        <div className="flex items-center gap-0.5 text-teal-600">
                                                            {[...Array(5)].map((_, index) => (
                                                                <Star
                                                                    key={`${item.id}-star-${index}`}
                                                                    size={13}
                                                                    className={`${
                                                                        index < Math.round(item.rating)
                                                                            ? "fill-current"
                                                                            : "text-slate-300"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="ml-1 font-semibold text-slate-700">
                                                            {item.rating}
                                                        </span>
                                                        {item.reviews ? (
                                                            <span className="text-slate-400">
                                                                ({item.reviews})
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                ) : null}

                                                <div className="mt-2.5 flex flex-wrap items-end gap-x-2 gap-y-1">
                                                    <span className="text-[15px] font-extrabold text-slate-900 sm:text-[17px]">
                                                        Rs{item.price}
                                                    </span>
                                                    {item.originalPrice ? (
                                                        <span className="text-[13px] text-slate-400 line-through">
                                                            Rs{item.originalPrice}
                                                        </span>
                                                    ) : null}
                                                    {discount ? (
                                                        <span className="text-[13px] font-semibold text-teal-600">
                                                            {discount}% off
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <div className="mt-3.5 grid grid-cols-2 gap-2">
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
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryProductPage;
