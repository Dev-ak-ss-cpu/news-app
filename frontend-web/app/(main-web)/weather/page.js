"use client"
// Weather.jsx
import { useState, useEffect } from 'react';
import {
  Search,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  MapPin,
  Calendar,
  ChevronRight,
  RefreshCw,
  Menu,
  X,
  Navigation
} from 'lucide-react';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Delhi');
  const [unit, setUnit] = useState('metric');
  const [searchInput, setSearchInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Color palette based on Oklch(27.1134% -.956401 -12.3224)
  const colorPalette = {
    primary: '#1a365d',
    primaryLight: '#2d4a8a',
    primaryDark: '#0f2547',
    secondary: '#4a5568',
    accent: '#718096',
    backgroundLight: '#f7fafc',
    backgroundDark: '#edf2f7',
    cardBg: '#ffffff',
    textPrimary: '#1a202c',
    textSecondary: '#4a5568',
    success: '#38a169',
    warning: '#d69e2e',
    error: '#e53e3e'
  };

  // OpenWeatherMap API configuration
  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  // Fetch weather data by city name
  const fetchWeatherData = async (location) => {
    try {
      setLoading(true);
      setLocationError('');

      // Fetch current weather
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?q=${location}&units=${unit}&appid=${API_KEY}`
      );
      const weatherData = await weatherResponse.json();

      if (weatherData.cod !== 200) {
        throw new Error(weatherData.message || 'City not found');
      }

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${location}&units=${unit}&appid=${API_KEY}`
      );
      const forecastData = await forecastResponse.json();

      if (forecastData.cod !== '200') {
        throw new Error('Forecast data unavailable');
      }

      setWeatherData(weatherData);

      // Filter forecast to show one per day
      const dailyForecast = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5);
      setForecastData(dailyForecast);
      setCity(weatherData.name);

    } catch (error) {
      console.error('Error fetching weather data:', error);
      setLocationError(error.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather data by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      setLocationError('');

      // Fetch current weather by coordinates
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
      );
      const weatherData = await weatherResponse.json();

      if (weatherData.cod !== 200) {
        throw new Error('Failed to fetch weather for current location');
      }

      // Fetch 5-day forecast by coordinates
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
      );
      const forecastData = await forecastResponse.json();

      if (forecastData.cod !== '200') {
        throw new Error('Forecast data unavailable');
      }

      setWeatherData(weatherData);

      // Filter forecast to show one per day
      const dailyForecast = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5);
      setForecastData(dailyForecast);
      setCity(weatherData.name);

    } catch (error) {
      console.error('Error fetching weather by coordinates:', error);
      setLocationError(error.message || 'Failed to fetch weather for current location');
    } finally {
      setLoading(false);
      setFetchingLocation(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    try {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser');
        return;
      }

      setFetchingLocation(true);
      setLocationError('');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          setLocationError('Unable to retrieve your location. Please enable location services.');
          setFetchingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {

    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeatherData(searchInput.trim());
      setSearchInput('');
      setMobileMenuOpen(false);
    }
  };

  // Toggle unit
  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    if (city) {
      fetchWeatherData(city);
    }
  };

  // Get weather icon
  const getWeatherIcon = (condition) => {
    const conditionId = condition?.id || 800;

    if (conditionId >= 200 && conditionId < 300) {
      return CloudRain;
    } else if (conditionId >= 300 && conditionId < 600) {
      return CloudRain;
    } else if (conditionId >= 600 && conditionId < 700) {
      return CloudSnow;
    } else if (conditionId >= 700 && conditionId < 800) {
      return Wind;
    } else if (conditionId === 800) {
      return Sun;
    } else {
      return Cloud;
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Popular cities for quick selection
  const popularCities = ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad'];

  // Initialize with default city
  useEffect(() => {
    fetchWeatherData('Delhi');
  }, []);

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${colorPalette.backgroundLight}, ${colorPalette.backgroundDark})` }}>
        <div className="text-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto" style={{ borderColor: colorPalette.primary }}></div>
          <p className="mt-4" style={{ color: colorPalette.textSecondary }}>Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${colorPalette.backgroundLight}, ${colorPalette.backgroundDark})` }}>
      {/* Header */}
      <header style={{ background: `linear-gradient(135deg, ${colorPalette.primary}, ${colorPalette.primaryDark})` }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md transition-colors"
                style={{ backgroundColor: colorPalette.primaryLight, color: 'white' }}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">JkJkabar</h1>
                <p className="text-sm" style={{ color: '#a0aec0' }}>Weather Intelligence Dashboard</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={getCurrentLocation}
                disabled={fetchingLocation}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: colorPalette.primaryLight,
                  color: 'white'
                }}
              >
                <Navigation size={18} />
                <span>{fetchingLocation ? 'Locating...' : 'Current Location'}</span>
              </button>

              <button
                onClick={toggleUnit}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: colorPalette.primaryLight,
                  color: 'white'
                }}
              >
                <Thermometer size={18} />
                <span>{unit === 'metric' ? '°C' : '°F'}</span>
              </button>

              <button
                onClick={() => fetchWeatherData(city)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: colorPalette.primaryLight,
                  color: 'white'
                }}
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: colorPalette.accent }} size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for a city..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 rounded-md font-medium transition-colors"
                style={{
                  backgroundColor: 'white',
                  color: colorPalette.primary
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Location Error */}
      {locationError && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{locationError}</p>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden shadow-lg" style={{ backgroundColor: colorPalette.cardBg }}>
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-3">
              <button
                onClick={getCurrentLocation}
                disabled={fetchingLocation}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: colorPalette.backgroundDark,
                  color: colorPalette.textPrimary
                }}
              >
                <Navigation size={18} />
                <span>{fetchingLocation ? 'Locating...' : 'Use Current Location'}</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={toggleUnit}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: colorPalette.backgroundDark,
                    color: colorPalette.textPrimary
                  }}
                >
                  <Thermometer size={18} />
                  <span>{unit === 'metric' ? '°C' : '°F'}</span>
                </button>
                <button
                  onClick={() => fetchWeatherData(city)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: colorPalette.backgroundDark,
                    color: colorPalette.textPrimary
                  }}
                >
                  <RefreshCw size={18} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2" style={{ color: colorPalette.textPrimary }}>Popular Cities</h4>
              <div className="flex flex-wrap gap-2">
                {popularCities.map((popularCity) => (
                  <button
                    key={popularCity}
                    onClick={() => {
                      fetchWeatherData(popularCity);
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: colorPalette.backgroundDark,
                      color: colorPalette.textPrimary
                    }}
                  >
                    {popularCity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Current Weather */}
        {weatherData && (
          <div className="rounded-2xl shadow-xl overflow-hidden mb-8" style={{ backgroundColor: colorPalette.cardBg }}>
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin size={20} style={{ color: colorPalette.primary }} />
                    <h2 className="text-2xl font-bold" style={{ color: colorPalette.textPrimary }}>
                      {weatherData.name}, {weatherData.sys.country}
                    </h2>
                  </div>
                  <p style={{ color: colorPalette.textSecondary }}>
                    {formatDate(weatherData.dt)} • {formatTime(weatherData.dt)}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-5xl font-light" style={{ color: colorPalette.textPrimary }}>
                        {Math.round(weatherData.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                      </p>
                      <p className="capitalize" style={{ color: colorPalette.textSecondary }}>
                        {weatherData.weather[0].description}
                      </p>
                    </div>
                    <div style={{ color: colorPalette.primary }}>
                      {(() => {
                        const Icon = getWeatherIcon(weatherData.weather[0]);
                        return <Icon size={64} />;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="p-4 rounded-xl" style={{ backgroundColor: colorPalette.backgroundLight }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: colorPalette.backgroundDark }}>
                      <Thermometer size={20} style={{ color: colorPalette.primary }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colorPalette.textSecondary }}>Feels Like</p>
                      <p className="text-lg font-semibold" style={{ color: colorPalette.textPrimary }}>
                        {Math.round(weatherData.main.feels_like)}°
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: colorPalette.backgroundLight }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: colorPalette.backgroundDark }}>
                      <Droplets size={20} style={{ color: colorPalette.primary }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colorPalette.textSecondary }}>Humidity</p>
                      <p className="text-lg font-semibold" style={{ color: colorPalette.textPrimary }}>
                        {weatherData.main.humidity}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: colorPalette.backgroundLight }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: colorPalette.backgroundDark }}>
                      <Wind size={20} style={{ color: colorPalette.primary }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colorPalette.textSecondary }}>Wind Speed</p>
                      <p className="text-lg font-semibold" style={{ color: colorPalette.textPrimary }}>
                        {weatherData.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: colorPalette.backgroundLight }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: colorPalette.backgroundDark }}>
                      <Gauge size={20} style={{ color: colorPalette.primary }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colorPalette.textSecondary }}>Pressure</p>
                      <p className="text-lg font-semibold" style={{ color: colorPalette.textPrimary }}>
                        {weatherData.main.pressure} hPa
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forecast Section */}
        <div className="rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: colorPalette.cardBg }}>
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Calendar size={24} style={{ color: colorPalette.primary }} />
                <h3 className="text-xl font-bold" style={{ color: colorPalette.textPrimary }}>5-Day Forecast</h3>
              </div>
              <ChevronRight size={20} style={{ color: colorPalette.accent }} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {forecastData.map((day, index) => {
                const WeatherIcon = getWeatherIcon(day.weather[0]);
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl transition-colors hover:bg-opacity-50"
                    style={{
                      backgroundColor: colorPalette.backgroundLight,
                      color: colorPalette.textPrimary
                    }}
                  >
                    <p className="font-medium mb-2" style={{ color: colorPalette.textPrimary }}>
                      {index === 0 ? 'Tomorrow' : formatDate(day.dt)}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-2xl font-light" style={{ color: colorPalette.textPrimary }}>
                        {Math.round(day.main.temp_max)}°/{Math.round(day.main.temp_min)}°
                      </div>
                      <WeatherIcon size={32} style={{ color: colorPalette.primary }} />
                    </div>
                    <p className="text-sm capitalize" style={{ color: colorPalette.textSecondary }}>
                      {day.weather[0].description}
                    </p>
                    <div className="flex justify-between text-sm mt-3" style={{ color: colorPalette.accent }}>
                      <span className="flex items-center">
                        <Droplets size={14} className="mr-1" />
                        {day.main.humidity}%
                      </span>
                      <span className="flex items-center">
                        <Wind size={14} className="mr-1" />
                        {day.wind.speed}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Cities */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4" style={{ color: colorPalette.textPrimary }}>Popular Cities</h4>
          <div className="flex flex-wrap gap-3">
            {popularCities.map((popularCity) => (
              <button
                key={popularCity}
                onClick={() => fetchWeatherData(popularCity)}
                className={`px-5 py-3 rounded-xl transition-all ${city === popularCity
                  ? 'shadow-lg'
                  : 'shadow hover:opacity-90'
                  }`}
                style={{
                  backgroundColor: city === popularCity ? colorPalette.primary : colorPalette.cardBg,
                  color: city === popularCity ? 'white' : colorPalette.textPrimary,
                  border: city === popularCity ? 'none' : `1px solid ${colorPalette.backgroundDark}`
                }}
              >
                {popularCity}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Weather;