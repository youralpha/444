const API_BASE = '/api';

// --- CBT Program Data ---
const PROGRAM = {
    1: {
        title: "Неделя 1 — Модель КПТ + постановка целей",
        goals: "<ul><li>Понять связку: ситуация → мысли → эмоции → тело → поведение → последствия.</li><li>Сформулировать 2–3 измеримые цели на 8 недель.</li></ul>",
        content: "<ul><li>Психообразование: что такое КПТ, принцип «навыки + практика».</li><li>Сбор проблемных ситуаций (5–10 примеров).</li><li>Формулировка целей в стиле SMART (микро‑шаги).</li></ul>",
        tasks: [
            { id: "w1_t1", text: "Разбор 1 ситуации по схеме ABC (на занятии)" },
            { id: "w1_t2", text: "Выбор 1 «быстрого» навыка саморегуляции (дыхание 4–6 или заземление)" },
            { id: "w1_t3", text: "3 записи ABC за неделю (ДЗ)" },
            { id: "w1_t4", text: "Ежедневно: шкала настроения 0–10 + заметка (ДЗ)" }
        ]
    },
    2: {
        title: "Неделя 2 — Поведенческая активация (энергия, мотивация, рутина)",
        goals: "<ul><li>Вернуть «движок» через действия (а не ждать настроения).</li><li>Отслеживать, какие активности реально улучшают состояние.</li></ul>",
        content: "<ul><li>Круг избегания/прокрастинации.</li><li>Модель «малые шаги» и градуировка задач.</li></ul>",
        tasks: [
            { id: "w2_t1", text: "Составить список: «даёт энергию» / «забирает энергию» (на занятии)" },
            { id: "w2_t2", text: "План на неделю: 3 приятные + 3 значимые активности (ДЗ)" },
            { id: "w2_t3", text: "Таблица активности: план → факт → настроение до/после (ДЗ)" },
            { id: "w2_t4", text: "Один «анти‑избегающий» шаг в день (2–10 минут) (ДЗ)" }
        ]
    },
    3: {
        title: "Неделя 3 — Автоматические мысли и когнитивные искажения",
        goals: "<ul><li>Научиться ловить «мысль‑триггер» до того, как она раскрутит эмоцию.</li><li>Узнать типовые искажения (катастрофизация, чтение мыслей и т.д.).</li></ul>",
        content: "<ul><li>Чем мысль отличается от факта.</li><li>Искажения как «быстрые гипотезы мозга».</li></ul>",
        tasks: [
            { id: "w3_t1", text: "Выделить автоматическую мысль и эмоцию (0–100%) из 1-2 ABC (на занятии)" },
            { id: "w3_t2", text: "Отметить искажения чек‑листом (на занятии)" },
            { id: "w3_t3", text: "5 записей автоматических мыслей (ДЗ)" },
            { id: "w3_t4", text: "1 раз: «поймай мысль в моменте» (короткая запись) (ДЗ)" }
        ]
    },
    4: {
        title: "Неделя 4 — Когнитивная реструктуризация (переоценка мыслей)",
        goals: "<ul><li>Заменять «жёсткие» мысли на более точные и полезные.</li><li>Снижать эмоциональный накал за счёт проверки гипотез.</li></ul>",
        content: "<ul><li>Вопросы Сократа: доказательства, альтернативы, польза/вред.</li><li>«Самый лучший друг» (как бы я сказал другу).</li></ul>",
        tasks: [
            { id: "w4_t1", text: "Заполнить 1 полный лист переоценки: мысль → доказательства → альтернатива → эмоция (на занятии)" },
            { id: "w4_t2", text: "3 полные переоценки мыслей (ДЗ)" },
            { id: "w4_t3", text: "Мини‑навык: «назови мысль» (ДЗ)" }
        ]
    },
    5: {
        title: "Неделя 5 — Работа с тревогой: экспозиции и эксперименты",
        goals: "<ul><li>Различать: реальная проблема vs гипотетическое беспокойство.</li><li>Начать уменьшать избегание (ключевой фактор тревоги).</li></ul>",
        content: "<ul><li>Введение в экспозиции и поведенческие эксперименты.</li><li>«Время для тревоги» (worry time) как техника.</li></ul>",
        tasks: [
            { id: "w5_t1", text: "Составить список избеганий (на занятии)" },
            { id: "w5_t2", text: "Построить иерархию 8–12 шагов (SUDS 0–100) (на занятии)" },
            { id: "w5_t3", text: "Спроектировать 1 эксперимент: «Если я сделаю Х, что случится?» (на занятии)" },
            { id: "w5_t4", text: "2–3 экспозиции/эксперимента по нижним ступеням иерархии (SUDS 20–40) (ДЗ)" },
            { id: "w5_t5", text: "Вести протокол: ожидание → факт → вывод (ДЗ)" }
        ]
    },
    6: {
        title: "Неделя 6 — Навыки совладания: решение проблем + коммуникация",
        goals: "<ul><li>Снижать стресс через управляемые действия.</li><li>Улучшать отношения и уменьшать внутреннее напряжение.</li></ul>",
        content: "<ul><li>Алгоритм решения проблем (6 шагов).</li><li>Ассертивность: «Я‑сообщение», просьбы, отказ, границы.</li></ul>",
        tasks: [
            { id: "w6_t1", text: "Разобрать 1 реальную проблему по алгоритму (на занятии)" },
            { id: "w6_t2", text: "Ролевая репетиция фразы (скрипт просьбы/отказа) (на занятии)" },
            { id: "w6_t3", text: "1 полный цикл решения проблемы (ДЗ)" },
            { id: "w6_t4", text: "2 коммуникационных действия: просьба/уточнение/граница (ДЗ)" }
        ]
    },
    7: {
        title: "Неделя 7 — Глубинные убеждения и самоподдержка",
        goals: "<ul><li>Увидеть «корневые правила» (например, «я должен быть идеальным»).</li><li>Начать замену правил на гибкие и реалистичные.</li></ul>",
        content: "<ul><li>«Стрелка вниз» (что это значит обо мне?).</li><li>Формирование нового убеждения + доказательства в реальности.</li></ul>",
        tasks: [
            { id: "w7_t1", text: "Вывести 1 глубинное убеждение и «условные правила» (на занятии)" },
            { id: "w7_t2", text: "Создать альтернативное убеждение (коротко, правдиво, поддерживающе) (на занятии)" },
            { id: "w7_t3", text: "Собирать «факты‑контраргументы» (минимум 7 за неделю) (ДЗ)" },
            { id: "w7_t4", text: "Один акт самоподдержки/самосострадания в день (ДЗ)" }
        ]
    },
    8: {
        title: "Неделя 8 — Закрепление, профилактика срывов",
        goals: "<ul><li>Свести навыки в персональный «протокол».</li><li>Подготовить план на периоды ухудшения.</li></ul>",
        content: "<ul><li>Что сработало лучше всего (по данным дневников и шкал).</li><li>Триггеры, ранние признаки, план действий.</li></ul>",
        tasks: [
            { id: "w8_t1", text: "Составить План профилактики срывов (на занятии)" },
            { id: "w8_t2", text: "«Письмо себе в трудный день» (1 страница) (на занятии)" },
            { id: "w8_t3", text: "Поддерживающая практика: ревизия навыков + экспозиция (ДЗ послекурс)" }
        ]
    }
};

let currentWeek = 1;
const todayStr = new Date().toISOString().split('T')[0];

// --- Navigation ---
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const targetId = e.target.getAttribute('data-target');

        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
    });
});

// --- Utility Functions ---
async function fetchAPI(url, options = {}) {
    try {
        const res = await fetch(url, options);
        return await res.json();
    } catch (e) {
        console.error("API Error:", e);
        return null;
    }
}

function calcWeek(startDateStr) {
    const start = new Date(startDateStr);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let week = Math.floor(diffDays / 7) + 1;
    return week > 8 ? 8 : week;
}

// --- Init & Dashboard ---
async function initApp() {
    // Meta
    const meta = await fetchAPI(`${API_BASE}/meta`);
    if(meta && meta.start_date) {
        currentWeek = calcWeek(meta.start_date);
    }

    document.getElementById('current-week-display').innerText = `НЕДЕЛЯ: ${currentWeek} / 8`;

    const weekData = PROGRAM[currentWeek];
    document.getElementById('week-title').innerHTML = weekData.title;
    document.getElementById('week-goals').innerHTML = weekData.goals;
    document.getElementById('week-content').innerHTML = weekData.content;

    // Default dates
    document.getElementById('mood-date').value = todayStr;
    document.getElementById('abc-date').value = todayStr;
    document.getElementById('rest-date').value = todayStr;
    document.getElementById('exp-date').value = todayStr;

    loadTasks();
    loadMoods();
    loadABC();
    loadRestructuring();
    loadExperiments();
    loadExposures();
}

async function loadTasks() {
    const res = await fetchAPI(`${API_BASE}/tasks`);
    const completedTasks = res && res.data ? res.data : [];

    const ul = document.getElementById('week-tasks');
    ul.innerHTML = '';

    const weekData = PROGRAM[currentWeek];
    weekData.tasks.forEach(task => {
        // Find if completed today
        const isCompleted = completedTasks.some(t => t.task_id === task.id && t.completed_date === todayStr);

        const li = document.createElement('li');
        li.className = 'flex items-start gap-2 cursor-pointer hover:bg-tactical-700 p-1 transition-colors';
        li.innerHTML = `
            <div class="mt-0.5 text-tactical-accent">
                ${isCompleted ? '[X]' : '[ ]'}
            </div>
            <div class="${isCompleted ? 'line-through text-tactical-700' : 'text-tactical-text'}">
                ${task.text}
            </div>
        `;

        li.onclick = async () => {
            await fetchAPI(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ week: currentWeek, task_id: task.id, completed_date: todayStr })
            });
            loadTasks();
        };
        ul.appendChild(li);
    });
}

// --- Mood Logs ---
async function loadMoods() {
    const res = await fetchAPI(`${API_BASE}/mood_logs`);
    const tbody = document.querySelector('#mood-table tbody');
    tbody.innerHTML = '';
    if(res && res.data) {
        res.data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${escapeHTML(row.date)}</td><td>${escapeHTML(row.activity)}</td><td>${escapeHTML(row.mood_before)}</td><td>${escapeHTML(row.mood_after)}</td><td>${escapeHTML(row.notes)}</td>`;
            tbody.appendChild(tr);
        });
    }
}

document.getElementById('mood-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        date: document.getElementById('mood-date').value,
        activity: document.getElementById('mood-activity').value,
        mood_before: parseInt(document.getElementById('mood-before').value),
        mood_after: parseInt(document.getElementById('mood-after').value),
        notes: document.getElementById('mood-notes').value
    };
    await fetchAPI(`${API_BASE}/mood_logs`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    e.target.reset();
    document.getElementById('mood-date').value = todayStr;
    loadMoods();
});

// --- ABC Logs ---
async function loadABC() {
    const res = await fetchAPI(`${API_BASE}/abc_logs`);
    const tbody = document.querySelector('#abc-table tbody');
    tbody.innerHTML = '';
    if(res && res.data) {
        res.data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${escapeHTML(row.date)}</td><td>${escapeHTML(row.situation)}</td><td>${escapeHTML(row.thought)}</td><td>${escapeHTML(row.emotion)}</td><td>${escapeHTML(row.behavior)}</td><td>${escapeHTML(row.distortions)}</td>`;
            tbody.appendChild(tr);
        });
    }
}

document.getElementById('abc-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const checked = Array.from(document.querySelectorAll('#distortions-checkboxes input:checked')).map(cb => cb.value).join(', ');
    const data = {
        date: document.getElementById('abc-date').value,
        situation: document.getElementById('abc-situation').value,
        thought: document.getElementById('abc-thought').value,
        emotion: document.getElementById('abc-emotion').value,
        behavior: document.getElementById('abc-behavior').value,
        distortions: checked
    };
    await fetchAPI(`${API_BASE}/abc_logs`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    e.target.reset();
    document.getElementById('abc-date').value = todayStr;
    loadABC();
});

// --- Restructuring Logs ---
async function loadRestructuring() {
    const res = await fetchAPI(`${API_BASE}/restructuring_logs`);
    const tbody = document.querySelector('#rest-table tbody');
    tbody.innerHTML = '';
    if(res && res.data) {
        res.data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${escapeHTML(row.date)}</td><td>${escapeHTML(row.original_thought)}</td><td>${escapeHTML(row.evidence_for)}</td><td>${escapeHTML(row.evidence_against)}</td><td>${escapeHTML(row.alternative_thought)}</td><td>${escapeHTML(row.emotion_before)} -> ${escapeHTML(row.emotion_after)}</td>`;
            tbody.appendChild(tr);
        });
    }
}

document.getElementById('restructuring-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        date: document.getElementById('rest-date').value,
        original_thought: document.getElementById('rest-thought').value,
        evidence_for: document.getElementById('rest-for').value,
        evidence_against: document.getElementById('rest-against').value,
        alternative_thought: document.getElementById('rest-alt').value,
        emotion_before: parseInt(document.getElementById('rest-emo-before').value),
        emotion_after: parseInt(document.getElementById('rest-emo-after').value)
    };
    await fetchAPI(`${API_BASE}/restructuring_logs`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    e.target.reset();
    document.getElementById('rest-date').value = todayStr;
    loadRestructuring();
});

// --- Experiments ---
async function loadExperiments() {
    const res = await fetchAPI(`${API_BASE}/experiments`);
    const tbody = document.querySelector('#exp-table tbody');
    tbody.innerHTML = '';
    if(res && res.data) {
        res.data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${escapeHTML(row.date)}</td><td>${escapeHTML(row.experiment)}</td><td>${escapeHTML(row.prediction)}</td><td>${escapeHTML(row.result || '-')}</td><td>${escapeHTML(row.conclusion || '-')}</td>`;
            tbody.appendChild(tr);
        });
    }
}

document.getElementById('exp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        date: document.getElementById('exp-date').value,
        experiment: document.getElementById('exp-action').value,
        prediction: document.getElementById('exp-prediction').value,
        result: document.getElementById('exp-result').value,
        conclusion: document.getElementById('exp-conclusion').value
    };
    await fetchAPI(`${API_BASE}/experiments`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    e.target.reset();
    document.getElementById('exp-date').value = todayStr;
    loadExperiments();
});

// --- Exposures ---
async function loadExposures() {
    const res = await fetchAPI(`${API_BASE}/exposures`);
    const tbody = document.querySelector('#expo-table tbody');
    tbody.innerHTML = '';
    if(res && res.data) {
        res.data.forEach(row => {
            const tr = document.createElement('tr');
            const status = row.completed ? '<span class="text-tactical-accent">ВЫПОЛНЕНО</span>' : '<span class="text-tactical-alert">ОЖИДАНИЕ</span>';

            tr.innerHTML = `
                <td class="font-bold text-center">${escapeHTML(row.suds_expected)}</td>
                <td>${escapeHTML(row.situation)}</td>
                <td class="text-center">
                    <input type="number" min="0" max="100" class="w-16 text-center text-tactical-900 bg-tactical-text rounded" value="${escapeHTML(row.suds_actual || '')}" onchange="updateExposure(${escapeHTML(row.id)}, this.value, ${escapeHTML(row.completed)})">
                </td>
                <td class="text-center cursor-pointer font-bold" onclick="updateExposure(${escapeHTML(row.id)}, ${escapeHTML(row.suds_actual || null)}, ${!row.completed})">${status}</td>
                <td class="text-center text-xs">
                   Сохраняется авто
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

async function updateExposure(id, suds_actual, completed) {
    await fetchAPI(`${API_BASE}/exposures/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            suds_actual: suds_actual ? parseInt(suds_actual) : null,
            completed: completed ? 1 : 0
        })
    });
    loadExposures();
}

document.getElementById('exposures-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        situation: document.getElementById('expo-sit').value,
        suds_expected: parseInt(document.getElementById('expo-suds-exp').value),
        suds_actual: null
    };
    await fetchAPI(`${API_BASE}/exposures`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    e.target.reset();
    loadExposures();
});

// Start app
initApp();

// Fix XSS
function escapeHTML(str) {
    if(!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
