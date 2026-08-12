export default function FeaturedNewsShimmer() {
    return (
        <section className="container mx-auto px-4 py-8">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="h-7 w-1.5 shimmer rounded-full"></div>
                <div className="h-6 w-40 shimmer rounded"></div>
                <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3 lg:auto-rows-fr">
                {/* Lead story */}
                <div className="lg:col-span-2 lg:min-h-96">
                    <div className="h-full min-h-76 shimmer rounded-2xl"></div>
                </div>

                {/* Secondary stories */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-full min-h-42 shimmer rounded-2xl"
                        ></div>
                    ))}
                </div>
            </div>

            {/* Remaining stories */}
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3"
                    >
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-16 shimmer rounded-full"></div>
                                <div className="h-3 w-16 shimmer rounded"></div>
                            </div>
                            <div className="h-4 w-full shimmer rounded"></div>
                            <div className="h-4 w-5/6 shimmer rounded"></div>
                            <div className="h-3 w-3/6 shimmer rounded mt-auto"></div>
                        </div>
                        <div className="h-20 w-20 md:h-24 md:w-24 shrink-0 shimmer rounded-lg"></div>
                    </div>
                ))}
            </div>
        </section>
    );
}
