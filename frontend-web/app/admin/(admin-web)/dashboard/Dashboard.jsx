"use client"
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { addToast } from '@heroui/react';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem,
    Badge,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Chip,
    Switch,
    Spinner,
    Tabs,
    Tab,
    CardFooter,
    Divider,
    Progress,
    Checkbox,
    Tooltip
} from '@heroui/react';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Edit,
    Trash2,
    Eye,
    BarChart3,
    MoreVertical,
    Save,
    Send,
    Archive,
    Clock,
    AlertTriangle,
    X,
    RotateCcw,
    TrendingUp,
    FileText,
    Users,
    Zap,
    ExternalLink,
    Star,
    Crown,
    Award,
    Flame,
    ChevronDown
} from 'lucide-react';
import { genericGetApi, genericPutApi, genericDeleteApi } from '@/app/Helper';
import { toast } from '@heroui/react';
import ConfirmationModal from '@/app/Components/ConfirmationPopup';

export default function NewsDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get query params
    const pageParam = searchParams.get('page') || '1';
    const searchParam = searchParams.get('search') || '';
    const statusParam = searchParams.get('status') || 'all';
    const level0Param = searchParams.get('level0') || 'all';
    const level1Param = searchParams.get('level1') || 'all';
    const level2Param = searchParams.get('level2') || 'all';
    const startDateParam = searchParams.get('startDate') || '';
    const endDateParam = searchParams.get('endDate') || '';
    const isBreakingParam = searchParams.get('isBreaking') || '';
    const isTrendingParam = searchParams.get('isTrending') || '';
    const isFeaturedParam = searchParams.get('isFeatured') || '';
    const isTopStoryParam = searchParams.get('isTopStory') || '';

    // State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const [articleToDelete, setArticleToDelete] = useState(null);
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalArticles: 0,
        limit: 10
    });

    // Enhanced filter states
    const [searchValue, setSearchValue] = useState(searchParam);
    const [selectedStatus, setSelectedStatus] = useState(statusParam);
    const [startDate, setStartDate] = useState(startDateParam);
    const [endDate, setEndDate] = useState(endDateParam);

    // Category hierarchy states
    const [level0Category, setLevel0Category] = useState(level0Param);
    const [level1Category, setLevel1Category] = useState(level1Param);
    const [level2Category, setLevel2Category] = useState(level2Param);
    const [level1Categories, setLevel1Categories] = useState([]);
    const [level2Categories, setLevel2Categories] = useState([]);

    // Article features states
    const [selectedFeatures, setSelectedFeatures] = useState({
        isBreaking: isBreakingParam == 'true' ? true : isBreakingParam == 'false' ? false : undefined,
        isTrending: isTrendingParam == 'true' ? true : isTrendingParam == 'false' ? false : undefined,
        isFeatured: isFeaturedParam == 'true' ? true : isFeaturedParam == 'false' ? false : undefined,
        isTopStory: isTopStoryParam == 'true' ? true : isTopStoryParam == 'false' ? false : undefined,
    });

    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        draft: 0,
        archived: 0,
        breaking: 0,
        trending: 0,
        featured: 0,
        topStories: 0,
    });

    // Status options
    const statusOptions = [
        { key: 'all', label: 'All Status' },
        { key: '0', label: 'Draft' },
        { key: '1', label: 'Published' },
        { key: '2', label: 'Archived' }
    ];

    // Feature options for filter
    const featureOptions = [
        { key: 'isBreaking', label: 'Breaking News', icon: AlertTriangle, color: 'red' },
        { key: 'isTrending', label: 'Trending', icon: Flame, color: 'orange' },
        { key: 'isFeatured', label: 'Featured', icon: Star, color: 'blue' },
        { key: 'isTopStory', label: 'Top Story', icon: Crown, color: 'purple' }
    ];

    // Update query params without page jump
    const updateQueryParams = useCallback((updates) => {
        const params = new URLSearchParams(searchParams.toString());

        // Remove search from params first, then add it at the top
        if (updates.search !== undefined) {
            params.delete("search");
            if (updates.search) {
                const newParams = new URLSearchParams();
                newParams.set("search", updates.search);
                for (const [key, value] of params.entries()) {
                    if (key !== "search") {
                        newParams.set(key, value);
                    }
                }
                Object.keys(updates).forEach((key) => {
                    if (key !== "search" && updates[key] !== undefined) {
                        if (!updates[key] || updates[key] == "all" || updates[key] == undefined) {
                            newParams.delete(key);
                        } else {
                            newParams.set(key, updates[key]);
                        }
                    }
                });
                router.push("?" + newParams.toString(), { scroll: false }); // Added scroll: false
                return;
            }
        }

        // Update other params
        Object.keys(updates).forEach((key) => {
            if (!updates[key] || updates[key] == "all" || updates[key] == undefined) {
                params.delete(key);
            } else {
                params.set(key, updates[key]);
            }
        });

        // Always reset to page 1 when filters change (except when page itself changes)
        if (!updates.page) {
            params.delete("page");
        }

        router.push("?" + params.toString(), { scroll: false }); // Added scroll: false
    }, [searchParams, router]);


    // Fetch articles with enhanced filters
    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: pageParam,
                limit: 10,
            };

            // Add search (should be first in query string)
            if (searchParam) {
                params.search = searchParam;
            }
            if (statusParam && statusParam !== 'all') {
                params.status = statusParam;
            }

            // Add category hierarchy filters
            if (level0Param && level0Param !== 'all') {
                params.level0Category = level0Param;
            }
            if (level1Param && level1Param !== 'all') {
                params.level1Category = level1Param;
            }
            if (level2Param && level2Param !== 'all') {
                params.level2Category = level2Param;
            }

            // Add date range filters
            if (startDateParam) {
                params.startDate = startDateParam;
            }
            if (endDateParam) {
                params.endDate = endDateParam;
            }

            // Add feature filters
            if (isBreakingParam !== '') {
                params.isBreaking = isBreakingParam;
            }
            if (isTrendingParam !== '') {
                params.isTrending = isTrendingParam;
            }
            if (isFeaturedParam !== '') {
                params.isFeatured = isFeaturedParam;
            }
            if (isTopStoryParam !== '') {
                params.isTopStory = isTopStoryParam;
            }

            const response = await genericGetApi('/api/articles', params);

            if (response.success && response.data) {
                setArticles(response.data.newArticles || []);
                setPagination(response.data.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalArticles: 0,
                    limit: 10
                });
            } else {
                toast.error(response.message || 'Failed to fetch articles');
                setArticles([]);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            toast.error('An error occurred while fetching articles');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, [
        pageParam, searchParam, statusParam, level0Param, level1Param, level2Param,
        startDateParam, endDateParam, isBreakingParam, isTrendingParam, isFeaturedParam, isTopStoryParam
    ]);

    // Fetch categories with hierarchy
    const fetchCategories = useCallback(async () => {
        try {
            const response = await genericGetApi('/api/categories');
            if (response.success && response.data) {
                setCategories(response.data || []);

                // Initialize level 1 categories based on current level0 selection
                if (level0Param && level0Param !== 'all') {
                    const level1Cats = response.data.filter(cat =>
                        cat.parent == level0Param || cat.level == 1
                    );
                    setLevel1Categories(level1Cats);

                    // Initialize level 2 categories based on current level1 selection
                    if (level1Param && level1Param !== 'all') {
                        const level2Cats = response.data.filter(cat =>
                            cat.parent == level1Param || cat.level == 2
                        );
                        setLevel2Categories(level2Cats);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, [level0Param, level1Param]);

    // Add fetch stats function
    const fetchStats = useCallback(async () => {
        try {
            const response = await genericGetApi('/api/articles/stats');
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);


    // Load data on mount and when query params change
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    // Load stats on mount
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Sync local state with query params
    useEffect(() => {
        setSearchValue(searchParam);
        setSelectedStatus(statusParam);
        setLevel0Category(level0Param);
        setLevel1Category(level1Param);
        setLevel2Category(level2Param);
        setStartDate(startDateParam);
        setEndDate(endDateParam);
        setSelectedFeatures({
            isBreaking: isBreakingParam == 'true' ? true : isBreakingParam == 'false' ? false : undefined,
            isTrending: isTrendingParam == 'true' ? true : isTrendingParam == 'false' ? false : undefined,
            isFeatured: isFeaturedParam == 'true' ? true : isFeaturedParam == 'false' ? false : undefined,
            isTopStory: isTopStoryParam == 'true' ? true : isTopStoryParam == 'false' ? false : undefined,
        });
    }, [searchParam, statusParam, level0Param, level1Param, level2Param, startDateParam, endDateParam, isBreakingParam, isTrendingParam, isFeaturedParam, isTopStoryParam]);

    // Handle category hierarchy changes
    const handleLevel0Change = (value) => {
        setLevel0Category(value);
        setLevel1Category('all');
        setLevel2Category('all');
        setLevel1Categories([]);
        setLevel2Categories([]);

        if (value && value !== 'all') {
            const level1Cats = categories.filter(cat =>
                cat.parent == value || cat.level == 1
            );
            setLevel1Categories(level1Cats);
        }

        updateQueryParams({
            level0: value,
            level1: 'all',
            level2: 'all'
        });
    };

    const handleLevel1Change = (value) => {
        setLevel1Category(value);
        setLevel2Category('all');
        setLevel2Categories([]);

        if (value && value !== 'all') {
            const level2Cats = categories.filter(cat =>
                cat.parent == value || cat.level == 2
            );
            setLevel2Categories(level2Cats);
        }

        updateQueryParams({
            level1: value,
            level2: 'all'
        });
    };

    const handleLevel2Change = (value) => {
        setLevel2Category(value);
        updateQueryParams({ level2: value });
    };

    // Handle date range changes
    const handleStartDateChange = (value) => {
        setStartDate(value);
        updateQueryParams({ startDate: value });
    };

    const handleEndDateChange = (value) => {
        setEndDate(value);
        updateQueryParams({ endDate: value });
    };

    // Handle feature filter changes
    const handleFeatureChange = (feature, value) => {
        const newFeatures = {
            ...selectedFeatures,
            [feature]: value
        };
        setSelectedFeatures(newFeatures);
        updateQueryParams({ [feature]: value !== undefined ? value.toString() : '' });
    };

    // Handle search
    const handleSearch = () => {
        updateQueryParams({ search: searchValue });
    };

    // Handle search input key press
    const handleSearchKeyPress = (e) => {
        if (e.key == 'Enter') {
            handleSearch();
        }
    };

    // Handle filter changes
    const handleStatusChange = (value) => {
        setSelectedStatus(value);
        updateQueryParams({ status: value });
    };

    // Reset all filters
    const handleReset = () => {
        setSearchValue('');
        setSelectedStatus('all');
        setLevel0Category('all');
        setLevel1Category('all');
        setLevel2Category('all');
        setStartDate('');
        setEndDate('');
        setSelectedFeatures({
            isBreaking: undefined,
            isTrending: undefined,
            isFeatured: undefined,
            isTopStory: undefined,
        });
        setLevel1Categories([]);
        setLevel2Categories([]);

        updateQueryParams({
            search: '',
            status: 'all',
            level0: 'all',
            level1: 'all',
            level2: 'all',
            startDate: '',
            endDate: '',
            isBreaking: '',
            isTrending: '',
            isFeatured: '',
            isTopStory: '',
            page: '1'
        });
    };

    // Handle pagination
    const handlePageChange = (page) => {
        updateQueryParams({ page: page.toString() });
    };

    // Get level 0 categories (root categories)
    const level0Categories = categories.filter(cat =>
        cat.level == 0 || !cat.parent
    );

    const updateArticleStatus = async (articleId, newStatus) => {
        try {
            const response = await genericPutApi(`/api/articles/${articleId}`, {
                status: parseInt(newStatus)
            });
            if (response.success) {
                setArticles(prevArticles =>
                    prevArticles.map(article =>
                        article._id == articleId
                            ? { ...article, status: parseInt(newStatus) }
                            : article
                    )
                );
                fetchStats(); // Refresh stats
                addToast({
                    title: 'Success',
                    description: 'Article status updated successfully',
                    color: 'success'
                });
            }
        } catch (error) {
            console.error('Error updating article status:', error);
            addToast({
                title: 'Error',
                description: 'An error occurred while updating article status',
                color: 'danger'
            });
        }
    };

    const handleDeleteArticle = async (articleId) => {
        setArticleToDelete(articleId);
        onDeleteOpen();
    };

    // Delete article
    // Confirm delete article
    const confirmDeleteArticle = async () => {
        if (!articleToDelete) return;
        try {
            const response = await genericDeleteApi(`/api/articles/${articleToDelete}`);
            if (response.success) {
                setArticles(prevArticles =>
                    prevArticles.filter(article => article._id !== articleToDelete)
                );
                setPagination(prev => ({
                    ...prev,
                    totalArticles: prev.totalArticles - 1
                }));
                addToast({
                    title: 'Success',
                    description: 'Article deleted successfully',
                    color: 'success'
                });
                onDeleteOpenChange(false);
                setArticleToDelete(null);
            } else {
                addToast({
                    title: 'Error',
                    description: response.message || 'Failed to delete article',
                    color: 'danger'
                });
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            addToast({
                title: 'Error',
                description: 'An error occurred while deleting article',
                color: 'danger'
            });
            onDeleteOpenChange(false);
            setArticleToDelete(null);
        }
    };

    // Toggle article features
    const toggleArticleFeature = async (articleId, feature, currentValue) => {
        try {
            const response = await genericPutApi(`/api/articles/${articleId}`, {
                [feature]: !currentValue
            });
            if (response.success) {
                setArticles(prevArticles =>
                    prevArticles.map(article =>
                        article._id == articleId
                            ? { ...article, [feature]: !currentValue }
                            : article
                    )
                );
                fetchStats(); // Refresh stats
                addToast({
                    title: 'Success',
                    description: `${feature.replace('is', '').replace(/([A-Z])/g, ' $1')} status updated`,
                    color: 'success'
                });
            }
        } catch (error) {
            console.error(`Error updating ${feature}:`, error);
            addToast({
                title: 'Error',
                description: `An error occurred while updating ${feature}`,
                color: 'danger'
            });
        }
    };

    // Calculate stats
    const draftArticles = articles.filter(article => article.status == 0);
    const publishedArticles = articles.filter(article => article.status == 1);
    const breakingNewsArticles = articles.filter(article => article.isBreaking);
    const trendingArticles = articles.filter(article => article.isTrending);
    const featuredArticles = articles.filter(article => article.isFeatured);
    const topStoryArticles = articles.filter(article => article.isTopStory);
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);

    const statusColors = {
        1: { color: 'success', variant: 'flat', class: 'bg-green-100 text-green-800 border-green-200' },
        0: { color: 'warning', variant: 'flat', class: 'bg-amber-100 text-amber-800 border-amber-200' },
        2: { color: 'default', variant: 'flat', class: 'bg-gray-100 text-gray-800 border-gray-200' }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 0: return <Clock size={14} />;
            case 1: return <Eye size={14} />;
            case 2: return <Archive size={14} />;
            default: return null;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 0: return 'Draft';
            case 1: return 'Published';
            case 2: return 'Archived';
            default: return 'Unknown';
        }
    };


    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 text-gray-800 p-4 lg:p-6">
            {/* Enhanced Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                        News Dashboard
                    </h1>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Button
                        color="primary"
                        startContent={<Plus size={18} />}
                        onPress={() => router.push('/admin/create-article')}
                        className="bg-gradient-to-r from-gray-900 to-blue-800 text-white hover:from-gray-800 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-900/20 backdrop-blur-sm"
                    >
                        New Article
                    </Button>
                </div>
            </div>

            {/* Enhanced Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                                    <FileText size={16} className="text-gray-400" />
                                    Total Articles
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                                <FileText size={24} className="text-gray-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-green-200/50 shadow-lg shadow-green-900/5 hover:shadow-xl hover:shadow-green-900/10 transition-all duration-300">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl lg:text-3xl font-bold text-green-600">{stats.published}</p>
                                <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                                    <Eye size={16} className="text-green-400" />
                                    Published
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                                <Eye size={24} className="text-green-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50 shadow-lg shadow-amber-900/5 hover:shadow-xl hover:shadow-amber-900/10 transition-all duration-300">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl lg:text-3xl font-bold text-amber-500">{stats.draft}</p>
                                <p className="text-amber-600 text-sm font-medium flex items-center gap-2 mt-1">
                                    <Clock size={16} className="text-amber-500" />
                                    Drafts
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                                <Clock size={24} className="text-amber-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-red-200/50 shadow-lg shadow-red-900/5 hover:shadow-xl hover:shadow-red-900/10 transition-all duration-300">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl lg:text-3xl font-bold text-red-600">{stats.breaking}</p>
                                <p className="text-red-600 text-sm font-medium flex items-center gap-2 mt-1">
                                    <Zap size={16} className="text-red-500" />
                                    Breaking News
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl">
                                <Zap size={24} className="text-red-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Feature Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
                <Card className="bg-white/80 backdrop-blur-sm border border-orange-200/50 shadow-lg shadow-orange-900/5">
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl font-bold text-orange-600">{stats.trending}</p>
                                <p className="text-orange-600 text-sm flex items-center gap-2 mt-1">
                                    <Flame size={14} className="text-orange-500" />
                                    Trending
                                </p>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Flame size={20} className="text-orange-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-blue-200/50 shadow-lg shadow-blue-900/5">
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl font-bold text-blue-600">{stats.featured}</p>
                                <p className="text-blue-600 text-sm flex items-center gap-2 mt-1">
                                    <Star size={14} className="text-blue-500" />
                                    Featured
                                </p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Star size={20} className="text-blue-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-purple-200/50 shadow-lg shadow-purple-900/5">
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl font-bold text-purple-600">{stats.topStories}</p>
                                <p className="text-purple-600 text-sm flex items-center gap-2 mt-1">
                                    <Crown size={14} className="text-purple-500" />
                                    Top Stories
                                </p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Crown size={20} className="text-purple-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Content - Articles Table */}
                <div className="lg:col-span-2">
                    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-900/5">
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-0">
                            <div className="space-y-1">
                                <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Article Management</h2>
                                <p className="text-gray-600 text-sm">Manage articles and features in real-time</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Input
                                    placeholder="Search articles..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyPress={handleSearchKeyPress}
                                    startContent={<Search size={18} className="text-gray-400" />}
                                    className="max-w-xs bg-white/50 border-gray-300 backdrop-blur-sm"
                                    variant="bordered"
                                />
                                <Button
                                    isIconOnly
                                    variant="bordered"
                                    onPress={handleSearch}
                                    className="border-gray-300 hover:bg-gray-50 transition-colors backdrop-blur-sm"
                                >
                                    <Search size={18} className="text-gray-600" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-6">
                            {/* Enhanced Filters with Advanced Options */}
                            <div className="space-y-4 mb-6">
                                {/* Basic Filters Row */}
                                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                                    <Select
                                        label="Status"
                                        className="min-w-[150px]"
                                        selectedKeys={[selectedStatus]}
                                        onSelectionChange={(keys) => {
                                            const value = Array.from(keys)[0] || 'all';
                                            handleStatusChange(value);
                                        }}
                                        variant="bordered"
                                        classNames={{
                                            trigger: "bg-white/50 backdrop-blur-sm"
                                        }}
                                    >
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status.key} value={status.key}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Select Top Category"
                                        className="min-w-[180px]"
                                        selectedKeys={level0Category !== 'all' ? [level0Category] : []}
                                        onSelectionChange={(keys) => {
                                            const value = Array.from(keys)[0] || 'all';
                                            handleLevel0Change(value);
                                        }}
                                        variant="bordered"
                                        classNames={{
                                            trigger: "bg-white/50 backdrop-blur-sm"
                                        }}
                                    >
                                        <SelectItem key="all" value="all">All Articles</SelectItem>
                                        {level0Categories.map((category) => (
                                            <SelectItem key={category._id} value={category._id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Select Sub Category"
                                        className="min-w-[180px]"
                                        selectedKeys={level1Category !== 'all' ? [level1Category] : []}
                                        onSelectionChange={(keys) => {
                                            const value = Array.from(keys)[0] || 'all';
                                            handleLevel1Change(value);
                                        }}
                                        variant="bordered"
                                        isDisabled={!level0Category || level0Category == 'all'}
                                        classNames={{
                                            trigger: "bg-white/50 backdrop-blur-sm"
                                        }}
                                    >
                                        <SelectItem key="all" value="all">All Sub Category</SelectItem>
                                        {level1Categories.map((category) => (
                                            <SelectItem key={category._id} value={category._id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Button
                                        isIconOnly
                                        variant="bordered"
                                        onPress={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                                        className="border-gray-300 hover:bg-gray-50 transition-colors h-14 backdrop-blur-sm"
                                        aria-label="More filters"
                                    >
                                        <Filter size={20} />
                                    </Button>
                                </div>

                                {/* Advanced Filters */}
                                {advancedFiltersOpen && (
                                    <div className="p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-200/50 space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Filter size={18} className="text-blue-600" />
                                                <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
                                            </div>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                onPress={() => setAdvancedFiltersOpen(false)}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Level 2 Category */}
                                            <Select
                                                label="Level 2 Category"
                                                selectedKeys={level2Category !== 'all' ? [level2Category] : []}
                                                onSelectionChange={(keys) => {
                                                    const value = Array.from(keys)[0] || 'all';
                                                    handleLevel2Change(value);
                                                }}
                                                variant="bordered"
                                                isDisabled={!level1Category || level1Category == 'all'}
                                                classNames={{
                                                    trigger: "bg-white/50 backdrop-blur-sm"
                                                }}
                                            >
                                                <SelectItem key="all" value="all">All Level 2</SelectItem>
                                                {level2Categories.map((category) => (
                                                    <SelectItem key={category._id} value={category._id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>

                                            {/* Date Range */}
                                            <div className="flex gap-2">
                                                <Input
                                                    type="date"
                                                    label="Start Date"
                                                    value={startDate}
                                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                                    variant="bordered"
                                                    classNames={{
                                                        inputWrapper: "bg-white/50 backdrop-blur-sm"
                                                    }}
                                                />
                                                <Input
                                                    type="date"
                                                    label="End Date"
                                                    value={endDate}
                                                    onChange={(e) => handleEndDateChange(e.target.value)}
                                                    variant="bordered"
                                                    classNames={{
                                                        inputWrapper: "bg-white/50 backdrop-blur-sm"
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Article Features */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-gray-700">Article Features</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {featureOptions.map((feature) => (
                                                    <div key={feature.key} className="flex items-center gap-2 p-3 bg-white/50 rounded-lg border border-gray-200">
                                                        <Checkbox
                                                            isSelected={selectedFeatures[feature.key] == true}
                                                            onValueChange={(isSelected) => handleFeatureChange(feature.key, isSelected ? true : undefined)}
                                                            color="primary"
                                                        />
                                                        <feature.icon size={16} className={`text-${feature.color}-500`} />
                                                        <span className="text-sm text-gray-700">{feature.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Reset Button */}
                                        <div className="flex justify-end pt-2">
                                            <Button
                                                variant="bordered"
                                                startContent={<RotateCcw size={16} />}
                                                onPress={handleReset}
                                                className="border-gray-300 hover:bg-gray-50 transition-colors"
                                            >
                                                Reset All Filters
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Articles Table */}
                            {loading ? (
                                <div className="flex justify-center items-center py-16 min-h-[700px] scroll-mt-32">
                                    <div className="text-center space-y-4">
                                        <Spinner size="lg" classNames={{ circle1: "border-b-gray-900", circle2: "border-b-gray-900" }} />
                                        <p className="text-gray-600">Loading articles...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Table Container with Minimum Height */}
                                    <div className="min-h-[600px] scroll-mt-32">
                                        <div className="rounded-lg border border-gray-200/50 overflow-hidden">
                                            <Table
                                                aria-label="Articles table"
                                                className="text-gray-800"
                                                removeWrapper
                                            >
                                                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                    <TableColumn className="font-semibold text-gray-900 py-4 text-sm">ARTICLE</TableColumn>
                                                    <TableColumn className="font-semibold text-gray-900 py-4 text-sm">STATUS</TableColumn>
                                                    <TableColumn className="font-semibold text-gray-900 py-4 text-sm">FEATURES</TableColumn>
                                                    <TableColumn className="font-semibold text-gray-900 py-4 text-sm">ACTIONS</TableColumn>
                                                </TableHeader>
                                                <TableBody emptyContent={
                                                    <div className="text-center py-12 min-h-96">
                                                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                                                        <p className="text-gray-600 text-lg">No articles found</p>
                                                        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or create a new article</p>
                                                    </div>
                                                }>
                                                    {articles.map((article) => (
                                                        <TableRow
                                                            key={article._id}
                                                            className={`group border-b border-gray-200/50 hover:bg-gray-50/50 transition-all duration-200 ${article.isBreaking ? 'bg-red-50/50 border-l-4 border-l-red-500' : ''}`}
                                                        >
                                                            <TableCell className="py-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-3">
                                                                        <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1">
                                                                            {article.title}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <Badge variant="flat" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                                            {article.category?.name || 'Uncategorized'}
                                                                        </Badge>
                                                                        <span className="text-xs text-gray-500">by {article.author}</span>
                                                                        {article.publishDate && (
                                                                            <span className="text-xs text-gray-500">{formatDate(article.publishDate)}</span>
                                                                        )}
                                                                        {article.views > 0 && (
                                                                            <span className="text-xs text-blue-600 flex items-center gap-1">
                                                                                <Eye size={12} />
                                                                                {article.views} views
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <Chip
                                                                    color={statusColors[article.status]?.color}
                                                                    variant={statusColors[article.status]?.variant}
                                                                    startContent={getStatusIcon(article.status)}
                                                                    className={`${statusColors[article.status]?.class} border font-medium`}
                                                                >
                                                                    {getStatusLabel(parseInt(article.status))}
                                                                </Chip>
                                                            </TableCell>


                                                            <TableCell className="py-4 px-4">
                                                                <div className="flex flex-col items-start gap-3">
                                                                    {/* Breaking Toggle - Always visible, click to toggle */}
                                                                    <Tooltip content={article.isBreaking ? "Click to remove Breaking" : "Click to mark as Breaking"} placement="top">
                                                                        <button
                                                                            onClick={() => toggleArticleFeature(article._id, 'isBreaking', article.isBreaking)}
                                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all ${article.isBreaking
                                                                                ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
                                                                                : 'border-2 border-dashed border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500'
                                                                                }`}
                                                                        >
                                                                            {article.isBreaking ? (
                                                                                <>
                                                                                    <AlertTriangle size={13} />
                                                                                    Breaking
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <AlertTriangle size={13} />
                                                                                    <span className="opacity-60">Breaking</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    </Tooltip>

                                                                    {/* Feature Badges - Display only with tooltips */}
                                                                    <div className="flex items-center gap-2">
                                                                        {article.isTrending && (
                                                                            <Tooltip content="Trending" placement="top">
                                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded border border-orange-200 cursor-help">
                                                                                    <Flame size={12} />
                                                                                </span>
                                                                            </Tooltip>
                                                                        )}
                                                                        {article.isFeatured && (
                                                                            <Tooltip content="Featured" placement="top">
                                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded border border-blue-200 cursor-help">
                                                                                    <Star size={12} />
                                                                                </span>
                                                                            </Tooltip>
                                                                        )}
                                                                        {article.isTopStory && (
                                                                            <Tooltip content="Top Story" placement="top">
                                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded border border-purple-200 cursor-help">
                                                                                    <Crown size={12} />
                                                                                </span>
                                                                            </Tooltip>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell className="py-4">
                                                                <div className="flex gap-1 items-center">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="light"
                                                                        className="text-gray-600 min-w-10 h-10"
                                                                        onPress={() => router.push(`/article/${article.slug || article._id}`)}
                                                                        isIconOnly
                                                                    >
                                                                        <ExternalLink size={16} />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="light"
                                                                        className="text-gray-600 min-w-10 h-10"
                                                                        onPress={() => router.push(`/admin/create-article?articleId=${article._id}`)}
                                                                        isIconOnly
                                                                    >
                                                                        <Edit size={16} />
                                                                    </Button>

                                                                    <Dropdown>
                                                                        <DropdownTrigger>
                                                                            <Button isIconOnly size="sm" variant="light" className="text-gray-600 min-w-10 h-10">
                                                                                <MoreVertical size={16} />
                                                                            </Button>
                                                                        </DropdownTrigger>
                                                                        <DropdownMenu
                                                                            aria-label="Article actions"
                                                                            variant="flat"
                                                                        >
                                                                            {/* Feature Toggles */}
                                                                            {featureOptions.filter(f => f.key !== 'isBreaking').map((feature) => (
                                                                                <DropdownItem
                                                                                    key={feature.key}
                                                                                    startContent={<feature.icon size={16} />}
                                                                                    onPress={() => toggleArticleFeature(article._id, feature.key, article[feature.key])}
                                                                                    className={article[feature.key] ? `text-${feature.color}-600` : 'text-gray-600'}
                                                                                >
                                                                                    {article[feature.key] ? `Remove ${feature.label}` : `Mark as ${feature.label}`}
                                                                                </DropdownItem>
                                                                            ))}
                                                                            {article.status == 0 && (
                                                                                <DropdownItem
                                                                                    key="publish"
                                                                                    startContent={<Send size={16} />}
                                                                                    onPress={() => updateArticleStatus(article._id, 1)}
                                                                                    className="text-green-600"
                                                                                >
                                                                                    Publish
                                                                                </DropdownItem>
                                                                            )}
                                                                            {article.status == 1 && (
                                                                                <DropdownItem
                                                                                    key="draft"
                                                                                    startContent={<Save size={16} />}
                                                                                    onPress={() => updateArticleStatus(article._id, 0)}
                                                                                    className="text-amber-600"
                                                                                >
                                                                                    Save as Draft
                                                                                </DropdownItem>
                                                                            )}
                                                                            <DropdownItem
                                                                                key="delete"
                                                                                startContent={<Trash2 size={16} />}
                                                                                onPress={() => handleDeleteArticle(article._id)}
                                                                                className="text-red-600"
                                                                            >
                                                                                Delete
                                                                            </DropdownItem>
                                                                        </DropdownMenu>
                                                                    </Dropdown>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                                        <p className="text-gray-600 text-sm">
                                            Showing {articles.length} of {pagination.totalArticles} articles
                                        </p>
                                        <Pagination
                                            total={pagination.totalPages}
                                            page={pagination.currentPage}
                                            onChange={handlePageChange}
                                            color="primary"
                                            variant="flat"
                                            classNames={{
                                                item: "bg-white/50 text-gray-700",
                                                cursor: "bg-gradient-to-r from-gray-900 to-gray-700 text-white"
                                            }}
                                        />
                                    </div>
                                </>

                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* Enhanced Sidebar */}
                <div className="space-y-6 lg:space-y-8">
                    {/* Draft Articles Panel */}
                    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-900/5">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <Clock size={20} className="text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Draft Articles</h3>
                                </div>
                                <span className="px-2.5 ms-2 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full border border-amber-200">
                                    {draftArticles.length}
                                </span>
                            </div>

                        </CardHeader>
                        <div className={`space-y-3 ${draftArticles.length > 3 ? 'max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-50 hover:scrollbar-thumb-amber-400' : ''}`}>
                            <CardBody className="pt-0 space-y-3">
                                {draftArticles.length == 0 ? (
                                    <div className="text-center py-6">
                                        <Clock className="mx-auto text-gray-400 mb-3" size={32} />
                                        <p className="text-gray-500 text-sm">No draft articles</p>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="warning"
                                            className="mt-3"
                                            onPress={() => router.push('/admin/create-article')}
                                        >
                                            Create Draft
                                        </Button>
                                    </div>
                                ) : (
                                    draftArticles.slice(0, 5).map((draft) => (
                                        <div key={draft._id} className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl group hover:shadow-lg transition-all duration-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <Badge color="warning" size="sm" variant="flat" className="border-amber-300">DRAFT</Badge>
                                                <span className="text-xs text-amber-600">
                                                    {draft.createdAt && formatDate(draft.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2">{draft.title}</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-amber-500 text-white text-xs h-8 hover:bg-amber-600 transition-colors"
                                                    onPress={() => updateArticleStatus(draft._id, 1)}
                                                >
                                                    <Send size={14} className="mr-1" />
                                                    Publish
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="bordered"
                                                    className="border-amber-300 text-amber-700 text-xs h-8 hover:bg-amber-50 transition-colors"
                                                    onPress={() => router.push(`/admin/create-article?articleId=${draft._id}`)}
                                                >
                                                    <Edit size={14} className="mr-1" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {draftArticles.length > 5 && (
                                    <CardFooter className="px-0 pb-0 pt-4">
                                        <Button
                                            variant="light"
                                            color="warning"
                                            fullWidth
                                            onPress={() => handleStatusChange('0')}
                                        >
                                            View All Drafts ({draftArticles.length})
                                        </Button>
                                    </CardFooter>
                                )}
                            </CardBody>
                        </div>
                    </Card>

                    {/* Breaking News Manager */}
                    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-900/5">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <AlertTriangle size={20} className="text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Breaking News</h3>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 ms-3 bg-red-100 text-red-700 text-sm font-semibold rounded-lg border border-red-300 shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                    {breakingNewsArticles.length} Active
                                </span>

                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className={`space-y-3 ${breakingNewsArticles.length > 3 ? 'max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-50 hover:scrollbar-thumb-red-400' : ''}`}>
                                {breakingNewsArticles.length == 0 ? (
                                    <div className="text-center py-6">
                                        <AlertTriangle className="mx-auto text-gray-400 mb-3" size={32} />
                                        <p className="text-gray-500 text-sm">No active breaking news</p>
                                    </div>
                                ) : (
                                    breakingNewsArticles.map((article) => (
                                        <div key={article._id} className="p-4 bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-xl group hover:shadow-lg transition-all duration-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <Badge color="danger" size="sm" variant="flat" className="animate-pulse border-red-300">
                                                    <AlertTriangle size={12} className="mr-1" />
                                                    BREAKING
                                                </Badge>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    className="text-red-600 h-6 min-w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onPress={() => toggleArticleFeature(article._id, 'isBreaking', article.isBreaking)}
                                                >
                                                    <X size={14} />
                                                </Button>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-red-600 font-medium">{article.category?.name || 'Uncategorized'}</span>
                                                {article.views > 0 && (
                                                    <span className="text-xs text-red-500 flex items-center gap-1">
                                                        <Eye size={12} />
                                                        {article.views}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardBody>
                    </Card>



                    {/* Quick Stats */}
                    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-900/5">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BarChart3 size={20} className="text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Publish Rate</span>
                                    <span className="font-semibold text-gray-900">
                                        {pagination.totalArticles > 0
                                            ? Math.round((publishedArticles.length / pagination.totalArticles) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <Progress
                                    value={pagination.totalArticles > 0 ? (publishedArticles.length / pagination.totalArticles) * 100 : 0}
                                    color="success"
                                    className="h-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Feature Rate</span>
                                    <span className="font-semibold text-gray-900">
                                        {pagination.totalArticles > 0
                                            ? Math.round(((trendingArticles.length + featuredArticles.length + topStoryArticles.length) / pagination.totalArticles) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <Progress
                                    value={pagination.totalArticles > 0 ? ((trendingArticles.length + featuredArticles.length + topStoryArticles.length) / pagination.totalArticles) * 100 : 0}
                                    color="secondary"
                                    className="h-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
                                    <p className="text-xs text-gray-600 mt-1">Total Views</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {pagination.totalArticles > 0 ? Math.round(totalViews / pagination.totalArticles) : 0}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">Avg. Views</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteOpen}
                onOpenChange={onDeleteOpenChange}
                title="Delete Article"
                message="Are you sure you want to delete this article? This action cannot be undone."
                confirmText="Delete Article"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDeleteArticle}
                showWarning={true}
                warningText="The article will be permanently removed from the database."
            />
        </div>
    );
}