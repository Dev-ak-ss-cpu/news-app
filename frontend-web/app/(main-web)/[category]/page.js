"use client"
import ArticleHeader from './ArticleHeader';
import ArticleContent from './ArticleContent';
import ArticleSidebar from './ArticleSidebar';
import Footer from '@/app/Components/Footer';

export default function ArticleDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ArticleHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Article Content */}
          <div className="flex-1 min-w-0">
            <ArticleContent />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <ArticleSidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}