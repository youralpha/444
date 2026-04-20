import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, GripVertical, CheckCircle, Edit3 } from 'lucide-react';
import { initialProtocolCycles } from './perimeterData';

export function TaskTab({ state, saveState, showToast, setTaskModal, setCustomTaskModal }) {
  // Merge static tasks with custom tasks
  const getCombinedCycles = () => {
      const cyclesMap = new Map();
      initialProtocolCycles.forEach(c => cyclesMap.set(c.id, { ...c, tasks: [...c.tasks] }));

      if (state.customTasks && state.customTasks.length > 0) {
          state.customTasks.forEach(ct => {
              if (cyclesMap.has(ct.cycleId)) {
                  const cycle = cyclesMap.get(ct.cycleId);
                  const existingIdx = cycle.tasks.findIndex(t => t.id === ct.id);
                  if (existingIdx !== -1) {
                      cycle.tasks[existingIdx] = ct;
                  } else {
                      cycle.tasks.push(ct);
                  }
              }
          });
      }
      return Array.from(cyclesMap.values());
  };

  const cycles = getCombinedCycles();

  const handleDragStart = (e, taskId, cycleId) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ taskId, cycleId }));
  };

  const handleDrop = (e, targetCycleId, targetIdx) => {
      e.preventDefault();
      try {
          const { taskId, cycleId } = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (cycleId === targetCycleId) {
              const ct = state.customTasks || [];
              const sourceIdx = cycles.find(c => c.id === cycleId).tasks.findIndex(t => t.id === taskId);
              if (sourceIdx !== targetIdx && sourceIdx !== -1) {
                   showToast("Сортировка протоколов скоро будет доступна");
              }
          }
      } catch(err){}
  };

  const deleteProtocol = (cycleId, taskId) => {
      if (window.confirm("Точно удалить этот протокол навсегда?")) {
          const customTasks = (state.customTasks || []).filter(t => t.id !== taskId);
          saveState({ customTasks });
          showToast("Протокол удален");
      }
  };

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cycles.map(cycle => (
              <div key={cycle.id} className="bg-tactical-800 border border-tactical-700 rounded-sm p-4 relative overflow-hidden flex flex-col h-full"
                   onDragOver={e => e.preventDefault()}
                   onDrop={e => handleDrop(e, cycle.id, cycle.tasks.length)}>
                  <div className={`absolute top-0 left-0 w-full h-1 bg-current ${cycle.color}`}></div>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className={`font-bold uppercase tracking-wider text-sm ${cycle.color}`}>{cycle.title}</h3>
                      <button onClick={() => setCustomTaskModal({ isOpen: true, task: null, cycleId: cycle.id })} className={`w-6 h-6 flex items-center justify-center rounded border border-tactical-700 hover:border-current hover:bg-tactical-900 transition-colors ${cycle.color}`}>
                          <Plus className="w-4 h-4"/>
                      </button>
                  </div>
                  <div className="space-y-3 flex-1">
                      {cycle.tasks.map((task, idx) => {
                          const isCompleted = state.tasks.some(t => t.id === task.id && t.date === state.currentDate);
                          const isCustom = task.id.startsWith('custom_');
                          return (
                              <div key={task.id}
                                   draggable="true"
                                   onDragStart={e => handleDragStart(e, task.id, cycle.id)}
                                   onDragOver={e => e.preventDefault()}
                                   onDrop={e => { e.stopPropagation(); handleDrop(e, cycle.id, idx); }}
                                   className={`group relative bg-tactical-900 border ${isCompleted ? 'border-tactical-accent' : 'border-tactical-700 hover:border-gray-500'} p-3 rounded cursor-pointer transition-all ${isCompleted ? 'opacity-70' : ''}`}
                                   onClick={(e) => {
                                      if(!e.target.closest('button')) setTaskModal({ isOpen: true, taskId: task.id, cycleId: cycle.id });
                                   }}>
                                  <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab px-1 text-tactical-700 hover:text-gray-400">
                                      <GripVertical className="w-3 h-3"/>
                                  </div>
                                  <div className="flex justify-between items-start gap-2 pl-4">
                                      <div className="flex-1">
                                          <div className={`font-bold text-xs uppercase leading-tight mb-1 ${isCompleted ? 'text-tactical-accent line-through' : 'text-white'}`}>{task.text}</div>
                                          <div className="text-[10px] text-gray-500 bg-tactical-800 inline-block px-1.5 py-0.5 rounded border border-tactical-700">{task.time}</div>
                                      </div>
                                      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                          {isCustom && <button onClick={() => setCustomTaskModal({ isOpen: true, task: task.id, cycleId: cycle.id })} className="p-1 text-gray-500 hover:text-blue-400"><Edit3 className="w-3 h-3"/></button>}
                                          {isCustom && <button onClick={() => deleteProtocol(cycle.id, task.id)} className="p-1 text-gray-500 hover:text-red-400"><Trash2 className="w-3 h-3"/></button>}
                                          {isCompleted && <CheckCircle className="w-4 h-4 text-tactical-accent" />}
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          ))}
      </div>
  );
}

export function TaskModal({ isOpen, onClose, taskId, state, saveState, showToast }) {
    const [formData, setFormData] = useState({});
    const [task, setTask] = useState(null);

    useEffect(() => {
        if (isOpen && taskId) {
            let foundTask = null;

            // First check initial static tasks
            initialProtocolCycles.forEach(c => c.tasks.forEach(t => { if(t.id === taskId) foundTask = t; }));

            // Then check custom tasks (overrides static if same ID, or new custom)
            if (state.customTasks) {
                state.customTasks.forEach(ct => { if(ct.id === taskId) foundTask = ct; });
            }

            setTask(foundTask);
            const savedTaskData = state.tasks.find(t => t.id === taskId && t.date === state.currentDate);
            setFormData(savedTaskData ? (savedTaskData.data || {}) : {});
        }
    }, [isOpen, taskId, state.tasks, state.currentDate, state.customTasks]);

    if (!isOpen || !task) return null;

    const saveTaskModalData = () => {
        const newTask = { id: taskId, date: state.currentDate, data: formData };
        const otherTasks = state.tasks.filter(t => !(t.id === taskId && t.date === state.currentDate));

        let newScore = state.score;
        const isCurrentlyCompleted = state.tasks.some(t => t.id === taskId && t.date === state.currentDate);
        if (!isCurrentlyCompleted) {
            newScore += 5; // Base score for completing a task
        }

        saveState({ tasks: [...otherTasks, newTask], score: newScore });
        showToast("Протокол выполнен (+5 OODA)");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-tactical-800 border border-tactical-700 rounded-sm w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 md:p-6 border-b border-tactical-700 flex justify-between items-start bg-tactical-800 z-10 sticky top-0">
                    <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-wide">{task.text}</h3>
                        <div className="text-xs text-tactical-accent font-mono mt-1 border border-tactical-accent/30 inline-block px-2 py-0.5 rounded bg-tactical-accent/10">T+{task.time}</div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                </div>
                <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
                    {task.description && <div className="text-sm text-gray-400 mb-6 bg-tactical-900 p-4 border border-tactical-700 rounded-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: task.description }}></div>}
                    <div className="space-y-5">
                        {(task.fields || []).map(f => (
                            <div key={f.id}>
                                <label className="text-xs font-bold text-gray-400 uppercase">{f.label}</label>
                                {f.type === 'textarea' ? (
                                    <textarea
                                        rows="3"
                                        className="w-full bg-tactical-900 border border-tactical-700 rounded p-2 text-white outline-none mt-1 focus:border-tactical-accent custom-scrollbar"
                                        value={formData[f.id] || ''}
                                        onChange={e => setFormData({...formData, [f.id]: e.target.value})}
                                        placeholder={f.placeholder || ''}
                                    />
                                ) : (
                                    <input
                                        type={f.type || 'text'}
                                        className="w-full bg-tactical-900 border border-tactical-700 rounded p-2 text-white outline-none mt-1 focus:border-tactical-accent"
                                        value={formData[f.id] || ''}
                                        onChange={e => setFormData({...formData, [f.id]: e.target.value})}
                                        placeholder={f.placeholder || ''}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 md:p-6 border-t border-tactical-700 flex justify-end items-center bg-tactical-900">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-500 hidden md:block">{state.currentDate}</span>
                        <button onClick={onClose} className="px-4 py-2 rounded text-sm text-gray-300 hover:bg-tactical-700 transition-colors">Отмена</button>
                        <button onClick={saveTaskModalData} className="px-6 py-2 rounded text-sm bg-tactical-accent text-tactical-900 font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">Выполнить Протокол</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CustomTaskModal({ isOpen, onClose, cycleId, taskId, state, saveState, showToast }) {
    const [formData, setFormData] = useState({ cycleId: 'daily', title: '', time: '', desc: '', fields: [] });

    useEffect(() => {
        if (isOpen) {
            if (taskId) {
                let taskToEdit = null;
                let actualCycleId = cycleId;

                // Check in state.customTasks first
                if (state.customTasks) {
                    const ct = state.customTasks.find(t => t.id === taskId);
                    if (ct) { taskToEdit = ct; actualCycleId = ct.cycleId; }
                }

                // Fallback to static initial ones if not a custom one but we edit it (which creates a custom override)
                if (!taskToEdit) {
                   initialProtocolCycles.forEach(c => c.tasks.forEach(t => {
                       if(t.id === taskId) { taskToEdit = t; actualCycleId = c.id; }
                   }));
                }

                if (taskToEdit) {
                    setFormData({
                        cycleId: actualCycleId,
                        title: taskToEdit.text || '',
                        time: taskToEdit.time || '',
                        desc: taskToEdit.description || '',
                        fields: taskToEdit.fields || []
                    });
                }
            } else {
                setFormData({ cycleId: cycleId || 'daily', title: '', time: '', desc: '', fields: [] });
            }
        }
    }, [isOpen, cycleId, taskId, state]);

    if (!isOpen) return null;

    const addField = () => {
        const newField = { id: 'cf_' + Date.now(), label: '', type: 'input' };
        setFormData({ ...formData, fields: [...formData.fields, newField] });
    };

    const removeField = (idToRemove) => {
        setFormData({ ...formData, fields: formData.fields.filter(f => f.id !== idToRemove) });
    };

    const updateField = (id, key, val) => {
        setFormData({
            ...formData,
            fields: formData.fields.map(f => f.id === id ? { ...f, [key]: val } : f)
        });
    };

    const handleSave = () => {
        const cleanedFields = formData.fields.filter(f => f.label.trim() !== '');
        const newTaskData = {
            id: taskId || ('custom_' + Date.now()),
            cycleId: formData.cycleId,
            text: formData.title || "Новый протокол",
            time: formData.time || "-",
            description: formData.desc,
            fields: cleanedFields
        };

        let customTasks = state.customTasks || [];
        const existingIdx = customTasks.findIndex(t => t.id === newTaskData.id);

        if (existingIdx !== -1) {
            customTasks[existingIdx] = newTaskData;
        } else {
            customTasks.push(newTaskData);
        }

        saveState({ customTasks });
        showToast("Протокол сохранен");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-tactical-800 border border-tactical-700 rounded-sm w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-white uppercase mb-4 border-b border-tactical-700 pb-2 flex-shrink-0">
                    {taskId ? "Редактировать протокол" : "Новый протокол"}
                </h3>
                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Цикл</label>
                        <select value={formData.cycleId} onChange={e => setFormData({...formData, cycleId: e.target.value})} className="w-full bg-tactical-900 border border-tactical-700 rounded p-2 text-white outline-none focus:border-tactical-accent">
                            <option value="daily">Ежедневно</option>
                            <option value="weekly">Еженедельно</option>
                            <option value="monthly">Ежемесячно</option>
                            <option value="quarterly">Ежеквартально</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Название</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-tactical-900 border border-tactical-700 rounded p-2 text-white outline-none focus:border-tactical-accent" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Время</label>
                        <input type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-tactical-900 border border-tactical-700 rounded p-2 text-white outline-none focus:border-tactical-accent" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Описание (HTML)</label>
                        <textarea rows="2" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-tactical-900 border border-tactical-700 rounded p-2 text-white outline-none custom-scrollbar focus:border-tactical-accent"></textarea>
                    </div>

                    <div className="border-t border-tactical-700 pt-4 mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-tactical-accent uppercase tracking-widest">Кастомные поля (Форма)</label>
                            <button type="button" onClick={addField} className="text-xs bg-tactical-900 border border-tactical-700 hover:border-tactical-accent text-tactical-accent px-2 py-1 rounded flex items-center gap-1">
                                <Plus className="w-3 h-3"/> Поле
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.fields.map(f => (
                                <div key={f.id} className="flex gap-2 items-center bg-tactical-900 p-2 rounded border border-tactical-700">
                                    <input type="text" placeholder="Название поля" value={f.label} onChange={e => updateField(f.id, 'label', e.target.value)} className="flex-1 bg-tactical-800 border border-tactical-700 rounded p-1.5 text-xs text-white outline-none focus:border-tactical-accent" />
                                    <select value={f.type} onChange={e => updateField(f.id, 'type', e.target.value)} className="w-28 bg-tactical-800 border border-tactical-700 rounded p-1.5 text-xs text-white outline-none focus:border-tactical-accent">
                                        <option value="input">Текст</option>
                                        <option value="textarea">Блок текста</option>
                                        <option value="number">Число</option>
                                    </select>
                                    <button type="button" onClick={() => removeField(f.id)} className="text-red-500 hover:text-red-400 font-bold px-2 py-1"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            ))}
                            {formData.fields.length === 0 && <p className="text-xs text-gray-500 italic">Нет кастомных полей. Добавьте их для заполнения при выполнении протокола.</p>}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-tactical-700 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded text-sm text-gray-300 hover:bg-tactical-700 transition-colors">Отмена</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded text-sm bg-tactical-accent text-tactical-900 font-bold hover:bg-emerald-400 transition-colors">Сохранить</button>
                </div>
            </div>
        </div>
    );
}
