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
            p.push({ id: 'pmr-off', name: 'РАССЛАБЛЕНИЕ', duration: 20000, startFill: 1, endFill: 0, color: '#22c55e', title: g.n, desc: g.off });
        });
        p.push({ id: 'pmr-end', name: 'ФИНАЛ ПМР', duration: 15000, startFill: 0, endFill: 0, color: '#38bdf8', title: 'Завершение ПМР', desc: 'Сделайте 3 глубоких вдоха и выдоха. Потянитесь всем телом.'});
        return p;
    },
    'space': (totalMs: number) => {
        const pt = totalMs / 3;
        return [
            { id: 'sp-1', name: 'ОСОЗНАНИЕ', duration: pt, startFill: 0, endFill: 1, color: '#38bdf8', title: 'ОСОЗНАНИЕ (Расширенное внимание)', desc: 'Остановитесь. Задайте себе вопросы без оценки: Какие сейчас мысли? Какие эмоции? Какие ощущения в теле?' },
            { id: 'sp-2', name: 'СОБИРАНИЕ', duration: pt, startFill: 0, endFill: 1, color: '#a78bfa', title: 'СОБИРАНИЕ (Суженное внимание)', desc: 'Направьте всё внимание на дыхание. Вдох... выдох. Если мысли уносят — мягко верните внимание на дыхание без раздражения.' },
            { id: 'sp-3', name: 'РАСШИРЕНИЕ', duration: pt, startFill: 0, endFill: 1, color: '#22c55e', title: 'РАСШИРЕНИЕ (Расширенное внимание)', desc: 'Расширьте внимание на всё тело и позу. Затем на пространство вокруг: звуки, свет. Сделайте глубокий вдох-выдох.' }
        ];
    },
    'nsdr': () => {
        let p: Phase[] = [];
        p.push({ id: 'aa-yn-1', name: 'ПОДГОТОВКА', duration: 60000, startFill: 0, endFill: 1, color: '#38bdf8', globalTitle: 'Yoga Nidra (NSDR)', title: 'Подготовка к NSDR', desc: 'Лягте на спину, руки вдоль тела. Включите выбранную аудиозапись (NSDR Huberman или Insight Timer).' });
        p.push({ id: 'aa-yn-2', name: 'ПРАКТИКА', duration: 15 * 60000, startFill: 0, endFill: 1, color: '#a78bfa', globalTitle: 'Yoga Nidra (NSDR)', title: 'Глубокое расслабление', desc: 'Следуйте за голосом диктора. Позвольте телу уснуть, сохраняя легкое фоновое сознание.' });
        p.push({ id: 'aa-yn-3', name: 'ВОЗВРАТ', duration: 60000, startFill: 0, endFill: 1, color: '#22c55e', globalTitle: 'Yoga Nidra (NSDR)', title: 'Возвращение', desc: 'Практика завершена. Не вскакивайте. Просто полежите спокойно. Затем потянитесь и медленно сядьте.' });
        return p;
    },
    'stopframe': () => [
        { id: 'sf-s', name: 'СИТУАЦИЯ', duration: 60000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'С - Ситуация', desc: 'Что произошло? Вспомните событие. Только сухие факты. Без интерпретаций.' },
        { id: 'sf-t', name: 'ТЕЛО', duration: 60000, startFill: 0, endFill: 1, color: '#a78bfa', title: 'Т - Тело', desc: 'Что происходит в теле? Учащенный пульс, задержка дыхания, напряжение в челюсти или плечах?' },
        { id: 'sf-o', name: 'ОЦЕНКА', duration: 60000, startFill: 0, endFill: 1, color: '#f43f5e', title: 'О - Оценка', desc: 'Что я себе сказал? Какая первая автоматическая (пугающая) мысль пришла в голову?' },
        { id: 'sf-p', name: 'ПРОВЕРКА', duration: 120000, startFill: 0, endFill: 1, color: '#eab308', title: 'П - Проверка', desc: 'Это факт или интерпретация? Какова реальная вероятность худшего (0-100%)? Если это случится — это конец или просто трудность?' },
        { id: 'sf-k', name: 'КОРРЕКЦИЯ', duration: 60000, startFill: 0, endFill: 1, color: '#22c55e', title: 'К - Коррекция', desc: 'Сформулируйте более точную и реалистичную мысль на основе проверки.' },
    ],
    'arsenalAuto': () => {
        let p: Phase[] = [];
        p.push({ id: 'aa-s1', name: 'ТЯЖЕСТЬ', duration: 180000, startFill: 0, endFill: 1, color: '#38bdf8', globalTitle: 'Аутогенная тренировка', title: 'Ощущение тяжести', desc: 'Повторяйте про себя: "Моя правая рука тяжелая... Моя левая рука тяжелая... Мои ноги тяжелые... Всё мое тело тяжелое и расслабленное."' });
        p.push({ id: 'aa-s2', name: 'ТЕПЛО', duration: 180000, startFill: 0, endFill: 1, color: '#f43f5e', globalTitle: 'Аутогенная тренировка', title: 'Ощущение тепла', desc: 'Повторяйте про себя: "Моя правая рука теплая... Моя левая рука теплая... По телу разливается приятное тепло."' });
        p.push({ id: 'aa-s3', name: 'СЕРДЦЕ', duration: 180000, startFill: 0, endFill: 1, color: '#a78bfa', globalTitle: 'Аутогенная тренировка', title: 'Сердце и дыхание', desc: 'Повторяйте про себя: "Мое сердце бьется ровно и спокойно... Мое дыхание глубокое и ровное... Мне абсолютно спокойно."' });
        p.push({ id: 'aa-s4', name: 'ВЫХОД', duration: 60000, startFill: 0, endFill: 1, color: '#22c55e', globalTitle: 'Аутогенная тренировка', title: 'Мобилизация', desc: 'Сделайте глубокий вдох. Потянитесь всем телом, сожмите кулаки, откройте глаза. Вы полны сил и энергии.' });
        return p;
    },
    'act': () => [
        { id: 'act-1', name: 'РАМКА 1', duration: 20000, startFill: 0, endFill: 1, color: '#f43f5e', title: 'Шаг 1: Дистанцирование', desc: 'Заметьте пугающую, но правдивую мысль. Скажите себе: «У меня есть мысль, что [вставьте вашу мысль]».' },
        { id: 'act-2', name: 'РАМКА 2', duration: 20000, startFill: 0, endFill: 1, color: '#eab308', title: 'Шаг 2: Наблюдение', desc: 'Теперь скажите: «Я ЗАМЕЧАЮ, что у меня есть мысль, что...». Почувствуйте дистанцию. Вы — не ваша мысль.' },
        { id: 'act-3', name: 'РАДИО', duration: 45000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Радио Паника', desc: 'Представьте поток тревоги как вещание радио. «О, опять Радио Катастрофа. Послушаем позже». Переключите внимание на текущее действие.' },
        { id: 'act-4', name: 'ГОТОВНОСТЬ', duration: 60000, startFill: 0, endFill: 1, color: '#22c55e', title: 'Ценностный компас', desc: 'Готов ли я испытывать этот дискомфорт ради движения к моим ценностям и целям? Ответьте "Да" и продолжайте работу.' }
    ],
    'rehearsal': () => [
        { id: 'reh-1', name: 'СТАБИЛИЗАЦИЯ', duration: 120000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Шаг 1: Стабилизация', desc: 'Сделайте 3 физиологических вздоха + дышите ровно. Закройте глаза. Представьте предстоящее событие.' },
        { id: 'reh-2', name: 'ОПТИМУМ', duration: 120000, startFill: 0, endFill: 1, color: '#22c55e', title: 'Сценарий А: Оптимальный', desc: 'Представьте место, себя. Вы спокойны. Ключевые слова, позитивная реакция оппонента, успех. Проживите это.' },
        { id: 'reh-3', name: 'СЛОЖНОСТЬ', duration: 120000, startFill: 0, endFill: 1, color: '#f43f5e', title: 'Сценарий Б: Сложный', desc: 'Возникает провокация или препятствие. Пульс растёт — ЗАМЕТЬТЕ ЭТО. Вздох. Пауза. Вы перестраиваетесь и контролируете ситуацию.' },
        { id: 'reh-4', name: 'ПРОВАЛ', duration: 120000, startFill: 0, endFill: 1, color: '#eab308', title: 'Сценарий В: Провальный', desc: 'Худший реалистичный исход. Ваши действия по минимизации ущерба. Вы выходите с достоинством. Извлекаете опыт.' },
        { id: 'reh-5', name: 'ЗАВЕРШЕНИЕ', duration: 60000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Шаг 4: Завершение', desc: 'Сделайте 3 глубоких вдоха. Мысленно скажите: «Я готов к любому варианту». Медленно откройте глаза.' }
    ],
    'cold': () => [
        { id: 'cold-1', name: 'НАСТРОЙКА', duration: 10000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Подготовка', desc: 'После теплого душа переключите кран на самую холодную воду.' },
        { id: 'cold-2', name: 'ЭКСПОЗИЦИЯ', duration: 60000, startFill: 0, endFill: 1, color: '#0284c7', title: 'Холодовой стресс', desc: 'Выдержите ледяную воду. Практикуйте физиологический вздох. Контролируйте свою реакцию на стресс.' }
    ],
    'key': () => [
        { id: 'key-1', name: 'РАСХОЖДЕНИЕ', duration: 60000, startFill: 0, endFill: 1, color: '#38bdf8', title: 'Приём А: Расхождение', desc: 'Встаньте. Закройте глаза. Руки перед собой. Вообразите, что они расходятся в стороны. Без мышечного усилия.' },
        { id: 'key-2', name: 'СХОЖДЕНИЕ', duration: 60000, startFill: 0, endFill: 1, color: '#a78bfa', title: 'Приём Б: Схождение', desc: 'Разведите руки. Представьте, что они притягиваются друг к другу, как магниты.' },
        { id: 'key-3', name: 'ВСПЛЫВАНИЕ', duration: 60000, startFill: 0, endFill: 1, color: '#22c55e', title: 'Приём В: Всплывание', desc: 'Опустите руки. Представьте, что одна рука стала лёгкой как воздушный шар и сама всплывает вверх.' },
        { id: 'key-4', name: 'МАЯТНИК', duration: 60000, startFill: 0, endFill: 1, color: '#f43f5e', title: 'Приём Г: Покачивание', desc: 'Представьте лёгкое покачивание всего тела вперёд-назад. Позвольте телу двигаться за воображением.' },
        { id: 'key-5', name: 'СИНХРОНИЗАЦИЯ', duration: 60000, startFill: 0, endFill: 1, color: '#eab308', title: 'Ваш "Ключ"', desc: 'Выберите приём с самым сильным идеомоторным откликом и продолжайте его. Дождитесь чувства полного спокойствия.' }
    ],
    'focus': () => {
        return [
           { id: 'fc-1', name: 'DEEP WORK', duration: 50 * 60 * 1000, startFill: 0, endFill: 1, color: '#f97316', title: 'Фокус (Deep Work)', desc: 'Исключите все отвлечения. Максимальная концентрация на одной задаче.' }
        ];
    },
    'base': (totalMs: number) => {
        let is20 = totalMs <= 20 * 60 * 1000;
        let sighTargetMs = is20 ? 3 * 60000 : 5 * 60000;
        let hrvTargetMs = is20 ? 10 * 60000 : 20 * 60000;
        let p: Phase[] = [];
        let accumulatedMs = 0;

        p.push({ id: 'base-intro-1', name: 'ПОДГОТОВКА', duration: 10000, startFill: 0, endFill: 1, color: '#eab308', globalTitle: "Этап 1/4: Физиологический вздох", title: "Приготовьтесь", desc: "Сядьте удобно. Начинаем этап сброса стресса. Подготовьтесь к двойному вдоху носом." });
        accumulatedMs += 10000;

        let sighCycles = Math.floor((sighTargetMs - 10000) / 16000);
        for(let i = 0; i < sighCycles; i++) {
            let cycle = MODES.sigh();
            cycle.forEach(c => {
                c.globalTitle = "Этап 1/4: Физиологический вздох";
                p.push(c);
                accumulatedMs += c.duration;
            });
        }

        p.push({ id: 'base-trans-2', name: 'ПЕРЕХОД', duration: 10000, startFill: 0, endFill: 1, color: '#eab308', globalTitle: "Переход к Этапу 2", title: "Смена ритма", desc: "Дыхание выравнивается. Переходим к резонансному дыханию для балансировки нервной системы." });
        accumulatedMs += 10000;

        let hrvCycles = Math.floor((hrvTargetMs - 10000) / 10000);
        for(let i = 0; i < hrvCycles; i++) {
            let cycle = MODES.hrv(6.0);
            cycle.forEach(c => {
                c.globalTitle = "Этап 2/4: Резонансное дыхание (HRV)";
                p.push(c);
                accumulatedMs += c.duration;
            });
        }

        p.push({ id: 'base-trans-3', name: 'ПЕРЕХОД', duration: 10000, startFill: 0, endFill: 1, color: '#eab308', globalTitle: "Переход к Этапу 3", title: "Мышечная релаксация", desc: "Приготовьтесь к работе с телом. Будем по очереди напрягать и расслаблять группы мышц." });
        accumulatedMs += 10000;

        let pmrCycle = MODES.pmr();
        pmrCycle.forEach(c => {
            c.globalTitle = "Этап 3/4: Мышечная релаксация (ПМР)";
            p.push(c);
            accumulatedMs += c.duration;
        });

        let spaceRemaining = totalMs - accumulatedMs;
        if (spaceRemaining > 10000) {
            p.push({ id: 'base-trans-4', name: 'ПЕРЕХОД', duration: 10000, startFill: 0, endFill: 1, color: '#eab308', globalTitle: "Переход к Этапу 4", title: "Пространство дыхания", desc: "Финальный этап интеграции. Переходим к практике осознанности." });
            spaceRemaining -= 10000;

            let spaceCycle = MODES.space(spaceRemaining);
            spaceCycle.forEach(c => {
                c.globalTitle = "Этап 4/4: Пространство дыхания (Space)";
                p.push(c);
            });
        }
        return p;
    },
    'full': (totalMs: number) => {
        let is50 = totalMs <= 50 * 60 * 1000;
        let baseTime = is50 ? 20 * 60000 : 40 * 60000;

        let p1 = MODES.base(baseTime - 10000);
        p1.forEach(c => {
            c.globalTitle = "ЧАСТЬ I (БАЗА) | " + (c.globalTitle || '');
        });

        let p2 = MODES.arsenalAuto();
        p2.forEach(c => {
            c.globalTitle = "ЧАСТЬ II (АРСЕНАЛ) | " + (c.globalTitle || '');
        });

        let trans: Phase = { id: 'full-trans', name: 'ПЕРЕХОД', duration: 10000, startFill: 0, endFill: 1, color: '#eab308', globalTitle: "СМЕНА БЛОКОВ", title: "Экватор тренировки", desc: "Базовая часть завершена. Переходим к продвинутым когнитивным и ментальным техникам Расширенного Арсенала." };

        return [...p1, trans, ...p2];
    }
};
