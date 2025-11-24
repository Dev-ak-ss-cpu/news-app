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
  toast,
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
  const [categoryLevels, setCategoryLevels] = useState([]);
  const [categoryPath, setCategoryPath] = useState([]);
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

  // Validation errors state
  const [errors, setErrors] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    featuredImage: "",
    publishDate: "",
    metaTitle: "",
    metaDescription: "",
    articleFeatures: "", // Add this for Article Features validation
  });

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
        ["link"],
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
  ];

  // Load categories and existing article data
  useEffect(() => {
    loadCategories();
    if (articleId) {
      // loadArticle(); // Uncomment if you have this function
    }
  }, [articleId]);

  const loadCategories = async () => {
    try {
      const response = await genericGetApi("/api/categories", { level: 0 });
      if (response.success) {
        setCategories(response.data);
        setCategoryLevels([response.data]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

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

  const handleCategoryLevelChange = async (levelIndex, selectedCategoryId) => {
    const selectedCategory = categoryLevels[levelIndex]?.find(
      (cat) =>
        cat._id === selectedCategoryId ||
        cat._id?.toString() === selectedCategoryId?.toString()
    );

    if (!selectedCategory) return;
    const newPath = [...categoryPath.slice(0, levelIndex), selectedCategoryId];
    setCategoryPath(newPath);

    const finalCategoryId = selectedCategoryId;
    setArticle((prev) => ({
      ...prev,
      category: finalCategoryId,
    }));

    // Clear category error when category is selected
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }

    const children = await loadCategoryChildren(
      selectedCategory._id,
      levelIndex + 1
    );

    const newLevels = [...categoryLevels.slice(0, levelIndex + 1)];
    if (children.length > 0) {
      newLevels.push(children);
    } else {
      setCategoryLevels(newLevels);
      return;
    }

    setCategoryLevels(newLevels);
  };

  const handleInputChange = (field, value) => {
    setArticle({ ...article, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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
      // Clear featuredImage error when image is uploaded
      if (errors.featuredImage) {
        setErrors((prev) => ({ ...prev, featuredImage: "" }));
      }
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

  // Validation function
  const validateForm = () => {
    const newErrors = {
      title: "",
      excerpt: "",
      content: "",
      category: "",
      featuredImage: "",
      publishDate: "",
      metaTitle: "",
      metaDescription: "",
      articleFeatures: "", // Add this
    };

    let isValid = true;

    // Validate title
    if (!article.title || article.title.trim() === "") {
      newErrors.title = "Title is required";
      isValid = false;
    }

    // Validate excerpt
    if (!article.excerpt || article.excerpt.trim() === "") {
      newErrors.excerpt = "Excerpt is required";
      isValid = false;
    }

    // Validate content
    if (
      !article.content ||
      article.content.trim() === "" ||
      article.content === "<p><br></p>" ||
      article.content === "<p></p>"
    ) {
      newErrors.content = "Content is required";
      isValid = false;
    }

    // Validate category
    if (!article.category || article.category === "") {
      newErrors.category = "Category is required";
      isValid = false;
    }

    // Validate featuredImage
    if (!article.featuredImage || article.featuredImage === "") {
      newErrors.featuredImage = "Featured image is required";
      isValid = false;
    }

    // Validate publishDate
    if (!article.publishDate || article.publishDate === "") {
      newErrors.publishDate = "Publish date is required";
      isValid = false;
    }

    // Validate metaTitle
    if (!article.metaTitle || article.metaTitle.trim() === "") {
      newErrors.metaTitle = "Meta title is required";
      isValid = false;
    }

    // Validate metaDescription
    if (!article.metaDescription || article.metaDescription.trim() === "") {
      newErrors.metaDescription = "Meta description is required";
      isValid = false;
    }

    // Validate Article Features - at least one must be selected
    if (
      !article.isBreaking &&
      !article.isTrending &&
      !article.isFeatured &&
      !article.isTopStory &&
      !article.isSubStory &&
      !article.isEditorsPick
    ) {
      newErrors.articleFeatures = "At least one article feature must be selected";
      isValid = false;
    }

    // Remove author validation - it's no longer required

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async (status = "draft") => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const isFileUpload =
        article.featuredImage &&
        article.featuredImage.startsWith("data:image/");

      let response;

      if (isFileUpload) {
        const formData = new FormData();
        formData.append("title", article.title);
        formData.append("excerpt", article.excerpt || "");
        formData.append("content", article.content);
        formData.append("category", article.category);
        formData.append("author", article.author);
        formData.append("status", status);
        formData.append("isBreaking", article.isBreaking);
        formData.append("isTrending", article.isTrending);
        formData.append("isFeatured", article.isFeatured);
        formData.append("isTopStory", article.isTopStory);
        formData.append("isSubStory", article.isSubStory);
        formData.append("isEditorsPick", article.isEditorsPick);
        formData.append("youtubeVideo", article.youtubeVideo || "");
        formData.append("tags", JSON.stringify(article.tags));
        formData.append("metaTitle", article.metaTitle || "");
        formData.append("metaDescription", article.metaDescription || "");
        formData.append("publishDate", article.publishDate);

        const fetchResponse = await fetch(article.featuredImage);
        const blob = await fetchResponse.blob();
        formData.append("featuredImage", blob, "featured-image.jpg");

        if (articleId) {
          response = await genericPutApiWithFile(
            `/api/articles/${articleId}`,
            formData
          );
        } else {
          response = await genericPostApiWithFile("/api/articles", formData);
        }
      } else {
        const articleToSave = {
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category,
          featuredImage: article.featuredImage || "",
          youtubeVideo: article.youtubeVideo || "",
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
        toast.success(
          `Article ${
            status === "draft" ? "saved as draft" : "published"
          } successfully!`
        );
        if (!articleId && status === "published") {
          setArticle({
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
          setCategoryPath([]);
          setCategoryLevels([categories]);
          setErrors({
            title: "",
            excerpt: "",
            content: "",
            category: "",
            featuredImage: "",
            publishDate: "",
            metaTitle: "",
            metaDescription: "",
            articleFeatures: "", // Add this
          });
        }
      } else {
        toast.error(response.message || "Failed to save article");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("An error occurred while saving the article");
    } finally {
      setSaving(false);
    }
  };

  const youtubeThumbnail = article.youtubeVideo
    ? getYouTubeThumbnail(article.youtubeVideo)
    : "";
  const videoId = article.youtubeVideo ? getYouTubeId(article.youtubeVideo) : "";

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
              <div data-field="title">
                <Input
                  placeholder="Enter article title..."
                  value={article.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="text-2xl font-bold border-none p-0 focus:ring-0"
                  classNames={{
                    input: "text-2xl font-bold",
                  }}
                  isRequired
                  isInvalid={!!errors.title}
                  errorMessage={errors.title}
                />
              </div>
              <div data-field="excerpt" className="mt-4">
                <Textarea
                  placeholder="Brief excerpt or description..."
                  value={article.excerpt}
                  onChange={(e) => handleInputChange("excerpt", e.target.value)}
                  className="border-none p-0 focus:ring-0 resize-none text-2xl"
                  minRows={2}
                  isRequired
                  isInvalid={!!errors.excerpt}
                  errorMessage={errors.excerpt}
                />
              </div>
            </CardBody>
          </Card>

          {/* Content Editor with React Quill */}
          <Card className="bg-white border border-gray-200 shadow-sm">  
            <CardBody className="p-0">
              <div className="quill-editor" data-field="content">
                <ReactQuill
                  theme="snow"
                  value={article.content}
                  onChange={(value) => handleInputChange("content", value)}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your article content here..."
                />
              </div>
              {errors.content && (
                <p className="text-danger text-sm mt-2 px-4 pb-4">
                  {errors.content}
                </p>
              )}
            </CardBody>
          </Card>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Featured Image */}
            <Card className="flex-1 xl:min-h-96 xl:h-145 bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <h3 className="text-lg font-semibold text-black">
                  Featured Image <span className="text-red-500">*</span>
                </h3>
              </CardHeader>
              <CardBody className="overflow-y-auto">
                <input
                  id="featured-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImagePreview(e.target.files?.[0])}
                />

                <div
                  data-field="featuredImage"
                  className={`border-2 ${
                    errors.featuredImage ? "border-danger" : "border-zinc-300"
                  } bg-zinc-50 border-dashed rounded-lg p-4 h-full flex flex-col justify-center items-center text-center transition relative cursor-pointer hover:border-gray-400`}
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
                      <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                      <p className="text-gray-600">
                        Drag & drop image here, or click to upload
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Recommended size: 1200x600px
                      </p>
                    </>
                  )}
                </div>
                {errors.featuredImage && (
                  <p className="text-danger text-sm mt-2">{errors.featuredImage}</p>
                )}
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
              <div data-field="publishDate">
                <Input
                  type="date"
                  label="Publish Date & Time"
                  value={article.publishDate}
                  onChange={(e) =>
                    handleInputChange("publishDate", e.target.value.split("T")[0])
                  }
                  variant="bordered"
                  isRequired
                  isInvalid={!!errors.publishDate}
                  errorMessage={errors.publishDate}
                />
              </div>

              {/* Dynamically render category dropdowns */}
              {categoryLevels.map((levelCategories, levelIndex) => {
                let label = "Main Category";
                if (levelIndex > 0) {
                  const parentCategory = categoryLevels[levelIndex - 1]?.find(
                    (cat) => cat._id === categoryPath[levelIndex - 1]
                  );
                  label = parentCategory
                    ? `${parentCategory.name} Subcategory`
                    : `Category Level ${levelIndex + 1}`;
                }

                const selectedValue = categoryPath[levelIndex] || "";

                return (
                  <div
                    key={levelIndex}
                    data-field={levelIndex === 0 ? "category" : undefined}
                  >
                    <Select
                      label={label}
                      selectedKeys={selectedValue ? [selectedValue] : []}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        if (selectedKey) {
                          handleCategoryLevelChange(levelIndex, selectedKey);
                        }
                      }}
                      variant="bordered"
                      isRequired={levelIndex === 0}
                      isInvalid={levelIndex === 0 && !!errors.category}
                      errorMessage={levelIndex === 0 ? errors.category : undefined}
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
                  </div>
                );
              })}
            </CardBody>
          </Card>

          {/* Article Features */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <h3 className="text-lg font-semibold text-black">
                Article Features <span className="text-red-500">*</span>
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {errors.articleFeatures && (
                <p className="text-danger text-sm mb-2">{errors.articleFeatures}</p>
              )}
              
              {/* Breaking News */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  <span className="text-gray-700">Breaking News</span>
                </div>
                <Switch
                  color="danger"
                  isSelected={article.isBreaking}
                  onValueChange={(value) => {
                    handleInputChange("isBreaking", value);
                    // Clear error when any feature is selected
                    if (errors.articleFeatures) {
                      setErrors((prev) => ({ ...prev, articleFeatures: "" }));
                    }
                  }}
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
                  onValueChange={(value) => {
                    handleInputChange("isTrending", value);
                    if (errors.articleFeatures) {
                      setErrors((prev) => ({ ...prev, articleFeatures: "" }));
                    }
                  }}
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
                  onValueChange={(value) => {
                    handleInputChange("isFeatured", value);
                    if (errors.articleFeatures) {
                      setErrors((prev) => ({ ...prev, articleFeatures: "" }));
                    }
                  }}
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
                  onValueChange={(value) => {
                    handleInputChange("isTopStory", value);
                    if (errors.articleFeatures) {
                      setErrors((prev) => ({ ...prev, articleFeatures: "" }));
                    }
                  }}
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
                  onValueChange={(value) => {
                    handleInputChange("isSubStory", value);
                    if (errors.articleFeatures) {
                      setErrors((prev) => ({ ...prev, articleFeatures: "" }));
                    }
                  }}
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
                  onValueChange={(value) => {
                    handleInputChange("isEditorsPick", value);
                    if (errors.articleFeatures) {
                      setErrors((prev) => ({ ...prev, articleFeatures: "" }));
                    }
                  }}
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
              <div data-field="metaTitle">
                <Input
                  label="Meta Title"
                  value={article.metaTitle}
                  onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                  variant="bordered"
                  isRequired
                  isInvalid={!!errors.metaTitle}
                  errorMessage={errors.metaTitle}
                />
              </div>
              <div data-field="metaDescription">
                <Textarea
                  label="Meta Description"
                  value={article.metaDescription}
                  onChange={(e) =>
                    handleInputChange("metaDescription", e.target.value)
                  }
                  variant="bordered"
                  minRows={3}
                  isRequired
                  isInvalid={!!errors.metaDescription}
                  errorMessage={errors.metaDescription}
                />
              </div>
            </CardBody>
          </Card>

          {/* Author */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <h3 className="text-lg font-semibold text-black">Author</h3>
            </CardHeader>
            <CardBody>
              <div data-field="author">
                <Input
                  label="Author"
                  value={article.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  variant="bordered"
                  // Remove isRequired, isInvalid, and errorMessage props
                />
              </div>
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
