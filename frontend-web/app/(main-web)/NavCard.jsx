import { Card, CardBody } from '@heroui/react';

export default function NewsCard({
    title,
    location = "Patna",
    date = "20 Nov 2025",
    category = "Election",
    tags = [],
    variant = "default"
}) {
    return (
        <Card className={`bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${variant === 'highlighted' ? 'border-l-4 border-l-red-500' : ''
            }`}>
            <CardBody className="p-4">
                <div className="flex items-center text-xs text-gray-600 mb-2">
                    <span className="font-medium">{location}</span>
                    <span className="mx-2">•</span>
                    <span>{date}</span>
                    {category && (
                        <>
                            <span className="mx-2">•</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{category}</span>
                        </>
                    )}
                </div>

                <h3 className={`font-bold text-gray-900 mb-3 ${variant === 'highlighted' ? 'text-lg' : 'text-md'
                    }`}>
                    {title}
                </h3>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tags.map((tag, index) => (
                            <span key={index} className="text-blue-600 text-xs hover:underline cursor-pointer">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}