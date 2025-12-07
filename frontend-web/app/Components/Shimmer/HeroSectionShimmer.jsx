export default function HeroSectionShimmer() {
    return (
        <div className="bg-gray-50 py-6">
            <div className="container mx-auto px-4">
                <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-20 shimmer rounded"></div>
                        <div className="h-4 w-1 shimmer rounded"></div>
                        <div className="h-4 w-24 shimmer rounded"></div>
                        <div className="h-4 w-1 shimmer rounded"></div>
                        <div className="h-6 w-16 shimmer rounded"></div>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div className="h-6 w-full shimmer rounded"></div>
                        <div className="h-6 w-5/6 shimmer rounded"></div>
                        <div className="h-6 w-4/6 shimmer rounded"></div>
                    </div>

                    <div className="flex gap-2">
                        <div className="h-4 w-24 shimmer rounded"></div>
                        <div className="h-4 w-28 shimmer rounded"></div>
                        <div className="h-4 w-32 shimmer rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}