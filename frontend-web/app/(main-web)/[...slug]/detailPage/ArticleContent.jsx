"use client";
import { Card, CardBody, Chip } from '@heroui/react';
import { Calendar, User, MapPin, Eye, Clock } from 'lucide-react';
import { getYouTubeId } from '@/app/Helper';

// YouTube Video Component
const YouTubeEmbed = ({ videoUrl, title }) => {
    const videoId = getYouTubeId(videoUrl);

    if (!videoId) return null;

    return (
        <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg sm:rounded-xl shadow-lg my-4 sm:my-6">
            <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={title || "YouTube video player"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export default function ArticleContent({ article }) {
    // Use provided article data or fallback to mock data
    const articleData = article || {}

    // Format date if it exists
    const formattedDate = articleData.publishDate
        ? new Date(articleData.publishDate).toLocaleDateString('hi-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : articleData.date;

    // Get category name
    const categoryName = articleData.category?.name ||
        (typeof articleData.category === 'string' ? articleData.category : articleData.category) ||
        "News";

    // Get image - prioritize featuredImage, then image, then fallback
    const displayImage = articleData.featuredImage || articleData.image;

    // Advertisement component
    // const AdSection = ({ title, className = "" }) => (
    //     <div className={`bg-linear-to-r from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
    //         <div className="text-gray-500 font-medium mb-2">📢 {title}</div>
    //         <div className="text-sm text-gray-400">Advertisement</div>
    //         <div className="mt-2 text-xs text-gray-400">300x250</div>
    //     </div>
    // );

    return (
        <div className="mx-auto px-0 sm:px-2 md:px-4">
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardBody className="p-4 sm:p-5 md:p-6 lg:p-8">
                    {/* Header Section */}
                    <div className="mb-4 sm:mb-6">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div className="w-full">
                                {/* Category */}
                                <Chip
                                    color="primary"
                                    variant="flat"
                                    className="bg-red-100 text-red-800 border border-red-200 font-medium mb-2 sm:mb-3 text-xs sm:text-sm"
                                >
                                    {categoryName}
                                </Chip>

                                {/* Article Title */}
                                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight font-serif">
                                    {articleData.title}
                                </h1>
                            </div>
                        </div>

                        {/* Article Meta */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                            {articleData.location && (
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1 rounded-full">
                                    <MapPin size={12} className="sm:w-[14px] sm:h-[14px] text-red-500 flex-shrink-0" />
                                    <span className="truncate max-w-[120px] sm:max-w-none">{articleData.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1 rounded-full">
                                <Calendar size={12} className="sm:w-[14px] sm:h-[14px] text-blue-500 flex-shrink-0" />
                                <span className="whitespace-nowrap">{formattedDate}</span>
                            </div>
                            {articleData.author && (
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1 rounded-full">
                                    <User size={12} className="sm:w-[14px] sm:h-[14px] text-green-500 flex-shrink-0" />
                                    <span className="truncate max-w-[100px] sm:max-w-none">{articleData.author}</span>
                                </div>
                            )}
                            {articleData.readTime && (
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1 rounded-full">
                                    <Clock size={12} className="sm:w-[14px] sm:h-[14px] text-purple-500 flex-shrink-0" />
                                    <span>{articleData.readTime}</span>
                                </div>
                            )}
                            {articleData.views && (
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1 rounded-full">
                                    <Eye size={12} className="sm:w-[14px] sm:h-[14px] text-orange-500 flex-shrink-0" />
                                    <span>{articleData.views}</span>
                                </div>
                            )}
                        </div>

                        {/* Article Excerpt */}
                        {articleData.excerpt && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 pl-3 sm:pl-4 py-2 sm:py-3 rounded-r-lg mb-4 sm:mb-6">
                                <p className="text-base sm:text-lg text-gray-800 leading-relaxed font-medium">
                                    {articleData.excerpt}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Top Ad Section */}
                    {/* <AdSection title="Sponsored Content" className="mb-6" /> */}

                    {/* Featured Image */}
                    {displayImage && (
                        <div className="mb-4 sm:mb-6 relative w-full -mx-4 sm:-mx-5 md:-mx-6 lg:mx-0">
                            <img
                                src={displayImage}
                                alt={articleData.title}
                                className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[550px] object-cover rounded-none sm:rounded-xl shadow-md"
                            />

                            {/* Title Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-3 sm:p-4 rounded-b-none sm:rounded-b-xl">
                                <p className="text-white text-xs sm:text-sm md:text-base font-medium text-center drop-shadow-md line-clamp-2 sm:line-clamp-none">
                                    {articleData.title}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Middle Ad Section */}
                    {/* <AdSection title="Recommended For You" className="my-8" /> */}

                    {/* Article Content */}
                    <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-gray-800 leading-relaxed">
                        {articleData.content ? (
                            <div
                                className="raw-html space-y-3 sm:space-y-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_p]:text-sm sm:[&_p]:text-base [&_h1]:text-xl sm:[&_h1]:text-2xl [&_h2]:text-lg sm:[&_h2]:text-xl [&_h3]:text-base sm:[&_h3]:text-lg"
                                dangerouslySetInnerHTML={{ __html: articleData.content }}
                            />
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                <p className="text-sm sm:text-base text-gray-700">
                                    {articleData.description || articleData.excerpt || "Content coming soon..."}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    यह समाचार विस्तार से जल्द ही उपलब्ध होगा। कृपया बाद में पुनः चेक करें।
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {articleData.youtubeVideo && (
                        <YouTubeEmbed
                            videoUrl={articleData.youtubeVideo}
                            title={articleData.title}
                        />
                    )}

                    {/* Bottom Ad Section */}
                    {/* <AdSection title="You May Also Like" className="my-8" /> */}

                    {/* YouTube Video - Displayed before image if available */}


                    {/* Tags */}
                    {articleData.tags && articleData.tags.length > 0 && (
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">टैग्स:</h3>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {articleData.tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        variant="flat"
                                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors duration-200 border border-gray-300 text-xs sm:text-sm"
                                    >
                                        #{tag}
                                    </Chip>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Article Footer */}
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                        <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm text-gray-600 gap-2 sm:gap-4">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" />
                                    <span className="whitespace-nowrap">प्रकाशित: {formattedDate}</span>
                                </div>
                                {articleData.views && (
                                    <div className="flex items-center gap-1">
                                        <Eye size={12} className="sm:w-[14px] sm:h-[14px]" />
                                        <span>{articleData.views} व्यूज</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
