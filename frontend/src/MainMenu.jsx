import React from 'react';
import { Target, Shield, Crosshair, Map } from 'lucide-react';
import heroImg from './assets/hero.png';

export default function MainMenu({ setCurrentApp }) {
  return (
    <div className="min-h-screen bg-tactical-900 text-gray-300 font-mono relative overflow-hidden flex flex-col md:flex-row">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

      <div className="flex-1 p-6 md:p-12 flex flex-col justify-center relative z-10 w-full max-w-3xl mx-auto md:mx-0">
        <header className="mb-12 text-center md:text-left">
          <div className="inline-block border-2 border-tactical-accent px-6 py-2 mb-4 cyber-border relative bg-tactical-800">
            <span className="text-tactical-accent font-black tracking-widest uppercase text-xl">Твой Периметр. Твои Правила.</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none text-shadow-glow">
            Система Автономного <br className="hidden md:block"/>Контроля
          </h1>
          <p className="mt-4 text-gray-400 text-sm max-w-lg mx-auto md:mx-0">
            Интегрированный комплекс управления состоянием, когнитивными искажениями и социальной инженерией.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* BASE */}
          <div className="bg-tactical-800/80 p-6 rounded-sm border border-tactical-700 hover:border-tactical-accent hover:bg-tactical-800 transition-all cursor-pointer group shadow-lg flex flex-col h-full" onClick={() => setCurrentApp('base')}>
            <div className="flex justify-between items-start mb-4">
              <Shield className="w-8 h-8 text-tactical-accent group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-gray-500 font-bold bg-tactical-900 px-2 py-1 rounded">Модуль 01</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">B.A.S.E.</h2>
            <p className="text-xs text-gray-400 mb-4 flex-1">Базовый таймер продуктивности (Pomodoro) и физиологический сброс.</p>
            <div className="text-xs font-bold text-tactical-accent uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              Войти в систему →
            </div>
          </div>

          {/* KPT */}
          <div className="bg-tactical-800/80 p-6 rounded-sm border border-tactical-700 hover:border-blue-500 hover:bg-tactical-800 transition-all cursor-pointer group shadow-lg flex flex-col h-full" onClick={() => setCurrentApp('kpt')}>
            <div className="flex justify-between items-start mb-4">
              <Target className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-gray-500 font-bold bg-tactical-900 px-2 py-1 rounded">Модуль 02</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Протокол КПТ</h2>
            <p className="text-xs text-gray-400 mb-4 flex-1">Когнитивно-поведенческая терапия. 8 недель перепрошивки реакций.</p>
            <div className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              Войти в систему →
            </div>
          </div>

          {/* PERIMETR */}
          <div className="bg-tactical-800/80 p-6 rounded-sm border border-tactical-700 hover:border-orange-500 hover:bg-tactical-800 transition-all cursor-pointer group shadow-lg flex flex-col h-full sm:col-span-2 md:col-span-1" onClick={() => setCurrentApp('perimetr')}>
            <div className="flex justify-between items-start mb-4">
              <Crosshair className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-gray-500 font-bold bg-tactical-900 px-2 py-1 rounded">Модуль 03</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">PERIMETR-25</h2>
            <p className="text-xs text-gray-400 mb-4 flex-1">Боевой ритм, OODA-лупы и инженерия социального капитала.</p>
            <div className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
              Войти в систему →
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-tactical-700 pt-6 flex justify-between items-center opacity-50">
           <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2">
               <Map className="w-3 h-3" /> System Status: Online
           </div>
           <div className="text-[10px] font-mono text-gray-500">v1.2.0-tactical</div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 bg-black relative justify-center items-center overflow-hidden border-l-2 border-tactical-700">
          <div className="absolute inset-0 bg-tactical-900/40 mix-blend-multiply z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-tactical-900 via-transparent to-transparent z-20"></div>
          <img src={heroImg} alt="Tactical HUD" className="object-cover w-full h-full opacity-80 filter contrast-125 grayscale" />
          <div className="absolute top-10 right-10 z-30 bg-black/60 border border-tactical-accent p-4 backdrop-blur-sm">
             <div className="text-tactical-accent text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2"><div className="w-2 h-2 bg-tactical-accent rounded-full animate-pulse"></div> Live Feed</div>
             <div className="text-white font-mono text-sm">SECURE CONNECTION</div>
          </div>
      </div>
    </div>
  );
}
