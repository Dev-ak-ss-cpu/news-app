"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button, Input } from "@heroui/react";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
  Home,
  Phone,
  Mail,
  MapPin,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { genericGetApi } from "../Helper";
import { buildArticleUrl } from "@/app/utils/articleUrl";
import GoogleTranslateDropdown from "./GoogleTranslate";

// Helper function to build category path from root to current
const buildCategoryPath = (category, allCategories, rootCategory) => {
  const path = [];
  let current = category;

  // Build path from current to root
  while (current) {
    path.unshift(current.slug);
    if (current.parent) {
      // Find parent in allCategories
      current = allCategories.find(cat => cat._id === current.parent);
    } else {
      current = null;
    }
  }

  return path;
};

const NestedCategoryItem = ({
  item,
  fetchChildren,
  childrenMap,
  loadingMap,
  parentPath = [],
  allCategories = [],
  isMobile = false,
  onLinkClick,
  mobileCategoryTree = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const [shouldOpenOnLoad, setShouldOpenOnLoad] = useState(false);

  const childItems = childrenMap[item._id] || [];
  
  // For mobile, check if category has children from pre-built tree
  // For desktop, check from fetched children
  const hasChildren = isMobile
    ? (childItems.length > 0 || (mobileCategoryTree && mobileCategoryTree[item._id]?.length > 0))
    : childItems.length > 0;
    
  const isLoading = loadingMap[item._id];

  const categoryPath = [...parentPath, item.slug];
  const categoryUrl = `/${categoryPath.join('/')}`;

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // If already has children, open immediately
    if (hasChildren) {
      setIsOpen(true);
    } else {
      // Mark that we should open when data loads
      setShouldOpenOnLoad(true);
    }
    
    fetchChildren(item._id);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClick = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
      // For mobile, fetchChildren will use pre-built tree
      fetchChildren(item._id, true);
    }
  };

  const handleLinkClick = () => {
    if (isMobile && onLinkClick) {
      onLinkClick();
    }
  };

  // Desktop: Open dropdown when data finishes loading after hover
  useEffect(() => {
    if (!isMobile && !isLoading && hasChildren && shouldOpenOnLoad) {
      setIsOpen(true);
      setShouldOpenOnLoad(false);
    }
  }, [isLoading, hasChildren, isMobile, shouldOpenOnLoad]);

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-red-50 text-gray-800 select-none transition-colors">
        <Link href={categoryUrl} className="flex-1 block" onClick={handleLinkClick}>
          {item.name}
        </Link>
        {/* Show chevron if has children */}
        {hasChildren && (
          <button
            onClick={handleClick}
            className={`ml-2 ${isMobile ? 'p-1' : ''}`}
            type="button"
          >
            {isLoading ? (
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronRight
                size={14}
                className={`text-gray-400 transition-transform ${isOpen && isMobile ? 'rotate-90' : ''}`}
              />
            )}
          </button>
        )}
      </div>

      {/* Show dropdown when has children and is open */}
      {hasChildren && isOpen && (
        <div
          className={`
            ${isMobile
              ? 'relative left-0 top-0 ml-4 mt-1 border-l-2 border-gray-200'
              : 'absolute left-full top-0 ml-0 border-l border-gray-100'
            }
            bg-white shadow-xs rounded-lg min-w-[220px] z-[50]
            transition-all duration-200 ease-in-out origin-top-left
            ${isOpen
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : isMobile
                ? "hidden"
                : "opacity-0 -translate-x-2 pointer-events-none"
            }
          `}
          style={!isMobile ? { marginTop: "-1px" } : {}}
        >
          {isLoading ? (
            <div className="px-4 py-2 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            childItems.map((child) => (
              <NestedCategoryItem
                key={child._id}
                item={child}
                fetchChildren={fetchChildren}
                childrenMap={childrenMap}
                loadingMap={loadingMap}
                parentPath={categoryPath}
                allCategories={allCategories}
                isMobile={isMobile}
                onLinkClick={onLinkClick}
                mobileCategoryTree={mobileCategoryTree}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};



const RootCategoryItem = ({
  category,
  fetchChildren,
  childrenMap,
  loadingMap,
  allCategories = [],
  isMobile = false,
  onLinkClick,
  mobileCategoryTree = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const rootCategoryUrl = `/${category.slug}`;
  const childItems = childrenMap[category._id] || [];
  
  // For mobile, check if category has children from pre-built tree
  // For desktop, check from fetched children
  const hasChildren = isMobile 
    ? (childItems.length > 0 || (mobileCategoryTree && mobileCategoryTree[category._id]?.length > 0))
    : childItems.length > 0;
    
  const isLoading = loadingMap[category._id];

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // If already has children, open immediately
    if (hasChildren) {
      setIsOpen(true);
    } else {
      // Mark that we should open when data loads
      setShouldOpenOnLoad(true);
    }
    
    fetchChildren(category._id);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setShouldOpenOnLoad(false); // Cancel pending open
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClick = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
      // For mobile, fetchChildren will use pre-built tree
      fetchChildren(category._id, true);
    }
  };

  const handleLinkClick = () => {
    if (isMobile && onLinkClick) {
      onLinkClick();
    }
  };

  // Desktop: Track if we should open when data loads
  const [shouldOpenOnLoad, setShouldOpenOnLoad] = useState(false);
  
  // Desktop: Open dropdown when data finishes loading after hover
  useEffect(() => {
    if (!isMobile && !isLoading && hasChildren && shouldOpenOnLoad) {
      setIsOpen(true);
      setShouldOpenOnLoad(false);
    }
  }, [isLoading, hasChildren, isMobile, shouldOpenOnLoad]);

  if (isMobile) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between">
          <Link
            href={rootCategoryUrl}
            className="flex-1 block px-4 py-3 text-gray-800 hover:bg-red-50 hover:text-red-600 transition-colors font-semibold"
            onClick={handleLinkClick}
          >
            {category.name}
          </Link>
          {hasChildren && (
            <button
              onClick={handleClick}
              className="px-4 py-3 text-gray-600 hover:text-gray-800"
              type="button"
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>
          )}
        </div>

        {/* Mobile dropdown */}
        {hasChildren && isOpen && (
          <div className="ml-4 mt-1 border-l-2 border-gray-200">
            <div className="bg-white">
              {isLoading ? (
                <div className="px-4 py-2 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                childItems.map((child) => (
                  <NestedCategoryItem
                    key={child._id}
                    item={child}
                    fetchChildren={fetchChildren}
                    childrenMap={childrenMap}
                    loadingMap={loadingMap}
                    parentPath={[category.slug]}
                    allCategories={allCategories}
                    isMobile={true}
                    onLinkClick={onLinkClick}
                    mobileCategoryTree={mobileCategoryTree}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={rootCategoryUrl} className="h-full flex items-center">
        <div
          className={`
            flex items-center px-4 py-2 cursor-pointer font-semibold select-none transition-colors h-10 rounded-md
            ${isOpen
              ? "text-red-600 bg-red-50"
              : "text-gray-800 hover:text-red-600 hover:bg-red-50"
            }
          `}
        >
          <span>{category.name}</span>
          {/* Show chevron only when has children (not while loading) */}
          {hasChildren && !isLoading && (
            <ChevronDown
              size={14}
              className={`ml-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                }`}
            />
          )}
        </div>
      </Link>

      {/* Only render dropdown when fully loaded and has children */}
      {!isLoading && hasChildren && (
        <div
          className={`
            absolute left-0 top-full pt-2 
            transition-all duration-200 ease-in-out origin-top-left z-[2000]
            ${isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
            }
          `}
        >
          <div className="bg-white border border-gray-100 shadow-xl rounded-lg min-w-[220px] overflow-visible">
            <div className="py-1">
              {childItems.map((child) => (
                <NestedCategoryItem
                  key={child._id}
                  item={child}
                  fetchChildren={fetchChildren}
                  childrenMap={childrenMap}
                  loadingMap={loadingMap}
                  parentPath={[category.slug]}
                  allCategories={allCategories}
                  isMobile={false}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default function Header({
  initialRootCategories = [],
  initialAllCategories = []
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(initialRootCategories);
  const [allCategories, setAllCategories] = useState(initialAllCategories);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [breakingNews, setBreakingNews] = useState([]);

  const [categoryChildren, setCategoryChildren] = useState({});
  const [loadingChildren, setLoadingChildren] = useState({});
  
  // Build category tree from allCategories for mobile (only for < md size)
  const buildCategoryTree = useCallback(() => {
    if (!allCategories || allCategories.length === 0) return {};
    
    const tree = {};
    
    // First, initialize all categories in the tree
    allCategories.forEach(cat => {
      tree[cat._id] = [];
    });
    
    // Then, build parent-child relationships
    allCategories.forEach(cat => {
      if (cat.parent) {
        // Handle both string ID and object parent
        const parentId = typeof cat.parent === 'string' ? cat.parent : cat.parent._id;
        if (tree[parentId]) {
          tree[parentId].push(cat);
        }
      }
    });
    
    // Sort children by name
    Object.keys(tree).forEach(parentId => {
      tree[parentId].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return tree;
  }, [allCategories]);
  
  // Get mobile category tree
  const mobileCategoryTree = buildCategoryTree();

  // Social media links
  const socialLinks = [
    { Icon: Twitter, url: "https://x.com/Jkkhabarnow1/status/1966785367316586971?t=ols7eTDRQgRuzQrtJsL1nw&s=08", name: "Twitter" },
    { Icon: Facebook, url: "https://www.facebook.com/share/v/1NUL7n5aMU/", name: "Facebook" },
    { Icon: Instagram, url: "https://www.instagram.com/reel/DRJ9IZGj0RU/?igsh=MXdweWdnZDg3eHdkNA==", name: "Instagram" },
    { Icon: Youtube, url: "https://youtu.be/6Vo6Ol24Euk?si=2uETIqiaZIFbt2a4", name: "YouTube" },
  ];

  useEffect(() => {
    // Only fetch if initial data not provided (fallback for client-side navigation)
    if (initialRootCategories.length === 0) {
      const fetchRoot = async () => {
        try {
          const res = await genericGetApi("/api/categories", {
            parent: "null",
            level: 0,
          });
          if (res.success) {
            setCategories(res.data || []);
          }

          const allRes = await genericGetApi("/api/categories");
          if (allRes.success) {
            setAllCategories(allRes.data || []);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchRoot();
    }
  }, [initialRootCategories]);

  // Fetch breaking news for ticker
  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const response = await genericGetApi("/api/articles", {
          page: "1",
          limit: "5",
          isBreaking: "true",
          status: "1",
        });
        if (response.success && response.data?.newArticles) {
          setBreakingNews(response.data.newArticles || []);
        }
      } catch (error) {
        console.error("Error fetching breaking news:", error);
      }
    };
    fetchBreakingNews();
  }, []);

  const fetchChildren = useCallback(
    async (id, isMobile = false) => {
      // For mobile, use pre-built tree instead of fetching
      if (isMobile && mobileCategoryTree[id]) {
        setCategoryChildren((prev) => ({ ...prev, [id]: mobileCategoryTree[id] || [] }));
        return;
      }
      
      // For desktop, fetch from API
      if (categoryChildren[id] || loadingChildren[id]) return;

      setLoadingChildren((prev) => ({ ...prev, [id]: true }));
      try {
        const res = await genericGetApi("/api/categories", { parent: id });
        if (res.success) {
          setCategoryChildren((prev) => ({ ...prev, [id]: res.data || [] }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingChildren((prev) => ({ ...prev, [id]: false }));
      }
    },
    [categoryChildren, loadingChildren, mobileCategoryTree]
  );
  
  // Initialize mobile category tree on mount
  useEffect(() => {
    if (allCategories.length > 0) {
      // Pre-populate category children for mobile from tree
      const tree = buildCategoryTree();
      setCategoryChildren(tree);
    }
  }, [allCategories, buildCategoryTree]);

  const contactInfo = [
    { icon: Phone, text: "+91-9873135821", href: "tel:+919873135821" },
    { icon: Mail, text: "nowjkkhabar@gmail.com", href: "mailto:nowjkkhabar@gmail.com" },
  ];

  return (
    <header className="bg-white sticky top-0 z-[99999]">
      {/* Top Bar - Contact & Social Media Only */}
      <div className="bg-[#0f2547] text-white border-b border-[#1a365d]">
        <div className="container mx-auto px-4 h-10 flex items-center justify-between">
          {/* Logo - Now in navigation bar */}
          <div className="flex items-center gap-4 mt-6 z-20 ">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="JK Khabar NOW DIGITAL"
                width={145}
                height={60}
                className="object-contain"
                priority
              />
            </Link>
          </div>
          {/* Contact Information */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            {contactInfo.map((info, idx) => (
              <a
                key={idx}
                href={info.href}
                className="flex items-center gap-2 hover:text-[#f7fafc] transition-colors"
              >
                <info.icon size={14} className="text-[#718096]" />
                <span>{info.text}</span>
              </a>
            ))}
          </div>

          {/* Mobile Contact (simplified) */}
          <div className="flex md:hidden items-center text-xs">
            <a href="tel:+919876543210" className="flex items-center gap-1">
              <Phone size={12} />
              <span>कॉल करें</span>
            </a>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center space-x-1">
            {socialLinks.map((social, i) => (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="p-1.5 hover:bg-[#1a365d] rounded-md transition-colors"
              >
                <social.Icon size={16} className="text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Breaking News Ticker - Desktop Only (Below Logo) */}
      {breakingNews.length > 0 && (
        <div className="hidden md:block bg-red-600 text-white border-b border-red-700">
          <div className="container mx-auto max-w-316 px-4 py-2">
            <div className="flex items-center gap-3 overflow-hidden">
              
              {/* Scrolling News Ticker */}
              <div className="flex-1 overflow-hidden relative">
                <div className="flex items-center gap-6 animate-scroll whitespace-nowrap">
                  {breakingNews.map((news, index) => (
                    <Link
                      key={news._id || index}
                      href={buildArticleUrl(news)}
                      className="flex items-center gap-2 shrink-0 hover:text-yellow-200 transition-colors"
                    >
                      <span className="text-sm font-medium">
                        {news.title}
                      </span>
                      <span className="text-xs opacity-75">•</span>
                    </Link>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {breakingNews.map((news, index) => (
                    <Link
                      key={`dup-${news._id || index}`}
                      href={buildArticleUrl(news)}
                      className="flex items-center gap-2 shrink-0 hover:text-yellow-200 transition-colors"
                    >
                      <span className="text-sm font-medium">
                        {news.title}
                      </span>
                      <span className="text-xs opacity-75">•</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar with Logo */}
      <div className="bg-white border-b border-[#edf2f7]">
        <div className="container mx-auto px-4 h-16 flex justify-center items-center relative">
          {/* Navigation - Desktop Only */}
          <nav className="hidden md:flex items-center space-x-1 h-full">
            <Link href="/">
              <Button
                variant="light"
                startContent={<Home size={18} />}
                className="text-[#1a202c] font-semibold hover:text-[#1a365d] hover:bg-[#f7fafc] rounded-lg px-4"
              >
                होम
              </Button>
            </Link>

            {categories.map((cat) => (
              <RootCategoryItem
                key={cat._id}
                category={cat}
                fetchChildren={fetchChildren}
                childrenMap={categoryChildren}
                loadingMap={loadingChildren}
                allCategories={allCategories}
                isMobile={false}
              />
            ))}
            {/* <div className="ml-4">
              <GoogleTranslateDropdown />
            </div> */}
          </nav>

          {/* Mobile: Breaking News Ticker + Hamburger Menu */}
          <div className="flex md:hidden items-center gap-2 absolute right-4 left-4">
            {/* Breaking News Ticker - Mobile Only (Left of Hamburger) */}
            {breakingNews.length > 0 && (
              <div className="flex-1 min-w-0 overflow-hidden bg-red-600 text-white rounded-md px-2 py-1.5 mr-2">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  
                  {/* Scrolling News Ticker - Smaller Text on Mobile */}
                  <div className="flex-1 overflow-hidden relative">
                    <div className="flex items-center gap-2 animate-scroll whitespace-nowrap">
                      {breakingNews.map((news, index) => (
                        <Link
                          key={news._id || index}
                          href={buildArticleUrl(news)}
                          className="flex items-center gap-1 shrink-0 hover:text-yellow-200 transition-colors"
                        >
                          <span className="text-[12px] font-medium leading-tight">
                            {news.title}
                          </span>
                          <span className="text-[7px] opacity-75">•</span>
                        </Link>
                      ))}
                      {/* Duplicate for seamless loop */}
                      {breakingNews.map((news, index) => (
                        <Link
                          key={`dup-mobile-nav-${news._id || index}`}
                          href={buildArticleUrl(news)}
                          className="flex items-center gap-1 shrink-0 hover:text-yellow-200 transition-colors"
                        >
                          <span className="text-[9px] font-medium leading-tight">
                            {news.title}
                          </span>
                          <span className="text-[7px] opacity-75">•</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mobile Menu Button - Mobile Only */}
            <div className="shrink-0">
              <Button
                isIconOnly
                variant="light"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700"
                size="sm"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu - Mobile Only */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white max-h-[calc(100vh-200px)] overflow-y-auto">
            <nav className="py-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-gray-800 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Home size={18} />
                <span className="font-semibold">होम</span>
              </Link>

              {categories.map((cat) => (
                <RootCategoryItem
                  key={cat._id}
                  category={cat}
                  fetchChildren={fetchChildren}
                  childrenMap={categoryChildren}
                  loadingMap={loadingChildren}
                  allCategories={allCategories}
                  isMobile={true}
                  onLinkClick={() => setMobileMenuOpen(false)}
                  mobileCategoryTree={mobileCategoryTree}
                />
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
