import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

const MODES = {
    hrv: (bpm) => {
        const ms = (60 / bpm / 2) * 1000;
        return [
            { id: 'hrv-in', name: 'ВДОХ', duration: ms, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Резонансное дыхание', desc: 'Мягкий вдох через нос.' },
            { id: 'hrv-out', name: 'ВЫДОХ', duration: ms, startFill: 1, endFill: 0, color: '#a78bfa', title: 'Резонансное дыхание', desc: 'Мягкий выдох.' }
        ];
    },
    sigh: () => {
        return [
            { id: 'inhale1', name: 'ВДОХ (80%)', duration: 2000, startFill: 0, endFill: 0.8, color: '#38bdf8', title: 'Физиологический вздох', desc: 'Быстрый вдох носом.' },
            { id: 'inhale2', name: 'ДОВДОХ (20%)', duration: 500, startFill: 0.8, endFill: 1, color: '#0284c7', title: 'Физиологический вздох', desc: 'Короткий до-вдох.' },
            { id: 'exhale', name: 'ДОЛГИЙ ВЫДОХ', duration: 5500, startFill: 1, endFill: 0, color: '#a78bfa', title: 'Физиологический вздох', desc: 'Медленный выдох ртом.' },
            { id: 'pause', name: 'ОБЫЧНОЕ ДЫХАНИЕ', duration: 8000, startFill: 0, endFill: 0, color: '#94a3b8', title: 'Пауза', desc: 'Дышите как обычно.' }
        ];
    },
    pmr: () => {
        const groups = [
            { n: '1. Кисти и предплечья', on: 'Сожмите кулаки максимально (как стальные пружины).', off: 'Резко разожмите. Почувствуйте тепло и тяжесть в расслабленных руках.' },
            { n: '2. Бицепсы и плечи', on: 'Согните руки в локтях и напрягите бицепсы. Прижмите плечи к телу.', off: 'Опустите руки. Почувствуйте, как напряжение стекает вниз.' },
            { n: '3. Лицо', on: 'Нахмурьтесь, зажмурьте глаза, сожмите челюсти (лицо-"лимон").', off: 'Разгладьте лоб, расслабьте челюсть. Глаза мягко прикрыты.' },
            { n: '4. Шея и затылок', on: 'Втяните голову в плечи. Слегка откиньте голову назад.', off: 'Опустите плечи. Позвольте голове найти удобное положение.' },
            { n: '5. Грудь и живот', on: 'Сделайте глубокий вдох, задержите дыхание. Напрягите пресс как щит.', off: 'Шумный выдох. Живот мягкий. Дыхание свободное.' },
            { n: '6. Бедра и ягодицы', on: 'Сильно сожмите ягодицы. Напрягите переднюю и заднюю поверхность бедер.', off: 'Полностью расслабьте низ тела. Ощутите опору под собой.' },
            { n: '7. Икры и стопы', on: 'Натяните носки на себя. Напрягите икроножные мышцы.', off: 'Расслабьте стопы. Почувствуйте, как ноги тяжелеют.' }
        ];
        let p = [];
        groups.forEach(g => {
            p.push({ id: `pmr-${g.n}-on`, name: 'НАПРЯЖЕНИЕ (100%)', duration: 7000, startFill: 0, endFill: 1, color: '#f43f5e', title: `ПМР: ${g.n}`, desc: g.on });
            p.push({ id: `pmr-${g.n}-off`, name: 'ВНЕЗАПНОЕ РАССЛАБЛЕНИЕ', duration: 15000, startFill: 1, endFill: 0, color: '#10b981', title: `ПМР: ${g.n}`, desc: g.off });
        });
        return p;
    },
    space: (totalMs) => {
        const pt = totalMs / 3;
        return [
            { id: 'sp-1', name: 'ОСОЗНАНИЕ', duration: pt, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Пространство: ОСОЗНАНИЕ', desc: 'Остановитесь. Задайте себе вопросы без оценки: Какие сейчас мысли? Какие эмоции? Какие ощущения в теле?' },
            { id: 'sp-2', name: 'СОБИРАНИЕ', duration: pt, startFill: 0, endFill: 1, color: '#a78bfa', title: 'Пространство: СОБИРАНИЕ', desc: 'Направьте всё внимание на дыхание. Вдох... выдох. Если мысли уносят — мягко верните внимание на дыхание без раздражения.' },
            { id: 'sp-3', name: 'РАСШИРЕНИЕ', duration: pt, startFill: 0, endFill: 1, color: '#10b981', title: 'Пространство: РАСШИРЕНИЕ', desc: 'Расширьте внимание на всё тело и позу. Затем на пространство вокруг: звуки, свет. Сделайте глубокий вдох-выдох.' }
        ];
    },
    base: (totalMinutes) => {
        let p = [];
        const totalMs = totalMinutes * 60 * 1000;
        let accumulatedMs = 0;

        p.push({ id: 'base-prep', name: 'ПОДГОТОВКА', duration: 10000, startFill: 0, endFill: 1, color: '#eab308', title: "Приготовьтесь", desc: "Сядьте удобно. Выпрямите спину." });
        accumulatedMs += 10000;

        const is20 = totalMinutes <= 20;

        // 1. Sigh
        p.push({ id: 'base-trans-1', name: 'ПЕРЕХОД', duration: 5000, startFill: 0, endFill: 1, color: '#eab308', title: "Этап 1/4: Сброс CO2", desc: "Физиологический вздох. Два вдоха носом, длинный выдох ртом." });
        accumulatedMs += 5000;

        let sighCycles = is20 ? 3 : 5;
        for(let i = 0; i < sighCycles; i++) {
            let cycle = MODES.sigh();
            cycle.forEach(c => { p.push(c); accumulatedMs += c.duration; });
        }

        // 2. HRV
        const hrvTargetMs = is20 ? (5 * 60 * 1000) : (10 * 60 * 1000);
        p.push({ id: 'base-trans-2', name: 'ПЕРЕХОД', duration: 10000, startFill: 0, endFill: 1, color: '#eab308', title: "Этап 2/4: Резонансное дыхание", desc: "Дыхание выравнивается. 5 сек вдох, 5 сек выдох." });
        accumulatedMs += 10000;

        let hrvCycles = Math.floor(hrvTargetMs / 10000);
        for(let i = 0; i < hrvCycles; i++) {
            let cycle = MODES.hrv(6.0);
            cycle.forEach(c => { p.push(c); accumulatedMs += c.duration; });
        }

        // 3. PMR
        p.push({ id: 'base-trans-3', name: 'ПЕРЕХОД', duration: 10000, startFill: 0, endFill: 1, color: '#eab308', title: "Этап 3/4: ПМР", desc: "Прогрессивная мышечная релаксация." });
        accumulatedMs += 10000;

        let pmrCycle = MODES.pmr();
        pmrCycle.forEach(c => { p.push(c); accumulatedMs += c.duration; });

        // 4. Space
        let spaceRemaining = totalMs - accumulatedMs;
        if (spaceRemaining > 10000) {
            p.push({ id: 'base-trans-4', name: 'ПЕРЕХОД', duration: 10000, startFill: 0, endFill: 1, color: '#eab308', title: "Этап 4/4: Пространство дыхания", desc: "Финальный этап интеграции. Переходим к практике осознанности." });
            accumulatedMs += 10000;
            spaceRemaining -= 10000;

            let spaceCycle = MODES.space(spaceRemaining);
            spaceCycle.forEach(c => { p.push(c); });
        }

        return p;
    },
    stopframe: () => [
        { id: 'sf-s', name: 'СИТУАЦИЯ', duration: 60000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'С - Ситуация', desc: 'Что произошло? Вспомните событие. Только сухие факты. Без интерпретаций.' },
        { id: 'sf-t', name: 'ТЕЛО', duration: 60000, startFill: 0, endFill: 1, color: '#a78bfa', title: 'Т - Тело', desc: 'Что происходит в теле? Учащенный пульс, задержка дыхания, напряжение в челюсти или плечах?' },
        { id: 'sf-o', name: 'ОЦЕНКА', duration: 60000, startFill: 0, endFill: 1, color: '#f43f5e', title: 'О - Оценка', desc: 'Что я себе сказал? Какая первая автоматическая (пугающая) мысль пришла в голову?' },
        { id: 'sf-p', name: 'ПРОВЕРКА', duration: 120000, startFill: 0, endFill: 1, color: '#eab308', title: 'П - Проверка', desc: 'Это факт или интерпретация? Какова реальная вероятность худшего (0-100%)? Если это случится — это конец или просто трудность?' },
        { id: 'sf-k', name: 'КОРРЕКЦИЯ', duration: 60000, startFill: 0, endFill: 1, color: '#10b981', title: 'К - Коррекция', desc: 'Сформулируйте более точную и реалистичную мысль на основе проверки.' },
        { id: 'sf-a', name: 'ДЕЙСТВИЕ', duration: 60000, startFill: 0, endFill: 1, color: '#3b82f6', title: 'А - Действие', desc: 'Что конкретно я должен сделать прямо сейчас, исходя из новой реалистичной оценки?' },
        { id: 'sf-d', name: 'ДЫХАНИЕ', duration: 60000, startFill: 0, endFill: 1, color: '#8b5cf6', title: 'Д - Дыхание', desc: 'Выполните 3 физиологических вздоха для стабилизации нервной системы перед действием.' },
        { id: 'sf-r', name: 'РЕЗУЛЬТАТ', duration: 60000, startFill: 0, endFill: 1, color: '#14b8a6', title: 'Р - Результат', desc: 'Мысленно или в дневнике зафиксируйте ожидаемый или фактический результат.' }
    ],
    act: () => [
        { id: 'act-1', name: 'РАМКА 1', duration: 20000, startFill: 0, endFill: 1, color: '#f43f5e', title: 'Шаг 1: Дистанцирование', desc: 'Заметьте пугающую, но правдивую мысль. Скажите себе: «У меня есть мысль, что [вставьте вашу мысль]».' },
        { id: 'act-2', name: 'РАМКА 2', duration: 20000, startFill: 0, endFill: 1, color: '#eab308', title: 'Шаг 2: Наблюдение', desc: 'Теперь скажите: «Я ЗАМЕЧАЮ, что у меня есть мысль, что...». Почувствуйте дистанцию. Вы — не ваша мысль.' },
    ],
    rehearsal: () => [
        { id: 'reh-1', name: 'СТАБИЛИЗАЦИЯ', duration: 120000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Шаг 1: Стабилизация', desc: 'Сделайте 3 физиологических вздоха + дышите ровно. Закройте глаза. Представьте предстоящее событие.' },
        { id: 'reh-2', name: 'ОПТИМУМ', duration: 120000, startFill: 0, endFill: 1, color: '#10b981', title: 'Сценарий А: Оптимальный', desc: 'Представьте место, себя. Вы спокойны. Ключевые слова, позитивная реакция оппонента, успех. Проживите это.' },
        { id: 'reh-3', name: 'СЛОЖНОСТЬ', duration: 120000, startFill: 0, endFill: 1, color: '#f43f5e', title: 'Сценарий Б: Сложный', desc: 'Возникает провокация или препятствие. Пульс растёт — ЗАМЕТЬТЕ ЭТО. Вздох. Пауза. Вы перестраиваетесь и контролируете ситуацию.' },
        { id: 'reh-4', name: 'ПРОВАЛ', duration: 120000, startFill: 0, endFill: 1, color: '#eab308', title: 'Сценарий В: Провальный', desc: 'Худший реалистичный исход. Ваши действия по минимизации ущерба. Вы выходите с достоинством. Извлекаете опыт.' },
        { id: 'reh-5', name: 'ЗАВЕРШЕНИЕ', duration: 60000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Шаг 4: Завершение', desc: 'Сделайте 3 глубоких вдоха. Мысленно скажите: «Я готов к любому варианту». Медленно откройте глаза.' }
    ],
    yoganidra: () => [
        { id: 'yn-1', name: 'ПОДГОТОВКА', duration: 60000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Подготовка к NSDR', desc: 'Лягте на спину, руки вдоль тела. Включите выбранную аудиозапись (NSDR Huberman или Insight Timer).' },
        { id: 'yn-2', name: 'ПРАКТИКА', duration: 15 * 60000, startFill: 0, endFill: 1, color: '#a78bfa', title: 'Глубокое расслабление', desc: 'Следуйте за голосом диктора. Позвольте телу уснуть, сохраняя легкое фоновое сознание.' },
        { id: 'yn-3', name: 'ВОЗВРАТ', duration: 60000, startFill: 0, endFill: 1, color: '#10b981', title: 'Возвращение', desc: 'Практика завершена. Не вскакивайте. Просто полежите спокойно. Затем потянитесь и медленно сядьте.' }
    ],
    cold: () => [
        { id: 'cold-1', name: 'НАСТРОЙКА', duration: 10000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Подготовка', desc: 'После теплого душа переключите кран на самую холодную воду.' },
        { id: 'cold-2', name: 'ЭКСПОЗИЦИЯ', duration: 60000, startFill: 0, endFill: 1, color: '#0284c7', title: 'Холодовой стресс', desc: 'Выдержите ледяную воду. Практикуйте физиологический вздох. Контролируйте свою реакцию на стресс.' }
    ],
    key: () => [
        { id: 'key-1', name: 'РАСХОЖДЕНИЕ', duration: 60000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Приём А: Расхождение', desc: 'Встаньте. Закройте глаза. Руки перед собой. Вообразите, что они расходятся в стороны. Без мышечного усилия.' },
        { id: 'key-2', name: 'СХОЖДЕНИЕ', duration: 60000, startFill: 0, endFill: 1, color: '#a78bfa', title: 'Приём Б: Схождение', desc: 'Разведите руки. Представьте, что они притягиваются друг к другу, как магниты.' },
        { id: 'key-3', name: 'ВСПЛЫВАНИЕ', duration: 60000, startFill: 0, endFill: 1, color: '#10b981', title: 'Приём В: Всплывание', desc: 'Опустите руки. Представьте, что одна рука стала лёгкой как воздушный шар и сама всплывает вверх.' },
        { id: 'key-4', name: 'МАЯТНИК', duration: 60000, startFill: 0, endFill: 1, color: '#f43f5e', title: 'Приём Г: Покачивание', desc: 'Представьте лёгкое покачивание всего тела вперёд-назад. Позвольте телу двигаться за воображением.' }
    ]
};

export default function BaseTimer({ setCurrentApp }) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeMode, setActiveMode] = useState('base_20');
  const [phases, setPhases] = useState(MODES.base(20));
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsedInPhase, setElapsedInPhase] = useState(0);
  const reqRef = useRef(null);
  const startTimeRef = useRef(0);
  const [phaseProgress, setPhaseProgress] = useState(0);

  const startMode = (modeKey) => {
      let newPhases = [];
      if (modeKey === 'base_20') newPhases = MODES.base(20);
      else if (modeKey === 'base_40') newPhases = MODES.base(40);
      else if (modeKey === 'stopframe') newPhases = MODES.stopframe();
      else if (modeKey === 'act') newPhases = MODES.act();
      else if (modeKey === 'rehearsal') newPhases = MODES.rehearsal();
      else if (modeKey === 'yoganidra') newPhases = MODES.yoganidra();
      else if (modeKey === 'cold') newPhases = MODES.cold();
      else if (modeKey === 'key') newPhases = MODES.key();

      setPhases(newPhases);
      setPhaseIndex(0);
      setElapsedInPhase(0);
      setPhaseProgress(0);
      setTimeRemaining(newPhases.length > 0 ? newPhases[0].duration : 0);
      setIsRunning(false);
      setActiveMode(modeKey);
      startTimeRef.current = 0;
  };

  const loop = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;

    if (phaseIndex < phases.length) {
      const p = phases[phaseIndex];
      if (elapsed >= p.duration) {
        startTimeRef.current = timestamp;
        setPhaseIndex(idx => idx + 1);
        setElapsedInPhase(0);
        setPhaseProgress(0);
      } else {
        setElapsedInPhase(elapsed);

        // Calculate progress dynamically
        const prog = elapsed / p.duration;
        const currentFill = p.startFill !== undefined && p.endFill !== undefined
                            ? p.startFill + (p.endFill - p.startFill) * prog
                            : prog;

        setPhaseProgress(currentFill);
        setTimeRemaining(p.duration - elapsed);
      }
      reqRef.current = requestAnimationFrame(loop);
    } else {
        setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      reqRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(reqRef.current);
      startTimeRef.current = 0; // reset to allow pause
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isRunning, phaseIndex]);

  const currentPhase = phases[phaseIndex] || { name: 'ЗАВЕРШЕНО', color: '#10b981', title: 'Сессия окончена', desc: 'Отличная работа!' };

  const radius = 88;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (phaseProgress * circumference);

  const renderTime = (ms) => {
      const totalS = Math.ceil(ms / 1000);
      if (totalS >= 60) {
          const m = Math.floor(totalS / 60);
          const s = totalS % 60;
          return `${m}:${s.toString().padStart(2, '0')}`;
      }
      return totalS.toString();
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-tactical-900 justify-center">
      <div className="w-full mb-4 max-w-[28rem] flex justify-between">
        <button onClick={() => setCurrentApp('menu')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1 font-mono">
          <ArrowLeft className="w-4 h-4"/> На главную
        </button>
      </div>

      <div className="flex flex-col items-center bg-tactical-800 p-8 rounded-sm shadow-2xl max-w-[28rem] w-full cyber-border font-mono">

        <div className="flex flex-wrap gap-2 w-full justify-center pb-4 mb-4 border-b border-tactical-700">
            <button onClick={() => startMode('base_20')} className={`px-3 py-1 text-xs rounded border transition-colors whitespace-nowrap ${activeMode === 'base_20' ? 'bg-tactical-accent text-tactical-900 border-tactical-accent font-bold' : 'bg-tactical-900 text-gray-400 border-tactical-700 hover:text-white'}`}>База (20м)</button>
            <button onClick={() => startMode('base_40')} className={`px-3 py-1 text-xs rounded border transition-colors whitespace-nowrap ${activeMode === 'base_40' ? 'bg-tactical-accent text-tactical-900 border-tactical-accent font-bold' : 'bg-tactical-900 text-gray-400 border-tactical-700 hover:text-white'}`}>База (40м)</button>
            <button onClick={() => startMode('stopframe')} className={`px-3 py-1 text-xs rounded border transition-colors whitespace-nowrap ${activeMode === 'stopframe' ? 'bg-blue-500 text-white border-blue-500 font-bold' : 'bg-tactical-900 text-gray-400 border-tactical-700 hover:text-white'}`}>СТОП-КАДР</button>
            <button onClick={() => startMode('act')} className={`px-3 py-1 text-xs rounded border transition-colors whitespace-nowrap ${activeMode === 'act' ? 'bg-orange-500 text-white border-orange-500 font-bold' : 'bg-tactical-900 text-gray-400 border-tactical-700 hover:text-white'}`}>ACT-Разделение</button>
            <button onClick={() => startMode('rehearsal')} className={`px-3 py-1 text-xs rounded border transition-colors whitespace-nowrap ${activeMode === 'rehearsal' ? 'bg-purple-500 text-white border-purple-500 font-bold' : 'bg-tactical-900 text-gray-400 border-tactical-700 hover:text-white'}`}>Репетиция</button>
            <button onClick={() => startMode('yoganidra')} className={`px-3 py-1 text-xs rounded border transition-colors whitespace-nowrap ${activeMode === 'yoganidra' ? 'bg-indigo-500 text-white border-indigo-500 font-bold' : 'bg-tactical-900 text-gray-400 border-tactical-700 hover:text-white'}`}>Yoga Nidra</button>
            <button onClick={() => startMode('cold')} className={`px-3 py-1 text-xs rounded border transition-colors whitespace-nowrap ${activeMode === 'cold' ? 'bg-sky-500 text-white border-sky-500 font-bold' : 'bg-tactical-900 text-gray-400 border-tactical-700 hover:text-white'}`}>Холод</button>
            <button onClick={() => startMode('key')} className={`px-3 py-1 text-xs rounded border transition-colors whitespace-nowrap ${activeMode === 'key' ? 'bg-rose-500 text-white border-rose-500 font-bold' : 'bg-tactical-900 text-gray-400 border-tactical-700 hover:text-white'}`}>Ключ</button>
        </div>

        <p className="text-sm font-bold text-gray-300 text-center mb-1 uppercase tracking-wider">{currentPhase.title}</p>
        <p className="text-xs text-gray-400 mb-8 text-center min-h-[40px] leading-relaxed max-w-xs">{currentPhase.desc}</p>

        <div className="relative w-64 h-64 flex flex-col items-center justify-center mb-8 font-sans">
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#334155" strokeWidth="12" />
                <circle cx="100" cy="100" r={radius} fill="transparent" stroke={currentPhase.color} strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-75" />
            </svg>
            <div className="text-xl font-bold uppercase tracking-widest text-center px-4 font-mono" style={{ color: currentPhase.color }}>{currentPhase.name}</div>
            <div className="text-5xl font-bold text-white tabular-nums mt-2 font-mono">
                {renderTime(timeRemaining)}
            </div>
        </div>

        <div className="flex gap-4 w-full">
            <button onClick={() => setIsRunning(!isRunning)} className="flex-1 bg-tactical-accent hover:opacity-80 text-tactical-900 font-bold py-3 rounded uppercase tracking-wider transition-opacity shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {isRunning ? 'Пауза' : 'Старт'}
            </button>
            <button onClick={() => startMode(activeMode)} className="flex-1 bg-tactical-900 border border-tactical-700 hover:bg-tactical-700 text-white font-bold py-3 rounded uppercase tracking-wider transition-colors">
                Сброс
            </button>
        </div>
      </div>
    </div>
  );
}
