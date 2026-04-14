import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Play, Pause, Square, Timer, Wind, Brain, Info, Mic } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { MODES, Phase } from '../lib/modes';

const PHASES_DEF = [
  { id: 'focus', title: 'Deep Work', icon: <Brain size={24} className="text-orange-400" /> },
  { id: 'hrv', title: 'HRV', icon: <Wind size={24} className="text-blue-400" /> },
  { id: 'sigh', title: 'Вздох', icon: <Wind size={24} className="text-sky-400" /> },
  { id: 'pmr', title: 'PMR', icon: <Wind size={24} className="text-emerald-400" /> },
  { id: 'space', title: 'Space', icon: <Brain size={24} className="text-purple-400" /> },
  { id: 'nsdr', title: 'NSDR', icon: <Wind size={24} className="text-indigo-400" /> },
  { id: 'arsenalAuto', title: 'АТ', icon: <Brain size={24} className="text-green-400" /> },
  { id: 'stopframe', title: 'СТОП-КАДР', icon: <Brain size={24} className="text-red-400" /> },
];

export default function BaseTimer() {
  const [running, setRunning] = useState(false);
  const [activePhaseId, setActivePhaseId] = useState(PHASES_DEF[0].id);
  const [phases, setPhases] = useState<Phase[]>(MODES.focus());
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [seconds, setSeconds] = useState(0); // overall seconds remaining

  const [tasks, setTasks] = useState<any[]>([]);
  const [currentTask, setCurrentTask] = useState('');

  const [infoOpen, setInfoOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const reqRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const remainingPhaseRef = useRef<number>(0);

  const fetchTasks = async () => {
    const res: any = await invoke('get_timer_tasks');
    setTasks(res);
  };

  useEffect(() => {
    fetchTasks();
    initPhases('focus');
    return () => stopTimer();
  }, []);

  const initPhases = (id: string) => {
    const newPhases = (id === 'hrv') ? MODES.hrv(6.0) : (id === 'space') ? MODES.space(3 * 60 * 1000) : MODES[id]();
    setPhases(newPhases);
    setCurrentPhaseIdx(0);
    remainingPhaseRef.current = newPhases[0].duration;

    const totalMs = newPhases.reduce((acc, p) => acc + p.duration, 0);
    setSeconds(Math.ceil(totalMs / 1000));
  };

  const updateTimer = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;

    remainingPhaseRef.current -= delta;

    if (remainingPhaseRef.current <= 0) {
      if (currentPhaseIdx < phases.length - 1) {
         const nextIdx = currentPhaseIdx + 1;
         setCurrentPhaseIdx(nextIdx);
         remainingPhaseRef.current = phases[nextIdx].duration;
         playAlarm(880, 0.5); // transition beep
         reqRef.current = requestAnimationFrame(updateTimer);
      } else {
         remainingPhaseRef.current = 0;
         stopTimer();
         setRunning(false);
         playAlarm(440, 1.5); // end beep
      }
    } else {
      reqRef.current = requestAnimationFrame(updateTimer);
    }

    // Calculate total remaining
    let totalRem = remainingPhaseRef.current;
    for(let i = currentPhaseIdx + 1; i < phases.length; i++) {
        totalRem += phases[i].duration;
    }
    setSeconds(Math.ceil(totalRem / 1000));
  };

  const startTimer = () => {
    lastTimeRef.current = performance.now();
    reqRef.current = requestAnimationFrame(updateTimer);
  };

  const stopTimer = () => {
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    reqRef.current = null;
    lastTimeRef.current = null;
  };

  const playAlarm = (freq: number, dur: number) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  };

  const toggleTimer = () => {
    if (running) {
      stopTimer();
      setRunning(false);
    } else {
      if (seconds <= 0) return;
      startTimer();
      setRunning(true);
    }
  };

  const resetTimer = () => {
    stopTimer();
    setRunning(false);
    initPhases(activePhaseId);
  };

  const changePhase = (id: string) => {
    stopTimer();
    setRunning(false);
    setActivePhaseId(id);
    initPhases(id);
  };

  const saveLog = async () => {
    const totalDef = phases.reduce((acc, p) => acc + p.duration, 0) / 1000;
    const durSec = Math.floor(totalDef - seconds);
    if (durSec <= 0) return;

    const phaseDef = PHASES_DEF.find(p => p.id === activePhaseId);

    await invoke('add_timer_task', { task: {
      id: `bt${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      duration: durSec,
      description: currentTask || phaseDef?.title || 'Без описания'
    }});
    resetTimer();
    setCurrentTask('');
    fetchTasks();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sc = s % 60;
    return `${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
  };

  const toggleRecord = async () => {
    if (recording && mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `voice_memo_${Date.now()}.webm`;
          a.click();
        };
        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
      } catch (e) {
        alert("Microphone access denied.");
      }
    }
  };

  const curPhase = phases[currentPhaseIdx];
  const progress = curPhase ? (curPhase.duration - remainingPhaseRef.current) / curPhase.duration : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  // Interpolate dashoffset based on startFill to endFill
  const startF = curPhase ? curPhase.startFill : 0;
  const endF = curPhase ? curPhase.endFill : 1;
  const currentFill = startF + (endF - startF) * progress;
  const strokeDashoffset = circumference - currentFill * circumference;

  return (
    <div className="flex flex-col h-full fade-in pb-8">
      <div className="flex items-center gap-3 mb-8">
        <Timer className="text-tactical-accent" size={28} />
        <h1 className="text-2xl font-mono text-tactical-text uppercase tracking-widest font-bold">База-Таймер и Техники</h1>
      </div>

      <div className="flex justify-center flex-wrap gap-3 mb-8">
         {PHASES_DEF.map(p => (
           <button key={p.id} onClick={() => changePhase(p.id)} className={`flex items-center gap-2 px-3 py-2 border-2 rounded font-bold uppercase transition-all text-[10px] ${activePhaseId === p.id ? 'border-tactical-accent bg-tactical-accent/10 text-white shadow-[0_0_10px_rgba(46,204,113,0.2)]' : 'border-tactical-700 text-tactical-text/50 hover:border-tactical-text/50'}`}>
             {p.icon} {p.title}
           </button>
         ))}
      </div>

      <div className="cyber-border flex flex-col items-center justify-center p-8 mb-8 relative">
        <div className="flex justify-between w-full mb-6 relative z-10">
           <button onClick={() => setInfoOpen(true)} className="text-tactical-text/50 hover:text-white transition-colors p-2"><Info size={24} /></button>
           <button onClick={toggleRecord} className={`p-2 transition-colors rounded-full border-2 ${recording ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'border-tactical-700 text-tactical-text/50 hover:text-white hover:border-tactical-text/50'}`}><Mic size={24} /></button>
        </div>

        <div className="relative flex items-center justify-center mb-8">
            <svg width="300" height="300" className="rotate-[-90deg]">
                <circle cx="150" cy="150" r={radius} fill="transparent" stroke="#1a2e22" strokeWidth="12" />
                <circle cx="150" cy="150" r={radius} fill="transparent" stroke={curPhase?.color || "#2ecc71"} strokeWidth="12"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-100 ease-linear" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xs font-bold uppercase text-tactical-text/60 mb-2">{curPhase?.name}</div>
                <div className={`font-mono text-6xl font-bold tracking-tight ${running ? 'text-white drop-shadow-[0_0_15px_rgba(46,204,113,0.5)]' : 'text-tactical-text'}`}>
                    {formatTime(seconds)}
                </div>
            </div>
        </div>

        <div className="text-center text-sm font-mono text-tactical-text/80 mb-6 max-w-md h-12">
            <strong className="text-white block mb-1">{curPhase?.title || ''}</strong>
            {curPhase?.desc}
        </div>

        <input
          value={currentTask}
          onChange={e => setCurrentTask(e.target.value)}
          placeholder="Цель блока (опционально)..."
          className="bg-tactical-900 border border-tactical-700 p-3 w-full max-w-md text-center rounded text-sm mb-8 focus:border-tactical-accent outline-none font-mono text-tactical-text/80 transition-colors relative z-10"
        />

        <div className="flex gap-4 relative z-10">
           <button onClick={toggleTimer} disabled={seconds <= 0} className={`flex items-center gap-2 px-8 py-3 rounded font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${running ? 'bg-orange-500/20 text-orange-400 border border-orange-500 hover:bg-orange-500/30' : 'bg-tactical-accent text-tactical-900 hover:bg-emerald-400 shadow-[0_0_15px_rgba(46,204,113,0.4)] hover:shadow-[0_0_25px_rgba(46,204,113,0.6)]'}`}>
             {running ? <><Pause size={18}/> Пауза</> : <><Play size={18}/> {seconds > 0 ? 'Старт' : 'Завершено'}</>}
           </button>
           <button onClick={resetTimer} className="flex items-center gap-2 px-6 py-3 rounded border border-tactical-700 text-tactical-text/50 hover:text-white hover:border-tactical-text/50 transition-colors uppercase font-bold text-sm">
             <Square size={16}/> Сброс
           </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-sm text-tactical-text/50 uppercase">Лог Блоков</h2>
        <button onClick={saveLog} className="text-xs bg-tactical-800 border border-tactical-700 px-3 py-1 rounded text-tactical-accent hover:bg-tactical-700 uppercase font-bold transition-colors">
          Сохранить в лог
        </button>
      </div>

      <div className="cyber-border flex-1 overflow-y-auto custom-scrollbar p-0 bg-tactical-900/50 min-h-[200px]">
        <table className="w-full text-left">
          <thead className="bg-tactical-800/80 sticky top-0">
            <tr>
              <th className="p-3 border-b border-tactical-700 font-bold uppercase text-[10px] text-tactical-text/50 w-24">Дата</th>
              <th className="p-3 border-b border-tactical-700 font-bold uppercase text-[10px] text-tactical-text/50 w-24 text-right">Затрачено</th>
              <th className="p-3 border-b border-tactical-700 font-bold uppercase text-[10px] text-tactical-text/50">Описание</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr><td colSpan={3} className="p-6 text-center text-tactical-text/50 text-xs font-mono uppercase">Лог пуст</td></tr>
            )}
            {tasks.map(t => (
              <tr key={t.id} className="border-b border-tactical-800 hover:bg-tactical-800/50 transition-colors">
                <td className="p-3 text-xs font-mono text-tactical-text/70">{t.date}</td>
                <td className="p-3 text-xs font-mono text-tactical-accent font-bold text-right">{Math.floor(t.duration / 60)}м {t.duration % 60}с</td>
                <td className="p-3 text-sm text-white">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog.Root open={infoOpen} onOpenChange={setInfoOpen}>
        <Dialog.Portal>
           <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in" />
           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-3rem)] max-w-2xl bg-tactical-800 border border-tactical-700 rounded-sm shadow-2xl z-50 flex flex-col p-8 m-6 animate-in">
             <h2 className="text-xl font-bold uppercase text-white mb-6 border-b border-tactical-700 pb-3">Справочник Техник (Арсенал)</h2>
             <div className="flex flex-col gap-8 mb-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
                 <p className="text-sm text-tactical-text/80">Все техники скопированы из исходного <strong>BASE.html</strong>.</p>
                {PHASES_DEF.map(p => (
                   <div key={p.id} className="bg-tactical-900 p-4 rounded border border-tactical-700">
                      <h3 className="text-sm font-bold text-tactical-accent flex items-center gap-2 mb-2 uppercase">{p.icon} {p.title}</h3>
                      <p className="text-sm text-white font-mono mb-2">Нажмите на кнопку техники сверху, чтобы запустить автоматическое сопровождение фаз.</p>
                   </div>
                ))}
             </div>
             <div className="flex justify-end">
                <button onClick={() => setInfoOpen(false)} className="px-6 py-2 bg-tactical-accent text-tactical-900 font-bold text-sm uppercase rounded hover:bg-emerald-400 transition-colors">Понятно</button>
             </div>
           </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
