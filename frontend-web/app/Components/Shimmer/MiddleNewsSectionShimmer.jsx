export default function MiddleNewsSectionShimmer() {
    return (
        <div className="space-y-12 pb-8">
            {/* Pattern Blocks */}
            {Array.from({ length: 3 }).map((_, blockIndex) => (
                <div key={blockIndex} className="space-y-8">
                    {/* Image Article */}
                    <div className="w-full">
                        <div className="bg-white border-0 shadow-lg rounded-xl overflow-hidden">
                            <div className="aspect-video shimmer relative rounded-xl"></div>
                        </div>
                    </div>

                    {/* Video Article */}
                    <div className="w-full">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-2/5 h-48 md:h-auto shimmer"></div>
                                <div className="md:w-3/5 p-6 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-16 shimmer rounded"></div>
                                        <div className="h-4 w-1 shimmer rounded"></div>
                                        <div className="h-4 w-20 shimmer rounded"></div>
                                    </div>
                                    <div className="h-5 w-full shimmer rounded"></div>
                                    <div className="h-5 w-5/6 shimmer rounded"></div>
                                    <div className="h-4 w-4/6 shimmer rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="p-4 flex flex-col gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-16 shimmer rounded"></div>
                                        <div className="h-3 w-1 shimmer rounded"></div>
                                        <div className="h-3 w-20 shimmer rounded"></div>
                                    </div>
                                    <div className="h-4 w-full shimmer rounded"></div>
                                    <div className="h-4 w-5/6 shimmer rounded"></div>
                                    <div className="h-3 w-4/6 shimmer rounded mt-2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-6"
                    >
                        <div className="h-12 w-12 shimmer rounded-full mx-auto mb-3"></div>
                        <div className="h-4 shimmer rounded mx-auto mb-3 w-24"></div>
                        <div className="h-4 shimmer rounded mx-auto w-16"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}