'use client'
import { useEffect, useState } from "react";
import { Thermometer, CloudRain, Wind, Droplets, MapPin, Loader2 } from "lucide-react";
function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWeatherData();
    }, []);

    const fetchWeatherData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Replace with your actual OpenWeatherMap API key
            const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY
            const CITY = 'Delhi';
            const COUNTRY = 'IN';

            // Using Current Weather Data API from OpenWeatherMap[citation:3]
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&units=metric&appid=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            setWeather(data);
        } catch (err) {
            console.error('Weather fetch error:', err);
            setError('Weather data unavailable');
            // Fallback to static data
            setWeather({
                main: { temp: 24, feels_like: 25, humidity: 65, pressure: 1013 },
                weather: [{ description: 'Partly cloudy', main: 'Clouds' }],
                wind: { speed: 3.5 }
            });
        } finally {
            setLoading(false);
        }
    };

    // Get appropriate weather icon
    const getWeatherIcon = (condition) => {
        if (!condition) return '⛅';

        const mainCondition = condition.toLowerCase();
        if (mainCondition.includes('clear')) return '☀️';
        if (mainCondition.includes('cloud')) return '☁️';
        if (mainCondition.includes('rain')) return '🌧️';
        if (mainCondition.includes('snow')) return '❄️';
        if (mainCondition.includes('thunder')) return '⛈️';
        if (mainCondition.includes('mist') || mainCondition.includes('fog')) return '🌫️';
        return '⛅';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="text-gray-600">Loading weather...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Weather Display */}
            <div className="text-center">
                <div className="text-5xl mb-2">
                    {getWeatherIcon(weather?.weather?.[0]?.main)}
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-1">
                    {weather?.main?.temp ? Math.round(weather.main.temp) : '24'}°C
                </p>
                <p className="text-gray-700 font-medium capitalize">
                    {weather?.weather?.[0]?.description || 'हल्की धूप के साथ'}
                </p>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-md">
                        <Thermometer className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Feels Like</p>
                        <p className="font-semibold">{weather?.main?.feels_like ? Math.round(weather.main.feels_like) : '25'}°C</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-md">
                        <Droplets className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Humidity</p>
                        <p className="font-semibold">{weather?.main?.humidity || '65'}%</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-md">
                        <Wind className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Wind</p>
                        <p className="font-semibold">{weather?.wind?.speed ? weather.wind.speed.toFixed(1) : '3.5'} m/s</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-md">
                        <CloudRain className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Pressure</p>
                        <p className="font-semibold">{weather?.main?.pressure || '1013'} hPa</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-center text-sm text-red-500 bg-red-50 p-2 rounded-lg">
                    <p>{error} • Showing sample data</p>
                </div>
            )}
        </div>
    );
}
export default WeatherWidget;