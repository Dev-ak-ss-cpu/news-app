import BASE_API_URL from "../api-config";
/**
 * Server-side API helper for Next.js Server Components
 * Uses native fetch instead of axios
 */
export async function serverGetApi(endpoint, params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_API_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      next: { revalidate: 0 }, // Cache for 60 seconds (ISR)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Server API error:', error);
    return { success: false, message: error.message, data: null };
  }
}

/**
 * Fetch trending articles server-side
 */
export async function fetchTrendingArticles(limit = 10) {
  return await serverGetApi('/api/articles', {
    page: '1',
    limit: limit.toString(),
    isTrending: 'true',
    status: '1',
  });
}

/**
 * Fetch related articles from same category server-side
 */
export async function fetchRelatedArticles(categoryId, excludeArticleId = null, limit = 5) {
  const params = {
    page: '1',
    limit: (limit + (excludeArticleId ? 1 : 0)).toString(),
    category: categoryId,
    status: '1',
  };

  const response = await serverGetApi('/api/articles', params);

  if (response.success && response.data?.newArticles) {
    let articles = response.data.newArticles;

    if (excludeArticleId) {
      articles = articles.filter(article => article._id !== excludeArticleId);
    }

    return {
      ...response,
      data: {
        ...response.data,
        newArticles: articles.slice(0, limit),
      },
    };
  }

  return response;
}

/**
 * Fetch related categories (sibling categories) server-side
 */
export async function fetchRelatedCategories(currentCategoryId, limit = 10) {
  try {
    // First, get current category to find its parent
    const allCategoriesResponse = await serverGetApi('/api/categories');

    if (!allCategoriesResponse.success || !allCategoriesResponse.data) {
      return { success: false, data: [] };
    }

    const currentCat = allCategoriesResponse.data.find(
      cat => cat._id === currentCategoryId
    );

    if (!currentCat) {
      return { success: false, data: [] };
    }

    const parentId = currentCat.parent
      ? (typeof currentCat.parent === 'object' ? currentCat.parent._id : currentCat.parent)
      : null;

    // Fetch sibling categories
    const response = await serverGetApi('/api/categories', {
      parent: parentId || 'null',
      includeArticleCount: 'true',
    });

    if (response.success && response.data) {
      const filteredCategories = response.data
        .filter(cat => cat._id !== currentCategoryId)
        .sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0))
        .slice(0, limit);

      return {
        success: true,
        data: filteredCategories,
      };
    }

    return { success: false, data: [] };
  } catch (error) {
    console.error('Error fetching related categories:', error);
    return { success: false, data: [] };
  }
}

/**
 * Fetch home page articles server-side
 */
export async function fetchHomeArticles(page = 1, limit = 10) {
  return await serverGetApi('/api/articles', {
    home: 'true',
    page: page.toString(),
    limit: limit.toString(),
  });
}

/**
 * Fetch root categories for header/footer server-side
 */
export async function fetchRootCategories() {
  return await serverGetApi('/api/categories', {
    parent: 'null',
    level: '0',
  });
}

/**
 * Fetch all categories for path building server-side
 */
export async function fetchAllCategoriesFlat() {
  return await serverGetApi('/api/categories');
}

/**
 * Fetch breaking news articles server-side
 */
export async function fetchBreakingArticles(limit = 10) {
  return await serverGetApi('/api/articles', {
    page: '1',
    limit: limit.toString(),
    isBreaking: 'true',
    status: '1',
  });
}

