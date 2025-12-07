export default function LeftNewsPanelShimmer() {
    return (
        <div className="space-y-6 sticky top-36 overflow-hidden">
            {/* Trending News Card */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-5 w-5 shimmer rounded"></div>
                    <div className="h-5 w-32 shimmer rounded"></div>
                </div>
                
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 shimmer rounded-full shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-full shimmer rounded"></div>
                                    <div className="h-4 w-4/5 shimmer rounded"></div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-3 w-16 shimmer rounded"></div>
                                        <div className="h-3 w-1 shimmer rounded"></div>
                                        <div className="h-3 w-20 shimmer rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Live TV Card */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
                <div className="h-5 w-24 shimmer rounded mb-4"></div>
                <div className="aspect-video w-full shimmer rounded"></div>
            </div>
        </div>
    );
}