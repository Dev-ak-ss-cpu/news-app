"use client";
import { useEffect, useState, useCallback, useRef } from "react";
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
import { genericGetApi } from "../Helper";
import Link from "next/link";

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);

  const [categoryChildren, setCategoryChildren] = useState({});
  const [loadingChildren, setLoadingChildren] = useState({});

  // CENTRALIZED OPEN STATE
  const [openMap, setOpenMap] = useState({}); // { categoryId: boolean }
  const closeTimersRef = useRef({}); // { categoryId: timerId }

  // --------------------------------------------------
  // FETCH LEVEL 0 CATEGORIES
  // --------------------------------------------------
  useEffect(() => {
    const fetchRoot = async () => {
      try {
        const res = await genericGetApi("/api/categories", {
          parent: "null",
          level: 0,
        });
        if (res.success) setCategories(res.data || []);
      } catch (e) {
        console.log("Error fetching root categories:", e);
      }
    };
    fetchRoot();
  }, []);

  // --------------------------------------------------
  // FETCH CHILDREN
  // --------------------------------------------------
  const fetchCategoryChildren = useCallback(
    async (categoryId) => {
      if (categoryChildren[categoryId]) return; // already loaded
      if (loadingChildren[categoryId]) return; // already fetching

      try {
        setLoadingChildren((p) => ({ ...p, [categoryId]: true }));

        const res = await genericGetApi("/api/categories", {
          parent: categoryId,
        });

        if (res.success) {
          setCategoryChildren((p) => ({
            ...p,
            [categoryId]: res.data || [],
          }));
        }
      } catch (err) {
        console.error("Child fetch error:", err);
      } finally {
        setLoadingChildren((p) => ({ ...p, [categoryId]: false }));
      }
    },
    [categoryChildren, loadingChildren]
  );

  // --------------------------------------------------
  // OPEN / CLOSE HELPERS
  // --------------------------------------------------

  const clearAllCloseTimers = () => {
    Object.keys(closeTimersRef.current).forEach((k) => {
      clearTimeout(closeTimersRef.current[k]);
      delete closeTimersRef.current[k];
    });
  };

  // Helper to get all descendant category IDs
  const getAllDescendantIds = useCallback(
    (categoryId) => {
      const descendants = [];
      const children = categoryChildren[categoryId] || [];

      children.forEach((child) => {
        descendants.push(child._id);
        descendants.push(...getAllDescendantIds(child._id));
      });

      return descendants;
    },
    [categoryChildren]
  );

  const closeMenu = (id) => {
    setOpenMap((p) => {
      if (!p[id]) return p;
      const next = { ...p };
      delete next[id];

      // Also close all nested menus of this category
      const descendants = getAllDescendantIds(id);
      descendants.forEach((descId) => {
        delete next[descId];
      });

      return next;
    });
  };

  const openMenu = (id, isRoot = false) => {
    setOpenMap((prev) => {
      if (isRoot) {
        // clear timers to prevent race where old menu re-opens/closes
        clearAllCloseTimers();

        // Close all other root menus and their nested menus
        const newMap = { [id]: true };

        // Find all other root category IDs
        categories.forEach((cat) => {
          if (cat._id !== id && prev[cat._id]) {
            // Close this root and all its descendants
            const descendants = getAllDescendantIds(cat._id);
            descendants.forEach((descId) => {
              // Don't add to newMap (effectively closes them)
            });
          }
        });

        return newMap;
      } else {
        // nested items can co-exist
        return { ...prev, [id]: true };
      }
    });
  };

  const scheduleClose = (id, delay = 100) => {
    if (closeTimersRef.current[id]) clearTimeout(closeTimersRef.current[id]);

    closeTimersRef.current[id] = setTimeout(() => {
      delete closeTimersRef.current[id];
      closeMenu(id);
    }, delay);
  };

  const cancelScheduledClose = (id) => {
    if (closeTimersRef.current[id]) {
      clearTimeout(closeTimersRef.current[id]);
      delete closeTimersRef.current[id];
    }
  };

  // Close all menus when leaving nav area
  const handleNavLeave = () => {
    clearAllCloseTimers();
    setOpenMap({});
  };

  // --------------------------------------------------
  // RENDER CATEGORY (MEGAMENU ITEM)
  // --------------------------------------------------
  const RenderCategory = ({ category, isNested = false, parentPath = [] }) => {
    const children = categoryChildren[category._id] || [];
    const isLoading = !!loadingChildren[category._id];
    const hasChildren = children.length > 0;
    const isOpen = !!openMap[category._id];

    // Build full path for this category
    const currentPath = [...parentPath, category.slug];
    const fullPath = `/${currentPath.join("/")}`;

    // Hover handlers
    const handleEnter = () => {
      cancelScheduledClose(category._id);

      // if top-level, mark as root so openMenu closes other roots
      openMenu(category._id, !isNested);

      // Always try to fetch children if not already loaded/loading
      // Don't check hasChildren because we need to fetch to find out
      if (!categoryChildren[category._id] && !loadingChildren[category._id]) {
        fetchCategoryChildren(category._id);
      }
    };

    const handleLeave = () => {
      scheduleClose(category._id);
    };

    const handleSubEnter = () => {
      cancelScheduledClose(category._id);
      openMenu(category._id, false);
    };

    const handleSubLeave = () => {
      scheduleClose(category._id);
    };

    // immediate open on click (so clicking another category opens it right away)
    const handleClick = (e) => {
      if (hasChildren) {
        e.preventDefault?.();

        // Close all other ROOT menus instantly
        setOpenMap({ [category._id]: true });
        clearAllCloseTimers();

        // Load children if needed
        if (!categoryChildren[category._id] && !loadingChildren[category._id]) {
          fetchCategoryChildren(category._id);
        }
      }
    };

    // cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (closeTimersRef.current[category._id]) {
          clearTimeout(closeTimersRef.current[category._id]);
          delete closeTimersRef.current[category._id];
        }
      };
    }, [category._id]);

    return (
      <div
        className="relative"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {/* Category Row */}
        <div
          onClick={handleClick}
          className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors duration-100 select-none ${
            isNested
              ? "hover:bg-red-50 hover:text-red-600 rounded-md mx-1"
              : "hover:text-red-600 font-semibold text-gray-700"
          }`}
        >
          {hasChildren ? (
            // keep as span for items that open submenus
            <span className="text-gray-800">{category.name}</span>
          ) : (
            <Link
              href={fullPath} // Use full path instead of just slug
              className="text-gray-800 hover:text-red-600"
            >
              {category.name}
            </Link>
          )}

          {hasChildren && !isNested && (
            <ChevronDown
              size={14}
              className={`ml-2 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}

          {isNested && hasChildren && (
            <ChevronRight size={14} className="ml-2 text-gray-400" />
          )}
        </div>

        {/* Hover bridge - increased height and made interactive */}
        <div
          className="absolute left-0 w-full pointer-events-auto"
          style={{
            top: isNested ? 0 : "100%",
            height: isNested ? "100%" : "8px",
          }}
          onMouseEnter={handleSubEnter}
        />

        {/* Always-mounted submenu */}
        <div
          style={{ willChange: "transform" }}
          onMouseEnter={handleSubEnter}
          onMouseLeave={handleSubLeave}
          className={`absolute rounded-lg z-50 transition-all duration-200
            ${isNested ? "left-full top-0 ml-2" : "left-0 top-full"}
            ${
              isOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }
            ${
              !isLoading && isOpen && hasChildren
                ? "bg-white border min-w-60 shadow-xl"
                : ""
            }
          `}
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="inline-block animate-spin h-5 w-5 border-red-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div>
              {children.map((child) => (
                <RenderCategory
                  key={child._id}
                  category={child}
                  isNested={true}
                  parentPath={currentPath}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // SEARCH + LAYOUT
  // --------------------------------------------------

  return (
    <header className="bg-white sticky top-0 z-50 " >
      {/* TOP BAR */}
      <div className="bg-gradient-to-r from-red-600 via-red-650 to-red-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <h1 className="text-4xl font-bold drop-shadow-md">न्यूज़ हिंदी</h1>

            <div className="hidden md:flex items-center space-x-3">
              <span className="text-sm">हमें फॉलो करें:</span>
              {[Facebook, Youtube, Twitter, Instagram].map((Icon, i) => (
                <Button
                  key={i}
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="text-white hover:bg-red-800 rounded-full"
                >
                  <Icon size={18} />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <nav
              className="hidden md:flex items-center space-x-2"
              onMouseLeave={handleNavLeave}
            >
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
                <RenderCategory key={cat._id} category={cat} parentPath={[]} />
              ))}
            </nav>

            {/* SEARCH BAR */}
            <div className="flex items-center space-x-2">
              {!showSearch ? (
                <Button
                  isIconOnly
                  variant="light"
                  onClick={() => setShowSearch(true)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Search size={20} />
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="खोजें..."
                    size="sm"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => {
                      if (searchQuery.trim())
                        console.log("Search:", searchQuery);
                    }}
                  >
                    खोजें
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
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
      </div>
    </header>
  );
}
