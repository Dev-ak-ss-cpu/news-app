"use client"
import { useState } from 'react';
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
    Switch
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
    X
} from 'lucide-react';

export default function NewsDashboard() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [breakingNewsModal, setBreakingNewsModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const [articles, setArticles] = useState([
        {
            id: 1,
            title: 'Global Tech Conference 2024 Announces Keynote Speakers',
            category: 'Technology',
            date: '2024-01-15',
            status: 'published',
            views: 2450,
            author: 'John Smith',
            lastUpdated: '2024-01-15 10:30',
            isBreaking: true,
            breakingExpiry: '2024-01-16 10:30'
        },
        {
            id: 2,
            title: 'Major Economic Summit Concludes with New Trade Agreements',
            category: 'Business',
            date: '2024-01-14',
            status: 'published',
            views: 3890,
            author: 'Sarah Chen',
            lastUpdated: '2024-01-14 14:20',
            isBreaking: false
        },
        {
            id: 3,
            title: 'Climate Change: New Research Shows Accelerated Melting',
            category: 'Environment',
            date: '2024-01-13',
            status: 'draft',
            views: 0,
            author: 'Mike Johnson',
            lastUpdated: '2024-01-16 09:15',
            isBreaking: true,
            breakingExpiry: '2024-01-17 09:15'
        },
        {
            id: 4,
            title: 'Sports League Announces Major Rule Changes for Next Season',
            category: 'Sports',
            date: '2024-01-12',
            status: 'published',
            views: 1567,
            author: 'Alex Rivera',
            lastUpdated: '2024-01-12 16:45',
            isBreaking: false
        },
        {
            id: 5,
            title: 'New Healthcare Policy to be Implemented Next Quarter',
            category: 'Health',
            date: '2024-01-16',
            status: 'draft',
            views: 0,
            author: 'Dr. Emily Wong',
            lastUpdated: '2024-01-16 11:20',
            isBreaking: false
        }
    ]);

    const [newBreakingNews, setNewBreakingNews] = useState({
        title: '',
        category: '',
        expiry: ''
    });

    const categories = ['All', 'Technology', 'Business', 'Politics', 'Sports', 'Environment', 'Entertainment', 'Health'];
    const statusOptions = [
        { key: 'all', label: 'All Status' },
        { key: 'draft', label: 'Draft' },
        { key: 'published', label: 'Published' },
        { key: 'archived', label: 'Archived' }
    ];

    // Filter articles based on selections
    const filteredArticles = articles.filter(article => {
        const categoryMatch = selectedCategory === 'all' || article.category === selectedCategory;
        const statusMatch = selectedStatus === 'all' || article.status === selectedStatus;
        const dateMatch = !selectedDate || article.date === selectedDate;

        return categoryMatch && statusMatch && dateMatch;
    });

    const draftArticles = articles.filter(article => article.status === 'draft');
    const publishedArticles = articles.filter(article => article.status === 'published');
    const breakingNewsArticles = articles.filter(article => article.isBreaking);

    // Update article status
    const updateArticleStatus = (articleId, newStatus) => {
        setArticles(articles.map(article =>
            article.id === articleId
                ? {
                    ...article,
                    status: newStatus,
                    lastUpdated: new Date().toISOString().split('T')[0] + ' ' +
                        new Date().toTimeString().split(' ')[0].substring(0, 5)
                }
                : article
        ));
    };

    // Toggle breaking news
    const toggleBreakingNews = (articleId) => {
        setArticles(articles.map(article =>
            article.id === articleId
                ? {
                    ...article,
                    isBreaking: !article.isBreaking,
                    breakingExpiry: !article.isBreaking
                        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' ' +
                        new Date(Date.now() + 24 * 60 * 60 * 1000).toTimeString().split(' ')[0].substring(0, 5)
                        : null
                }
                : article
        ));
    };

    // Remove breaking news
    const removeBreakingNews = (articleId) => {
        setArticles(articles.map(article =>
            article.id === articleId
                ? { ...article, isBreaking: false, breakingExpiry: null }
                : article
        ));
    };

    // Add new breaking news
    const addNewBreakingNews = () => {
        if (newBreakingNews.title && newBreakingNews.category) {
            const newArticle = {
                id: articles.length + 1,
                title: newBreakingNews.title,
                category: newBreakingNews.category,
                date: new Date().toISOString().split('T')[0],
                status: 'published',
                views: 0,
                author: 'Breaking News Desk',
                lastUpdated: new Date().toISOString().split('T')[0] + ' ' +
                    new Date().toTimeString().split(' ')[0].substring(0, 5),
                isBreaking: true,
                breakingExpiry: newBreakingNews.expiry ||
                    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' ' +
                    new Date(Date.now() + 24 * 60 * 60 * 1000).toTimeString().split(' ')[0].substring(0, 5)
            };

            setArticles([newArticle, ...articles]);
            setNewBreakingNews({ title: '', category: '', expiry: '' });
            setBreakingNewsModal(false);
        }
    };

    const statusColors = {
        published: { color: 'success', variant: 'flat', class: 'bg-green-100 text-green-800' },
        draft: { color: 'warning', variant: 'flat', class: 'bg-amber-100 text-amber-800' },
        archived: { color: 'default', variant: 'flat', class: 'bg-gray-100 text-gray-800' }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'draft': return <Clock size={14} />;
            case 'published': return <Eye size={14} />;
            case 'archived': return <Archive size={14} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-black">News Dashboard</h1>
                    <p className="text-gray-600">
                        {draftArticles.length} draft{draftArticles.length !== 1 ? 's' : ''} • {breakingNewsArticles.length} breaking news
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="bordered"
                        startContent={<AlertTriangle size={20} />}
                        onPress={() => setBreakingNewsModal(true)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                        Add Breaking News
                    </Button>
                    <Button
                        color="primary"
                        startContent={<Plus size={20} />}
                        onPress={onOpen}
                        className="bg-black text-white hover:bg-gray-800"
                    >
                        New Article
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardBody className="text-center p-4">
                        <p className="text-2xl font-bold text-black">{articles.length}</p>
                        <p className="text-gray-600 text-sm">Total Articles</p>
                    </CardBody>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardBody className="text-center p-4">
                        <p className="text-2xl font-bold text-green-600">{publishedArticles.length}</p>
                        <p className="text-gray-600 text-sm">Published</p>
                    </CardBody>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm border-amber-300">
                    <CardBody className="text-center p-4">
                        <p className="text-2xl font-bold text-amber-500">{draftArticles.length}</p>
                        <p className="text-amber-600 text-sm font-medium">Drafts</p>
                    </CardBody>
                </Card>
                <Card className="bg-white border border-red-200 shadow-sm bg-red-50">
                    <CardBody className="text-center p-4">
                        <p className="text-2xl font-bold text-red-600">{breakingNewsArticles.length}</p>
                        <p className="text-red-600 text-sm font-medium">Breaking News</p>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Articles Table */}
                <div className="lg:col-span-2">
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-0">
                            <div>
                                <h2 className="text-xl font-semibold text-black">Article Management</h2>
                                <p className="text-gray-600 text-sm">Manage articles and breaking news</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Input
                                    placeholder="Search articles..."
                                    startContent={<Search size={18} className="text-gray-400" />}
                                    className="max-w-xs bg-white border-gray-300"
                                />
                                <Button isIconOnly variant="bordered" className="border-gray-300">
                                    <Filter size={18} className="text-gray-600" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody>
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <Select
                                    label="Category"
                                    className="max-w-xs"
                                    selectedKeys={[selectedCategory]}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    variant="bordered"
                                >
                                    {categories.map((category) => (
                                        <SelectItem key={category.toLowerCase()} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Status"
                                    className="max-w-xs"
                                    selectedKeys={[selectedStatus]}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    variant="bordered"
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
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="max-w-xs"
                                    variant="bordered"
                                />
                            </div>

                            {/* Articles Table */}
                            <Table aria-label="Articles table" className="text-gray-800">
                                <TableHeader className="bg-gray-100">
                                    <TableColumn className="font-semibold text-black">TITLE</TableColumn>
                                    <TableColumn className="font-semibold text-black">STATUS</TableColumn>
                                    <TableColumn className="font-semibold text-black">BREAKING</TableColumn>
                                    <TableColumn className="font-semibold text-black">ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {filteredArticles.map((article) => (
                                        <TableRow
                                            key={article.id}
                                            className={`border-b border-gray-200 hover:bg-gray-50 ${article.isBreaking ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                                                }`}
                                        >
                                            <TableCell>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-black">{article.title}</p>
                                                        {article.isBreaking && (
                                                            <Badge color="danger" size="sm" variant="flat">
                                                                <AlertTriangle size={12} className="mr-1" />
                                                                Breaking
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 mt-1">
                                                        <Badge variant="flat" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                                                            {article.category}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">by {article.author}</span>
                                                        {article.views > 0 && (
                                                            <span className="text-xs text-blue-600">{article.views} views</span>
                                                        )}
                                                    </div>
                                                    {article.isBreaking && article.breakingExpiry && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Clock size={12} className="text-red-500" />
                                                            <span className="text-xs text-red-600">
                                                                Expires: {article.breakingExpiry}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={statusColors[article.status].color}
                                                    variant={statusColors[article.status].variant}
                                                    startContent={getStatusIcon(article.status)}
                                                    className={statusColors[article.status].class}
                                                >
                                                    {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    size="sm"
                                                    color="danger"
                                                    isSelected={article.isBreaking}
                                                    onValueChange={() => toggleBreakingNews(article.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 items-center">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        className="text-gray-600"
                                                        onPress={() => {/* Edit functionality */ }}
                                                    >
                                                        <Edit size={16} />
                                                    </Button>

                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <Button isIconOnly size="sm" variant="light" className="text-gray-600">
                                                                <MoreVertical size={16} />
                                                            </Button>
                                                        </DropdownTrigger>
                                                        <DropdownMenu aria-label="Article actions">
                                                            <DropdownItem
                                                                key="toggle-breaking"
                                                                startContent={<AlertTriangle size={16} />}
                                                                onPress={() => toggleBreakingNews(article.id)}
                                                                className={article.isBreaking ? 'text-red-600' : 'text-gray-600'}
                                                            >
                                                                {article.isBreaking ? 'Remove Breaking' : 'Mark as Breaking'}
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="preview"
                                                                startContent={<Eye size={16} />}
                                                                className="text-blue-600"
                                                            >
                                                                Preview
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="delete"
                                                                startContent={<Trash2 size={16} />}
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

                            <div className="flex justify-between items-center mt-4">
                                <p className="text-gray-600 text-sm">
                                    Showing {filteredArticles.length} of {articles.length} articles
                                </p>
                                <Pagination total={Math.ceil(articles.length / 5)} initialPage={1} color="primary" />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar - Breaking News & Draft Management */}
                <div className="space-y-6">
                    {/* Breaking News Manager */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-black">Breaking News</h3>
                                <Badge color="danger" variant="flat">
                                    {breakingNewsArticles.length} Active
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-3">
                            {breakingNewsArticles.length === 0 ? (
                                <div className="text-center py-4">
                                    <AlertTriangle className="mx-auto text-gray-400 mb-2" size={24} />
                                    <p className="text-gray-500 text-sm">No active breaking news</p>
                                </div>
                            ) : (
                                breakingNewsArticles.map((article) => (
                                    <div key={article.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge color="danger" size="sm" variant="flat">
                                                <AlertTriangle size={12} className="mr-1" />
                                                BREAKING
                                            </Badge>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                className="text-red-600 h-6 min-w-6"
                                                onPress={() => removeBreakingNews(article.id)}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                        <p className="text-sm font-medium text-black mb-1">{article.title}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-red-600">{article.category}</span>
                                            {article.breakingExpiry && (
                                                <span className="text-xs text-red-500">
                                                    Expires: {article.breakingExpiry.split(' ')[1]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            <Button
                                fullWidth
                                variant="bordered"
                                startContent={<Plus size={16} />}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onPress={() => setBreakingNewsModal(true)}
                            >
                                Add Breaking News
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Draft Articles Panel */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-black">Draft Articles</h3>
                                <Badge color="warning" variant="flat">{draftArticles.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-3">
                            {draftArticles.length === 0 ? (
                                <div className="text-center py-4">
                                    <Clock className="mx-auto text-gray-400 mb-2" size={24} />
                                    <p className="text-gray-500 text-sm">No draft articles</p>
                                </div>
                            ) : (
                                draftArticles.map((draft) => (
                                    <div key={draft.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge color="warning" size="sm" variant="flat">DRAFT</Badge>
                                            <span className="text-xs text-amber-600">{draft.lastUpdated.split(' ')[1]}</span>
                                        </div>
                                        <p className="text-sm font-medium text-black mb-2">{draft.title}</p>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-amber-500 text-white text-xs h-7"
                                                onPress={() => updateArticleStatus(draft.id, 'published')}
                                            >
                                                Publish
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="bordered"
                                                className="border-amber-300 text-amber-700 text-xs h-7"
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardBody>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <h3 className="text-lg font-semibold text-black">Quick Actions</h3>
                        </CardHeader>
                        <CardBody className="pt-0 space-y-2">
                            <Button
                                fullWidth
                                variant="light"
                                className="justify-start text-gray-700 hover:bg-gray-100"
                                startContent={<BarChart3 size={18} />}
                            >
                                View Analytics
                            </Button>
                            <Button
                                fullWidth
                                variant="light"
                                className="justify-start text-gray-700 hover:bg-gray-100"
                                startContent={<Eye size={18} />}
                            >
                                Preview Site
                            </Button>
                            <Button
                                fullWidth
                                variant="light"
                                className="justify-start text-gray-700 hover:bg-gray-100"
                                startContent={<Edit size={18} />}
                            >
                                Manage Authors
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Add New Article Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="bg-white">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-black">
                                Create New Article
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Article Title"
                                    placeholder="Enter article title"
                                    variant="bordered"
                                />
                                <Select
                                    label="Category"
                                    placeholder="Select a category"
                                    variant="bordered"
                                >
                                    {categories.slice(1).map((category) => (
                                        <SelectItem key={category}>{category}</SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Initial Status"
                                    placeholder="Select status"
                                    variant="bordered"
                                    defaultSelectedKeys={['draft']}
                                >
                                    <SelectItem key="draft">Draft</SelectItem>
                                    <SelectItem key="published">Publish Immediately</SelectItem>
                                </Select>
                                <Input
                                    type="date"
                                    label="Publish Date"
                                    variant="bordered"
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="bordered" onPress={onClose} className="border-gray-300">
                                    Save as Draft
                                </Button>
                                <Button color="primary" onPress={onClose} className="bg-black text-white">
                                    Publish Now
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Add Breaking News Modal */}
            <Modal isOpen={breakingNewsModal} onOpenChange={setBreakingNewsModal} className="bg-white">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-black">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="text-red-500" size={20} />
                                    Add Breaking News
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Breaking News Title"
                                    placeholder="Enter breaking news headline"
                                    variant="bordered"
                                    value={newBreakingNews.title}
                                    onChange={(e) => setNewBreakingNews({ ...newBreakingNews, title: e.target.value })}
                                />
                                <Select
                                    label="Category"
                                    placeholder="Select category"
                                    variant="bordered"
                                    selectedKeys={newBreakingNews.category ? [newBreakingNews.category] : []}
                                    onChange={(e) => setNewBreakingNews({ ...newBreakingNews, category: e.target.value })}
                                >
                                    {categories.slice(1).map((category) => (
                                        <SelectItem key={category}>{category}</SelectItem>
                                    ))}
                                </Select>
                                <Input
                                    type="datetime-local"
                                    label="Expiry Time"
                                    variant="bordered"
                                    value={newBreakingNews.expiry}
                                    onChange={(e) => setNewBreakingNews({ ...newBreakingNews, expiry: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">
                                    Breaking news will automatically expire at the specified time
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="bordered" onPress={onClose} className="border-gray-300">
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={addNewBreakingNews}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                    isDisabled={!newBreakingNews.title || !newBreakingNews.category}
                                >
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