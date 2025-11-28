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
      className={`bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col rounded-xl overflow-hidden h-full ${
        variant === "highlighted" ? "border-l-4 border-l-red-500" : ""
      }`}
    >
      <CardBody className="p-4 flex-1 flex flex-col min-h-0 h-full">
        <div className="flex gap-3 flex-1 min-h-0 h-full">
          {/* Left: Content */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex items-center text-xs text-gray-600 mb-2 flex-wrap gap-1.5 shrink-0">
              {location && (
                <>
                  <span className="font-semibold">{location}</span>
                  <span>•</span>
                </>
              )}
              <span>{date}</span>
              {category && (
                <>
                  <span>•</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-medium">
                    {category}
                  </span>
                </>
              )}
            </div>

            <h3
              className={`font-bold text-gray-900 mb-2 line-clamp-2 shrink-0 ${
                variant === "highlighted" ? "text-base" : "text-sm"
              }`}
            >
              {title}
            </h3>

            {excerpt && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2 flex-1 min-h-0 leading-relaxed">
                {excerpt}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto shrink-0">
                {tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-blue-600 text-xs font-medium hover:underline cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Image */}
          {image && (
            <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 flex-shrink-0">
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
