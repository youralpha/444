export interface Phase {
    id: string;
    name: string;
    duration: number; // in milliseconds
    startFill: number;
    endFill: number;
    color: string;
    globalTitle?: string;
    title?: string;
    desc?: string;
}

export const MODES: Record<string, (...args: any[]) => Phase[]> = {
    'hrv': (bpm: number) => {
        const ms = (60 / bpm / 2) * 1000;
        return [
            { id: 'inhale', name: 'ВДОХ', duration: ms, startFill: 0, endFill: 1, color: '#38bdf8' },
            { id: 'exhale', name: 'ВЫДОХ', duration: ms, startFill: 1, endFill: 0, color: '#a78bfa' }
        ];
    },
    'sigh': () => {
        return [
            { id: 'inhale1', name: 'ВДОХ (80%)', duration: 2000, startFill: 0, endFill: 0.8, color: '#38bdf8' },
            { id: 'inhale2', name: 'ДОВДОХ (20%)', duration: 500, startFill: 0.8, endFill: 1, color: '#0284c7' },
            { id: 'exhale', name: 'ДОЛГИЙ ВЫДОХ', duration: 5500, startFill: 1, endFill: 0, color: '#a78bfa' },
            { id: 'pause', name: 'ОБЫЧНОЕ ДЫХАНИЕ', duration: 8000, startFill: 0, endFill: 0, color: '#94a3b8' }
        ];
    },
    'pmr': () => {
        const groups = [
            { n: '1. Кисти и предплечья', on: 'Сожмите кулаки максимально (как стальные пружины).', off: 'Резко разожмите. Почувствуйте тепло и тяжесть в расслабленных руках.' },
            { n: '2. Бицепсы и плечи', on: 'Согните руки в локтях, напрягите бицепсы («покажите мускулы»).', off: 'Отпустите. Руки тяжёлые, расслабленные.' },
            { n: '3. Лицо', on: 'Зажмурьтесь. Сожмите челюсти. Наморщите лоб. Всё лицо в гримасу напряжения.', off: 'Лицо «стекает» вниз. Челюсть приоткрыта. Лоб гладкий.' },
            { n: '4. Шея и трапеции', on: 'Поднимите плечи к ушам максимально высоко («не знаю»).', off: 'Сбросьте. Плечи тяжело падают вниз.' },
            { n: '5. Грудь и спина', on: 'Сведите лопатки, расправьте грудь, максимально напрягите.', off: 'Отпустите. Расслабьтесь, дышите спокойно.' },
            { n: '6. Живот', on: 'Напрягите пресс — как ожидаете удар в солнечное сплетение. Твёрдый живот.', off: 'Расслабьте. Живот становится мягким.' },
            { n: '7. Ноги', on: 'Вытяните ноги, потяните носки на себя, напрягите бёдра и голени одновременно.', off: 'Отпустите. Ноги полностью расслаблены.' }
        ];
        let p: Phase[] = [];
        groups.forEach(g => {
            p.push({ id: 'pmr-on', name: 'НАПРЯЖЕНИЕ', duration: 7000, startFill: 0, endFill: 1, color: '#f43f5e', title: g.n, desc: g.on });
            p.push({ id: 'pmr-off', name: 'РАССЛАБЛЕНИЕ', duration: 20000, startFill: 1, endFill: 0, color: '#10b981', title: g.n, desc: g.off });
        });
        p.push({ id: 'pmr-end', name: 'ФИНАЛ ПМР', duration: 15000, startFill: 0, endFill: 0, color: '#38bdf8', title: 'Завершение ПМР', desc: 'Сделайте 3 глубоких вдоха и выдоха. Потянитесь всем телом.'});
        return p;
    },
    'space': (totalMs: number) => {
        const pt = totalMs / 3;
        return [
            { id: 'sp-1', name: 'ОСОЗНАНИЕ', duration: pt, startFill: 0, endFill: 1, color: '#38bdf8', title: 'ОСОЗНАНИЕ (Расширенное внимание)', desc: 'Остановитесь. Задайте себе вопросы без оценки: Какие сейчас мысли? Какие эмоции? Какие ощущения в теле?' },
            { id: 'sp-2', name: 'СОБИРАНИЕ', duration: pt, startFill: 0, endFill: 1, color: '#a78bfa', title: 'СОБИРАНИЕ (Суженное внимание)', desc: 'Направьте всё внимание на дыхание. Вдох... выдох. Если мысли уносят — мягко верните внимание на дыхание без раздражения.' },
            { id: 'sp-3', name: 'РАСШИРЕНИЕ', duration: pt, startFill: 0, endFill: 1, color: '#10b981', title: 'РАСШИРЕНИЕ (Расширенное внимание)', desc: 'Расширьте внимание на всё тело и позу. Затем на пространство вокруг: звуки, свет. Сделайте глубокий вдох-выдох.' }
        ];
    },
    'nsdr': () => {
        let p: Phase[] = [];
        p.push({ id: 'aa-yn-1', name: 'ПОДГОТОВКА', duration: 10000, startFill: 0, endFill: 1, color: '#38bdf8', globalTitle: 'Yoga Nidra (NSDR)', title: 'Подготовка', desc: 'Лягте на спину (Шавасана). Включите аудио Yoga Nidra. Глаза закрыты, тело абсолютно неподвижно.' });
        p.push({ id: 'aa-yn-2', name: 'ПРАКТИКА', duration: 470000, startFill: 0, endFill: 1, color: '#a78bfa', globalTitle: 'Yoga Nidra (NSDR)', title: 'Глубокое расслабление', desc: 'Следуйте за голосом диктора. Позвольте телу уснуть, сохраняя легкое фоновое сознание.' });
        p.push({ id: 'aa-yn-3', name: 'ВОЗВРАТ', duration: 60000, startFill: 0, endFill: 1, color: '#10b981', globalTitle: 'Yoga Nidra (NSDR)', title: 'Возвращение', desc: 'Практика завершена. Не вскакивайте. Просто полежите спокойно. Затем потянитесь и медленно сядьте.' });
        return p;
    },
    'stopframe': () => [
        { id: 'sf-s', name: 'СИТУАЦИЯ', duration: 60000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'С - Ситуация', desc: 'Что произошло? Вспомните событие. Только сухие факты. Без интерпретаций.' },
        { id: 'sf-t', name: 'ТЕЛО', duration: 60000, startFill: 0, endFill: 1, color: '#a78bfa', title: 'Т - Тело', desc: 'Что происходит в теле? Учащенный пульс, задержка дыхания, напряжение в челюсти или плечах?' },
        { id: 'sf-o', name: 'ОЦЕНКА', duration: 60000, startFill: 0, endFill: 1, color: '#f43f5e', title: 'О - Оценка', desc: 'Что я себе сказал? Какая первая автоматическая (пугающая) мысль пришла в голову?' },
        { id: 'sf-p', name: 'ПРОВЕРКА', duration: 120000, startFill: 0, endFill: 1, color: '#eab308', title: 'П - Проверка', desc: 'Это факт или интерпретация? Какова реальная вероятность худшего (0-100%)? Если это случится — это конец или просто трудность?' },
        { id: 'sf-k', name: 'КОРРЕКЦИЯ', duration: 60000, startFill: 0, endFill: 1, color: '#10b981', title: 'К - Коррекция', desc: 'Сформулируйте более точную и реалистичную мысль на основе проверки.' },
    ],
    'arsenalAuto': () => {
        let p: Phase[] = [];
        p.push({ id: 'aa-s1', name: 'ТЯЖЕСТЬ', duration: 180000, startFill: 0, endFill: 1, color: '#38bdf8', globalTitle: 'Аутогенная тренировка', title: 'Ощущение тяжести', desc: 'Повторяйте про себя: "Моя правая рука тяжелая... Моя левая рука тяжелая... Мои ноги тяжелые... Всё мое тело тяжелое и расслабленное."' });
        p.push({ id: 'aa-s2', name: 'ТЕПЛО', duration: 180000, startFill: 0, endFill: 1, color: '#f43f5e', globalTitle: 'Аутогенная тренировка', title: 'Ощущение тепла', desc: 'Повторяйте про себя: "Моя правая рука теплая... Моя левая рука теплая... По телу разливается приятное тепло."' });
        p.push({ id: 'aa-s3', name: 'СЕРДЦЕ', duration: 180000, startFill: 0, endFill: 1, color: '#a78bfa', globalTitle: 'Аутогенная тренировка', title: 'Сердце и дыхание', desc: 'Повторяйте про себя: "Мое сердце бьется ровно и спокойно... Мое дыхание глубокое и ровное... Мне абсолютно спокойно."' });
        p.push({ id: 'aa-s4', name: 'ВЫХОД', duration: 60000, startFill: 0, endFill: 1, color: '#10b981', globalTitle: 'Аутогенная тренировка', title: 'Мобилизация', desc: 'Сделайте глубокий вдох. Потянитесь всем телом, сожмите кулаки, откройте глаза. Вы полны сил и энергии.' });
        return p;
    },
    'focus': () => {
        return [
           { id: 'fc-1', name: 'DEEP WORK', duration: 50 * 60 * 1000, startFill: 0, endFill: 1, color: '#f97316', title: 'Фокус (Deep Work)', desc: 'Исключите все отвлечения. Максимальная концентрация на одной задаче.' }
        ];
    }
};
