function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl border border-slate-700 text-center">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
          TEMPUS
        </h1>
        <p className="text-slate-400 font-medium">
          Tailwind is officially working! 🚀
        </p>
        <button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all">
          Ready to Build
        </button>
      </div>
    </div>
  )
}

export default App