import { Card, CardBody } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function LeftNewsPanel({ trendingArticles = [] }) {
  const trendingNews = [
    {
      title: "बिहार में बड़ा बदलाव: नीतीश कुमार ने ली मुख्यमंत्री पद की शपथ",
      time: "2 घंटे पहले",
      category: "राजनीति",
    },
    {
      title: "IPL 2024: मुंबई इंडियंस ने चेन्नई को 5 विकेट से हराया",
      time: "4 घंटे पहले",
      category: "क्रिकेट",
    },
    {
      title: "बॉलीवुड में सनसनी: नए सुपरस्टार की एंट्री",
      time: "6 घंटे पहले",
      category: "मनोरंजन",
    },
    {
      title: "दिल्ली में तापमान गिरा, सर्द हवाओं का दौर",
      time: "8 घंटे पहले",
      category: "शहर",
    },
    {
      title: "शेयर बाजार में तेजी, सेंसेक्स 500 अंक ऊपर",
      time: "10 घंटे पहले",
      category: "बिजनेस",
    },
  ];

  const getTimeAgo = (date) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffInHours = Math.floor((now - articleDate) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - articleDate) / (1000 * 60));
      return diffInMinutes < 1 ? "अभी" : `${diffInMinutes} मिनट पहले`;
    }
    if (diffInHours < 24) return `${diffInHours} घंटे पहले`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} दिन पहले`;
  };

  return (
    <div className="space-y-6 sticky top-36">
      {/* Trending News */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-red-600" />
            <h3 className="font-bold text-lg text-gray-900">
              ट्रेंडिंग न्यूज़
            </h3>
          </div>

          <div className="space-y-4">
            {trendingArticles.length > 0 ? (
              trendingArticles.map((news, index) => (
                <Link key={news._id || index} href={`/article/${news.slug}`}>
                  <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1">
                          {news.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{getTimeAgo(news.publishDate)}</span>
                          {news.category && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">
                                {news.category.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No trending articles</p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Live TV */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-4">लाइव टीवी</h3>
          <div className="aspect-video bg-black rounded-lg relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">▶</span>
                </div>
                <p className="text-white text-sm">लाइव न्यूज़</p>
              </div>
            </div>
            <div className="absolute top-2 left-2">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                LIVE
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
