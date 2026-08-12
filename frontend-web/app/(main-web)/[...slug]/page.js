import { notFound } from 'next/navigation';
import { resolveRoute } from './utils/routeUtils';
import ArticleDetails from './detailPage/ArticleDetails';
import ArticleWithCategory from './ArticleWithCategory';
import {
  fetchTrendingArticles,
  fetchRelatedArticles,
  fetchRelatedCategories
} from '@/app/utils/serverApi';
import JsonLd from '@/app/Components/JsonLd';
import { SITE_URL, resolveImageUrl, buildArticleUrl, buildCategoryUrl, humanizeSlug } from './utils/seoUtils';

// Generate metadata for article pages (for social media sharing)
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const routeResult = await resolveRoute(slug);
    
    // Only generate metadata for articles
    if (routeResult.type === "article") {
      const article = routeResult.data.article;
      const categoryPath = routeResult.data.categoryPath || [];

      const siteUrl = SITE_URL;
      const fullArticleUrl = buildArticleUrl(article, categoryPath);
      const featuredImageUrl = resolveImageUrl(article.featuredImage);

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
          images: [
            {
              url: featuredImageUrl,
              width: 1200,
              height: 630,
              alt: article.title || 'Article Image',
            },
          ],
          publishedTime: article.publishDate ? new Date(article.publishDate).toISOString() : undefined,
          modifiedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
          authors: article.author ? [article.author] : undefined,
          section: article.category?.name || undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title: metaTitle,
          description: metaDescription,
          images: [featuredImageUrl],
          creator: '@jkkhabarnow',
        },
        alternates: {
          canonical: fullArticleUrl,
        },
      };
    }

    // Generate unique metadata for category listing pages
    if (routeResult.type === "category") {
      const categoryData = routeResult.data;
      const currentCategory = categoryData?.category?.current || {};
      const categoryPath = Array.isArray(categoryData?.category?.path)
        ? categoryData.category.path
        : [];
      const categoryName = typeof currentCategory?.name === 'string'
        ? currentCategory.name
        : 'News';

      const siteUrl = SITE_URL;
      const pathSegments = categoryPath.map((cat) => cat?.slug).filter(Boolean);
      const categoryUrl = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '/';
      const fullCategoryUrl = `${siteUrl}${categoryUrl}`;

      const title = `${categoryName} News - Latest ${categoryName} Updates & Headlines`;
      const description = `Read the latest ${categoryName} news, breaking stories, and in-depth coverage. Stay updated with real-time ${categoryName} news from JK Khabar NOW DIGITAL.`;

      return {
        title,
        description,
        openGraph: {
          type: 'website',
          locale: 'en_US',
          url: fullCategoryUrl,
          siteName: 'JK Khabar NOW DIGITAL',
          title,
          description,
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
        },
        alternates: {
          canonical: fullCategoryUrl,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  // Return default metadata for non-article, non-category pages or on error
  return {
    title: 'JK Khabar NOW DIGITAL - Latest News',
    description: 'Get the latest breaking news and updates',
  };
}

export default async function page({ params }) {
  const { slug } = await params;

  // Resolve the route to determine if it's an article or category
  const routeResult = await resolveRoute(slug);

  // Handle error case - render the real not-found.js so invalid URLs return
  // an HTTP 404 instead of a 200 "soft 404" that hurts crawl trust.
  if (routeResult.type === "error") {
    notFound();
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

    const fullArticleUrl = buildArticleUrl(article, urlCategoryPath);
    const featuredImageUrl = resolveImageUrl(article.featuredImage);
    const publishedIso = article.publishDate ? new Date(article.publishDate).toISOString() : undefined;

    const newsArticleJsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "@id": `${fullArticleUrl}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": fullArticleUrl },
      headline: (article.metaTitle || article.title || "").slice(0, 110),
      description: article.metaDescription || article.excerpt || undefined,
      image: [featuredImageUrl],
      datePublished: publishedIso,
      dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : publishedIso,
      author: article.author
        ? { "@type": "Person", name: article.author }
        : { "@type": "Organization", name: "JK Khabar NOW DIGITAL", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "JK Khabar NOW DIGITAL",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
      articleSection: article.category?.name || undefined,
      url: fullArticleUrl,
    };

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        ...urlCategoryPath.map((catSlug, index) => ({
          "@type": "ListItem",
          position: index + 2,
          name: humanizeSlug(catSlug),
          item: buildCategoryUrl(urlCategoryPath.slice(0, index + 1)),
        })),
        {
          "@type": "ListItem",
          position: urlCategoryPath.length + 2,
          name: article.title,
          item: fullArticleUrl,
        },
      ],
    };

    return (
      <>
        <JsonLd data={newsArticleJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
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
      </>
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

    const categoryPathObjs = Array.isArray(categoryData?.category?.path) ? categoryData.category.path : [];
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        ...categoryPathObjs.map((cat, index) => ({
          "@type": "ListItem",
          position: index + 2,
          name: cat.name,
          item: buildCategoryUrl(categoryPathObjs.slice(0, index + 1).map((c) => c.slug)),
        })),
      ],
    };

    return (
      <>
        <JsonLd data={breadcrumbJsonLd} />
        <ArticleWithCategory
          categoryData={categoryData}
          // Pass pre-fetched sidebar data
          sidebarData={{
            trendingArticles: trendingArticles.success ? trendingArticles.data?.newArticles || [] : [],
            relatedArticles: relatedArticles.success ? relatedArticles.data?.newArticles || [] : [],
            relatedCategories: relatedCategories.success ? relatedCategories.data || [] : [],
          }}
        />
      </>
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