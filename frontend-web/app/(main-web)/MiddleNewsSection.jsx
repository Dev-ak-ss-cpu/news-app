import { Card, CardBody } from '@heroui/react';
import { Play, Calendar, MapPin } from 'lucide-react';
import NewsCard from '../Components/NavCard';
import CategoryCard from '../Components/Category';

export default function MiddleNewsSection() {
    // Sample news data
    const newsItems = Array.from({ length: 8 }, (_, i) => ({
        title: "Bihar CM Oath: 10वीं बार मुख्यमंत्री बने नीतीश, पांच-पांच नेताओं को एकसाथ दिलाई गई शपथ, ये नेता बने मंत्री",
        location: "Patna",
        date: "20 Nov 2025",
        category: "Election",
        tags: i % 2 === 0 ? ["#nitish kumar", "#oath ceremony in bihar", "#bihar cm nitish kumar"] : []
    }));

    const categories = [
        { name: "राजनीति", count: "1245", color: "bg-blue-500", icon: "🏛️" },
        { name: "क्रिकेट", count: "892", color: "bg-green-500", icon: "🏏" },
        { name: "मनोरंजन", count: "756", color: "bg-purple-500", icon: "🎬" },
        { name: "शहर", count: "643", color: "bg-orange-500", icon: "🏙️" }
    ];

    return (
        <div className="space-y-8 pb-8">
            {/* 1st Big Banner Image */}
            <Card className="bg-white border border-gray-200 shadow-lg overflow-hidden">
                <div className="aspect-9/9 bg-gray-200 relative">
                    <img
                        src="https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                        alt="Breaking News"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <div className="flex items-center text-white/80 text-sm mb-2">
                            <MapPin size={16} className="mr-1" />
                            <span className="mr-4">Patna</span>
                            <Calendar size={16} className="mr-1" />
                            <span>20 Nov 2025</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            बिहार में नीतीश का शपथ ग्रहण: प्रधानमंत्री मोदी, अमित शाह समेत कई राज्यों के मुख्यमंत्री रहे मौजूद
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {["#nitish kumar", "#oath ceremony", "#bihar politics"].map((tag, index) => (
                                <span key={index} className="text-white/90 text-sm hover:underline cursor-pointer">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="absolute top-4 left-4">
                        <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">ब्रेकिंग न्यूज़</span>
                    </div>
                </div>
            </Card>

            {/* 2nd Video */}
            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                <CardBody className="p-0">
                    <div className="aspect-video bg-black relative">
                        <img
                            src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
                            alt="YouTube Video"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors">
                                <Play size={32} className="text-white" />
                            </button>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold text-lg mb-2">
                                नीतीश कुमार का शपथ ग्रहण समारोह - लाइव कवरेज
                            </h3>
                            <div className="flex items-center text-white/80 text-sm">
                                <span>2.5K views</span>
                                <span className="mx-2">•</span>
                                <span>1 hour ago</span>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* 3rd to 6th News Containers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsItems.slice(0, 4).map((news, index) => (
                    <NewsCard
                        key={index}
                        title={news.title}
                        location={news.location}
                        date={news.date}
                        category={news.category}
                        tags={news.tags}
                    />
                ))}
            </div>

            {/* 4 Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category, index) => (
                    <CategoryCard
                        key={index}
                        name={category.name}
                        count={category.count}
                        color={category.color}
                        icon={category.icon}
                    />
                ))}
            </div>

            {/* Repeat Pattern: Video */}
            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                <CardBody className="p-0">
                    <div className="aspect-video bg-black relative">
                        <img
                            src="https://img.youtube.com/vi/abc123def456/hqdefault.jpg"
                            alt="YouTube Video"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors">
                                <Play size={32} className="text-white" />
                            </button>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold text-lg mb-2">
                                बिहार में राजनीतिक उथल-पुथल का विश्लेषण
                            </h3>
                            <div className="flex items-center text-white/80 text-sm">
                                <span>1.8K views</span>
                                <span className="mx-2">•</span>
                                <span>3 hours ago</span>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* 3rd to 6th News Containers - Second Set */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsItems.slice(4, 8).map((news, index) => (
                    <NewsCard
                        key={index + 4}
                        title={news.title}
                        location={news.location}
                        date={news.date}
                        category={news.category}
                        tags={news.tags}
                    />
                ))}
            </div>
        </div>
    );
}