"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, Home } from "lucide-react";

export default function MainError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          कुछ गड़बड़ हो गई
        </h1>
        <p className="text-gray-600 mb-8">
          यह पेज लोड करते समय एक अनपेक्षित त्रुटि हुई। कृपया दोबारा कोशिश करें।
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
          >
            <RotateCw size={18} />
            पुनः प्रयास करें
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-gray-200 px-6 py-2.5 font-semibold text-gray-800 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Home size={18} />
            होम पेज पर जाएं
          </Link>
        </div>
      </div>
    </div>
  );
}
