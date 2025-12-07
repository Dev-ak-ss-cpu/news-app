export default function ArticleListShimmer({ count = 6 }) {
    return (
        <div className="space-y-6">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                >
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Image placeholder */}
                            <div className="w-full md:w-48 h-32 shimmer rounded-lg shrink-0"></div>

                            {/* Content */}
                            <div className="flex-1 space-y-4">
                                {/* Category and Date */}
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-20 shimmer rounded"></div>
                                    <div className="h-4 w-1 shimmer rounded"></div>
                                    <div className="h-4 w-24 shimmer rounded"></div>
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <div className="h-6 w-full shimmer rounded"></div>
                                    <div className="h-6 w-5/6 shimmer rounded"></div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <div className="h-4 w-full shimmer rounded"></div>
                                    <div className="h-4 w-4/5 shimmer rounded"></div>
                                </div>

                                {/* Author and Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 shimmer rounded-full"></div>
                                        <div className="space-y-1">
                                            <div className="h-4 w-24 shimmer rounded"></div>
                                            <div className="h-3 w-16 shimmer rounded"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-20 shimmer rounded"></div>
                                        <div className="h-4 w-12 shimmer rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}