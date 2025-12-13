import { fetchTrendingArticles } from '@/app/utils/serverApi';
import TrendingArticlesPage from './TrendingArticlesPage';

export default async function TrendingPage() {
  // Fetch trending articles
  const [trendingResponse] = await Promise.all([
    fetchTrendingArticles(50), // Fetch more articles for listing
  ]);

  const trendingArticles = trendingResponse.success 
    ? trendingResponse.data?.newArticles || [] 
    : [];

  return (
    <>
      <TrendingArticlesPage initialArticles={trendingArticles} />
    </>
  );
}
