import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initializeUserDataWatcher } from "./utils/auth";
import JsonLd from "./Components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Organization + WebSite entity so Google can associate brand/name searches
// (e.g. "jk khabar", "khabar") with this site instead of treating it as a
// generic unbranded result.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "@id": `${SITE_URL}/#organization`,
  name: "JK Khabar NOW DIGITAL",
  alternateName: ["JK Khabar", "Khabar", "JK Khabar Now Digital"],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
  },
  sameAs: [
    "https://x.com/Jkkhabarnow1",
    "https://www.facebook.com/Jkkhabarnow/",
    "https://www.instagram.com/jkkhabarnow",
    "https://www.youtube.com/@jkkhabarnow",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+91-9873135821",
      contactType: "customer service",
      email: "nowjkkhabar@gmail.com",
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "JK Khabar NOW DIGITAL",
  inLanguage: "hi",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export const metadata = {
  title: {
    default: "Jk khabar - Latest Breaking News & Updates",
    template: "%s | News Portal"
  },
  description: "Get the latest breaking news, trending stories, and in-depth coverage on politics, sports, entertainment, technology, and more. Stay informed with real-time updates.",
  keywords: [
    "news", "breaking news", "latest news", "trending news", "politics", "sports", "entertainment", "technology", "current affairs",
    "jk khabar", "jk khabar now digital", "khabar", "jammu kashmir news", "j&k news", "news website",
  ],
  authors: [{ name: "News Portal Team" }],
  creator: "News Portal",
  publisher: "News Portal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL 
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'News Portal',
    title: 'News Portal - Latest Breaking News & Updates',
    description: 'Get the latest breaking news, trending stories, and in-depth coverage on politics, sports, entertainment, technology, and more.',
    images: [
      {
        url: '/logo.png',
        width: 1280,
        height: 940,
        alt: 'JK Khabar NOW DIGITAL',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News Portal - Latest Breaking News & Updates',
    description: 'Get the latest breaking news, trending stories, and in-depth coverage.',
    images: ['/logo.png'],
    creator: '@newsportal',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({ children }) {
  // Initialize userData watcher on client side
  if (typeof window !== 'undefined') {
    initializeUserDataWatcher();
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        {children}
      </body>
    </html>
  );
}
