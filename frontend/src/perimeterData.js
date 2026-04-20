export const initialProtocolCycles = [
    {
        id: 'daily', title: 'Ежедневно', color: 'text-tactical-accent',
        tasks: [
            {
                id: 'd1', text: 'Утренний оперативный брифинг (ПОЛНЫЙ SAS)', time: '15 мин',
                description: '<p class="mb-2"><b>SAS (Situational Awareness Sync)</b> — проактивная синхронизация с миссией.</p>',
                fields: [
                    { id: 'sas_mission', label: '1. MISSION CHECK (Заполняется на главном экране)', type: 'textarea' },
                    { id: 'sas_bullets', label: '2. ТРИ ПУЛИ (Заполняется на главном экране)', type: 'textarea' },
                    { id: 'sas_anticipation', label: '3. АНТИЦИПАЦИЯ', type: 'textarea' },
                    { id: 'w', label: '4. W — WISH', type: 'input' },
                    { id: 'o1', label: '4. O — OUTCOME', type: 'input' },
                    { id: 'o2', label: '4. O — OBSTACLE', type: 'input' },
                    { id: 'p', label: '4. P — PLAN', type: 'textarea' }
                ]
            },
            { id: 'd2', text: 'OODA Loop (Цикл Бойда)', time: 'В моменте', description: '<p>Наблюдай → Ориентируйся → Решай → Действуй.</p>', fields: [{ id: 'ooda_count', label: 'Циклов за день', type: 'number' }, { id: 'ooda_decision', label: 'Ключевое решение', type: 'textarea' }] },
            { id: 'd4', text: 'Физиологический чек (H2F)', time: '2 мин', fields: [{ id: 'sleep', label: 'Сон (1-10)', type: 'number' }, { id: 'energy', label: 'Энергия (1-10)', type: 'number' }, { id: 'focus', label: 'Фокус (1-10)', type: 'number' }] },
            { id: 'd5', text: 'Teach-Back изученного', time: '15 мин', fields: [{ id: 'learned', label: 'Что понято?', type: 'textarea' }, { id: 'explained', label: 'Кому?', type: 'input' }] },
            {
                id: 'd6', text: 'EOD Дебрифинг (Протокол Отбоя)', time: '10 мин',
                description: `
                    <p class="mb-2"><b>End of Day (EOD) Debrief</b> — ритуал закрытия оперативного дня и отключения психики.</p>
                `,
                fields: [
                    { id: 'eod_dump', label: '1. BRAIN DUMP (Сброс мыслей)', type: 'textarea', placeholder: 'Что осталось висеть в голове? Выгрузи это сюда, чтобы не думать ночью.' },
                    { id: 'eod_aar', label: '2. МИКРО-AAR', type: 'textarea', placeholder: 'Выполнено ли утреннее WISH? Если нет, то почему (без оправданий)?' },
                    { id: 'eod_win', label: '3. ДОФАМИНОВАЯ ФИКСАЦИЯ', type: 'input', placeholder: 'Главная победа дня (даже микро-шаг)' }
                ]
            }
        ]
    },
    {
        id: 'weekly', title: 'Еженедельно', color: 'text-blue-400',
        tasks: [
            { id: 'w1', text: 'Тактический AAR', time: '30 мин', fields: [{ id: 'planned', label: 'План', type: 'textarea' }, { id: 'happened', label: 'Факт', type: 'textarea' }, { id: 'why', label: 'Почему?', type: 'textarea' }, { id: 'fix', label: 'Изменения', type: 'textarea' }] },
            { id: 'w2', text: 'ShadowBox-тренировка', time: '30 мин', fields: [{ id: 'expert_case', label: 'Кейс', type: 'input' }, { id: 'pattern_gap', label: 'Разрыв', type: 'textarea' }] },
            { id: 'w4', text: 'Контролируемый микрострессор', time: 'Варьируется', fields: [{ id: 'stressor', label: 'Что сделано?', type: 'input' }, { id: 'reaction', label: 'Реакция тела', type: 'textarea' }] }
        ]
    },
    {
        id: 'monthly', title: 'Ежемесячно', color: 'text-purple-400',
        tasks: [
            { id: 'm1', text: 'Стратегический AAR', time: '60 мин', fields: [{ id: 'progress_pct', label: 'Прогресс (%)', type: 'number' }, { id: 'stop_doing', label: 'Прекратить', type: 'textarea' }, { id: 'start_doing', label: 'Начать', type: 'textarea' }] },
            { id: 'm3', text: 'Агентурная сеть (Обновление)', time: 'Варьируется', fields: [{ id: 'network_favors', label: 'Услуги авансом', type: 'textarea' }] }
        ]
    },
    {
        id: 'quarterly', title: 'Ежеквартально (Стратегический срез)', color: 'text-orange-400',
        tasks: [
            { id: 'q2', text: 'Brainwriting Pre-Mortem', time: '60 мин', description: '<p>Вскрытие до смерти. Ищем причины будущего провала плана.</p>', fields: [{ id: 'reasons', label: 'Причины фатального провала', type: 'textarea' }, { id: 'actions', label: 'Превентивные действия', type: 'textarea' }] },
            { id: 'q3', text: 'Red Team Review', time: '2-3 часа', description: '<p class="mb-2">Атака на собственный план (Красные команды ЦРУ).</p>', fields: [{ id: 'ai_critique', label: 'Главная уязвимость стратегии', type: 'textarea' }, { id: 'human_filter', label: 'Решение проблемы', type: 'textarea' }] }
        ]
    }
];

export const initialNetwork = [
    { id: 'n1', name: 'Елена', callsign: 'Хитрая выдра', role: 'Брокер по ипотеке', circle: '1', m: 'Комиссия', i: 'Репутация', contact: 'TG: @elena_broker', lastDate: '2026-03-25', nextDate: '2026-04-02', links: [] },
    { id: 'n2', name: 'Андрей', callsign: 'Угрюмый бобр', role: 'Строитель', circle: '2', m: 'Продажа дома', contact: '+7 (999) 111-22-33', lastDate: '2026-04-01', nextDate: '2026-04-06', links: [] },
    { id: 'n3', name: 'Олег', callsign: 'Толстый тюлень', role: 'Строитель', circle: '2', m: 'Заработок', contact: '', lastDate: '', nextDate: '', links: ['n4'] },
    { id: 'n4', name: 'Елена (жена Олега)', callsign: 'Боевая синица', role: 'Управление', circle: '2', contact: '', lastDate: '', nextDate: '', links: ['n3'] },
    { id: 'n5', name: 'Руслан', callsign: 'Веселый хорек', role: 'Нетворкер', circle: '3', m: 'Процент', contact: 'WhatsApp', lastDate: '2026-03-30', nextDate: '2026-04-10', links: [] }
];

export const initialPlan = {
    mission: 'КТО: Я (Тимофей)\nЧТО: Создание кэш-флоу и базы клиентов\nКОГДА: Ближайшие 90 дней\nГДЕ: Самарская область, загородная недвижимость\nЗАЧЕМ: Финансовая автономность',
    phase0: '• ФИНАНСОВЫЙ ЗАПАС: 0 месяцев.\n• АСИММЕТРИЧНОЕ ПРЕИМУЩЕСТВО: Знания в области проектирования интерьеров. Связующее звено между строителем и клиентом.\n• ТРИГГЕР ПАРАЛИЧА: Страх за деньги и репутацию.\n• УТЕЧКИ: Изучение нового (без применения), стресс.',
    phase1: '• МИШЕНЬ: Заказчики частных домов (эконом/премиум).\n• ПРОДУКТ-ТАРАН: Дизайн/проектирование.\n• СОЮЗНИКИ: Елена (Брокер), Андрей (Строитель), Олег (Строитель), Руслан (Нетворкер).'
};

export const initialPerimeterState = {
    score: 0,
    currentDate: new Date().toISOString().split('T')[0],
    mission: initialPlan.mission,
    monthFocus: 'Выйти на 1 системного заказчика',
    tasks: [],
    customTasks: [],
    network: initialNetwork
};
