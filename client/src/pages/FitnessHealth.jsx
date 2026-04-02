import CategoryProductPage from "../components/common/CategoryProductPage";
import useManagedProducts from "../hooks/useManagedProducts";

const filterOptions = [
    "All Fitness & Health",
    "Pre/Post Workout",
    "Mass Gainers",
    "Plant Protein",
    "Smart Watches & Rings",
    "Fat Burners",
];

const fitnessProducts = [
    {
        id: 1,
        name: "Pre Workout Energy Boost",
        category: "Pre/Post Workout",
        brand: "FitFuel",
        price: 899,
        image:
            "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=800&auto=format&fit=crop",
        description: "Supports workout energy, focus and performance before training.",
    },
    {
        id: 2,
        name: "Post Workout Recovery Formula",
        category: "Pre/Post Workout",
        brand: "PowerLab",
        price: 1099,
        image:
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
        description: "Helps recovery and muscle support after intense sessions.",
    },
    {
        id: 3,
        name: "Advanced Mass Gainer",
        category: "Mass Gainers",
        brand: "BulkPro",
        price: 1599,
        image:
            "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=800&auto=format&fit=crop",
        description: "High calorie formula designed for healthy weight gain.",
    },
    {
        id: 4,
        name: "Lean Mass Builder",
        category: "Mass Gainers",
        brand: "MuscleCore",
        price: 1749,
        image:
            "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=800&auto=format&fit=crop",
        description: "Balanced protein and carbs for lean muscle goals.",
    },
    {
        id: 5,
        name: "Plant Protein Vanilla",
        category: "Plant Protein",
        brand: "GreenFit",
        price: 1299,
        image:
            "https://images.unsplash.com/photo-1612531385446-f7b6b8f2b2b1?q=80&w=800&auto=format&fit=crop",
        description: "Plant-based protein blend for daily nutrition support.",
    },
    {
        id: 6,
        name: "Vegan Protein Chocolate",
        category: "Plant Protein",
        brand: "NutriLeaf",
        price: 1399,
        image:
            "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format&fit=crop",
        description: "Smooth vegan protein powder with great taste and digestion support.",
    },
    {
        id: 7,
        name: "Smart Fitness Watch",
        category: "Smart Watches & Rings",
        brand: "PulseTech",
        price: 3499,
        image:
            "https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=800&auto=format&fit=crop",
        description: "Track heart rate, sleep, steps and workouts with ease.",
    },
    {
        id: 8,
        name: "Health Smart Ring",
        category: "Smart Watches & Rings",
        brand: "RingFit",
        price: 4999,
        image:
            "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?q=80&w=800&auto=format&fit=crop",
        description: "Compact smart ring with wellness and recovery tracking.",
    },
    {
        id: 9,
        name: "Thermo Fat Burner",
        category: "Fat Burners",
        brand: "ShredMax",
        price: 1199,
        image:
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
        description: "Supports active lifestyle and fat metabolism goals.",
    },
    {
        id: 10,
        name: "Daily Burn Capsules",
        category: "Fat Burners",
        brand: "FitCut",
        price: 999,
        image:
            "https://images.unsplash.com/photo-1514995669114-6081e934b693?q=80&w=800&auto=format&fit=crop",
        description: "Workout companion for weight management plans.",
    },
];

const FitnessHealth = () => {
    const managedProducts = useManagedProducts({
        fallbackProducts: fitnessProducts,
        allowedCategories: ["Fitness & Health", ...filterOptions.slice(1)],
    });

    return (
        <CategoryProductPage
            pageTitle="Fitness & Health"
            allLabel="All Fitness & Health"
            allHeading="Top Picks - Fitness & Health"
            headingEyebrow="Fitness & Health"
            headingDescription="Explore supplements, performance nutrition and smart fitness products."
            heroEyebrow="Active Living"
            heroDescription="From workout nutrition to smart wellness gear, browse a stronger and more energetic fitness collection."
            heroImage="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80"
            filterOptions={filterOptions}
            products={managedProducts}
            searchPlaceholder="Search fitness products..."
        />
    );
};

export default FitnessHealth;
