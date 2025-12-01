"use client";
import { Card, CardBody, Chip } from "@heroui/react";
import { Users } from "lucide-react";
import Link from "next/link";

export default function RelatedCategories({ 
  categories = [], // Pre-fetched categories from server
  title = "Related Categories",
  showLoading = false
}) {
  const buildCategoryUrl = (category) => {
    if (!category.slug) return "#";
    return `/${category.slug}`;
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardBody className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Users size={18} />
          {title}
        </h3>

        {showLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={buildCategoryUrl(category)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                  {category.name}
                </span>
                <Chip size="sm" variant="flat" color="default">
                  {category.articleCount || 0}
                </Chip>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No related categories available</p>
        )}
      </CardBody>
    </Card>
  );
}
