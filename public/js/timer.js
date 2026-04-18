const MODES = {
    base: function(durationMins) {
        const phases = [];
        const physioTime = 5 * 60000; // 5 mins
        const hrvTime = 10 * 60000; // 10 mins
        const pmrTime = 4 * 60000; // 4 mins
        const mindfulTime = (durationMins * 60000) - physioTime - hrvTime - pmrTime;

        // Физиологический вздох (2 вдоха, 1 выдох) - 5 мин
        let t = 0;
        while(t < physioTime) {
            phases.push({ id: `physio_in1_${t}`, name: 'ВДОХ', duration: 2000, startFill: 0, endFill: 0.5, color: '#3b82f6', title: 'Физиологический вздох', desc: 'Первый глубокий вдох носом', globalTitle: 'База: Физиологический вздох' });
            phases.push({ id: `physio_in2_${t}`, name: 'ВДОХ', duration: 1000, startFill: 0.5, endFill: 1, color: '#3b82f6', title: 'Физиологический вздох', desc: 'Довдох носом', globalTitle: 'База: Физиологический вздох' });
            phases.push({ id: `physio_out_${t}`, name: 'ВЫДОХ', duration: 4000, startFill: 1, endFill: 0, color: '#10b981', title: 'Физиологический вздох', desc: 'Длинный выдох ртом', globalTitle: 'База: Физиологический вздох' });
            t += 7000;
        }

        // ВСР (5с вдох, 5с выдох) - 10 мин
        t = 0;
        while(t < hrvTime) {
            phases.push({ id: `hrv_in_${t}`, name: 'ВДОХ', duration: 5000, startFill: 0, endFill: 1, color: '#3b82f6', title: 'Резонансное дыхание', desc: 'Плавный вдох носом', globalTitle: 'База: ВСР' });
            phases.push({ id: `hrv_out_${t}`, name: 'ВЫДОХ', duration: 5000, startFill: 1, endFill: 0, color: '#10b981', title: 'Резонансное дыхание', desc: 'Плавный выдох', globalTitle: 'База: ВСР' });
            t += 10000;
        }

        // ПМР (7с напряжение, 20с расслабление) - 4 мин (примерно 9 циклов)
        t = 0;
        const muscleGroups = ['Кисти рук', 'Предплечья и плечи', 'Лицо', 'Шея', 'Грудь и живот', 'Спина', 'Бедра', 'Икры', 'Ступни'];
        let mIndex = 0;
        while(t < pmrTime && mIndex < muscleGroups.length) {
            phases.push({ id: `pmr_tense_${t}`, name: 'НАПРЯЖЕНИЕ', duration: 7000, startFill: 0, endFill: 1, color: '#ef4444', title: 'ПМР: ' + muscleGroups[mIndex], desc: 'Максимально напрягите мышцы', globalTitle: 'База: ПМР' });
            phases.push({ id: `pmr_relax_${t}`, name: 'РАССЛАБЛЕНИЕ', duration: 20000, startFill: 1, endFill: 0, color: '#10b981', title: 'ПМР: ' + muscleGroups[mIndex], desc: 'Резко сбросьте напряжение и расслабьтесь', globalTitle: 'База: ПМР' });
            t += 27000;
            mIndex++;
        }

        // Пространство дыхания
        t = 0;
        const mindfulPhases = ['Осознание мыслей и чувств', 'Фокус на дыхании', 'Расширение внимания на тело'];
        const mindfulDuration = mindfulTime / 3;
        for (let i=0; i<3; i++) {
             phases.push({ id: `mindful_${i}`, name: 'ФОКУС', duration: mindfulDuration, startFill: 0, endFill: 1, color: '#8b5cf6', title: 'Пространство дыхания', desc: mindfulPhases[i], globalTitle: 'База: Пространство дыхания' });
        }

        return phases;
    },
    arsenalAuto: function(durationMins) {
        const phases = [];
        const isMini = durationMins === 15;
        const isNight = new Date().getHours() >= 19 || new Date().getHours() < 9;

        if (!isMini) {
            // Когнитивный блок (5 мин)
            phases.push({ id: `cog_stop`, name: 'СТОП-КАДР', duration: 2.5 * 60000, startFill: 0, endFill: 1, color: '#f59e0b', title: 'Когнитивный блок', desc: 'Сбор фактов, Оценка, Проверка', globalTitle: 'Арсенал: Когнитивный блок' });
            phases.push({ id: `cog_act`, name: 'РАЗДЕЛЕНИЕ', duration: 2.5 * 60000, startFill: 0, endFill: 1, color: '#f59e0b', title: 'Когнитивный блок', desc: 'Применение ACT-разделения от мыслей', globalTitle: 'Арсенал: Когнитивный блок' });

            // Ментальная репетиция (10 мин)
            phases.push({ id: `reh_opt`, name: 'ОПТИМАЛЬНЫЙ', duration: 3.3 * 60000, startFill: 0, endFill: 1, color: '#8b5cf6', title: 'Ментальная репетиция', desc: 'Визуализация оптимального сценария', globalTitle: 'Арсенал: Ментальная репетиция' });
            phases.push({ id: `reh_hard`, name: 'СЛОЖНЫЙ', duration: 3.3 * 60000, startFill: 0, endFill: 1, color: '#8b5cf6', title: 'Ментальная репетиция', desc: 'Визуализация с препятствиями', globalTitle: 'Арсенал: Ментальная репетиция' });
            phases.push({ id: `reh_fail`, name: 'ПРОВАЛЬНЫЙ', duration: 3.4 * 60000, startFill: 0, endFill: 1, color: '#8b5cf6', title: 'Ментальная репетиция', desc: 'Поиск выхода из провального сценария', globalTitle: 'Арсенал: Ментальная репетиция' });
        }

        // Физиологическая интеграция (5 мин)
        if (isNight) {
             phases.push({ id: `phys_cold`, name: 'ХОЛОД', duration: 5 * 60000, startFill: 0, endFill: 1, color: '#0ea5e9', title: 'Физиологическая интеграция', desc: 'Холодовая экспозиция (ледяной душ со вздохами)', globalTitle: 'Арсенал: Интеграция (Вечер/Ночь)' });
        } else {
             phases.push({ id: `phys_key`, name: 'МЕТОД КЛЮЧ', duration: 5 * 60000, startFill: 0, endFill: 1, color: '#f97316', title: 'Физиологическая интеграция', desc: 'Идеомоторные движения для снятия зажимов', globalTitle: 'Арсенал: Интеграция (День)' });
        }

        // Yoga Nidra (10 мин)
        phases.push({ id: `yoga_nidra`, name: 'YOGA NIDRA', duration: 10 * 60000, startFill: 0, endFill: 1, color: '#6366f1', title: 'Финальное расслабление', desc: 'Слушайте аудио-гид NSDR', globalTitle: 'Арсенал: Yoga Nidra' });

        return phases;
    },
    full: function(durationMins) {
        const baseTime = durationMins === 50 ? 20 : 40;
        const arsenalTime = 30;
        const p1 = this.base(baseTime);
        const p2 = this.arsenalAuto(arsenalTime);
        // Transition phase
        p1.push({ id: 'transition', name: 'ПЕРЕХОД', duration: 10000, startFill: 0, endFill: 1, color: '#cbd5e1', title: 'Переход', desc: 'Приготовьтесь к следующему этапу', globalTitle: 'Переход' });
        return p1.concat(p2);
    }
};

let currentPhases = [];
let currentPhaseIndex = 0;
let animationFrameId;
let startTime = 0;
let isRunning = false;
let sessionStartTime = 0;
let currentMode = '';
let totalSessionDuration = 0;
let pausedTime = 0;
let lastPauseTime = 0;

const circleCircumference = 2 * Math.PI * 140; // r=140

function initTimerUI() {
    const circle = document.querySelector('#timer-circle-progress');
    if (circle) {
        circle.style.strokeDasharray = circleCircumference;
        circle.style.strokeDashoffset = circleCircumference;
    }

    document.querySelectorAll('.timer-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.timer-tab-btn').forEach(b => {
                b.classList.remove('bg-emerald-600', 'text-white');
                b.classList.add('bg-slate-800', 'text-slate-400');
            });
            e.target.classList.remove('bg-slate-800', 'text-slate-400');
            e.target.classList.add('bg-emerald-600', 'text-white');

            document.querySelectorAll('.timer-content').forEach(c => c.classList.add('hidden'));
            document.getElementById(e.target.dataset.timerTarget).classList.remove('hidden');
        });
    });

    document.getElementById('btn-timer-start').addEventListener('click', toggleTimer);
    document.getElementById('btn-timer-reset').addEventListener('click', resetTimer);

    // Setup mode buttons
    document.querySelectorAll('[data-timer-mode]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.timerMode;
            const duration = parseInt(e.target.dataset.timerDuration);
            startSession(mode, duration);
        });
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isRunning) {
            // Optionally pause timer when tab is hidden, or calculate passed time when back
            // For now, we'll let requestAnimationFrame pause itself (browser default behavior)
            // But we need to account for elapsed time
            lastPauseTime = Date.now();
        } else if (!document.hidden && isRunning && lastPauseTime > 0) {
            pausedTime += (Date.now() - lastPauseTime);
            lastPauseTime = 0;
        }
    });
}

function startSession(mode, duration) {
    if (isRunning) resetTimer();

    currentMode = mode;
    totalSessionDuration = duration * 60000;

    if (mode === 'base') {
        currentPhases = MODES.base(duration);
    } else if (mode === 'arsenal_auto') {
        currentPhases = MODES.arsenalAuto(duration);
    } else if (mode === 'full') {
        currentPhases = MODES.full(duration);
    }

    if (currentPhases.length > 0) {
        currentPhaseIndex = 0;
        updateTimerDisplay();
        toggleTimer();
    }
}

function toggleTimer() {
    const btn = document.getElementById('btn-timer-start');
    if (isRunning) {
        cancelAnimationFrame(animationFrameId);
        isRunning = false;
        btn.textContent = 'СТАРТ';
        btn.classList.replace('bg-yellow-600', 'bg-emerald-600');
        lastPauseTime = Date.now();
    } else {
        if (currentPhases.length === 0) {
            alert('Сначала выберите режим и время');
            return;
        }
        isRunning = true;
        btn.textContent = 'ПАУЗА';
        btn.classList.replace('bg-emerald-600', 'bg-yellow-600');
        if (startTime === 0) {
            startTime = performance.now();
            sessionStartTime = Date.now();
            pausedTime = 0;
        } else if (lastPauseTime > 0) {
            pausedTime += (Date.now() - lastPauseTime);
            lastPauseTime = 0;
        }
        requestAnimationFrame(updateTimer);
    }
}

function resetTimer() {
    cancelAnimationFrame(animationFrameId);
    isRunning = false;
    startTime = 0;
    pausedTime = 0;
    lastPauseTime = 0;
    currentPhaseIndex = 0;
    const btn = document.getElementById('btn-timer-start');
    btn.textContent = 'СТАРТ';
    btn.classList.replace('bg-yellow-600', 'bg-emerald-600');

    document.getElementById('timer-time').textContent = '00:00';
    document.getElementById('timer-total-time').textContent = '00:00 / 00:00';
    document.getElementById('timer-phase-name').textContent = 'ОЖИДАНИЕ';
    document.getElementById('timer-global-title').textContent = '-';
    document.getElementById('timer-desc').textContent = '-';

    const circle = document.querySelector('#timer-circle-progress');
    if (circle) {
        circle.style.strokeDashoffset = circleCircumference;
        circle.style.stroke = '#3b82f6';
    }
}

function updateTimer(timestamp) {
    if (!isRunning) return;

    const realElapsed = timestamp - startTime - pausedTime;

    let timeAccumulated = 0;
    let activePhase = null;
    let activePhaseIndex = -1;

    for (let i = 0; i < currentPhases.length; i++) {
        if (realElapsed >= timeAccumulated && realElapsed < timeAccumulated + currentPhases[i].duration) {
            activePhase = currentPhases[i];
            activePhaseIndex = i;
            break;
        }
        timeAccumulated += currentPhases[i].duration;
    }

    if (!activePhase) {
        // Session complete
        completeSession();
        return;
    }

    if (activePhaseIndex !== currentPhaseIndex) {
        currentPhaseIndex = activePhaseIndex;
    }

    const phaseElapsed = realElapsed - timeAccumulated;
    const phaseProgress = phaseElapsed / activePhase.duration;

    // Update SVG
    const currentFill = activePhase.startFill + (activePhase.endFill - activePhase.startFill) * phaseProgress;
    const offset = circleCircumference - (currentFill * circleCircumference);

    const circle = document.querySelector('#timer-circle-progress');
    if (circle) {
        circle.style.strokeDashoffset = offset;
        circle.style.stroke = activePhase.color;
    }

    // Update Text
    const timeLeftInPhase = Math.ceil((activePhase.duration - phaseElapsed) / 1000);
    document.getElementById('timer-time').textContent = formatTime(timeLeftInPhase);
    document.getElementById('timer-phase-name').textContent = activePhase.name;
    document.getElementById('timer-phase-name').style.color = activePhase.color;

    document.getElementById('timer-global-title').textContent = activePhase.globalTitle;
    document.getElementById('timer-desc').textContent = activePhase.desc;

    // Update total time
    const totalElapsedSec = Math.floor(realElapsed / 1000);
    const totalDurationSec = Math.floor(totalSessionDuration / 1000);
    document.getElementById('timer-total-time').textContent = `${formatTime(totalElapsedSec)} / ${formatTime(totalDurationSec)}`;

    animationFrameId = requestAnimationFrame(updateTimer);
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

async function completeSession() {
    resetTimer();
    showToast('Сессия завершена!');

    try {
        await api.post('/timer/session', {
            id: 'ts_' + Date.now(),
            date: formatDate(new Date()),
            mode: currentMode,
            duration_ms: totalSessionDuration,
            completed: true
        });
        // Reload history to update calendar
        const todayStr = formatDate(new Date());
        loadDataForDate(todayStr);
    } catch (e) {
        console.error('Error saving session', e);
    }
}

document.addEventListener('DOMContentLoaded', initTimerUI);
