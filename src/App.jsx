import React, { useState, useEffect, useCallback } from 'react';
import ClothingAdvice from './components/ClothingAdvice';

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState('Nairobi');
  const [input, setInput] = useState('');
  const [unit, setUnit] = useState('metric'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('tempus_history');
    return saved ? JSON.parse(saved) : [];
  });

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Week 4: Dynamic Theme logic
  const getThemeClass = () => {
    if (!weather) return "from-slate-900 via-slate-800 to-slate-900";
    const { temp } = weather.main; 
    const celsius = unit === 'metric' ? temp : (temp - 32) * 5/9;
    if (celsius <= 15) return "from-blue-900 via-indigo-950 to-slate-900"; 
    if (celsius <= 28) return "from-cyan-900 via-slate-900 to-blue-950";
    return "from-orange-800 via-red-950 to-slate-950";
  };

  const fetchWeather = useCallback(async (targetCity) => {
    const trimmedCity = targetCity?.trim();
    if (!trimmedCity) return;
    setLoading(true);
    setError(null);
    try {
      if (!API_KEY) {
        console.error("Tempus Config Error: Missing VITE_WEATHER_API_KEY in environment.");
        setError("Configuration error: missing API key. Please check your .env setup.");
        setWeather(null);
        setForecast([]);
        return;
      }

      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmedCity)}&units=${unit}&appid=${API_KEY}`
      );
      const currentData = await currentRes.json();
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(trimmedCity)}&units=${unit}&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      if (!currentRes.ok) {
        let message = currentData?.message || "Unable to fetch current weather.";
        if (currentRes.status === 401) {
          message = "Unauthorized (401): Your API key is invalid or missing.";
        } else if (currentRes.status === 404) {
          message = "City not found (404). Please check the spelling.";
        } else if (currentRes.status === 429) {
          message = "Rate limit reached (429). Please wait a moment and try again.";
        }
        setError(message);
        setWeather(null);
        setForecast([]);
        return;
      }

      // We have valid current weather; forecast may still fail
      setWeather(currentData);
      updateHistory(trimmedCity);

      if (!forecastRes.ok) {
        let forecastMessage = forecastData?.message || "5-day forecast is temporarily unavailable.";
        if (forecastRes.status === 401) {
          forecastMessage = "Forecast unauthorized (401). Please verify your API key permissions.";
        } else if (forecastRes.status === 404) {
          forecastMessage = "Forecast data not found (404) for this location.";
        } else if (forecastRes.status === 429) {
          forecastMessage = "Forecast rate limit reached (429). Try again shortly.";
        }
        setError(prev => prev ? `${prev} Forecast: ${forecastMessage}` : forecastMessage);
        setForecast([]);
      } else {
        const daily = Array.isArray(forecastData.list)
          ? forecastData.list.filter((_, index) => index % 8 === 0)
          : [];
        setForecast(daily);
      }
    } catch (err) {
       console.error("Tempus Fetch Error:", err); 
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [API_KEY, unit]);

  const fetchWeatherByCoords = useCallback(
    async (lat, lon) => {
      if (lat == null || lon == null) return;
      setLoading(true);
      setError(null);
      try {
        if (!API_KEY) {
          console.error("Tempus Config Error: Missing VITE_WEATHER_API_KEY in environment.");
          setError("Configuration error: missing API key. Please check your .env setup.");
          setWeather(null);
          setForecast([]);
          return;
        }

        const params = `lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;

        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?${params}`
        );
        const currentData = await currentRes.json();
        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?${params}`
        );
        const forecastData = await forecastRes.json();

        if (!currentRes.ok) {
          let message = currentData?.message || "Unable to fetch current weather.";
          if (currentRes.status === 401) {
            message = "Unauthorized (401): Your API key is invalid or missing.";
          } else if (currentRes.status === 404) {
            message = "Location not found (404). Please try searching manually.";
          } else if (currentRes.status === 429) {
            message = "Rate limit reached (429). Please wait a moment and try again.";
          }
          setError(message);
          setWeather(null);
          setForecast([]);
          return;
        }

        setWeather(currentData);
        if (currentData?.name) {
          setCity(currentData.name);
          updateHistory(currentData.name);
        }

        if (!forecastRes.ok) {
          let forecastMessage = forecastData?.message || "5-day forecast is temporarily unavailable.";
          if (forecastRes.status === 401) {
            forecastMessage = "Forecast unauthorized (401). Please verify your API key permissions.";
          } else if (forecastRes.status === 404) {
            forecastMessage = "Forecast data not found (404) for this location.";
          } else if (forecastRes.status === 429) {
            forecastMessage = "Forecast rate limit reached (429). Try again shortly.";
          }
          setError(prev => prev ? `${prev} Forecast: ${forecastMessage}` : forecastMessage);
          setForecast([]);
        } else {
          const daily = Array.isArray(forecastData.list)
            ? forecastData.list.filter((_, index) => index % 8 === 0)
            : [];
          setForecast(daily);
        }
      } catch (err) {
        console.error("Tempus Fetch Error (coords):", err);
        setError("Network error while using your location. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [API_KEY, unit]
  );

  const updateHistory = (newCity) => {
    setHistory(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== newCity.toLowerCase());
      const updated = [newCity, ...filtered].slice(0, 5);
      localStorage.setItem('tempus_history', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const hasGeolocated = localStorage.getItem('tempus_geolocated');

    if (!hasGeolocated && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          fetchWeatherByCoords(coords.latitude, coords.longitude);
          localStorage.setItem('tempus_geolocated', 'true');
        },
        () => {
          fetchWeather(city);
          localStorage.setItem('tempus_geolocated', 'true');
        }
      );
    } else {
      fetchWeather(city);
    }
  }, [city, fetchWeather, fetchWeatherByCoords]);

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${getThemeClass()} text-white font-sans`}>
      <div className="tempus-container">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="tempus-header-title">
              TEMPUS
            </h1>
            <p className="text-white/40 text-xs font-bold tracking-widest uppercase">Project Milestone 4</p>
          </div>
          <button 
            onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}
            className="tempus-toggle"
          >
            {unit === 'metric' ? '°C' : '°F'}
          </button>
        </header>

        {/* Search Section */}
        <section className="relative max-w-2xl mx-auto mb-16">
          <div className="tempus-search-container">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const trimmed = input.trim();
                  if (trimmed) setCity(trimmed);
                }
              }}
              placeholder="Enter city (e.g. Nairobi)..." 
              className="tempus-input disabled:cursor-not-allowed"
              disabled={loading}
            />
            <button 
              onClick={() => { 
                const trimmed = input.trim();
                if (trimmed) setCity(trimmed); 
              }}
              className={`tempus-search-btn ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </div>

          {/* History Chips */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {history.map((h, i) => (
              <button 
                key={i} 
                onClick={() => setCity(h)}
                className="tempus-history-btn"
              >
                {h}
              </button>
            ))}
          </div>
        </section>

        {loading && <div className="text-center animate-pulse text-white/50 font-bold tracking-widest py-10">SYNCING ATMOSPHERE...</div>}
        {error && <div className="tempus-error">⚠️ {error}</div>}

        {weather && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
            {/* UNIQUE HERO SECTION: Giant Temperature & City */}
            <div className="tempus-hero">
              <div className="relative z-10">
                <h2 className="text-8xl font-black tracking-tighter">{weather.name}</h2>
                <p className="text-2xl opacity-50 font-medium capitalize">{weather.weather[0].description}</p>
                <div className="text-[15rem] font-black leading-none mt-10 tracking-tighter drop-shadow-2xl">
                  {Math.round(weather.main.temp)}°
                </div>
              </div>
              {/* Floating Weather Icon as a watermark */}
              <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                   className="absolute -right-20 -bottom-20 w-96 h-96 opacity-10 grayscale brightness-200" alt="" />
            </div>

            {/* SIDEBAR: Glass Stats, Style Tip & 5‑Day Forecast */}
            <div className="tempus-sidebar">
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 shadow-xl">
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="uppercase text-[10px] font-black tracking-widest opacity-40">Humidity</span>
                    <span className="font-bold">{weather.main.humidity}%</span>
                  </div>
                  {/* Your Style Tip component will sit here, beautifully formatted */}
                  <ClothingAdvice 
                    temp={weather.main.temp} 
                    condition={weather.weather[0].main} 
                    unit={unit} 
                    windSpeed={weather.wind?.speed}
                  />
                </div>
              </div>

              {/* 5‑Day Mini Forecast (re‑added to avoid unused warning) */}
              <div className="bg-black/20 border border-white/5 p-8 rounded-[3rem] backdrop-blur-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 text-center">5-Day Outlook</h3>
                <div className="flex justify-between gap-2 overflow-x-auto pb-2">
                  {forecast.map((day, i) => (
                    <div key={i} className="flex-1 text-center min-w-[60px]">
                      <p className="text-[10px] font-bold text-white/40 mb-2">{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <div className="text-lg font-black">{Math.round(day.main.temp)}°</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;