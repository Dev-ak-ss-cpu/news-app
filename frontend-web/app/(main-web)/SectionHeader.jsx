export default function SectionHeader({ title, badgeText }) {
    return (
        <div className="flex items-center mb-6">
            {badgeText && (
                <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded mr-4">
                    {badgeText}
                </span>
            )}
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <div className="flex-1 border-b border-gray-300 ml-4"></div>
        </div>
    );
}