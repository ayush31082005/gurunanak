import Category from "../models/Category.js";
import { defaultCategories } from "../data/defaultCategories.js";

const slugify = (text) =>
    text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

const ensureDefaultCategories = async () => {
    const existingCategories = await Category.find({}, "slug").lean();
    const existingSlugs = new Set(existingCategories.map((category) => category.slug));

    const missingCategories = defaultCategories
        .map((name) => ({
            name,
            slug: slugify(name),
        }))
        .filter((category) => !existingSlugs.has(category.slug));

    if (missingCategories.length) {
        try {
            await Category.insertMany(missingCategories, { ordered: false });
        } catch (error) {
            if (error?.code !== 11000) {
                throw error;
            }
        }
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const slug = slugify(name);

        const existing = await Category.findOne({
            $or: [{ name }, { slug }],
        });

        if (existing) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = await Category.create({ name, slug });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        await ensureDefaultCategories();
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
