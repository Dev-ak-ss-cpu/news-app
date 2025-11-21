import { Card, CardBody } from '@heroui/react';

export default function CategoryCard({ name, count, color, icon }) {
    return (
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4 text-center">
                <div className="text-3xl mb-2">{icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{name}</h3>
                <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`}></div>
                    <span className="text-sm text-gray-600">{count} खबरें</span>
                </div>
            </CardBody>
        </Card>
    );
}