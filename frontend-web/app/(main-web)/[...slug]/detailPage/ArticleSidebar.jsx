"use client"
import { Card, CardBody } from '@heroui/react';
import { Share2 } from 'lucide-react';
import TrendingArticles from '@/app/Components/TrendingArticles';
import RelatedArticles from '@/app/Components/RelatedArticles';
import RelatedCategories from '@/app/Components/RelatedCategories';

export default function ArticleSidebar({ article, sidebarData = {} }) {
    const handleShare = async (platform) => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const title = article?.title || '';
        const text = article?.excerpt || '';

        const shareUrls = {
            Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            Twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            WhatsApp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
            LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 lg:sticky lg:top-24">
            {/* Share Options */}
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardBody className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Share2 size={20} className="text-blue-600" />
                        <h3 className="font-bold text-lg text-gray-900">शेयर करें</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-3">
                        {['Facebook', 'Twitter', 'WhatsApp', 'LinkedIn'].map((platform) => (
                            <button
                                key={platform}
                                onClick={() => handleShare(platform)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 md:py-2 px-2 md:px-3 rounded text-xs md:text-sm font-medium transition-colors"
                            >
                                {platform}
                            </button>
                        ))}
                    </div>

                </CardBody>
            </Card>

            {/* Related Articles - Using pre-fetched data */}
            <RelatedArticles
                articles={sidebarData.relatedArticles || []}
                title="संबंधित खबरें"
            />

            {/* Related Categories - Using pre-fetched data */}
            <RelatedCategories
                categories={sidebarData.relatedCategories || []}
                title="Related Categories"
            />

            {/* Trending Now - Using pre-fetched data */}
            <TrendingArticles
                articles={sidebarData.trendingArticles || []}
                title="ट्रेंडिंग अभी"
            />

        </div>
    );
}