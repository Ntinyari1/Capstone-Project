import React, { useState, useEffect, useCallback } from 'react';
import ClothingAdvice from './components/ClothingAdvice';
import SettingsDrawer from './components/SettingsDrawer';
import ForecastDetailsDrawer from './components/ForecastDetailsDrawer';

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [forecastRaw, setForecastRaw] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsDayKey, setDetailsDayKey] = useState(null);
  const [city, setCity] = useState('Nairobi');
  const [input, setInput] = useState('');
  const [unit, setUnit] = useState('metric'); 
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lockScreen, setLockScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('tempus_lock_screen') === 'true';
  });
  const [notifications, setNotifications] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('tempus_notifications');
    return stored === null ? true : stored === 'true';
  });
  const [statusBar, setStatusBar] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('tempus_status_bar');
    return stored === null ? true : stored === 'true';
  });
  const [manageLocationRequested, setManageLocationRequested] = useState(0);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('tempus_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('tempus_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [showDaily, setShowDaily] = useState(false);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const toCelsius = useCallback((value) => {
    if (typeof value !== 'number') return null;
    return unit === 'metric' ? value : (value - 32) * 5 / 9;
  }, [unit]);

  const buildDailyForecast = useCallback((list) => {
    if (!Array.isArray(list)) return [];

    const byDay = new Map();
    for (const item of list) {
      const date = new Date(item.dt * 1000);
      const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
      const entry = byDay.get(key) || {
        key,
        date,
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
        icon: item.weather?.[0]?.icon,
        main: item.weather?.[0]?.main,
      };

      const tMin = item.main?.temp_min ?? item.main?.temp;
      const tMax = item.main?.temp_max ?? item.main?.temp;
      if (typeof tMin === 'number') entry.min = Math.min(entry.min, tMin);
      if (typeof tMax === 'number') entry.max = Math.max(entry.max, tMax);

      // Prefer an icon near midday for a more representative daily icon
      const hour = date.getHours();
      if (hour >= 11 && hour <= 14) {
        entry.icon = item.weather?.[0]?.icon ?? entry.icon;
        entry.main = item.weather?.[0]?.main ?? entry.main;
      }

      byDay.set(key, entry);
    }

    return Array.from(byDay.values())
      .sort((a, b) => a.date - b.date)
      .slice(0, 7)
      .map(d => ({
        key: d.key,
        date: d.date,
        min: Number.isFinite(d.min) ? d.min : null,
        max: Number.isFinite(d.max) ? d.max : null,
        icon: d.icon,
        main: d.main,
      }));
  }, []);

  
  const getThemeClass = () => {
    if (!weather) return theme === 'dark'
      ? "from-slate-900 via-slate-800 to-slate-900"
      : "from-sky-700 via-sky-800 to-slate-900";
    const { temp } = weather.main; 
    const celsius = unit === 'metric' ? temp : (temp - 32) * 5/9;
    if (celsius <= 15) {
      return theme === 'dark'
        ? "from-blue-900 via-indigo-950 to-slate-900"
        : "from-sky-700 via-sky-800 to-slate-900";
    }
    if (celsius <= 28) {
      return theme === 'dark'
        ? "from-cyan-900 via-slate-900 to-blue-950"
        : "from-sky-600 via-sky-700 to-slate-900";
    }
    return theme === 'dark'
      ? "from-orange-800 via-red-950 to-slate-950"
      : "from-orange-600 via-rose-700 to-slate-900";
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
        setHourly([]);
        setForecastRaw([]);
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
        setHourly([]);
        setForecastRaw([]);
        return;
      }

      
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
        setHourly([]);
        setForecastRaw([]);
      } else {
        const list = Array.isArray(forecastData.list) ? forecastData.list : [];
        setHourly(list.slice(0, 8));
        setForecast(buildDailyForecast(list));
        setForecastRaw(list);
      }
    } catch (err) {
       console.error("Tempus Fetch Error:", err); 
        setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [API_KEY, unit, buildDailyForecast]);

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
          setHourly([]);
          setForecastRaw([]);
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
          setHourly([]);
          setForecastRaw([]);
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
          setHourly([]);
          setForecastRaw([]);
        } else {
          const list = Array.isArray(forecastData.list) ? forecastData.list : [];
          setHourly(list.slice(0, 8));
          setForecast(buildDailyForecast(list));
          setForecastRaw(list);
        }
      } catch (err) {
        console.error("Tempus Fetch Error (coords):", err);
        setError("Network error while using your location. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [API_KEY, unit, buildDailyForecast]
  );

  const updateHistory = (newCity) => {
    setHistory(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== newCity.toLowerCase());
      const updated = [newCity, ...filtered].slice(0, 5);
      localStorage.setItem('tempus_history', JSON.stringify(updated));
      localStorage.setItem('tempus_last_city', newCity);
      return updated;
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      fetchWeather(city);
      return;
    }

    const savedCity = localStorage.getItem('tempus_last_city');

    if (lockScreen && savedCity && savedCity !== city) {
      setCity(savedCity);
      return;
    }

    const hasGeolocated = localStorage.getItem('tempus_geolocated');

    if (!lockScreen && !hasGeolocated && navigator.geolocation) {
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
  }, [city, fetchWeather, fetchWeatherByCoords, lockScreen]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.toggle('dark', theme === 'dark');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('tempus_theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('tempus_lock_screen', String(lockScreen));
  }, [lockScreen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('tempus_notifications', String(notifications));
  }, [notifications]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('tempus_status_bar', String(statusBar));
  }, [statusBar]);

  useEffect(() => {
    if (!manageLocationRequested) return;
    const el = document.getElementById('tempus-city-input');
    if (el && typeof el.focus === 'function') {
      el.focus();
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [manageLocationRequested]);

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${getThemeClass()} font-sans text-slate-900 dark:text-white`}>
      <div className="tempus-container">
        {statusBar && weather && (
          <div className="mb-4 px-4 py-2 rounded-2xl bg-black/10 dark:bg-black/40 border border-white/20 flex items-center justify-between text-xs tracking-widest uppercase text-slate-800/80 dark:text-white/60">
            <span>{weather.name}</span>
            <span>{Math.round(weather.main.temp)}° · {weather.weather[0].main}</span>
          </div>
        )}

        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/20 text-slate-700 dark:text-white/80 backdrop-blur-xl"
              aria-label="Open settings"
            >
              <span className="block w-4 h-[2px] bg-current mb-[3px]" />
              <span className="block w-4 h-[2px] bg-current mb-[3px]" />
              <span className="block w-4 h-[2px] bg-current" />
            </button>
            <h1 className="tempus-header-title">
              TEMPUS
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}
              className="tempus-toggle"
            >
              {unit === 'metric' ? '°C' : '°F'}
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="tempus-toggle"
            >
              {theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>
        </header>

        {/* Search Section */}
        <section className="relative max-w-2xl mx-auto mb-16">
          <div className="tempus-search-container">
            <input 
              id="tempus-city-input"
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

        {loading && <div className="text-center animate-pulse text-slate-700/60 dark:text-white/50 font-bold tracking-widest py-10">SYNCING ATMOSPHERE...</div>}
        {error && <div className="tempus-error">⚠️ {error}</div>}

        {weather && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
            
            <div className="tempus-hero">
              <div className="relative z-10">
                <h2 className="text-8xl font-black tracking-tighter">{weather.name}</h2>
                <p className="text-2xl text-slate-700/60 dark:text-white/50 font-medium capitalize">{weather.weather[0].description}</p>
                <div className="text-[15rem] font-black leading-none mt-10 tracking-tighter drop-shadow-2xl">
                  {Math.round(weather.main.temp)}°
                </div>
              </div>
            
                            <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                   className="absolute -right-20 -bottom-20 w-96 h-96 opacity-10 grayscale brightness-200" alt="" />
            </div>

            
            <div className="tempus-sidebar">
              <div className="tempus-card">
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="uppercase text-[10px] font-black tracking-widest text-slate-600/70 dark:text-white/40">Humidity</span>
                    <span className="font-bold">{weather.main.humidity}%</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="uppercase text-[10px] font-black tracking-widest text-slate-600/70 dark:text-white/40">Wind</span>
                    <span className="font-bold">
                      {Math.round(weather.wind?.speed ?? 0)} {unit === 'metric' ? 'm/s' : 'mph'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="uppercase text-[10px] font-black tracking-widest text-slate-600/70 dark:text-white/40">Feels like</span>
                    <span className="font-bold">{Math.round(weather.main.feels_like)}°</span>
                  </div>
                </div>
              </div>

        
              <div className="tempus-forecast">
                {/* Hourly strip */}
                <div className="flex items-end justify-between gap-3 overflow-x-auto pb-3 border-b border-white/10">
                  {hourly.map((h) => (
                    <div key={h.dt} className="min-w-[56px] text-center">
                      <p className="text-[10px] font-bold text-slate-700/60 dark:text-white/50">
                        {new Date(h.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${h.weather?.[0]?.icon}.png`}
                        alt=""
                        className="mx-auto w-8 h-8 opacity-90"
                      />
                      <p className="text-sm font-black">{Math.round(h.main?.temp)}°</p>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setShowDaily(true);
                      const el = document.getElementById('tempus-daily-forecast');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="min-w-[56px] text-right text-xs font-bold text-slate-700/70 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    More…
                  </button>
                </div>

                {/* Daily 7-day forecast list*/}
                {forecast.length > 0 && showDaily && (
                  <div id="tempus-daily-forecast" className="pt-4 space-y-3">
                    {forecast.map((d, index) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => {
                          setDetailsDayKey(d.key);
                          setDetailsOpen(true);
                        }}
                        className="block w-full text-left pt-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-28 text-sm font-semibold text-slate-700/80 dark:text-white/90">
                            {d.date.toLocaleDateString('en-US', { weekday: 'long' })}
                          </div>

                          <div className="flex-1 border-t border-white/20" />

                          {d.icon && (
                            <img
                              src={`https://openweathermap.org/img/wn/${d.icon}.png`}
                              alt=""
                              className="w-7 h-7 opacity-90"
                            />
                          )}

                          <div className="w-20 text-right text-sm font-bold tabular-nums">
                            <span className="text-slate-700/70 dark:text-white/70">
                              {d.min != null ? `${Math.round(d.min)}°` : '--'}
                            </span>
                            <span className="mx-1 text-slate-400 dark:text-white/40">/</span>
                            <span className="text-slate-900 dark:text-white">
                              {d.max != null ? `${Math.round(d.max)}°` : '--'}
                            </span>
                          </div>
                        </div>
                        {index < forecast.length - 1 && (
                          <div className="border-b border-white/10 mt-2" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dressing suggestions  */}
              <div className="tempus-card">
                <ClothingAdvice 
                  temp={weather.main.temp} 
                  condition={weather.weather[0].main} 
                  unit={unit} 
                  windSpeed={weather.wind?.speed}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        unit={unit}
        onUnitChange={setUnit}
        onManageLocation={() => setManageLocationRequested(v => v + 1)}
        lockScreen={lockScreen}
        onToggleLockScreen={() => setLockScreen(v => !v)}
        notifications={notifications}
        onToggleNotifications={() => setNotifications(v => !v)}
        statusBar={statusBar}
        onToggleStatusBar={() => setStatusBar(v => !v)}
        onOpenRadar={() => {
          if (typeof window !== 'undefined') {
            window.open('https://www.rainviewer.com/weather-radar-live.html', '_blank', 'noopener,noreferrer');
          }
        }}
        onRate={() => {
          if (typeof window !== 'undefined') {
            window.open('https://github.com/Ntinyari1/Capstone-Project', '_blank', 'noopener,noreferrer');
          }
        }}
        onAbout={() => {
          if (typeof window !== 'undefined') {
            window.open('https://github.com/Ntinyari1/Capstone-Project#readme', '_blank', 'noopener,noreferrer');
          }
        }}
      />
      <ForecastDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        cityLabel={weather?.name}
        list={forecastRaw}
        dayKey={detailsDayKey}
        unit={unit}
      />
    </div>
  );
}

export default App;