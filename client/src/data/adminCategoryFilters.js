export const hiddenAdminCategoryNames = new Set([
    "Acne Care",
    "Ayurveda",
    "Ayurveda Supplements",
    "Baby Care",
    "Bath & Body",
    "Beauty Supplements",
    "Body Care",
    "Daily Nutrition",
    "Daily Supplements",
    "Diabetes Care",
    "Face Care",
    "Face Wash",
    "Hair Care",
    "Healthcare Essentials",
    "Oral Care",
    "Protein & Nutrition",
    "Skin Care",
    "Skin Supplements",
    "Skincare",
    "Sports Nutrition",
    "Supplements",
]);

export const adminProductQuickGroups = [
    "Hair Care",
    "Fitness & Health",
    "Sexual Wellness",
    "Vitamins & Nutrition",
    "Supports & Braces",
    "Immunity Boosters",
    "Homeopathy",
    "Pet Care",
];

export const filterAdminCategories = (categories = []) =>
    categories.filter(
        (category) => !hiddenAdminCategoryNames.has((category?.name || "").trim())
    );
