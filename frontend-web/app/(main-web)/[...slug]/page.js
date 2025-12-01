import { resolveRoute } from './utils/routeUtils';
import ArticleDetails from './detailPage/ArticleDetails';
import ArticleWithCategory from './ArticleWithCategory';
import { 
  fetchTrendingArticles, 
  fetchRelatedArticles, 
  fetchRelatedCategories 
} from '@/app/utils/serverApi';

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
    
    // Fetch sidebar data in parallel for better performance
    const [trendingArticles, relatedArticles, relatedCategories] = await Promise.all([
      fetchTrendingArticles(10),
      fetchRelatedArticles(
        article.category?._id || article.category,
        article._id,
        5
      ),
      fetchRelatedCategories(
        article.category?._id || article.category,
        10
      ),
    ]);

    return (
      <ArticleDetails 
        article={article} 
        categoryPath={urlCategoryPath}
        originalSlug={Array.isArray(slug) && slug.length > 0 ? slug : []}
        // Pass pre-fetched sidebar data
        sidebarData={{
          trendingArticles: trendingArticles.success ? trendingArticles.data?.newArticles || [] : [],
          relatedArticles: relatedArticles.success ? relatedArticles.data?.newArticles || [] : [],
          relatedCategories: relatedCategories.success ? relatedCategories.data || [] : [],
        }}
      />
    );
  }

  // Show category listing page
  if (routeResult.type === "category") {
    const categoryData = routeResult.data;
    const currentCategory = categoryData?.category?.current || {};
    const categoryId = currentCategory?._id;

    // Fetch sidebar data in parallel
    const [trendingArticles, relatedArticles, relatedCategories] = await Promise.all([
      fetchTrendingArticles(10),
      categoryId ? fetchRelatedArticles(categoryId, null, 5) : Promise.resolve({ success: false, data: { newArticles: [] } }),
      categoryId ? fetchRelatedCategories(categoryId, 10) : Promise.resolve({ success: false, data: [] }),
    ]);

    return (
      <ArticleWithCategory 
        categoryData={categoryData}
        // Pass pre-fetched sidebar data
        sidebarData={{
          trendingArticles: trendingArticles.success ? trendingArticles.data?.newArticles || [] : [],
          relatedArticles: relatedArticles.success ? relatedArticles.data?.newArticles || [] : [],
          relatedCategories: relatedCategories.success ? relatedCategories.data || [] : [],
        }}
      />
    );
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