import HomePageClient from "./(main-web)/HomePageClient";
import { fetchHomeArticles, fetchRootCategories, fetchAllCategoriesFlat } from "./utils/serverApi";

// Utility function to format dates consistently
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
}

// Utility function to format article dates
function formatArticleDates(articles) {
  if (!articles || !Array.isArray(articles)) return articles;
  return articles.map(article => ({
    ...article,
    formattedDate: formatDate(article.publishDate || article.publishedAt)
  }));
}

export default async function Page() {
  // Fetch initial data on the server
  const [response, rootCategoriesResponse, allCategoriesResponse] = await Promise.all([
    fetchHomeArticles(1, 10),
    fetchRootCategories(),
    fetchAllCategoriesFlat(),
  ]);

  let initialData = {
    breakingNews: [],
    featuredArticle: [],
    topStory: [],
    regularArticles: [],
    trendingArticles: [],
    pagination: null,
    liveVideoId: "",
  };

  if (response.success) {
    const { breakingNews, center, trending, liveVideoId } = response.data;

    initialData = {
      breakingNews: formatArticleDates(breakingNews || []),
      featuredArticle: formatArticleDates(center?.featured || []),
      topStory: formatArticleDates(center?.topStory || []),
      regularArticles: formatArticleDates(center?.regularArticles || []),
      trendingArticles: formatArticleDates(trending || []),
      pagination: center?.pagination || null,
      liveVideoId: liveVideoId || "",
    };
  }

  const rootCategories = rootCategoriesResponse.success 
    ? rootCategoriesResponse.data || [] 
    : [];

  const allCategories = allCategoriesResponse.success 
    ? allCategoriesResponse.data || [] 
    : [];

  return (
    <HomePageClient 
      initialData={initialData} 
      rootCategories={rootCategories}
      allCategories={allCategories}
    />
  );
}
