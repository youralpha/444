import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function Perimeter({ goBack }) {
  const [state, setState] = useState({ score: 0, cycles: [], network: [], history: {}, plan: {} });

  useEffect(() => {
    fetch('/api/data/perimetr')
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setState(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
         const local = localStorage.getItem('perimeter_data');
         if (local) setState(JSON.parse(local));
      });
  }, []);

  const saveState = (newState) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    fetch('/api/data/perimetr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedState)
    }).catch(() => localStorage.setItem('perimeter_data', JSON.stringify(updatedState)));
  };

  return (
    <div className="bg-tactical-900 min-h-screen p-4 md:p-6 lg:p-8 flex flex-col font-sans relative text-white">
      <div className="w-full mb-4">
        <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> На главную
        </button>
      </div>

      <header className="mb-6 cyber-border bg-tactical-800 p-4 md:p-6 rounded-sm shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-tactical-900/50 to-transparent pointer-events-none"></div>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-tactical-accent font-mono uppercase">ПЕРИМЕТР v4.0</h1>
          <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider">Система профессионального доминирования</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="bg-tactical-900 border border-tactical-700 px-3 py-1.5 rounded flex items-center shadow-inner">
              <span className="text-xs font-mono text-gray-400 mr-2">АГЕНТ 4444:</span>
              <span className="text-lg font-mono text-white font-bold w-8 text-center">{state.score}</span>
              <div className="flex flex-col ml-3 border-l border-tactical-700 pl-2">
                <button onClick={() => saveState({ score: state.score + 10 })} className="text-[10px] text-tactical-accent font-bold py-1">▲ WIN</button>
                <button onClick={() => saveState({ score: state.score - 10 })} className="text-[10px] text-tactical-alert font-bold py-1">▼ FAIL</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-grow">
        <main className="lg:col-span-2 flex flex-col gap-6">
          <div className="cyber-border bg-tactical-800 p-4 md:p-6 rounded-sm shadow-md flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2 relative">
                <label className="text-xs font-bold text-tactical-accent uppercase tracking-widest flex justify-between items-center border-b border-tactical-700 pb-1">Генеральная Цель</label>
                <textarea rows="4" className="w-full bg-tactical-900/50 border border-tactical-700 rounded p-3 text-sm text-gray-200 outline-none custom-scrollbar transition-all resize-none" defaultValue={state.plan.mission || ''} />
              </div>
              <div className="flex flex-col space-y-2 relative">
                <label className="text-xs font-bold text-orange-400 uppercase tracking-widest flex justify-between items-center border-b border-tactical-700 pb-1">Фокус дня</label>
                <textarea rows="4" className="w-full bg-tactical-900/50 border border-orange-500/30 rounded p-3 text-sm text-gray-200 outline-none custom-scrollbar transition-all resize-none font-mono" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
