import Link from "next/link";
import { Home, Search } from "lucide-react";

export const metadata = {
  title: "पेज नहीं मिला",
  description: "आप जिस पेज को खोज रहे हैं वह मौजूद नहीं है।",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MainNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-8xl font-black tracking-tight bg-linear-to-b from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
          404
        </p>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          पेज नहीं मिला
        </h1>
        <p className="text-gray-600 mb-8">
          आप जिस पेज को खोज रहे हैं वह हटा दिया गया है या मौजूद नहीं है।
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
          >
            <Home size={18} />
            होम पेज पर जाएं
          </Link>
          <Link
            href="/trending"
            className="flex items-center gap-2 rounded-full border border-gray-200 px-6 py-2.5 font-semibold text-gray-800 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Search size={18} />
            ट्रेंडिंग न्यूज़ देखें
          </Link>
        </div>
      </div>
    </div>
  );
}
