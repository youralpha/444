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

export function getCycles(customTasks: any[]): { id: string, title: string, color: string, tasks: ProtocolTask[] }[] {
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
    { id: 'd1', cycle: 'daily', text: 'Утренний брифинг (OODA)', time: '10m', description: 'Observe, Orient, Decide, Act на сегодня.', is_custom: false, fields: [] },
    { id: 'd2', cycle: 'daily', text: 'Синхронизация с сетью (SAS)', time: '15m', description: 'Проверка контактов, стратегия дающего.', is_custom: false, fields: [] },
    { id: 'w1', cycle: 'weekly', text: 'Еженедельный отчет', time: '30m', description: 'Анализ M.I.C.E. и прогресса.', is_custom: false, fields: [] },
    { id: 'm1', cycle: 'monthly', text: 'Глубокий анализ H2F', time: '1h', description: 'Корректировка генеральной миссии.', is_custom: false, fields: [] },
    { id: 'q1', cycle: 'quarterly', text: 'Квартальное ревью', time: '2h', description: 'Полный пересмотр стратегии.', is_custom: false, fields: [] }
  ];

  const allTasks = [...defaultTasks, ...cTasks];

  const cycles = [
    { id: 'daily', title: 'Ежедневные (Daily)', color: 'text-blue-400' },
    { id: 'weekly', title: 'Еженедельные (Weekly)', color: 'text-orange-400' },
    { id: 'monthly', title: 'Ежемесячные (Monthly)', color: 'text-purple-400' },
    { id: 'quarterly', title: 'Квартальные (Quarterly)', color: 'text-red-400' }
  ];

  return cycles.map(c => ({
    ...c,
    tasks: allTasks.filter(t => t.cycle === c.id)
  }));
}
