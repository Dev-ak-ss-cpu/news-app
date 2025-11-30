"use client"
import { Card, CardBody } from '@heroui/react';
import { TrendingUp, Share2 } from 'lucide-react';

export default function ArticleSidebar() {
    const relatedArticles = [
        {
            title: "सांसद नीतीश के पास थी ज्यादा जमीनें: अब बिहार में नहीं है कोई खेत-घर",
            time: "2 घंटे पहले",
            image: "https://images.unsplash.com/photo-1541336032412-2048a678540d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
        },
        {
            title: "20 साल में सीएम की दौलत कितनी बढ़ी? संपत्ति का ब्योरा",
            time: "4 घंटे पहले",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
        },
        {
            title: "बिहार में नए मंत्रियों के विभागों का आवंटन जारी",
            time: "6 घंटे पहले",
            image: "https://images.unsplash.com/photo-1593115057322-e94b77572f20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
        }
    ];

    const trendingArticles = [
        {
            title: "IPL 2024: मुंबई इंडियंस ने चेन्नई को हराया",
            category: "क्रिकेट",
            views: "15K"
        },
        {
            title: "बॉलीवुड में नए सुपरस्टार की एंट्री",
            category: "मनोरंजन",
            views: "12K"
        },
        {
            title: "दिल्ली में मौसम में बदलाव",
            category: "शहर",
            views: "8K"
        }
    ];

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

            {/* Related Articles */}
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardBody className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">संबंधित खबरें</h3>
                    <div className="space-y-4">
                        {relatedArticles.map((article, index) => (
                            <div key={index} className="flex gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-20 h-16 object-cover rounded flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1 line-clamp-2">
                                        {article.title}
                                    </h4>
                                    <span className="text-xs text-gray-500">{article.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Trending Now */}
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardBody className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-red-600" />
                        <h3 className="font-bold text-lg text-gray-900">ट्रेंडिंग अभी</h3>
                    </div>
                    <div className="space-y-3">
                        {trendingArticles.map((article, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs flex items-center justify-center font-bold">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1">
                                        {article.title}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{article.category}</span>
                                        <span>{article.views} views</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

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