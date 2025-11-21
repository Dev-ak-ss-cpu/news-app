import LeftNewsPanel from './LeftNewsPanel';
import RightNewsPanel from './RightNewsPanel';
import MiddleNewsSection from './MiddleNewsSection';

export default function Layout() {
    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4">
                <div className="flex gap-6 pt-6">
                    {/* Left Fixed Panel */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <LeftNewsPanel />
                    </div>

                    {/* Middle Scrollable Section */}
                    <div className="flex-1 min-w-0">
                        <MiddleNewsSection />
                    </div>

                    {/* Right Fixed Panel */}
                    <div className="hidden xl:block w-80 flex-shrink-0">
                        <RightNewsPanel />
                    </div>
                </div>
            </div>
        </div>
    );
}