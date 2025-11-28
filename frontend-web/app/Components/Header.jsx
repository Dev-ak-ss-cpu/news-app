"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
} from "@heroui/react";
import {
  Search,
  Menu,
  ChevronDown,
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
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Add your search logic here
      // e.g., navigate to search results page or filter content
    }
  };

  // Fetch level 0 categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await genericGetApi("/api/categories", {
          parent: "null",
          level: 0,
        });

        if (response.success && response.data) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch children for a specific category
  const fetchCategoryChildren = async (categoryId) => {
    // If children already fetched, don't fetch again
    if (categoryChildren[categoryId]) {
      return;
    }

    try {
      const response = await genericGetApi("/api/categories", {
        parent: categoryId,
      });

      if (response.success && response.data) {
        setCategoryChildren((prev) => ({
          ...prev,
          [categoryId]: response.data || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching category children:", error);
    }
  };

  // Handle dropdown open to fetch children
  const handleDropdownOpen = (categoryId) => {
    fetchCategoryChildren(categoryId);
  };

  //   const categories = {
  //     क्रिकेट: ["भारतीय क्रिकेट", "अंतर्राष्ट्रीय", "IPL", "लाइव स्कोर"],
  //     शहर: ["दिल्ली", "मुंबई", "बैंगलोर", "कोलकाता"],
  //     राजनीति: ["राष्ट्रीय", "राज्य", "चुनाव", "संसद"],
  //     मनोरंजन: ["बॉलीवुड", "टीवी", "वेब सीरीज", "सेलिब्रिटी"],
  //   };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar with Logo and Social */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-4xl font-bold tracking-wide">न्यूज़ हिंदी</h1>
            </div>

            {/* Social Media Links */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm mr-2">हमें फॉलो करें:</span>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-white hover:bg-red-800"
              >
                <Facebook size={18} />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-white hover:bg-red-800"
              >
                <Youtube size={18} />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-white hover:bg-red-800"
              >
                <Twitter size={18} />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-white hover:bg-red-800"
              >
                <Instagram size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/">
                <Button
                  variant="light"
                  className="text-gray-800 font-semibold hover:text-red-600"
                  startContent={<Home size={18} />}
                >
                  होम
                </Button>
              </Link>

              {loading ? (
                <div className="text-gray-600 text-sm">
                  Loading categories...
                </div>
              ) : (
                categories.map((category) => {
                  const children = categoryChildren[category._id] || [];
                  const hasChildren = children.length > 0;

                  return (
                    <Dropdown
                      key={category._id}
                      onOpenChange={(isOpen) => {
                        if (isOpen) {
                          handleDropdownOpen(category._id);
                        }
                      }}
                    >
                      <DropdownTrigger>
                        <Button
                          variant="light"
                          className="text-gray-800 font-semibold hover:text-red-600"
                          endContent={
                            hasChildren ? <ChevronDown size={16} /> : null
                          }
                        >
                          {category.name}
                        </Button>
                      </DropdownTrigger>
                      {hasChildren ? (
                        <DropdownMenu aria-label={category.name}>
                          {children.map((child) => (
                            <DropdownItem
                              key={child._id}
                              as={Link}
                              href={`/category/${child.slug || child._id}`}
                              className="text-gray-700"
                            >
                              {child.name}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      ) : (
                        <DropdownMenu aria-label={category.name}>
                          <DropdownItem
                            as={Link}
                            href={`/category/${category.slug || category._id}`}
                            className="text-gray-700"
                          >
                            View All {category.name}
                          </DropdownItem>
                        </DropdownMenu>
                      )}
                    </Dropdown>
                  );
                })
              )}
            </nav>

            {/* Search and Menu */}
            <div className="flex items-center space-x-2">
              {!showSearch ? (
                <Button
                  isIconOnly
                  variant="light"
                  className="text-gray-600 hover:text-red-600"
                  onClick={() => setShowSearch(true)}
                >
                  <Search size={20} />
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="खोजें..."
                    className="w-64"
                    autoFocus
                    size="sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button
                    variant="solid"
                    color="danger"
                    size="sm"
                    onClick={handleSearch}
                    startContent={<Search size={16} />}
                  >
                    खोजें
                  </Button>
                </div>
              )}
              <Button
                isIconOnly
                variant="light"
                className="md:hidden text-gray-600 hover:text-red-600"
              >
                <Menu size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
