"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              कुछ गड़बड़ हो गई
            </h1>
            <p className="text-gray-600 mb-8">
              पेज लोड करते समय एक अनपेक्षित त्रुटि हुई। कृपया दोबारा कोशिश करें।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => reset()}
                className="rounded-full bg-red-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
              >
                पुनः प्रयास करें
              </button>
              <Link
                href="/"
                className="rounded-full border border-gray-200 px-6 py-2.5 font-semibold text-gray-800 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                होम पेज पर जाएं
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
