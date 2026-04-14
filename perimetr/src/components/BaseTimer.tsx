import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Play, Pause, Square, Timer, Wind, Brain, Info, Mic } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

const PHASES = [
  { id: 'focus', title: 'Deep Work', defaultTime: 50 * 60, icon: <Brain size={24} className="text-orange-400" />,
    desc: 'Фаза максимальной концентрации. Исключите все отвлечения, закройте вкладки, телефон в авиарежим.',
    info: 'Focusing without distractions requires immense cognitive effort but yields the highest quality work.'
  },
  { id: 'pmr', title: 'PMR (Релаксация)', defaultTime: 10 * 60, icon: <Wind size={24} className="text-blue-400" />,
    desc: 'Прогрессивная мышечная релаксация. Напрягайте и расслабляйте группы мышц от ног к голове.',
    info: 'PMR helps reset the autonomic nervous system after periods of high stress or intense focus.'
  },
  { id: 'nsdr', title: 'NSDR (Сон)', defaultTime: 20 * 60, icon: <Wind size={24} className="text-purple-400" />,
    desc: 'Non-Sleep Deep Rest. Лягте на спину, закройте глаза, сфокусируйтесь на дыхании и тяжести тела.',
    info: 'NSDR (or Yoga Nidra) accelerates learning by facilitating neuroplasticity and dramatically reduces fatigue.'
  },
  { id: 'arsenalAuto', title: 'Авто-Тренинг', defaultTime: 15 * 60, icon: <Brain size={24} className="text-green-400" />,
    desc: 'Аутогенная тренировка по Шульцу. Повторяйте формулы тяжести и тепла в конечностях.',
    info: 'Autogenic training shifts the body into a deeply restorative parasympathetic state.'
  },
];

export default function BaseTimer() {
  const [running, setRunning] = useState(false);
  const [activePhase, setActivePhase] = useState(PHASES[0].id);
  const [seconds, setSeconds] = useState(PHASES[0].defaultTime);
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentTask, setCurrentTask] = useState('');

  const [infoOpen, setInfoOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const reqRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const durationRef = useRef<number>(PHASES[0].defaultTime * 1000);
  const remainingRef = useRef<number>(PHASES[0].defaultTime * 1000);

  const fetchTasks = async () => {
    const res: any = await invoke('get_timer_tasks');
    setTasks(res);
  };

  useEffect(() => {
    fetchTasks();
    return () => stopTimer();
  }, []);

  const updateTimer = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;

    remainingRef.current -= delta;
    if (remainingRef.current <= 0) {
      remainingRef.current = 0;
      setSeconds(0);
      stopTimer();
      setRunning(false);
      playAlarm();
    } else {
      setSeconds(Math.ceil(remainingRef.current / 1000));
      reqRef.current = requestAnimationFrame(updateTimer);
    }
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

  const playAlarm = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  };

  const toggleTimer = () => {
    if (running) {
      stopTimer();
      setRunning(false);
    } else {
      if (remainingRef.current <= 0) return;
      startTimer();
      setRunning(true);
    }
  };

  const resetTimer = () => {
    stopTimer();
    setRunning(false);
    const phase = PHASES.find(p => p.id === activePhase);
    const def = phase ? phase.defaultTime : 0;
    durationRef.current = def * 1000;
    remainingRef.current = def * 1000;
    setSeconds(def);
  };

  const changePhase = (id: string) => {
    stopTimer();
    setRunning(false);
    setActivePhase(id);
    const phase = PHASES.find(p => p.id === id);
    const def = phase ? phase.defaultTime : 0;
    durationRef.current = def * 1000;
    remainingRef.current = def * 1000;
    setSeconds(def);
  };

  const saveLog = async () => {
    const phase = PHASES.find(p => p.id === activePhase);
    const durSec = Math.floor((durationRef.current - remainingRef.current) / 1000);
    if (durSec <= 0) return;

    await invoke('add_timer_task', { task: {
      id: `bt${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      duration: durSec,
      description: currentTask || phase?.title || 'Без описания'
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
        alert("Microphone access denied or error occurred.");
      }
    }
  };

  const curPhase = PHASES.find(p => p.id === activePhase);
  const progress = durationRef.current > 0 ? (durationRef.current - remainingRef.current) / durationRef.current : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col h-full fade-in pb-8">
      <div className="flex items-center gap-3 mb-8">
        <Timer className="text-tactical-accent" size={28} />
        <h1 className="text-2xl font-mono text-tactical-text uppercase tracking-widest font-bold">База-Таймер</h1>
      </div>

      <div className="flex justify-center gap-4 mb-8">
         {PHASES.map(p => (
           <button key={p.id} onClick={() => changePhase(p.id)} className={`flex items-center gap-2 px-4 py-2 border-2 rounded font-bold uppercase transition-all text-xs ${activePhase === p.id ? 'border-tactical-accent bg-tactical-accent/10 text-white shadow-[0_0_10px_rgba(46,204,113,0.2)]' : 'border-tactical-700 text-tactical-text/50 hover:border-tactical-text/50'}`}>
             {p.icon} <span className="hidden sm:inline">{p.title}</span>
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
                <circle cx="150" cy="150" r={radius} fill="transparent" stroke="#2ecc71" strokeWidth="12"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-100 ease-linear" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className={`font-mono text-6xl font-bold tracking-tight ${running ? 'text-white drop-shadow-[0_0_15px_rgba(46,204,113,0.5)]' : 'text-tactical-text'}`}>
                    {formatTime(seconds)}
                </div>
            </div>
        </div>

        <div className="text-center text-sm font-mono text-tactical-text/80 mb-6 max-w-md h-12">
            {curPhase?.desc}
        </div>

        <input
          value={currentTask}
          onChange={e => setCurrentTask(e.target.value)}
          placeholder="Цель блока (опционально)..."
          className="bg-tactical-900 border border-tactical-700 p-3 w-full max-w-md text-center rounded text-sm mb-8 focus:border-tactical-accent outline-none font-mono text-tactical-text/80 transition-colors relative z-10"
        />

        <div className="flex gap-4 relative z-10">
           <button onClick={toggleTimer} disabled={remainingRef.current <= 0} className={`flex items-center gap-2 px-8 py-3 rounded font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${running ? 'bg-orange-500/20 text-orange-400 border border-orange-500 hover:bg-orange-500/30' : 'bg-tactical-accent text-tactical-900 hover:bg-emerald-400 shadow-[0_0_15px_rgba(46,204,113,0.4)] hover:shadow-[0_0_25px_rgba(46,204,113,0.6)]'}`}>
             {running ? <><Pause size={18}/> Пауза</> : <><Play size={18}/> {remainingRef.current > 0 ? 'Старт' : 'Завершено'}</>}
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
           <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-3rem)] max-w-lg bg-tactical-800 border border-tactical-700 rounded-sm shadow-2xl z-50 flex flex-col p-6 m-6 animate-in">
             <h2 className="text-lg font-bold uppercase text-white mb-4 border-b border-tactical-700 pb-2">Справка по фазам</h2>
             <div className="flex flex-col gap-6 mb-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {PHASES.map(p => (
                   <div key={p.id}>
                      <h3 className="text-sm font-bold text-tactical-accent flex items-center gap-2 mb-2 uppercase">{p.icon} {p.title}</h3>
                      <p className="text-sm text-tactical-text/80">{p.info}</p>
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
