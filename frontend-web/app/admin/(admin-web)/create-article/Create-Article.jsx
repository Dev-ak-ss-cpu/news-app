"use client"

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    Switch,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from '@heroui/react';
import {
    Save,
    Send,
    Eye,
    Upload,
    MapPin,
    TrendingUp,
    AlertTriangle,
    Play,
    Tag,
    Youtube,
    X
} from 'lucide-react';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Mock API functions
const mockApi = {
    getCategories: () => Promise.resolve([
        { id: 1, name: 'Politics', hasSubcategories: false },
        { id: 2, name: 'Technology', hasSubcategories: false },
        { id: 3, name: 'Sports', hasSubcategories: false },
        { id: 4, name: 'Country', hasSubcategories: true },
        { id: 5, name: 'Business', hasSubcategories: false },
        { id: 6, name: 'Entertainment', hasSubcategories: false }
    ]),

    getDistricts: (countryId) => Promise.resolve([
        { id: 1, name: 'Kathmandu' },
        { id: 2, name: 'Lalitpur' },
        { id: 3, name: 'Bhaktapur' },
        { id: 4, name: 'Pokhara' },
        { id: 5, name: 'Biratnagar' },
        { id: 6, name: 'Birgunj' },
        { id: 7, name: 'Butwal' },
        { id: 8, name: 'Dharan' }
    ])
};

// Helper function to extract YouTube video ID
const getYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
};

export default function ArticleEditor({ articleId = null }) {
    const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onOpenChange: onPreviewOpenChange } = useDisclosure();
    const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onOpenChange: onImageModalOpenChange } = useDisclosure();
    const { isOpen: isVideoModalOpen, onOpen: onVideoModalOpen, onOpenChange: onVideoModalOpenChange } = useDisclosure();

    const [categories, setCategories] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const [article, setArticle] = useState({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        subCategory: '',
        tags: [],
        featuredImage: '',
        youtubeVideo: '',
        status: 'draft',
        isBreaking: false,
        isTrending: false,
        metaTitle: '',
        metaDescription: '',
        publishDate: new Date().toISOString().split('T')[0],
        author: 'Current User'
    });

    const [newTag, setNewTag] = useState('');

    // Quill modules configuration
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false
        }
    }), []);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'indent',
        'direction', 'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    // Load categories and existing article data
    useEffect(() => {
        loadCategories();
        if (articleId) {
            loadArticle();
        }
    }, [articleId]);

    const loadCategories = async () => {
        try {
            const data = await mockApi.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadArticle = async () => {
        setLoading(true);
        setTimeout(() => {
            setArticle({
                title: 'Sample Article Title for Editing',
                content: '<h2>Introduction</h2><p>This is the main content of the article with <strong>rich text formatting</strong>. You can add <em>italic text</em>, <u>underlined text</u>, and much more!</p><h3>Key Points</h3><ul><li>Point number one</li><li>Point number two</li><li>Point number three</li></ul><p>You can also add <a href="https://example.com">links</a> and format your content professionally.</p>',
                excerpt: 'This is a brief excerpt of the article that will be shown in previews.',
                category: '4',
                subCategory: '1',
                tags: ['News', 'Update', 'Local'],
                featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                youtubeVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                status: 'draft',
                isBreaking: true,
                isTrending: false,
                metaTitle: 'Sample Meta Title',
                metaDescription: 'Sample meta description for SEO',
                publishDate: '2024-01-16',
                author: 'John Doe'
            });
            setLoading(false);
        }, 1000);
    };

    const loadDistricts = async (categoryId) => {
        if (categoryId === '4') {
            try {
                const data = await mockApi.getDistricts(categoryId);
                setDistricts(data);
            } catch (error) {
                console.error('Failed to load districts:', error);
            }
        } else {
            setDistricts([]);
        }
    };

    const handleCategoryChange = (value) => {
        setArticle({ ...article, category: value, subCategory: '' });
        loadDistricts(value);
    };

    const handleInputChange = (field, value) => {
        setArticle({ ...article, [field]: value });
    };

    const addTag = () => {
        if (newTag.trim() && !article.tags.includes(newTag.trim())) {
            setArticle({
                ...article,
                tags: [...article.tags, newTag.trim()]
            });
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setArticle({
            ...article,
            tags: article.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const handleImageUpload = () => {
        if (imageUrl) {
            setArticle({ ...article, featuredImage: imageUrl });
            setImageUrl('');
            onImageModalOpenChange();
        }
    };

    const handleVideoUpload = () => {
        if (youtubeUrl) {
            const videoId = getYouTubeId(youtubeUrl);
            if (videoId) {
                setArticle({ ...article, youtubeVideo: youtubeUrl });
                setYoutubeUrl('');
                onVideoModalOpenChange();
            } else {
                alert('Please enter a valid YouTube URL');
            }
        }
    };

    const getYouTubeThumbnail = (url) => {
        const videoId = getYouTubeId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
    };

    const handleSave = (status = 'draft') => {
        const articleToSave = { ...article, status };
        console.log('Saving article:', articleToSave);
        alert(`Article ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
    };

    const selectedCategory = categories.find(cat => cat.id.toString() === article.category);
    const showSubCategory = selectedCategory?.hasSubcategories;
    const youtubeThumbnail = article.youtubeVideo ? getYouTubeThumbnail(article.youtubeVideo) : '';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading article...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <style jsx global>{`
                .quill-editor {
                    background: white;
                }
                .ql-container {
                    min-height: 400px;
                    font-size: 16px;
                    font-family: inherit;
                }
                .ql-editor {
                    min-height: 400px;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background: white;
                }
                .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
            `}</style>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-black">
                        {articleId ? 'Edit Article' : 'Write New Article'}
                    </h1>
                    <p className="text-gray-600">
                        {articleId ? 'Update your article content' : 'Create and publish a new news article'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="bordered"
                        startContent={<Eye size={18} />}
                        onPress={onPreviewOpen}
                        className="border-gray-300"
                    >
                        Preview
                    </Button>
                    <Button
                        variant="bordered"
                        startContent={<Save size={18} />}
                        onPress={() => handleSave('draft')}
                        className="border-gray-300"
                    >
                        Save Draft
                    </Button>
                    <Button
                        color="primary"
                        startContent={<Send size={18} />}
                        onPress={() => handleSave('published')}
                        className="bg-black text-white hover:bg-gray-800"
                    >
                        Publish Article
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Editor - 3/4 width */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Title Card */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardBody className="p-6">
                            <Input
                                placeholder="Enter article title..."
                                value={article.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="text-2xl font-bold border-none p-0 focus:ring-0"
                                classNames={{
                                    input: "text-2xl font-bold"
                                }}
                            />
                            <Textarea
                                placeholder="Brief excerpt or description..."
                                value={article.excerpt}
                                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                                className="mt-4 border-none p-0 focus:ring-0 resize-none"
                                minRows={2}
                            />
                        </CardBody>
                    </Card>

                    {/* Content Editor with React Quill */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardBody className="p-0">
                            <div className="quill-editor">
                                <ReactQuill
                                    theme="snow"
                                    value={article.content}
                                    onChange={(value) => handleInputChange('content', value)}
                                    modules={modules}
                                    formats={formats}
                                    placeholder="Write your article content here..."
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <div className="flex gap-6">
                        {/* Featured Image */}
                        <Card className="flex-1 h-96 bg-white border border-gray-200 shadow-sm">
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-black">Featured Image</h3>
                            </CardHeader>
                            <CardBody className="overflow-y-auto">
                                {article.featuredImage ? (
                                    <div className="space-y-4">
                                        <img
                                            src={article.featuredImage}
                                            alt="Featured"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                variant="bordered"
                                                startContent={<Upload size={16} />}
                                                onPress={onImageModalOpen}
                                                className="border-gray-300"
                                            >
                                                Change Image
                                            </Button>
                                            <Button
                                                variant="light"
                                                color="danger"
                                                onPress={() => handleInputChange("featuredImage", "")}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors h-full flex flex-col justify-center"
                                        onClick={onImageModalOpen}
                                    >
                                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                        <p className="text-gray-600">Click to upload featured image</p>
                                        <p className="text-sm text-gray-500">Recommended size: 1200x600px</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* YouTube Video */}
                        <Card className="flex-1 h-96 bg-white border border-gray-200 shadow-sm">
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-black">YouTube Video</h3>
                            </CardHeader>
                            <CardBody className="overflow-y-auto">
                                {article.youtubeVideo ? (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <img
                                                src={youtubeThumbnail}
                                                alt="YouTube Thumbnail"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-red-600 rounded-full p-4">
                                                    <Play size={24} className="text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            <Youtube size={20} className="text-red-600" />
                                            <p className="text-sm text-gray-700 flex-1 truncate">
                                                {article.youtubeVideo}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="bordered"
                                                startContent={<Youtube size={16} />}
                                                onPress={onVideoModalOpen}
                                                className="border-gray-300"
                                            >
                                                Change Video
                                            </Button>
                                            <Button
                                                variant="light"
                                                color="danger"
                                                onPress={() => handleInputChange("youtubeVideo", "")}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors h-full flex flex-col justify-center"
                                        onClick={onVideoModalOpen}
                                    >
                                        <Youtube className="mx-auto text-red-600 mb-2" size={24} />
                                        <p className="text-gray-600">Add YouTube Video</p>
                                        <p className="text-sm text-gray-500">Paste YouTube URL to embed video</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>


                </div>

                {/* Sidebar - Settings - 1/4 width */}
                <div className="space-y-6">
                    {/* Categories */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-black">Categories</h3>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <Input
                                type="datetime-local"
                                label="Publish Date & Time"
                                value={`${article.publishDate}T10:00`}
                                onChange={(e) => handleInputChange('publishDate', e.target.value.split('T')[0])}
                                variant="bordered"
                            />
                            <Select
                                label="Main Category"
                                selectedKeys={article.category ? [article.category] : []}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                variant="bordered"
                            >
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            {showSubCategory && (
                                <Select
                                    label="District"
                                    selectedKeys={article.subCategory ? [article.subCategory] : []}
                                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                                    variant="bordered"
                                    startContent={<MapPin size={16} className="text-gray-400" />}
                                >
                                    {districts.map((district) => (
                                        <SelectItem key={district.id} value={district.id}>
                                            {district.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}
                        </CardBody>
                    </Card>

                    {/* Article Features */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-black">Article Features</h3>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-red-500" />
                                    <span className="text-gray-700">Breaking News</span>
                                </div>
                                <Switch
                                    color="danger"
                                    isSelected={article.isBreaking}
                                    onValueChange={(value) => handleInputChange('isBreaking', value)}
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={18} className="text-blue-500" />
                                    <span className="text-gray-700">Trending</span>
                                </div>
                                <Switch
                                    color="primary"
                                    isSelected={article.isTrending}
                                    onValueChange={(value) => handleInputChange('isTrending', value)}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Tags */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-black">Tags</h3>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add tag..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    variant="bordered"
                                    size="sm"
                                />
                                <Button size="sm" onPress={addTag} isIconOnly variant="bordered">
                                    <Tag size={16} />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {article.tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        variant="flat"
                                        onClose={() => removeTag(tag)}
                                        className="bg-gray-100 text-gray-700"
                                    >
                                        {tag}
                                    </Chip>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* SEO Settings */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-black">SEO Settings</h3>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <Input
                                label="Meta Title"
                                value={article.metaTitle}
                                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                                variant="bordered"
                            />
                            <Textarea
                                label="Meta Description"
                                value={article.metaDescription}
                                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                                variant="bordered"
                                minRows={3}
                            />
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Preview Modal */}
            <Modal isOpen={isPreviewOpen} onOpenChange={onPreviewOpenChange} size="5xl">
                <ModalContent>
                    <ModalHeader>Article Preview</ModalHeader>
                    <ModalBody>
                        <div className="prose max-w-none">
                            <h1>{article.title || 'Untitled Article'}</h1>
                            {article.excerpt && (
                                <p className="text-lg text-gray-600 italic">{article.excerpt}</p>
                            )}

                            {article.youtubeVideo && (
                                <div className="my-6">
                                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                        <img
                                            src={youtubeThumbnail}
                                            alt="YouTube Video"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-red-600 rounded-full p-4 hover:bg-red-700 transition-colors">
                                                <Play size={32} className="text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">YouTube Video</p>
                                </div>
                            )}

                            {article.featuredImage && !article.youtubeVideo && (
                                <img
                                    src={article.featuredImage}
                                    alt="Featured"
                                    className="w-full h-64 object-cover rounded-lg my-4"
                                />
                            )}

                            <div className="flex gap-2 mb-4">
                                {article.isBreaking && (
                                    <Chip color="danger" variant="flat">Breaking News</Chip>
                                )}
                                {article.isTrending && (
                                    <Chip color="primary" variant="flat">Trending</Chip>
                                )}
                            </div>
                            <div className="text-gray-600 mb-6">
                                By {article.author} • {new Date(article.publishDate).toLocaleDateString()}
                            </div>
                            <div
                                className="ql-editor"
                                dangerouslySetInnerHTML={{ __html: article.content || '<p>No content yet.</p>' }}
                            />
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* YouTube Video Modal */}
            <Modal isOpen={isVideoModalOpen} onOpenChange={onVideoModalOpenChange}>
                <ModalContent>
                    <ModalHeader>
                        <div className="flex items-center gap-2">
                            <Youtube className="text-red-600" size={20} />
                            Add YouTube Video
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <Input
                            placeholder="Paste YouTube video URL..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            variant="bordered"
                            startContent={<Youtube size={16} className="text-gray-400" />}
                        />
                        <p className="text-sm text-gray-500">
                            Supported formats: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
                        </p>

                        {youtubeUrl && getYouTubeId(youtubeUrl) && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                <div className="relative">
                                    <img
                                        src={getYouTubeThumbnail(youtubeUrl)}
                                        alt="YouTube Preview"
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-red-600 rounded-full p-2">
                                            <Play size={16} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="bordered" onPress={onVideoModalOpenChange}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onPress={handleVideoUpload}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Add Video
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}