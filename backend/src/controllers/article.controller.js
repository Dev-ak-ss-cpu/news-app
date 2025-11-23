import { Article } from "../models/article.model.js";
import { Category } from "../models/category.model.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

export const createArticle = async (req, res) => {
  try {
    let featuredImageUrl = "";

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, "news-app/articles");
        featuredImageUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload image: " + uploadError.message,
        });
      }
    } else if (req.body.featuredImage) {
      featuredImageUrl = req.body.featuredImage;
    }

    const {
      title,
      excerpt,
      content,
      category,
      youtubeVideo,
      tags,
      author,
      status,
      isBreaking,
      isTrending,
      metaTitle,
      metaDescription,
      publishDate,
    } = req.body;

    if (!title || !content || !category || !author) {
      return res.status(400).json({
        success: false,
        message: "Title, content, category, and author are required",
      });
    }
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category does not exist",
      });
    }

    let tagsArray = [];
    if (tags) {
      tagsArray = typeof tags === "string" ? JSON.parse(tags) : tags;
    }

    const article = new Article({
      title,
      excerpt,
      content,
      category,
      featuredImage: featuredImageUrl,
      youtubeVideo: youtubeVideo || "",
      tags: tagsArray || [],
      author,
      status: status || "draft",
      isBreaking: isBreaking || false,
      isTrending: isTrending || false,
      metaTitle,
      metaDescription,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
    });

    await article.save();
    await article.populate("category", "name slug parent");

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating article",
    });
  }
};

export const getArticlesByCategoryPath = async (req, res) => {
  try {
    const { categoryPath } = req.params;
    const { page = 1, limit = 10, status = "published" } = req.query;

    const slugs = categoryPath.split("/").filter(Boolean);

    if (slugs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category path",
      });
    }

    let currentCategory = null;
    let parentId = null;

    for (const slug of slugs) {
      const category = await Category.findOne({
        slug,
        parent: parentId,
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category "${slug}" not found in path`,
        });
      }

      currentCategory = category;
      parentId = category._id;
    }

    const categoryIds = await getAllCategoryIds(currentCategory._id);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const articles = await Article.find({
      category: { $in: categoryIds },
      status: status,
    })
      .populate("category", "name slug parent level")
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Article.countDocuments({
      category: { $in: categoryIds },
      status: status,
    });

    const categoryPathInfo = await getCategoryPathInfo(currentCategory._id);

    res.status(200).json({
      success: true,
      data: {
        articles,
        category: categoryPathInfo,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalArticles: total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching articles",
    });
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      isBreaking,
      isTrending,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (isBreaking !== undefined) query.isBreaking = isBreaking === "true";
    if (isTrending !== undefined) query.isTrending = isTrending === "true";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const articles = await Article.find(query)
      .populate("category", "name slug parent level")
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        articles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalArticles: total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching articles",
    });
  }
};

export const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug }).populate(
      "category",
      "name slug parent level"
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    article.views += 1;
    await article.save();

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching article",
    });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    if (req.file) {
      try {
        if (article.featuredImage) {
          try {
            const urlParts = article.featuredImage.split("/");
            const publicIdWithExt = urlParts.slice(-2).join("/").split(".")[0];
            const publicId = `news-app/articles/${publicIdWithExt}`;
            await deleteFromCloudinary(publicId);
          } catch (deleteError) {
            console.log("Could not delete old image:", deleteError.message);
          }
        }

        const result = await uploadToCloudinary(req.file, "news-app/articles");
        req.body.featuredImage = result.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload image: " + uploadError.message,
        });
      }
    }

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined && key !== "tags") {
        article[key] = req.body[key];
      }
    });

    if (req.body.tags !== undefined) {
      article.tags =
        typeof req.body.tags === "string"
          ? JSON.parse(req.body.tags)
          : req.body.tags;
    }

    await article.save();
    await article.populate("category", "name slug parent level");

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating article",
    });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    if (article.featuredImage) {
      try {
        const urlParts = article.featuredImage.split("/");
        const publicIdWithExt = urlParts.slice(-2).join("/").split(".")[0];
        const publicId = `news-app/articles/${publicIdWithExt}`;
        await deleteFromCloudinary(publicId);
      } catch (deleteError) {
        console.log("Could not delete image:", deleteError.message);
      }
    }

    await Article.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting article",
    });
  }
};

const getAllCategoryIds = async (categoryId) => {
  const categoryIds = [categoryId];
  const children = await Category.find({ parent: categoryId });

  for (const child of children) {
    const childIds = await getAllCategoryIds(child._id);
    categoryIds.push(...childIds);
  }

  return categoryIds;
};

const getCategoryPathInfo = async (categoryId) => {
  const category = await Category.findById(categoryId).populate(
    "parent",
    "name slug parent"
  );

  if (!category) return null;

  const path = [];
  let current = category;

  while (current) {
    path.unshift({
      name: current.name,
      slug: current.slug,
      level: current.level,
    });
    current = current.parent;
  }

  return {
    current: {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      level: category.level,
    },
    path,
    fullPath: path.map((p) => p.name).join(" > "),
  };
};
