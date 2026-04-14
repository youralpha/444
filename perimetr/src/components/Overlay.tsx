import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export default function Overlay() {
  const [bullets, setBullets] = useState('');

  const fetchBullets = async () => {
    try {
        const state: any = await invoke('get_general_state');
        setBullets(state.bullets);
    } catch(e) {
        console.error(e);
    }
  };

  useEffect(() => {
    fetchBullets();

    let unlisten: () => void;

    listen('bullets_updated', (event: any) => {
      setBullets(event.payload);
    }).then(u => {
        unlisten = u;
    });

    return () => {
      if(unlisten) unlisten();
    };
  }, []);

  const items = bullets.split('\n').filter(b => b.trim() !== '');

  return (
    <div className="w-full h-full bg-tactical-900/95 border-t border-green-500/50 backdrop-blur-md flex items-center justify-center px-4 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] cursor-default select-none">
      <div className="flex gap-8 overflow-hidden w-full items-center justify-center">
         {items.length === 0 && (
            <span className="text-xs font-mono text-tactical-text/50 uppercase tracking-widest">Три Пули (Фокус дня) не заданы</span>
         )}
         {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 max-w-[250px]">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
               <span className="text-sm font-bold text-white truncate drop-shadow-md">{item}</span>
            </div>
         ))}
      </div>
    </div>
  );
}
