import CategoryProductPage from "../components/common/CategoryProductPage";
import useManagedProducts from "../hooks/useManagedProducts";

const filterOptions = [
    "All Sexual Wellness",
    "Condoms",
    "Lubricants & Massage Gels",
    "Sexual Wellness Devices",
    "Performance Enhancers",
    "Oral Contraceptives",
];

const sexualWellnessProducts = [
    {
        id: 1,
        name: "Ultra Thin Condoms",
        category: "Condoms",
        brand: "SafePlus",
        price: 199,
        image:
            "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=800&auto=format&fit=crop",
        description: "Comfortable fit with reliable protection for intimate moments.",
    },
    {
        id: 2,
        name: "Flavoured Condoms Pack",
        category: "Condoms",
        brand: "PleasureX",
        price: 249,
        image:
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop",
        description: "Variety pack designed for added comfort and confidence.",
    },
    {
        id: 3,
        name: "Water Based Lubricant",
        category: "Lubricants & Massage Gels",
        brand: "SmoothCare",
        price: 299,
        image:
            "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=800&auto=format&fit=crop",
        description: "Gentle and easy-to-use water-based lubricant for smooth comfort.",
    },
    {
        id: 4,
        name: "Relaxing Massage Gel",
        category: "Lubricants & Massage Gels",
        brand: "TenderTouch",
        price: 349,
        image:
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        description: "Soothing massage gel for a relaxing wellness experience.",
    },
    {
        id: 5,
        name: "Personal Wellness Massager",
        category: "Sexual Wellness Devices",
        brand: "CareWave",
        price: 1499,
        image:
            "https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=800&auto=format&fit=crop",
        description: "Compact personal device designed for private wellness use.",
    },
    {
        id: 6,
        name: "Rechargeable Wellness Device",
        category: "Sexual Wellness Devices",
        brand: "PulseCare",
        price: 1899,
        image:
            "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?q=80&w=800&auto=format&fit=crop",
        description: "Portable rechargeable device with multiple intensity modes.",
    },
    {
        id: 7,
        name: "Stamina Support Capsules",
        category: "Performance Enhancers",
        brand: "VitalBoost",
        price: 599,
        image:
            "https://images.unsplash.com/photo-1514995669114-6081e934b693?q=80&w=800&auto=format&fit=crop",
        description: "Daily wellness support formula for energy and confidence.",
    },
    {
        id: 8,
        name: "Performance Support Tonic",
        category: "Performance Enhancers",
        brand: "HerboPower",
        price: 699,
        image:
            "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=800&auto=format&fit=crop",
        description: "Herbal tonic formulated for adult vitality support.",
    },
    {
        id: 9,
        name: "Oral Contraceptive Tablets",
        category: "Oral Contraceptives",
        brand: "CareChoice",
        price: 149,
        image:
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=800&auto=format&fit=crop",
        description: "Daily oral contraceptive tablets as prescribed by a doctor.",
    },
    {
        id: 10,
        name: "Monthly Oral Contraceptive Pack",
        category: "Oral Contraceptives",
        brand: "HealthSure",
        price: 179,
        image:
            "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=800&auto=format&fit=crop",
        description: "Monthly pack for contraceptive care under medical guidance.",
    },
];

const SexualWellness = () => {
    const { products: managedProducts, isLoaded, hasError } = useManagedProducts({
        fallbackProducts: sexualWellnessProducts,
        allowedCategories: ["Sexual Wellness", ...filterOptions.slice(1)],
        returnMeta: true,
    });

    return (
        <CategoryProductPage
            pageTitle="Sexual Wellness"
            allLabel="All Sexual Wellness"
            allHeading="Top Picks - Sexual Wellness"
            headingEyebrow="Sexual Wellness"
            headingDescription="Explore essentials for protection, comfort and adult wellness."
            heroEyebrow="Private Wellness"
            heroDescription="A more professional hero banner for comfort, protection and intimate self-care essentials."
            heroImage="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1600&q=80"
            filterOptions={filterOptions}
            products={managedProducts}
            searchPlaceholder="Search sexual wellness products..."
            isLoading={!isLoaded && !hasError}
        />
    );
};

export default SexualWellness;
