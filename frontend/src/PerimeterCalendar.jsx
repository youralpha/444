import React from 'react';

export function CalendarTab({ state }) {
    const renderCalendar = () => {
        if (!state.currentDate) return null;
        const [year, month] = state.currentDate.split('-');
        if (!year || !month) return null;
        const date = new Date(year, month - 1, 1);
        const daysInMonth = new Date(year, month, 0).getDate();
        const startDay = date.getDay() === 0 ? 6 : date.getDay() - 1; // Mon=0

        const events = {};

        // Collect network events
        if (state.network) {
            state.network.forEach(a => {
                if (a.nextDate && a.nextDate.startsWith(`${year}-${month}`)) {
                    const day = parseInt(a.nextDate.split('-')[2]);
                    if (!events[day]) events[day] = [];
                    events[day].push({ type: 'network', text: `Контакт: ${a.callsign || a.name}`, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' });
                }
            });
        }

        // Collect protocol events
        if (state.tasks) {
            state.tasks.forEach(t => {
                if (t.deadline && t.deadline.startsWith(`${year}-${month}`)) {
                    const day = parseInt(t.deadline.split('-')[2]);
                    if (!events[day]) events[day] = [];
                    events[day].push({ type: 'task', text: `Дедлайн: ${t.text}`, color: 'bg-red-500/20 text-red-400 border-red-500/30' });
                }
            });
        }

        const days = [];
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="bg-tactical-900/50 border border-tactical-800 rounded min-h-[100px]"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const hasEvents = events[i] && events[i].length > 0;
            const isToday = state.currentDate === `${year}-${month}-${String(i).padStart(2, '0')}`;

            days.push(
                <div key={`day-${i}`} className={`bg-tactical-900 border ${isToday ? 'border-tactical-accent' : 'border-tactical-700'} rounded p-2 min-h-[100px] flex flex-col gap-1 overflow-hidden transition-colors hover:bg-tactical-800`}>
                    <span className={`text-sm font-bold ${isToday ? 'text-tactical-accent' : 'text-gray-400'}`}>{i}</span>
                    <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
                        {hasEvents && events[i].map((ev, idx) => (
                            <div key={idx} className={`text-[10px] px-1.5 py-1 rounded border leading-tight ${ev.color} truncate`} title={ev.text}>
                                {ev.text}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider text-center">{monthNames[parseInt(month) - 1]} {year}</h3>
                <div className="grid grid-cols-7 gap-2">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                        <div key={d} className="text-center text-gray-500 text-xs font-bold uppercase pb-2">{d}</div>
                    ))}
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-tactical-800 p-6 rounded-sm border border-tactical-700">
            {renderCalendar()}
        </div>
    );
}
