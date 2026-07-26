import { serverGetApi } from '@/app/utils/serverApi';
import BreakingArticlesPage from './BreakingArticlesPage';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'Breaking News - Latest Breaking Headlines',
  description: 'Get real-time breaking news updates on politics, sports, entertainment, and more. Stay informed with the latest breaking headlines from JK Khabar NOW DIGITAL.',
  alternates: {
    canonical: `${SITE_URL}/breaking`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/breaking`,
    siteName: 'JK Khabar NOW DIGITAL',
    title: 'Breaking News - Latest Breaking Headlines',
    description: 'Get real-time breaking news updates on politics, sports, entertainment, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breaking News - Latest Breaking Headlines',
    description: 'Get real-time breaking news updates on politics, sports, entertainment, and more.',
  },
};

export default async function BreakingPage() {
  // Fetch breaking news
  const [breakingResponse] = await Promise.all([
    serverGetApi('/api/articles', {
      page: '1',
      limit: '50',
      isBreaking: 'true',
      status: '1',
    }),
  ]);

  const breakingArticles = breakingResponse.success 
    ? breakingResponse.data?.newArticles || [] 
    : [];

  return (
    <>
      <BreakingArticlesPage initialArticles={breakingArticles} />
    </>
  );
}
