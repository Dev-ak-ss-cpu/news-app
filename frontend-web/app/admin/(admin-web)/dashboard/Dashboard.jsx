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
    Progress
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
    ExternalLink
} from 'lucide-react';
import { genericGetApi, genericPutApi, genericDeleteApi } from '@/app/Helper';
import { toast } from '@heroui/react';

export default function NewsDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get query params
    const pageParam = searchParams.get('page') || '1';
    const searchParam = searchParams.get('search') || '';
    const statusParam = searchParams.get('status') || 'all';
    const categoryParam = searchParams.get('category') || 'all';
    const dateParam = searchParams.get('date') || '';

    // State
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [breakingNewsModal, setBreakingNewsModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalArticles: 0,
        limit: 10
    });

    // Filter states (synced with query params)
    const [searchValue, setSearchValue] = useState(searchParam);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [selectedStatus, setSelectedStatus] = useState(statusParam);
    const [selectedDate, setSelectedDate] = useState(dateParam);
    const [activeTab, setActiveTab] = useState('all');

    const [newBreakingNews, setNewBreakingNews] = useState({
        title: '',
        category: '',
        expiry: ''
    });

    // Status options (using numbers: 0=draft, 1=published, 2=archived)
    const statusOptions = [
        { key: 'all', label: 'All Status' },
        { key: '0', label: 'Draft' },
        { key: '1', label: 'Published' },
        { key: '2', label: 'Archived' }
    ];

    // Update query params
    const updateQueryParams = useCallback((updates) => {
        const params = new URLSearchParams(searchParams.toString());

        // Remove search from params first, then add it at the top
        if (updates.search !== undefined) {
            params.delete('search');
            if (updates.search) {
                // Add search at the beginning
                const newParams = new URLSearchParams();
                newParams.set('search', updates.search);
                // Add other params
                for (const [key, value] of params.entries()) {
                    if (key !== 'search') {
                        newParams.set(key, value);
                    }
                }
                // Add remaining updates
                Object.keys(updates).forEach(key => {
                    if (key !== 'search' && updates[key] !== undefined) {
                        if (updates[key] === '' || updates[key] === 'all') {
                            newParams.delete(key);
                        } else {
                            newParams.set(key, updates[key]);
                        }
                    }
                });
                router.push(`?${newParams.toString()}`);
                return;
            }
        }

        // Update other params
        Object.keys(updates).forEach(key => {
            if (updates[key] === '' || updates[key] === 'all') {
                params.delete(key);
            } else {
                params.set(key, updates[key]);
            }
        });

        // Always reset to page 1 when filters change (except when page itself changes)
        if (!updates.page) {
            params.delete('page');
        }

        router.push(`?${params.toString()}`);
    }, [searchParams, router]);

    // Fetch articles
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
            if (categoryParam && categoryParam !== 'all') {
                params.category = categoryParam;
            }
            if (dateParam) {
                params.date = dateParam;
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
    }, [pageParam, searchParam, statusParam, categoryParam, dateParam]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await genericGetApi('/api/categories');
            if (response.success && response.data) {
                setCategories(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    // Load data on mount and when query params change
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    // Sync local state with query params
    useEffect(() => {
        setSearchValue(searchParam);
        setSelectedCategory(categoryParam);
        setSelectedStatus(statusParam);
        setSelectedDate(dateParam);
    }, [searchParam, categoryParam, statusParam, dateParam]);

    // Handle search
    const handleSearch = () => {
        updateQueryParams({ search: searchValue });
    };

    // Handle search input key press
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Handle filter changes
    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        updateQueryParams({ category: value });
    };

    const handleStatusChange = (value) => {
        setSelectedStatus(value);
        updateQueryParams({ status: value });
    };

    const handleDateChange = (value) => {
        setSelectedDate(value);
        updateQueryParams({ date: value });
    };

    // Reset filters
    const handleReset = () => {
        setSearchValue('');
        setSelectedCategory('all');
        setSelectedStatus('all');
        setSelectedDate('');
        updateQueryParams({
            search: '',
            category: 'all',
            status: 'all',
            date: '',
            page: '1'
        });
    };

    // Handle pagination
    const handlePageChange = (page) => {
        updateQueryParams({ page: page.toString() });
    };

    // Update article status
    const updateArticleStatus = async (articleId, newStatus) => {
        try {
            const response = await genericPutApi(`/api/articles/${articleId}`, {
                status: parseInt(newStatus)
            });
            if (response.success) {
                // Update articles state directly using map
                setArticles(prevArticles =>
                    prevArticles.map(article =>
                        article._id === articleId
                            ? { ...article, status: parseInt(newStatus) }
                            : article
                    )
                );
                // Use addToast for success
                addToast({
                    title: 'Success',
                    description: 'Article status updated successfully',
                    variant: 'success'
                });
            } else {
                addToast({
                    title: 'Error',
                    description: response.message || 'Failed to update article status',
                    variant: 'danger'
                });
            }
        } catch (error) {
            console.error('Error updating article status:', error);
            addToast({
                title: 'Error',
                description: 'An error occurred while updating article status',
                variant: 'danger'
            });
        }
    };

    // Delete article
    const handleDeleteArticle = async (articleId) => {
        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }
        try {
            const response = await genericDeleteApi(`/api/articles/${articleId}`);
            if (response.success) {
                // Remove article from state directly using filter
                setArticles(prevArticles =>
                    prevArticles.filter(article => article._id !== articleId)
                );
                // Update pagination total
                setPagination(prev => ({
                    ...prev,
                    totalArticles: prev.totalArticles - 1
                }));
                addToast({
                    title: 'Success',
                    description: 'Article deleted successfully',
                    variant: 'success'
                });
            } else {
                addToast({
                    title: 'Error',
                    description: response.message || 'Failed to delete article',
                    variant: 'danger'
                });
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            addToast({
                title: 'Error',
                description: 'An error occurred while deleting article',
                variant: 'danger'
            });
        }
    };

    // Toggle breaking news
    const toggleBreakingNews = async (articleId, currentValue) => {
        try {
            const response = await genericPutApi(`/api/articles/${articleId}`, {
                isBreaking: !currentValue
            });
            if (response.success) {
                // Update articles state directly using map
                setArticles(prevArticles =>
                    prevArticles.map(article =>
                        article._id === articleId
                            ? { ...article, isBreaking: !currentValue }
                            : article
                    )
                );
                addToast({
                    title: 'Success',
                    description: 'Breaking news status updated',
                    variant: 'success'
                });
            } else {
                addToast({
                    title: 'Error',
                    description: response.message || 'Failed to update breaking news',
                    variant: 'danger'
                });
            }
        } catch (error) {
            console.error('Error updating breaking news:', error);
            addToast({
                title: 'Error',
                description: 'An error occurred while updating breaking news',
                variant: 'danger'
            });
        }
    };

    // Calculate stats
    const draftArticles = articles.filter(article => article.status === 0);
    const publishedArticles = articles.filter(article => article.status === 1);
    const breakingNewsArticles = articles.filter(article => article.isBreaking);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        News Dashboard
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                            <FileText size={16} className="text-amber-500" />
                            {draftArticles.length} draft{draftArticles.length !== 1 ? 's' : ''}
                        </span>
                        •
                        <span className="flex items-center gap-1">
                            <Zap size={16} className="text-red-500" />
                            {breakingNewsArticles.length} breaking news
                        </span>
                        •
                        <span className="flex items-center gap-1">
                            <Users size={16} className="text-blue-500" />
                            {totalViews.toLocaleString()} total views
                        </span>
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Button
                        variant="bordered"
                        startContent={<AlertTriangle size={18} />}
                        onPress={() => setBreakingNewsModal(true)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm"
                    >
                        Add Breaking News
                    </Button>
                    <Button
                        color="primary"
                        startContent={<Plus size={18} />}
                        onPress={() => router.push('/admin/create-article')}
                        className="bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 transition-all duration-200 shadow-lg shadow-gray-900/20"
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
                                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{pagination.totalArticles}</p>
                                <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                                    <FileText size={16} className="text-gray-400" />
                                    Total Articles
                                </p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-xl">
                                <FileText size={24} className="text-gray-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl lg:text-3xl font-bold text-green-600">{publishedArticles.length}</p>
                                <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                                    <Eye size={16} className="text-green-400" />
                                    Published
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Eye size={24} className="text-green-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-amber-200/50 shadow-lg shadow-amber-900/5 hover:shadow-xl hover:shadow-amber-900/10 transition-all duration-300">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl lg:text-3xl font-bold text-amber-500">{draftArticles.length}</p>
                                <p className="text-amber-600 text-sm font-medium flex items-center gap-2 mt-1">
                                    <Clock size={16} className="text-amber-500" />
                                    Drafts
                                </p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <Clock size={24} className="text-amber-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-red-200/50 shadow-lg shadow-red-900/5 hover:shadow-xl hover:shadow-red-900/10 transition-all duration-300">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl lg:text-3xl font-bold text-red-600">{breakingNewsArticles.length}</p>
                                <p className="text-red-600 text-sm font-medium flex items-center gap-2 mt-1">
                                    <Zap size={16} className="text-red-500" />
                                    Breaking News
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-xl">
                                <Zap size={24} className="text-red-600" />
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
                                <p className="text-gray-600 text-sm">Manage articles and breaking news in real-time</p>
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
                                    className="border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    <Search size={18} className="text-gray-600" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-6">
                            {/* Enhanced Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                                <Select
                                    label="Category"
                                    className="max-w-xs"
                                    selectedKeys={selectedCategory !== 'all' ? [selectedCategory] : []}
                                    onSelectionChange={(keys) => {
                                        const value = Array.from(keys)[0] || 'all';
                                        handleCategoryChange(value);
                                    }}
                                    variant="bordered"
                                    classNames={{
                                        trigger: "bg-white/50 backdrop-blur-sm"
                                    }}
                                >
                                    <SelectItem key="all" value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category._id} value={category._id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Status"
                                    className="max-w-xs"
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
                                <Input
                                    type="date"
                                    label="Date"
                                    placeholder="Filter by date"
                                    startContent={<Calendar size={18} className="text-gray-400" />}
                                    value={selectedDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="max-w-xs"
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: "bg-white/50 backdrop-blur-sm"
                                    }}
                                />
                                <Button
                                    variant="bordered"
                                    startContent={<RotateCcw size={16} />}
                                    onPress={handleReset}
                                    className="border-gray-300 hover:bg-gray-50 transition-colors h-14"
                                >
                                    Reset
                                </Button>
                            </div>

                            {/* Loading State */}
                            {loading ? (
                                <div className="flex justify-center items-center py-16">
                                    <div className="text-center space-y-4">
                                        <Spinner size="lg" classNames={{ circle1: "border-b-gray-900", circle2: "border-b-gray-900" }} />
                                        <p className="text-gray-600">Loading articles...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Enhanced Articles Table */}
                                    <div className="rounded-lg border border-gray-200/50 overflow-hidden">
                                        <Table 
                                            aria-label="Articles table" 
                                            className="text-gray-800"
                                            removeWrapper
                                        >
                                            <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                <TableColumn className="font-semibold text-gray-900 py-4 text-sm">ARTICLE</TableColumn>
                                                <TableColumn className="font-semibold text-gray-900 py-4 text-sm">STATUS</TableColumn>
                                                <TableColumn className="font-semibold text-gray-900 py-4 text-sm">BREAKING</TableColumn>
                                                <TableColumn className="font-semibold text-gray-900 py-4 text-sm">ACTIONS</TableColumn>
                                            </TableHeader>
                                            <TableBody emptyContent={
                                                <div className="text-center py-12">
                                                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                                                    <p className="text-gray-600 text-lg">No articles found</p>
                                                    <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or create a new article</p>
                                                </div>
                                            }>
                                                {articles.map((article) => (
                                                    <TableRow
                                                        key={article._id}
                                                        className={`group border-b border-gray-200/50 hover:bg-gray-50/50 transition-all duration-200 ${
                                                            article.isBreaking ? 'bg-red-50/50 border-l-4 border-l-red-500' : ''
                                                        }`}
                                                    >
                                                        <TableCell className="py-4">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1">
                                                                        {article.title}
                                                                    </p>
                                                                    {article.isBreaking && (
                                                                        <Badge color="danger" size="sm" variant="flat" className="animate-pulse">
                                                                            <AlertTriangle size={12} className="mr-1" />
                                                                            Breaking
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <Badge variant="flat" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                                        {article.category?.name || 'Uncategorized'}
                                                                    </Badge>
                                                                    <span className="text-xs text-gray-500">by {article.author}</span>
                                                                    {article.createdAt && (
                                                                        <span className="text-xs text-gray-500">{formatDate(article.createdAt)}</span>
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
                                                        <TableCell className="py-4">
                                                            <Switch
                                                                size="sm"
                                                                color="danger"
                                                                isSelected={article.isBreaking}
                                                                onValueChange={() => toggleBreakingNews(article._id, article.isBreaking)}
                                                                // classNames={{
                                                                //     base: "data-[selected=true]:bg-red-500"
                                                                // }}
                                                            />
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
                                                                        <DropdownItem
                                                                            key="toggle-breaking"
                                                                            startContent={<AlertTriangle size={16} />}
                                                                            onPress={() => toggleBreakingNews(article._id, article.isBreaking)}
                                                                            className={article.isBreaking ? 'text-red-600' : 'text-gray-600'}
                                                                        >
                                                                            {article.isBreaking ? 'Remove Breaking' : 'Mark as Breaking'}
                                                                        </DropdownItem>
                                                                        {article.status === 0 && (
                                                                            <DropdownItem
                                                                                key="publish"
                                                                                startContent={<Send size={16} />}
                                                                                onPress={() => updateArticleStatus(article._id, 1)}
                                                                                className="text-green-600"
                                                                            >
                                                                                Publish
                                                                            </DropdownItem>
                                                                        )}
                                                                        {article.status === 1 && (
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
                                <Badge color="danger" variant="flat" className="border-red-200">
                                    {breakingNewsArticles.length} Active
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-3">
                            {breakingNewsArticles.length === 0 ? (
                                <div className="text-center py-6">
                                    <AlertTriangle className="mx-auto text-gray-400 mb-3" size={32} />
                                    <p className="text-gray-500 text-sm">No active breaking news</p>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="danger"
                                        className="mt-3"
                                        onPress={() => setBreakingNewsModal(true)}
                                    >
                                        Add Breaking News
                                    </Button>
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
                                                onPress={() => toggleBreakingNews(article._id, article.isBreaking)}
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
                        </CardBody>
                    </Card>

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
                                <Badge color="warning" variant="flat" className="border-amber-200">{draftArticles.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-3">
                            {draftArticles.length === 0 ? (
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
                                    <span className="text-gray-600">Breaking News Rate</span>
                                    <span className="font-semibold text-gray-900">
                                        {pagination.totalArticles > 0 
                                            ? Math.round((breakingNewsArticles.length / pagination.totalArticles) * 100) 
                                            : 0}%
                                    </span>
                                </div>
                                <Progress 
                                    value={pagination.totalArticles > 0 ? (breakingNewsArticles.length / pagination.totalArticles) * 100 : 0} 
                                    color="danger" 
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

            {/* Enhanced Add Breaking News Modal */}
            <Modal 
                isOpen={breakingNewsModal} 
                onOpenChange={setBreakingNewsModal} 
                className="bg-white"
                size="lg"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <AlertTriangle className="text-red-500" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">Add Breaking News</h3>
                                        <p className="text-sm text-gray-600 font-normal">Create an urgent news alert</p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody className="space-y-4">
                                <Input
                                    label="Breaking News Title"
                                    placeholder="Enter breaking news headline"
                                    variant="bordered"
                                    value={newBreakingNews.title}
                                    onChange={(e) => setNewBreakingNews({ ...newBreakingNews, title: e.target.value })}
                                    classNames={{
                                        inputWrapper: "bg-white/50 backdrop-blur-sm"
                                    }}
                                />
                                <Select
                                    label="Category"
                                    placeholder="Select category"
                                    variant="bordered"
                                    selectedKeys={newBreakingNews.category ? [newBreakingNews.category] : []}
                                    onSelectionChange={(keys) => {
                                        const value = Array.from(keys)[0] || '';
                                        setNewBreakingNews({ ...newBreakingNews, category: value });
                                    }}
                                    classNames={{
                                        trigger: "bg-white/50 backdrop-blur-sm"
                                    }}
                                >
                                    {categories.map((category) => (
                                        <SelectItem key={category._id}>{category.name}</SelectItem>
                                    ))}
                                </Select>
                                <Input
                                    type="datetime-local"
                                    label="Expiry Time"
                                    variant="bordered"
                                    value={newBreakingNews.expiry}
                                    onChange={(e) => setNewBreakingNews({ ...newBreakingNews, expiry: e.target.value })}
                                    classNames={{
                                        inputWrapper: "bg-white/50 backdrop-blur-sm"
                                    }}
                                />
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-800 flex items-center gap-2">
                                        <AlertTriangle size={14} />
                                        Breaking news will automatically expire at the specified time and appear with high priority
                                    </p>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="bordered" onPress={onClose} className="border-gray-300 hover:bg-gray-50">
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={onClose}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25"
                                    isDisabled={!newBreakingNews.title || !newBreakingNews.category}
                                >
                                    <AlertTriangle size={18} className="mr-2" />
                                    Add Breaking News
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}