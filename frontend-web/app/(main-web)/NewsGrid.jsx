import Link from "next/link";
import NewsCard from "../Components/NavCard";

export default function NewsGrid({ articles = [] }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">No articles found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <Link key={article._id || index} href={`/article/${article.slug}`}>
            <NewsCard
              title={article.title}
              excerpt={article.excerpt}
              image={article.featuredImage}
              date={new Date(article.publishDate).toLocaleDateString()}
              category={article.category?.name}
              tags={article.tags}
              variant={index === 0 ? "highlighted" : undefined}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
