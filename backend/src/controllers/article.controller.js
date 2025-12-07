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
    const categoryPathIds = await getCategoryPathIds(category);

    let tagsArray = [];
    if (tags) {
      tagsArray = typeof tags === "string" ? JSON.parse(tags) : tags;
    }

    const article = new Article({
      title,
      excerpt,
      content,
      category,
      categoryPath: categoryPathIds,
      featuredImage: featuredImageUrl,
      youtubeVideo: youtubeVideo || "",
      tags: tagsArray || [],
      author,
      status: status || 0,
      isBreaking: isBreaking === "true" || isBreaking === true,
      isTrending: isTrending === "true" || isTrending === true,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isTopStory: isTopStory === "true" || isTopStory === true,
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
    const { 
      page = 1, 
      limit = 10, 
      status = 1,
      startDate, // Accept startDate
      endDate,   // Accept endDate
      sortBy = 'latest' // latest, popular, trending
    } = req.query;

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

    // Updated to use new structure
    const categoryResult = await getAllCategoryIds(currentCategory._id);
    const categoryIds = categoryResult.ids;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {
      category: { $in: categoryIds },
      status: status ? parseInt(status) : 1,
    };

    // Apply date filter if provided
    if (startDate || endDate) {
      query.publishDate = {};
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.publishDate.$gte = start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.publishDate.$lte = end;
      }
    }

    // Build sort object based on sortBy
    let sortObject = {};
    if (sortBy === 'popular') {
      sortObject = { views: -1, publishDate: -1 };
    } else if (sortBy === 'trending') {
      sortObject = { isTrending: -1, views: -1, publishDate: -1 };
    } else {
      sortObject = { publishDate: -1, createdAt: -1 };
    }

    const articles = await Article.find(query)
      .populate("category", "name slug parent level")
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Article.countDocuments(query);

    const categoryPathInfo = await getCategoryPathInfo(currentCategory._id);

    // Add category path slugs
    const articlesWithPaths = await Promise.all(
      articles.map(async (article) => {
        const articleObj = article.toObject();
        articleObj.categoryPathSlugs = await getCategoryPathSlugsForArticle(
          article.category._id
        );
        return articleObj;
      })
    );

    res.status(200).json({
      success: true,
      data: {
        articles: articlesWithPaths,
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
    const breakingExpiryTime = new Date(now.getTime() - 800 * 60 * 60 * 1000);

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
    const featuredArticle = await Article.find({
      status: 1,
      isFeatured: true,
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
    const featuredArticleIds = featuredArticle?.map((article) => article._id);
    const topStoryIds = topStory.map((story) => story._id);
    const excludedIds = [...featuredArticleIds, ...topStoryIds].filter(Boolean);

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

    // Add category path slugs to all articles
    const addCategoryPaths = async (articles) => {
      return Promise.all(
        articles.map(async (article) => {
          const articleObj = article.toObject();
          articleObj.categoryPathSlugs = await getCategoryPathSlugsForArticle(
            article.category._id
          );
          return articleObj;
        })
      );
    };

    const formattedBreakingNews = await addCategoryPaths(breakingArticles);
    const formattedFeatured = await addCategoryPaths(featuredArticle);
    const formattedTopStory = await addCategoryPaths(topStory);
    const formattedTrending = await addCategoryPaths(trendingArticles);
    const formattedRegular = await addCategoryPaths(regularArticles);

    res.status(200).json({
      success: true,
      data: {
        breakingNews: formattedBreakingNews,
        center: {
          featured: formattedFeatured,
          topStory: formattedTopStory,
          regularArticles: formattedRegular,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalRegularArticles / parseInt(limit)),
            totalArticles: totalRegularArticles,
            limit: parseInt(limit),
            hasMore: skip + regularArticles.length < totalRegularArticles,
          },
        },
        trending: formattedTrending,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching home page data",
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
      level0Category,
      level1Category,
      level2Category,
      isBreaking,
      isTrending,
      isFeatured,
      isTopStory,
      search,
      date,
      startDate,
      endDate,
      home,
    } = req.query;

    if (home === "true") {
      return await getHomePageData(req, res);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    if (status) query.status = parseInt(status);

    if (level2Category) {
      query.category = level2Category;
    } else if (level1Category) {
      query.categoryPath = level1Category;
    } else if (level0Category) {
      query.categoryPath = level0Category;
    }

    if (isBreaking !== undefined) query.isBreaking = isBreaking === "true";
    if (isTrending !== undefined) query.isTrending = isTrending === "true";
    if (isFeatured !== undefined) query.isFeatured = isFeatured === "true";
    if (isTopStory !== undefined) query.isTopStory = isTopStory === "true";

    if (startDate || endDate) {
      query.publishDate = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.publishDate.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.publishDate.$lte = end;
      }
    } else if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.publishDate = { $gte: start, $lte: end };
    }

    // Search filter
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

    // Add category path slugs to each article
    const articlesWithPaths = await Promise.all(
      articles.map(async (article) => {
        const articleObj = article.toObject();
        articleObj.categoryPathSlugs = await getCategoryPathSlugsForArticle(
          article.category._id
        );
        return articleObj;
      })
    );

    const total = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        newArticles: articlesWithPaths,
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

export const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    // Optional: category path from query string for validation
    const { categoryPath } = req.query;

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

    // Validate category path if provided
    if (categoryPath) {
      const categoryPathSlugs = categoryPath.split("/").filter(Boolean);
      const validation = await validateArticleCategoryPath(
        article.category._id,
        categoryPathSlugs
      );

      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          message:
            validation.message ||
            "Article does not belong to the specified category path",
        });
      }
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

export const getArticleStats = async (req, res) => {
  try {
    // Get all counts in parallel for better performance
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      // archivedArticles,
      breakingNews,
      trendingArticles,
      featuredArticles,
      topStories,
    ] = await Promise.all([
      Article.countDocuments({}),
      Article.countDocuments({ status: 1 }),
      Article.countDocuments({ status: 0 }),
      // Article.countDocuments({ status: 2 }),
      Article.countDocuments({ isBreaking: true }),
      Article.countDocuments({ isTrending: true }),
      Article.countDocuments({ isFeatured: true }),
      Article.countDocuments({ isTopStory: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
        // archived: archivedArticles,
        breaking: breakingNews,
        trending: trendingArticles,
        featured: featuredArticles,
        topStories: topStories,
      },
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching article statistics",
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
      article.category = category;
      article.categoryPath = await getCategoryPathIds(category);
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

// Helper Function - Updated to include category names
const getAllCategoryIds = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    return { ids: [], categories: [] };
  }

  const categoryIds = [categoryId];
  const categories = [
    {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      level: category.level,
    },
  ];

  const children = await Category.find({ parent: categoryId });

  for (const child of children) {
    const childResult = await getAllCategoryIds(child._id);
    categoryIds.push(...childResult.ids);
    categories.push(...childResult.categories);
  }

  return { ids: categoryIds, categories };
};

// Helper to get full category path (from root to current) as slugs
const getCategoryPathSlugs = async (categoryId) => {
  const path = [];
  let current = await Category.findById(categoryId);

  if (!current) return path;

  const tempPath = [];
  while (current) {
    tempPath.push({
      _id: current._id.toString(),
      slug: current.slug,
      name: current.name,
    });
    if (current.parent) {
      current = await Category.findById(current.parent);
    } else {
      current = null;
    }
  }

  return tempPath.reverse();
};

// Validate if article belongs to the category path in URL
const validateArticleCategoryPath = async (
  articleCategoryId,
  urlCategoryPathSlugs
) => {
  if (!urlCategoryPathSlugs || urlCategoryPathSlugs.length === 0) {
    return { valid: true, message: null };
  }

  // Get article's full category path
  const articleCategoryPath = await getCategoryPathSlugs(articleCategoryId);

  if (articleCategoryPath.length === 0) {
    return {
      valid: false,
      message: "Article category not found",
    };
  }

  // Extract slugs from article's category path
  const articlePathSlugs = articleCategoryPath.map((cat) => cat.slug);

  // Check if URL path starts from the beginning of article's path
  if (articlePathSlugs.length < urlCategoryPathSlugs.length) {
    return {
      valid: false,
      message: "URL category path is longer than article's category path",
    };
  }

  // Compare segments from the beginning
  for (let i = 0; i < urlCategoryPathSlugs.length; i++) {
    if (articlePathSlugs[i] !== urlCategoryPathSlugs[i]) {
      return {
        valid: false,
        message: `Category path mismatch. Article belongs to ${articlePathSlugs.join(
          "/"
        )}, but URL has ${urlCategoryPathSlugs.join("/")}`,
      };
    }
  }

  return { valid: true, message: null };
};

// Helper Function --
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

const getCategoryPathSlugsForArticle = async (categoryId) => {
  const path = [];
  let current = await Category.findById(categoryId);

  if (!current) return path;

  const tempPath = [];
  while (current) {
    tempPath.push(current.slug);
    if (current.parent) {
      current = await Category.findById(current.parent);
    } else {
      current = null;
    }
  }

  return tempPath.reverse(); // Returns array like ['country', 'uttarpradesh', 'agra']
};
