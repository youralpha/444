<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { perimetrDB } from "../lib/db";

  export let params = {};

  // Состояние
  let isRunning = false;
  let currentMode = 'base';
  let modeTitle = "BASE";
  let modeSubtitle = "Базовый цикл регуляции";
  let phaseName = "Ожидание";
  let phaseColor = "#10b981"; // tactical-accent
  let timeText = "0";
  let sessionTimeLeft = "";
  let pmrGroupText = "Ожидание старта";
  let pmrActionText = 'Нажмите "Старт", чтобы начать';

  let sessionLimitMs = 0;
  let currentPhaseIndex = 0;
  let startTime = 0;
  let pausedElapsedTime = 0;
  let totalSessionTime = 0;
  let animationFrameId: number;
  let lastFrameTime = 0;

  const circumference = 753.98;
  let strokeDashoffset = 0;
  let strokeColor = "#334155";

  // Data config (porting from old JS)
  const config = {
    base: { title: "BASE", subtitle: "Базовый цикл регуляции", limit: 0,
      phases: [
        { name: "Вдох", duration: 4000, color: "#10b981", startFill: 0, endFill: 0.25 }, // accent
        { name: "Задержка", duration: 4000, color: "#f59e0b", startFill: 0.25, endFill: 0.5 }, // amber
        { name: "Выдох", duration: 4000, color: "#38bdf8", startFill: 0.5, endFill: 0.75 }, // sky
        { name: "Задержка", duration: 4000, color: "#f59e0b", startFill: 0.75, endFill: 1.0 }
      ]
    },
    pmr: { title: "PMR", subtitle: "Цикл ПМР (Расслабление)", limit: 0,
      phases: [
        { name: "Напряжение", duration: 5000, color: "#ef4444", startFill: 0, endFill: 0.5, title: "Кисти и руки", desc: "Крепко сожмите кулаки, напрягите бицепсы" },
        { name: "Расслабление", duration: 10000, color: "#10b981", startFill: 0.5, endFill: 1.0, title: "Кисти и руки", desc: "Резко отпустите напряжение. Почувствуйте тяжесть" }
      ]
    },
    nsdr: { title: "NSDR", subtitle: "NSDR (Глубокий отдых)", limit: 10 * 60000,
      phases: [
        { name: "Скан", duration: 30000, color: "#8b5cf6", startFill: 0, endFill: 1.0, title: "Сканирование тела", desc: "Внимание на правую стопу" }
      ]
    },
    sleep: { title: "SLEEP", subtitle: "Сон (Мелатониновая фаза)", limit: 0,
      phases: [
        { name: "Вдох", duration: 4000, color: "#10b981", startFill: 0, endFill: 0.2 },
        { name: "Задержка", duration: 7000, color: "#f59e0b", startFill: 0.2, endFill: 0.55 },
        { name: "Выдох", duration: 8000, color: "#38bdf8", startFill: 0.55, endFill: 1.0 }
      ]
    },
    sos: { title: "SOS", subtitle: "СОС (Паническая атака)", limit: 0,
      phases: [
        { name: "Вдох", duration: 2000, color: "#10b981", startFill: 0, endFill: 0.5 },
        { name: "Выдох", duration: 4000, color: "#38bdf8", startFill: 0.5, endFill: 1.0 }
      ]
    },
    flow: { title: "FLOW", subtitle: "Поток (Дыхание 1:1)", limit: 0,
      phases: [
        { name: "Вдох", duration: 5000, color: "#10b981", startFill: 0, endFill: 0.5 },
        { name: "Выдох", duration: 5000, color: "#38bdf8", startFill: 0.5, endFill: 1.0 }
      ]
    }
  };

  let phases: any[] = [];

  function setTrainingType(type: string) {
    const cfg = config[type as keyof typeof config];
    if (!cfg) return;

    modeTitle = cfg.title;
    modeSubtitle = cfg.subtitle;
    sessionLimitMs = cfg.limit;

    // Build full phase list based on limits/repetitions
    let basePhases = cfg.phases;
    phases = [];

    if (type === 'pmr') {
        const pGroups = [
            { t: "Кисти и руки", d1: "Крепко сожмите кулаки, напрягите бицепсы", d2: "Резко отпустите напряжение. Почувствуйте тяжесть" },
            { t: "Плечи и шея", d1: "Поднимите плечи к ушам, втяните голову", d2: "Опустите плечи вниз, расслабьте шею" },
            { t: "Лицо", d1: "Зажмурьте глаза, сморщите нос, сожмите челюсти", d2: "Расслабьте лицо, разомкните челюсти" }
        ];
        pGroups.forEach(g => {
            phases.push({ name: "Напряжение", duration: 5000, color: "#ef4444", startFill: 0, endFill: 0.5, title: g.t, desc: g.d1 });
            phases.push({ name: "Расслабление", duration: 10000, color: "#10b981", startFill: 0.5, endFill: 1.0, title: g.t, desc: g.d2 });
        });
    } else if (type === 'nsdr') {
        for(let i=0; i<20; i++) {
             phases.push({ name: "Скан", duration: 30000, color: "#8b5cf6", startFill: 0, endFill: 1.0, title: "Сканирование тела", desc: "Дышите ровно. Внимание на участки тела." });
        }
    } else {
        // Infinite loop for breathing
        for(let i=0; i<100; i++) {
            phases = phases.concat(basePhases);
        }
    }

    resetTimer();
  }

  function handleModeChange(event: Event) {
    const sel = event.target as HTMLSelectElement;
    currentMode = sel.value;
    setTrainingType(currentMode);
  }

  function updateUI(elapsed: number) {
    const phase = phases[currentPhaseIndex];
    if(!phase) return;

    const displayTime = Math.max(0, Math.min(elapsed, phase.duration));
    const timeLeft = phase.duration - displayTime;

    if (timeLeft >= 60000) {
        const m = Math.floor(timeLeft / 60000);
        const s = Math.floor((timeLeft % 60000) / 1000);
        timeText = `${m}:${s.toString().padStart(2, '0')}`;
    } else {
        timeText = Math.ceil(timeLeft / 1000).toString();
    }

    if (isRunning || pausedElapsedTime > 0) {
        if (phase.title || phase.desc) {
            pmrGroupText = phase.title || '';
            pmrActionText = phase.desc || '';
        }
        phaseName = phase.name;
        phaseColor = phase.color;
    }

    const progress = displayTime / phase.duration;
    const currentFill = phase.startFill + (phase.endFill - phase.startFill) * progress;
    strokeDashoffset = circumference - (currentFill * circumference);
    strokeColor = (isRunning || pausedElapsedTime > 0) ? phase.color : '#334155';
  }

  function loop(timestamp: number) {
    if (!isRunning) return;

    if (!startTime) {
        startTime = timestamp - pausedElapsedTime;
        lastFrameTime = timestamp;
    }

    const delta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    totalSessionTime += delta;

    if (sessionLimitMs > 0) {
        const timeLeft = Math.max(0, sessionLimitMs - totalSessionTime);
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        sessionTimeLeft = `Осталось: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    let elapsed = timestamp - startTime;
    const currentPhaseDef = phases[currentPhaseIndex];

    if (elapsed >= currentPhaseDef.duration) {
        const overshot = elapsed - currentPhaseDef.duration;
        startTime = timestamp - overshot;
        elapsed = overshot;

        currentPhaseIndex++;

        if (currentPhaseIndex >= phases.length) {
            currentPhaseIndex = phases.length - 1;
            updateUI(currentPhaseDef.duration);
            stopTimer();
            phaseName = "ЗАВЕРШЕНО";
            phaseColor = '#10b981';
            strokeColor = '#10b981';
            pmrGroupText = "Тренировка окончена";
            pmrActionText = "Отличная работа! Данные сохранены в ваш профиль.";

            // Save to DB
            perimetrDB.logBaseSession(new Date().toISOString(), Math.round(totalSessionTime), modeTitle);
            return;
        }
    }

    updateUI(elapsed);
    animationFrameId = requestAnimationFrame(loop);
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startTime = 0;
    animationFrameId = requestAnimationFrame(loop);
  }

  function stopTimer() {
    if (!isRunning) return;
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    let currentElapsed = (performance.now() - startTime);
    if(startTime === 0) currentElapsed = pausedElapsedTime;
    pausedElapsedTime = currentElapsed;
  }

  function resetTimer() {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    startTime = 0;
    pausedElapsedTime = 0;
    currentPhaseIndex = 0;
    totalSessionTime = 0;
    lastFrameTime = 0;

    if (sessionLimitMs > 0) {
        const minutes = Math.floor(sessionLimitMs / 60000);
        sessionTimeLeft = `Осталось: ${minutes}:00`;
    }

    phaseName = "Ожидание";
    phaseColor = "#38bdf8";
    strokeColor = "#334155";
    strokeDashoffset = 0;

    if (phases && phases.length > 0) {
        pmrGroupText = "Ожидание старта";
        pmrActionText = `Нажмите "Старт", чтобы начать: ${modeTitle}.`;
    }

    updateUI(0);
  }

  onMount(() => {
      setTrainingType('base');
  });

  onDestroy(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
  });
</script>

<div class="w-full flex items-center justify-center p-4 py-12">
    <div class="flex flex-col items-center bg-tactical-800 p-8 rounded-sm shadow-2xl max-w-md w-full mx-4 border border-tactical-700 relative">

        {#if sessionLimitMs > 0 && sessionTimeLeft}
        <div class="absolute top-4 right-4 bg-tactical-900 border border-tactical-700 text-tactical-text px-3 py-1 rounded-sm text-xs font-mono font-bold animate-pulse">
            {sessionTimeLeft}
        </div>
        {/if}

        <h1 class="text-4xl font-bold mb-2 tracking-widest text-tactical-accent font-mono uppercase">{modeTitle}</h1>
        <p class="text-gray-400 mb-8 text-center text-sm font-mono h-10 flex items-center justify-center uppercase tracking-wider">{modeSubtitle}</p>

        <div class="w-full mb-8">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Оперативный режим</label>
            <select value={currentMode} on:change={handleModeChange} class="w-full bg-tactical-900 border border-tactical-700 rounded-sm p-3 text-white outline-none focus:border-tactical-accent hover:border-gray-500 transition-colors font-mono appearance-none cursor-pointer shadow-inner">
                <option value="base">Базовый цикл (Дыхание)</option>
                <option value="pmr">Цикл ПМР (Расслабление)</option>
                <option value="nsdr">NSDR (Глубокий отдых)</option>
                <option value="sleep">Сон (Мелатониновая фаза)</option>
                <option value="sos">СОС (Паническая атака)</option>
                <option value="flow">Поток (Дыхание 1:1)</option>
            </select>
        </div>

        <div class="relative w-64 h-64 flex flex-col items-center justify-center bg-tactical-900 rounded-full shadow-inner mb-10 border border-tactical-700">
            <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="#1e293b" stroke-width="4" fill="transparent" />
                <circle cx="128" cy="128" r="120" stroke={strokeColor} stroke-width="6" fill="transparent"
                        stroke-dasharray={circumference} stroke-dashoffset={strokeDashoffset}
                        class="transition-all duration-[50ms] ease-linear" stroke-linecap="butt"/>
            </svg>
            <div class="z-10 flex flex-col items-center">
                <span class="text-6xl font-bold font-mono tracking-tighter text-white">{timeText}</span>
                <span class="text-xs font-bold uppercase tracking-widest mt-2 transition-colors duration-300" style="color: {phaseColor}">{phaseName}</span>
            </div>
        </div>

        <div id="pmr-text-group" class="mb-8 w-full text-center h-20 flex flex-col justify-center">
            <div class="text-xs font-bold text-tactical-accent uppercase tracking-widest mb-2">{pmrGroupText}</div>
            <div class="text-sm font-mono text-gray-300 leading-tight">{pmrActionText}</div>
        </div>

        <div class="flex gap-4 mb-6 w-full px-2">
            {#if !isRunning}
            <button on:click={startTimer} class="flex-1 bg-tactical-accent hover:bg-emerald-400 text-tactical-900 font-bold py-4 px-6 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all transform active:scale-95 uppercase tracking-widest text-sm">
                {startTime === 0 && pausedElapsedTime === 0 ? "Старт" : "Продолжить"}
            </button>
            {:else}
            <button disabled class="flex-1 bg-tactical-700 text-gray-500 font-bold py-4 px-6 rounded-sm uppercase tracking-widest text-sm opacity-50 cursor-not-allowed">
                Старт
            </button>
            {/if}

            {#if isRunning}
            <button on:click={stopTimer} class="flex-1 bg-transparent border border-red-500 hover:bg-red-500/10 text-red-500 font-bold py-4 px-6 rounded-sm transition-all transform active:scale-95 uppercase tracking-widest text-sm">
                Стоп
            </button>
            {:else}
            <button disabled class="flex-1 bg-transparent border border-gray-600 text-gray-600 font-bold py-4 px-6 rounded-sm uppercase tracking-widest text-sm opacity-30 cursor-not-allowed">
                Стоп
            </button>
            {/if}
        </div>

        <button on:click={resetTimer} class="text-gray-500 hover:text-gray-300 font-mono text-[10px] uppercase tracking-widest transition-colors border-b border-gray-700 pb-1">
            Сброс / Заново
        </button>
    </div>
</div>
