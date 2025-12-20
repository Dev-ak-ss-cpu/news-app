import Link from "next/link";
import NewsCard from "../Components/NavCard";
import { buildArticleUrl } from "@/app/utils/articleUrl";

export default function NewsGrid({ articles = [] }) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {articles.length > 0 && articles.map((article, index) => (
          <Link key={article._id || index} href={buildArticleUrl(article)}>
            <NewsCard
              title={article.title}
              excerpt={article.excerpt}
              image={article.featuredImage}
              date={article.formattedDate || new Date(article.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
              category={article.category?.name}
              tags={article.tags}
              variant={"highlighted" }
              author={article.author}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
