"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
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
  useDisclosure,
} from "@heroui/react";
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
  X,
  Star,
  ArrowUpCircle,
  ListTree,
  PenSquare,
} from "lucide-react";
import {
  getYouTubeId,
  getYouTubeThumbnail,
  genericGetApi,
  genericPostApi,
  genericPutApi,
  genericPutApiWithFile,
  genericPostApiWithFile,
} from "@/app/Helper";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function ArticleEditor({ articleId = null }) {
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onOpenChange: onPreviewOpenChange,
  } = useDisclosure();
  const {
    isOpen: isVideoModalOpen,
    onOpen: onVideoModalOpen,
    onOpenChange: onVideoModalOpenChange,
  } = useDisclosure();

  const [categories, setCategories] = useState([]);
  const [categoryLevels, setCategoryLevels] = useState([]); // Array of arrays: [[level0], [level1], [level2], ...]
  const [categoryPath, setCategoryPath] = useState([]); // Array of selected category IDs: [cat1Id, cat2Id, cat3Id]
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const [article, setArticle] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    featuredImage: "",
    youtubeVideo: "",
    status: "draft",
    isBreaking: false,
    isTrending: false,
    isFeatured: false,
    isTopStory: false,
    isSubStory: false,
    isEditorsPick: false,
    metaTitle: "",
    metaDescription: "",
    publishDate: new Date().toISOString().split("T")[0],
    author: "Current User",
  });

  const [newTag, setNewTag] = useState("");

  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "bullet",
    "indent",
    "direction",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
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
      const response = await genericGetApi("/api/categories", { level: 0 });
      if (response.success) {
        setCategories(response.data);
        // Initialize first level
        setCategoryLevels([response.data]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadArticle = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await genericGetApi(`/api/articles/${articleId}`);
      // if (response.success) {
      //     const articleData = response.data;
      //     setArticle(articleData);
      //     // Load category path if article has category
      //     if (articleData.category) {
      //         await loadCategoryPath(articleData.category);
      //     }
      // }

      // Mock data for now
      setTimeout(() => {
        setArticle({
          title: "Sample Article Title for Editing",
          content:
            "<h2>Introduction</h2><p>This is the main content of the article.</p>",
          excerpt: "This is a brief excerpt of the article.",
          category: "",
          tags: ["News", "Update", "Local"],
          featuredImage:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3",
          youtubeVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          status: "draft",
          isBreaking: true,
          isTrending: false,
          isFeatured: false,
          isTopStory: false,
          isSubStory: false,
          isEditorsPick: false,
          metaTitle: "Sample Meta Title",
          metaDescription: "Sample meta description for SEO",
          publishDate: "2024-01-16",
          author: "John Doe",
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to load article:", error);
      setLoading(false);
    }
  };

  // Load full category path from root to selected category
  const loadCategoryPath = async (finalCategoryId) => {
    try {
      // Get the final category
      const finalCategoryResponse = await genericGetApi(
        `/api/categories/${finalCategoryId}`
      );
      if (!finalCategoryResponse.success) return;

      const path = [];
      const levels = [];
      let currentCategory = finalCategoryResponse.data;

      // Build path from leaf to root
      while (currentCategory) {
        path.unshift(currentCategory._id);
        // Get siblings at this level
        const parentId = currentCategory.parent || null;
        const siblingsResponse = await genericGetApi("/api/categories", {
          parent: parentId || "null",
        });
        if (siblingsResponse.success) {
          levels.unshift(siblingsResponse.data);
        }
        // Move to parent
        if (parentId) {
          const parentResponse = await genericGetApi(
            `/api/categories/${parentId}`
          );
          if (parentResponse.success) {
            currentCategory = parentResponse.data;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      setCategoryPath(path);
      setCategoryLevels(levels);
      setArticle((prev) => ({ ...prev, category: finalCategoryId }));
    } catch (error) {
      console.error("Failed to load category path:", error);
    }
  };

  // Load children for a category at a specific level
  const loadCategoryChildren = async (parentId, levelIndex) => {
    if (!parentId) {
      return [];
    }

    try {
      const response = await genericGetApi("/api/categories", {
        parent: parentId,
      });

      if (response.success && response.data.length > 0) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(
        `Failed to load category children at level ${levelIndex}:`,
        error
      );
      return [];
    }
  };

  // Handle category selection at any level
  const handleCategoryLevelChange = async (levelIndex, selectedCategoryId) => {
    // Find the selected category
    const selectedCategory = categoryLevels[levelIndex]?.find(
      (cat) =>
        cat._id === selectedCategoryId ||
        cat._id?.toString() === selectedCategoryId?.toString()
    );

    if (!selectedCategory) return;

    // Update category path - keep up to current level, then add new selection
    const newPath = [...categoryPath.slice(0, levelIndex), selectedCategoryId];
    setCategoryPath(newPath);

    // Update article state - store the final selected category (deepest level)
    const finalCategoryId = selectedCategoryId;
    setArticle((prev) => ({
      ...prev,
      category: finalCategoryId,
    }));

    // Load children for the selected category
    const children = await loadCategoryChildren(
      selectedCategory._id,
      levelIndex + 1
    );

    // Update category levels - keep up to current level, add children if they exist
    const newLevels = [...categoryLevels.slice(0, levelIndex + 1)];
    if (children.length > 0) {
      newLevels.push(children);
    } else {
      // Remove any levels beyond this one if no children
      setCategoryLevels(newLevels);
      return;
    }

    setCategoryLevels(newLevels);
  };

  const handleInputChange = (field, value) => {
    setArticle({ ...article, [field]: value });
  };

  const addTag = () => {
    if (newTag.trim() && !article.tags.includes(newTag.trim())) {
      setArticle({
        ...article,
        tags: [...article.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setArticle({
      ...article,
      tags: article.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleImagePreview = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setArticle((prev) => ({
        ...prev,
        featuredImage: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = () => {
    if (youtubeUrl) {
      const videoId = getYouTubeId(youtubeUrl);
      if (videoId) {
        setArticle({ ...article, youtubeVideo: youtubeUrl });
        setYoutubeUrl("");
        onVideoModalOpenChange();
      } else {
        alert("Please enter a valid YouTube URL");
      }
    }
  };

const handleSave = async (status = 'draft') => {
    // Validation
    if (!article.title || !article.content) {
        alert('Please fill in title and content');
        return;
    }

    if (!article.category) {
        alert('Please select a category');
        return;
    }

    setSaving(true);
    try {
        // Check if featuredImage is a file (base64 data URL) or URL
        const isFileUpload =
            article.featuredImage &&
            article.featuredImage.startsWith('data:image/');

        let response;

        if (isFileUpload) {
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('title', article.title);
            formData.append('excerpt', article.excerpt || '');
            formData.append('content', article.content);
            formData.append('category', article.category);
            formData.append('author', article.author);
            formData.append('status', status);
            formData.append('isBreaking', article.isBreaking);
            formData.append('isTrending', article.isTrending);
            formData.append('isFeatured', article.isFeatured);
            formData.append('isTopStory', article.isTopStory);
            formData.append('isSubStory', article.isSubStory);
            formData.append('isEditorsPick', article.isEditorsPick);
            formData.append('youtubeVideo', article.youtubeVideo || '');
            formData.append('tags', JSON.stringify(article.tags));
            formData.append('metaTitle', article.metaTitle || '');
            formData.append('metaDescription', article.metaDescription || '');
            formData.append('publishDate', article.publishDate);

            // Convert base64 to blob - RENAME THIS VARIABLE
            const fetchResponse = await fetch(article.featuredImage);
            const blob = await fetchResponse.blob();
            formData.append('featuredImage', blob, 'featured-image.jpg');

            if (articleId) {
                response = await genericPutApiWithFile(
                    `/api/articles/${articleId}`,
                    formData
                );
            } else {
                response = await genericPostApiWithFile("/api/articles", formData);
            }
        } else {
            // Use JSON for URL-based images or no image
            const articleToSave = {
                title: article.title,
                excerpt: article.excerpt,
                content: article.content,
                category: article.category,
                featuredImage: article.featuredImage || '',
                youtubeVideo: article.youtubeVideo || '',
                tags: article.tags,
                author: article.author,
                status: status,
                isBreaking: article.isBreaking,
                isTrending: article.isTrending,
                isFeatured: article.isFeatured,
                isTopStory: article.isTopStory,
                isSubStory: article.isSubStory,
                isEditorsPick: article.isEditorsPick,
                metaTitle: article.metaTitle,
                metaDescription: article.metaDescription,
                publishDate: article.publishDate,
            };

            if (articleId) {
                response = await genericPutApi(
                    `/api/articles/${articleId}`,
                    articleToSave
                );
            } else {
                response = await genericPostApi("/api/articles", articleToSave);
            }
        }

        if (response.success) {
            alert(
                `Article ${
                    status === 'draft' ? 'saved as draft' : 'published'
                } successfully!`
            );
            // Optionally redirect or reset form
            if (!articleId && status === 'published') {
                // Reset form after successful publish
                setArticle({
                    title: '',
                    content: '',
                    excerpt: '',
                    category: '',
                    tags: [],
                    featuredImage: '',
                    youtubeVideo: '',
                    status: 'draft',
                    isBreaking: false,
                    isTrending: false,
                    isFeatured: false,
                    isTopStory: false,
                    isSubStory: false,
                    isEditorsPick: false,
                    metaTitle: '',
                    metaDescription: '',
                    publishDate: new Date().toISOString().split('T')[0],
                    author: 'Current User'
                });
                setCategoryPath([]);
                setCategoryLevels([categories]);
            }
        } else {
            alert(response.message || 'Failed to save article');
        }
    } catch (error) {
        console.error('Error saving article:', error);
        alert('An error occurred while saving the article');
    } finally {
        setSaving(false);
    }
};

  const youtubeThumbnail = article.youtubeVideo
    ? getYouTubeThumbnail(article.youtubeVideo)
    : "";
  const videoId = article.youtubeVideo
    ? getYouTubeId(article.youtubeVideo)
    : "";

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
            {articleId ? "Edit Article" : "Write New Article"}
          </h1>
          <p className="text-gray-600">
            {articleId
              ? "Update your article content"
              : "Create and publish a new news article"}
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
            onPress={() => handleSave("draft")}
            className="border-gray-300"
            isLoading={saving}
            isDisabled={saving}
          >
            Save Draft
          </Button>
          <Button
            color="primary"
            startContent={<Send size={18} />}
            onPress={() => handleSave("published")}
            className="bg-black text-white hover:bg-gray-800"
            isLoading={saving}
            isDisabled={saving}
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
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="text-2xl font-bold border-none p-0 focus:ring-0"
                classNames={{
                  input: "text-2xl font-bold",
                }}
              />
              <Textarea
                placeholder="Brief excerpt or description..."
                value={article.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
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
                  onChange={(value) => handleInputChange("content", value)}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your article content here..."
                />
              </div>
            </CardBody>
          </Card>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Featured Image */}
            <Card className="flex-1  xl:min-h-96 xl:h-145 bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <h3 className="text-lg font-semibold text-black">
                  Featured Image
                </h3>
              </CardHeader>
              <CardBody className="overflow-y-auto">
                {/* Hidden input */}
                <input
                  id="featured-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImagePreview(e.target.files?.[0])}
                />

                {/* Upload Area */}
                <div
                  className={`border-2 border-zinc-300 bg-zinc-50 border-dashed rounded-lg p-4 h-full flex flex-col justify-center items-center text-center transition relative cursor-pointer hover:border-gray-400`}
                  onClick={() => {
                    if (!article.featuredImage) {
                      document.getElementById("featured-image-input").click();
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleImagePreview(e.dataTransfer.files?.[0]);
                  }}
                >
                  {article.featuredImage ? (
                    <div className="relative w-full">
                      <img
                        src={article.featuredImage}
                        alt="Featured"
                        className="w-full h-110 object-cover rounded-lg"
                      />

                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-600 text-white border-2 border-white rounded-full p-1 shadow hover:bg-red-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInputChange("featuredImage", "");
                        }}
                      >
                        <X size={14} />
                      </button>

                      <p className="text-gray-600 mt-3">
                        Drag & drop to replace
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload
                        className="mx-auto mb-2 text-gray-400"
                        size={24}
                      />
                      <p className="text-gray-600">
                        Drag & drop image here, or click to upload
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Recommended size: 1200x600px
                      </p>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* YouTube Video */}
            <Card className="flex-1 xl:min-h-96 xl:h-145 bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <h3 className="text-lg font-semibold text-black">
                  YouTube Video
                </h3>
              </CardHeader>
              <CardBody className="overflow-y-auto">
                {article.youtubeVideo ? (
                  <div className="space-y-4">
                    {videoId && !isVideoPlaying ? (
                      <button
                        type="button"
                        onClick={() => setIsVideoPlaying(true)}
                        className="relative w-full aspect-video rounded-lg overflow-hidden group"
                      >
                        <img
                          src={youtubeThumbnail}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-600 rounded-full p-4 shadow-lg group-hover:scale-110 transition">
                            <Play size={24} className="text-white" />
                          </div>
                        </div>
                      </button>
                    ) : videoId ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No valid YouTube URL
                      </p>
                    )}

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
                        onPress={() => {
                          handleInputChange("youtubeVideo", "");
                          setIsVideoPlaying(false);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed bg-zinc-50 border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors h-full flex flex-col justify-center"
                    onClick={onVideoModalOpen}
                  >
                    <Youtube className="mx-auto text-red-600 mb-2" size={24} />
                    <p className="text-gray-600">Add YouTube Video</p>
                    <p className="text-sm text-gray-500">
                      Paste YouTube URL to embed video
                    </p>
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
                onChange={(e) =>
                  handleInputChange("publishDate", e.target.value.split("T")[0])
                }
                variant="bordered"
              />

              {/* Dynamically render category dropdowns */}
              {categoryLevels.map((levelCategories, levelIndex) => {
                // Get parent category name for better labeling
                let label = "Main Category";
                if (levelIndex > 0) {
                  const parentCategory = categoryLevels[levelIndex - 1]?.find(
                    (cat) => cat._id === categoryPath[levelIndex - 1]
                  );
                  // Use parent name + "Subcategory" or customize based on your needs
                  label = parentCategory
                    ? `${parentCategory.name} Subcategory`
                    : `Category Level ${levelIndex + 1}`;
                }

                const selectedValue = categoryPath[levelIndex] || "";

                return (
                  <Select
                    key={levelIndex}
                    label={label}
                    selectedKeys={selectedValue ? [selectedValue] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      if (selectedKey) {
                        handleCategoryLevelChange(levelIndex, selectedKey);
                      }
                    }}
                    variant="bordered"
                    startContent={
                      levelIndex > 0 ? (
                        <MapPin size={16} className="text-gray-400" />
                      ) : undefined
                    }
                  >
                    {levelCategories.map((category) => (
                      <SelectItem
                        key={category._id || category.id}
                        value={category._id || category.id}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </Select>
                );
              })}
            </CardBody>
          </Card>

          {/* Article Features */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <h3 className="text-lg font-semibold text-black">
                Article Features
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Breaking News */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  <span className="text-gray-700">Breaking News</span>
                </div>
                <Switch
                  color="danger"
                  isSelected={article.isBreaking}
                  onValueChange={(value) =>
                    handleInputChange("isBreaking", value)
                  }
                />
              </div>

              {/* Trending */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-500" />
                  <span className="text-gray-700">Trending</span>
                </div>
                <Switch
                  color="primary"
                  isSelected={article.isTrending}
                  onValueChange={(value) =>
                    handleInputChange("isTrending", value)
                  }
                />
              </div>

              {/* Featured */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-yellow-500" />
                  <span className="text-gray-700">Featured</span>
                </div>
                <Switch
                  color="warning"
                  isSelected={article.isFeatured}
                  onValueChange={(value) =>
                    handleInputChange("isFeatured", value)
                  }
                />
              </div>

              {/* Top Story */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle size={18} className="text-emerald-500" />
                  <span className="text-gray-700">Top Story</span>
                </div>
                <Switch
                  color="success"
                  isSelected={article.isTopStory}
                  onValueChange={(value) =>
                    handleInputChange("isTopStory", value)
                  }
                />
              </div>

              {/* Sub Story */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ListTree size={18} className="text-purple-500" />
                  <span className="text-gray-700">Sub Story</span>
                </div>
                <Switch
                  color="secondary"
                  isSelected={article.isSubStory}
                  onValueChange={(value) =>
                    handleInputChange("isSubStory", value)
                  }
                />
              </div>

              {/* Editor's Pick */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PenSquare size={18} className="text-pink-500" />
                  <span className="text-gray-700">Editor&apos;s Pick</span>
                </div>
                <Switch
                  color="secondary"
                  isSelected={article.isEditorsPick}
                  onValueChange={(value) =>
                    handleInputChange("isEditorsPick", value)
                  }
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
                <Button
                  size="sm"
                  onPress={addTag}
                  isIconOnly
                  variant="bordered"
                >
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
                onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                variant="bordered"
              />
              <Textarea
                label="Meta Description"
                value={article.metaDescription}
                onChange={(e) =>
                  handleInputChange("metaDescription", e.target.value)
                }
                variant="bordered"
                minRows={3}
              />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onOpenChange={onPreviewOpenChange}
        size="5xl"
      >
        <ModalContent>
          <ModalHeader>Article Preview</ModalHeader>
          <ModalBody>
            <div className="prose max-w-none">
              <h1>{article.title || "Untitled Article"}</h1>
              {article.excerpt && (
                <p className="text-lg text-gray-600 italic">
                  {article.excerpt}
                </p>
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
                  <Chip color="danger" variant="flat">
                    Breaking News
                  </Chip>
                )}
                {article.isTrending && (
                  <Chip color="primary" variant="flat">
                    Trending
                  </Chip>
                )}
              </div>
              <div className="text-gray-600 mb-6">
                By {article.author} •{" "}
                {new Date(article.publishDate).toLocaleDateString()}
              </div>
              <div
                className="ql-editor"
                dangerouslySetInnerHTML={{
                  __html: article.content || "<p>No content yet.</p>",
                }}
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
              Supported formats: https://www.youtube.com/watch?v=VIDEO_ID or
              https://youtu.be/VIDEO_ID
            </p>

            {youtubeUrl && getYouTubeId(youtubeUrl) && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </p>
                <div className="relative">
                  <img
                    src={getYouTubeThumbnail(youtubeUrl)}
                    alt="YouTube Preview"
                    className="w-full h-60 object-cover rounded-lg"
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
