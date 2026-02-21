import React, { useState, useEffect, useCallback } from 'react';
import ClothingAdvice from './components/ClothingAdvice';

function App() {
  // --- 1. State Management ---
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]); // Week 4: Forecast State
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

  // --- 2. Dynamic Theme Logic (Week 4) ---
  const getThemeClass = () => {
    if (!weather) return "from-slate-950 via-slate-900 to-blue-950";
    const temp = weather.main.temp;
    const celsius = unit === 'metric' ? temp : (temp - 32) * 5/9;

    if (celsius <= 15) return "from-blue-900 via-slate-900 to-gray-900"; // Cold
    if (celsius <= 28) return "from-blue-700 via-slate-900 to-cyan-900"; // Mild
    return "from-orange-700 via-slate-900 to-red-950"; // Hot
  };

  // --- 3. Data Engine (Current + Forecast) ---
  const fetchWeather = useCallback(async (targetCity) => {
    if (!targetCity) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch Current Weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${targetCity}&units=${unit}&appid=${API_KEY}`
      );
      const currentData = await currentRes.json();

      // Fetch 5-Day Forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${targetCity}&units=${unit}&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      if (currentRes.ok && forecastRes.ok) {
        setWeather(currentData);
        // Filter forecast: one entry per day (API provides data every 3 hours)
        const daily = forecastData.list.filter((_, index) => index % 8 === 0);
        setForecast(daily);
        updateHistory(targetCity);
      } else {
        setError(currentData.message || "City not found");
        setWeather(null);
      }
    } catch (err) {
      console.error("Tempus Fetch Error:", err); 
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [API_KEY, unit]);

  // --- 4. History Logic ---
  const updateHistory = (newCity) => {
    setHistory(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== newCity.toLowerCase());
      const updated = [newCity, ...filtered].slice(0, 5);
      localStorage.setItem('tempus_history', JSON.stringify(updated));
      return updated;
    });
  };

  // --- 5. Side Effects ---
  useEffect(() => {
    fetchWeather(city);
    const interval = setInterval(() => fetchWeather(city), 300000); 
    return () => clearInterval(interval);
  }, [city, fetchWeather]);

  return (
    <div className={`min-h-screen transition-colors duration-1000 bg-gradient-to-br ${getThemeClass()} text-slate-100 p-4 md:p-10 font-sans`}>
      <div className="max-w-5xl mx-auto">
        
        <header className="text-center mb-10">
          <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 mb-2">
            TEMPUS
          </h1>
          <p className="text-slate-300 font-medium">Week 4: Advanced Forecast • 2026</p>
        </header>

        {/* Search Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setCity(input)}
              placeholder="Enter city..." 
              className="w-full md:w-96 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl focus:ring-2 focus:ring-white/30 outline-none transition-all placeholder:text-slate-400"
            />
            <button 
              onClick={() => { if(input.trim()) setCity(input); }}
              className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all shadow-xl"
            >
              Search
            </button>
          </div>

          {history.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {history.map((h, i) => (
                <button 
                  key={i} 
                  onClick={() => setCity(h)}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium backdrop-blur-md border border-white/5"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </section>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-2xl text-center mb-8 max-w-sm mx-auto backdrop-blur-md">⚠️ {error}</div>}
        {loading && <div className="text-center animate-pulse text-white mb-8 font-medium">Updating atmosphere...</div>}

        {weather && (
          <div className="space-y-6">
            <main className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Main Weather Card */}
              <div className="md:col-span-2 bg-white/10 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-5xl font-bold">{weather.name}</h2>
                    <button 
                      onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}
                      className="text-white/60 text-sm mt-2 hover:text-white transition-colors"
                    >
                      Show in {unit === 'metric' ? 'Fahrenheit' : 'Celsius'}
                    </button>
                  </div>
                  <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} alt="icon" className="w-24 h-24 -mt-4 drop-shadow-2xl"/>
                </div>
                <div className="mt-8">
                  <div className="text-9xl font-black">{Math.round(weather.main.temp)}°</div>
                  <p className="text-2xl text-white/80 font-medium capitalize">{weather.weather[0].description}</p>
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className="bg-white/10 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl flex flex-col justify-center gap-6">
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/50">Humidity</span>
                  <span className="font-bold text-lg">{weather.main.humidity}%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/50">Wind Speed</span>
                  <span className="font-bold text-lg">{weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/50">Feels Like</span>
                  <span className="font-bold text-lg">{Math.round(weather.main.feels_like)}°</span>
                </div>
                
                <ClothingAdvice 
                  temp={weather.main.temp} 
                  condition={weather.weather[0].main} 
                  unit={unit} 
                />
              </div>
            </main>

            {/* Week 4: Forecast Grid */}
            <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
              <h3 className="text-xl font-bold mb-6 px-2">5-Day Forecast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {forecast.map((day, index) => (
                  <div key={index} className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center hover:bg-white/10 transition-all">
                    <p className="text-sm font-medium text-white/60 mb-2">
                      {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <img 
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} 
                      alt="forecast icon" 
                      className="mx-auto w-12 h-12"
                    />
                    <p className="text-2xl font-bold mt-2">{Math.round(day.main.temp)}°</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{day.weather[0].main}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;