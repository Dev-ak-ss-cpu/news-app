import { Card, CardBody } from "@heroui/react";
import { Play, Calendar, MapPin } from "lucide-react";
import NewsCard from "../Components/NavCard";
import CategoryCard from "../Components/Category";
import HeroSection from "./HeroSection";
import Link from "next/link";

export default function MiddleNewsSection({
  featuredArticle = null,
  topStory = null,
  regularArticles = [],
  loadMore,
  hasMore,
  isLoadingMore,
}) {
  // Sample news data
  const newsItems = Array.from({ length: 8 }, (_, i) => ({
    title:
      "Bihar CM Oath: 10वीं बार मुख्यमंत्री बने नीतीश, पांच-पांच नेताओं को एकसाथ दिलाई गई शपथ, ये नेता बने मंत्री",
    location: "Patna",
    date: "20 Nov 2025",
    category: "Election",
    tags:
      i % 2 === 0
        ? ["#nitish kumar", "#oath ceremony in bihar", "#bihar cm nitish kumar"]
        : [],
  }));

  const categories = [
    { name: "राजनीति", count: "1245", color: "bg-blue-500", icon: "🏛️" },
    { name: "क्रिकेट", count: "892", color: "bg-green-500", icon: "🏏" },
    { name: "मनोरंजन", count: "756", color: "bg-purple-500", icon: "🎬" },
    { name: "शहर", count: "643", color: "bg-orange-500", icon: "🏙️" },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* 1st Big Banner Image */}
      {featuredArticle && (
        <Link href={`/article/${featuredArticle.slug}`}>
          <Card className="bg-white border border-gray-200 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
            <div className="aspect-[9/9] bg-gray-200 relative">
              {featuredArticle.featuredImage && (
                <img
                  src={featuredArticle.featuredImage}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center text-white/80 text-sm mb-2">
                  {featuredArticle.category && (
                    <>
                      <MapPin size={16} className="mr-1" />
                      <span className="mr-4">
                        {featuredArticle.category.name}
                      </span>
                    </>
                  )}
                  <Calendar size={16} className="mr-1" />
                  <span>
                    {new Date(featuredArticle.publishDate).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {featuredArticle.title}
                </h2>
                {featuredArticle.tags && featuredArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {featuredArticle.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-white/90 text-sm hover:underline cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {featuredArticle.isBreaking && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
                    ब्रेकिंग न्यूज़
                  </span>
                </div>
              )}
            </div>
          </Card>
        </Link>
      )}

      {/* 2nd Video */}
      {topStory && (
        <Link href={`/article/${topStory.slug}`}>
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <CardBody className="p-0">
              <div className="flex flex-col md:flex-row">
                {topStory.featuredImage && (
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <img
                      src={topStory.featuredImage}
                      alt={topStory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`${
                    topStory.featuredImage ? "md:w-2/3" : "w-full"
                  } p-6`}
                >
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    {topStory.category && (
                      <>
                        <MapPin size={16} />
                        <span>{topStory.category.name}</span>
                        <span>•</span>
                      </>
                    )}
                    <Calendar size={16} />
                    <span>
                      {new Date(topStory.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {topStory.title}
                  </h3>
                  {topStory.excerpt && (
                    <p className="text-gray-600 line-clamp-2">
                      {topStory.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>
      )}

      {/* 3rd to 6th News Containers */}
      {regularArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regularArticles.map((article, index) => (
            <Link key={article._id || index} href={`/article/${article.slug}`}>
              <NewsCard
                title={article.title}
                excerpt={article.excerpt}
                image={article.featuredImage}
                location={article.category?.name}
                date={new Date(article.publishDate).toLocaleDateString()}
                category={article.category?.name}
                tags={article.tags}
              />
            </Link>
          ))}
        </div>
      )}

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

      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            onPress={loadMore}
            isLoading={isLoadingMore}
            variant="bordered"
            className="border-gray-300"
          >
            {isLoadingMore ? "Loading..." : "Load More Articles"}
          </Button>
        </div>
      )}

      <HeroSection />
      <HeroSection />
    </div>
  );
}
