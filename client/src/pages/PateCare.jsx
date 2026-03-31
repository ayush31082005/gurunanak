import { useEffect, useMemo, useState } from "react";
import { PawPrint, Search, Star } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CategoryHeroBanner from "../components/common/CategoryHeroBanner";
import { useCart } from "../context/CartContext";

const filterOptions = [
    {
        label: "All Pet Care",
        image:
            "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800&auto=format&fit=crop",
        description: "Complete pet nutrition and wellness range",
    },
    {
        label: "Pet Supplements",
        image:
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop",
        description: "Daily wellness, immunity and joint support",
    },
    {
        label: "Pet Food",
        image:
            "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800&auto=format&fit=crop",
        description: "Nutritious food for dogs, cats and puppies",
    },
];

const petCareProducts = [
    {
        id: 1,
        name: "Pet Multivitamin Syrup",
        category: "Pet Supplements",
        brand: "PetWell",
        size: "200 ml Syrup",
        price: 349,
        originalPrice: 425,
        rating: 4.6,
        reviews: 214,
        badge: "Top Pick",
        image:
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop",
        description: "Daily multivitamin support for pets to help maintain overall wellness and energy.",
    },
    {
        id: 2,
        name: "Calcium Supplement for Dogs",
        category: "Pet Supplements",
        brand: "VetCare",
        size: "120 tablets",
        price: 429,
        originalPrice: 499,
        rating: 4.4,
        reviews: 168,
        image:
            "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800&auto=format&fit=crop",
        description: "Supports strong bones and healthy growth in dogs and puppies.",
    },
    {
        id: 3,
        name: "Joint Care Pet Supplement",
        category: "Pet Supplements",
        brand: "PawHealth",
        size: "60 chewables",
        price: 599,
        originalPrice: 699,
        rating: 4.7,
        reviews: 302,
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800&auto=format&fit=crop",
        description: "Supplement designed to support mobility and joint comfort in pets.",
    },
    {
        id: 4,
        name: "Adult Dog Dry Food",
        category: "Pet Food",
        brand: "PetBite",
        size: "3 kg pack",
        price: 799,
        originalPrice: 935,
        rating: 4.5,
        reviews: 427,
        image:
            "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=800&auto=format&fit=crop",
        description: "Balanced dry food formula for adult dogs with essential nutrients.",
    },
    {
        id: 5,
        name: "Premium Cat Food",
        category: "Pet Food",
        brand: "MeowMeal",
        size: "2 kg pack",
        price: 699,
        originalPrice: 825,
        rating: 4.3,
        reviews: 191,
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=800&auto=format&fit=crop",
        description: "Nutritious cat food blend for daily health, taste and vitality.",
    },
    {
        id: 6,
        name: "Puppy Starter Food",
        category: "Pet Food",
        brand: "HappyPaws",
        size: "2.5 kg pack",
        price: 649,
        originalPrice: 759,
        rating: 4.6,
        reviews: 275,
        image:
            "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800&auto=format&fit=crop",
        description: "Special puppy food formula to support early growth and development.",
    },
    {
        id: 7,
        name: "Skin & Coat Omega Bites",
        category: "Pet Supplements",
        brand: "FurGlow",
        size: "90 bites",
        price: 549,
        originalPrice: 645,
        rating: 4.5,
        reviews: 146,
        image:
            "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=800&auto=format&fit=crop",
        description: "Omega-rich supplement bites to support healthy skin and shiny coat.",
    },
    {
        id: 8,
        name: "Grain Free Pet Nutrition Mix",
        category: "Pet Food",
        brand: "TailTreat",
        size: "1.8 kg pack",
        price: 879,
        originalPrice: 999,
        rating: 4.2,
        reviews: 118,
        image:
            "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=800&auto=format&fit=crop",
        description: "Wholesome grain-free food blend crafted for active pets.",
    },
];

const PetCare = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [searchParams] = useSearchParams();
    const [selectedFilter, setSelectedFilter] = useState("All Pet Care");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const filterFromUrl = searchParams.get("filter");

        if (filterFromUrl && filterOptions.some((option) => option.label === filterFromUrl)) {
            setSelectedFilter(filterFromUrl);
            return;
        }

        setSelectedFilter("All Pet Care");
    }, [searchParams]);

    const selectedFilterMeta = useMemo(() => {
        return (
            filterOptions.find((option) => option.label === selectedFilter) ?? filterOptions[0]
        );
    }, [selectedFilter]);

    const filteredProducts = useMemo(() => {
        return petCareProducts.filter((item) => {
            const matchesFilter =
                selectedFilter === "All Pet Care" || item.category === selectedFilter;
            const query = searchTerm.toLowerCase();
            const matchesSearch =
                item.name.toLowerCase().includes(query) ||
                item.brand.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query);

            return matchesFilter && matchesSearch;
        });
    }, [selectedFilter, searchTerm]);

    const handleAddToCart = (product) => {
        addToCart({
            ...product,
            pack: product.size,
        });
        navigate("/cart");
    };

    const handleBuyNow = (product) => {
        navigate("/checkout", {
            state: {
                checkoutItems: [
                    {
                        ...product,
                        pack: product.size,
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
                    eyebrow="Pet Wellness"
                    title="Pet Care"
                    description="An online pet-care banner now gives the page a more premium first look before filters and product cards."
                    image="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1600&q=80"
                    centered
                />

                <div className="mx-auto flex max-w-[1460px] flex-col gap-3 px-2 sm:px-3 lg:flex-row lg:px-4">
                    <aside className="lg:w-[84px] lg:shrink-0 lg:self-start">
                        <div className="lg:sticky lg:top-[112px]">
                            <div className="space-y-2 lg:max-h-[calc(100vh-132px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
                                {filterOptions.map((option, index) => {
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
                                            <div
                                                className={`mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-[12px] ${
                                                    index === 0 ? "bg-[#fff1ef]" : "bg-white"
                                                }`}
                                            >
                                                {index === 0 ? (
                                                    <PawPrint size={18} className="text-[#ff6f61]" />
                                                ) : (
                                                    <img
                                                        src={option.image}
                                                        alt={option.label}
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            <span className="text-[10px] font-semibold leading-4 text-slate-800">
                                                {index === 0 ? "Top Picks - Pet care" : option.label}
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
                                    Pet Care
                                </p>
                                <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                                    {selectedFilter === "All Pet Care" ? "Top Picks - Pet care" : selectedFilter}
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedFilterMeta.description}
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
                                        placeholder="Search pet products..."
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
                                    const discount = Math.round(
                                        ((item.originalPrice - item.price) / item.originalPrice) * 100
                                    );

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
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </div>

                                            <div className="px-1 pb-1 pt-3">
                                                <h3 className="line-clamp-2 min-h-[44px] text-[16px] font-bold leading-6 text-slate-900">
                                                    {item.name}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500">{item.size}</p>

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
                                                    <span className="text-slate-400">({item.reviews})</span>
                                                </div>

                                                <div className="mt-2.5 flex flex-wrap items-end gap-x-2 gap-y-1">
                                                    <span className="text-[15px] font-extrabold text-slate-900 sm:text-[17px]">
                                                        Rs{item.price}
                                                    </span>
                                                    <span className="text-[13px] text-slate-400 line-through">
                                                        Rs{item.originalPrice}
                                                    </span>
                                                    <span className="text-[13px] font-semibold text-teal-600">
                                                        {discount}% off
                                                    </span>
                                                </div>

                                                <div className="mt-3.5 grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddToCart(item)}
                                                        className="flex h-10 w-full items-center justify-center rounded-xl border border-[#ff6f61] text-[13px] font-bold uppercase tracking-[0.12em] text-[#ff6f61] transition hover:bg-[#ff6f61] hover:text-white"
                                                    >
                                                        Add
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleBuyNow(item)}
                                                        className="flex h-10 w-full items-center justify-center rounded-xl bg-[#ff6f61] text-[12px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#f45d4f]"
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

export default PetCare;
