export interface ProtocolTask {
  id: string;
  cycle: string;
  text: string;
  time: string;
  description: string;
  is_custom: boolean;
  fields: {
    id: string;
    label: string;
    type_: string;
    placeholder?: string;
  }[];
}

export function getCycles(customTasks: any[], deletedTasks: string[]): { id: string, title: string, color: string, tasks: ProtocolTask[] }[] {
  const cTasks: ProtocolTask[] = customTasks.map(t => ({
    id: t.id,
    cycle: t.cycle,
    text: t.title,
    time: t.time,
    description: t.desc,
    is_custom: true,
    fields: (function() {
      try { return JSON.parse(t.fields_json || '[]'); } catch { return []; }
    })()
  }));

  const defaultTasks: ProtocolTask[] = [
    {
      id: 'd1', cycle: 'daily', text: 'Утренний оперативный брифинг (ПОЛНЫЙ SAS)', time: '15 мин',
      description: 'SAS (Situational Awareness Sync) — проактивная синхронизация с миссией.', is_custom: true,
      fields: [
          { id: 'sas_mission', label: '1. MISSION CHECK (Заполняется на главном экране)', type_: 'textarea' },
          { id: 'sas_bullets', label: '2. ТРИ ПУЛИ (Заполняется на главном экране)', type_: 'textarea' },
          { id: 'sas_anticipation', label: '3. АНТИЦИПАЦИЯ', type_: 'textarea' },
          { id: 'w', label: '4. W — WISH', type_: 'input' },
          { id: 'o1', label: '4. O — OUTCOME', type_: 'input' },
          { id: 'o2', label: '4. O — OBSTACLE', type_: 'input' },
          { id: 'p', label: '4. P — PLAN', type_: 'textarea' }
      ]
    },
    {
      id: 'd2', cycle: 'daily', text: 'OODA Loop (Цикл Бойда)', time: 'В моменте',
      description: 'Наблюдай → Ориентируйся → Решай → Действуй.', is_custom: true,
      fields: [{ id: 'ooda_count', label: 'Циклов за день', type_: 'number' }, { id: 'ooda_decision', label: 'Ключевое решение', type_: 'textarea' }]
    },
    {
      id: 'd4', cycle: 'daily', text: 'Физиологический чек (H2F)', time: '2 мин', description: '', is_custom: true,
      fields: [{ id: 'sleep', label: 'Сон (1-10)', type_: 'number' }, { id: 'energy', label: 'Энергия (1-10)', type_: 'number' }, { id: 'focus', label: 'Фокус (1-10)', type_: 'number' }]
    },
    {
      id: 'd5', cycle: 'daily', text: 'Teach-Back изученного', time: '15 мин', description: '', is_custom: true,
      fields: [{ id: 'learned', label: 'Что понято?', type_: 'textarea' }, { id: 'explained', label: 'Кому?', type_: 'input' }]
    },
    {
      id: 'd6', cycle: 'daily', text: 'EOD Дебрифинг (Протокол Отбоя)', time: '10 мин',
      description: 'End of Day (EOD) Debrief — ритуал закрытия оперативного дня и отключения психики.', is_custom: true,
      fields: [
          { id: 'eod_dump', label: '1. BRAIN DUMP (Сброс мыслей)', type_: 'textarea', placeholder: 'Что осталось висеть в голове? Выгрузи это сюда, чтобы не думать ночью.' },
          { id: 'eod_aar', label: '2. МИКРО-AAR', type_: 'textarea', placeholder: 'Выполнено ли утреннее WISH? Если нет, то почему (без оправданий)?' },
          { id: 'eod_win', label: '3. ДОФАМИНОВАЯ ФИКСАЦИЯ', type_: 'input', placeholder: 'Главная победа дня (даже микро-шаг)' }
      ]
    },
    { id: 'w1', cycle: 'weekly', text: 'Тактический AAR', time: '30 мин', description: '', is_custom: true, fields: [{ id: 'planned', label: 'План', type_: 'textarea' }, { id: 'happened', label: 'Факт', type_: 'textarea' }, { id: 'why', label: 'Почему?', type_: 'textarea' }, { id: 'fix', label: 'Изменения', type_: 'textarea' }] },
    { id: 'w2', cycle: 'weekly', text: 'ShadowBox-тренировка', time: '30 мин', description: '', is_custom: true, fields: [{ id: 'expert_case', label: 'Кейс', type_: 'input' }, { id: 'pattern_gap', label: 'Разрыв', type_: 'textarea' }] },
    { id: 'w4', cycle: 'weekly', text: 'Контролируемый микрострессор', time: 'Варьируется', description: '', is_custom: true, fields: [{ id: 'stressor', label: 'Что сделано?', type_: 'input' }, { id: 'reaction', label: 'Реакция тела', type_: 'textarea' }] },
    { id: 'm1', cycle: 'monthly', text: 'Стратегический AAR', time: '60 мин', description: '', is_custom: true, fields: [{ id: 'progress_pct', label: 'Прогресс (%)', type_: 'number' }, { id: 'stop_doing', label: 'Прекратить', type_: 'textarea' }, { id: 'start_doing', label: 'Начать', type_: 'textarea' }] },
    { id: 'm3', cycle: 'monthly', text: 'Агентурная сеть (Обновление)', time: 'Варьируется', description: '', is_custom: true, fields: [{ id: 'network_favors', label: 'Услуги авансом', type_: 'textarea' }] },
    { id: 'q2', cycle: 'quarterly', text: 'Brainwriting Pre-Mortem', time: '60 мин', description: 'Вскрытие до смерти. Ищем причины будущего провала плана.', is_custom: true, fields: [{ id: 'reasons', label: 'Причины фатального провала', type_: 'textarea' }, { id: 'actions', label: 'Превентивные действия', type_: 'textarea' }] },
    { id: 'q3', cycle: 'quarterly', text: 'Red Team Review', time: '2-3 часа', description: 'Атака на собственный план (Красные команды ЦРУ).', is_custom: true, fields: [{ id: 'ai_critique', label: 'Главная уязвимость стратегии', type_: 'textarea' }, { id: 'human_filter', label: 'Решение проблемы', type_: 'textarea' }] }
  ];

  const allTasks = [...defaultTasks.filter(t => !deletedTasks.includes(t.id)), ...cTasks];

  const cycles = [
    { id: 'daily', title: 'Ежедневно', color: 'text-tactical-accent' },
    { id: 'weekly', title: 'Еженедельно', color: 'text-blue-400' },
    { id: 'monthly', title: 'Ежемесячно', color: 'text-purple-400' },
    { id: 'quarterly', title: 'Ежеквартально (Стратегический срез)', color: 'text-orange-400' }
  ];

  return cycles.map(c => ({
    ...c,
    tasks: allTasks.filter(t => t.cycle === c.id)
  }));
}
