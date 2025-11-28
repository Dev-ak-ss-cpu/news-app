import { Article } from "../models/article.model.js";
import { Category } from "../models/category.model.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";

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
      isFeatured,
      isTopStory,
      isSubStory,
      isEditorsPick,
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
      status: status || 0,
      isBreaking: isBreaking === "true" || isBreaking === true,
      isTrending: isTrending === "true" || isTrending === true,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isTopStory: isTopStory === "true" || isTopStory === true,
      isSubStory: isSubStory === "true" || isSubStory === true,
      isEditorsPick: isEditorsPick === "true" || isEditorsPick === true,
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
    const { page = 1, limit = 10, status = 1 } = req.query;

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
      status: status ? parseInt(status) : 1,
    })
      .populate("category", "name slug parent level")
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Article.countDocuments({
      category: { $in: categoryIds },
      status: status ? parseInt(status) : 1,
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

// Helper function for home page data
const getHomePageData = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const now = new Date();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const breakingExpiryTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch breaking news (left panel)
    const breakingArticles = await Article.find({
      status: 1,
      isBreaking: true,
      $or: [
        { breakingExpiresAt: { $gt: now } },
        {
          breakingExpiresAt: null,
          publishDate: { $gte: breakingExpiryTime },
        },
      ],
    })
      .populate("category", "name slug parent level")
      .sort({ publishDate: -1 })
      .limit(5);

    // Fetch featured article (center - must have image)
    const featuredArticle = await Article.findOne({
      status: 1,
      isFeatured: true,
      featuredImage: { $ne: "" },
    })
      .populate("category", "name slug parent level")
      .sort({ publishDate: -1 });

    // Fetch top stories (center)
    const topStory = await Article.find({
      status: 1,
      isTopStory: true,
      _id: { $ne: featuredArticle?._id },
    })
      .populate("category", "name slug parent level")
      .sort({ publishDate: -1 })
      .limit(5);

    // Fetch trending articles (right panel)
    const trendingArticles = await Article.find({
      status: 1,
      isTrending: true,
    })
      .populate("category", "name slug parent level")
      .sort({ publishDate: -1 })
      .limit(5);

    // Get IDs to exclude from regular articles
    const topStoryIds = topStory.map((story) => story._id);
    const excludedIds = [featuredArticle?._id, ...topStoryIds].filter(Boolean);

    // Fetch regular articles (center - paginated)
    const regularArticles = await Article.find({
      status: 1,
      _id: { $nin: excludedIds },
    })
      .populate("category", "name slug parent level")
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalRegularArticles = await Article.countDocuments({
      status: 1,
      _id: { $nin: excludedIds },
    });

    // Format breaking news (timestamp logic commented for now)
    const formattedBreakingNews = breakingArticles.map((article) => {
      // let timeRemaining = null;
      // if (article.breakingExpiresAt) {
      //   const remaining = article.breakingExpiresAt - now;
      //   timeRemaining = Math.max(0, Math.floor(remaining / (1000 * 60))); // minutes
      // } else {
      //   const expiryTime = new Date(article.publishDate.getTime() + 24 * 60 * 60 * 1000);
      //   const remaining = expiryTime - now;
      //   timeRemaining = Math.max(0, Math.floor(remaining / (1000 * 60))); // minutes
      // }

      return {
        ...article.toObject(),
        // breakingTimeRemaining: timeRemaining,
        // isBreakingActive: timeRemaining > 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        breakingNews: formattedBreakingNews,
        center: {
          featured: featuredArticle,
          topStory: topStory,
          regularArticles: regularArticles,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalRegularArticles / parseInt(limit)),
            totalArticles: totalRegularArticles,
            limit: parseInt(limit),
            hasMore: skip + regularArticles.length < totalRegularArticles,
          },
        },
        trending: trendingArticles,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching home page data",
    });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID format",
      });
    }

    const article = await Article.findById(id).populate(
      "category",
      "name slug parent level"
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const categoryPathIds = await getCategoryPathIds(article.category._id);

    const articleData = article.toObject();
    articleData.categoryPath = categoryPathIds;

    res.status(200).json({
      success: true,
      data: articleData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching article",
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
      date,
      home,
    } = req.query;

    if (home === "true") {
      return await getHomePageData(req, res);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    if (status) query.status = parseInt(status);
    if (category) query.category = category;
    if (isBreaking !== undefined) query.isBreaking = isBreaking === "true";
    if (isTrending !== undefined) query.isTrending = isTrending === "true";
    if (date !== undefined) query.publishDate = new Date(date);
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

    const newArticles = await Promise.all(
      articles.map(async (article) => {
        const categoryPathIds = await getCategoryPathIds(article.category._id);

        const articleData = article.toObject();
        articleData.categoryPath = categoryPathIds;

        return articleData;
      })
    );


    res.status(200).json({
      success: true,
      data: {
        newArticles,
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
      isFeatured,
      isTopStory,
      isSubStory,
      isEditorsPick,
      metaTitle,
      metaDescription,
      publishDate,
      deleteImage,
    } = req.body;

    // Find the article first
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Validate category if it's being updated
    if (category && category !== article.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Category does not exist",
        });
      }
    }

    // Handle featured image updates
    if (req.file) {
      // New image uploaded - delete old image if it exists
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

      // Upload new image
      try {
        const result = await uploadToCloudinary(req.file, "news-app/articles");
        article.featuredImage = result.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload image: " + uploadError.message,
        });
      }
    } else if (deleteImage === "true" || deleteImage === true) {
      // Delete image requested without new upload
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
      article.featuredImage = "";
    } else if (req.body.featuredImage !== undefined) {
      // Featured image URL provided directly
      article.featuredImage = req.body.featuredImage;
    }

    // Update other fields
    if (title !== undefined) article.title = title;
    if (excerpt !== undefined) article.excerpt = excerpt;
    if (content !== undefined) article.content = content;
    if (category !== undefined) article.category = category;
    if (youtubeVideo !== undefined) article.youtubeVideo = youtubeVideo;
    if (author !== undefined) article.author = author;
    if (status !== undefined) article.status = parseInt(status);
    if (metaTitle !== undefined) article.metaTitle = metaTitle;
    if (metaDescription !== undefined)
      article.metaDescription = metaDescription;
    if (publishDate !== undefined) {
      article.publishDate = publishDate ? new Date(publishDate) : new Date();
    }

    // Handle boolean fields
    if (isBreaking !== undefined) {
      article.isBreaking = isBreaking === "true" || isBreaking === true;
    }
    if (isTrending !== undefined) {
      article.isTrending = isTrending === "true" || isTrending === true;
    }
    if (isFeatured !== undefined) {
      article.isFeatured = isFeatured === "true" || isFeatured === true;
    }
    if (isTopStory !== undefined) {
      article.isTopStory = isTopStory === "true" || isTopStory === true;
    }
    if (isSubStory !== undefined) {
      article.isSubStory = isSubStory === "true" || isSubStory === true;
    }
    if (isEditorsPick !== undefined) {
      article.isEditorsPick =
        isEditorsPick === "true" || isEditorsPick === true;
    }

    // Handle tags
    if (tags !== undefined) {
      article.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
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
        const publicId = `news-app/${publicIdWithExt}`;
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

const getCategoryPathIds = async (categoryId) => {
  const path = [];
  let current = await Category.findById(categoryId);

  if (!current) return path;

  const tempPath = [];
  while (current) {
    tempPath.push(current._id.toString());
    if (current.parent) {
      current = await Category.findById(current.parent);
    } else {
      current = null;
    }
  }

  return tempPath.reverse();
};
