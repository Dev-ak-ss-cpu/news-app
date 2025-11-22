import { Card, CardBody } from '@heroui/react';

export default function HeroSection() {
    const mainNews = {
        title: "बिहार में नीतीश का शपथ ग्रहण: प्रधानमंत्री मोदी, अमित शाह समेत कई राज्यों के मुख्यमंत्री रहे मौजूद",
        location: "Patna",
        date: "20 Nov 2025",
        category: "Election",
        tags: ["#nitish kumar", "#oath ceremony in bihar", "#bihar cm nitish kumar"]
    };

    return (
        <div className="bg-gray-50 py-6">
            <div className="container mx-auto px-4">
                {/* Breaking News Badge */}
                {/* <div className="flex items-center mb-4">
                    <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">ब्रेकिंग न्यूज़</span>
                    <span className="ml-4 text-lg font-bold text-gray-800">आज की बड़ी खबरें</span>
                </div> */}

                {/* Main Hero Card */}
                <Card className="bg-white shadow-lg border border-gray-200">
                    <CardBody className="p-6">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span className="font-medium">{mainNews.location}</span>
                            <span className="mx-2">•</span>
                            <span>{mainNews.date}</span>
                            <span className="mx-2">•</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{mainNews.category}</span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                            {mainNews.title}
                        </h1>

                        <div className="flex flex-wrap gap-2">
                            {mainNews.tags.map((tag, index) => (
                                <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}