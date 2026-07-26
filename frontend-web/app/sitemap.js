import { serverGetApi } from "./utils/serverApi";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Regenerate the sitemap at most once an hour instead of on every crawl request
export const revalidate = 3600;

function flattenCategoryPaths(categories, parentPath = []) {
  let paths = [];

  for (const category of categories) {
    if (!category?.slug) continue;

    const currentPath = [...parentPath, category.slug];
    paths.push(currentPath);

    if (Array.isArray(category.children) && category.children.length > 0) {
      paths = paths.concat(flattenCategoryPaths(category.children, currentPath));
    }
  }

  return paths;
}

async function getCategoryRoutes() {
  const response = await serverGetApi("/api/categories");
  if (!response.success || !Array.isArray(response.data)) return [];

  return flattenCategoryPaths(response.data).map((pathSegments) => ({
    url: `${SITE_URL}/${pathSegments.join("/")}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.7,
  }));
}

async function getArticleRoutes() {
  // Cap the sitemap at the most recent articles to keep it fast and avoid
  // hammering the API; older articles are still reachable via category pages.
  const MAX_ARTICLES = 2000;
  const PAGE_SIZE = 500;
  const routes = [];

  for (let page = 1; routes.length < MAX_ARTICLES; page++) {
    const response = await serverGetApi("/api/articles", {
      page: page.toString(),
      limit: PAGE_SIZE.toString(),
      status: "1",
    });

    const articles = response.success ? response.data?.newArticles || [] : [];
    if (articles.length === 0) break;

    for (const article of articles) {
      if (!article.slug) continue;

      const categoryPath = Array.isArray(article.categoryPathSlugs)
        ? article.categoryPathSlugs
        : [];
      const path = categoryPath.length > 0
        ? `${categoryPath.join("/")}/${article.slug}`
        : article.slug;

      routes.push({
        url: `${SITE_URL}/${path}`,
        lastModified: new Date(article.updatedAt || article.publishDate || Date.now()),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }

    const totalPages = response.data?.pagination?.totalPages || page;
    if (page >= totalPages) break;
  }

  return routes.slice(0, MAX_ARTICLES);
}

export default async function sitemap() {
  const staticRoutes = [
    { url: `${SITE_URL}/`, changeFrequency: "always", priority: 1 },
    { url: `${SITE_URL}/breaking`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/trending`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/weather`, changeFrequency: "daily", priority: 0.5 },
  ].map((route) => ({ ...route, lastModified: new Date() }));

  const [categoryRoutes, articleRoutes] = await Promise.all([
    getCategoryRoutes(),
    getArticleRoutes(),
  ]);

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
