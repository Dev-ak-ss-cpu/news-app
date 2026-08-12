import FeaturedNewsShimmer from "./FeaturedNewsShimmer";
import RightNewsPanelShimmer from "./RightNewsPanelShimmer";
import MiddleNewsSectionShimmer from "./MiddleNewsSectionShimmer";

export default function HomePageShimmer() {
    return (
        <div className="min-h-screen">
            {/* Featured / hero section */}
            <FeaturedNewsShimmer />

            {/* Main Layout Shimmer */}
            <div className="container mx-auto px-2 md:px-3 lg:px-3 xl:px-4">
                <div className="flex gap-6 pt-6">
                    {/* Main Section */}
                    <div className="flex-1 min-w-0">
                        <MiddleNewsSectionShimmer />
                    </div>

                    {/* Right Fixed Panel */}
                    <div className="hidden lg:block w-80 shrink-0">
                        <RightNewsPanelShimmer />
                    </div>
                </div>
            </div>
        </div>
    );
}
