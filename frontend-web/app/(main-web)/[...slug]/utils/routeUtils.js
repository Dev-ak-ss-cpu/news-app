import { genericGetApi } from "@/app/Helper";

// Article keywords that indicate article-like slugs
const ARTICLE_KEYWORDS = [
  "news",
  "update",
  "latest",
  "breaking",
  "report",
  "story",
  "article",
  "exclusive",
  "interview",
  "analysis",
  "opinion",
  "editorial",
  "feature",
  "investigation",
  "review",
];

// In-memory cache for category paths, plus optional persistence via localStorage
let categoryPathCache = new Set();
let cacheInitialized = false;

const CATEGORY_CACHE_KEY = "categoryPathCache_v1";

/* ------------ Browser-only helpers (safe for SSR) ------------ */

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadCategoryCacheFromStorage() {
  if (!isBrowser() || cacheInitialized) return;

  try {
    const raw = window.localStorage.getItem(CATEGORY_CACHE_KEY);
    if (raw) {
      const paths = JSON.parse(raw);
      categoryPathCache = new Set(paths);
    }
  } catch (error) {
    console.error("Failed to load category cache from storage:", error);
  } finally {
    cacheInitialized = true;
  }
}

function saveCategoryCacheToStorage() {
  if (!isBrowser()) return;

  try {
    const paths = Array.from(categoryPathCache);
    window.localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(paths));
  } catch (error) {
    console.error("Failed to save category cache to storage:", error);
  }
}

/* ---------------------- Slug helpers ---------------------- */

function containsAny(slug, keywords) {
  const lowerSlug = slug.toLowerCase();
  return keywords.some((keyword) => lowerSlug.includes(keyword));
}

function isArticleLikeSlug(slug) {
  const parts = slug.split("-");
  const hyphenCount = parts.length - 1;
  const hasNumber = /\d/.test(slug);
  const longEnough = slug.length > 25;
  const hasArticleWord = containsAny(slug, ARTICLE_KEYWORDS);

  let score = 0;

  if (hyphenCount >= 3) score += 2;
  if (longEnough) score += 1;
  if (hasNumber) score += 1;
  if (hasArticleWord) score += 2;

  // 3+ points → strong article candidate
  return score >= 3;
}

/* --------------- Category existence + caching --------------- */

async function categoryPathExists(pathSegments) {
  // Make sure cache is loaded from localStorage on first use (browser only)
  loadCategoryCacheFromStorage();

  const pathKey = pathSegments.join("/");

  // Check in-memory cache first
  if (categoryPathCache.has(pathKey)) {
    return true;
  }

  // Fallback to API check
  try {
    const response = await genericGetApi(`/api/articles/category/${pathKey}`, {
      page: 1,
      limit: 1,
    });

    if (response.success) {
      // Cache the successful path in memory and localStorage
      categoryPathCache.add(pathKey);
      saveCategoryCacheToStorage();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking category path:", error);
    return false;
  }
}

export async function parseRoute(pathSegments) {
  return resolveRoute(pathSegments);
}

export async function checkIfArticleSlug(slug, categoryPath = []) {
  try {
    const params = categoryPath.length > 0
      ? { categoryPath: categoryPath.join("/") }
      : {};

    const response = await genericGetApi(`/api/articles/slug/${slug}`, params);

    if (response.success && response.data) {
      return {
        isArticle: true,
        articleData: response.data,
      };
    }

    if (response.success === false &&
      typeof response.message === 'string' &&
      response.message.includes("category path")) {
      return {
        isArticle: false,
        articleData: null,
        error: response.message || "Article does not belong to this category path",
      };
    }

    return { isArticle: false, articleData: null };
  } catch (error) {
    console.error("Error checking article slug:", error);
    return { isArticle: false, articleData: null };
  }
}

export async function fetchCategoryData(pathSegments, page = 1, limit = 20, startDate = null, endDate = null, sortBy = 'latest') {
  try {
    const categoryPath = pathSegments.join("/");
    const params = { 
      page, 
      limit,
      sortBy
    };
    
    // Only add date params if provided
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }
    
    const response = await genericGetApi(
      `/api/articles/category/${categoryPath}`,
      params
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      error: response.message || "Category not found",
    };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch category data",
    };
  }
}


export async function initializeCategoryCache() {
  loadCategoryCacheFromStorage();

  try {
    const response = await genericGetApi("/api/categories");
    if (response.success && response.data) {
      const buildPaths = (categories, parentPath = []) => {
        categories.forEach((cat) => {
          const currentPath = [...parentPath, cat.slug];
          categoryPathCache.add(currentPath.join("/"));

          if (cat.children && cat.children.length > 0) {
            buildPaths(cat.children, currentPath);
          }
        });
      };

      buildPaths(response.data);
      cacheInitialized = true;
      saveCategoryCacheToStorage();
    }
  } catch (error) {
    console.error("Failed to initialize category cache:", error);
  }
}

export async function resolveRoute(pathSegments) {
  if (!pathSegments || !pathSegments.length) {
    return {
      type: "error",
      data: null,
      error: "Invalid path",
    };
  }

  const lastSegment = pathSegments[pathSegments.length - 1];
  const parentSegments = pathSegments.slice(0, -1);

  // Step 1: Determine if last segment looks like an article
  const articleFirst = isArticleLikeSlug(lastSegment);

  // Step 2: If article-like, check article first (with category path validation)
  if (articleFirst) {
    const article = await checkIfArticleSlug(lastSegment, parentSegments);
    if (article.isArticle) {
      return {
        type: "article",
        data: {
          article: article.articleData,
          categoryPath: parentSegments,
        },
        error: null,
      };
    }
    // If article exists but doesn't match category path, return error
    if (article.error) {
      return {
        type: "error",
        data: null,
        error: article.error,
      };
    }
  }

  // Step 3: Check if category path exists (using cached check)
  const categoryExistsFast = await categoryPathExists(pathSegments);

  if (categoryExistsFast) {
    const category = await fetchCategoryData(pathSegments);
    if (category.success) {
      return {
        type: "category",
        data: category.data,
        error: null,
      };
    }
  }

  // Step 4: Fallback - if we didn't check article first, check it now (with category path validation)
  if (!articleFirst) {
    const article = await checkIfArticleSlug(lastSegment, parentSegments);
    if (article.isArticle) {
      return {
        type: "article",
        data: {
          article: article.articleData,
          categoryPath: parentSegments,
        },
        error: null,
      };
    }
    // If article exists but doesn't match category path, return error
    if (article.error) {
      return {
        type: "error",
        data: null,
        error: article.error,
      };
    }
  }

  // Step 5: Nothing found
  return {
    type: "error",
    data: null,
    error: "Page not found",
  };
}
