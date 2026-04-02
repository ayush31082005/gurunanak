import CategoryProductPage from "../components/common/CategoryProductPage";
import useManagedProducts from "../hooks/useManagedProducts";

const filterOptions = [
    "All Pet Care",
    "Pet Supplements",
    "Pet Food",
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

const PateCare = () => {
    const managedProducts = useManagedProducts({
        fallbackProducts: petCareProducts,
        allowedCategories: ["Pet Care", ...filterOptions.slice(1)],
    });

    return (
        <CategoryProductPage
            pageTitle="Pet Care"
            allLabel="All Pet Care"
            allHeading="Top Picks - Pet Care"
            headingEyebrow="Pet Care"
            headingDescription="Explore pet supplements, pet food and wellness essentials for everyday care."
            heroEyebrow="Pet Wellness"
            heroDescription="Discover nutrition, supplements and daily wellness essentials for dogs, cats and growing pets."
            heroImage="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1600&q=80"
            filterOptions={filterOptions}
            products={managedProducts}
            searchPlaceholder="Search pet care products..."
        />
    );
};

export default PateCare;
