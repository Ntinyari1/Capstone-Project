import React, { useMemo } from 'react';

function degToCompass(deg) {
  if (typeof deg !== 'number') return null;
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx];
}

// Simple dew point approximation (Magnus formula)
function dewPointC(tempC, humidity) {
  if (typeof tempC !== 'number' || typeof humidity !== 'number') return null;
  const a = 17.625;
  const b = 243.04;
  const rh = Math.min(100, Math.max(1, humidity));
  const gamma = (a * tempC) / (b + tempC) + Math.log(rh / 100);
  return (b * gamma) / (a - gamma);
}

const ForecastDetailsDrawer = ({
  open,
  onClose,
  cityLabel,
  list,
  dayKey, // YYYY-MM-DD or null for "upcoming"
  unit,
}) => {
  const filtered = useMemo(() => {
    if (!Array.isArray(list)) return [];
    if (!dayKey) return list.slice(0, 12); // next ~36h (3h intervals)
    return list.filter((item) => {
      const key = new Date(item.dt * 1000).toISOString().slice(0, 10);
      return key === dayKey;
    });
  }, [list, dayKey]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close hourly details"
      />
      <aside className="w-[420px] max-w-full h-full bg-slate-900/95 text-slate-100 shadow-2xl border-l border-white/10 backdrop-blur-2xl overflow-y-auto">
        <header className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-200">{cityLabel || 'Hourly Weather'}</div>
              <div className="text-xs text-slate-400 tracking-widest uppercase">Hourly Weather</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-700 w-9 h-9 flex items-center justify-center text-slate-300 hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="px-4 py-4">
          {filtered.map((item) => {
            const dt = new Date(item.dt * 1000);
            const temp = item.main?.temp;
            const humidity = item.main?.humidity;
            const pressure = item.main?.pressure;
            const clouds = item.clouds?.all;
            const windSpeed = item.wind?.speed;
            const windDeg = item.wind?.deg;
            const icon = item.weather?.[0]?.icon;
            const main = item.weather?.[0]?.main;

            const precip =
              (item.rain && (item.rain['3h'] ?? item.rain['1h'])) ??
              (item.snow && (item.snow['3h'] ?? item.snow['1h'])) ??
              0;

            const tempC =
              typeof temp === 'number'
                ? unit === 'metric'
                  ? temp
                  : (temp - 32) * 5 / 9
                : null;

            const dp = dewPointC(tempC, humidity);

            return (
              <div key={item.dt} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-300">
                      {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {dt.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                    </div>
                  </div>

                  <div className="text-3xl font-black tabular-nums">
                    {typeof temp === 'number' ? `${Math.round(temp)}°` : '--'}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">{main || ''}</div>
                    </div>
                    {icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                        alt=""
                        className="w-10 h-10 opacity-90"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-[12px] text-slate-200">
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-slate-400">Humidity</span>
                    <span>{typeof humidity === 'number' ? `${humidity}%` : '--'}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-slate-400">Dew Point</span>
                    <span>{dp == null ? '--' : `${Math.round(dp)}°`}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-slate-400">Precipitation</span>
                    <span>{typeof precip === 'number' ? `${precip} mm` : '--'}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-slate-400">Cloud Cover</span>
                    <span>{typeof clouds === 'number' ? `${clouds}%` : '--'}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-slate-400">Pressure</span>
                    <span>{typeof pressure === 'number' ? `${pressure} mbar` : '--'}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-slate-400">Wind</span>
                    <span>
                      {typeof windSpeed === 'number'
                        ? `${Math.round(windSpeed)} ${unit === 'metric' ? 'm/s' : 'mph'}`
                        : '--'}
                      {windDeg != null ? ` ${degToCompass(windDeg) || ''}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-sm text-slate-400 p-6 text-center">
              No forecast details available.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default ForecastDetailsDrawer;

