"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CategoryListing from "./CategoryListing";
import Footer from "@/app/Components/Footer";
import Header from "@/app/Components/Header";
import { Button } from "@heroui/react";
import ArticleHeader from "../[slug]/ArticleHeader";
import ArticleContent from "../[slug]/ArticleContent";
import ArticleSidebar from "../[slug]/ArticleSidebar";
import { parseRoute } from "./utils/routeUtils";


export default function DynamicPage() {
  const params = useParams();
  const [pageState, setPageState] = useState({
    type: null, // 'article' | 'category' | 'loading' | 'error'
    data: null,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  // Get path segments from catch-all route
  // For [...slug], params.slug is always an array
  const pathSegments = Array.isArray(params.slug)
    ? params.slug
    : params.slug
    ? [params.slug]
    : [];

  // Debug logging
  useEffect(() => {
    console.log("Route params:", params);
    console.log("Path segments:", pathSegments);
  }, [params, pathSegments]);

  useEffect(() => {
    const loadPage = async () => {
      if (pathSegments.length === 0) {
        console.error("No path segments found");
        setPageState({
          type: "error",
          data: null,
          error: "Invalid path",
        });
        setLoading(false);
        return;
      }

      console.log("Loading page for segments:", pathSegments);
      setLoading(true);
      setPageState({ type: "loading", data: null, error: null });

      try {
        const result = await parseRoute(pathSegments);
        console.log("Route parse result:", result);
        setPageState(result);
      } catch (error) {
        console.error("Error loading page:", error);
        setPageState({
          type: "error",
          data: null,
          error: "An error occurred while loading the page",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pathSegments.join("/")]);

  // Loading state
  if (loading || pageState.type === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (pageState.type === "error") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {pageState.error || "The page you're looking for doesn't exist."}
            </p>
            <div className="mb-4 text-sm text-gray-500">
              <p>Path segments: {pathSegments.join("/")}</p>
            </div>
            <Button as="a" href="/" color="danger" variant="solid">
              Go to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Article page
  if (pageState.type === "article") {
    const { article, categoryPath } = pageState.data;

    return (
      <div className="min-h-screen bg-gray-50">
        <ArticleHeader article={article} categoryPath={categoryPath} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <div className="flex-1 min-w-0">
              <ArticleContent article={article} />
            </div>
            <div className="hidden lg:block w-80 flex-shrink-0">
              <ArticleSidebar article={article} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Category listing page
  if (pageState.type === "category") {
    return (
      <div className="min-h-screen bg-gray-50">
        <CategoryListing categoryData={pageState.data} />
        <Footer />
      </div>
    );
  }

  return null;
}
