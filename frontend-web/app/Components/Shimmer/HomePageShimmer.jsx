import HeroSectionShimmer from "./HeroSectionShimmer";
import NewsGridShimmer from "./NewsGridShimmer";
import LeftNewsPanelShimmer from "./LeftNewsPanelShimmer";
import RightNewsPanelShimmer from "./RightNewsPanelShimmer";
import MiddleNewsSectionShimmer from "./MiddleNewsSectionShimmer";
import SectionHeader from "../../(main-web)/SectionHeader";

export default function HomePageShimmer() {
    return (
        <div className="min-h-screen">
            {/* Hero Section Shimmer - if enabled */}
            {/* <HeroSectionShimmer /> */}

            {/* News Grid Section */}
            <section className="container mx-auto px-4 py-8">
                <SectionHeader title="ताज़ा खबरें" badgeText="शपथ ग्रहण" />
                <NewsGridShimmer count={6} />
            </section>

            {/* Main Layout Shimmer */}
            <div className="container mx-auto px-2 md:px-3 lg:px-3 xl:px-4">
                <div className="flex gap-6 pt-6">
                    {/* Left Fixed Panel */}
                    <div className="hidden lg:block w-80 shrink-0">
                        <LeftNewsPanelShimmer />
                    </div>

                    {/* Middle Scrollable Section */}
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