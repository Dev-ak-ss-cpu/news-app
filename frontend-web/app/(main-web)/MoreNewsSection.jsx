"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Loader2 } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { MoreNewsMosaic, MoreNewsSkeleton } from "./MoreNewsLayouts";

/**
 * Full-width feed that picks up where the three-column layout stops. The first
 * batch (page 2) loads on its own once the reader reaches the bottom; every
 * page after that is behind the load-more button.
 */
export default function MoreNewsSection({
  articles = [],
  hasMore = false,
  isLoading = false,
  error = null,
  onLoadMore,
  title = "और खबरें",
}) {
  const sentinelRef = useRef(null);
  const [autoLoadTried, setAutoLoadTried] = useState(false);

  // The first batch auto-loads exactly once; after that the button takes over.
  // `autoLoadTried` also stops an empty page from re-triggering the observer.
  const shouldAutoLoad =
    !autoLoadTried && articles.length === 0 && hasMore && !isLoading && !error;

  useEffect(() => {
    if (!shouldAutoLoad) return;

    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setAutoLoadTried(true);
          onLoadMore?.();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldAutoLoad, onLoadMore]);

  // Nothing more to show and nothing left to fetch
  if (!hasMore && articles.length === 0 && !isLoading) return null;

  return (
    <section className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        {/* Reaching this marker kicks off the first batch */}
        <div ref={sentinelRef} aria-hidden="true" />

        <SectionHeader title={title} />

        {articles.length > 0 && <MoreNewsMosaic articles={articles} />}

        {isLoading && (
          <div className={articles.length > 0 ? "mt-6" : ""}>
            <MoreNewsSkeleton />
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <Button onPress={onLoadMore} variant="bordered" radius="full">
              फिर से कोशिश करें
            </Button>
          </div>
        )}

        {hasMore && !error && (articles.length > 0 || autoLoadTried) && (
          <div className="flex justify-center pt-10">
            <Button
              onPress={onLoadMore}
              isDisabled={isLoading}
              radius="full"
              className="bg-linear-to-r from-red-600 to-orange-500 px-8 font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
              startContent={
                isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null
              }
            >
              {isLoading ? "लोड हो रहा है..." : "और खबरें देखें"}
            </Button>
          </div>
        )}

        {!hasMore && articles.length > 0 && !isLoading && (
          <p className="pt-10 text-center text-sm text-gray-500">
            आप सभी खबरें देख चुके हैं
          </p>
        )}
      </div>
    </section>
  );
}
