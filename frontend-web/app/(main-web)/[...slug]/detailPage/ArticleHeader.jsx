"use client";
import { Button } from "@heroui/react";
import {
  ArrowLeft,
  Share2,
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
        // Fallback: Copy to clipboard
        if (err.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
          } catch (clipboardErr) {
            console.log("Error copying to clipboard:", clipboardErr);
          }
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (clipboardErr) {
        console.log("Error copying to clipboard:", clipboardErr);
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600 hover:text-red-600 min-w-8 sm:min-w-10 h-8 sm:h-10"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600 hover:text-red-600 min-w-8 sm:min-w-10 h-8 sm:h-10"
              onClick={handleShare}
              title="Share"
              aria-label="Share article"
            >
              <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600 hover:text-red-600 min-w-8 sm:min-w-10 h-8 sm:h-10"
              onClick={() => window.print()}
              title="Print"
              aria-label="Print article"
            >
              <Printer size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
