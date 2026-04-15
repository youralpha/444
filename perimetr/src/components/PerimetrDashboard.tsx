import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { getCycles, ProtocolTask } from '../lib/perimetrTasks';
import { X, CheckSquare, Settings2, Trash2, CalendarDays } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function PerimetrDashboard() {
  const [state, setState] = useState({ score: 0, mission: '', bullets: '', phase0: '', phase1: '', overlay_position: 'bottom' });
  const [contacts, setContacts] = useState<any[]>([]);
  const [customTasks, setCustomTasks] = useState<any[]>([]);
  const [deletedTasks, setDeletedTasks] = useState<string[]>([]);
  const [calendarDates, setCalendarDates] = useState<string[]>([]);

  const [selectedTask, setSelectedTask] = useState<ProtocolTask | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  // Custom Task Creation State
  const [creatingTaskCycle, setCreatingTaskCycle] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', time: '', desc: '' });

  const fetchGeneral = async () => {
    const res: any = await invoke('get_general_state');
    setState(res);
  };
  const fetchContacts = async () => {
    const res: any = await invoke('get_contacts');
    setContacts(res);
  };
  const fetchCustomTasks = async () => {
    const res: any = await invoke('get_custom_tasks');
    setCustomTasks(res);
    const delRes: string[] = await invoke('get_deleted_tasks');
    setDeletedTasks(delRes);
  };

  const fetchCalendar = async () => {
    const cd: string[] = await invoke('get_kpt_calendar');
    setCalendarDates(cd);
  };

  useEffect(() => {
    fetchGeneral();
    fetchContacts();
    fetchCustomTasks();
    fetchCalendar();
  }, []);

  const handleStateChange = async (key: string, val: any) => {
    const ns = { ...state, [key]: val };
    setState(ns);
    await invoke('save_general_state', { gs: ns });
  };

  const createContact = async () => {
    const newContact = {
      id: `n${Date.now()}`, name: '', callsign: '', role: '', circle: '3', contact: '',
      last_date: '', next_date: '', notes: '', m: '', i: '', c: '', e: '', value: '', give: '', links: ''
    };
    await invoke('save_contact', { contact: newContact });
    fetchContacts();
  };

  const submitNewTask = async () => {
    if (!creatingTaskCycle) return;
    const taskObj = {
      id: `c${Date.now()}`,
      cycle: creatingTaskCycle,
      title: newTask.title || 'Новая задача',
      time: newTask.time || '-',
      desc: newTask.desc || '',
      fields_json: '[]'
    };
    await invoke('save_custom_task', { task: taskObj });
    setCreatingTaskCycle(null);
    setNewTask({ title: '', time: '', desc: '' });
    fetchCustomTasks();
  };

  const cycles = getCycles(customTasks, deletedTasks);

  const today = new Date();
  const calDays = Array.from({ length: 35 }).map((_, i) => {
    const d = subDays(today, 34 - i);
    return format(d, 'yyyy-MM-dd');
  });

  return (
    <div className="flex flex-col h-full fade-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-mono text-tactical-text uppercase tracking-widest font-bold">Оперативный Дашборд</h1>
          <p className="text-tactical-text/50 text-xs mt-1 uppercase">Объект: Оператор</p>
        </div>
        <div className="cyber-border py-2 px-4 flex items-center gap-4">
          <span className="font-mono text-tactical-text/60 text-sm">АГЕНТ 4444:</span>
          <span className="font-mono text-xl font-bold text-tactical-accent">{state.score}</span>
          <div className="flex flex-col border-l border-tactical-700 pl-3 ml-2">
            <button onClick={() => handleStateChange('score', state.score + 10)} className="text-[10px] text-tactical-accent hover:text-white uppercase font-bold leading-none mb-1 outline-none">▲ WIN</button>
            <button onClick={() => handleStateChange('score', state.score - 10)} className="text-[10px] text-tactical-alert hover:text-white uppercase font-bold leading-none outline-none">▼ FAIL</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="cyber-border flex flex-col gap-2 col-span-1">
          <label className="text-xs font-bold text-tactical-accent uppercase">Генеральная Цель (Миссия)</label>
          <textarea className="w-full bg-tactical-900 border border-tactical-700 rounded p-3 text-sm focus:border-tactical-accent outline-none custom-scrollbar resize-none h-full"
            value={state.mission} onChange={e => handleStateChange('mission', e.target.value)} placeholder="КТО:\nЧТО:\nКОГДА:\nЗАЧЕМ:" />
        </div>
        <div className="cyber-border flex flex-col gap-2 col-span-1 relative">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-orange-400 uppercase">Три Пули (Фокус дня)</label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-tactical-text/50 uppercase font-bold">Оверлей:</span>
              <select value={state.overlay_position} onChange={e => handleStateChange('overlay_position', e.target.value)} className="bg-tactical-900 border border-tactical-700 text-xs text-white rounded outline-none px-1">
                 <option value="bottom">Снизу</option>
                 <option value="top">Сверху</option>
              </select>
            </div>
          </div>
          <textarea className="w-full bg-tactical-900 border border-orange-500/30 rounded p-3 text-sm focus:border-orange-500 outline-none custom-scrollbar resize-none h-full mt-1"
            value={state.bullets} onChange={e => handleStateChange('bullets', e.target.value)} placeholder="1.\n2.\n3." />
        </div>

        <div className="cyber-border flex flex-col gap-2 col-span-1 border-emerald-500/50">
          <div className="flex justify-between items-center">
             <label className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-2"><CalendarDays size={14}/> Оперативный Календарь</label>
             <span className="text-[10px] text-tactical-text/50 uppercase">{format(today, 'LLLL yyyy', { locale: ru })}</span>
          </div>
          <div className="calendar-grid mt-2">
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

      <Tabs.Root defaultValue="tasks" className="flex-1 flex flex-col min-h-0">
        <Tabs.List className="flex border-b border-tactical-700 mb-6 gap-6">
          {['tasks', 'network', 'plan'].map(t => (
            <Tabs.Trigger key={t} value={t} className="text-tactical-text/50 font-bold uppercase text-sm pb-2 border-b-2 border-transparent data-[state=active]:text-tactical-accent data-[state=active]:border-tactical-accent transition-colors outline-none cursor-pointer">
              {t === 'tasks' ? 'Боевой Ритм' : t === 'network' ? 'Агентурная Сеть' : 'План Операции'}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="tasks" className="flex-1 overflow-y-auto custom-scrollbar outline-none">
          <div className="grid grid-cols-2 gap-6 pb-12">
            {cycles.map((cycle: any) => (
              <div key={cycle.id} className="cyber-border flex flex-col min-h-full">
                <h2 className={`${cycle.color} text-sm font-bold uppercase border-b border-tactical-700 pb-3 mb-4`}>{cycle.title}</h2>
                <div className="flex-1 flex flex-col gap-2">
                  {cycle.tasks.map((task: any) => (
                    <TaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} onToggle={fetchCalendar} />
                  ))}
                </div>
                <button onClick={() => setCreatingTaskCycle(cycle.id)} className="w-full mt-4 py-2 border border-dashed border-tactical-700 text-tactical-text/50 hover:text-tactical-accent hover:border-tactical-accent rounded-sm text-xs font-bold uppercase transition-colors outline-none">
                  + Добавить кастомную задачу
                </button>
              </div>
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="network" className="flex-1 overflow-y-auto custom-scrollbar pb-12 outline-none">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold uppercase tracking-wider text-tactical-text">Инженерия Социального Капитала</h2>
            <button onClick={createContact} className="bg-tactical-accent text-tactical-900 px-4 py-2 font-bold text-xs rounded hover:bg-emerald-400 transition-colors uppercase outline-none">+ Новый Агент</button>
          </div>
          {['1', '2', '3', '4'].map(circleId => {
            const cirContacts = contacts.filter(c => c.circle === circleId);
            return (
              <div key={circleId} className="mb-6 p-6 bg-tactical-800/50 border border-tactical-700 rounded-sm">
                <h3 className="text-xs font-bold text-tactical-accent uppercase mb-4">Круг {circleId}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {cirContacts.map(contact => (
                    <div key={contact.id} className="p-4 bg-tactical-800 border border-tactical-700 rounded flex flex-col hover:bg-tactical-700 cursor-pointer transition-colors group outline-none" onClick={() => setSelectedAsset(contact)}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-white group-hover:text-tactical-accent">{contact.name || 'Без Имени'}</span>
                        <span className="text-[10px] text-orange-400">«{contact.callsign}»</span>
                      </div>
                      <p className="text-[10px] text-blue-400 uppercase mb-4 border-b border-tactical-700 pb-2">{contact.role}</p>

                      <div className="flex gap-1 mt-auto pt-2">
                        {['1', '2', '3', '4'].filter(c => c !== contact.circle).map(c => (
                          <button key={c} onClick={async (e) => {
                            e.stopPropagation();
                            await invoke('save_contact', { contact: { ...contact, circle: c } });
                            fetchContacts();
                          }} className="text-[10px] text-tactical-text/40 border border-tactical-700 px-2 py-1 hover:bg-tactical-accent hover:text-tactical-900 rounded-sm transition-colors outline-none">
                            → {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Tabs.Content>

        <Tabs.Content value="plan" className="flex-1 overflow-y-auto custom-scrollbar pb-12 outline-none">
           <div className="grid gap-6">
              <div className="cyber-border flex flex-col gap-3">
                <h3 className="text-sm font-bold text-tactical-accent uppercase">Фаза 0: Рекогносцировка себя (H2F)</h3>
                <textarea rows={8} value={state.phase0} onChange={e => handleStateChange('phase0', e.target.value)} className="w-full bg-tactical-900 border border-tactical-700 rounded p-4 text-sm focus:border-tactical-accent outline-none custom-scrollbar" />
              </div>
              <div className="cyber-border flex flex-col gap-3">
                <h3 className="text-sm font-bold text-tactical-accent uppercase">Фаза 1: Разведка поля операции (IPB)</h3>
                <textarea rows={8} value={state.phase1} onChange={e => handleStateChange('phase1', e.target.value)} className="w-full bg-tactical-900 border border-tactical-700 rounded p-4 text-sm focus:border-tactical-accent outline-none custom-scrollbar" />
              </div>
           </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Task Modal */}
      <Dialog.Root open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-3rem)] max-w-2xl bg-tactical-800 border border-tactical-700 rounded-sm shadow-2xl z-50 flex flex-col max-h-[calc(100vh-3rem)] fade-in outline-none p-0 overflow-hidden">
            {selectedTask && <TaskModalInner task={selectedTask} onToggle={fetchCalendar} state={state} handleStateChange={handleStateChange} onClose={() => { setSelectedTask(null); fetchCustomTasks(); }} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Create Custom Task Modal */}
      <Dialog.Root open={!!creatingTaskCycle} onOpenChange={(open) => !open && setCreatingTaskCycle(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-3rem)] max-w-md bg-tactical-800 border border-tactical-700 rounded-sm shadow-2xl z-50 flex flex-col fade-in p-6 outline-none">
            <h2 className="text-lg font-bold text-white uppercase mb-4 border-b border-tactical-700 pb-2">Новая Задача</h2>
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="text-xs text-tactical-text/50 uppercase font-bold block mb-1">Название</label>
                <input value={newTask.title} onChange={e=>setNewTask({...newTask, title: e.target.value})} className="w-full bg-tactical-900 border border-tactical-700 p-2 text-sm rounded outline-none" />
              </div>
              <div>
                <label className="text-xs text-tactical-text/50 uppercase font-bold block mb-1">Норматив времени</label>
                <input value={newTask.time} onChange={e=>setNewTask({...newTask, time: e.target.value})} className="w-full bg-tactical-900 border border-tactical-700 p-2 text-sm rounded outline-none" />
              </div>
              <div>
                <label className="text-xs text-tactical-text/50 uppercase font-bold block mb-1">Описание</label>
                <textarea rows={3} value={newTask.desc} onChange={e=>setNewTask({...newTask, desc: e.target.value})} className="w-full bg-tactical-900 border border-tactical-700 p-2 text-sm rounded outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
               <button onClick={() => setCreatingTaskCycle(null)} className="text-tactical-text/50 text-sm font-bold uppercase hover:text-white transition-colors outline-none">Отмена</button>
               <button onClick={submitNewTask} className="bg-tactical-accent text-tactical-900 px-4 py-2 font-bold text-sm rounded hover:bg-emerald-400 transition-colors uppercase outline-none">Создать</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Asset Modal */}
      <Dialog.Root open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-3rem)] max-w-4xl bg-tactical-800 border border-tactical-700 rounded-sm shadow-2xl z-[60] flex flex-col max-h-[calc(100vh-3rem)] fade-in p-0 overflow-hidden outline-none">
            {selectedAsset && <AssetModalInner contact={selectedAsset} contacts={contacts} refresh={fetchContacts} onClose={() => setSelectedAsset(null)} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}

// Internal Components

function TaskItem({ task, onClick, onToggle }: { task: ProtocolTask, onClick: () => void, onToggle: () => void }) {
  const [done, setDone] = useState(false);
  const dateKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    invoke('get_task_history', { taskId: task.id, date: dateKey }).then((res: any) => setDone(res.completed));
  }, [task.id]);

  const toggle = async (e: any) => {
    e.stopPropagation();
    const d = !done;
    setDone(d);
    const res: any = await invoke('get_task_history', { taskId: task.id, date: dateKey });
    await invoke('save_task_history', { taskId: task.id, date: dateKey, completed: d, fieldData: res.field_data });
    // Record calendar activity if done
    if (d) {
       await invoke('save_kpt_task', { taskId: `cal_${task.id}`, completed: true, date: dateKey });
       onToggle();
    }
  };

  return (
    <div onClick={onClick} className="flex items-center justify-between p-3 hover:bg-tactical-900 rounded cursor-pointer border border-transparent hover:border-tactical-700 transition-all group">
      <div className="flex items-center gap-3">
        <button onClick={toggle} className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors outline-none ${done ? 'bg-tactical-accent border-tactical-accent' : 'border-tactical-accent bg-transparent hover:bg-tactical-accent/20'}`}>
          {done && <CheckSquare size={14} className="text-tactical-900" />}
        </button>
        <span className={`text-sm ${done ? 'line-through text-tactical-text/40' : 'text-tactical-text group-hover:text-tactical-accent'}`}>{task.text}</span>
      </div>
      <span className="text-[10px] font-mono text-tactical-text/40">{task.time}</span>
    </div>
  );
}

function TaskModalInner({ task, onClose, onToggle, state, handleStateChange }: { task: ProtocolTask, onClose: () => void, onToggle: () => void, state: any, handleStateChange: any }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [editData, setEditData] = useState({ title: task.text, time: task.time, desc: task.description, fields: task.fields || [] });

  const dateKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    invoke('get_task_history', { taskId: task.id, date: dateKey }).then((res: any) => {
      setDone(res.completed);
      try { setAnswers(JSON.parse(res.field_data || '{}')); } catch {}
    });
  }, [task.id]);

  const updateField = async (id: string, val: string) => {
    const na = { ...answers, [id]: val };
    setAnswers(na);
    await invoke('save_task_history', { taskId: task.id, date: dateKey, completed: done, fieldData: JSON.stringify(na) });

    // For 'sas_bullets', automatically update main bullets state
    if (id === 'sas_bullets') {
        handleStateChange('bullets', val);
    }
  };

  const toggleDone = async () => {
    const d = !done;
    setDone(d);
    await invoke('save_task_history', { taskId: task.id, date: dateKey, completed: d, fieldData: JSON.stringify(answers) });
    if (d) {
       await invoke('save_kpt_task', { taskId: `cal_${task.id}`, completed: true, date: dateKey });
       onToggle();
    }
  };

  const saveEdit = async () => {
    const customTask = {
      id: task.id, cycle: task.cycle, title: editData.title, time: editData.time, desc: editData.desc,
      fields_json: JSON.stringify(editData.fields)
    };
    await invoke('save_custom_task', { task: customTask });
    setEditMode(false);
    onClose();
  };

  const removeTask = async () => {
    await invoke('delete_custom_task', { id: task.id });
    onClose();
  };

  if (editMode) {
    return (
      <>
        <div className="flex justify-between items-start p-6 border-b border-tactical-700 bg-tactical-800">
          <div className="flex flex-col gap-2 w-full max-w-md">
            <input value={editData.title} onChange={e=>setEditData({...editData, title: e.target.value})} className="bg-transparent border-b border-tactical-700 text-xl font-bold text-white outline-none focus:border-tactical-accent pb-1" />
            <input value={editData.time} onChange={e=>setEditData({...editData, time: e.target.value})} className="bg-transparent border-b border-tactical-700 text-xs font-mono text-tactical-accent outline-none focus:border-tactical-accent pb-1" />
          </div>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-tactical-900 flex flex-col gap-6">
          <textarea rows={3} value={editData.desc} onChange={e=>setEditData({...editData, desc: e.target.value})} className="w-full bg-tactical-800 border border-tactical-700 rounded p-3 text-sm focus:border-tactical-accent outline-none custom-scrollbar" />

          <div className="flex flex-col gap-3">
             <h3 className="text-xs font-bold text-tactical-text/50 uppercase border-b border-tactical-700 pb-1">Поля ввода</h3>
             {editData.fields.map((f: any, i: number) => (
               <div key={i} className="flex gap-2 items-center">
                 <input value={f.label} onChange={e => { const nf = [...editData.fields]; nf[i].label = e.target.value; setEditData({...editData, fields: nf}) }} className="flex-1 bg-tactical-800 border border-tactical-700 p-2 text-xs rounded outline-none" placeholder="Название поля" />
                 <select value={f.type_} onChange={e => { const nf = [...editData.fields]; nf[i].type_ = e.target.value; setEditData({...editData, fields: nf}) }} className="bg-tactical-800 border border-tactical-700 p-2 text-xs rounded outline-none">
                   <option value="textarea">Textarea</option>
                   <option value="input">Input Text</option>
                   <option value="number">Number</option>
                 </select>
                 <button onClick={() => { const nf = [...editData.fields]; nf.splice(i, 1); setEditData({...editData, fields: nf}) }} className="text-red-500 hover:text-red-400 p-2 outline-none"><Trash2 size={16}/></button>
               </div>
             ))}
             <button onClick={() => {
                const newField = { id: `f${Date.now()}`, label: 'Новое поле', type_: 'textarea', placeholder: '' };
                setEditData({...editData, fields: [...editData.fields, newField]});
             }} className="text-xs text-tactical-accent hover:underline self-start mt-2 outline-none">+ Добавить поле</button>
          </div>
        </div>
        <div className="p-6 border-t border-tactical-700 bg-tactical-800 flex justify-between items-center">
          <button onClick={() => setEditMode(false)} className="text-tactical-text/50 hover:text-white uppercase font-bold text-sm outline-none">Отмена</button>
          <button onClick={saveEdit} className="px-6 py-2 bg-tactical-accent text-tactical-900 font-bold text-sm uppercase rounded hover:bg-emerald-400 transition-colors outline-none">Сохранить</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-start p-6 border-b border-tactical-700 bg-tactical-800">
        <div>
          <h2 className="text-xl font-bold uppercase text-tactical-text">{task.text}</h2>
          <p className="text-xs text-tactical-accent font-mono mt-2">Норматив: {task.time}</p>
        </div>
        <div className="flex items-center gap-4">
          {task.is_custom && (
             <div className="flex gap-3">
               <button onClick={()=>setEditMode(true)} className="text-xs font-bold text-tactical-text/50 hover:text-white uppercase flex items-center gap-1 outline-none"><Settings2 size={16}/> Редакт</button>
               <button onClick={removeTask} className="text-xs font-bold text-red-500 hover:text-red-400 uppercase flex items-center gap-1 outline-none"><Trash2 size={16}/> Удал</button>
             </div>
          )}
          <button onClick={onClose} className="text-tactical-text/50 hover:text-white ml-2 outline-none"><X size={20} /></button>
        </div>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-tactical-900">
        <div className="p-4 bg-tactical-800 border-l-4 border-tactical-accent text-sm text-tactical-text/80 mb-6 rounded-r">
          {task.description}
        </div>
        <div className="flex flex-col gap-5">
          {task.fields.map((f: any) => {
            // Check if this field should be overridden by general state
            let val = answers[f.id] || '';
            if (f.id === 'sas_bullets') val = state.bullets;

            return (
              <div key={f.id} className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-tactical-text/50">{f.label}</label>
                {f.type_ === 'textarea' ? (
                  <textarea rows={3} value={val} onChange={e => updateField(f.id, e.target.value)} placeholder={f.placeholder || ''} className="w-full bg-tactical-800 border border-tactical-700 rounded p-3 text-sm focus:border-tactical-accent outline-none custom-scrollbar" />
                ) : (
                  <input type={f.type_} value={val} onChange={e => updateField(f.id, e.target.value)} placeholder={f.placeholder || ''} className="w-full bg-tactical-800 border border-tactical-700 rounded p-3 text-sm focus:border-tactical-accent outline-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="p-6 border-t border-tactical-700 bg-tactical-800 flex justify-between items-center">
        <button onClick={toggleDone} className="flex items-center gap-3 group outline-none">
          <div className={`w-6 h-6 border-2 rounded-sm flex items-center justify-center transition-colors ${done ? 'bg-tactical-accent border-tactical-accent' : 'border-tactical-accent bg-transparent group-hover:bg-tactical-accent/20'}`}>
            {done && <CheckSquare size={16} className="text-tactical-900" />}
          </div>
          <span className="font-bold text-sm uppercase">{done ? 'Выполнено' : 'Отметить как Выполнено'}</span>
        </button>
        <button onClick={onClose} className="px-6 py-2 bg-tactical-accent text-tactical-900 font-bold text-sm uppercase rounded hover:bg-emerald-400 transition-colors outline-none">Закрыть</button>
      </div>
    </>
  );
}

function AssetModalInner({ contact, contacts, refresh, onClose }: { contact: any, contacts: any[], refresh: () => void, onClose: () => void }) {
  const [data, setData] = useState(contact);
  const [links, setLinks] = useState<string[]>(contact.links ? contact.links.split(',').filter(Boolean) : []);
  const [newLink, setNewLink] = useState('');

  const update = (key: string, val: string) => setData({ ...data, [key]: val });

  const save = async () => {
    await invoke('save_contact', { contact: { ...data, links: links.join(',') } });
    refresh();
    onClose();
  };

  const remove = async () => {
    await invoke('delete_contact', { id: contact.id });
    refresh();
    onClose();
  };

  const unlinkedContacts = contacts.filter(c => c.id !== contact.id && !links.includes(c.id));

  return (
    <>
      <div className="flex justify-between items-start p-6 border-b border-tactical-700 bg-tactical-800">
        <h2 className="text-xl font-bold uppercase tracking-wider text-white">Досье Агента</h2>
        <button onClick={onClose} className="text-tactical-text/50 hover:text-white outline-none"><X size={20} /></button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-tactical-900 grid grid-cols-2 gap-8">

        {/* Left Col: Basics */}
        <div className="flex flex-col gap-5">
           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-tactical-text/50 uppercase">Имя</label><input value={data.name} onChange={e=>update('name',e.target.value)} className="bg-tactical-800 border border-tactical-700 p-2 text-sm rounded outline-none focus:border-tactical-accent" /></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-orange-400 uppercase">Позывной</label><input value={data.callsign} onChange={e=>update('callsign',e.target.value)} className="bg-tactical-800 border border-orange-500/50 p-2 text-sm rounded outline-none focus:border-orange-500" /></div>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-tactical-text/50 uppercase">Роль</label><input value={data.role} onChange={e=>update('role',e.target.value)} className="bg-tactical-800 border border-tactical-700 p-2 text-sm rounded outline-none focus:border-tactical-accent" /></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-tactical-text/50 uppercase">Круг Доступа</label>
               <select value={data.circle} onChange={e=>update('circle', e.target.value)} className="bg-tactical-800 border border-tactical-700 p-2 text-sm rounded outline-none">
                 <option value="1">1: Ближний</option><option value="2">2: Оперативный</option><option value="3">3: Источники</option><option value="4">4: Спящие</option>
               </select>
             </div>
           </div>
           <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-tactical-text/50 uppercase">Связь (TG/Phone)</label><input value={data.contact} onChange={e=>update('contact',e.target.value)} className="bg-tactical-800 border border-tactical-700 p-2 text-sm rounded outline-none focus:border-tactical-accent" /></div>
           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-tactical-text/50 uppercase">Последний контакт</label><input type="date" value={data.last_date} onChange={e=>update('last_date',e.target.value)} className="bg-tactical-800 border border-tactical-700 p-2 text-sm rounded outline-none [color-scheme:dark]" /></div>
             <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-blue-400 uppercase">Следующий шаг</label><input type="date" value={data.next_date} onChange={e=>update('next_date',e.target.value)} className="bg-tactical-800 border border-blue-500/50 p-2 text-sm rounded outline-none [color-scheme:dark]" /></div>
           </div>
           <div className="flex flex-col gap-1 flex-1"><label className="text-[10px] font-bold text-tactical-text/50 uppercase">Заметки</label><textarea value={data.notes} onChange={e=>update('notes',e.target.value)} className="bg-tactical-800 border border-tactical-700 p-2 text-sm rounded outline-none flex-1 resize-none custom-scrollbar" /></div>
        </div>

        {/* Right Col: MICE & Strategy */}
        <div className="flex flex-col gap-5">
           <div className="border border-tactical-700 rounded bg-tactical-800 p-4">
             <h3 className="text-xs font-bold text-tactical-accent uppercase mb-3 border-b border-tactical-700 pb-2">Матрица Мотивации (M.I.C.E.)</h3>
             <div className="grid grid-cols-2 gap-3">
               <input placeholder="Money" value={data.m} onChange={e=>update('m',e.target.value)} className="bg-tactical-900 border border-tactical-700 p-2 text-xs rounded outline-none" />
               <input placeholder="Ideology" value={data.i} onChange={e=>update('i',e.target.value)} className="bg-tactical-900 border border-tactical-700 p-2 text-xs rounded outline-none" />
               <input placeholder="Coercion" value={data.c} onChange={e=>update('c',e.target.value)} className="bg-tactical-900 border border-tactical-700 p-2 text-xs rounded outline-none" />
               <input placeholder="Ego" value={data.e} onChange={e=>update('e',e.target.value)} className="bg-tactical-900 border border-tactical-700 p-2 text-xs rounded outline-none" />
             </div>
           </div>

           <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-tactical-text/50 uppercase">Асимметричная Ценность</label><textarea rows={2} value={data.value} onChange={e=>update('value',e.target.value)} className="bg-tactical-800 border border-tactical-700 p-2 text-sm rounded outline-none resize-none" /></div>
           <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-blue-400 uppercase">Стратегия "Дающего"</label><textarea rows={2} value={data.give} onChange={e=>update('give',e.target.value)} className="bg-tactical-800 border border-tactical-700 p-2 text-sm rounded outline-none resize-none" /></div>

           <div className="flex flex-col gap-1 mt-auto">
              <label className="text-[10px] font-bold text-tactical-text/50 uppercase">Связи</label>
              <div className="min-h-12 border border-tactical-700 bg-tactical-800 rounded p-2 flex flex-wrap gap-2 mb-2 items-center">
                {links.map(lid => {
                  const c = contacts.find(x=>x.id===lid);
                  if(!c) return null;
                  return <span key={lid} className="bg-tactical-900 border border-tactical-700 text-xs px-2 py-1 rounded flex items-center gap-2">{c.name} <Trash2 size={12} className="text-red-500 cursor-pointer hover:text-red-400" onClick={()=>setLinks(links.filter(x=>x!==lid))} /></span>
                })}
              </div>
              <div className="flex gap-2">
                <select value={newLink} onChange={e=>setNewLink(e.target.value)} className="flex-1 bg-tactical-800 border border-tactical-700 p-2 text-xs rounded outline-none">
                  <option value="">Связать с...</option>
                  {unlinkedContacts.map(c => <option key={c.id} value={c.id}>{c.name || 'Без Имени'} ({c.role})</option>)}
                </select>
                <button onClick={()=>{ if(newLink) { setLinks([...links, newLink]); setNewLink(''); } }} className="bg-tactical-700 hover:bg-tactical-600 px-3 rounded text-xs font-bold transition-colors outline-none">Добавить</button>
              </div>
           </div>
        </div>

      </div>
      <div className="p-6 border-t border-tactical-700 bg-tactical-800 flex justify-between items-center">
        <button onClick={remove} className="text-red-500 hover:underline text-xs uppercase font-bold tracking-wider outline-none">Удалить Досье</button>
        <div className="flex gap-3">
          <button onClick={onClose} className="px-6 py-2 text-tactical-text/50 hover:text-white font-bold text-sm uppercase rounded transition-colors outline-none">Отмена</button>
          <button onClick={save} className="px-6 py-2 bg-tactical-accent text-tactical-900 font-bold text-sm uppercase rounded hover:bg-emerald-400 transition-colors outline-none">Сохранить</button>
        </div>
      </div>
    </>
  );
}
