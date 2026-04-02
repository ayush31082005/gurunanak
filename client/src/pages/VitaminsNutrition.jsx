import CategoryProductPage from "../components/common/CategoryProductPage";
import useManagedProducts from "../hooks/useManagedProducts";

const filterOptions = [
    "All Vitamins & Nutrition",
    "Fish Oil",
    "Cod Liver Oil",
    "Flax Seed Oil",
    "Hair & Skin Supplements",
    "Calcium",
    "Vitamin B",
    "Vitamin D",
    "Vitamin C",
    "Global Supplements",
    "Now Foods",
    "Solgar",
    "Nordic Naturals",
];

const vitaminsProducts = [
    {
        id: 1,
        name: "Omega-3 Fish Oil Capsules",
        category: "Fish Oil",
        brand: "HealthPlus",
        price: 699,
        image:
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=800&auto=format&fit=crop",
        description: "Daily omega-3 support for heart, brain and joint wellness.",
    },
    {
        id: 2,
        name: "Triple Strength Fish Oil",
        category: "Fish Oil",
        brand: "NutriGold",
        price: 899,
        image:
            "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=800&auto=format&fit=crop",
        description: "High potency fish oil formula with EPA and DHA support.",
    },
    {
        id: 3,
        name: "Cod Liver Oil Softgels",
        category: "Cod Liver Oil",
        brand: "WellSea",
        price: 749,
        image:
            "https://images.unsplash.com/photo-1514995669114-6081e934b693?q=80&w=800&auto=format&fit=crop",
        description: "Cod liver oil supplement enriched with vitamins A and D.",
    },
    {
        id: 4,
        name: "Premium Cod Liver Oil",
        category: "Cod Liver Oil",
        brand: "OceanCare",
        price: 829,
        image:
            "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=800&auto=format&fit=crop",
        description: "Traditional cod liver oil support for immunity and bones.",
    },
    {
        id: 5,
        name: "Cold Pressed Flax Seed Oil",
        category: "Flax Seed Oil",
        brand: "PureSeed",
        price: 499,
        image:
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop",
        description: "Plant-based omega supplement for daily wellness routines.",
    },
    {
        id: 6,
        name: "Organic Flax Seed Oil Capsules",
        category: "Flax Seed Oil",
        brand: "NatureRoot",
        price: 549,
        image:
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        description: "Easy-to-use flax seed oil capsules for balanced nutrition.",
    },
    {
        id: 7,
        name: "Biotin Hair & Skin Gummies",
        category: "Hair & Skin Supplements",
        brand: "GlowCare",
        price: 599,
        image:
            "https://images.unsplash.com/photo-1612531385446-f7b6b8f2b2b1?q=80&w=800&auto=format&fit=crop",
        description: "Biotin-rich gummies to support healthy hair and glowing skin.",
    },
    {
        id: 8,
        name: "Collagen Beauty Formula",
        category: "Hair & Skin Supplements",
        brand: "RadiantLife",
        price: 899,
        image:
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=800&auto=format&fit=crop",
        description: "Collagen blend with vitamins for beauty and skin support.",
    },
    {
        id: 9,
        name: "Calcium + Vitamin D Tablets",
        category: "Calcium",
        brand: "BoneFit",
        price: 349,
        image:
            "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=800&auto=format&fit=crop",
        description: "Helps support bone strength and calcium absorption.",
    },
    {
        id: 10,
        name: "Advanced Calcium Supplement",
        category: "Calcium",
        brand: "StrongBone",
        price: 429,
        image:
            "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=800&auto=format&fit=crop",
        description: "Daily calcium formula for bones, teeth and active lifestyle.",
    },
    {
        id: 11,
        name: "Vitamin B Complex",
        category: "Vitamin B",
        brand: "DailyNutri",
        price: 399,
        image:
            "https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=800&auto=format&fit=crop",
        description: "Supports energy metabolism and overall daily wellness.",
    },
    {
        id: 12,
        name: "Vitamin B12 Support",
        category: "Vitamin B",
        brand: "EnerGlow",
        price: 459,
        image:
            "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=800&auto=format&fit=crop",
        description: "Helps maintain nerve health and supports energy levels.",
    },
    {
        id: 13,
        name: "Vitamin D3 2000 IU",
        category: "Vitamin D",
        brand: "SunVital",
        price: 299,
        image:
            "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=800&auto=format&fit=crop",
        description: "Daily vitamin D support for bones, immunity and health.",
    },
    {
        id: 14,
        name: "Vitamin D + K2",
        category: "Vitamin D",
        brand: "DWell",
        price: 499,
        image:
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=800&auto=format&fit=crop",
        description: "Supports bone density and calcium utilization.",
    },
    {
        id: 15,
        name: "Vitamin C Effervescent Tablets",
        category: "Vitamin C",
        brand: "ImmunoCare",
        price: 279,
        image:
            "https://images.unsplash.com/photo-1514995669114-6081e934b693?q=80&w=800&auto=format&fit=crop",
        description: "Refreshing vitamin C support for immunity and recovery.",
    },
    {
        id: 16,
        name: "Vitamin C 1000 mg",
        category: "Vitamin C",
        brand: "C-Boost",
        price: 349,
        image:
            "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=800&auto=format&fit=crop",
        description: "High strength vitamin C tablets for daily immune care.",
    },
    {
        id: 17,
        name: "Imported Multivitamin Formula",
        category: "Global Supplements",
        brand: "WorldCare",
        price: 1499,
        image:
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        description: "Premium global supplement blend for complete wellness support.",
    },
    {
        id: 18,
        name: "Global Omega Wellness",
        category: "Global Supplements",
        brand: "EuroNutri",
        price: 1699,
        image:
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
        description: "International supplement formula for healthy daily nutrition.",
    },
    {
        id: 19,
        name: "Now Foods Omega-3",
        category: "Now Foods",
        brand: "Now Foods",
        price: 1899,
        image:
            "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=800&auto=format&fit=crop",
        description: "Trusted global supplement brand with omega wellness support.",
    },
    {
        id: 20,
        name: "Now Foods Vitamin D3",
        category: "Now Foods",
        brand: "Now Foods",
        price: 1599,
        image:
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=800&auto=format&fit=crop",
        description: "Imported vitamin D supplement for bone and immune care.",
    },
    {
        id: 21,
        name: "Solgar Calcium Magnesium",
        category: "Solgar",
        brand: "Solgar",
        price: 2199,
        image:
            "https://images.unsplash.com/photo-1514995669114-6081e934b693?q=80&w=800&auto=format&fit=crop",
        description: "Premium Solgar formula for bone and mineral balance.",
    },
    {
        id: 22,
        name: "Solgar Vitamin B Complex",
        category: "Solgar",
        brand: "Solgar",
        price: 1999,
        image:
            "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=800&auto=format&fit=crop",
        description: "Premium B-complex support from a trusted international brand.",
    },
    {
        id: 23,
        name: "Nordic Naturals Omega",
        category: "Nordic Naturals",
        brand: "Nordic Naturals",
        price: 2499,
        image:
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        description: "High-quality omega formula from Nordic Naturals.",
    },
    {
        id: 24,
        name: "Nordic Naturals DHA",
        category: "Nordic Naturals",
        brand: "Nordic Naturals",
        price: 2699,
        image:
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
        description: "Premium DHA support for brain and overall health.",
    },
];

const VitaminsNutrition = () => {
    const managedProducts = useManagedProducts({
        fallbackProducts: vitaminsProducts,
        allowedCategories: ["Vitamins & Nutrition", ...filterOptions.slice(1)],
    });

    return (
        <CategoryProductPage
            pageTitle="Vitamins & Nutrition"
            allLabel="All Vitamins & Nutrition"
            allHeading="Top Picks - Vitamins & Nutrition"
            headingEyebrow="Vitamins & Nutrition"
            headingDescription="Explore omega oils, vitamins, minerals and global nutrition supplements."
            heroEyebrow="Daily Nutrition"
            heroDescription="Give the page a stronger first impression with a supplements-focused banner linked to daily wellness."
            heroImage="https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=1600&q=80"
            filterOptions={filterOptions}
            products={managedProducts}
            searchPlaceholder="Search vitamins & nutrition..."
        />
    );
};

export default VitaminsNutrition;
