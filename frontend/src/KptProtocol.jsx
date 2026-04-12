import React, { useState, useEffect } from 'react';
import { BrainCircuit, Trophy, CheckCircle, Circle, ChevronDown, ChevronUp, Calendar, TrendingUp, CheckSquare } from 'lucide-react';
import { WEEK_METADATA, PROTOCOL_WEEKS } from './kptData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function KptProtocol({ goBack }) {
  const [state, setState] = useState({
    activeTab: 'tracker',
    currentWeek: 1,
    xp: 0,
    level: 1,
    dailyProgress: {},
    expandedTasks: [],
    taskData: {},
    startDate: null
  });

  const todayDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

  useEffect(() => {
    fetch('/api/data/kpt')
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setState(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
         const local = localStorage.getItem('kpt_data');
         if (local) setState(JSON.parse(local));
      });
  }, []);

  const saveState = (newState) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    fetch('/api/data/kpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedState)
    }).catch(() => localStorage.setItem('kpt_data', JSON.stringify(updatedState)));
  };

  const toggleTask = (taskId, taskXp, e) => {
    e.stopPropagation();
    let todayTasks = [...(state.dailyProgress[todayDate] || [])];
    let newXp = state.xp;

    if (todayTasks.includes(taskId)) {
      todayTasks = todayTasks.filter(id => id !== taskId);
      newXp -= taskXp;
    } else {
      todayTasks.push(taskId);
      newXp += taskXp;
    }

    const newLevel = Math.floor(Math.max(0, newXp) / 100) + 1;
    const newProgress = { ...state.dailyProgress, [todayDate]: todayTasks };

    saveState({
      dailyProgress: newProgress,
      xp: Math.max(0, newXp),
      level: newLevel,
      startDate: (!state.startDate && todayTasks.length > 0) ? todayDate : state.startDate
    });
  };

  const toggleExpand = (taskId) => {
    const isExpanded = state.expandedTasks.includes(taskId);
    saveState({
        expandedTasks: isExpanded
            ? state.expandedTasks.filter(id => id !== taskId)
            : [...state.expandedTasks, taskId]
    });
  };

  const updateInput = (taskId, inputId, value) => {
    saveState({
      taskData: {
        ...state.taskData,
        [`${taskId}_${inputId}`]: value
      }
    });
  };

  const tasks = PROTOCOL_WEEKS[state.currentWeek] || [];
  const completedToday = state.dailyProgress[todayDate] || [];
  const meta = WEEK_METADATA[state.currentWeek];

  // Calendar Calculation
  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
        cells.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    const startD = state.startDate ? new Date(state.startDate) : null;
    if (startD) startD.setHours(0,0,0,0);
    const currentD = new Date(todayDate);
    currentD.setHours(0,0,0,0);

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const cellDate = new Date(dateStr);
        cellDate.setHours(0,0,0,0);

        const isToday = dateStr === todayDate;
        let isMissed = false;
        let isCompleted = false;

        if (startD && cellDate >= startD && cellDate <= currentD) {
            const tasksForDay = state.dailyProgress[dateStr];
            if (tasksForDay && tasksForDay.length > 0) {
                isCompleted = true;
            } else if (!isToday) {
                isMissed = true;
            }
        }

        const isSunday = (day + firstDay) % 7 === 0 || (day + firstDay) % 7 === 6;

        let cellClasses = "p-2 m-0.5 rounded border flex flex-col items-center justify-center relative transition-colors ";

        if (isMissed) {
            cellClasses += "bg-tactical-alert/20 border-tactical-alert text-tactical-alert font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)] ";
        } else if (isCompleted) {
            cellClasses += "bg-tactical-accent/20 border-tactical-accent text-tactical-accent font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)] ";
        } else if (isToday) {
            cellClasses += "bg-tactical-700 border-tactical-500 text-white font-bold ";
        } else {
            if (isSunday) cellClasses += "text-gray-400 border-transparent ";
            else cellClasses += "text-gray-500 border-transparent ";
        }

        cells.push(
            <div key={dateStr} className={`${cellClasses} h-10 md:h-12`}>
                <span>{day}</span>
            </div>
        );
    }
    return cells;
  };

  const chartData = {
    labels: Object.keys(state.dailyProgress).sort().map(d => d.slice(5)),
    datasets: [
      {
        fill: true,
        label: 'Выполнено заданий',
        data: Object.keys(state.dailyProgress).sort().map(d => state.dailyProgress[d].length),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#334155' }, border: { display: false } }
    }
  };

  const hasChartData = Object.keys(state.dailyProgress).length > 0;

  return (
    <div className="bg-tactical-900 text-tactical-text min-h-screen font-sans pb-10">
      <header className="bg-tactical-800 shadow-sm sticky top-0 z-10 cyber-border border-b-0 border-l-0 border-r-0">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button onClick={goBack} className="text-gray-500 hover:text-gray-300 transition-colors text-sm font-medium flex items-center gap-1 mb-4">
            &larr; На главную
          </button>

          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2 text-tactical-accent">
              <BrainCircuit className="w-6 h-6" /> КПТ Протокол
            </h1>
            <div className="flex items-center gap-2 bg-tactical-900 px-3 py-1 rounded-full border border-tactical-700">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-white">Уровень {state.level}</span>
            </div>
          </div>

          <div className="w-full bg-tactical-700 rounded-full h-2.5 mb-1">
            <div className="bg-tactical-accent h-2.5 rounded-full transition-all duration-500" style={{ width: `${(state.xp % 100)}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>{state.xp} Всего XP</span>
            <span>До ур. {state.level + 1} осталось {100 - (state.xp % 100)} XP</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6">

        <div className="flex bg-tactical-700 rounded-sm p-1 mb-6">
            <button onClick={() => saveState({activeTab: 'tracker'})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-sm text-sm font-medium transition-colors ${state.activeTab === 'tracker' ? 'bg-tactical-800 shadow-sm text-tactical-accent' : 'text-gray-300 hover:text-tactical-accent'}`}>
                <Calendar className="w-4 h-4" /> Трекер
            </button>
            <button onClick={() => saveState({activeTab: 'stats'})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-sm text-sm font-medium transition-colors ${state.activeTab === 'stats' ? 'bg-tactical-800 shadow-sm text-tactical-accent' : 'text-gray-300 hover:text-tactical-accent'}`}>
                <TrendingUp className="w-4 h-4" /> Динамика
            </button>
        </div>

        {state.activeTab === 'tracker' && (
            <div className="space-y-6 block">
                <div className="flex justify-between items-center bg-tactical-800 p-4 rounded-sm shadow-sm border border-tactical-700 cyber-border">
                    <h2 className="font-semibold text-white">Текущая неделя</h2>
                    <select value={state.currentWeek} onChange={(e) => saveState({currentWeek: parseInt(e.target.value)})} className="bg-tactical-900 border border-tactical-700 text-white text-sm rounded focus:ring-tactical-accent focus:border-tactical-accent block p-2 outline-none cursor-pointer">
                        <option value="1">Неделя 1: Мониторинг</option>
                        <option value="2">Неделя 2: Активация и Сон</option>
                        <option value="3">Неделя 3: Избегание</option>
                        <option value="4">Неделя 4: Тест мыслей</option>
                        <option value="5">Неделя 5: Экспозиция</option>
                        <option value="6">Неделя 6: Ассертивность</option>
                        <option value="7">Неделя 7: Убеждения</option>
                        <option value="8">Неделя 8: Профилактика</option>
                    </select>
                </div>

                <div className="bg-tactical-900/50 border border-tactical-700 rounded-sm p-5 shadow-sm mb-6 cyber-border">
                    <h3 className="font-bold text-tactical-accent text-lg mb-2 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5" /> {meta.title}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4 leading-relaxed">{meta.desc}</p>
                    <div className="bg-tactical-800 rounded-sm p-3.5 border border-tactical-700 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-tactical-accent mb-1 block">🎯 Цель недели:</span>
                        <p className="text-sm font-medium text-gray-200 leading-relaxed">{meta.goal}</p>
                    </div>
                </div>

                <div className="bg-tactical-800 p-4 cyber-border rounded-sm shadow-sm border border-tactical-700 overflow-hidden mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Календарь Тренинга</h2>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-400">Старт:</label>
                            <input type="date" value={state.startDate || ''} onChange={(e) => saveState({startDate: e.target.value})} className="bg-tactical-900 border border-tactical-700 text-tactical-accent text-xs rounded px-2 py-1 outline-none" />
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
                    <span className="font-semibold text-sm text-gray-400 uppercase tracking-wider">Ежедневные задания</span>
                    <span className="text-xs font-bold text-tactical-accent bg-tactical-800 px-2 py-1 rounded-md">Сегодня: {completedToday.length}/{tasks.length}</span>
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
                                        <p className={`text-sm md:text-base font-medium transition-colors ${isDone ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-tactical-accent'}`}>
                                        {task.text}
                                        </p>
                                        <p className="text-xs text-tactical-accent mt-1 font-semibold">+{task.xp} XP</p>
                                    </div>
                                    <div className="flex-shrink-0 text-gray-500 group-hover:text-tactical-accent transition-colors mt-0.5">
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                            </div>
                            </div>

                            {isExpanded && (
                                <div className="ml-10 mt-3 pt-3 border-t border-tactical-700 text-sm text-gray-300 cursor-default" onClick={e => e.stopPropagation()}>
                                    <p className="mb-3 text-gray-200 bg-tactical-900 p-2.5 rounded border border-tactical-700 leading-relaxed">
                                        <span className="font-semibold text-tactical-accent mr-1">ℹ️ Суть:</span> {task.description}
                                    </p>
                                    <div className="mt-2 mb-4">
                                        <span className="font-semibold text-xs uppercase tracking-wider text-gray-500 block mb-2">Этапы выполнения:</span>
                                        <ol className="list-decimal pl-4 space-y-1">
                                            {task.steps.map((s, i) => <li key={i} className="mb-1.5 pl-1">{s}</li>)}
                                        </ol>
                                    </div>

                                    {task.inputs && task.inputs.length > 0 && (
                                        <div className="mt-4 p-4 bg-tactical-800 border border-tactical-700 rounded space-y-4 shadow-sm">
                                            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Ваши записи:</h4>
                                            {task.inputs.map(inp => {
                                                const val = state.taskData[`${task.id}_${inp.id}`] || '';
                                                return (
                                                    <div key={inp.id} className="space-y-1.5">
                                                        <label className="block text-sm font-medium text-gray-200">{inp.label}</label>
                                                        {inp.type === 'slider' ? (
                                                            <>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-sm font-bold text-tactical-accent bg-tactical-900 px-2 py-0.5 rounded">{val || inp.min}{inp.suffix}</span>
                                                                </div>
                                                                <input type="range" min={inp.min} max={inp.max} step={inp.step} value={val || inp.min} onChange={e => updateInput(task.id, inp.id, e.target.value)} className="w-full h-2 bg-tactical-700 rounded appearance-none cursor-pointer accent-tactical-accent" />
                                                                <div className="flex justify-between text-xs text-gray-500"><span>{inp.min}</span><span>{inp.max}</span></div>
                                                            </>
                                                        ) : inp.type === 'textarea' ? (
                                                            <textarea rows="2" placeholder={inp.placeholder || "Напишите здесь..."} value={val} onChange={e => updateInput(task.id, inp.id, e.target.value)} className="w-full p-2.5 bg-tactical-900 border border-tactical-700 text-white rounded focus:ring-1 focus:ring-tactical-accent outline-none transition-all resize-y text-sm" />
                                                        ) : (
                                                            <input type="text" placeholder={inp.placeholder || "Напишите здесь..."} value={val} onChange={e => updateInput(task.id, inp.id, e.target.value)} className="w-full p-2.5 bg-tactical-900 border border-tactical-700 text-white rounded focus:ring-1 focus:ring-tactical-accent outline-none transition-all text-sm" />
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
                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-tactical-accent" /> Динамика выполнения заданий
                    </h2>

                    {!hasChartData && (
                        <div className="h-40 flex items-center justify-center text-gray-500 text-sm bg-tactical-900 rounded border border-dashed border-tactical-700">
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
