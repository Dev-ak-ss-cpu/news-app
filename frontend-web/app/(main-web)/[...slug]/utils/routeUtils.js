import { genericGetApi } from "@/app/Helper";

export async function checkIfArticleSlug(slug) {
  try {
    const response = await genericGetApi(`/api/articles/${slug}`);

    if (response.success && response.data) {
      return {
        isArticle: true,
        articleData: response.data,
      };
    }

    return {
      isArticle: false,
      articleData: null,
    };
  } catch (error) {
    console.error("Error checking article slug:", error);
    return {
      isArticle: false,
      articleData: null,
    };
  }
}

export async function fetchCategoryData(pathSegments, page = 1, limit = 20) {
  try {
    const categoryPath = pathSegments.join("/");
    const response = await genericGetApi(
      `/api/articles/category/${categoryPath}`,
      { page, limit }
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

/**
 * Helper function to check if a slug looks like an article slug
 * Article slugs are typically longer and have more hyphens
 */
function looksLikeArticleSlug(slug) {
  // Article slugs are usually longer than category slugs
  // and have multiple hyphens
  return slug.length > 20 && slug.split("-").length > 3;
}

/**
 * Parses route and determines page type
 * @param {string[]} pathSegments - Array of path segments
 * @returns {Promise<{type: 'article'|'category'|'error', data: object, error: string|null}>}
 */
export async function parseRoute(pathSegments) {
  if (!pathSegments || pathSegments.length === 0) {
    return {
      type: "error",
      data: null,
      error: "Invalid path",
    };
  }

  // Handle special case: if first segment is "article", treat the rest as article slug
  if (pathSegments[0] === "article" && pathSegments.length > 1) {
    const articleSlug = pathSegments.slice(1).join("/");
    const articleCheck = await checkIfArticleSlug(articleSlug);

    if (articleCheck.isArticle) {
      return {
        type: "article",
        data: {
          article: articleCheck.articleData,
          categoryPath: [],
        },
        error: null,
      };
    }

    // If /article/... but not found, return article not found error
    return {
      type: "error",
      data: null,
      error: "Article not found",
    };
  }

  // Strategy: Check if last segment is an article slug
  const lastSegment = pathSegments[pathSegments.length - 1];
  const categorySegments = pathSegments.slice(0, -1);

  // For single segments, prioritize article check if it looks like an article slug
  if (pathSegments.length === 1) {
    const articleCheck = await checkIfArticleSlug(lastSegment);

    if (articleCheck.isArticle) {
      return {
        type: "article",
        data: {
          article: articleCheck.articleData,
          categoryPath: [],
        },
        error: null,
      };
    }

    // If single segment and looks like article but not found, try category as fallback
    // Otherwise, if it looks like article slug, don't try category
    if (looksLikeArticleSlug(lastSegment)) {
      return {
        type: "error",
        data: null,
        error: "Article not found",
      };
    }

    // Try as category
    const categoryResult = await fetchCategoryData(pathSegments);

    if (categoryResult.success) {
      return {
        type: "category",
        data: categoryResult.data,
        error: null,
      };
    }

    return {
      type: "error",
      data: null,
      error: "Page not found",
    };
  }

  // For multiple segments: check if last segment is an article
  const articleCheck = await checkIfArticleSlug(lastSegment);

  if (articleCheck.isArticle) {
    // Last segment is an article - show article detail page
    return {
      type: "article",
      data: {
        article: articleCheck.articleData,
        categoryPath: categorySegments,
      },
      error: null,
    };
  }

  // Last segment is not an article - treat entire path as category
  const categoryResult = await fetchCategoryData(pathSegments);

  if (categoryResult.success) {
    return {
      type: "category",
      data: categoryResult.data,
      error: null,
    };
  }

  return {
    type: "error",
    data: null,
    error: categoryResult.error || "Page not found",
  };
}
