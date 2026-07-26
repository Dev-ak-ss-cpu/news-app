import { fetchTrendingArticles } from '@/app/utils/serverApi';
import TrendingArticlesPage from './TrendingArticlesPage';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'Trending News - Most Popular Stories Right Now',
  description: 'Discover the most popular and trending news stories right now. Stay updated with what everyone is reading on JK Khabar NOW DIGITAL.',
  alternates: {
    canonical: `${SITE_URL}/trending`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/trending`,
    siteName: 'JK Khabar NOW DIGITAL',
    title: 'Trending News - Most Popular Stories Right Now',
    description: 'Discover the most popular and trending news stories right now.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending News - Most Popular Stories Right Now',
    description: 'Discover the most popular and trending news stories right now.',
  },
};

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
