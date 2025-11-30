"use client";
import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import NewsGrid from "../NewsGrid";
import Header from "@/app/Components/Header";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { fetchCategoryData } from "./utils/routeUtils";

export default function CategoryListing({ categoryData }) {
  const [articles, setArticles] = useState(categoryData?.articles || []);
  const [pagination, setPagination] = useState(
    categoryData?.pagination || null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const category = categoryData?.category;

  const categoryPath = category?.path || [];
  const currentCategory = category?.current;

  // Get path segments from category path for building URLs
  const pathSegments = categoryPath.map((p) => p.slug);

  const loadMoreArticles = async (page) => {
    if (!category || loading) return;

    try {
      setLoading(true);
      const result = await fetchCategoryData(pathSegments, page, 20);

      if (result.success && result.data) {
        if (page === 1) {
          setArticles(result.data.articles || []);
        } else {
          setArticles((prev) => [...prev, ...(result.data.articles || [])]);
        }
        setPagination(result.data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryData) {
      setArticles(categoryData.articles || []);
      setPagination(categoryData.pagination);
      setCurrentPage(1);
    }
  }, [categoryData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <nav
            className="flex items-center gap-2 text-sm"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <Home size={16} />
              <span>होम</span>
            </Link>
            {categoryPath.map((cat, index) => {
              const pathToCategory = categoryPath
                .slice(0, index + 1)
                .map((c) => c.slug)
                .join("/");

              return (
                <div key={cat.slug} className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-gray-400" />
                  <Link
                    href={`/${pathToCategory}`}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </div>
              );
            })}
            {currentCategory && (
              <>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="text-gray-900 font-semibold">
                  {currentCategory.name}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {currentCategory?.name || "Category"}
          </h1>
          {pagination && (
            <p className="text-red-100 text-lg">
              {pagination.totalArticles.toLocaleString()} articles found
            </p>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      <main className="container mx-auto px-4 py-8">
        {articles.length > 0 ? (
          <>
            <NewsGrid articles={articles} />
            {pagination && pagination.currentPage < pagination.totalPages && (
              <div className="text-center mt-12">
                <Button
                  color="danger"
                  variant="solid"
                  size="lg"
                  onClick={() => loadMoreArticles(currentPage + 1)}
                  isLoading={loading}
                  className="font-semibold px-8"
                >
                  {loading ? "Loading..." : "Load More Articles"}
                </Button>
                <p className="text-gray-600 mt-4 text-sm">
                  Showing {articles.length} of{" "}
                  {pagination.totalArticles.toLocaleString()} articles
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-4">
              No articles found in this category.
            </p>
            <Button as="a" href="/" color="danger" variant="bordered">
              Go to Home
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
