"use client"
import { useState } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input } from '@heroui/react';
import { Search, Menu, ChevronDown, Facebook, Youtube, Twitter, Instagram, Home } from 'lucide-react';

export default function Header() {
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const handleSearch = () => {
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery);
            // Add your search logic here
            // e.g., navigate to search results page or filter content
        }
    };
    
    const categories = {
        'क्रिकेट': ['भारतीय क्रिकेट', 'अंतर्राष्ट्रीय', 'IPL', 'लाइव स्कोर'],
        'शहर': ['दिल्ली', 'मुंबई', 'बैंगलोर', 'कोलकाता'],
        'राजनीति': ['राष्ट्रीय', 'राज्य', 'चुनाव', 'संसद'],
        'मनोरंजन': ['बॉलीवुड', 'टीवी', 'वेब सीरीज', 'सेलिब्रिटी']
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            {/* Top Bar with Logo and Social */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center">
                            <h1 className="text-4xl font-bold tracking-wide">न्यूज़ हिंदी</h1>
                        </div>

                        {/* Social Media Links */}
                        <div className="hidden md:flex items-center space-x-2">
                            <span className="text-sm mr-2">हमें फॉलो करें:</span>
                            <Button isIconOnly size="sm" variant="light" className="text-white hover:bg-red-800">
                                <Facebook size={18} />
                            </Button>
                            <Button isIconOnly size="sm" variant="light" className="text-white hover:bg-red-800">
                                <Youtube size={18} />
                            </Button>
                            <Button isIconOnly size="sm" variant="light" className="text-white hover:bg-red-800">
                                <Twitter size={18} />
                            </Button>
                            <Button isIconOnly size="sm" variant="light" className="text-white hover:bg-red-800">
                                <Instagram size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        {/* Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            <Button 
                                variant="light" 
                                className="text-gray-800 font-semibold hover:text-red-600"
                                startContent={<Home size={18} />}
                            >
                                होम
                            </Button>
                            
                            {Object.entries(categories).map(([category, items]) => (
                                <Dropdown key={category}>
                                    <DropdownTrigger>
                                        <Button 
                                            variant="light" 
                                            className="text-gray-800 font-semibold hover:text-red-600"
                                            endContent={<ChevronDown size={16} />}
                                        >
                                            {category}
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label={category}>
                                        {items.map((item) => (
                                            <DropdownItem key={item} className="text-gray-700">
                                                {item}
                                            </DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                            ))}
                        </nav>

                        {/* Search and Menu */}
                        <div className="flex items-center space-x-2">
                            {!showSearch ? (
                                <Button 
                                    isIconOnly 
                                    variant="light" 
                                    className="text-gray-600 hover:text-red-600"
                                    onClick={() => setShowSearch(true)}
                                >
                                    <Search size={20} />
                                </Button>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="text"
                                        placeholder="खोजें..."
                                        className="w-64"
                                        autoFocus
                                        size="sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button 
                                        variant="solid"
                                        color="danger"
                                        size="sm"
                                        onClick={handleSearch}
                                        startContent={<Search size={16} />}
                                    >
                                        खोजें
                                    </Button>
                                </div>
                            )}
                            <Button 
                                isIconOnly 
                                variant="light" 
                                className="md:hidden text-gray-600 hover:text-red-600"
                            >
                                <Menu size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}