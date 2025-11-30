import { resolveRoute } from './utils/routeUtils';
import ArticleDetails from './detailPage/ArticleDetails';
import ArticleWithCategory from './ArticleWithCategory';

export default async function page({ params }) {
  const { slug } = await params;

  // Resolve the route to determine if it's an article or category
  const routeResult = await resolveRoute(slug);

  // Handle error case
  if (routeResult.type === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">{routeResult.error || "The page you're looking for doesn't exist."}</p>
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Show article detail page
  if (routeResult.type === "article") {
    const article = routeResult.data.article;
    const urlCategoryPath = routeResult.data.categoryPath || [];
    
    // Ensure slug is valid array
    const validSlug = Array.isArray(slug) && slug.length > 0 ? slug : [];

    return (
      <ArticleDetails 
        article={article} 
        categoryPath={urlCategoryPath}
        originalSlug={validSlug}
      />
    );
  }

  // Show category listing page
  if (routeResult.type === "category") {
    return <ArticleWithCategory categoryData={routeResult.data} />;
  }

  // Fallback (should not reach here)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600">Unable to determine page type.</p>
      </div>
    </div>
  );
}