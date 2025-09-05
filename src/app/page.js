"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import {
  MapPin,
  Wind,
  Droplets,
  AlertTriangle,
  Search,
  Navigation,
} from "lucide-react";

// Lazy load Map component
const Map = lazy(() => import("@/components/Map"));

export default function Home() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch weather by city name or coordinates
  const fetchWeather = async (params) => {
    setLoading(true);
    setError(null);
    const queryString = new URLSearchParams(params).toString();

    try {
      const response = await fetch(`/api/weather?${queryString}`);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch weather.");
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle fetching user's location
  const handleLocationFetch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          setError("Location access denied. Please search for a city manually.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  // Effect to fetch location on initial load
  useEffect(() => {
    handleLocationFetch();
  }, []);

  const handleSearch = () => {
    if (city) {
      fetchWeather({ city });
    } else {
      setError("Please enter a city name.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-400 flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-6xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/40">
        {/* Header and Search */}
        <header className="p-6 border-b border-white/40 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">
            Weather Dashboard
          </h1>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for a city..."
                className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 placeholder-gray-500 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 shadow-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:scale-105 transition shadow-lg disabled:from-blue-400 disabled:to-indigo-400"
            >
              <Search className="h-6 w-6" />
            </button>

            <button
              onClick={handleLocationFetch}
              title="Use My Location"
              className="p-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full hover:scale-105 transition shadow-lg"
            >
              <Navigation className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {loading && (
            <div className="text-center py-20 text-gray-700 font-semibold animate-pulse">
              Loading weather data...
            </div>
          )}
          {error && (
            <div className="text-center py-20 text-red-700 font-semibold bg-red-100 p-4 rounded-lg shadow-md">
              {error}
            </div>
          )}

          {weatherData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Current Weather & Alerts */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                    {weatherData.current.city}
                  </h2>
                  <div className="flex items-center justify-center mt-6 gap-6">
                    <img
                      src={weatherData.current.icon}
                      alt="weather icon"
                      className="w-28 h-28 drop-shadow-lg"
                    />
                    <div>
                      <div className="text-7xl font-extrabold text-gray-900">
                        {Math.round(weatherData.current.temp)}°
                      </div>
                      <p className="text-gray-600 capitalize text-lg -mt-2">
                        {weatherData.current.condition}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4 text-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-sm font-medium">
                        <Droplets className="mr-2 h-5 w-5 text-blue-500" />
                        Humidity
                      </span>
                      <span className="font-bold text-lg">
                        {weatherData.current.humidity}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-sm font-medium">
                        <Wind className="mr-2 h-5 w-5 text-gray-600" />
                        Wind
                      </span>
                      <span className="font-bold text-lg">
                        {weatherData.current.windSpeed.toFixed(1)} m/s
                      </span>
                    </div>
                  </div>
                </div>

                {weatherData.alerts.length > 0 && (
                  <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg shadow-md">
                    <h3 className="font-bold flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Alerts
                    </h3>
                    <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                      {weatherData.alerts.map((alert, index) => (
                        <li key={index}>{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: Forecast & Map */}
              <div className="lg:col-span-2 space-y-6">
                {/* Forecast */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    5-Day Forecast
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-center">
                    {weatherData.forecast.map((day, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-indigo-50 to-blue-100 p-4 rounded-xl flex flex-col items-center hover:scale-105 hover:shadow-md transition"
                      >
                        <p className="font-semibold text-gray-800">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </p>
                        <img
                          src={day.icon}
                          alt="forecast icon"
                          className="w-12 h-12 mt-2"
                        />
                        <p className="text-xl font-bold text-gray-900 mt-2">
                          {Math.round(day.temp)}°
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map */}
                <div className="h-80 bg-gray-200 rounded-2xl overflow-hidden shadow-lg">
                  <Suspense
                    fallback={
                      <div className="flex h-full items-center justify-center text-gray-600 font-medium">
                        Loading map...
                      </div>
                    }
                  >
                    {weatherData.current.coords && (
                      <Map
                        lat={weatherData.current.coords.lat}
                        lon={weatherData.current.coords.lon}
                        city={weatherData.current.city}
                      />
                    )}
                  </Suspense>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
