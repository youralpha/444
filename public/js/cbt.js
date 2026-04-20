const PROGRAM_WEEKS = [
    {
        title: "Неделя 1: Введение в КПТ и мониторинг",
        goals: "Понимание связи между мыслями, эмоциями и поведением. Начало мониторинга настроения.",
        practice: "Ведение дневника активности и настроения.",
        tasks: [
            { id: "w1_t1", text: "Прочитать вводные материалы по КПТ" },
            { id: "w1_t2", text: "Заполнять дневник активности ежедневно" }
        ]
    },
    {
        title: "Неделя 2: Распознавание автоматических мыслей",
        goals: "Научиться отслеживать негативные автоматические мысли (НАМ).",
        practice: "Использование ABC-модели (СМЭР).",
        tasks: [
            { id: "w2_t1", text: "Записать минимум 3 ситуации в дневник ABC" },
            { id: "w2_t2", text: "Изучить список когнитивных искажений" }
        ]
    },
    {
        title: "Неделя 3: Когнитивная реструктуризация",
        goals: "Оспаривание НАМ и поиск альтернативных, более реалистичных мыслей.",
        practice: "Заполнение таблицы диспута.",
        tasks: [
            { id: "w3_t1", text: "Провести переоценку 2-х горячих мыслей" }
        ]
    },
    {
        title: "Неделя 4: Поведенческие эксперименты",
        goals: "Проверка убеждений на практике.",
        practice: "Планирование и проведение поведенческих экспериментов.",
        tasks: [
            { id: "w4_t1", text: "Спланировать 1 поведенческий эксперимент" },
            { id: "w4_t2", text: "Зафиксировать результаты эксперимента" }
        ]
    },
    {
        title: "Неделя 5: Работа с избеганием и Экспозиция",
        goals: "Постепенное столкновение с пугающими ситуациями.",
        practice: "Составление иерархии страхов и начало работы по ней.",
        tasks: [
            { id: "w5_t1", text: "Составить иерархию страхов" },
            { id: "w5_t2", text: "Выполнить первый шаг экспозиции" }
        ]
    },
    {
        title: "Неделя 6: Решение проблем",
        goals: "Освоение структурированного подхода к решению проблем.",
        practice: "Применение 6-шагового алгоритма.",
        tasks: [
            { id: "w6_t1", text: "Применить алгоритм к 1 текущей проблеме" }
        ]
    },
    {
        title: "Неделя 7: Выявление и изменение глубинных убеждений",
        goals: "Работа с корневыми установками (правила и промежуточные убеждения).",
        practice: "Техника падающей стрелы.",
        tasks: [
            { id: "w7_t1", text: "Провести технику 'Стрелка вниз' для 1 ситуации" }
        ]
    },
    {
        title: "Неделя 8: Профилактика срывов и поддержание результатов",
        goals: "Закрепление навыков и план действий при откатах.",
        practice: "Составление плана профилактики.",
        tasks: [
            { id: "w8_t1", text: "Составить план профилактики срывов" },
            { id: "w8_t2", text: "Подвести итоги 8 недель" }
        ]
    }
];

const CBT_DISTORTIONS = [
    "Черно-белое мышление", "Чтение мыслей", "Предсказание будущего",
    "Катастрофизация", "Обесценивание позитивного", "Эмоциональное обоснование",
    "Навешивание ярлыков", "Персонализация", "Долженствование", "Сверхобобщение"
];

// Setup CBT Navigation
document.querySelectorAll('.cbt-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.cbt-tab-btn').forEach(b => {
            b.classList.replace('bg-purple-600', 'bg-slate-800');
            b.classList.replace('text-white', 'text-slate-400');
        });
        e.target.classList.replace('bg-slate-800', 'bg-purple-600');
        e.target.classList.replace('text-slate-400', 'text-white');

        document.querySelectorAll('.cbt-content').forEach(c => c.classList.add('hidden'));
        document.getElementById(e.target.dataset.cbtTarget).classList.remove('hidden');
    });
});

async function saveCbtData(type, data) {
    try {
        setSyncStatus(true);
        await api.post('/cbt', { id: data.id, type, data });
        state.cbt = await api.get('/cbt');
        renderCBT();
        showToast('Сохранено');
    } catch (e) {
        showToast('Ошибка сохранения', true);
    } finally {
        setSyncStatus(false);
    }
}

function deleteCbtData(id) {
    showConfirmModal('Удаление', 'Удалить запись?', async () => {
        try {
            setSyncStatus(true);
            await api.delete(`/cbt/${id}`);
            state.cbt = await api.get('/cbt');
            renderCBT();
            showToast('Удалено');
        } catch (e) {
            showToast('Ошибка удаления', true);
        } finally {
            setSyncStatus(false);
        }
    });
}

function renderCBT() {
    renderProgram();
    renderTracker();
    renderList('mood', 'cbt-mood-list', renderMoodCard);
    renderList('abc', 'cbt-abc-list', renderAbcCard);
    renderList('restructuring', 'cbt-restructuring-list', renderRestructuringCard);
    renderList('exposures', 'cbt-exposures-list', renderExposureCard);
    renderList('problems', 'cbt-problems-list', renderProblemCard);
    renderList('beliefs', 'cbt-beliefs-list', renderBeliefCard);
    renderRelapse();
}

function renderProgram() {
    const list = document.getElementById('cbt-program-list');
    list.innerHTML = '';
    PROGRAM_WEEKS.forEach(week => {
        list.innerHTML += `
            <div class="bg-slate-800 p-4 rounded border border-slate-700">
                <h4 class="font-bold text-purple-400 mb-2">${week.title}</h4>
                <p class="text-sm text-slate-300 mb-1"><span class="font-bold">Цели:</span> ${week.goals}</p>
                <p class="text-sm text-slate-300"><span class="font-bold">Практика:</span> ${week.practice}</p>
            </div>
        `;
    });
}

function renderTracker() {
    const container = document.getElementById('cbt-tracker-container');
    container.innerHTML = '';

    let trackers = state.cbt['tracker'] || [];
    let trackerData = trackers.length > 0 ? trackers[0] : { id: 'tracker_1', tasks: {} };

    PROGRAM_WEEKS.forEach((week, wIndex) => {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'bg-slate-800 p-4 rounded border border-slate-700';
        weekDiv.innerHTML = `<h4 class="font-bold text-purple-400 mb-2">Неделя ${wIndex + 1}</h4>`;

        week.tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'mb-2';
            taskDiv.innerHTML = `<div class="text-sm text-slate-300 mb-1">${task.text}</div>`;

            const daysDiv = document.createElement('div');
            daysDiv.className = 'flex gap-2';

            for (let d = 1; d <= 7; d++) {
                const dayBtn = document.createElement('button');
                const isDone = trackerData.tasks[task.id] && trackerData.tasks[task.id][d];
                dayBtn.className = `w-6 h-6 rounded flex items-center justify-center text-xs ${isDone ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`;
                dayBtn.textContent = d;
                dayBtn.onclick = () => {
                    if (!trackerData.tasks) trackerData.tasks = {};
                    if (!trackerData.tasks[task.id]) trackerData.tasks[task.id] = {};
                    trackerData.tasks[task.id][d] = !isDone;
                    saveCbtData('tracker', trackerData);
                };
                daysDiv.appendChild(dayBtn);
            }
            taskDiv.appendChild(daysDiv);
            weekDiv.appendChild(taskDiv);
        });
        container.appendChild(weekDiv);
    });
}

function renderList(type, containerId, renderCardFn) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    const items = state.cbt[type] || [];

    // Sort logic
    if (type === 'exposures') {
        items.sort((a, b) => a.suds - b.suds);
    } else {
        items.sort((a, b) => b.id - a.id); // descending by id/time
    }

    if (items.length === 0) {
        container.innerHTML = '<div class="text-sm text-slate-500">Нет записей</div>';
        return;
    }

    items.forEach(item => {
        container.innerHTML += renderCardFn(item);
    });
}

function renderMoodCard(item) {
    return `
    <div class="bg-slate-800 p-3 rounded border border-slate-700 relative">
        <div class="text-xs text-slate-500 mb-1">${item.date}</div>
        <div class="font-bold text-slate-200">${item.activity}</div>
        <div class="text-sm mt-2 flex gap-4">
            <span class="text-slate-400">До: <span class="text-white">${item.moodBefore}/10</span></span>
            <span class="text-slate-400">После: <span class="text-white">${item.moodAfter}/10</span></span>
        </div>
        ${item.notes ? `<div class="text-xs text-slate-400 mt-2 bg-slate-900/50 p-2 rounded">${item.notes}</div>` : ''}
        <button onclick="deleteCbtData('${item.id}')" class="absolute top-2 right-2 text-slate-500 hover:text-red-500">✕</button>
    </div>`;
}

function renderAbcCard(item) {
    const distortions = item.selectedDistortions ? item.selectedDistortions.map(d => `<span class="cbt-distortion-chip selected mr-1 mb-1 inline-block">${d}</span>`).join('') : '';
    return `
    <div class="bg-slate-800 p-3 rounded border border-slate-700 relative">
        <div class="text-xs text-slate-500 mb-1">${item.date}</div>
        <div class="text-sm mb-1"><span class="text-slate-400">A (Ситуация):</span> ${escapeHtml(item.situation)}</div>
        <div class="text-sm mb-1"><span class="text-purple-400 font-bold">B (Мысль):</span> ${item.thought}</div>
        <div class="text-sm mb-2"><span class="text-slate-400">C (Эмоция):</span> ${item.emotion} (${item.emotionIntensity}%)</div>
        ${distortions ? `<div class="mt-2">${distortions}</div>` : ''}
        <button onclick="deleteCbtData('${item.id}')" class="absolute top-2 right-2 text-slate-500 hover:text-red-500">✕</button>
    </div>`;
}

function renderRestructuringCard(item) {
    return `
    <div class="bg-slate-800 p-3 rounded border border-slate-700 relative">
        <div class="text-xs text-slate-500 mb-1">${item.date}</div>
        <div class="text-sm mb-1"><span class="text-red-400">Горячая мысль:</span> ${item.hotThought}</div>
        <div class="text-sm mb-1"><span class="text-emerald-400">ЗА:</span> ${item.evidenceFor}</div>
        <div class="text-sm mb-1"><span class="text-orange-400">ПРОТИВ:</span> ${item.evidenceAgainst}</div>
        <div class="text-sm mt-2 p-2 bg-slate-900/50 rounded border border-purple-900/50">
            <span class="text-purple-400 font-bold">Альтернатива:</span> ${item.alternative}
            <div class="text-xs text-slate-400 mt-1">Новая интенсивность: ${item.newEmotionIntensity}%</div>
        </div>
        <button onclick="deleteCbtData('${item.id}')" class="absolute top-2 right-2 text-slate-500 hover:text-red-500">✕</button>
    </div>`;
}

function renderExposureCard(item) {
    return `
    <div class="bg-slate-800 p-3 rounded border ${item.completed ? 'border-emerald-500/50' : 'border-slate-700'} relative">
        <div class="flex justify-between items-center mb-2 pr-6">
            <div class="font-bold text-slate-200">${escapeHtml(item.situation)}</div>
            <div class="text-sm font-bold text-orange-400">SUDs: ${item.suds}</div>
        </div>
        <div class="text-sm mb-1"><span class="text-slate-400">Ожидание:</span> ${item.expectation}</div>
        <div class="text-sm mb-1"><span class="text-slate-400">Факт:</span> ${item.fact || '...'}</div>
        <div class="text-sm mb-2"><span class="text-slate-400">Вывод:</span> ${item.conclusion || '...'}</div>
        <button onclick="toggleExposureComplete('${item.id}')" class="text-xs bg-slate-700 px-2 py-1 rounded hover:bg-slate-600">${item.completed ? 'Отменить' : 'Выполнено'}</button>
        <button onclick="deleteCbtData('${item.id}')" class="absolute top-2 right-2 text-slate-500 hover:text-red-500">✕</button>
    </div>`;
}

async function toggleExposureComplete(id) {
    const item = state.cbt['exposures'].find(e => e.id === id);
    if (item) {
        item.completed = !item.completed;
        await saveCbtData('exposures', item);
    }
}

function renderProblemCard(item) {
    return `
    <div class="bg-slate-800 p-3 rounded border border-slate-700 relative">
        <div class="font-bold text-slate-200 mb-2 pr-6">${item.problem}</div>
        <div class="text-sm mb-1"><span class="text-slate-400">Идеи:</span> ${item.brainstorm}</div>
        <div class="text-sm mb-1"><span class="text-slate-400">Оценка:</span> ${item.evaluation}</div>
        <div class="text-sm mt-2 p-2 bg-slate-900/50 rounded border border-blue-900/50">
            <span class="text-blue-400 font-bold">План:</span> ${item.plan}
        </div>
        <button onclick="deleteCbtData('${item.id}')" class="absolute top-2 right-2 text-slate-500 hover:text-red-500">✕</button>
    </div>`;
}

function renderBeliefCard(item) {
    return `
    <div class="bg-slate-800 p-3 rounded border border-slate-700 relative">
        <div class="text-sm mb-1 pr-6"><span class="text-slate-400">Поверхностная мысль:</span> ${item.surfaceThought}</div>
        <div class="text-sm mb-1"><span class="text-slate-400">Шаги:</span> ${item.steps}</div>
        <div class="text-sm mt-2 p-2 bg-red-900/20 rounded border border-red-900/50 mb-2">
            <span class="text-red-400 font-bold">Глубинное убеждение:</span> ${item.coreBelief}
        </div>
        <div class="text-sm p-2 bg-emerald-900/20 rounded border border-emerald-900/50">
            <span class="text-emerald-400 font-bold">Новое убеждение:</span> ${item.newBelief}
        </div>
        <button onclick="deleteCbtData('${item.id}')" class="absolute top-2 right-2 text-slate-500 hover:text-red-500">✕</button>
    </div>`;
}

function renderRelapse() {
    let relapses = state.cbt['relapse'] || [];
    let r = relapses.length > 0 ? relapses[0] : { triggers: '', signs: '', action24h: '', action7d: '' };

    document.getElementById('cbt-relapse-content').innerHTML = `
        <div class="space-y-3 text-sm">
            <div><span class="text-slate-400 block mb-1">Триггеры:</span> <div class="bg-slate-900/50 p-2 rounded">${r.triggers || '...'}</div></div>
            <div><span class="text-slate-400 block mb-1">Ранние признаки:</span> <div class="bg-slate-900/50 p-2 rounded">${r.signs || '...'}</div></div>
            <div><span class="text-emerald-400 block mb-1">План на 24 часа:</span> <div class="bg-slate-900/50 p-2 rounded">${r.action24h || '...'}</div></div>
            <div><span class="text-blue-400 block mb-1">План на 7 дней:</span> <div class="bg-slate-900/50 p-2 rounded">${r.action7d || '...'}</div></div>
        </div>
    `;
}

// Modal Form Generators
function openCbtModal(type) {
    let html = '';
    const id = Date.now().toString();
    const now = new Date().toLocaleString('ru-RU');

    if (type === 'mood') {
        html = `
            <h3 class="text-xl text-emerald-400 mb-4">Дневник активности</h3>
            <form id="cbt-form" class="space-y-4" data-type="mood">
                <input type="hidden" id="cbt-id" value="${id}">
                <input type="hidden" id="cbt-date" value="${now}">
                <div><label class="text-xs text-slate-400">Активность</label><input type="text" id="cbt-activity" class="military-input" required></div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="text-xs text-slate-400">Настроение ДО (0-10)</label><input type="number" id="cbt-before" min="0" max="10" class="military-input" required></div>
                    <div><label class="text-xs text-slate-400">Настроение ПОСЛЕ (0-10)</label><input type="number" id="cbt-after" min="0" max="10" class="military-input" required></div>
                </div>
                <div><label class="text-xs text-slate-400">Заметки</label><textarea id="cbt-notes" class="military-input h-16"></textarea></div>
                ${modalFooter()}
            </form>`;
    } else if (type === 'abc') {
        const distortionsHtml = CBT_DISTORTIONS.map(d => `
            <label class="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/50 p-1 rounded border border-slate-700 cursor-pointer">
                <input type="checkbox" name="distortions" value="${d}" class="accent-purple-500"> ${d}
            </label>
        `).join('');

        html = `
            <h3 class="text-xl text-emerald-400 mb-4">СМЭР (ABC Модель)</h3>
            <form id="cbt-form" class="space-y-4" data-type="abc">
                <input type="hidden" id="cbt-id" value="${id}">
                <input type="hidden" id="cbt-date" value="${now}">
                <div><label class="text-xs text-slate-400">A - Ситуация (Что произошло?)</label><textarea id="cbt-situation" class="military-input h-16" required></textarea></div>
                <div><label class="text-xs text-purple-400">B - Мысль (Что я подумал?)</label><textarea id="cbt-thought" class="military-input h-16 border-purple-500/50" required></textarea></div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="text-xs text-slate-400">C - Эмоция</label><input type="text" id="cbt-emotion" class="military-input" required></div>
                    <div><label class="text-xs text-slate-400">Интенсивность (0-100%)</label><input type="number" id="cbt-intensity" min="0" max="100" class="military-input" required></div>
                </div>
                <div><label class="text-xs text-slate-400">Поведение (Что я сделал?)</label><input type="text" id="cbt-behavior" class="military-input"></div>
                <div><label class="text-xs text-slate-400 mb-2 block">Когнитивные искажения</label><div class="grid grid-cols-2 gap-2">${distortionsHtml}</div></div>
                ${modalFooter()}
            </form>`;
    } else if (type === 'restructuring') {
        const thoughts = (state.cbt['abc'] || []).map(a => `<option value="${a.thought}">${a.thought}</option>`).join('');
        html = `
            <h3 class="text-xl text-emerald-400 mb-4">Переоценка мыслей</h3>
            <form id="cbt-form" class="space-y-4" data-type="restructuring">
                <input type="hidden" id="cbt-id" value="${id}">
                <input type="hidden" id="cbt-date" value="${now}">
                <div><label class="text-xs text-slate-400">Горячая мысль</label>
                    <select id="cbt-hotthought" class="military-input mb-2">${thoughts}</select>
                    <input type="text" id="cbt-hotthought-manual" class="military-input" placeholder="Или введите вручную">
                </div>
                <div><label class="text-xs text-emerald-400">Доказательства ЗА</label><textarea id="cbt-for" class="military-input h-16"></textarea></div>
                <div><label class="text-xs text-orange-400">Доказательства ПРОТИВ</label><textarea id="cbt-against" class="military-input h-16"></textarea></div>
                <div><label class="text-xs text-purple-400">Сбалансированная (альтернативная) мысль</label><textarea id="cbt-alt" class="military-input h-20 border-purple-500/50" required></textarea></div>
                <div><label class="text-xs text-slate-400">Новая интенсивность эмоции (0-100%)</label><input type="number" id="cbt-newintensity" min="0" max="100" class="military-input" required></div>
                ${modalFooter()}
            </form>`;
    } else if (type === 'exposures') {
        html = `
            <h3 class="text-xl text-emerald-400 mb-4">Добавить Экспозицию</h3>
            <form id="cbt-form" class="space-y-4" data-type="exposures">
                <input type="hidden" id="cbt-id" value="${id}">
                <div><label class="text-xs text-slate-400">Пугающая ситуация</label><input type="text" id="cbt-situation" class="military-input" required></div>
                <div><label class="text-xs text-orange-400">Ожидаемый уровень тревоги (SUDs 0-100)</label><input type="number" id="cbt-suds" min="0" max="100" class="military-input" required></div>
                <div><label class="text-xs text-slate-400">Ожидание (Чего я боюсь?)</label><textarea id="cbt-exp" class="military-input h-16"></textarea></div>
                <div><label class="text-xs text-slate-400">Факт (Что произошло?)</label><textarea id="cbt-fact" class="military-input h-16"></textarea></div>
                <div><label class="text-xs text-slate-400">Вывод</label><textarea id="cbt-conc" class="military-input h-16"></textarea></div>
                ${modalFooter()}
            </form>`;
    } else if (type === 'problems') {
        html = `
            <h3 class="text-xl text-emerald-400 mb-4">Решение проблем</h3>
            <form id="cbt-form" class="space-y-4" data-type="problems">
                <input type="hidden" id="cbt-id" value="${id}">
                <div><label class="text-xs text-slate-400">Четко сформулируйте проблему</label><input type="text" id="cbt-prob" class="military-input" required></div>
                <div><label class="text-xs text-slate-400">Мозговой штурм (все идеи)</label><textarea id="cbt-brain" class="military-input h-16"></textarea></div>
                <div><label class="text-xs text-slate-400">Оценка идей</label><textarea id="cbt-eval" class="military-input h-16"></textarea></div>
                <div><label class="text-xs text-blue-400">План действий</label><textarea id="cbt-plan" class="military-input h-20 border-blue-500/50" required></textarea></div>
                ${modalFooter()}
            </form>`;
    } else if (type === 'beliefs') {
        html = `
            <h3 class="text-xl text-emerald-400 mb-4">Стрелка вниз (Убеждения)</h3>
            <form id="cbt-form" class="space-y-4" data-type="beliefs">
                <input type="hidden" id="cbt-id" value="${id}">
                <div><label class="text-xs text-slate-400">Поверхностная мысль</label><input type="text" id="cbt-surf" class="military-input" required></div>
                <div><label class="text-xs text-slate-400">Шаги ("И что это значит для меня?")</label><textarea id="cbt-steps" class="military-input h-20"></textarea></div>
                <div><label class="text-xs text-red-400">Выявленное глубинное убеждение</label><input type="text" id="cbt-core" class="military-input border-red-500/50" required></div>
                <div><label class="text-xs text-emerald-400">Новое, адаптивное убеждение</label><input type="text" id="cbt-new" class="military-input border-emerald-500/50" required></div>
                ${modalFooter()}
            </form>`;
    } else if (type === 'relapse') {
        let relapses = state.cbt['relapse'] || [];
        let r = relapses.length > 0 ? relapses[0] : { triggers: '', signs: '', action24h: '', action7d: '' };
        html = `
            <h3 class="text-xl text-emerald-400 mb-4">План профилактики</h3>
            <form id="cbt-form" class="space-y-4" data-type="relapse">
                <input type="hidden" id="cbt-id" value="relapse_1">
                <div><label class="text-xs text-slate-400">Триггеры</label><textarea id="cbt-trig" class="military-input h-16">${r.triggers}</textarea></div>
                <div><label class="text-xs text-slate-400">Ранние признаки срыва</label><textarea id="cbt-signs" class="military-input h-16">${r.signs}</textarea></div>
                <div><label class="text-xs text-emerald-400">План действий (первые 24ч)</label><textarea id="cbt-24h" class="military-input h-16">${r.action24h}</textarea></div>
                <div><label class="text-xs text-blue-400">План действий (до 7 дней)</label><textarea id="cbt-7d" class="military-input h-16">${r.action7d}</textarea></div>
                ${modalFooter()}
            </form>`;
    }

    openModal(html);

    document.getElementById('cbt-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = e.target.dataset.type;
        let data = {};

        if (type === 'mood') {
            data = {
                id: document.getElementById('cbt-id').value,
                date: document.getElementById('cbt-date').value,
                activity: document.getElementById('cbt-activity').value,
                moodBefore: document.getElementById('cbt-before').value,
                moodAfter: document.getElementById('cbt-after').value,
                notes: document.getElementById('cbt-notes').value
            };
        } else if (type === 'abc') {
            const dist = Array.from(document.querySelectorAll('input[name="distortions"]:checked')).map(el => el.value);
            data = {
                id: document.getElementById('cbt-id').value,
                date: document.getElementById('cbt-date').value,
                situation: document.getElementById('cbt-situation').value,
                thought: document.getElementById('cbt-thought').value,
                emotion: document.getElementById('cbt-emotion').value,
                emotionIntensity: document.getElementById('cbt-intensity').value,
                behavior: document.getElementById('cbt-behavior').value,
                selectedDistortions: dist
            };
        } else if (type === 'restructuring') {
            const man = document.getElementById('cbt-hotthought-manual').value;
            const sel = document.getElementById('cbt-hotthought').value;
            data = {
                id: document.getElementById('cbt-id').value,
                date: document.getElementById('cbt-date').value,
                hotThought: man || sel,
                evidenceFor: document.getElementById('cbt-for').value,
                evidenceAgainst: document.getElementById('cbt-against').value,
                alternative: document.getElementById('cbt-alt').value,
                newEmotionIntensity: document.getElementById('cbt-newintensity').value
            };
        } else if (type === 'exposures') {
            data = {
                id: document.getElementById('cbt-id').value,
                situation: document.getElementById('cbt-situation').value,
                suds: parseInt(document.getElementById('cbt-suds').value),
                expectation: document.getElementById('cbt-exp').value,
                fact: document.getElementById('cbt-fact').value,
                conclusion: document.getElementById('cbt-conc').value,
                completed: false
            };
        } else if (type === 'problems') {
            data = {
                id: document.getElementById('cbt-id').value,
                problem: document.getElementById('cbt-prob').value,
                brainstorm: document.getElementById('cbt-brain').value,
                evaluation: document.getElementById('cbt-eval').value,
                plan: document.getElementById('cbt-plan').value,
                status: 'Актуально'
            };
        } else if (type === 'beliefs') {
            data = {
                id: document.getElementById('cbt-id').value,
                surfaceThought: document.getElementById('cbt-surf').value,
                steps: document.getElementById('cbt-steps').value,
                coreBelief: document.getElementById('cbt-core').value,
                newBelief: document.getElementById('cbt-new').value
            };
        } else if (type === 'relapse') {
            data = {
                id: document.getElementById('cbt-id').value,
                triggers: document.getElementById('cbt-trig').value,
                signs: document.getElementById('cbt-signs').value,
                action24h: document.getElementById('cbt-24h').value,
                action7d: document.getElementById('cbt-7d').value
            };
        }

        saveCbtData(type, data);
        closeModal();
    });
}

function modalFooter() {
    return `<div class="flex justify-end pt-4 space-x-2">
                <button type="button" onclick="closeModal()" class="text-slate-400 hover:text-white px-3 py-1">Отмена</button>
                <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 rounded">Сохранить</button>
            </div>`;
}
