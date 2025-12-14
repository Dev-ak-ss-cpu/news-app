"use client";
import { useState, useEffect } from "react";
import {
    Button,
    Card,
    CardBody,
    Spinner,
    BreadcrumbItem,
    Breadcrumbs,
    Chip,
    Tabs,
    Tab,
    Select,
    SelectItem,
    Avatar
} from "@heroui/react";
import Link from "next/link";
import {
    Home,
    MapPin,
    Calendar,
    TrendingUp,
    Eye,
    Share2,
    Globe,
    Building,
    Landmark,
    Users
} from "lucide-react";
import { fetchCategoryData } from "./utils/routeUtils";
import TrendingArticles from '@/app/Components/TrendingArticles';
import RelatedArticles from '@/app/Components/RelatedArticles';
import RelatedCategories from '@/app/Components/RelatedCategories';
import { buildArticleUrl } from "@/app/utils/articleUrl";
import ArticleListShimmer from '@/app/Components/Shimmer/ArticleListShimmer'; // Add import

export default function CategoryListing({ categoryData, sidebarData = {} }) {
    const [articles, setArticles] = useState(categoryData?.articles || []);
    const [pagination, setPagination] = useState(categoryData?.pagination || null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!categoryData); // Track initial load
    const [sortBy, setSortBy] = useState('latest');
    const [timeFilter, setTimeFilter] = useState('all');
    const [isBreaking, setIsBreaking] = useState(null);      // Add this
    const [isTrending, setIsTrending] = useState(null);        // Add this
    const category = categoryData?.category;

    // Safely handle category path data
    const categoryPath = Array.isArray(category?.path) ? category.path : [];
    const currentCategory = category?.current || {};

    const currentCategoryName = typeof currentCategory?.name === 'string'
        ? currentCategory.name
        : (typeof currentCategory === 'string' ? currentCategory : 'Category');

    const pathSegments = categoryPath.map((p) => p?.slug || '').filter(Boolean);

    // Helper function to calculate date range based on time filter
    const getDateRange = (filter) => {
        const now = new Date();
        let startDate = null;
        let endDate = null;

        switch (filter) {
            case 'today':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'all':
            default:
                startDate = null;
                endDate = null;
                break;
        }

        return {
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null
        };
    };

    // Load articles with filters
    const loadArticles = async (page = 1, reset = false) => {
        if (!category || loading) return;

        try {
            setLoading(true);
            if (reset || page === 1) {
                setInitialLoading(true); // Show shimmer on filter change
            }

            // Get date range based on time filter
            const { startDate, endDate } = getDateRange(timeFilter);

            const result = await fetchCategoryData(
                pathSegments,
                page,
                12,
                startDate,
                endDate,
                sortBy,
                isBreaking,      // Add this
                isTrending        // Add this
            );

            if (result.success && result.data) {
                if (reset || page === 1) {
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
            setInitialLoading(false);
        }
    };

    // Load more articles function
    const loadMoreArticles = async (page) => {
        await loadArticles(page, false);
    };

    // Effect to reload articles when filters change
    useEffect(() => {
        if (categoryData) {
            // Reset to page 1 and reload when filters change
            loadArticles(1, true);
        }
    }, [timeFilter, sortBy, isBreaking, isTrending]);  // Add isBreaking and isTrending

    // Reset articles when category changes
    useEffect(() => {
        if (categoryData) {
            setArticles(categoryData.articles || []);
            setPagination(categoryData.pagination);
            setCurrentPage(1);
            setInitialLoading(false);
            // Reset filters to default when category changes
            setTimeFilter('all');
            setSortBy('latest');
            setIsBreaking(null);
            setIsTrending(null);
        } else {
            setInitialLoading(true);
        }
    }, [categoryData?.category?.current?._id]); // Only when category ID changes

    // Get category icon based on category name
    const getCategoryIcon = (categoryName) => {
        if (!categoryName) return Users;

        const icons = {
            'politics': Landmark,
            'country': Globe,
            'uttar-pradesh': Building,
            'maharashtra': MapPin,
            'delhi': Building,
            'default': Users
        };

        const iconName = String(categoryName).toLowerCase().replace(/\s+/g, '-');
        return icons[iconName] || icons.default;
    };

    const CategoryIcon = getCategoryIcon(currentCategoryName);

    // Build breadcrumb items with ONLY string values
    const breadcrumbItems = [
        { href: "/", label: "होम", icon: Home }
    ];

    if (Array.isArray(categoryPath) && categoryPath.length > 0) {
        categoryPath.forEach((cat, index) => {
            if (cat && typeof cat === 'object') {
                const catName = typeof cat.name === 'string' ? cat.name : `Category ${index + 1}`;
                const catSlug = typeof cat.slug === 'string' ? cat.slug : '';

                if (catSlug) {
                    const pathToCategory = categoryPath
                        .slice(0, index + 1)
                        .map(c => c?.slug || '')
                        .filter(Boolean)
                        .join("/");

                    breadcrumbItems.push({
                        href: `/${pathToCategory}`,
                        label: catName
                    });
                }
            }
        });
    }

    // if (currentCategoryName && currentCategoryName !== 'Category') {
    //     breadcrumbItems.push({
    //         href: "#",
    //         label: currentCategoryName,
    //         isCurrent: true
    //     });
    // }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* <Header /> */}

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-7 py-3 ">
                    <Breadcrumbs
                        classNames={{
                            list: "gap-2",
                            item: "text-sm data-[current=true]:text-blue-600 data-[current=true]:font-semibold"
                        }}
                    >
                        {breadcrumbItems.map((item, index) => (
                            <BreadcrumbItem
                                key={`breadcrumb-${index}`}
                                href={item.href}
                                isCurrent={item.isCurrent}
                                isDisabled={item.isCurrent}
                            >
                                {index === 0 ? (
                                    <div className="flex items-center gap-1">
                                        <Home size={14} />
                                        <span>{item.label}</span>
                                    </div>
                                ) : (
                                    item.label
                                )}
                            </BreadcrumbItem>
                        ))}
                    </Breadcrumbs>
                </div>
            </div>

            {/* Category Header */}
            <div className="border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-2xl">
                                <CategoryIcon size={32} className="text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {currentCategoryName}
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Latest news, updates, and insights about {currentCategoryName}
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
                                                title: currentCategoryName,
                                                text: `Check out ${currentCategoryName} news`,
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
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-gray-700 font-medium">
                                    {(pagination.totalArticles || 0).toLocaleString()} Articles
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-orange-500" />
                                <span className="text-gray-700">Daily Updates</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye size={16} className="text-blue-500" />
                                <span className="text-gray-700">Live Coverage</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Main Content */}
                    <main className="w-full lg:flex-1 min-w-0">
                        {/* Filters and Controls */}
                        <Card className="mb-6">
                            <CardBody className="p-4">
                                <div className="flex flex-col gap-4">
                                    {/* Time Filter Tabs */}
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                        <Tabs
                                            aria-label="Filter by time"
                                            selectedKey={timeFilter}
                                            onSelectionChange={(key) => setTimeFilter(key)}
                                            size="sm"
                                        >
                                            <Tab key="all" title="All Time" />
                                            <Tab key="today" title="Today" />
                                            <Tab key="week" title="This Week" />
                                            <Tab key="month" title="This Month" />
                                        </Tabs>

                                        <div className="flex gap-3">
                                            <Select
                                                label="Sort by"
                                                size="sm"
                                                className="min-w-32"
                                                selectedKeys={[sortBy]}
                                                onSelectionChange={(keys) => {
                                                    const selected = Array.from(keys)[0];
                                                    if (selected) setSortBy(selected);
                                                }}
                                            >
                                                <SelectItem key="latest" value="latest">Latest</SelectItem>
                                                <SelectItem key="popular" value="popular">Most Popular</SelectItem>
                                                <SelectItem key="trending" value="trending">Trending</SelectItem>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Breaking and Trending Filters */}
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="text-sm font-medium text-gray-700">Filter by:</span>
                                        <Chip
                                            size="sm"
                                            variant={isBreaking === true ? "solid" : "flat"}
                                            color={isBreaking === true ? "danger" : "default"}
                                            className="cursor-pointer"
                                            onClick={() => setIsBreaking(isBreaking === true ? null : true)}
                                        >
                                            Breaking News
                                        </Chip>
                                        <Chip
                                            size="sm"
                                            variant={isTrending === true ? "solid" : "flat"}
                                            color={isTrending === true ? "warning" : "default"}
                                            className="cursor-pointer"
                                            onClick={() => setIsTrending(isTrending === true ? null : true)}
                                        >
                                            Trending
                                        </Chip>
                                        {(isBreaking !== null || isTrending !== null) && (
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color="default"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setIsBreaking(null);
                                                    setIsTrending(null);
                                                }}
                                            >
                                                Clear Filters
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Show Shimmer on Initial Load or Filter Change */}
                        {(initialLoading || (loading && articles.length === 0)) ? (
                            <ArticleListShimmer count={6} />
                        ) : articles.length > 0 ? (
                            <div className="space-y-6">
                                {articles.map((article, index) => {
                                    const articleCategory = typeof article.category === 'object' && article.category !== null
                                        ? (article.category.name || 'News')
                                        : (typeof article.category === 'string' ? article.category : currentCategoryName);

                                    return (
                                        <Card key={article._id || article.id || `article-${index}`} className="     ">
                                            <CardBody className="p-6">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                                                        {article.featuredImage ? (
                                                            <img
                                                                src={article.featuredImage}
                                                                alt={article.title || "Article image"}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-linear-to-br from-gray-300 to-gray-200  flex items-center justify-center">
                                                                <Landmark size={32} className="text-white/80" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Chip size="sm" variant="flat" color="primary">
                                                                {articleCategory}
                                                            </Chip>
                                                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                                <Calendar size={14} />
                                                                <span>
                                                                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-red-400 cursor-pointer">
                                                            <Link href={buildArticleUrl(article)}>
                                                                {article.title || `News Article ${index + 1}`}
                                                            </Link>
                                                        </h3>

                                                        <p className="text-gray-600 mb-4 line-clamp-2">
                                                            {article.excerpt || "Read the full story for detailed coverage and analysis."}
                                                        </p>

                                                        <div className="flex items-center justify-between">
                                                            {/* <div className="flex items-center gap-3">
                                                                <Avatar size="sm" className="bg-blue-100 text-blue-600" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {article.author || 'Staff Reporter'}
                                                                    </p>
                                                                </div>
                                                            </div> */}

                                                            <div className="flex items-center gap-4">
                                                                <Button size="sm" variant="light" color="primary">
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
                                            color="primary"
                                            variant="solid"
                                            size="lg"
                                            onClick={() => loadMoreArticles(currentPage + 1)}
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
                                        {/* Icon Container with Animation */}
                                        <div className="relative mb-8 inline-block">
                                            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
                                            <div className="relative w-24 h-24 bg-linear-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                                                <Landmark size={40} className="text-blue-600" />
                                            </div>
                                            {/* Decorative dots */}
                                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"></div>
                                            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full"></div>
                                        </div>

                                        {/* Heading */}
                                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                            {timeFilter !== 'all' ? 'No Recent Articles' : 'No Articles Yet'}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
                                            {timeFilter !== 'all'
                                                ? `We couldn't find any articles ${timeFilter === 'today' ? 'published today' :
                                                    timeFilter === 'week' ? 'from this week' :
                                                        'from this month'
                                                }. Try expanding your timeframe or explore other categories.`
                                                : `There are no articles in ${currentCategoryName} at the moment. Check back soon for the latest updates and stories.`
                                            }
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                            {timeFilter !== 'all' && (
                                                <Button
                                                    color="primary"
                                                    variant="solid"
                                                    size="lg"
                                                    onPress={() => setTimeFilter('all')}
                                                    className="font-semibold px-8 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                                                    startContent={<Eye size={18} />}
                                                >
                                                    View All Articles
                                                </Button>
                                            )}
                                            <Button
                                                color={timeFilter !== 'all' ? 'default' : 'primary'}
                                                variant={timeFilter !== 'all' ? 'bordered' : 'solid'}
                                                size="lg"
                                                as={Link}
                                                href="/"
                                                className={`font-semibold px-8 ${timeFilter === 'all' ? 'shadow-lg shadow-blue-500/30' : ''}`}
                                                startContent={<Home size={18} />}
                                            >
                                                Explore Categories
                                            </Button>
                                        </div>

                                        {/* Additional Suggestions */}
                                        {timeFilter !== 'all' && (
                                            <div className="mt-10 pt-8 border-t border-gray-200">
                                                <p className="text-sm text-gray-500 mb-4 font-medium">Popular Categories</p>
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        as={Link}
                                                        href="/politics"
                                                        className="font-medium"
                                                    >
                                                        Politics
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        as={Link}
                                                        href="/country"
                                                        className="font-medium"
                                                    >
                                                        National
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        as={Link}
                                                        href="/sports"
                                                        className="font-medium"
                                                    >
                                                        Sports
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>

                        )}

                        {/* Loading Spinner */}
                        {loading && (
                            <div className="flex justify-center py-8">
                                <Spinner color="primary" size="lg" />
                            </div>
                        )}
                    </main>

                    {/* Sidebar - Increased size to match ArticleDetails */}
                    <aside className="w-full lg:w-80 lg:shrink-0 space-y-6 lg:sticky lg:-top-72 lg:self-start">
                        {/* Related Articles from Same Category */}
                        <RelatedArticles
                            articles={sidebarData.relatedArticles || []}
                            title="Other News from This Category"
                        />

                        {/* Related Categories */}
                        <RelatedCategories
                            categories={sidebarData.relatedCategories || []}
                            title="Related Categories"
                        />

                        {/* Trending Topics - Using reusable component */}
                        <TrendingArticles
                            articles={sidebarData.trendingArticles || []}
                            title="Trending Topics"
                            maxItems={5}
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
