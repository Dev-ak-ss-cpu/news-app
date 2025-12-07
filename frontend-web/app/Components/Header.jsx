"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button, Input } from "@heroui/react";
import {
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
  Home,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { genericGetApi } from "../Helper";

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
  parentPath = [], // Add parentPath prop
  allCategories = [], // Add allCategories to build paths
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const hasChildren = (childrenMap[item._id] || []).length > 0;
  const isLoading = loadingMap[item._id];
  const childItems = childrenMap[item._id] || [];

  // Build full path for this category
  const categoryPath = [...parentPath, item.slug];
  const categoryUrl = `/${categoryPath.join('/')}`;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
    fetchChildren(item._id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-red-50 text-gray-800 select-none transition-colors">
        <Link href={categoryUrl} className="flex-1 block">
          {item.name}
        </Link>
        {(hasChildren || isLoading) && (
          <ChevronRight size={14} className="text-gray-400 ml-2" />
        )}
      </div>

      <div
        className={`
          absolute left-full top-0 ml-0 border-l border-gray-100
          bg-white shadow-xl rounded-r-lg min-w-[220px] z-[50]
          transition-all duration-200 ease-in-out origin-top-left
          ${isOpen
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-2 pointer-events-none"
          }
        `}
        style={{ marginTop: "-1px" }}
      >
        {isLoading && <div></div>}

        {childItems.map((child) => (
          <NestedCategoryItem
            key={child._id}
            item={child}
            fetchChildren={fetchChildren}
            childrenMap={childrenMap}
            loadingMap={loadingMap}
            parentPath={categoryPath} // Pass current path as parent
            allCategories={allCategories}
          />
        ))}
      </div>
    </div>
  );
};

const RootCategoryItem = ({
  category,
  fetchChildren,
  childrenMap,
  loadingMap,
  allCategories = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  // Root category URL
  const rootCategoryUrl = `/${category.slug}`;

  // Safely check for children
  const childItems = childrenMap[category._id] || [];
  const hasChildren = childItems.length > 0;
  const isLoading = loadingMap[category._id];

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
    fetchChildren(category._id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

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
          {/* Only show chevron if has children or loading */}
          {(hasChildren || isLoading) && (
            <ChevronDown
              size={14}
              className={`ml-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                }`}
            />
          )}
        </div>
      </Link>

      {/* Only render dropdown if has children or loading */}
      {(hasChildren || isLoading) && (
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
            {isLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading...</div>
            ) : (
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
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // Store all categories for path building

  const [categoryChildren, setCategoryChildren] = useState({});
  const [loadingChildren, setLoadingChildren] = useState({});

  // Social media links
  const socialLinks = [
    { Icon: Twitter, url: "https://x.com/Jkkhabarnow1/status/1966785367316586971?t=ols7eTDRQgRuzQrtJsL1nw&s=08", name: "Twitter" },
    { Icon: Facebook, url: "https://www.facebook.com/share/v/1NUL7n5aMU/", name: "Facebook" },
    { Icon: Instagram, url: "https://www.instagram.com/reel/DRJ9IZGj0RU/?igsh=MXdweWdnZDg3eHdkNA==", name: "Instagram" },
    { Icon: Youtube, url: "https://youtu.be/6Vo6Ol24Euk?si=2uETIqiaZIFbt2a4", name: "YouTube" },
  ];

  useEffect(() => {
    const fetchRoot = async () => {
      try {
        const res = await genericGetApi("/api/categories", {
          parent: "null",
          level: 0,
        });
        if (res.success) {
          setCategories(res.data || []);
        }

        // Fetch all categories for path building
        const allRes = await genericGetApi("/api/categories");
        if (allRes.success) {
          setAllCategories(allRes.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoot();
  }, []);

  const fetchChildren = useCallback(
    async (id) => {
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
    [categoryChildren, loadingChildren]
  );

  return (
    <header className="bg-white sticky top-0 z-[99999] shadow-sm">
      <div className="bg-linear-to-r from-gray-800 via-red-650 to-gray-700 text-white">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="JK Khabar NOW DIGITAL"
                width={140}
                height={140}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {socialLinks.map((social, i) => (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
              >
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="text-white hover:bg-red-800 rounded-full"
                >
                  <social.Icon size={18} />
                </Button>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-14 flex justify-between items-center">
          <nav className="hidden md:flex items-center space-x-1 h-full">
            <Link href="/">
              <Button
                variant="light"
                startContent={<Home size={18} />}
                className="text-gray-800 font-semibold hover:text-red-600 hover:bg-red-50 rounded-lg px-4"
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
              />
            ))}
          </nav>

          {/* <div className="flex items-center space-x-2">
            {!showSearch ? (
              <Button
                isIconOnly
                variant="light"
                onClick={() => setShowSearch(true)}
              >
                <Search size={20} />
              </Button>
            ) : (
              <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-4 duration-200">
                <Input
                  type="text"
                  placeholder="खोजें..."
                  size="sm"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button size="sm" color="danger">
                  खोजें
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={() => setShowSearch(false)}
                >
                  ✕
                </Button>
              </div>
            )}
            <Button isIconOnly variant="light" className="md:hidden">
              <Menu size={20} />
            </Button>
          </div> */}

        </div>
      </div>
    </header>
  );
}
