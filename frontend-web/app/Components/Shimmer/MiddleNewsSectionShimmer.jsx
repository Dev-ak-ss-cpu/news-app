"use client";

export default function MiddleNewsSectionShimmer() {
  return (
    <div className="space-y-12 pb-8">
      {/* Pattern Blocks */}
      {Array.from({ length: 3 }).map((_, blockIndex) => (
        <div key={blockIndex} className="space-y-8">
          {/* Image Article Shimmer */}
          <div className="w-full">
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-shimmer relative rounded-xl"></div>
            </div>
          </div>

          {/* Video Article Shimmer */}
          <div className="w-full">
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-shimmer relative rounded-xl flex items-center justify-center">
                <div className="bg-gray-300 p-3 rounded-full animate-pulse">
                  <div className="w-6 h-6"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Article Shimmer */}
          <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 bg-gray-200 animate-shimmer rounded"></div>
                  <div className="h-4 w-1 bg-gray-200 animate-shimmer rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 animate-shimmer rounded"></div>
                </div>
                <div className="h-5 w-full bg-gray-200 animate-shimmer rounded"></div>
                <div className="h-5 w-5/6 bg-gray-200 animate-shimmer rounded"></div>
                <div className="h-4 w-4/6 bg-gray-200 animate-shimmer rounded mt-2"></div>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="columns-1 md:columns-1 lg:columns-2 gap-6 space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="break-inside-avoid">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-16 bg-gray-200 animate-shimmer rounded"></div>
                      <div className="h-3 w-1 bg-gray-200 animate-shimmer rounded"></div>
                      <div className="h-3 w-20 bg-gray-200 animate-shimmer rounded"></div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 animate-shimmer rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 animate-shimmer rounded"></div>
                    <div className="h-3 w-4/6 bg-gray-200 animate-shimmer rounded mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Category Cards Shimmer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="h-12 w-12 bg-gray-200 animate-shimmer rounded-full mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 animate-shimmer rounded mx-auto mb-3 w-24"></div>
            <div className="h-4 bg-gray-200 animate-shimmer rounded mx-auto w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
