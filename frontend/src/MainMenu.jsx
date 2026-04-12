import React from 'react'

export default function MainMenu({ setApp }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-tactical-900 p-4">
      <div className="flex flex-col items-center bg-tactical-800 p-8 rounded-sm shadow-2xl max-w-md w-full cyber-border space-y-6">
        <h1 className="text-3xl font-bold tracking-widest text-tactical-accent font-mono uppercase text-center">Главное меню</h1>
        <p className="text-gray-400 text-center text-sm font-mono uppercase tracking-wider">Выберите протокол для запуска</p>

        <button onClick={() => setApp('base')} className="w-full text-center bg-tactical-900 border border-tactical-700 hover:border-tactical-accent text-white font-bold py-3 px-4 rounded text-sm transition-colors uppercase tracking-widest flex justify-between items-center group">
          <span>Таймер Дыхания (BASE)</span><span className="text-tactical-accent opacity-0 group-hover:opacity-100 transition-opacity">►</span>
        </button>
        <button onClick={() => setApp('kpt')} className="w-full text-center bg-tactical-900 border border-tactical-700 hover:border-tactical-accent text-white font-bold py-3 px-4 rounded text-sm transition-colors uppercase tracking-widest flex justify-between items-center group">
          <span>КПТ Протокол</span><span className="text-tactical-accent opacity-0 group-hover:opacity-100 transition-opacity">►</span>
        </button>
        <button onClick={() => setApp('perimetr')} className="w-full text-center bg-tactical-900 border border-tactical-700 hover:border-tactical-accent text-white font-bold py-3 px-4 rounded text-sm transition-colors uppercase tracking-widest flex justify-between items-center group">
          <span>ПЕРИМЕТР v4.0</span><span className="text-tactical-accent opacity-0 group-hover:opacity-100 transition-opacity">►</span>
        </button>
      </div>
    </div>
  )
}
