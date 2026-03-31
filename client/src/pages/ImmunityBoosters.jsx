import CategoryProductPage from "../components/common/CategoryProductPage";

const filterOptions = [
    "All Immunity Boosters",
    "Chyawanprash",
    "Antioxidant Supplements",
    "Ayurvedic Supplements",
    "Herbal Tea",
];

const immunityProducts = [
    {
        id: 1,
        name: "Classic Chyawanprash",
        category: "Chyawanprash",
        brand: "AyurCare",
        price: 349,
        image:
            "https://images.unsplash.com/photo-1514995669114-6081e934b693?q=80&w=800&auto=format&fit=crop",
        description: "Traditional chyawanprash blend for seasonal wellness and daily immunity support.",
    },
    {
        id: 2,
        name: "Sugar Free Chyawanprash",
        category: "Chyawanprash",
        brand: "HerboLife",
        price: 399,
        image:
            "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=800&auto=format&fit=crop",
        description: "Herbal chyawanprash formula with balanced nutrition and wellness support.",
    },
    {
        id: 3,
        name: "Antioxidant Wellness Capsules",
        category: "Antioxidant Supplements",
        brand: "NutriGuard",
        price: 599,
        image:
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=800&auto=format&fit=crop",
        description: "Daily antioxidant support formula designed for active immune care.",
    },
    {
        id: 4,
        name: "Vitamin Antioxidant Blend",
        category: "Antioxidant Supplements",
        brand: "VitalShield",
        price: 649,
        image:
            "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=800&auto=format&fit=crop",
        description: "Blend of antioxidant nutrients for daily protection and wellness balance.",
    },
    {
        id: 5,
        name: "Ayurvedic Immunity Tonic",
        category: "Ayurvedic Supplements",
        brand: "AyurRoot",
        price: 289,
        image:
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop",
        description: "Ayurvedic tonic for general wellness and immunity support.",
    },
    {
        id: 6,
        name: "Herbal Ayurvedic Capsules",
        category: "Ayurvedic Supplements",
        brand: "NatureHeal",
        price: 459,
        image:
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        description: "Herbal capsule blend inspired by traditional ayurvedic care.",
    },
    {
        id: 7,
        name: "Tulsi Herbal Tea",
        category: "Herbal Tea",
        brand: "TeaWell",
        price: 199,
        image:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
        description: "Refreshing tulsi tea for daily wellness and soothing comfort.",
    },
    {
        id: 8,
        name: "Ginger Lemon Herbal Tea",
        category: "Herbal Tea",
        brand: "SipCare",
        price: 229,
        image:
            "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800&auto=format&fit=crop",
        description: "Warm herbal tea blend with ginger and lemon for daily refreshment.",
    },
];

const ImmunityBoosters = () => {
    return (
        <CategoryProductPage
            pageTitle="Immunity Boosters"
            allLabel="All Immunity Boosters"
            allHeading="Top Picks - Immunity Boosters"
            headingEyebrow="Immunity Boosters"
            headingDescription="Explore chyawanprash, antioxidants, ayurvedic supplements and herbal tea."
            heroEyebrow="Natural Protection"
            heroDescription="A warm herbal banner for chyawanprash, antioxidants, ayurvedic care and tea-based immunity support."
            heroImage="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80"
            filterOptions={filterOptions}
            products={immunityProducts}
            searchPlaceholder="Search immunity products..."
        />
    );
};

export default ImmunityBoosters;
