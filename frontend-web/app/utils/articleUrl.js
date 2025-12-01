export function buildArticleUrl(article) {
  if (!article) return '/';
  
  const categoryPath = article.categoryPathSlugs || [];
  const articleSlug = article.slug || '';
  
  if (!articleSlug) return '/';
  
  if (categoryPath && categoryPath.length > 0) {
    return `/${categoryPath.join('/')}/${articleSlug}`;
  }
  
  return `/${articleSlug}`;
}
