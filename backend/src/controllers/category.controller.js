import { Category } from "../models/category.model.js";

export const createOrUpdateCategory = async (req, res) => {
  try {
    const { id, name, parent, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const parentId = parent || null;

    // 🧠 Helper: get next value for this parent (level)
    const getNextValueForParent = async (parentId) => {
      const filter = parentId ? { parent: parentId } : { parent: null };

      const lastCategory = await Category.findOne(filter)
        .sort({ value: -1 })
        .select("value")
        .lean();

      return lastCategory ? lastCategory.value + 1 : 0;
    };

    // ✅ UPDATE
    if (id) {
      const existingCategory = await Category.findById(id);

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // check if parent changed
      const oldParentId = existingCategory.parent
        ? existingCategory.parent.toString()
        : null;
      const newParentId = parentId;

      let value = existingCategory.value;

      // If parent changed → assign new value in new level
      if (oldParentId !== newParentId) {
        value = await getNextValueForParent(newParentId);
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { name, parent: newParentId, description, value },
        { new: true }
      ).populate("parent", "name slug value");

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
      });
    }

    // ✅ CREATE
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const value = await getNextValueForParent(parentId);

    const category = new Category({
      name,
      parent: parentId,
      description,
      value,
    });

    await category.save();
    await category.populate("parent", "name slug value");

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Category create/update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating or updating category",
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const { parent, level, includeChildren, includeArticleCount } = req.query;

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

    if (includeArticleCount === "true") {
      const { Article } = await import("../models/article.model.js");

      categories = await Promise.all(
        categories.map(async (category) => {
          const categoryIds = await getAllCategoryIdsForCount(category._id);
          const articleCount = await Article.countDocuments({
            category: { $in: categoryIds },
            status: 1,
          });

          const categoryObj = category.toObject();
          categoryObj.articleCount = articleCount;
          return categoryObj;
        })
      );
    }

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

// Helper function to get all category IDs including children (for counting articles)
const getAllCategoryIdsForCount = async (categoryId) => {
  const categoryIds = [categoryId];
  const children = await Category.find({ parent: categoryId });

  for (const child of children) {
    const childIds = await getAllCategoryIdsForCount(child._id);
    categoryIds.push(...childIds);
  }

  return categoryIds;
};
