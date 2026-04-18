// API Service
const API_URL = '/api/v1';

const api = {
    async get(endpoint) {
        const res = await fetch(`${API_URL}${endpoint}`);
        if (!res.ok) throw new Error(`API GET Error: ${res.status}`);
        return res.json();
    },
    async post(endpoint, data) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`API POST Error: ${res.status}`);
        return res.json();
    },
    async put(endpoint, data) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`API PUT Error: ${res.status}`);
        return res.json();
    },
    async delete(endpoint) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(`API DELETE Error: ${res.status}`);
        return res.json();
    }
};

// Global State
const state = {
    currentDate: new Date(),
    selectedDateStr: '', // YYYY-MM-DD
    cycles: [],
    history: { completedTasks: [], taskData: {} },
    network: [],
    plan: { phase0: '', phase1: '' },
    cbt: {},
    timerStats: []
};

// Utils
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `px-4 py-2 rounded text-sm text-white shadow-lg transition-opacity duration-300 ${isError ? 'bg-red-600' : 'bg-emerald-600'}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setSyncStatus(syncing) {
    const dot = document.querySelector('.sync-dot');
    const text = document.querySelector('.sync-text');
    if (syncing) {
        dot.classList.replace('bg-slate-500', 'bg-yellow-500');
        dot.classList.add('animate-pulse');
        text.textContent = 'Синхронизация...';
    } else {
        dot.classList.replace('bg-yellow-500', 'bg-slate-500');
        dot.classList.remove('animate-pulse');
        text.textContent = 'Синхронизировано';
    }
}

// Data Fetching
async function loadDataForDate(dateStr) {
    state.selectedDateStr = dateStr;
    document.getElementById('current-date-display').textContent = dateStr;
    setSyncStatus(true);

    try {
        const [cycles, history, network, plan, cbt, timerStats] = await Promise.all([
            api.get('/cycles'),
            api.get(`/history/${dateStr}`),
            api.get('/network'),
            api.get('/plan'),
            api.get('/cbt'),
            api.get(`/timer/stats/${dateStr.substring(0, 7)}`)
        ]);

        state.cycles = cycles;
        state.history = history;
        state.network = network;
        state.plan = plan;
        state.cbt = cbt;
        state.timerStats = timerStats;

        updateUI();
    } catch (e) {
        showToast('Ошибка загрузки данных', true);
        console.error(e);
    } finally {
        setSyncStatus(false);
    }
}

// Calendar Logic
function renderCalendar(year, month) {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const monthYear = document.getElementById('cal-month-year');
    const date = new Date(year, month, 1);
    const monthName = date.toLocaleString('ru', { month: 'short' }).toUpperCase();
    monthYear.textContent = `${monthName} ${year}`;

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'p-2';
        grid.appendChild(cell);
    }

    const todayStr = formatDate(new Date());

    for (let i = 1; i <= daysInMonth; i++) {
        const cell = document.createElement('div');
        const cellDate = new Date(year, month, i);
        const cellDateStr = formatDate(cellDate);

        cell.className = `p-1 flex flex-col items-center justify-center cursor-pointer rounded hover:bg-slate-700 transition-colors ${cellDateStr === state.selectedDateStr ? 'bg-slate-700 border border-emerald-500' : 'bg-slate-800'}`;

        const daySpan = document.createElement('span');
        daySpan.className = `text-sm ${cellDateStr === todayStr ? 'text-emerald-400 font-bold' : 'text-slate-300'}`;
        daySpan.textContent = i;
        cell.appendChild(daySpan);

        const markerContainer = document.createElement('div');
        markerContainer.className = 'flex gap-0.5 mt-1 h-1';

        // Timer stats marker (Blue)
        if (state.timerStats && state.timerStats.some(s => s.date === cellDateStr && s.completed)) {
            const mBlue = document.createElement('div');
            mBlue.className = 'w-1 h-1 rounded-full bg-blue-500';
            markerContainer.appendChild(mBlue);
        }

        // CBT stats marker (Purple) - simplified logic for demo, assumes if tracker data exists for this day
        if (state.cbt && state.cbt.tracker && state.cbt.tracker.length > 0) {
           // We would need to map day 1-7 to actual dates or check if any cbt logs exist for this date
           // For now, let's just show it if there's any CBT activity logged on this date
        }

        cell.appendChild(markerContainer);

        cell.addEventListener('click', () => {
            loadDataForDate(cellDateStr);
            renderCalendar(state.currentDate.getFullYear(), state.currentDate.getMonth());
        });

        grid.appendChild(cell);
    }
}

// Navigation
function setupNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active', 'border-emerald-500', 'text-emerald-400');
                t.classList.add('border-transparent', 'text-slate-400');
            });
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active', 'border-emerald-500', 'text-emerald-400');
            tab.classList.remove('border-transparent', 'text-slate-400');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Modals
function openModal(contentHtml) {
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    content.innerHTML = contentHtml;
    container.classList.remove('hidden');
}

function closeModal() {
    const container = document.getElementById('modal-container');
    container.classList.add('hidden');
}

document.getElementById('modal-container').addEventListener('click', (e) => {
    if (e.target.id === 'modal-container') closeModal();
});

// View 1: Dashboard
async function toggleTask(taskId) {
    const idx = state.history.completedTasks.indexOf(taskId);
    if (idx > -1) {
        state.history.completedTasks.splice(idx, 1);
    } else {
        state.history.completedTasks.push(taskId);
    }

    try {
        await api.post(`/history/${state.selectedDateStr}`, {
            completedTasks: state.history.completedTasks,
            taskData: state.history.taskData
        });
        renderDashboard();
    } catch (e) {
        showToast('Ошибка сохранения задачи', true);
        if (idx > -1) state.history.completedTasks.push(taskId);
        else state.history.completedTasks.pop();
        renderDashboard();
    }
}

function renderDashboard() {
    const container = document.getElementById('cycles-container');
    container.innerHTML = '';

    let totalTasks = 0;
    let completedCount = 0;

    state.cycles.forEach(cycle => {
        if (!cycle.tasks || cycle.tasks.length === 0) return;

        const card = document.createElement('div');
        card.className = 'bg-slate-800 p-4 rounded border border-slate-700 flex flex-col';

        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-3';

        const title = document.createElement('h3');
        title.className = `font-bold ${cycle.color}`;
        title.textContent = cycle.title;
        header.appendChild(title);

        const addBtn = document.createElement('button');
        addBtn.className = 'text-xs text-slate-400 hover:text-emerald-400';
        addBtn.textContent = '+ Добавить';
        addBtn.onclick = () => openTaskModal(cycle.id);
        header.appendChild(addBtn);

        card.appendChild(header);

        const list = document.createElement('ul');
        list.className = 'space-y-2 flex-1';

        cycle.tasks.forEach(task => {
            totalTasks++;
            const isCompleted = state.history.completedTasks.includes(task.id);
            if (isCompleted) completedCount++;

            const li = document.createElement('li');
            li.className = 'flex items-start gap-2 text-sm';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'mt-1 cursor-pointer accent-emerald-500';
            checkbox.checked = isCompleted;
            checkbox.onchange = () => toggleTask(task.id);

            const textSpan = document.createElement('span');
            textSpan.className = `cursor-pointer flex-1 ${isCompleted ? 'line-through text-slate-500' : 'text-slate-300 hover:text-white transition-colors'}`;
            textSpan.textContent = task.text;
            textSpan.onclick = () => openTaskDetailsModal(task);

            li.appendChild(checkbox);
            li.appendChild(textSpan);

            if (task.time) {
                const timeSpan = document.createElement('span');
                timeSpan.className = 'text-xs text-slate-500 font-mono';
                timeSpan.textContent = task.time;
                li.appendChild(timeSpan);
            }

            list.appendChild(li);
        });

        card.appendChild(list);
        container.appendChild(card);
    });

    const percent = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
    document.getElementById('daily-progress-text').textContent = `${percent}%`;
    document.getElementById('daily-progress-bar').style.width = `${percent}%`;
}

// View 2: CRM
function renderCRM() {
    const circles = { 1: [], 2: [], 3: [], 4: [] };
    state.network.forEach(contact => {
        if (circles[contact.circle]) {
            circles[contact.circle].push(contact);
        }
    });

    for (let i = 1; i <= 4; i++) {
        const container = document.getElementById(`circle-${i}-container`);
        const list = document.getElementById(`circle-${i}-list`);
        if(!list) continue;
        list.innerHTML = '';

        if (circles[i].length > 0) {
            container.classList.remove('hidden');
            circles[i].forEach(contact => {
                const isOverdue = contact.next_date && new Date(contact.next_date) < state.currentDate;

                const card = document.createElement('div');
                card.className = `bg-slate-800 p-3 rounded border cursor-pointer hover:bg-slate-700 transition-colors ${isOverdue ? 'border-red-500/50' : 'border-slate-700'}`;
                card.onclick = () => openContactModal(contact);

                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-bold text-slate-200">${contact.name} ${contact.callsign ? `"${contact.callsign}"` : ''}</div>
                            <div class="text-xs text-slate-400 mt-1">${contact.role || 'Нет роли'}</div>
                        </div>
                        ${isOverdue ? '<span class="text-red-500 text-xs">⚠️</span>' : ''}
                    </div>
                `;
                list.appendChild(card);
            });
        } else {
            container.classList.add('hidden');
        }
    }
}

// View 3: Plan
function renderPlan() {
    document.getElementById('plan-phase0').value = state.plan.phase0 || '';
    document.getElementById('plan-phase1').value = state.plan.phase1 || '';
}

async function savePlan() {
    const phase0 = document.getElementById('plan-phase0').value;
    const phase1 = document.getElementById('plan-phase1').value;

    try {
        setSyncStatus(true);
        await api.put('/plan', { phase0, phase1 });
        state.plan = { phase0, phase1 };
        showToast('План сохранен');
    } catch (e) {
        showToast('Ошибка сохранения плана', true);
    } finally {
        setSyncStatus(false);
    }
}


// UI Update triggers
function updateUI() {
    renderDashboard();
    renderCRM();
    renderPlan();
    if (typeof renderCBT === 'function') {
        renderCBT();
    }
}

// Initialization
function init() {
    setupNavigation();

    document.getElementById('plan-phase0').addEventListener('blur', savePlan);
    document.getElementById('plan-phase1').addEventListener('blur', savePlan);
    document.getElementById('btn-save-plan').addEventListener('click', savePlan);

    const btnAddContact = document.getElementById('btn-add-contact');
    if(btnAddContact) btnAddContact.addEventListener('click', () => openContactModal());

    // Calendar Setup
    let currentMonth = state.currentDate.getMonth();
    let currentYear = state.currentDate.getFullYear();

    document.getElementById('cal-prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        state.currentDate.setFullYear(currentYear);
        state.currentDate.setMonth(currentMonth);
        renderCalendar(currentYear, currentMonth);
    });

    document.getElementById('cal-next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        state.currentDate.setFullYear(currentYear);
        state.currentDate.setMonth(currentMonth);
        renderCalendar(currentYear, currentMonth);
    });

    const todayStr = formatDate(new Date());
    renderCalendar(currentYear, currentMonth);
    loadDataForDate(todayStr);

    // DB Mgmt listeners
    document.getElementById('btn-export-db').addEventListener('click', async () => {
        try {
            const data = await api.get('/export');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `perimetr_backup_${formatDate(new Date())}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            showToast('Ошибка экспорта', true);
        }
    });

    document.getElementById('input-import-db').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                await api.post('/import', data);
                showToast('БД успешно импортирована. Перезагрузка...');
                setTimeout(() => location.reload(), 1500);
            } catch (err) {
                showToast('Ошибка импорта: неверный формат', true);
            }
        };
        reader.readAsText(file);
    });

    document.getElementById('btn-reset-db').addEventListener('click', async () => {
        if(confirm("Вы уверены, что хотите сбросить боевой ритм? Все кастомные задачи будут удалены!")) {
            try {
                await api.post('/reset-cycles', {});
                location.reload();
            } catch(e) {
                showToast('Ошибка сброса', true);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
