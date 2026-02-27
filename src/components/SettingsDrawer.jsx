import React from 'react';

const SettingsDrawer = ({
  open,
  onClose,
  theme,
  onThemeChange,
  unit,
  onUnitChange,
  onManageLocation,
  lockScreen,
  onToggleLockScreen,
  notifications,
  onToggleNotifications,
  statusBar,
  onToggleStatusBar,
  onOpenRadar,
  onRate,
  onAbout,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <button
        type="button"
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close settings"
      />
      <aside className="w-80 max-w-full h-full bg-slate-900/95 text-slate-100 shadow-2xl border-l border-white/10 backdrop-blur-2xl p-6 flex flex-col gap-6">
        <header className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-slate-400">
            Setting
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-800"
          >
            ✕
          </button>
        </header>

        <section className="space-y-3 text-sm">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-slate-500 uppercase">
            Home
          </p>
          <button
            type="button"
            onClick={() => {
              onManageLocation?.();
              onClose();
            }}
            className="flex items-center justify-between py-2 border-b border-slate-800 hover:bg-slate-800/40 rounded-xl px-2 -mx-2"
          >
            <span className="text-slate-100">Manage location</span>
          </button>
          <button
            type="button"
            onClick={onToggleLockScreen}
            className="flex w-full items-center justify-between py-2 border-b border-slate-800 hover:bg-slate-800/40 rounded-xl px-2 -mx-2"
          >
            <span className="text-slate-100">Lock Screen</span>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full ${lockScreen ? 'bg-sky-400' : 'bg-slate-700'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockScreen ? 'translate-x-4' : 'translate-x-1'}`} />
            </div>
          </button>
          <button
            type="button"
            onClick={onToggleNotifications}
            className="flex w-full items-center justify-between py-2 border-b border-slate-800 hover:bg-slate-800/40 rounded-xl px-2 -mx-2"
          >
            <span className="text-slate-100">Notification</span>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full ${notifications ? 'bg-sky-400' : 'bg-slate-700'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-4' : 'translate-x-1'}`} />
            </div>
          </button>
          <button
            type="button"
            onClick={onToggleStatusBar}
            className="flex w-full items-center justify-between py-2 border-b border-slate-800 hover:bg-slate-800/40 rounded-xl px-2 -mx-2"
          >
            <span className="text-slate-100">Status bar</span>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full ${statusBar ? 'bg-sky-400' : 'bg-slate-700'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${statusBar ? 'translate-x-4' : 'translate-x-1'}`} />
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenRadar?.();
              onClose();
            }}
            className="flex items-center justify-between py-2 hover:bg-slate-800/40 rounded-xl px-2 -mx-2"
          >
            <span className="text-slate-100">Weather Radar</span>
          </button>
        </section>

        <section className="space-y-3 text-sm">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-slate-500 uppercase">
            Unit Setting
          </p>

          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <span className="text-slate-100">Temperature</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onUnitChange('imperial')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                  unit === 'imperial'
                    ? 'bg-white text-slate-900'
                    : 'border border-slate-700 text-slate-300'
                }`}
              >
                F
              </button>
              <button
                type="button"
                onClick={() => onUnitChange('metric')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                  unit === 'metric'
                    ? 'bg-sky-400 text-slate-900'
                    : 'border border-slate-700 text-slate-300'
                }`}
              >
                C
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <span className="text-slate-100">Theme</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                  theme === 'light'
                    ? 'bg-white text-slate-900'
                    : 'border border-slate-700 text-slate-300'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                  theme === 'dark'
                    ? 'bg-sky-400 text-slate-900'
                    : 'border border-slate-700 text-slate-300'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </section>

        <section className="mt-auto pt-4 border-t border-slate-800 text-xs text-slate-500 space-y-1">
          <button
            type="button"
            onClick={() => {
              onRate?.();
              onClose();
            }}
            className="w-full text-left hover:text-slate-300"
          >
            Rate
          </button>
          <button
            type="button"
            onClick={() => {
              onAbout?.();
              onClose();
            }}
            className="w-full text-left hover:text-slate-300"
          >
            About Tempus
          </button>
        </section>
      </aside>
    </div>
  );
};

export default SettingsDrawer;

