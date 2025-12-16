"use client";
import { Card, CardBody, Chip } from '@heroui/react';
import { Calendar, User, MapPin, Eye, Clock } from 'lucide-react';
import { getYouTubeId } from '@/app/Helper';

// YouTube Video Component
const YouTubeEmbed = ({ videoUrl, title }) => {
    const videoId = getYouTubeId(videoUrl);

    if (!videoId) return null;

    return (
        <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg my-6">
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
        <div className="mx-auto px-0 md:px-4">
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardBody className="p-4 md:p-6 lg:p-8">
                    {/* Header Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                {/* Category */}
                                <Chip
                                    color="primary"
                                    variant="flat"
                                    className="bg-red-100 text-red-800 border border-red-200 font-medium mb-3"
                                >
                                    {categoryName}
                                </Chip>

                                {/* Article Title */}
                                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight font-serif">
                                    {articleData.title}
                                </h1>
                            </div>
                        </div>

                        {/* Article Meta */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                            {articleData.location && (
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                                    <MapPin size={14} className="text-red-500" />
                                    <span>{articleData.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                                <Calendar size={14} className="text-blue-500" />
                                <span>{formattedDate}</span>
                            </div>
                            {articleData.author && (
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                                    <User size={14} className="text-green-500" />
                                    <span>{articleData.author}</span>
                                </div>
                            )}
                            {articleData.readTime && (
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                                    <Clock size={14} className="text-purple-500" />
                                    <span>{articleData.readTime}</span>
                                </div>
                            )}
                            {articleData.views && (
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                                    <Eye size={14} className="text-orange-500" />
                                    <span>{articleData.views}</span>
                                </div>
                            )}
                        </div>

                        {/* Article Excerpt */}
                        {articleData.excerpt && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 pl-3 md:pl-4 py-2 md:py-3 rounded-r-lg mb-4 md:mb-6">
                                <p className="text-base md:text-lg text-gray-800 leading-relaxed font-medium">
                                    {articleData.excerpt}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Top Ad Section */}
                    {/* <AdSection title="Sponsored Content" className="mb-6" /> */}

                    {/* Featured Image */}
                    {displayImage && (
                        <div className="mb-4 md:mb-6 relative w-full">
                            <img
                                src={displayImage}
                                alt={articleData.title}
                                className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[550px] object-cover rounded-lg md:rounded-xl shadow-md"
                            />

                            {/* Title Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2 md:p-4 rounded-b-lg md:rounded-b-xl">
                                <p className="text-white text-xs sm:text-sm md:text-base font-medium text-center drop-shadow-md line-clamp-2">
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
                                className="raw-html space-y-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_h1]:text-xl sm:[&_h1]:text-2xl md:[&_h1]:text-3xl [&_h2]:text-lg sm:[&_h2]:text-xl md:[&_h2]:text-2xl [&_h3]:text-base sm:[&_h3]:text-lg md:[&_h3]:text-xl [&_ul]:text-sm sm:[&_ul]:text-base [&_ol]:text-sm sm:[&_ol]:text-base [&_li]:mb-2 [&_a]:text-blue-600 [&_a]:underline [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:text-xs sm:[&_table]:text-sm"
                                dangerouslySetInnerHTML={{ __html: articleData.content }}
                            />
                        ) : (
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    {articleData.description || articleData.excerpt || "Content coming soon..."}
                                </p>
                                <p className="text-gray-600">
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
                        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">टैग्स:</h3>
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                                {articleData.tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        variant="flat"
                                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors duration-200 border border-gray-300"
                                    >
                                        #{tag}
                                    </Chip>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Article Footer */}
                    <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                        <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm text-gray-600 gap-2">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>प्रकाशित: {formattedDate}</span>
                                </div>
                                {articleData.views && (
                                    <div className="flex items-center gap-1">
                                        <Eye size={14} />
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
