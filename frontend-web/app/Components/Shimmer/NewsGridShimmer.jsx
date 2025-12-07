export default function NewsGridShimmer({ count = 6 }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden h-full"
                    >
                        <div className="p-4 flex flex-col gap-3 h-full">
                            <div className="flex items-center gap-1.5">
                                <div className="h-3 w-16 shimmer rounded"></div>
                                <div className="h-3 w-1 shimmer rounded"></div>
                                <div className="h-3 w-20 shimmer rounded"></div>
                                <div className="h-3 w-1 shimmer rounded"></div>
                                <div className="h-4 w-14 shimmer rounded"></div>
                            </div>
                            
                            <div className="flex gap-3 flex-1">
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-full shimmer rounded"></div>
                                    <div className="h-4 w-5/6 shimmer rounded"></div>
                                    <div className="h-3 w-4/6 shimmer rounded mt-2"></div>
                                    <div className="h-3 w-3/6 shimmer rounded"></div>
                                </div>
                                <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 shimmer rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}