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
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { genericGetApi } from "../Helper";
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const childItems = childrenMap[item._id] || [];
  const hasChildren = childItems.length > 0;
  const isLoading = loadingMap[item._id];

  const categoryPath = [...parentPath, item.slug];
  const categoryUrl = `/${categoryPath.join('/')}`;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    fetchChildren(item._id);
    // Only open if not loading OR already has children
    if (!isLoading || hasChildren) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Open dropdown once loading completes and has children
  useEffect(() => {
    if (!isLoading && hasChildren) {
      setIsOpen(true);
    }
  }, [isLoading, hasChildren]);

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
        {/* Show chevron only if has children (not while loading) */}
        {hasChildren && !isLoading && (
          <ChevronRight size={14} className="text-gray-400 ml-2" />
        )}
      </div>

      {/* Only show dropdown when fully loaded with children */}
      {!isLoading && hasChildren && (
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
          {childItems.map((child) => (
            <NestedCategoryItem
              key={child._id}
              item={child}
              fetchChildren={fetchChildren}
              childrenMap={childrenMap}
              loadingMap={loadingMap}
              parentPath={categoryPath}
              allCategories={allCategories}
            />
          ))}
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const rootCategoryUrl = `/${category.slug}`;
  const childItems = childrenMap[category._id] || [];
  const hasChildren = childItems.length > 0;
  const isLoading = loadingMap[category._id];

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    fetchChildren(category._id);
    // Only open if not loading OR already has children
    if (!isLoading || hasChildren) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Auto-open dropdown once data is loaded
  useEffect(() => {
    if (!isLoading && hasChildren) {
      setIsOpen(true);
    }
  }, [isLoading, hasChildren]);

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
          <div className="flex items-center gap-4 mt-6  ">
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

      {/* Main Navigation Bar with Logo */}
      <div className="bg-white border-b border-[#edf2f7]">
        <div className="container mx-auto px-4 h-16 flex justify-center items-center">
          {/* Navigation */}
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
              />
            ))}
            {/* <div className="ml-4">
              <GoogleTranslateDropdown />
            </div> */}
          </nav>

        </div>
      </div>
    </header>
  );
}
