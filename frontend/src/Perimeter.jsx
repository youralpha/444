import React, { useState, useEffect } from 'react';
import { Target, Users, Calendar as CalendarIcon, CheckSquare, Crosshair } from 'lucide-react';
import { initialPerimeterState } from './perimeterData';
import { TaskTab, TaskModal, CustomTaskModal } from './PerimeterModals';
import { NetworkTab, AssetModal } from './PerimeterNetwork';
import { CalendarTab } from './PerimeterCalendar';

export default function Perimeter({ setCurrentApp }) {
    const [state, setState] = useState(initialPerimeterState);
    const [activeTab, setActiveTab] = useState('protocols');
    const [taskModal, setTaskModal] = useState({ isOpen: false, taskId: null });
    const [customTaskModal, setCustomTaskModal] = useState({ isOpen: false, task: null });
    const [assetModal, setAssetModal] = useState({ isOpen: false, assetId: null });
    const [toast, setToast] = useState({ show: false, message: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/data/perimetr');
            const data = await res.json();
            if (data.perimeter) {
                // Ensure array fields exist
                const p = data.perimeter;
                if (!p.tasks) p.tasks = initialPerimeterState.tasks;
                if (!p.network) p.network = initialPerimeterState.network;
                if (!p.customTasks) p.customTasks = initialPerimeterState.customTasks || [];
                if (!p.score) p.score = 0;

                setState(prev => ({ ...prev, ...p }));
            }
        } catch (error) {
            console.error('Error loading perimeter data:', error);
        }
    };

    const saveState = async (updates) => {
        const newState = { ...state, ...updates };
        setState(newState);
        try {
            await fetch('http://127.0.0.1:5000/api/data/perimetr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ perimeter: newState })
            });
        } catch (error) {
            console.error('Error saving perimeter data:', error);
        }
    };

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    return (
        <div className="min-h-screen bg-tactical-900 text-gray-300 font-mono p-4 pb-24 md:pb-8 selection:bg-tactical-accent selection:text-tactical-900">
            {toast.show && (
                <div className="fixed top-4 right-4 z-[100] bg-tactical-accent text-tactical-900 px-6 py-3 rounded-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-in fade-in slide-in-from-top-5">
                    {toast.message}
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="border-b-2 border-tactical-700 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentApp('menu')} className="text-tactical-accent hover:text-emerald-400 font-bold border border-tactical-accent px-4 py-2 rounded uppercase text-sm tracking-wider hover:bg-tactical-accent/10 transition-colors">
                            ← На главную
                        </button>
                        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest text-shadow-glow">ПЕРИМЕТР v4.0</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-400 uppercase">Оценка</span>
                            <span className="text-2xl font-black text-tactical-accent drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{state.score}</span>
                        </div>
                        <input type="date" value={state.currentDate || ''} onChange={(e) => saveState({ currentDate: e.target.value })} className="bg-tactical-800 border border-tactical-700 rounded p-2 text-sm text-white font-mono focus:border-tactical-accent outline-none"/>
                    </div>
                </div>

                {/* Mission & Focus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-tactical-800 border border-tactical-700 p-4 rounded-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                        <h2 className="text-orange-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-sm">
                            <Target className="w-4 h-4"/> Mission: Главная цель года
                        </h2>
                        <textarea value={state.mission || ''} onChange={(e) => saveState({ mission: e.target.value })} placeholder="Определи главную цель..." className="w-full bg-transparent border-none text-white text-base resize-none focus:outline-none custom-scrollbar min-h-[80px]"></textarea>
                    </div>
                    <div className="bg-tactical-800 border border-tactical-700 p-4 rounded-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-tactical-accent"></div>
                        <h2 className="text-tactical-accent font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-sm">
                            <Crosshair className="w-4 h-4"/> Focus: Цель на месяц
                        </h2>
                        <textarea value={state.monthFocus || ''} onChange={(e) => saveState({ monthFocus: e.target.value })} placeholder="Определи фокус месяца..." className="w-full bg-transparent border-none text-white text-base resize-none focus:outline-none custom-scrollbar min-h-[80px]"></textarea>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar border-b border-tactical-700">
                    <button onClick={() => setActiveTab('protocols')} className={`px-6 py-3 font-bold uppercase tracking-wider text-sm whitespace-nowrap rounded-t transition-colors ${activeTab === 'protocols' ? 'bg-tactical-800 text-tactical-accent border-t-2 border-l border-r border-tactical-700 border-t-tactical-accent' : 'text-gray-500 hover:text-gray-300'}`}>
                        <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4"/> Battle Rhythm</div>
                    </button>
                    <button onClick={() => setActiveTab('network')} className={`px-6 py-3 font-bold uppercase tracking-wider text-sm whitespace-nowrap rounded-t transition-colors ${activeTab === 'network' ? 'bg-tactical-800 text-blue-400 border-t-2 border-l border-r border-tactical-700 border-t-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
                        <div className="flex items-center gap-2"><Users className="w-4 h-4"/> Agent Network</div>
                    </button>
                    <button onClick={() => setActiveTab('calendar')} className={`px-6 py-3 font-bold uppercase tracking-wider text-sm whitespace-nowrap rounded-t transition-colors ${activeTab === 'calendar' ? 'bg-tactical-800 text-white border-t-2 border-l border-r border-tactical-700 border-t-gray-400' : 'text-gray-500 hover:text-gray-300'}`}>
                        <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4"/> Оперативный календарь</div>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="min-h-[500px]">
                    {activeTab === 'protocols' && <TaskTab state={state} saveState={saveState} showToast={showToast} setTaskModal={setTaskModal} setCustomTaskModal={setCustomTaskModal} />}
                    {activeTab === 'network' && <NetworkTab state={state} saveState={saveState} showToast={showToast} setAssetModal={setAssetModal} />}
                    {activeTab === 'calendar' && <CalendarTab state={state} />}
                </div>
            </div>

            {/* Modals */}
            <TaskModal isOpen={taskModal.isOpen} onClose={() => setTaskModal({ isOpen: false, taskId: null })} taskId={taskModal.taskId} state={state} saveState={saveState} showToast={showToast} />
            <CustomTaskModal isOpen={customTaskModal.isOpen} onClose={() => setCustomTaskModal({ isOpen: false, task: null })} taskId={customTaskModal.task} cycleId={customTaskModal.cycleId} state={state} saveState={saveState} showToast={showToast} />
            <AssetModal isOpen={assetModal.isOpen} onClose={() => setAssetModal({ isOpen: false, assetId: null })} assetId={assetModal.assetId} state={state} saveState={saveState} showToast={showToast} />
        </div>
    );
}
