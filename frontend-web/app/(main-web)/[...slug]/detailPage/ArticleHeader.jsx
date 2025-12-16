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
      <div className="container mx-auto px-2 md:px-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-gray-600 hover:text-red-600"
              onClick={() => router.back()}
            >
              <ArrowLeft size={18} className="md:w-5 md:h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-gray-600 hover:text-red-600"
              onClick={handleShare}
              title="Share"
            >
              <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-gray-600 hover:text-red-600"
              onClick={() => window.print()}
              title="Print"
            >
              <Printer size={16} className="md:w-[18px] md:h-[18px]" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
