const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'Weather Updates - Local & National Forecast',
  description: 'Check the latest weather forecast, temperature, and conditions for your city and across the country.',
  alternates: {
    canonical: `${SITE_URL}/weather`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/weather`,
    siteName: 'JK Khabar NOW DIGITAL',
    title: 'Weather Updates - Local & National Forecast',
    description: 'Check the latest weather forecast, temperature, and conditions for your city and across the country.',
  },
};

export default function WeatherLayout({ children }) {
  return children;
}
