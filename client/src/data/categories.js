export const categoryMenu = [
  {
    label: "Health Resource Center",
    slug: "health-resource-center",
    sections: [
      {
        title: "",
        links: [
          { label: "All Diseases", slug: "all-diseases" },
          { label: "All Medicines", slug: "all-medicines" },
          { label: "Medicines by Therapeutic Class", slug: "medicines-by-therapeutic-class" },
        ],
      },
    ],
  },
  {
    label: "Hair Care",
    slug: "hair-care",
    sections: [
      {
        title: "",
        links: [
          { label: "Hair Oils", slug: "hair-oils" },
          { label: "Shampoos & Conditioners", slug: "shampoos-conditioners" },
          { label: "Hair Serums", slug: "hair-serums" },
          { label: "Hair Creams & Masks", slug: "hair-creams-masks" },
          { label: "Hair Colour", slug: "hair-colour" },
          { label: "Hair Growth Products", slug: "hair-growth-products" },
          { label: "Essential Oils", slug: "essential-oils" },
        ],
      },
    ],
  },
  {
    label: "Fitness & Health",
    slug: "fitness-health",
    sections: [
      {
        title: "",
        links: [
          { label: "Pre/Post Workout", slug: "pre-post-workout" },
          { label: "Mass Gainers", slug: "mass-gainers" },
          { label: "Plant Protein", slug: "plant-protein" },
          { label: "Smart Watches & Rings", slug: "smart-watches-rings" },
          { label: "Fat Burners", slug: "fat-burners" },
        ],
      },
    ],
  },
  {
    label: "Sexual Wellness",
    slug: "sexual-wellness",
    sections: [
      {
        title: "",
        links: [
          { label: "Condoms", slug: "condoms" },
          { label: "Lubricants & Massage Gels", slug: "lubricants-massage-gels" },
          { label: "Sexual Wellness Devices", slug: "sexual-wellness-devices" },
          { label: "Performance Enhancers", slug: "performance-enhancers" },
          { label: "Oral Contraceptives", slug: "oral-contraceptives" },
        ],
      },
    ],
  },
  {
    label: "Vitamins & Nutrition",
    slug: "vitamins-nutrition",
    sections: [
      {
        title: "Omega & Fish Oil & DHA",
        links: [
          { label: "Fish Oil", slug: "fish-oil" },
          { label: "Cod Liver Oil", slug: "cod-liver-oil" },
          { label: "Flax Seed Oil", slug: "flax-seed-oil" },
          { label: "Hair & Skin Supplements", slug: "hair-skin-supplements" },
          { label: "Calcium", slug: "calcium" },
        ],
      },
      {
        title: "Vitamins & Global Supplements",
        links: [
          { label: "Vitamin B", slug: "vitamin-b" },
          { label: "Vitamin D", slug: "vitamin-d" },
          { label: "Vitamin C", slug: "vitamin-c" },
          { label: "Global Supplements", slug: "global-supplements" },
          { label: "Now Foods", slug: "now-foods" },
          { label: "Solgar", slug: "solgar" },
          { label: "Nordic Naturals", slug: "nordic-naturals" },
        ],
      },
    ],
  },
  {
    label: "Supports & Braces",
    slug: "supports-braces",
    sections: [
      {
        title: "",
        links: [
          { label: "Back & Abdomen Support", slug: "back-abdomen-support" },
          { label: "Ankle, Foot & Leg Support", slug: "ankle-foot-leg-support" },
        ],
      },
    ],
  },
  {
    label: "Immunity Boosters",
    slug: "immunity-boosters",
    sections: [
      {
        title: "",
        links: [
          { label: "Chyawanprash", slug: "chyawanprash" },
          { label: "Antioxidant Supplements", slug: "antioxidant-supplements" },
          { label: "Ayurvedic Supplements", slug: "ayurvedic-supplements" },
          { label: "Herbal Tea", slug: "herbal-tea" },
        ],
      },
    ],
  },
  {
    label: "Homeopathy",
    slug: "homeopathy",
    sections: [
      {
        title: "",
        links: [
          { label: "Homeopathy Diabetes Medicines", slug: "homeopathy-diabetes-medicines" },
          { label: "Sexual Health", slug: "sexual-health" },
          { label: "Hair Care Products", slug: "hair-care-products" },
          { label: "Piles and Fissures", slug: "piles-and-fissures" },
          { label: "Fungal Infection", slug: "fungal-infection" },
          { label: "Obesity", slug: "obesity" },
          { label: "Warts", slug: "warts" },
        ],
      },
    ],
  },
  {
    label: "Pet Care",
    slug: "pet-care",
    sections: [
      {
        title: "",
        links: [
          { label: "Pet Supplements", slug: "pet-supplements" },
          { label: "Pet Food", slug: "pet-food" },
        ],
      },
    ],
  },
];

export const getCategoryBySlug = (slug) => categoryMenu.find((item) => item.slug === slug);

export const getSubcategory = (categorySlug, subSlug) => {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;

  for (const section of category.sections) {
    const match = section.links.find((link) => link.slug === subSlug);
    if (match) return { category, section, link: match };
  }

  return null;
};
