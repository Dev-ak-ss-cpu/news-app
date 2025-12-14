import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initializeUserDataWatcher } from "./utils/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Jk khabar - Latest Breaking News & Updates",
    template: "%s | News Portal"
  },
  description: "Get the latest breaking news, trending stories, and in-depth coverage on politics, sports, entertainment, technology, and more. Stay informed with real-time updates.",
  keywords: ["news", "breaking news", "latest news", "trending news", "politics", "sports", "entertainment", "technology", "current affairs"],
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
        url: '/favicon.jpg',
        width: 1200,
        height: 630,
        alt: 'News Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News Portal - Latest Breaking News & Updates',
    description: 'Get the latest breaking news, trending stories, and in-depth coverage.',
    images: ['/favicon.jpg'],
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
      { url: '/favicon.jpg', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/favicon.jpg', sizes: '180x180', type: 'image/jpeg' },
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
        {children}
      </body>
    </html>
  );
}
