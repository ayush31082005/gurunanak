export const adminProductPages = [
    { label: "Hair Care", slug: "hair-care" },
    { label: "Fitness & Health", slug: "fitness-health" },
    { label: "Sexual Wellness", slug: "sexual-wellness" },
    { label: "Vitamins & Nutrition", slug: "vitamins-nutrition" },
    { label: "Supports & Braces", slug: "supports-braces" },
    { label: "Immunity Boosters", slug: "immunity-boosters" },
    { label: "Homeopathy", slug: "homeopathy" },
    { label: "Pet Care", slug: "pet-care" },
];

export const getAdminProductPageBySlug = (slug) =>
    adminProductPages.find((page) => page.slug === slug) || null;
