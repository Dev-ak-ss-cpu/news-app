import { Card, CardBody } from "@heroui/react";

export default function NewsCard({
  title,
  excerpt,
  image,
  location = "Patna",
  date = "20 Nov 2025",
  category = "Election",
  tags = [],
  variant = "default",
}) {
  return (
    <Card
      className={`bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col ${
        variant === "highlighted" ? "border-l-4 border-l-red-500" : ""
      }`}
    >
      <CardBody className="px-4 py-3 flex-1 flex flex-col">
        <div className="flex gap-3 h-full">
          {/* Left: Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center text-xs text-gray-600 mb-1.5 flex-wrap gap-1">
              <span className="font-medium">{location}</span>
              <span>•</span>
              <span>{date}</span>
              {category && (
                <>
                  <span>•</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                    {category}
                  </span>
                </>
              )}
            </div>

            <h3
              className={`font-bold text-gray-900 mb-1 line-clamp-2 shrink-0 ${
                variant === "highlighted" ? "text-lg" : "text-md"
              }`}
            >
              {title}
            </h3>

            {excerpt && (
              <p className="text-[13px] text-gray-600 mb-2 line-clamp-2 flex-1">
                {excerpt}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto">
                {tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-blue-600 text-xs hover:underline cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Image */}
          {image && (
            <div className="shrink-0 w-24 md:w-28 h-full">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
