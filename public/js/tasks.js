function openTaskModal(cycleId) {
    const html = `
        <h3 class="text-xl text-emerald-400 mb-4">Новый протокол</h3>
        <form id="task-form" class="space-y-4">
            <input type="hidden" id="t-cycle" value="${cycleId}">
            <div>
                <label class="text-xs text-slate-400">Название задачи</label>
                <input type="text" id="t-text" class="military-input" required>
            </div>
            <div>
                <label class="text-xs text-slate-400">Норматив времени</label>
                <input type="text" id="t-time" class="military-input" placeholder="Например: 15:00 или 30 мин">
            </div>
            <div>
                <label class="text-xs text-slate-400">Описание / Инструкции</label>
                <textarea id="t-desc" class="military-input h-24 text-sm"></textarea>
            </div>

            <div class="flex justify-end pt-4 space-x-2">
                <button type="button" onclick="closeModal()" class="text-slate-400 hover:text-white px-3 py-1">Отмена</button>
                <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 rounded">Добавить</button>
            </div>
        </form>
    `;

    openModal(html);

    document.getElementById('task-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            id: 't_' + Date.now(),
            cycle_id: document.getElementById('t-cycle').value,
            text: document.getElementById('t-text').value,
            time: document.getElementById('t-time').value,
            description: document.getElementById('t-desc').value,
            fields: []
        };

        try {
            setSyncStatus(true);
            await api.post('/tasks', data);
            state.cycles = await api.get('/cycles');
            renderDashboard();
            closeModal();
            showToast('Задача добавлена');
        } catch (err) {
            showToast('Ошибка сохранения', true);
        } finally {
            setSyncStatus(false);
        }
    });
}

function openTaskDetailsModal(task) {
    const html = `
        <h3 class="text-xl text-emerald-400 mb-2">${task.text}</h3>
        <p class="text-sm text-slate-400 mb-4">${task.time || 'Нет времени'}</p>
        <div class="bg-slate-900/50 p-3 rounded mb-4 text-sm text-slate-300 min-h-[100px] whitespace-pre-wrap">
            ${task.description || 'Нет описания'}
        </div>

        <div class="flex justify-between pt-4 border-t border-slate-700">
            <button type="button" onclick="deleteTask('${task.id}')" class="text-red-500 hover:text-red-400 text-sm">Удалить задачу</button>
            <button type="button" onclick="closeModal()" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1 rounded">Закрыть</button>
        </div>
    `;
    openModal(html);
}

function deleteTask(id) {
    showConfirmModal('Удаление', 'Точно удалить задачу?', async () => {
        try {
            setSyncStatus(true);
            await api.delete('/tasks/' + id);
            state.cycles = await api.get('/cycles');
            renderDashboard();
            closeModal();
            showToast('Задача удалена');
        } catch (e) {
            showToast('Ошибка удаления', true);
        } finally {
            setSyncStatus(false);
        }
    });
}
