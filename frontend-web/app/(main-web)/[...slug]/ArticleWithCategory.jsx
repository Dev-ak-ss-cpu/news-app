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
import Header from "@/app/Components/Header";
import Footer from "@/app/Components/Footer";
import Link from "next/link";
import {
    Home,
    MapPin,
    Calendar,
    TrendingUp,
    Eye,
    Share2,
    Bookmark,
    Globe,
    Building,
    Landmark,
    Users
} from "lucide-react";
import { fetchCategoryData } from "./utils/routeUtils";

export default function CategoryListing({ categoryData }) {
    const [articles, setArticles] = useState(categoryData?.articles || []);
    const [pagination, setPagination] = useState(categoryData?.pagination || null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('latest');
    const [timeFilter, setTimeFilter] = useState('all');
    const category = categoryData?.category;

    // Safely handle category path data
    const categoryPath = Array.isArray(category?.path) ? category.path : [];
    const currentCategory = category?.current || {};

    const currentCategoryName = typeof currentCategory?.name === 'string'
        ? currentCategory.name
        : (typeof currentCategory === 'string' ? currentCategory : 'Category');

    const pathSegments = categoryPath.map((p) => p?.slug || '').filter(Boolean);

    // Mock data for related categories and trending topics
    const relatedCategories = [
        { name: "Elections", slug: "elections", count: 124 },
        { name: "Government", slug: "government", count: 89 },
        { name: "Policy", slug: "policy", count: 67 },
        { name: "Development", slug: "development", count: 156 }
    ];

    const trendingTopics = [
        { name: "Budget 2024", articles: 45 },
        { name: "Infrastructure", articles: 32 },
        { name: "Education", articles: 28 },
        { name: "Healthcare", articles: 23 }
    ];

    const regionalNews = [
        { state: "Uttar Pradesh", articles: 156, trending: true },
        { state: "Maharashtra", articles: 142, trending: false },
        { state: "Delhi", articles: 98, trending: true },
        { state: "Karnataka", articles: 87, trending: false }
    ];

    // FIXED: Load more articles function - appends to existing articles
    const loadMoreArticles = async (page) => {
        if (!category || loading) return;

        try {
            setLoading(true);
            const result = await fetchCategoryData(pathSegments, page, 12);

            if (result.success && result.data) {
                // Key change: Append articles instead of replacing
                setArticles((prev) => [...prev, ...(result.data.articles || [])]);
                setPagination(result.data.pagination);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error("Error loading articles:", error);
        } finally {
            setLoading(false);
        }
    };

    // Reset articles when category changes
    useEffect(() => {
        if (categoryData) {
            setArticles(categoryData.articles || []);
            setPagination(categoryData.pagination);
            setCurrentPage(1);
        }
    }, [categoryData]);

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

    if (currentCategoryName && currentCategoryName !== 'Category') {
        breadcrumbItems.push({
            href: "#",
            label: currentCategoryName,
            isCurrent: true
        });
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

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
                            <Button isIconOnly variant="light" color="default">
                                <Share2 size={20} />
                            </Button>
                            <Button isIconOnly variant="light" color="default">
                                <Bookmark size={20} />
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
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <main className="w-full lg:w-2/3">
                        {/* Filters and Controls */}
                        <Card className="mb-6">
                            <CardBody className="p-4">
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <Tabs
                                        aria-label="Filter by time"
                                        selectedKey={timeFilter}
                                        onSelectionChange={setTimeFilter}
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
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <SelectItem key="latest" value="latest">Latest</SelectItem>
                                            <SelectItem key="popular" value="popular">Most Popular</SelectItem>
                                            <SelectItem key="trending" value="trending">Trending</SelectItem>
                                        </Select>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Articles Grid */}
                        {articles.length > 0 ? (
                            <div className="space-y-6">
                                {articles.map((article, index) => {
                                    const articleCategory = typeof article.category === 'object' && article.category !== null
                                        ? (article.category.name || 'News')
                                        : (typeof article.category === 'string' ? article.category : currentCategoryName);

                                    return (
                                        <Card key={article._id || article.id || `article-${index}`} className="hover:shadow-md transition-shadow">
                                            <CardBody className="p-6">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                                                        {article.featuredImage ? (
                                                            <img
                                                                src={article.featuredImage}
                                                                alt={article.title || "Article image"}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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

                                                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                                                            {article.title || `News Article ${index + 1}`}
                                                        </h3>

                                                        <p className="text-gray-600 mb-4 line-clamp-2">
                                                            {article.description || "Read the full story for detailed coverage and analysis."}
                                                        </p>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar size="sm" className="bg-blue-100 text-blue-600" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {article.author || 'Staff Reporter'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">News Desk</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4">
                                                                <Button size="sm" variant="light" color="primary">
                                                                    Read Full
                                                                </Button>
                                                                <div className="flex items-center gap-1 text-gray-500">
                                                                    <Eye size={14} />
                                                                    <span className="text-xs">2.4k</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    );
                                })}

                                {/* FIXED: Load More Button - Same as first component */}
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
                            <Card className="text-center py-16">
                                <CardBody>
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Landmark size={24} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        No Articles Found
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        There are no articles published in {currentCategoryName} yet.
                                    </p>
                                    <Button color="primary" as={Link} href="/">
                                        Browse Other Categories
                                    </Button>
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

                    {/* Sidebar */}
                    <aside className="w-full lg:w-1/3 space-y-6">
                        {/* Related Categories */}
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                    <Users size={18} />
                                    Related Categories
                                </h3>
                                <div className="space-y-3">
                                    {relatedCategories.map((cat) => (
                                        <Link
                                            key={cat.slug}
                                            href={`/${cat.slug}`}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                            <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                                                {cat.name}
                                            </span>
                                            <Chip size="sm" variant="flat" color="default">
                                                {cat.count}
                                            </Chip>
                                        </Link>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Trending Topics */}
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp size={18} />
                                    Trending Topics
                                </h3>
                                <div className="space-y-3">
                                    {trendingTopics.map((topic, index) => (
                                        <div
                                            key={`topic-${index}`}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                <span className="text-gray-700 font-medium">{topic.name}</span>
                                            </div>
                                            <span className="text-sm text-gray-500">{topic.articles} articles</span>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Regional News */}
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin size={18} />
                                    Regional Coverage
                                </h3>
                                <div className="space-y-3">
                                    {regionalNews.map((region, index) => (
                                        <div
                                            key={`region-${index}`}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span className="text-gray-700 font-medium">{region.state}</span>
                                                {region.trending && (
                                                    <Chip size="sm" color="warning" variant="flat">Trending</Chip>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-500">{region.articles}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Newsletter Signup */}
                        <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                            <CardBody className="p-6 text-center">
                                <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
                                <p className="text-blue-100 text-sm mb-4">
                                    Get the latest news from {currentCategoryName} delivered to your inbox
                                </p>
                                <Button color="default" variant="solid" fullWidth>
                                    Subscribe to Newsletter
                                </Button>
                            </CardBody>
                        </Card>
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
                            <Button color="primary" variant="flat" as={Link} href="/uttar-pradesh">
                                Uttar Pradesh
                            </Button>
                            <Button color="primary" variant="flat" as={Link} href="/categories">
                                All Categories
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
