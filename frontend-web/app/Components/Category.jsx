export default function CategoryCard({ name, count, color, icon }) {
  return (
    <div className="group flex h-full min-h-35 cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg">
      <div className="mb-3 text-4xl transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-3 text-base font-bold text-gray-900 transition-colors group-hover:text-red-700">
        {name}
      </h3>
      <div className="mt-auto flex items-center justify-center gap-2">
        <span className={`h-2 w-2 rounded-full ${color}`}></span>
        <span className="text-sm font-medium text-gray-600">
          {count} खबरें
        </span>
      </div>
    </div>
  );
}
