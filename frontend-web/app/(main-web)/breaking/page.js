import { serverGetApi } from '@/app/utils/serverApi';
import BreakingArticlesPage from './BreakingArticlesPage';

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
