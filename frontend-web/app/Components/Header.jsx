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
import { genericGetApi } from "../Helper";

const NestedCategoryItem = ({
  item,
  fetchChildren,
  childrenMap,
  loadingMap,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const hasChildren = (childrenMap[item._id] || []).length > 0;

  const isLoading = loadingMap[item._id];
  const childItems = childrenMap[item._id] || [];

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
        <Link href={`/${item.slug}`} className="flex-1 block">
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
          ${
            isOpen
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

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
      <div
        className={`
          flex items-center px-4 py-2 cursor-pointer font-semibold select-none transition-colors h-10 rounded-md
          ${
            isOpen
              ? "text-red-600 bg-red-50"
              : "text-gray-800 hover:text-red-600 hover:bg-red-50"
          }
        `}
      >
        <span>{category.name}</span>
        <ChevronDown
          size={14}
          className={`ml-1 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      <div
        className={`
          absolute left-0 top-full pt-2 
          transition-all duration-200 ease-in-out origin-top-left z-[2000]
          ${
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }
        `}
      >
        <div className="bg-white border border-gray-100 shadow-xl rounded-lg min-w-[220px] overflow-visible">
          {loadingMap[category._id] ? (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="py-1">
              {(childrenMap[category._id] || []).map((child) => (
                <NestedCategoryItem
                  key={child._id}
                  item={child}
                  fetchChildren={fetchChildren}
                  childrenMap={childrenMap}
                  loadingMap={loadingMap}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);

  const [categoryChildren, setCategoryChildren] = useState({});
  const [loadingChildren, setLoadingChildren] = useState({});

  useEffect(() => {
    const fetchRoot = async () => {
      try {
        const res = await genericGetApi("/api/categories", {
          parent: "null",
          level: 0,
        });
        if (res.success) setCategories(res.data || []);
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
      <div className="bg-gradient-to-r from-red-600 via-red-650 to-red-700 text-white">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <h1 className="text-3xl font-bold">न्यूज़ हिंदी</h1>
          <div className="hidden md:flex items-center space-x-3">
            <span className="text-sm">हमें फॉलो करें:</span>
            {[Facebook, Youtube, Twitter, Instagram].map((Icon, i) => (
              <Button
                key={i}
                isIconOnly
                variant="light"
                size="sm"
                className="text-white hover:bg-red-800 rounded-full"
              >
                <Icon size={18} />
              </Button>
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
              />
            ))}
          </nav>

          <div className="flex items-center space-x-2">
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
          </div>
        </div>
      </div>
    </header>
  );
}
