const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Resolve a possibly-relative image path (uploads, API, public folder) to an
// absolute URL, since OpenGraph/Twitter/JSON-LD all require absolute image URLs.
export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return `${SITE_URL}/logo.png`;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/uploads/") || imageUrl.startsWith("/images/") || imageUrl.startsWith("/api/")) {
    return `${API_URL}${imageUrl}`;
  }
  if (imageUrl.startsWith("/")) return `${SITE_URL}${imageUrl}`;
  return `${API_URL}/${imageUrl}`;
}

export function buildArticleUrl(article, categoryPath = []) {
  const path = Array.isArray(categoryPath) && categoryPath.length > 0
    ? `${categoryPath.join("/")}/${article.slug}`
    : article.slug;
  return `${SITE_URL}/${path}`;
}

export function buildCategoryUrl(pathSegments = []) {
  return pathSegments.length > 0 ? `${SITE_URL}/${pathSegments.join("/")}` : SITE_URL;
}

// Category slugs in article routes don't carry display names, so turn
// "jammu-kashmir" into "Jammu Kashmir" for breadcrumb labels.
export function humanizeSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export { SITE_URL };
