"use client";
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
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 ">
      <div className="container mx-auto px-4">


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
