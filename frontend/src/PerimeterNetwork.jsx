import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

export function NetworkTab({ state, saveState, showToast, setAssetModal }) {
  const circles = [
      { id: '1', t: 'Круг 1: Ближний', desc: 'Полное доверие и стратегическое партнерство. Люди, с которыми можно делиться планами и бюджетами.', c: 'border-blue-500' },
      { id: '2', t: 'Круг 2: Оперативный', desc: 'Рабочий актив. Регулярный контакт и строгая взаимовыгода. Основные поставщики лидов. Цели для Стратегии "Дающего".', c: 'border-tactical-accent' },
      { id: '3', t: 'Круг 3: Источники', desc: 'Эпизодические контакты. Поставщики ценной информации, слухов с рынка и связей. Не дают прямых заказов, но знают тех, кто дает.', c: 'border-orange-400' },
      { id: '4', t: 'Круг 4: Спящие', desc: 'Резерв. Прошлые клиенты или разовые контакты. Требуют редкого системного прогрева (поздравления, советы) для будущей активации.', c: 'border-gray-500' }
  ];

  const handleDragStart = (e, id) => {
      e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
      e.preventDefault();
  };

  const handleDrop = (e, circleId) => {
      e.preventDefault();
      const assetId = e.dataTransfer.getData('text/plain');
      if (assetId) {
          const network = [...state.network];
          const assetIndex = network.findIndex(a => a.id === assetId);
          if (assetIndex !== -1 && network[assetIndex].circle !== circleId) {
              network[assetIndex] = { ...network[assetIndex], circle: circleId };
              saveState({ network });
              showToast('Контакт перемещен');
          }
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-tactical-800 p-4 rounded-sm border border-tactical-700 gap-4">
            <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Инженерия социального капитала</h2>
                <p className="text-xs text-gray-400 mt-1">Красный цвет = Просроченный контакт. Действуй немедленно.</p>
            </div>
            <button onClick={() => setAssetModal({ isOpen: true, assetId: null })} className="px-4 py-2 bg-tactical-accent text-tactical-900 font-bold text-sm rounded shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors w-full sm:w-auto">
                + Новый Контакт
            </button>
        </div>

        <div className="space-y-6">
            {circles.map(circ => {
                const assets = state.network.filter(a => a.circle === circ.id);
                return (
                    <div key={circ.id} className={`border-l-4 ${circ.c} bg-tactical-800 p-4 rounded shadow-md mb-4 min-h-[120px]`}
                         onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, circ.id)}>
                        <h3 className="font-bold text-white uppercase mb-4 pointer-events-none">{circ.t}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pointer-events-none">
                            {assets.map(a => {
                                const overdue = a.nextDate && new Date(a.nextDate) <= new Date(state.currentDate);
                                return (
                                    <div key={a.id} draggable="true" onDragStart={(e) => handleDragStart(e, a.id)} onClick={() => setAssetModal({ isOpen: true, assetId: a.id })}
                                         className={`bg-tactical-900 border ${overdue ? 'border-red-500' : 'border-tactical-700'} p-3 rounded cursor-pointer hover:bg-tactical-700 transition-all pointer-events-auto`}>
                                        <div className="flex justify-between items-start pointer-events-none">
                                            <div>
                                                <span className={`text-sm font-bold ${overdue ? 'text-red-400' : 'text-white'}`}>{a.name}</span>
                                                <span className="text-[10px] text-orange-400 ml-1">«{a.callsign}»</span>
                                            </div>
                                            {overdue && <span className="animate-pulse pointer-events-none">⚠️</span>}
                                        </div>
                                        <p className="text-[10px] text-blue-400 uppercase mt-1 pointer-events-none">{a.role}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  )
}

export function AssetModal({ isOpen, onClose, assetId, state, saveState, showToast }) {
    const [formData, setFormData] = useState({});
    const [tempLinks, setTempLinks] = useState([]);

    useEffect(() => {
        if (isOpen) {
            if (assetId) {
                const asset = state.network.find(a => a.id === assetId) || {};
                setFormData(asset);
                setTempLinks(asset.links || []);
            } else {
                setFormData({ circle: '3', links: [] });
                setTempLinks([]);
            }
        }
    }, [isOpen, assetId, state.network]);

    if (!isOpen) return null;

    const handleSave = () => {
        const assetData = {
            id: assetId || 'n' + Date.now(),
            name: formData.name || '',
            callsign: formData.callsign || '',
            role: formData.role || '',
            circle: formData.circle || '3',
            contact: formData.contact || '',
            lastDate: formData.lastDate || '',
            nextDate: formData.nextDate || '',
            notes: formData.notes || '',
            m: formData.m || '',
            i: formData.i || '',
            c: formData.c || '',
            e: formData.e || '',
            value: formData.value || '',
            give: formData.give || '',
            links: tempLinks
        };

        let network = [...state.network];

        // Clean up old links if editing
        if (assetId) {
            const oldData = network.find(a => a.id === assetId);
            const oldLinks = oldData ? (oldData.links || []) : [];
            const removedLinks = oldLinks.filter(oldId => !tempLinks.includes(oldId));

            network = network.map(a => {
                if (removedLinks.includes(a.id) && a.links) {
                    return { ...a, links: a.links.filter(l => l !== assetId) };
                }
                if (tempLinks.includes(a.id)) {
                    const currentLinks = a.links || [];
                    if (!currentLinks.includes(assetId)) {
                        return { ...a, links: [...currentLinks, assetId] };
                    }
                }
                return a;
            });

            const idx = network.findIndex(x => x.id === assetId);
            if (idx > -1) network[idx] = assetData;
        } else {
            network.push(assetData);
            // Add reciprocal links
            network = network.map(a => {
                if (tempLinks.includes(a.id)) {
                    const currentLinks = a.links || [];
                    if (!currentLinks.includes(assetData.id)) {
                        return { ...a, links: [...currentLinks, assetData.id] };
                    }
                }
                return a;
            });
        }

        saveState({ network });
        showToast("Досье сохранено");
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm("Удалить этот контакт навсегда?")) {
            let network = state.network.filter(a => a.id !== assetId);
            network = network.map(a => {
                if (a.links && a.links.includes(assetId)) {
                    return { ...a, links: a.links.filter(l => l !== assetId) };
                }
                return a;
            });
            saveState({ network });
            showToast("Досье удалено");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-tactical-800 border border-tactical-700 rounded-sm w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 md:p-6 border-b border-tactical-700 flex justify-between items-start bg-tactical-800 z-10 sticky top-0">
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">Досье</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                </div>
                <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">Имя</label><input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-tactical-900 border border-tactical-700 rounded p-3 text-sm text-white outline-none focus:border-tactical-accent"/></div>
                        <div className="flex flex-col gap-1"><label className="text-xs font-bold text-orange-400 uppercase">Позывной</label><input type="text" value={formData.callsign || ''} onChange={e => setFormData({...formData, callsign: e.target.value})} className="bg-tactical-900 border border-orange-500/50 rounded p-3 text-sm text-white outline-none focus:border-orange-500"/></div>
                        <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">Роль</label><input type="text" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} className="bg-tactical-900 border border-tactical-700 rounded p-3 text-sm text-white outline-none focus:border-tactical-accent"/></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">Связь</label><input type="text" value={formData.contact || ''} onChange={e => setFormData({...formData, contact: e.target.value})} className="bg-tactical-900 border border-tactical-700 rounded p-3 text-sm text-white outline-none focus:border-tactical-accent"/></div>
                        <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">Круг доступа</label>
                            <select value={formData.circle || '3'} onChange={e => setFormData({...formData, circle: e.target.value})} className="bg-tactical-900 border border-tactical-700 rounded p-3 text-sm text-white outline-none focus:border-tactical-accent">
                                <option value="1">Круг 1: Ближний (Доверие, партнеры)</option>
                                <option value="2">Круг 2: Оперативный (Взаимная выгода, лиды)</option>
                                <option value="3">Круг 3: Источники (Информация, нетворк)</option>
                                <option value="4">Круг 4: Спящие (Прошлые клиенты, резерв)</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">Последний контакт</label><input type="date" value={formData.lastDate || ''} onChange={e => setFormData({...formData, lastDate: e.target.value})} className="bg-tactical-900 border border-tactical-700 rounded p-3 text-sm text-white outline-none focus:border-tactical-accent"/></div>
                        <div className="flex flex-col gap-1"><label className="text-xs font-bold text-blue-400 uppercase">Следующий шаг</label><input type="date" value={formData.nextDate || ''} onChange={e => setFormData({...formData, nextDate: e.target.value})} className="bg-tactical-900 border border-blue-500/50 rounded p-3 text-sm text-white outline-none focus:border-blue-500"/></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Связанные контакты</label>
                            <div className="flex flex-wrap gap-1 min-h-[38px] p-2 bg-tactical-900 border border-tactical-700 rounded items-center overflow-y-auto max-h-20">
                                {tempLinks.map(linkId => {
                                    const linkedAsset = state.network.find(x => x.id === linkId);
                                    return linkedAsset ? (
                                        <div key={linkId} className="bg-tactical-800 px-2 py-1 rounded text-[10px] flex items-center gap-1">
                                            <span>{linkedAsset.name}</span>
                                            <b onClick={() => setTempLinks(tempLinks.filter(id => id !== linkId))} className="cursor-pointer text-red-500 hover:text-red-400">×</b>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                            <div className="flex gap-2">
                                <select id="linkSelect" className="flex-1 bg-tactical-900 border border-tactical-700 rounded p-2 text-xs text-white outline-none focus:border-tactical-accent">
                                    <option value="">Связать с...</option>
                                    {state.network.filter(x => x.id !== assetId && !tempLinks.includes(x.id)).map(x => (
                                        <option key={x.id} value={x.id}>{x.name}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => {
                                    const sel = document.getElementById('linkSelect');
                                    if (sel.value) { setTempLinks([...tempLinks, sel.value]); sel.value = ''; }
                                }} className="px-3 py-2 bg-tactical-800 text-tactical-accent hover:bg-tactical-700 transition-colors font-bold rounded text-xs">Добавить</button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">Примечание</label><textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-tactical-900 border border-tactical-700 rounded p-3 text-sm text-white h-24 custom-scrollbar outline-none focus:border-tactical-accent"></textarea></div>
                    </div>
                    <div className="bg-tactical-900 border border-tactical-700 p-4 rounded-sm">
                        <h4 className="text-xs font-bold text-tactical-accent uppercase tracking-wide mb-3 border-b border-tactical-700 pb-2">Матрица Мотивации (M.I.C.E.)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="text" value={formData.m || ''} onChange={e => setFormData({...formData, m: e.target.value})} className="bg-tactical-800 border border-tactical-700 rounded p-2 text-sm text-white outline-none focus:border-tactical-accent" placeholder="Money" />
                            <input type="text" value={formData.i || ''} onChange={e => setFormData({...formData, i: e.target.value})} className="bg-tactical-800 border border-tactical-700 rounded p-2 text-sm text-white outline-none focus:border-tactical-accent" placeholder="Ideology" />
                            <input type="text" value={formData.c || ''} onChange={e => setFormData({...formData, c: e.target.value})} className="bg-tactical-800 border border-tactical-700 rounded p-2 text-sm text-white outline-none focus:border-tactical-accent" placeholder="Coercion" />
                            <input type="text" value={formData.e || ''} onChange={e => setFormData({...formData, e: e.target.value})} className="bg-tactical-800 border border-tactical-700 rounded p-2 text-sm text-white outline-none focus:border-tactical-accent" placeholder="Ego" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-400 uppercase">Асимметричная ценность</label><textarea rows="2" value={formData.value || ''} onChange={e => setFormData({...formData, value: e.target.value})} className="bg-tactical-900 border border-tactical-700 rounded p-3 text-sm text-white outline-none focus:border-tactical-accent"></textarea></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-blue-400 uppercase">Стратегия "Дающего"</label><textarea rows="2" value={formData.give || ''} onChange={e => setFormData({...formData, give: e.target.value})} className="bg-tactical-900 border border-tactical-700 rounded p-3 text-sm text-white outline-none focus:border-blue-500"></textarea></div>
                </div>
                <div className="p-4 md:p-6 border-t border-tactical-700 flex justify-between items-center bg-tactical-900 flex-shrink-0">
                    {assetId ? <button onClick={handleDelete} className="text-red-500 hover:text-red-400 text-sm">Удалить досье</button> : <div></div>}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded text-sm text-gray-300 hover:bg-tactical-700 transition-colors">Отмена</button>
                        <button onClick={handleSave} className="px-6 py-2 rounded text-sm bg-blue-500 text-white font-bold hover:bg-blue-400 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">Сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
