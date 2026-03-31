import CategoryProductPage from "../components/common/CategoryProductPage";

const filterOptions = [
    "All Supports & Braces",
    "Back & Abdomen Support",
    "Ankle, Foot & Leg Support",
];

const supportsProducts = [
    {
        id: 1,
        name: "Lumbar Back Support Belt",
        category: "Back & Abdomen Support",
        brand: "OrthoCare",
        price: 899,
        image:
            "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=800&auto=format&fit=crop",
        description: "Provides support and stability for lower back comfort during daily movement.",
    },
    {
        id: 2,
        name: "Abdominal Support Binder",
        category: "Back & Abdomen Support",
        brand: "HealFit",
        price: 749,
        image:
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
        description: "Comfortable abdominal binder designed for gentle compression and support.",
    },
    {
        id: 3,
        name: "Posture Corrector Brace",
        category: "Back & Abdomen Support",
        brand: "CareFlex",
        price: 999,
        image:
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        description: "Helps improve upper back posture and reduces strain with regular use.",
    },
    {
        id: 4,
        name: "Ankle Support Sleeve",
        category: "Ankle, Foot & Leg Support",
        brand: "MoveEase",
        price: 499,
        image:
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
        description: "Stretch-fit ankle sleeve for everyday stability and movement support.",
    },
    {
        id: 5,
        name: "Knee Cap Support",
        category: "Ankle, Foot & Leg Support",
        brand: "JointCare",
        price: 599,
        image:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
        description: "Comfortable knee support for workouts, walking and daily activities.",
    },
    {
        id: 6,
        name: "Foot Arch Support Brace",
        category: "Ankle, Foot & Leg Support",
        brand: "StepWell",
        price: 649,
        image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop",
        description: "Designed to provide arch support and relieve foot discomfort during movement.",
    },
];

const SupportsBraces = () => {
    return (
        <CategoryProductPage
            pageTitle="Supports & Braces"
            allLabel="All Supports & Braces"
            allHeading="Top Picks - Supports & Braces"
            headingEyebrow="Supports & Braces"
            headingDescription="Explore support products for back, abdomen, ankle, foot and leg care."
            heroEyebrow="Mobility Support"
            heroDescription="Banner updated with an orthopaedic support visual that fits posture, ankle, foot and back care."
            heroImage="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=80"
            filterOptions={filterOptions}
            products={supportsProducts}
            searchPlaceholder="Search support products..."
        />
    );
};

export default SupportsBraces;
