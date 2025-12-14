"use client";
import { useState, useEffect } from "react";
import {
    Button,
    Card,
    CardBody,
    Breadcrumbs,
    BreadcrumbItem,
    Chip,
    Avatar,
    Spinner
} from "@heroui/react";
import Link from "next/link";
import {
    Home,
    Calendar,
    AlertCircle,
    Eye,
    Share2,
    Landmark
} from "lucide-react";
import { buildArticleUrl } from "@/app/utils/articleUrl";
import { genericGetApi } from "@/app/Helper";
import ArticleListShimmer from "@/app/Components/Shimmer/ArticleListShimmer";
import TrendingArticles from '@/app/Components/TrendingArticles';
import RelatedCategories from '@/app/Components/RelatedCategories';
import { fetchTrendingArticles, fetchRootCategories } from '@/app/utils/serverApi';

export default function BreakingArticlesPage({ initialArticles = [] }) {
    const [articles, setArticles] = useState(initialArticles);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [sidebarData, setSidebarData] = useState({
        trendingArticles: [],
        rootCategories: []
    });

    // Load sidebar data
    useEffect(() => {
        const loadSidebarData = async () => {
            try {
                const [trendingRes, rootCategoriesRes] = await Promise.all([
                    fetchTrendingArticles(5),
                    fetchRootCategories()
                ]);

                setSidebarData({
                    trendingArticles: trendingRes.success ? trendingRes.data?.newArticles || [] : [],
                    rootCategories: rootCategoriesRes.success ? rootCategoriesRes.data || [] : []
                });
            } catch (error) {
                console.error('Error loading sidebar data:', error);
            }
        };
        loadSidebarData();
    }, []);

    const loadMore = async () => {
        if (loading) return;

        setLoading(true);
        try {
            const response = await genericGetApi('/api/articles', {
                page: (page + 1).toString(),
                limit: '12',
                isBreaking: 'true',
                status: '1',
            });

            if (response.success && response.data?.newArticles) {
                const newArticles = response.data.newArticles;
                setArticles(prev => [...prev, ...newArticles]);
                setPage(prev => prev + 1);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error loading more articles:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initialize pagination from initial articles
    useEffect(() => {
        if (initialArticles.length > 0 && !pagination) {
            setPagination({
                currentPage: 1,
                totalPages: Math.ceil(initialArticles.length / 12),
                totalArticles: initialArticles.length,
                limit: 12,
            });
        }
    }, [initialArticles]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-7 py-3">
                    <Breadcrumbs
                        classNames={{
                            list: "gap-2",
                            item: "text-sm data-[current=true]:text-blue-600 data-[current=true]:font-semibold"
                        }}
                    >
                        <BreadcrumbItem href="/">
                            <div className="flex items-center gap-1">
                                <Home size={14} />
                                <span>होम</span>
                            </div>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrent>Breaking News</BreadcrumbItem>
                    </Breadcrumbs>
                </div>
            </div>

            {/* Category Header */}
            <div className="border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-2xl">
                                <AlertCircle size={32} className="text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    Breaking News
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Get the latest breaking news and urgent updates as they happen
                                </p>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-4">
                            <Button 
                                isIconOnly 
                                variant="light" 
                                color="default"
                                onClick={async () => {
                                    const url = typeof window !== 'undefined' ? window.location.href : '';
                                    if (navigator.share) {
                                        try {
                                            await navigator.share({
                                                title: 'Breaking News',
                                                text: 'Check out breaking news',
                                                url: url,
                                            });
                                        } catch (err) {
                                            if (err.name !== 'AbortError') {
                                                try {
                                                    await navigator.clipboard.writeText(url);
                                                    alert('Link copied to clipboard!');
                                                } catch (clipboardErr) {
                                                    console.log("Error copying:", clipboardErr);
                                                }
                                            }
                                        }
                                    } else {
                                        try {
                                            await navigator.clipboard.writeText(url);
                                            alert('Link copied to clipboard!');
                                        } catch (clipboardErr) {
                                            console.log("Error copying:", clipboardErr);
                                        }
                                    }
                                }}
                            >
                                <Share2 size={20} />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    {pagination && (
                        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-gray-700 font-medium">
                                    {(pagination.totalArticles || articles.length).toLocaleString()} Articles
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-500" />
                                <span className="text-gray-700">Live Updates</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye size={16} className="text-blue-500" />
                                <span className="text-gray-700">Breaking Now</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Main Content */}
                    <main className="w-full lg:w-2/3">
                        {initialLoading ? (
                            <ArticleListShimmer count={6} />
                        ) : articles.length > 0 ? (
                            <div className="space-y-6">
                                {articles.map((article, index) => {
                                    const articleCategory = typeof article.category === 'object' && article.category !== null
                                        ? (article.category.name || 'News')
                                        : (typeof article.category === 'string' ? article.category : 'News');

                                    return (
                                        <Card
                                            key={article._id || article.id || `article-${index}`}
                                            className="hover:shadow-md transition-shadow duration-200"
                                        >
                                            <CardBody className="p-6">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    {/* Image */}
                                                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                                                        {article.featuredImage ? (
                                                            <img
                                                                src={article.featuredImage}
                                                                alt={article.title || "Article image"}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-linear-to-br from-gray-300 to-gray-200 flex items-center justify-center">
                                                                <Landmark size={32} className="text-white/80" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        {/* Meta */}
                                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                            <Chip size="sm" variant="solid" color="danger">
                                                                Breaking
                                                            </Chip>

                                                            <Chip size="sm" variant="flat" color="primary">
                                                                {articleCategory}
                                                            </Chip>

                                                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                                <Calendar size={14} />
                                                                <span>
                                                                    {article.publishDate || article.publishedAt
                                                                        ? new Date(
                                                                            article.publishDate || article.publishedAt
                                                                        ).toLocaleDateString("en-IN", {
                                                                            day: "numeric",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        })
                                                                        : "Recent"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-red-400 cursor-pointer line-clamp-2">
                                                            <Link href={buildArticleUrl(article)}>
                                                                {article.title || `News Article ${index + 1}`}
                                                            </Link>
                                                        </h3>

                                                        <p className="text-gray-600 mb-4 line-clamp-2">
                                                            {article.excerpt || "Read the full story for detailed coverage and analysis."}
                                                        </p>

                                                        {/* Footer */}
                                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                                            {/* Author */}
                                                            {/* <div className="flex items-center gap-3">
                                                                <Avatar
                                                                    size="sm"
                                                                    name={article.author || "SR"}
                                                                    className="bg-blue-100 text-blue-600"
                                                                />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {article.author || "Staff Reporter"}
                                                                    </p>
                                                                </div>
                                                            </div> */}

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-4">
                                                                <Button
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="primary"
                                                                    as={Link}
                                                                    href={buildArticleUrl(article)}
                                                                >
                                                                    Read Full
                                                                </Button>

                                                                <div className="flex items-center gap-1 text-gray-500">
                                                                    <Eye size={14} />
                                                                    <span className="text-xs">{article.views || 0}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>

                                    );
                                })}



                                {/* Load More Button */}
                                {pagination && pagination.currentPage < pagination.totalPages && (
                                    <div className="text-center mt-12">
                                        <Button
                                            color="danger"
                                            variant="solid"
                                            size="lg"
                                            onClick={loadMore}
                                            isLoading={loading}
                                            disabled={loading}
                                            className="font-semibold px-8"
                                        >
                                            {loading ? "Loading..." : "Load More Articles"}
                                        </Button>
                                        <p className="text-gray-600 mt-4 text-sm">
                                            Showing {articles.length} of {pagination.totalArticles.toLocaleString()} articles
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Card className="border-0 shadow-lg bg-linear-to-br from-white to-gray-50">
                                <CardBody className="py-20 px-8">
                                    <div className="max-w-md mx-auto text-center">
                                        <div className="relative mb-8 inline-block">
                                            <div className="absolute inset-0 bg-red-500/10 rounded-full blur-2xl animate-pulse"></div>
                                            <div className="relative w-24 h-24 bg-linear-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                                                <AlertCircle size={40} className="text-red-600" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                            No Breaking News
                                        </h3>
                                        <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
                                            There are no breaking news articles at the moment. Check back soon for the latest urgent updates.
                                        </p>
                                        <Button
                                            color="primary"
                                            variant="solid"
                                            size="lg"
                                            as={Link}
                                            href="/"
                                            className="font-semibold px-8 shadow-lg shadow-red-500/30"
                                            startContent={<Home size={18} />}
                                        >
                                            Explore Categories
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {/* Loading Spinner */}
                        {loading && articles.length > 0 && (
                            <div className="flex justify-center py-8">
                                <Spinner color="danger" size="lg" />
                            </div>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-1/3 space-y-6 lg:sticky lg:top-32 lg:self-start">
                        {/* Trending News */}
                        <TrendingArticles
                            articles={sidebarData.trendingArticles || []}
                            title="Trending News"
                        />

                        {/* Popular Categories (Root Categories) */}
                        <RelatedCategories
                            categories={sidebarData.rootCategories || []}
                            title="Popular Categories"
                        />
                    </aside>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-white border-t border-gray-200 mt-12">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Explore More News Categories
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Discover comprehensive coverage across all major topics and regions
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <Button color="primary" variant="flat" as={Link} href="/politics">
                                Politics
                            </Button>
                            <Button color="primary" variant="flat" as={Link} href="/country">
                                National
                            </Button>
                            <Button color="primary" variant="flat" as={Link} href="/sports">
                                Sports
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
