import { Card, CardBody, Chip } from '@heroui/react';
import { Calendar, User, MapPin, Eye, Clock } from 'lucide-react';

export default function ArticleContent() {
    const article = {
        title: "बिहार में नीतीश का शपथ ग्रहण: 10वीं बार मुख्यमंत्री बने नीतीश, पांच-पांच नेताओं को एकसाथ दिलाई गई शपथ",
        excerpt: "बिहार में नीतीश कुमार ने 10वीं बार मुख्यमंत्री पद की शपथ ली। प्रधानमंत्री नरेंद्र मोदी, गृहमंत्री अमित शाह और कई राज्यों के मुख्यमंत्री इस ऐतिहासिक समारोह में मौजूद रहे।",
        author: "राजीव कुमार",
        location: "पटना",
        date: "20 नवंबर 2025",
        readTime: "4 मिनट",
        views: "2.5K",
        category: "राजनीति",
        tags: ["नीतीश कुमार", "बिहार सीएम", "शपथ समारोह", "राजनीति", "बिहार"],
        image: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
    };

    return (
        <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-6">
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{article.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{article.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye size={16} />
                        <span>{article.views}</span>
                    </div>
                </div>

                {/* Category */}
                <div className="mb-4">
                    <Chip color="primary" variant="flat" className="bg-blue-100 text-blue-800">
                        {article.category}
                    </Chip>
                </div>

                {/* Article Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {article.title}
                </h1>

                {/* Article Excerpt */}
                <p className="text-lg text-gray-700 mb-6 leading-relaxed italic border-l-4 border-red-500 pl-4">
                    {article.excerpt}
                </p>

                {/* Featured Image */}
                <div className="mb-6">
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-96 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-500 mt-2 text-center">
                        बिहार के मुख्यमंत्री नीतीश कुमार शपथ ग्रहण समारोह के दौरान
                    </p>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                    <p className="mb-4">
                        पटना: बिहार में राजनीतिक इतिहास रचते हुए नीतीश कुमार ने शुक्रवार को 10वीं बार मुख्यमंत्री पद की शपथ ली।
                        राजभवन में आयोजित भव्य समारोह में प्रधानमंत्री नरेंद्र मोदी, गृहमंत्री अमित शाह सहित कई केंद्रीय मंत्री और
                        राज्यों के मुख्यमंत्री मौजूद रहे।
                    </p>

                    <p className="mb-4">
                        इस ऐतिहासिक मौके पर नीतीश कुमार के साथ पांच-पांच नेताओं को एकसाथ मंत्री पद की शपथ दिलाई गई।
                        इस नए मंत्रिमंडल में कई युवा और अनुभवी चेहरों को शामिल किया गया है।
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">शपथ समारोह की मुख्य बातें</h2>

                    <ul className="list-disc list-inside mb-6 space-y-2">
                        <li>प्रधानमंत्री मोदी और अमित शाह ने की मौजूदगी</li>
                        <li>पांच नए मंत्रियों ने एकसाथ ली शपथ</li>
                        <li>मंत्रिमंडल में युवाओं और अनुभवी नेताओं का मेल</li>
                        <li>राजभवन में सुरक्षा के कड़े इंतजाम</li>
                        <li>विपक्षी दलों के नेताओं ने भी ली भागीदारी</li>
                    </ul>

                    <blockquote className="border-l-4 border-red-500 pl-4 italic text-gray-700 my-6">
                        "यह बिहार की जनता का विश्वास है जो मुझे लगातार इस पद पर बनाए रखा है।
                        मैं राज्य के विकास के लिए और अधिक मेहनत से काम करूंगा।"
                        <footer className="mt-2 text-sm text-gray-600">- नीतीश कुमार, मुख्यमंत्री बिहार</footer>
                    </blockquote>

                    <p className="mb-4">
                        समारोह के दौरान नीतीश कुमार ने कहा कि वह बिहार के विकास को नई गति देने के लिए प्रतिबद्ध हैं।
                        उन्होंने कहा कि राज्य में शिक्षा, स्वास्थ्य और बुनियादी ढांचे के विकास पर विशेष ध्यान दिया जाएगा।
                    </p>

                    {/* Video Section */}
                    <div className="my-8">
                        <div className="aspect-video bg-black rounded-lg relative">
                            <img
                                src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
                                alt="शपथ समारोह वीडियो"
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 text-center">
                            शपथ ग्रहण समारोह का विशेष वीडियो
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">नए मंत्रिमंडल की संरचना</h2>

                    <p className="mb-4">
                        नए मंत्रिमंडल में कुल 25 मंत्री शामिल हैं, जिनमें 15 कैबिनेट मंत्री और 10 राज्य मंत्री हैं।
                        इस बार मंत्रिमंडल में युवाओं को विशेष प्रतिनिधित्व दिया गया है।
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg my-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-3">मुख्य मंत्री:</h3>
                        <ul className="space-y-2">
                            <li>• नीतीश कुमार - मुख्यमंत्री</li>
                            <li>• तारकिशोर प्रसाद - उपमुख्यमंत्री</li>
                            <li>• रेणु देवी - उपमुख्यमंत्री</li>
                        </ul>
                    </div>

                    <p className="mb-4">
                        राजनीतिक विश्लेषकों का मानना है कि इस मंत्रिमंडल से सरकार के कामकाज में नई ऊर्जा का संचार होगा
                        और बिहार के विकास को नई दिशा मिलेगी।
                    </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                    {article.tags.map((tag, index) => (
                        <Chip
                            key={index}
                            variant="flat"
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                        >
                            #{tag}
                        </Chip>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}