import CategoryProductPage from "../components/common/CategoryProductPage";
import useManagedProducts from "../hooks/useManagedProducts";

const filterOptions = [
    "All Homeopathy",
    "Homeopathy Diabetes Medicines",
    "Sexual Health",
    "Hair Care Products",
    "Piles and Fissures",
    "Fungal Infection",
    "Obesity",
    "Warts",
];

const homeopathyProducts = [
    {
        id: 1,
        name: "Homeo Sugar Care Drops",
        category: "Homeopathy Diabetes Medicines",
        brand: "Dr. Homeo",
        price: 249,
        image:
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=800&auto=format&fit=crop",
        description: "Homeopathic support formula for daily sugar management wellness.",
    },
    {
        id: 2,
        name: "Diabetes Care Globules",
        category: "Homeopathy Diabetes Medicines",
        brand: "HealHome",
        price: 199,
        image:
            "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=800&auto=format&fit=crop",
        description: "Gentle homeopathic formulation for metabolic wellness support.",
    },
    {
        id: 3,
        name: "Homeo Vitality Tonic",
        category: "Sexual Health",
        brand: "AyurHome",
        price: 329,
        image:
            "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=800&auto=format&fit=crop",
        description: "Homeopathic tonic designed for adult vitality and confidence support.",
    },
    {
        id: 4,
        name: "Homeo Strength Drops",
        category: "Sexual Health",
        brand: "NatureCure",
        price: 289,
        image:
            "https://images.unsplash.com/photo-1514995669114-6081e934b693?q=80&w=800&auto=format&fit=crop",
        description: "Traditional homeopathy-based support for intimate wellness.",
    },
    {
        id: 5,
        name: "Hair Fall Relief Drops",
        category: "Hair Care Products",
        brand: "RootHome",
        price: 219,
        image:
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        description: "Homeopathic hair care support for scalp and hair fall concerns.",
    },
    {
        id: 6,
        name: "Homeo Hair Growth Tonic",
        category: "Hair Care Products",
        brand: "HairHeal",
        price: 259,
        image:
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop",
        description: "Gentle tonic for healthier scalp routine and hair nourishment.",
    },
    {
        id: 7,
        name: "Piles Relief Homeo Tablets",
        category: "Piles and Fissures",
        brand: "CareWell",
        price: 199,
        image:
            "https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=800&auto=format&fit=crop",
        description: "Homeopathic tablets formulated for piles and fissure discomfort support.",
    },
    {
        id: 8,
        name: "Fissure Comfort Drops",
        category: "Piles and Fissures",
        brand: "ReliefHome",
        price: 229,
        image:
            "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=800&auto=format&fit=crop",
        description: "Traditional homeopathic support for digestive and anal comfort.",
    },
    {
        id: 9,
        name: "Anti-Fungal Homeo Cream",
        category: "Fungal Infection",
        brand: "FungiCare",
        price: 179,
        image:
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=800&auto=format&fit=crop",
        description: "Homeopathic skin support cream for fungal irritation care.",
    },
    {
        id: 10,
        name: "Fungal Relief Drops",
        category: "Fungal Infection",
        brand: "SkinHome",
        price: 209,
        image:
            "https://images.unsplash.com/photo-1612531385446-f7b6b8f2b2b1?q=80&w=800&auto=format&fit=crop",
        description: "Supports skin wellness and comfort in fungal care routines.",
    },
    {
        id: 11,
        name: "Weight Balance Homeo Drops",
        category: "Obesity",
        brand: "SlimHome",
        price: 249,
        image:
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
        description: "Homeopathic formula for balanced weight management support.",
    },
    {
        id: 12,
        name: "Obesity Control Tonic",
        category: "Obesity",
        brand: "FitHome",
        price: 279,
        image:
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        description: "Daily homeopathic tonic intended for wellness and weight routines.",
    },
    {
        id: 13,
        name: "Wart Relief Solution",
        category: "Warts",
        brand: "SkinRelief",
        price: 189,
        image:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
        description: "Homeopathic support product for wart care and skin comfort.",
    },
    {
        id: 14,
        name: "Warts Care Drops",
        category: "Warts",
        brand: "DermaHome",
        price: 199,
        image:
            "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800&auto=format&fit=crop",
        description: "Traditional homeopathy-inspired care for wart-related skin concerns.",
    },
];

const Homeopathy = () => {
    const managedProducts = useManagedProducts({
        fallbackProducts: homeopathyProducts,
        allowedCategories: ["Homeopathy", ...filterOptions.slice(1)],
    });

    return (
        <CategoryProductPage
            pageTitle="Homeopathy"
            allLabel="All Homeopathy"
            allHeading="Top Picks - Homeopathy"
            headingEyebrow="Homeopathy"
            headingDescription="Explore homeopathy products by health category and wellness need."
            heroEyebrow="Gentle Remedies"
            heroDescription="A category-relevant hero image now leads the page for homeopathic wellness, skin, digestive and lifestyle care."
            heroImage="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80"
            filterOptions={filterOptions}
            products={managedProducts}
            searchPlaceholder="Search homeopathy products..."
        />
    );
};

export default Homeopathy;
