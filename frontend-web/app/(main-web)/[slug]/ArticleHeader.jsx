import { Button } from "@heroui/react";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Printer,
  Home,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ArticleHeader({ article, categoryPath = [] }) {
  const router = useRouter();

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    }
  };

  // Build breadcrumb from category path
  const buildBreadcrumb = () => {
    if (!article?.category || categoryPath.length === 0) return null;

    const breadcrumbPath = [...categoryPath];
    if (article.category) {
      breadcrumbPath.push({
        slug: article.category.slug,
        name: article.category.name,
      });
    }

    return breadcrumbPath;
  };

  const breadcrumb = buildBreadcrumb();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-2 text-sm py-2 border-b border-gray-100">
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <Home size={14} />
              <span>होम</span>
            </Link>
            {breadcrumb.map((cat, index) => {
              const pathToCategory = breadcrumb
                .slice(0, index + 1)
                .map((c) => c.slug)
                .join("/");

              return (
                <div
                  key={cat.slug || index}
                  className="flex items-center gap-2"
                >
                  <ChevronRight size={12} className="text-gray-400" />
                  <Link
                    href={`/${pathToCategory}`}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600 hover:text-red-600"
              onClick={() => router.back()}
            >
              <ArrowLeft size={20} />
            </Button>
            <a
              href="/"
              className="text-xl font-bold text-red-600 hover:text-red-700"
            >
              न्यूज़ हिंदी
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600 hover:text-red-600"
              title="Bookmark"
            >
              <Bookmark size={18} />
            </Button>
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600 hover:text-red-600"
              onClick={handleShare}
              title="Share"
            >
              <Share2 size={18} />
            </Button>
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600 hover:text-red-600"
              onClick={() => window.print()}
              title="Print"
            >
              <Printer size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
