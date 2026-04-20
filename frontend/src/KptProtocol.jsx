import React, { useState, useEffect } from 'react';
import { initialKptState, initialTasks } from './kptData';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CheckCircle, Circle, ChevronDown, ChevronUp, CheckSquare, Target, ArrowLeft } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function KptProtocol({ setCurrentApp }) {
  const [state, setState] = useState(initialKptState);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/data')
      .then(r => r.json())
      .then(data => {
        if (data.kpt) {
            // Merge defaults in case of new fields
            setState(prev => ({ ...prev, ...data.kpt, activeTab: prev.activeTab }));
        }
      })
      .catch(e => console.error("Could not load kpt data", e));
  }, []);

  const saveState = (updates) => {
    const newState = { ...state, ...updates };
    setState(newState);
    fetch('http://127.0.0.1:5000/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kpt: newState })
    });
  };

  const getWeekMeta = (weekNum) => {
      if (weekNum <= 2) return { title: "Недели 1-2: Осознанность и Аудит", goal: "Научиться отслеживать автоматические мысли и реакции тела без осуждения. Собрать данные." };
      if (weekNum <= 4) return { title: "Недели 3-4: Когнитивная Реструктуризация", goal: "Начать оспаривать искажения. Заменять дисфункциональные мысли на рабочие." };
      if (weekNum <= 6) return { title: "Недели 5-6: Поведенческие Эксперименты", goal: "Тестировать новые реакции в реальном мире. Выходить из зоны комфорта." };
      return { title: "Недели 7-8: Интеграция и Профилактика", goal: "Закрепить навыки. Создать план действий на случай откатов." };
  };

  const toggleTask = (taskId, xp, event) => {
    event.stopPropagation();
    let currentCompleted = state.dailyProgress[state.currentDate] || [];
    let isDone = currentCompleted.includes(taskId);
    let newCompleted = isDone ? currentCompleted.filter(id => id !== taskId) : [...currentCompleted, taskId];

    const newProgress = { ...state.dailyProgress, [state.currentDate]: newCompleted };
    const newTotalXp = isDone ? state.totalXp - xp : state.totalXp + xp;

    let updates = { dailyProgress: newProgress, totalXp: newTotalXp };

    if (!state.startDate && !isDone) {
        updates.startDate = state.currentDate;
    }

    saveState(updates);
  };

  const toggleExpand = (taskId) => {
    let exp = [...state.expandedTasks];
    if (exp.includes(taskId)) exp = exp.filter(id => id !== taskId);
    else exp.push(taskId);
    setState({ ...state, expandedTasks: exp }); // local state only for UI
  };

  const updateInput = (taskId, inputId, value) => {
      saveState({ taskData: { ...state.taskData, [`${taskId}_${inputId}`]: value } });
  };

  // Filter tasks based on current week
  const tasks = initialTasks.filter(t => state.currentWeek >= t.weekStart && state.currentWeek <= t.weekEnd);
  const completedToday = state.dailyProgress[state.currentDate] || [];
  const meta = getWeekMeta(state.currentWeek);

  const calculateChartData = () => {
    const dates = Object.keys(state.dailyProgress).sort();
    if (dates.length === 0) return { labels: [], data: [] };

    let cumulativeXP = 0;
    const dataPoints = [];
    dates.forEach(date => {
        const completedIds = state.dailyProgress[date];
        const dayXp = completedIds.reduce((sum, id) => {
            const task = initialTasks.find(t => t.id === id);
            return sum + (task ? task.xp : 0);
        }, 0);
        cumulativeXP += dayXp;
        dataPoints.push(cumulativeXP);
    });

    return { labels: dates, data: dataPoints };
  };

  const { labels, data: chartDataPoints } = calculateChartData();
  const hasChartData = labels.length > 0;

  const chartData = {
    labels,
    datasets: [{ label: 'Накопленный XP', data: chartDataPoints, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.3 }]
  };
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af', font: { family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' } } }, x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af', font: { family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' } } } } };

  const renderCalendar = () => {
      if (!state.startDate) return <div className="col-span-7 py-4 text-center text-tactical-accent animate-pulse font-mono">Ожидание первого действия...</div>;

      const start = new Date(state.startDate);
      const today = new Date(state.currentDate);

      let days = [];
      let currentDay = new Date(start);
      // To fill 8 weeks, calculate exactly 56 days
      for (let i = 0; i < 56; i++) {
          const dStr = currentDay.toISOString().split('T')[0];
          const isFuture = currentDay > today;
          const completed = state.dailyProgress[dStr] ? state.dailyProgress[dStr].length : 0;
          const totalAvailable = initialTasks.filter(t => Math.ceil((i+1)/7) >= t.weekStart && Math.ceil((i+1)/7) <= t.weekEnd).length;

          let colorClass = 'bg-tactical-900 border-tactical-700 text-gray-600';
          if (!isFuture) {
              if (completed === 0) colorClass = 'bg-red-900/30 border-red-800 text-red-500';
              else if (completed === totalAvailable && totalAvailable > 0) colorClass = 'bg-emerald-900/40 border-tactical-accent text-emerald-400 font-bold';
              else colorClass = 'bg-tactical-800 border-tactical-accent/50 text-emerald-200';
          }

          days.push(
              <div key={i} className={`h-8 flex items-center justify-center border rounded-sm text-xs font-mono ${colorClass}`} title={dStr}>
                  {i+1}
              </div>
          );
          currentDay.setDate(currentDay.getDate() + 1);
      }
      return days;
  };

  return (
    <div className="min-h-screen bg-tactical-900 text-gray-300 font-mono selection:bg-tactical-accent selection:text-tactical-900 pb-20 md:pb-8 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-4">
        <button onClick={() => setCurrentApp('menu')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1 font-mono">
          <ArrowLeft className="w-4 h-4"/> На главную
        </button>
      </div>

      <header className="max-w-4xl w-full border-b-2 border-tactical-700 pb-4 mb-6">
        <div className="flex justify-between items-center mb-4">
            <div></div>
            <div className="text-right">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider block mb-1">XP Статус</span>
                <span className="text-2xl font-black text-tactical-accent drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] font-mono">{state.totalXp}</span>
            </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest text-shadow-glow">Протокол КПТ</h1>
                <p className="text-gray-400 text-sm mt-1">Когнитивно-поведенческая терапия: 8-недельный курс</p>
            </div>
            <div className="flex items-center gap-4 bg-tactical-800 p-2 rounded border border-tactical-700">
                <span className="text-sm font-bold text-gray-400">СИСТЕМНАЯ ДАТА:</span>
                <input type="date" value={state.currentDate} onChange={(e) => saveState({ currentDate: e.target.value })} className="bg-tactical-900 border border-tactical-700 text-tactical-accent rounded px-3 py-1 outline-none font-mono" />
            </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 custom-scrollbar border-b border-tactical-700 font-mono">
            <button onClick={() => saveState({ activeTab: 'tasks' })} className={`px-6 py-3 font-bold uppercase tracking-wider text-sm whitespace-nowrap rounded-t transition-colors ${state.activeTab === 'tasks' ? 'bg-tactical-800 text-tactical-accent border-t-2 border-l border-r border-tactical-700 border-t-tactical-accent' : 'text-gray-500 hover:text-gray-300'}`}>
                <div className="flex items-center gap-2"><Target className="w-4 h-4"/> Протокол недели</div>
            </button>
            <button onClick={() => saveState({ activeTab: 'stats' })} className={`px-6 py-3 font-bold uppercase tracking-wider text-sm whitespace-nowrap rounded-t transition-colors ${state.activeTab === 'stats' ? 'bg-tactical-800 text-tactical-accent border-t-2 border-l border-r border-tactical-700 border-t-tactical-accent' : 'text-gray-500 hover:text-gray-300'}`}>
                <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4"/> Статистика</div>
            </button>
        </div>

        {state.activeTab === 'tasks' && (
            <div className="space-y-6 block">
                <div className="bg-tactical-800 p-6 cyber-border rounded-sm shadow-sm border border-tactical-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white tracking-widest uppercase font-mono">{meta.title}</h2>
                        <div className="flex items-center gap-3">
                            <button onClick={() => saveState({ currentWeek: Math.max(1, state.currentWeek - 1) })} className="px-3 py-1 bg-tactical-900 text-gray-400 hover:text-white rounded border border-tactical-700 transition-colors font-mono">◄</button>
                            <span className="text-tactical-accent font-bold font-mono">Неделя {state.currentWeek}/8</span>
                            <button onClick={() => saveState({ currentWeek: Math.min(8, state.currentWeek + 1) })} className="px-3 py-1 bg-tactical-900 text-gray-400 hover:text-white rounded border border-tactical-700 transition-colors font-mono">►</button>
                        </div>
                    </div>
                 <div className="bg-tactical-800 rounded-sm p-3.5 border border-tactical-700 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-tactical-accent mb-1 block font-mono">🎯 Цель недели:</span>
                        <p className="text-sm font-medium text-gray-200 leading-relaxed font-mono">{meta.goal}</p>
                    </div>
                </div>

                <div className="bg-tactical-800 p-4 cyber-border rounded-sm shadow-sm border border-tactical-700 overflow-hidden mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Календарь Тренинга</h2>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-400 font-mono">Старт:</label>
                            <input type="date" value={state.startDate || ''} onChange={(e) => saveState({startDate: e.target.value})} className="bg-tactical-900 border border-tactical-700 text-tactical-accent text-xs rounded px-2 py-1 outline-none font-mono" />
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono mb-2">
                        <div className="text-gray-500">ПН</div><div className="text-gray-500">ВТ</div><div className="text-gray-500">СР</div><div className="text-gray-500">ЧТ</div><div className="text-gray-500">ПТ</div><div className="text-tactical-alert">СБ</div><div className="text-tactical-alert">ВС</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-mono">
                        {renderCalendar()}
                    </div>
                </div>

                <div className="bg-tactical-800 rounded-sm cyber-border shadow-sm border border-tactical-700 overflow-hidden">
                    <div className="px-4 py-3 bg-tactical-900 border-b border-tactical-700 flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-400 uppercase tracking-wider font-mono">Ежедневные задания</span>
                    <span className="text-xs font-bold text-tactical-accent bg-tactical-800 px-2 py-1 rounded-md font-mono">Сегодня: {completedToday.length}/{tasks.length}</span>
                    </div>

                    <ul className="divide-y divide-tactical-700">
                    {tasks.map(task => {
                        const isDone = completedToday.includes(task.id);
                        const isExpanded = state.expandedTasks.includes(task.id);

                        return (
                        <li key={task.id} className={`p-4 transition-colors ${isDone ? 'bg-tactical-700/40' : 'hover:bg-tactical-700'}`}>
                            <div className="flex items-start gap-4">
                            <button onClick={(e) => toggleTask(task.id, task.xp, e)} className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform focus:outline-none">
                                {isDone ? <CheckCircle className="w-6 h-6 text-tactical-accent" /> : <Circle className="w-6 h-6 text-gray-600" />}
                            </button>
                            <div className="flex-1 cursor-pointer select-none group" onClick={() => toggleExpand(task.id)}>
                                <div className="flex justify-between items-start">
                                    <div className="pr-4">
                                        <p className={`text-sm md:text-base font-medium transition-colors font-mono ${isDone ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-tactical-accent'}`}>
                                        {task.text}
                                        </p>
                                        <p className="text-xs text-tactical-accent mt-1 font-semibold font-mono">+{task.xp} XP</p>
                                    </div>
                                    <div className="flex-shrink-0 text-gray-500 group-hover:text-tactical-accent transition-colors mt-0.5">
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                            </div>
                            </div>

                            {isExpanded && (
                                <div className="ml-10 mt-3 pt-3 border-t border-tactical-700 text-sm text-gray-300 cursor-default" onClick={e => e.stopPropagation()}>
                                    <p className="mb-3 text-gray-200 bg-tactical-900 p-2.5 rounded border border-tactical-700 leading-relaxed font-mono">
                                        <span className="font-semibold text-tactical-accent mr-1">ℹ️ Суть:</span> {task.description}
                                    </p>
                                    <div className="mt-2 mb-4">
                                        <span className="font-semibold text-xs uppercase tracking-wider text-gray-500 block mb-2 font-mono">Этапы выполнения:</span>
                                        <ol className="list-decimal pl-4 space-y-1 font-mono">
                                            {task.steps.map((s, i) => <li key={i} className="mb-1.5 pl-1">{s}</li>)}
                                        </ol>
                                    </div>

                                    {task.inputs && task.inputs.length > 0 && (
                                        <div className="mt-4 p-4 bg-tactical-800 border border-tactical-700 rounded space-y-4 shadow-sm">
                                            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3 font-mono">Ваши записи:</h4>
                                            {task.inputs.map(inp => {
                                                const val = state.taskData[`${task.id}_${inp.id}`] || '';
                                                return (
                                                    <div key={inp.id} className="space-y-1.5">
                                                        <label className="block text-sm font-medium text-gray-200 font-mono">{inp.label}</label>
                                                        {inp.type === 'slider' ? (
                                                            <>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-sm font-bold text-tactical-accent bg-tactical-900 px-2 py-0.5 rounded font-mono">{val || inp.min}{inp.suffix}</span>
                                                                </div>
                                                                <input type="range" min={inp.min} max={inp.max} step={inp.step} value={val || inp.min} onChange={e => updateInput(task.id, inp.id, e.target.value)} className="w-full h-2 bg-tactical-700 rounded appearance-none cursor-pointer accent-tactical-accent" />
                                                                <div className="flex justify-between text-xs text-gray-500 font-mono"><span>{inp.min}</span><span>{inp.max}</span></div>
                                                            </>
                                                        ) : inp.type === 'textarea' ? (
                                                            <textarea rows="2" placeholder={inp.placeholder || "Напишите здесь..."} value={val} onChange={e => updateInput(task.id, inp.id, e.target.value)} className="w-full p-2.5 bg-tactical-900 border border-tactical-700 text-white rounded focus:ring-1 focus:ring-tactical-accent outline-none transition-all resize-y text-sm font-mono" />
                                                        ) : (
                                                            <input type="text" placeholder={inp.placeholder || "Напишите здесь..."} value={val} onChange={e => updateInput(task.id, inp.id, e.target.value)} className="w-full p-2.5 bg-tactical-900 border border-tactical-700 text-white rounded focus:ring-1 focus:ring-tactical-accent outline-none transition-all text-sm font-mono" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                        );
                    })}
                    </ul>
                </div>
            </div>
        )}

        {state.activeTab === 'stats' && (
            <div className="space-y-6 block">
                <div className="bg-tactical-800 p-6 cyber-border rounded-sm shadow-sm border border-tactical-700">
                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2 font-mono">
                        <CheckSquare className="w-5 h-5 text-tactical-accent" /> Динамика выполнения заданий
                    </h2>

                    {!hasChartData && (
                        <div className="h-40 flex items-center justify-center text-gray-500 text-sm bg-tactical-900 rounded border border-dashed border-tactical-700 font-mono">
                            Выполните первые задания, чтобы увидеть график прогресса.
                        </div>
                    )}

                    {hasChartData && (
                        <div className="h-64 w-full relative">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
