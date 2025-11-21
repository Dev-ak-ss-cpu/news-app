import { Button } from '@heroui/react';
import { Search, Menu } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-red-600">न्यूज़</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Button variant="light" className="text-gray-800 font-medium">होम</Button>
                        <Button variant="light" className="text-gray-800 font-medium">क्रिकेट</Button>
                        <Button variant="light" className="text-gray-800 font-medium">शहर</Button>
                        <Button variant="light" className="text-gray-800 font-medium">राजनीति</Button>
                        <Button variant="light" className="text-gray-800 font-medium">मनोरंजन</Button>
                    </nav>

                    {/* Search and Menu */}
                    <div className="flex items-center space-x-4">
                        <Button isIconOnly variant="light" className="text-gray-600">
                            <Search size={20} />
                        </Button>
                        <Button isIconOnly variant="light" className="md:hidden text-gray-600">
                            <Menu size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}