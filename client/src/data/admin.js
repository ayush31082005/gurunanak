export const statCards = [
    {
        title: "Total Sales",
        value: "₹2,48,500",
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
        amount: "₹1,250",
        status: "Delivered",
        payment: "Paid",
    },
    {
        id: "ORD-1002",
        customer: "Priya Singh",
        amount: "₹840",
        status: "Processing",
        payment: "Paid",
    },
    {
        id: "ORD-1003",
        customer: "Aman Verma",
        amount: "₹2,140",
        status: "Shipped",
        payment: "Paid",
    },
    {
        id: "ORD-1004",
        customer: "Sneha Gupta",
        amount: "₹560",
        status: "Pending",
        payment: "COD",
    },
    {
        id: "ORD-1005",
        customer: "Karan Patel",
        amount: "₹1,790",
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

export const products = [
    {
        name: "Paracetamol 500mg",
        category: "Medicine",
        price: "₹35",
        stock: 120,
        status: "In Stock",
    },
    {
        name: "Hair Growth Serum",
        category: "Hair Care",
        price: "₹499",
        stock: 42,
        status: "In Stock",
    },
    {
        name: "Whey Protein 1kg",
        category: "Fitness & Health",
        price: "₹1,899",
        stock: 18,
        status: "Low Stock",
    },
    {
        name: "Vitamin D3 Capsules",
        category: "Supplements",
        price: "₹249",
        stock: 60,
        status: "In Stock",
    },
];

export const customers = [
    {
        name: "Akash Gupta",
        email: "akash@gmail.com",
        phone: "+91 9876543210",
        city: "Bhopal",
        orders: 12,
        joined: "12 Jan 2026",
    },
    {
        name: "Priya Sharma",
        email: "priya@gmail.com",
        phone: "+91 9123456780",
        city: "Indore",
        orders: 8,
        joined: "20 Jan 2026",
    },
    {
        name: "Ravi Patel",
        email: "ravi@gmail.com",
        phone: "+91 9988776655",
        city: "Delhi",
        orders: 15,
        joined: "25 Jan 2026",
    },
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