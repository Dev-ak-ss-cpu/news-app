import { Card, CardBody } from "@heroui/react";

export default function CategoryCard({ name, count, color, icon }) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer rounded-xl overflow-hidden">
      <CardBody className="p-6 text-center flex flex-col items-center justify-center min-h-[140px]">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="font-bold text-gray-900 mb-3 text-base">{name}</h3>
        <div className="flex items-center justify-center gap-2 mt-auto">
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
          <span className="text-sm text-gray-600 font-medium">
            {count} खबरें 
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
