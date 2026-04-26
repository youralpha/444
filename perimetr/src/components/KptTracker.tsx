import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getKptWeeks, KptWeek, KptTask } from '../lib/kptProtocol';
import { CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function KptTracker() {
  const [state, setState] = useState({ xp: 0, level: 1, current_week: 1 });
  const [weeks, setWeeks] = useState<KptWeek[]>(getKptWeeks());
  const [calendarDates, setCalendarDates] = useState<string[]>([]);
  const dateKey = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    const s: any = await invoke('get_kpt_state');
    setState(s);

    const wks = getKptWeeks();
    for (let w of wks) {
      for (let t of w.tasks) {
        const d: boolean = await invoke('get_kpt_task', { taskId: t.id });
        t.completed = d;
      }
    }
    setWeeks(wks);

    const cd: string[] = await invoke('get_kpt_calendar');
    setCalendarDates(cd);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const curLvlXp = state.xp % 100;
  const xpLeft = 100 - curLvlXp;
  const pct = curLvlXp;

  const currentWeek = weeks.find(w => w.id === state.current_week) || weeks[0];

  // Generate 35 days for calendar
  const today = new Date();
  const calDays = Array.from({ length: 35 }).map((_, i) => {
    const d = subDays(today, 34 - i);
    return format(d, 'yyyy-MM-dd');
  });

  return (
    <div className="flex flex-col h-full fade-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-mono text-blue-400 uppercase tracking-widest font-bold">КПТ Протокол</h1>
          <p className="text-tactical-text/50 text-xs mt-1 uppercase">Геймифицированный Трекер</p>
        </div>
        <div className="cyber-border py-2 px-4 border-blue-400">
          <span className="font-mono font-bold text-blue-400">Уровень {state.level}</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="w-full bg-tactical-800 rounded h-2 mb-2 border border-tactical-700">
          <div className="bg-blue-400 h-full rounded transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs font-mono text-tactical-text/50">
          <span>{state.xp} Всего XP</span>
          <span>До ур. {state.level + 1} осталось {xpLeft} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-8 pb-12">
        <div className="cyber-border">
          <div className="flex justify-between items-center mb-4 border-b border-tactical-700 pb-4">
            <h2 className="text-sm font-bold text-blue-400 uppercase">{currentWeek.title}</h2>
            <select value={state.current_week} onChange={async (e) => {
              const nw = parseInt(e.target.value);
              const ns = { ...state, current_week: nw };
              setState(ns);
              await invoke('save_kpt_state', { state: ns });
            }} className="p-2 bg-tactical-900 border border-tactical-700 text-tactical-text rounded text-xs outline-none">
              {weeks.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
            </select>
          </div>
          <p className="text-sm text-tactical-text/60 mb-6">{currentWeek.desc}</p>

          <div className="flex flex-col gap-4">
            {currentWeek.tasks.map((task) => (
              <KptTaskItem key={task.id} task={task} dateKey={dateKey} xp={state.xp} updateXp={async (delta: number) => {
                const newXp = state.xp + delta;
                const ns = { ...state, xp: newXp, level: Math.floor(newXp/100)+1 };
                setState(ns);
                await invoke('save_kpt_state', { state: ns });
                fetchData();
              }} />
            ))}
          </div>
        </div>

        <div className="cyber-border border-emerald-500 h-fit">
          <h2 className="text-sm font-bold text-tactical-accent uppercase mb-4">Календарь (35 дней)</h2>
          <p className="text-xs text-tactical-text/50 mb-4">Зеленый = была активность КПТ в этот день.</p>

          <div className="calendar-grid">
            {calDays.map(dStr => {
              const active = calendarDates.includes(dStr);
              const dObj = new Date(dStr);
              return (
                <div key={dStr} className={`cal-day ${active ? 'active' : ''}`} title={dStr}>
                  {format(dObj, 'd')}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KptTaskItem({ task, dateKey, updateXp }: { task: KptTask, dateKey: string, xp: number, updateXp: (delta: number) => void }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(task.completed);
  const [inputs, setInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    task.inputs.forEach(async f => {
      const fullId = `${task.id}_${f.id}`;
      const v: string = await invoke('get_kpt_input', { inputId: fullId });
      setInputs(prev => ({ ...prev, [f.id]: v }));
    });
  }, [task.id, task.inputs]);

  const toggle = async (e: any) => {
    e.stopPropagation();
    const d = !done;
    setDone(d);
    await invoke('save_kpt_task', { taskId: task.id, completed: d, date: dateKey });
    updateXp(d ? task.xp : -task.xp);
  };

  const updateInput = async (id: string, val: string) => {
    setInputs(p => ({ ...p, [id]: val }));
    const fullId = `${task.id}_${id}`;
    await invoke('save_kpt_input', { inputId: fullId, value: val });
  };

  return (
    <div className="bg-tactical-800 border border-tactical-700 rounded transition-all">
      <div onClick={() => setOpen(!open)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-tactical-700">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors ${done ? 'bg-blue-500 border-blue-500' : 'border-blue-500 bg-transparent hover:bg-blue-500/20'}`}>
            {done && <CheckSquare size={14} className="text-white" />}
          </button>
          <span className={`text-sm font-bold ${done ? 'line-through text-tactical-text/40' : 'text-tactical-text'}`}>{task.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-blue-400">+{task.xp} XP</span>
          {open ? <ChevronUp size={16} className="text-tactical-text/40" /> : <ChevronDown size={16} className="text-tactical-text/40" />}
        </div>
      </div>

      {open && (
        <div className="p-4 border-t border-tactical-700 bg-black/20">
          <p className="text-xs text-tactical-text/60 mb-4">{task.desc}</p>
          <div className="flex flex-col gap-4">
            {task.inputs.map(f => (
              <div key={f.id} className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-tactical-text/50">{f.label}</label>
                <textarea rows={2} value={inputs[f.id] || ''} onChange={e=>updateInput(f.id, e.target.value)} placeholder={f.placeholder} className="text-sm bg-tactical-900 border border-tactical-700 rounded p-2 focus:border-blue-400 outline-none resize-none" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
