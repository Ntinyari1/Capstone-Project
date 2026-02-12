import React, { useState, useEffect, useCallback } from 'react';

function App() {
  // --- 1. State Management ---
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Nairobi');
  const [input, setInput] = useState('');
  const [unit, setUnit] = useState('metric'); // 'metric' = C, 'imperial' = F
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('tempus_history');
    return saved ? JSON.parse(saved) : [];
  });

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // --- 2. Data Engine (Memoized with useCallback) ---
  const fetchWeather = useCallback(async (targetCity) => {
    if (!targetCity) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${targetCity}&units=${unit}&appid=${API_KEY}`
      );
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
        // Save to history if search is successful
        updateHistory(targetCity);
      } else {
        setError(data.cod === "401" ? "API Key activating... wait 10 mins." : data.message);
        setWeather(null);
      }
    } catch (err) {
     console.error("Tempus Fetch Error:", err); 
  setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [API_KEY, unit]);

  // --- 3. History Logic ---
  const updateHistory = (newCity) => {
    setHistory(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== newCity.toLowerCase());
      const updated = [newCity, ...filtered].slice(0, 5);
      localStorage.setItem('tempus_history', JSON.stringify(updated));
      return updated;
    });
  };

  // --- 4. Side Effects (Auto-Refresh) ---
  useEffect(() => {
    fetchWeather(city);
    const interval = setInterval(() => fetchWeather(city), 300000); // 5 mins
    return () => clearInterval(interval);
  }, [city, fetchWeather]);

  // --- 5. UI Render ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <header className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
            TEMPUS
          </h1>
          <p className="text-slate-500">Weather Project • 2026</p>
        </header>

        {/* Search & History Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setCity(input)}
              placeholder="Search city..." 
              className="w-full md:w-96 p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button 
              onClick={() => { if(input.trim()) setCity(input); }}
              className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/40"
            >
              Search
            </button>
          </div>

          {/* History Chips */}
          {history.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {history.map((h, i) => (
                <button 
                  key={i} 
                  onClick={() => setCity(h)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-xs text-slate-400"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Error/Loading */}
        {error && <div className="text-red-400 bg-red-400/10 p-4 rounded-xl text-center mb-8 border border-red-400/20 max-w-sm mx-auto">⚠️ {error}</div>}
        {loading && <div className="text-center animate-pulse text-blue-400 mb-8">Fetching latest data...</div>}

        {/* Weather Display */}
        {weather && (
          <main className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
            <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-xl">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-4xl font-bold">{weather.name}</h2>
                  <button 
                    onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}
                    className="text-blue-400 text-sm mt-2 hover:underline"
                  >
                    Switch to {unit === 'metric' ? 'Fahrenheit' : 'Celsius'}
                  </button>
                </div>
                <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} alt="icon" className="w-20 h-20 -mt-4"/>
              </div>
              <div className="mt-8">
                <div className="text-9xl font-black">{Math.round(weather.main.temp)}°</div>
                <p className="text-2xl text-slate-400 capitalize">{weather.weather[0].description}</p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-center gap-6">
              <div className="flex justify-between border-b border-slate-800 pb-4">
                <span className="text-slate-500">Humidity</span>
                <span className="font-bold">{weather.main.humidity}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-4">
                <span className="text-slate-500">Wind</span>
                <span className="font-bold">{weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Feels Like</span>
                <span className="font-bold">{Math.round(weather.main.feels_like)}°</span>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;