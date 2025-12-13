import Image from "next/image";
import Link from "next/link";

export default function Footer({ rootCategories = [] }) {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12 page-end-marker">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Image
              src="/logo.png"
              alt="JK Khabar NOW DIGITAL"
              width={180}
              height={180}
              className="object-contain"
              priority
            />
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4">श्रेणियाँ</h4>
            <ul className="space-y-2 text-gray-400">
              {rootCategories.slice(0, 4).map((category) => (
                <li key={category._id}>
                  <Link 
                    href={`/${category.slug}`} 
                    className="hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">जल्दी लिंक</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white">होम</Link></li>
              <li><a href="/breaking" className="hover:text-white">ताज़ा खबर</a></li>
              <li><a href="/trending" className="hover:text-white">ट्रेंडिंग न्यूज़</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">संपर्क</h4>
            <p className="text-gray-400">
              ईमेल: nowjkkhabar@gmail.com<br />
              फोन: +91-9873135821
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2024 न्यूज़. सभी अधिकार सुरक्षित</p>
        </div>
      </div>
    </footer>
  );
}