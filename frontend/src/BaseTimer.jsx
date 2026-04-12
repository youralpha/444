import React, { useState, useEffect, useRef } from 'react';

const MODES = {
  hrv: (bpm) => {
    const ms = (60 / bpm / 2) * 1000;
    return [
      { name: 'ВДОХ', duration: ms, color: '#10b981' },
      { name: 'ВЫДОХ', duration: ms, color: '#a78bfa' }
    ];
  },
  base: (minutes) => {
    let p = [];
    p.push({ name: 'ПОДГОТОВКА', duration: 10000, color: '#eab308', title: "Приготовьтесь" });
    for (let i=0; i<3; i++) {
        p.push({ name: 'ВДОХ (80%)', duration: 2000, color: '#10b981', title: "Вздох" });
        p.push({ name: 'ДОВДОХ (20%)', duration: 500, color: '#0284c7', title: "Вздох" });
        p.push({ name: 'ВЫДОХ', duration: 5500, color: '#a78bfa', title: "Вздох" });
        p.push({ name: 'ПАУЗА', duration: 8000, color: '#64748b', title: "Вздох" });
    }
    p.push({ name: 'ПЕРЕХОД', duration: 5000, color: '#eab308', title: "Смена ритма" });
    for(let i=0; i<10; i++) {
        p.push({ name: 'ВДОХ', duration: 5000, color: '#10b981', title: "ВСР" });
        p.push({ name: 'ВЫДОХ', duration: 5000, color: '#a78bfa', title: "ВСР" });
    }
    return p;
  }
};

export default function BaseTimer({ goBack }) {
  const [isRunning, setIsRunning] = useState(false);
  const [phases, setPhases] = useState(MODES.base(20));
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsedInPhase, setElapsedInPhase] = useState(0);
  const reqRef = useRef(null);
  const startTimeRef = useRef(0);
  const [phaseProgress, setPhaseProgress] = useState(0);

  const loop = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;

    if (phaseIndex < phases.length) {
      const p = phases[phaseIndex];
      if (elapsed >= p.duration) {
        startTimeRef.current = timestamp;
        setPhaseIndex(idx => idx + 1);
        setElapsedInPhase(0);
        setPhaseProgress(0);
      } else {
        setElapsedInPhase(elapsed);
        setPhaseProgress(elapsed / p.duration);
        setTimeRemaining(p.duration - elapsed);
      }
      reqRef.current = requestAnimationFrame(loop);
    } else {
        setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      reqRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(reqRef.current);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isRunning, phaseIndex]);

  const currentPhase = phases[phaseIndex] || { name: 'ЗАВЕРШЕНО', color: '#10b981', title: '' };

  const radius = 88;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (phaseProgress * circumference);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-tactical-900 justify-center">
      <div className="w-full mb-4 max-w-[28rem]">
        <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
          <span>&larr; На главную</span>
        </button>
      </div>

      <div className="flex flex-col items-center bg-tactical-800 p-8 rounded-sm shadow-2xl max-w-[28rem] w-full cyber-border">
        <h1 className="text-2xl font-bold text-white mb-2">Базовая подготовка</h1>
        <p className="text-sm text-gray-400 mb-8 text-center min-h-[40px]">{currentPhase.title}</p>

        <div className="relative w-64 h-64 flex flex-col items-center justify-center mb-8">
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#334155" strokeWidth="12" />
                <circle cx="100" cy="100" r={radius} fill="transparent" stroke={currentPhase.color} strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-75" />
            </svg>
            <div className="text-xl font-bold uppercase tracking-widest" style={{ color: currentPhase.color }}>{currentPhase.name}</div>
            <div className="text-5xl font-bold text-white tabular-nums mt-2">
                {Math.ceil(timeRemaining / 1000)}
            </div>
        </div>

        <div className="flex gap-4 w-full">
            <button onClick={() => setIsRunning(!isRunning)} className="flex-1 bg-tactical-accent hover:opacity-80 text-tactical-900 font-bold py-3 rounded uppercase tracking-wider">
                {isRunning ? 'Пауза' : 'Старт'}
            </button>
            <button onClick={() => { setIsRunning(false); setPhaseIndex(0); setTimeRemaining(0); setPhaseProgress(0); }} className="flex-1 bg-tactical-700 hover:bg-gray-600 text-white font-bold py-3 rounded uppercase tracking-wider">
                Сброс
            </button>
        </div>
      </div>
    </div>
  );
}
