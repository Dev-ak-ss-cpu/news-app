"use client";

export default function MiddleNewsSectionShimmer() {
  return (
    <div className="space-y-10 pb-8">
      {/* Article feed: a full-width story leading every run of five */}
      {Array.from({ length: 3 }).map((_, cycle) => (
        <div key={cycle} className="grid gap-5 sm:grid-cols-2">
          <div className="aspect-video w-full shimmer rounded-2xl sm:col-span-2"></div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-video w-full shimmer rounded-2xl"
            ></div>
          ))}
        </div>
      ))}

      {/* Category Cards Shimmer */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="mx-auto mb-3 h-12 w-12 shimmer rounded-full"></div>
            <div className="mx-auto mb-3 h-4 w-24 shimmer rounded"></div>
            <div className="mx-auto h-4 w-16 shimmer rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
