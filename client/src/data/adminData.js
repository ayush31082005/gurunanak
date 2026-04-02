export const statCards = [
  {
    title: "Total Sales",
    value: "Rs 2,48,500",
    change: "+12.8% from last month",
  },
  {
    title: "Total Orders",
    value: "1,284",
    change: "+8.2% from last month",
  },
  {
    title: "Active Customers",
    value: "864",
    change: "+5.1% from last month",
  },
  {
    title: "Low Stock Items",
    value: "18",
    change: "Needs immediate refill",
  },
];

export const ordersData = [
  {
    id: "ORD-1001",
    customer: "Rohit Sharma",
    amount: "Rs 1,250",
    status: "Delivered",
    payment: "Paid",
  },
  {
    id: "ORD-1002",
    customer: "Priya Singh",
    amount: "Rs 840",
    status: "Processing",
    payment: "Paid",
  },
  {
    id: "ORD-1003",
    customer: "Aman Verma",
    amount: "Rs 2,140",
    status: "Shipped",
    payment: "Paid",
  },
  {
    id: "ORD-1004",
    customer: "Sneha Gupta",
    amount: "Rs 560",
    status: "Pending",
    payment: "COD",
  },
  {
    id: "ORD-1005",
    customer: "Karan Patel",
    amount: "Rs 1,790",
    status: "Delivered",
    payment: "Paid",
  },
];

export const lowStockProducts = [
  { name: "Paracetamol 500mg", sku: "MED-101", stock: 8, threshold: 20 },
  { name: "Vitamin C Tablets", sku: "MED-214", stock: 5, threshold: 15 },
  { name: "Hair Care Serum", sku: "HC-332", stock: 7, threshold: 18 },
  { name: "Protein Powder 1kg", sku: "FT-112", stock: 4, threshold: 10 },
];

export const prescriptionRequests = [
  {
    name: "Anjali Mehta",
    medicine: "Antibiotics",
    uploadedAt: "10 min ago",
    status: "Pending Review",
  },
  {
    name: "Vikas Kumar",
    medicine: "Blood Pressure Medicine",
    uploadedAt: "25 min ago",
    status: "Approved",
  },
  {
    name: "Neha Yadav",
    medicine: "Skin Care Prescription",
    uploadedAt: "1 hour ago",
    status: "Pending Review",
  },
];

export const adminProductPageFilters = [
  "All Products",
  "Hair Care",
  "Fitness & Health",
  "Sexual Wellness",
  "Vitamins & Nutrition",
  "Supports & Braces",
  "Immunity Boosters",
  "Homeopathy",
  "Pet Care",
];

export const adminProductCategoryGroups = {
  "All Products": null,
  "Hair Care": [
    "Hair Care",
    "Hair Oils",
    "Shampoos & Conditioners",
    "Hair Serums",
    "Hair Creams & Masks",
    "Hair Colour",
    "Hair Growth Products",
    "Essential Oils",
  ],
  "Fitness & Health": ["Fitness & Health"],
  "Sexual Wellness": ["Sexual Wellness"],
  "Vitamins & Nutrition": ["Vitamins & Nutrition"],
  "Supports & Braces": ["Supports & Braces"],
  "Immunity Boosters": ["Immunity Boosters"],
  "Homeopathy": ["Homeopathy"],
  "Pet Care": ["Pet Care"],
};

export const products = [
  {
    name: "Paracetamol 500mg",
    category: "Medicine",
    price: "Rs 35",
    stock: 120,
    status: "In Stock",
  },
  {
    name: "Hair Growth Serum",
    category: "Hair Care",
    price: "Rs 499",
    stock: 42,
    status: "In Stock",
  },
  {
    name: "Cold Pressed Hair Oil",
    category: "Hair Oils",
    price: "Rs 349",
    stock: 54,
    status: "In Stock",
  },
  {
    name: "Keratin Repair Shampoo",
    category: "Shampoos & Conditioners",
    price: "Rs 299",
    stock: 28,
    status: "In Stock",
  },
  {
    name: "Anti-Frizz Hair Serum",
    category: "Hair Serums",
    price: "Rs 459",
    stock: 24,
    status: "In Stock",
  },
  {
    name: "Deep Nourish Hair Mask",
    category: "Hair Creams & Masks",
    price: "Rs 525",
    stock: 15,
    status: "Low Stock",
  },
  {
    name: "Natural Brown Hair Colour",
    category: "Hair Colour",
    price: "Rs 279",
    stock: 36,
    status: "In Stock",
  },
  {
    name: "Advanced Root Activator",
    category: "Hair Growth Products",
    price: "Rs 799",
    stock: 11,
    status: "Low Stock",
  },
  {
    name: "Rosemary Essential Oil",
    category: "Essential Oils",
    price: "Rs 189",
    stock: 31,
    status: "In Stock",
  },
  {
    name: "Whey Protein 1kg",
    category: "Fitness & Health",
    price: "Rs 1,899",
    stock: 18,
    status: "Low Stock",
  },
  {
    name: "Ultra Thin Condom Pack",
    category: "Sexual Wellness",
    price: "Rs 249",
    stock: 67,
    status: "In Stock",
  },
  {
    name: "Vitamin D3 Capsules",
    category: "Vitamins & Nutrition",
    price: "Rs 249",
    stock: 60,
    status: "In Stock",
  },
  {
    name: "Knee Support Brace",
    category: "Supports & Braces",
    price: "Rs 599",
    stock: 22,
    status: "In Stock",
  },
  {
    name: "Daily Immunity Booster",
    category: "Immunity Boosters",
    price: "Rs 399",
    stock: 40,
    status: "In Stock",
  },
  {
    name: "Homeopathic Cold Relief",
    category: "Homeopathy",
    price: "Rs 159",
    stock: 26,
    status: "In Stock",
  },
  {
    name: "Pet Multivitamin Syrup",
    category: "Pet Care",
    price: "Rs 349",
    stock: 19,
    status: "Low Stock",
  },
];

export const customers = [
  {
    name: "Akash Gupta",
    email: "akash@example.com",
    phone: "+91 9876543210",
    city: "Bhopal",
    orders: 12,
    joined: "12 Jan 2026",
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 9988776655",
    city: "Indore",
    orders: 8,
    joined: "25 Jan 2026",
  },
  {
    name: "Ravi Patel",
    email: "ravi@example.com",
    phone: "+91 9123456780",
    city: "Delhi",
    orders: 15,
    joined: "03 Feb 2026",
  },
];
