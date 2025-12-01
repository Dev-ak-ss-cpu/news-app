"use client"
import { Card, CardBody } from '@heroui/react';
import { Share2 } from 'lucide-react';
import TrendingArticles from '@/app/Components/TrendingArticles';
import RelatedArticles from '@/app/Components/RelatedArticles';
import RelatedCategories from '@/app/Components/RelatedCategories';

export default function ArticleSidebar({ article, sidebarData = {} }) {
    return (
        <div className="space-y-6 sticky top-24">
            {/* Share Options */}
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardBody className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Share2 size={20} className="text-blue-600" />
                        <h3 className="font-bold text-lg text-gray-900">शेयर करें</h3>
                    </div>
                    <div className="flex gap-3">
                        {['Facebook', 'Twitter', 'WhatsApp', 'LinkedIn'].map((platform) => (
                            <button
                                key={platform}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm font-medium transition-colors"
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

            {/* Newsletter Subscription */}
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardBody className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">न्यूज़लेटर</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        दैनिक खबरों की अपडेट पाने के लिए सब्सक्राइब करें
                    </p>
                    <div className="space-y-3">
                        <input
                            type="email"
                            placeholder="आपका ईमेल"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                            सब्सक्राइब करें
                        </button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}