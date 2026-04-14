import { useState, useEffect } from 'react';
import PerimetrDashboard from './components/PerimetrDashboard';
import KptTracker from './components/KptTracker';
import BaseTimer from './components/BaseTimer';
import Overlay from './components/Overlay';

function App() {
  const [activeTab, setActiveTab] = useState('perimetr');
  const [isOverlay, setIsOverlay] = useState(false);

  useEffect(() => {
    if (window.location.search.includes('overlay=true')) {
      setIsOverlay(true);
    }
  }, []);

  if (isOverlay) {
    return <Overlay />;
  }

  return (
    <div className="flex flex-col h-screen bg-tactical-900 text-tactical-text overflow-hidden selection:bg-tactical-accent selection:text-tactical-900">

      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-tactical-700 bg-tactical-800">
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('perimetr')} className={`px-4 py-2 uppercase font-bold text-sm tracking-wider transition-colors outline-none ${activeTab === 'perimetr' ? 'text-tactical-900 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'text-tactical-text hover:bg-tactical-700'}`}>
            Периметр
          </button>
          <button onClick={() => setActiveTab('kpt')} className={`px-4 py-2 uppercase font-bold text-sm tracking-wider transition-colors outline-none ${activeTab === 'kpt' ? 'text-tactical-900 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'text-tactical-text hover:bg-tactical-700'}`}>
            КПТ
          </button>
          <button onClick={() => setActiveTab('base')} className={`px-4 py-2 uppercase font-bold text-sm tracking-wider transition-colors outline-none ${activeTab === 'base' ? 'text-tactical-900 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'text-tactical-text hover:bg-tactical-700'}`}>
            База
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-6 relative">
         {activeTab === 'perimetr' && <PerimetrDashboard />}
         {activeTab === 'kpt' && <KptTracker />}
         {activeTab === 'base' && <BaseTimer />}
      </div>

    </div>
  );
}

export default App;
