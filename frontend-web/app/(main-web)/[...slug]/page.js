import { resolveRoute } from './utils/routeUtils';
import ArticleDetails from './detailPage/ArticleDetails';
import ArticleWithCategory from './ArticleWithCategory';
import { 
  fetchTrendingArticles, 
  fetchRelatedArticles, 
  fetchRelatedCategories 
} from '@/app/utils/serverApi';

// Generate metadata for article pages (for social media sharing)
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const routeResult = await resolveRoute(slug);
    
    // Only generate metadata for articles
    if (routeResult.type === "article") {
      const article = routeResult.data.article;
      const categoryPath = routeResult.data.categoryPath || [];
      
      // Get site URL from environment variable
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      
      // Build article URL from category path (slugs) and article slug
      let articleUrl = '';
      if (Array.isArray(categoryPath) && categoryPath.length > 0) {
        articleUrl = `/${categoryPath.join('/')}/${article.slug}`;
      } else {
        articleUrl = `/${article.slug}`;
      }
      const fullArticleUrl = `${siteUrl}${articleUrl}`;
      
      // Get featured image - ensure it's an absolute URL
      let featuredImageUrl = article.featuredImage || '';
      
      // Cloudinary URLs are already absolute, but handle other cases
      if (featuredImageUrl) {
        // If image is already absolute URL (Cloudinary, external), use as-is
        if (!featuredImageUrl.startsWith('http://') && !featuredImageUrl.startsWith('https://')) {
          // Relative path - need to make it absolute
          if (featuredImageUrl.startsWith('/')) {
            // Check if it's from API/uploads or public folder
            if (featuredImageUrl.startsWith('/uploads/') || featuredImageUrl.startsWith('/images/') || featuredImageUrl.startsWith('/api/')) {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
              featuredImageUrl = `${apiUrl}${featuredImageUrl}`;
            } else {
              featuredImageUrl = `${siteUrl}${featuredImageUrl}`;
            }
          } else {
            // No leading slash - likely from API
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            featuredImageUrl = `${apiUrl}/${featuredImageUrl}`;
          }
        }
      }
      
      // Use metaTitle if available, otherwise use title
      const metaTitle = article.metaTitle || article.title || 'News Article';
      // Use metaDescription if available, otherwise use excerpt
      const metaDescription = article.metaDescription || article.excerpt || 'Read the latest news article';
      
      return {
        title: metaTitle,
        description: metaDescription,
        openGraph: {
          type: 'article',
          locale: 'en_US',
          url: fullArticleUrl,
          siteName: 'JK Khabar NOW DIGITAL',
          title: metaTitle,
          description: metaDescription,
          images: featuredImageUrl ? [
            {
              url: featuredImageUrl,
              width: 1200,
              height: 630,
              alt: article.title || 'Article Image',
            },
          ] : [
            {
              url: `${siteUrl}/favicon.jpg`,
              width: 1200,
              height: 630,
              alt: 'JK Khabar NOW DIGITAL',
            },
          ],
          publishedTime: article.publishDate ? new Date(article.publishDate).toISOString() : undefined,
          authors: article.author ? [article.author] : undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title: metaTitle,
          description: metaDescription,
          images: featuredImageUrl ? [featuredImageUrl] : [`${siteUrl}/favicon.jpg`],
          creator: '@jkkhabarnow',
        },
        alternates: {
          canonical: fullArticleUrl,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  // Return default metadata for non-article pages or on error
  return {
    title: 'JK Khabar NOW DIGITAL - Latest News',
    description: 'Get the latest breaking news and updates',
  };
}

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