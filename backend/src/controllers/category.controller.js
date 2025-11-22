import { Category } from "../models/category.model.js";

export const createCategory = async (req, res) => {
  try {
    const { name, parent, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = new Category({
      name,
      parent: parent || null,
      description,
    });

    await category.save();

    await category.populate("parent", "name slug");

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating category",
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const { parent, level, includeChildren } = req.query;

    let query = {};

    if (parent === "null" || parent === null) {
      query.parent = null;
    } else if (parent) {
      query.parent = parent;
    }

    if (level !== undefined) {
      query.level = parseInt(level);
    }

    let categories = await Category.find(query)
      .populate("parent", "name slug")
      .sort({ createdAt: -1 });

    if (includeChildren === "true") {
      categories = await Category.populate(categories, {
        path: "children",
        select: "name slug level",
      });
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching categories",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const childrenCount = await Category.countDocuments({ parent: id });
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with sub-categories",
        childrenCount,
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting category",
    });
  }
};
