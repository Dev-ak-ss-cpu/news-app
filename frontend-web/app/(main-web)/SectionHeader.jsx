import Link from "next/link";

export default function SectionHeader({ title, badgeText, href, linkText }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            {badgeText && (
                <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded shrink-0">
                    {badgeText}
                </span>
            )}

            {/* Accent bar */}
            <span className="h-7 w-1.5 rounded-full bg-linear-to-b from-red-500 to-orange-500 shrink-0"></span>

            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight shrink-0">
                {title}
            </h2>

            <div className="flex-1 h-px bg-linear-to-r from-gray-300 via-gray-200 to-transparent"></div>

            {href && (
                <Link
                    href={href}
                    className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0"
                >
                    {linkText || "View All"} →
                </Link>
            )}
        </div>
    );
}
