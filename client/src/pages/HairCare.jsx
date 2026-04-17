import CategoryProductPage from "../components/common/CategoryProductPage";
import useManagedProducts from "../hooks/useManagedProducts";

const filterOptions = [
    "All Hair Care",
    "Hair Oils",
    "Shampoos & Conditioners",
    "Hair Serums",
    "Hair Creams & Masks",
    "Hair Colour",
    "Hair Growth Products",
    "Essential Oils",
];

const hairCareProducts = [
    {
        id: 1,
        name: "Coconut Nourishing Hair Oil",
        category: "Hair Oils",
        brand: "AyurMed",
        price: 199,
        image:
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        description: "Deep nourishment for dry and damaged hair.",
    },
    {
        id: 2,
        name: "Onion Black Seed Hair Oil",
        category: "Hair Oils",
        brand: "Herbal Care",
        price: 249,
        image:
            "https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=800&auto=format&fit=crop",
        description: "Helps reduce hair fall and supports stronger roots.",
    },
    {
        id: 15,
        name: "Amla Bhringraj Hair Oil",
        category: "Hair Oils",
        brand: "VedRoots",
        price: 279,
        image:
            "https://images.unsplash.com/photo-1620916297397-a4a5402a3fdf?q=80&w=800&auto=format&fit=crop",
        description: "Traditional nourishing oil blend for scalp care and shine.",
    },
    {
        id: 16,
        name: "Argan Repair Hair Oil",
        category: "Hair Oils",
        brand: "PureGloss",
        price: 325,
        image:
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800&auto=format&fit=crop",
        description: "Smoothens rough ends and helps tame dry, frizzy hair.",
    },
    {
        id: 3,
        name: "Anti-Dandruff Shampoo",
        category: "Shampoos & Conditioners",
        brand: "MediHair",
        price: 299,
        image:
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
        description: "Gentle cleansing formula for dandruff-prone scalp.",
    },
    {
        id: 4,
        name: "Smooth Repair Conditioner",
        category: "Shampoos & Conditioners",
        brand: "SilkRoot",
        price: 275,
        image:
            "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=800&auto=format&fit=crop",
        description: "Makes rough hair smoother, softer and manageable.",
    },
    {
        id: 17,
        name: "Daily Protein Shampoo",
        category: "Shampoos & Conditioners",
        brand: "NutriWash",
        price: 339,
        image:
            "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop",
        description: "Protein-rich shampoo that helps strengthen weak hair.",
    },
    {
        id: 18,
        name: "Coconut Milk Conditioner",
        category: "Shampoos & Conditioners",
        brand: "SilkNest",
        price: 315,
        image:
            "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=800&auto=format&fit=crop",
        description: "Creamy conditioner for softness, hydration and detangling.",
    },
    {
        id: 5,
        name: "Frizz Control Hair Serum",
        category: "Hair Serums",
        brand: "Glossy",
        price: 349,
        image:
            "https://images.unsplash.com/photo-1631730486783-cf33f2cc9900?q=80&w=800&auto=format&fit=crop",
        description: "Lightweight serum for shine and frizz protection.",
    },
    {
        id: 6,
        name: "Keratin Shine Serum",
        category: "Hair Serums",
        brand: "ProCare",
        price: 399,
        image:
            "https://images.unsplash.com/photo-1626015444709-3fd9f85a7d4a?q=80&w=800&auto=format&fit=crop",
        description: "Adds gloss and smoothness to dull hair.",
    },
    {
        id: 19,
        name: "Heat Protect Hair Serum",
        category: "Hair Serums",
        brand: "StyleGuard",
        price: 379,
        image:
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop",
        description: "Protects hair before styling tools and reduces dryness.",
    },
    {
        id: 20,
        name: "Argan Smooth Hair Serum",
        category: "Hair Serums",
        brand: "VelvetDrop",
        price: 429,
        image:
            "https://images.unsplash.com/photo-1631730486783-cf33f2cc9900?q=80&w=800&auto=format&fit=crop",
        description: "Leaves hair glossy, soft and easy to manage all day.",
    },
    {
        id: 7,
        name: "Deep Repair Hair Mask",
        category: "Hair Creams & Masks",
        brand: "RootLove",
        price: 449,
        image:
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800&auto=format&fit=crop",
        description: "Intense repair treatment for weak and brittle hair.",
    },
    {
        id: 8,
        name: "Leave-In Hair Cream",
        category: "Hair Creams & Masks",
        brand: "CarePlus",
        price: 289,
        image:
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop",
        description: "Daily styling cream for softness and hydration.",
    },
    {
        id: 21,
        name: "Intense Keratin Hair Mask",
        category: "Hair Creams & Masks",
        brand: "SalonPro",
        price: 499,
        image:
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop",
        description: "Deep conditioning mask for smooth and salon-like finish.",
    },
    {
        id: 22,
        name: "Curl Defining Hair Cream",
        category: "Hair Creams & Masks",
        brand: "CurlNest",
        price: 319,
        image:
            "https://images.unsplash.com/photo-1487412912498-0447578fcca8?q=80&w=800&auto=format&fit=crop",
        description: "Defines curls while keeping them soft and bouncy.",
    },
    {
        id: 9,
        name: "Natural Black Hair Colour",
        category: "Hair Colour",
        brand: "ColorHerb",
        price: 199,
        image:
            "https://images.unsplash.com/photo-1487412912498-0447578fcca8?q=80&w=800&auto=format&fit=crop",
        description: "Rich long-lasting hair colour with herbal blend.",
    },
    {
        id: 10,
        name: "Burgundy Hair Colour Kit",
        category: "Hair Colour",
        brand: "ShineTone",
        price: 329,
        image:
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
        description: "Salon-style color at home with conditioning care.",
    },
    {
        id: 23,
        name: "Dark Brown Hair Colour Cream",
        category: "Hair Colour",
        brand: "ToneCare",
        price: 289,
        image:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
        description: "Natural-looking dark brown shade with smooth coverage.",
    },
    {
        id: 24,
        name: "Herbal Henna Hair Colour",
        category: "Hair Colour",
        brand: "NatureTint",
        price: 219,
        image:
            "https://images.unsplash.com/photo-1500840216050-6ffa99d75160?q=80&w=800&auto=format&fit=crop",
        description: "Herbal powder-based color for rich tone and shine.",
    },
    {
        id: 11,
        name: "Hair Growth Tonic",
        category: "Hair Growth Products",
        brand: "GrowFast",
        price: 599,
        image:
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=800&auto=format&fit=crop",
        description: "Supports healthy roots and fuller looking hair.",
    },
    {
        id: 12,
        name: "Scalp Revive Growth Spray",
        category: "Hair Growth Products",
        brand: "Follicle+",
        price: 649,
        image:
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop",
        description: "Targeted scalp spray for thinning hair concerns.",
    },
    {
        id: 25,
        name: "Advanced Root Activator Serum",
        category: "Hair Growth Products",
        brand: "RootActive",
        price: 699,
        image:
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=800&auto=format&fit=crop",
        description: "Designed to support stronger roots and healthier scalp care.",
    },
    {
        id: 26,
        name: "Biotin Hair Growth Capsules",
        category: "Hair Growth Products",
        brand: "HairBloom",
        price: 549,
        image:
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=800&auto=format&fit=crop",
        description: "Daily biotin supplement formulated for hair strength support.",
    },
    {
        id: 13,
        name: "Rosemary Essential Oil",
        category: "Essential Oils",
        brand: "NatureDrop",
        price: 229,
        image:
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop",
        description: "Popular essential oil for scalp massage blends.",
    },
    {
        id: 14,
        name: "Lavender Essential Oil",
        category: "Essential Oils",
        brand: "AromaLeaf",
        price: 249,
        image:
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop",
        description: "Refreshing oil for relaxing scalp and hair routines.",
    },
    {
        id: 27,
        name: "Tea Tree Essential Oil",
        category: "Essential Oils",
        brand: "AromaPure",
        price: 259,
        image:
            "https://images.unsplash.com/photo-1608571423539-e951a5a5a2c0?q=80&w=800&auto=format&fit=crop",
        description: "Cleansing essential oil often used in scalp care blends.",
    },
    {
        id: 28,
        name: "Peppermint Essential Oil",
        category: "Essential Oils",
        brand: "MintLeaf",
        price: 239,
        image:
            "https://images.unsplash.com/photo-1611071536599-3b8f71c57a97?q=80&w=800&auto=format&fit=crop",
        description: "Cooling aromatic oil for refreshing hair massage routines.",
    },
];

const HairCare = () => {
    const { products: managedProducts, isLoaded, hasError } = useManagedProducts({
        fallbackProducts: hairCareProducts,
        allowedCategories: ["Hair Care", ...filterOptions.slice(1)],
        returnMeta: true,
    });

    return (
        <CategoryProductPage
            pageTitle="Hair Care"
            allLabel="All Hair Care"
            allHeading="Top Picks - Hair Care"
            headingEyebrow="Hair Care"
            headingDescription="Explore hair care products by category, brand and need."
            heroEyebrow="Beauty Essentials"
            heroDescription="Discover shampoos, oils, serums and repair treatments with a salon-style banner tailored to your hair routine."
            heroImage="./product/hair-care.png"
            heroImageFit="cover"
            heroImagePosition="right center"
            heroHeightClass="h-[110px] sm:h-[135px] lg:h-[150px]"
            filterOptions={filterOptions}
            products={managedProducts}
            searchPlaceholder="Search hair care products..."
            hideBrokenImages
            isLoading={!isLoaded && !hasError}
        />
    );
};

export default HairCare;
