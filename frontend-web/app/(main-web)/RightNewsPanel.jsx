import { Card, CardBody } from '@heroui/react';
import { Clock, Share2 } from 'lucide-react';

export default function RightNewsPanel() {
  const latestUpdates = [
    {
      title: "नीतीश कुमार के मंत्रिमंडल में 5 नए मंत्रियों ने ली शपथ",
      time: "15 मिनट पहले"
    },
    {
      title: "बिहार विधानसभा में विपक्ष ने किया विरोध प्रदर्शन",
      time: "30 मिनट पहले"
    },
    {
      title: "प्रधानमंत्री मोदी ने नीतीश कुमार को दी बधाई",
      time: "1 घंटा पहले"
    },
    {
      title: "बिहार: नए मंत्रियों के आवंटन में देरी",
      time: "2 घंटे पहले"
    }
  ];

  const popularCategories = [
    { name: "राजनीति", count: "1.2K", color: "bg-blue-500" },
    { name: "क्रिकेट", count: "980", color: "bg-green-500" },
    { name: "मनोरंजन", count: "756", color: "bg-purple-500" },
    { name: "शहर", count: "642", color: "bg-orange-500" },
    { name: "बिजनेस", count: "534", color: "bg-indigo-500" }
  ];

  return (
    <div className="space-y-6 sticky top-24">
      {/* Latest Updates */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-blue-600" />
            <h3 className="font-bold text-lg text-gray-900">ताज़ा अपडेट</h3>
          </div>
          
          <div className="space-y-4">
            {latestUpdates.map((update, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1">
                  {update.title}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{update.time}</span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Popular Categories */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-4">लोकप्रिय श्रेणियाँ</h3>
          
          <div className="space-y-3">
            {popularCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <span className="bg-white px-2 py-1 rounded text-xs font-medium text-gray-700">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Weather Widget */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-4">मौसम</h3>
          
          <div className="text-center">
            <div className="text-4xl mb-2">🌤️</div>
            <p className="text-2xl font-bold text-gray-900">24°C</p>
            <p className="text-gray-600">दिल्ली</p>
            <p className="text-sm text-gray-500 mt-1">हल्की धूप के साथ</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}