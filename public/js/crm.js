function openContactModal(contact = null) {
    const isNew = !contact;
    const c = contact || {
        id: 'c_' + Date.now(),
        name: '', callsign: '', role: '', circle: 4, contact: '',
        last_date: '', next_date: '', notes: '',
        m: '', i: '', c_motiv: '', e: '', value: '', give: '', links: []
    };

    const linksHtml = state.network
        .filter(n => n.id !== c.id)
        .map(n => `
            <label class="flex items-center gap-2 p-2 hover:bg-slate-700 cursor-pointer">
                <input type="checkbox" name="contact-links" value="${n.id}" class="accent-emerald-500" ${c.links.includes(n.id) ? 'checked' : ''}>
                <span class="text-sm text-slate-300">${n.name} ${n.callsign ? `("${n.callsign}")` : ''}</span>
            </label>
        `).join('');

    const html = `
        <h3 class="text-xl text-emerald-400 mb-4">${isNew ? 'Новый контакт' : 'Досье контакта'}</h3>
        <form id="contact-form" class="space-y-4">
            <input type="hidden" id="c-id" value="${c.id}">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-xs text-slate-400">Имя</label>
                    <input type="text" id="c-name" class="military-input" value="${c.name}" required>
                </div>
                <div>
                    <label class="text-xs text-slate-400">Позывной</label>
                    <input type="text" id="c-callsign" class="military-input" value="${c.callsign}">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-xs text-slate-400">Роль/Должность</label>
                    <input type="text" id="c-role" class="military-input" value="${c.role}">
                </div>
                <div>
                    <label class="text-xs text-slate-400">Круг доступа (1-4)</label>
                    <select id="c-circle" class="military-input">
                        <option value="1" ${c.circle == 1 ? 'selected' : ''}>1 - Ближний</option>
                        <option value="2" ${c.circle == 2 ? 'selected' : ''}>2 - Рабочий</option>
                        <option value="3" ${c.circle == 3 ? 'selected' : ''}>3 - Широкий</option>
                        <option value="4" ${c.circle == 4 ? 'selected' : ''}>4 - Дальний</option>
                    </select>
                </div>
            </div>

            <!-- Dates -->
             <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-xs text-slate-400">Последний контакт</label>
                    <input type="date" id="c-last-date" class="military-input" value="${c.last_date}">
                </div>
                <div>
                    <label class="text-xs text-slate-400">Следующий шаг</label>
                    <input type="date" id="c-next-date" class="military-input" value="${c.next_date}">
                </div>
            </div>

            <div class="border border-slate-700 p-3 rounded">
                <h4 class="text-sm text-emerald-500 mb-2">M.I.C.E. Профиль</h4>
                <div class="space-y-2">
                    <input type="text" id="c-m" class="military-input text-xs" placeholder="M: Money (Финансы)" value="${c.m}">
                    <input type="text" id="c-i" class="military-input text-xs" placeholder="I: Ideology (Идеология)" value="${c.i}">
                    <input type="text" id="c-c" class="military-input text-xs" placeholder="C: Compromise (Уязвимости)" value="${c.c_motiv || c.c || ''}">
                    <input type="text" id="c-e" class="military-input text-xs" placeholder="E: Ego (Эго)" value="${c.e}">
                </div>
            </div>

            <div>
                <label class="text-xs text-slate-400">Асимметричная ценность</label>
                <textarea id="c-value" class="military-input h-16 text-sm" placeholder="Чем полезен?">${c.value}</textarea>
            </div>
            <div>
                <label class="text-xs text-slate-400">Стратегия 'Дающего'</label>
                <textarea id="c-give" class="military-input h-16 text-sm" placeholder="Что могу дать я?">${c.give}</textarea>
            </div>

            <div>
                <label class="text-xs text-slate-400">Связи</label>
                <div class="border border-slate-700 rounded max-h-32 overflow-y-auto mt-1 bg-slate-900/50">
                    ${linksHtml || '<div class="p-2 text-xs text-slate-500">Нет других контактов</div>'}
                </div>
            </div>

            <div class="flex justify-between pt-4">
                ${!isNew ? `<button type="button" onclick="deleteContact('${c.id}')" class="text-red-500 hover:text-red-400 text-sm">Удалить</button>` : '<div></div>'}
                <div class="space-x-2">
                    <button type="button" onclick="closeModal()" class="text-slate-400 hover:text-white px-3 py-1">Отмена</button>
                    <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 rounded">Сохранить</button>
                </div>
            </div>
        </form>
    `;

    openModal(html);

    document.getElementById('contact-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedLinks = Array.from(document.querySelectorAll('input[name="contact-links"]:checked')).map(el => el.value);

        const data = {
            id: document.getElementById('c-id').value,
            name: document.getElementById('c-name').value,
            callsign: document.getElementById('c-callsign').value,
            role: document.getElementById('c-role').value,
            circle: parseInt(document.getElementById('c-circle').value),
            last_date: document.getElementById('c-last-date').value,
            next_date: document.getElementById('c-next-date').value,
            m: document.getElementById('c-m').value,
            i: document.getElementById('c-i').value,
            c: document.getElementById('c-c').value,
            e: document.getElementById('c-e').value,
            value: document.getElementById('c-value').value,
            give: document.getElementById('c-give').value,
            links: selectedLinks
        };

        try {
            setSyncStatus(true);
            if (isNew) {
                await api.post('/network', data);
            } else {
                await api.put(`/network/${data.id}`, data);
            }

            state.network = await api.get('/network');
            renderCRM();
            closeModal();
            showToast('Контакт сохранен');
        } catch (err) {
            showToast('Ошибка сохранения', true);
        } finally {
            setSyncStatus(false);
        }
    });
}

async function deleteContact(id) {
    if(!confirm('Удалить контакт?')) return;

    try {
        setSyncStatus(true);
        await api.delete(`/network/${id}`);
        state.network = await api.get('/network');
        renderCRM();
        closeModal();
        showToast('Контакт удален');
    } catch (e) {
        showToast('Ошибка удаления', true);
    } finally {
        setSyncStatus(false);
    }
}
