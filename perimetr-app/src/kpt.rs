use dioxus::prelude::*;
use crate::db::Db;
use std::sync::Arc;

#[derive(Clone, PartialEq)]
struct KptTaskInput {
    id: String,
    label: String,
    placeholder: String,
}

#[derive(Clone, PartialEq)]
struct KptTask {
    id: String,
    title: String,
    xp: i32,
    desc: String,
    inputs: Vec<KptTaskInput>,
    completed: bool,
}

#[derive(Clone, PartialEq)]
struct KptWeek {
    id: i32,
    title: String,
    desc: String,
    tasks: Vec<KptTask>,
}

fn get_all_weeks() -> Vec<KptWeek> {
    vec![
        KptWeek {
            id: 1, title: "Неделя 1: Мониторинг".into(), desc: "Освоить модель СМЭП (возврат локуса контроля), собрать стартовые данные о связи активности с настроением.".into(),
            tasks: vec![
                KptTask { id: "w1_1".into(), title: "Записать мысль по модели СМЭП".into(), xp: 20, desc: "Фундаментальная техника для понимания, как ваши мысли вызывают эмоции.".into(),
                    inputs: vec![
                        KptTaskInput { id: "sit".into(), label: "Ситуация".into(), placeholder: "Что произошло?".into() },
                        KptTaskInput { id: "tho".into(), label: "Автоматическая мысль".into(), placeholder: "Что я подумал?".into() },
                        KptTaskInput { id: "emo".into(), label: "Эмоция и интенсивность (%)".into(), placeholder: "Тревога 80%".into() },
                    ], completed: false
                },
                KptTask { id: "w1_2".into(), title: "Выполнить одно микродействие (2-10 минут)".into(), xp: 15, desc: "Создает стартовый импульс и стимулирует дофаминовую систему подкрепления.".into(),
                    inputs: vec![KptTaskInput { id: "act".into(), label: "Какое микродействие вы выполнили?".into(), placeholder: "Например: Убрал стол".into() }], completed: false
                },
                KptTask { id: "w1_3".into(), title: "Заполнить трекер активности и настроения".into(), xp: 10, desc: "Позволяет собрать объективные данные о влиянии действий на состояние.".into(),
                    inputs: vec![KptTaskInput { id: "note".into(), label: "Общая заметка дня".into(), placeholder: "Настроение 6/10".into() }], completed: false
                },
            ]
        },
        KptWeek {
            id: 2, title: "Неделя 2: Активация и Сон".into(), desc: "Разорвать цикл депрессивного избегания через поведенческую активацию и закрепить циркадные ритмы (CBT-I).".into(),
            tasks: vec![
                KptTask { id: "w2_1".into(), title: "Запланировать приятное и значимое дело".into(), xp: 20, desc: "Поведенческая активация для получения подкрепления извне.".into(),
                    inputs: vec![KptTaskInput { id: "plan".into(), label: "План".into(), placeholder: "Приятное: прогулка. Значимое: отчет.".into() }], completed: false
                },
                KptTask { id: "w2_2".into(), title: "Встать в одно и то же время (протокол BBTI)".into(), xp: 15, desc: "Закрепляет циркадный ритм.".into(),
                    inputs: vec![KptTaskInput { id: "time".into(), label: "Время подъема".into(), placeholder: "07:00".into() }], completed: false
                },
                KptTask { id: "w2_3".into(), title: "Покинуть кровать при бессоннице".into(), xp: 20, desc: "Разрывает условный рефлекс 'Кровать = Тревога'.".into(), inputs: vec![], completed: false },
            ]
        },
        KptWeek {
            id: 3, title: "Неделя 3: Избегание".into(), desc: "Обнаружить свои скрытые ритуалы спасения, начать систематическое столкновение со страхами (по иерархии).".into(),
            tasks: vec![
                KptTask { id: "w3_1".into(), title: "Отказаться от охранительного поведения".into(), xp: 25, desc: "Отказ от костылей (например, ношение таблеток).".into(),
                    inputs: vec![KptTaskInput { id: "drop".into(), label: "От чего отказались?".into(), placeholder: "Перестал проверять пульс.".into() }], completed: false
                },
                KptTask { id: "w3_2".into(), title: "Сделать один шаг из Иерархии Страхов".into(), xp: 30, desc: "Систематическое столкновение с пугающим стимулом.".into(),
                    inputs: vec![KptTaskInput { id: "exp".into(), label: "Ситуация".into(), placeholder: "Поездка в метро.".into() }, KptTaskInput { id: "suds".into(), label: "Тревога ДО/ПОСЛЕ (SUDS)".into(), placeholder: "80 / 40".into() }], completed: false
                },
            ]
        },
        KptWeek {
            id: 4, title: "Неделя 4: Тест мыслей".into(), desc: "Научиться проводить поведенческие эксперименты для деконструкции страхов и освоить прагматичный пошаговый алгоритм.".into(),
            tasks: vec![
                KptTask { id: "w4_1".into(), title: "Провести поведенческий эксперимент".into(), xp: 25, desc: "Отношение к негативной мысли как к гипотезе.".into(),
                    inputs: vec![KptTaskInput { id: "hyp".into(), label: "Гипотеза vs Реальность".into(), placeholder: "Думал: Упаду. Факт: Просто вспотел.".into() }], completed: false
                },
                KptTask { id: "w4_2".into(), title: "Пройти шаг Терапии решения проблем (PST)".into(), xp: 20, desc: "Прагматичный подход к реальным стрессорам.".into(),
                    inputs: vec![KptTaskInput { id: "prob".into(), label: "Проблема и Решение".into(), placeholder: "Долг -> план выплат.".into() }], completed: false
                },
            ]
        },
        KptWeek {
            id: 5, title: "Неделя 5: Экспозиция".into(), desc: "Применить специфический для вашей проблемы экспозиционный протокол.".into(),
            tasks: vec![
                KptTask { id: "w5_1".into(), title: "Выполнить таргетную экспозицию".into(), xp: 30, desc: "Специализированная тренировка под ваш тип тревоги.".into(), inputs: vec![], completed: false },
                KptTask { id: "w5_2".into(), title: "Соблюдать Время для беспокойства".into(), xp: 20, desc: "Разрыв связи между делами и тревогой.".into(),
                    inputs: vec![KptTaskInput { id: "worries".into(), label: "Отложенные тревоги".into(), placeholder: "А что если меня уволят?".into() }], completed: false
                },
            ]
        },
        KptWeek {
            id: 6, title: "Неделя 6: Ассертивность".into(), desc: "Научиться выражать потребности и защищать границы без чувства вины.".into(),
            tasks: vec![
                KptTask { id: "w6_1".into(), title: "Поведенческая репетиция скрипта".into(), xp: 20, desc: "Тренировка защиты границ без агрессии.".into(),
                    inputs: vec![KptTaskInput { id: "script".into(), label: "Скрипт".into(), placeholder: "Я понимаю, но мне нужно...".into() }], completed: false
                },
                KptTask { id: "w6_2".into(), title: "Упражнение 'Действуй так, как если бы'".into(), xp: 25, desc: "Формирование самооценки через реальные действия.".into(),
                    inputs: vec![KptTaskInput { id: "act_as".into(), label: "Что сымитировали?".into(), placeholder: "Уверенный голос на собрании.".into() }], completed: false
                },
            ]
        },
        KptWeek {
            id: 7, title: "Неделя 7: Убеждения".into(), desc: "Раскопать корневую негативную установку и начать активно собирать поведенческие доказательства для здоровой схемы.".into(),
            tasks: vec![
                KptTask { id: "w7_1".into(), title: "Применить Технику падающей стрелы".into(), xp: 25, desc: "Поиск фундаментального глубинного убеждения.".into(),
                    inputs: vec![KptTaskInput { id: "arrow".into(), label: "Цепочка мыслей".into(), placeholder: "Я ошибся -> Меня уволят -> Я ничтожество.".into() }], completed: false
                },
                KptTask { id: "w7_2".into(), title: "Сделать микродействие для нового убеждения".into(), xp: 20, desc: "Нейропластичность требует реальных поступков.".into(),
                    inputs: vec![KptTaskInput { id: "new_bel".into(), label: "Новое убеждение -> Действие".into(), placeholder: "Я компетентен -> Отправил резюме.".into() }], completed: false
                },
            ]
        },
        KptWeek {
            id: 8, title: "Неделя 8: Профилактика".into(), desc: "Проанализировать графики и дневники, стать собственным терапевтом, создать жесткий план действий.".into(),
            tasks: vec![
                KptTask { id: "w8_1".into(), title: "Проанализировать графики и дневники".into(), xp: 15, desc: "Переход в позицию собственного терапевта.".into(),
                    inputs: vec![KptTaskInput { id: "top3".into(), label: "Топ-3 техник".into(), placeholder: "СМЭП, Экспозиция, ПМР".into() }], completed: false
                },
                KptTask { id: "w8_2".into(), title: "Обновить Личный план профилактики".into(), xp: 30, desc: "Защита от рецидивов.".into(),
                    inputs: vec![KptTaskInput { id: "plan".into(), label: "Ранние признаки и План".into(), placeholder: "Плохой сон -> Применяю CBTI.".into() }], completed: false
                },
            ]
        },
    ]
}

#[component]
pub fn KptView() -> Element {
    let db = use_context::<Arc<Db>>();

    let mut xp = use_signal(|| db.query_row("SELECT xp FROM kpt_state WHERE id = 1", [], |row| row.get::<_, i32>(0)).unwrap_or(0));
    let mut current_week_id = use_signal(|| db.query_row("SELECT current_week FROM kpt_state WHERE id = 1", [], |row| row.get::<_, i32>(0)).unwrap_or(1));
    let mut max_page = use_signal(|| db.query_row("SELECT max_page FROM kpt_state WHERE id = 1", [], |row| row.get::<_, i32>(0)).unwrap_or(0));

    let all_weeks = get_all_weeks();

    let mut current_week_data = use_signal(|| {
        let mut wk = all_weeks.iter().find(|w| w.id == current_week_id()).cloned().unwrap_or(all_weeks[0].clone());
        for task in wk.tasks.iter_mut() {
            if let Ok(true) = db.query_row("SELECT completed FROM kpt_tasks WHERE task_id = ?1", rusqlite::params![task.id], |r| r.get(0)) {
                task.completed = true;
            }
        }
        wk
    });

    let current_level = (xp() / 100) + 1;
    let current_level_xp = xp() % 100;
    let xp_left = 100 - current_level_xp;
    let progress_pct = current_level_xp as f32;
    let book_pct = ((max_page() as f32 / 400.0) * 100.0).round() as i32;

    let db_week = db.clone();
    let db_book = db.clone();

    rsx! {
        div { class: "view-header",
            div {
                h1 { class: "view-title text-blue", "КПТ Протокол" }
                p { class: "text-dim text-sm mt-1 uppercase", "Геймифицированный Трекер" }
            }
            div { class: "flex items-center gap-2 cyber-border py-1 px-3 border-blue",
                span { class: "mono font-bold text-blue", "Уровень {current_level}" }
            }
        }

        // XP Bar
        div { class: "mb-6",
            div { class: "w-full bg-surface rounded h-2 mb-1 border border-accent",
                div { class: "bg-blue h-full rounded transition-all", style: "width: {progress_pct}%" }
            }
            div { class: "flex justify-between text-xs mono text-dim",
                span { "{xp} Всего XP" }
                span { "До ур. {current_level + 1} осталось {xp_left} XP" }
            }
        }

        div { class: "grid grid-2 gap-6",
            div { class: "cyber-border",
                div { class: "flex justify-between items-center mb-4 border-b border-accent pb-2",
                    h2 { class: "text-sm font-bold text-blue uppercase", "{current_week_data().title}" }
                    select {
                        class: "p-1 bg-surface border border-accent text-white rounded text-xs",
                        value: "{current_week_id}",
                        onchange: move |evt| {
                            let wid: i32 = evt.value().parse().unwrap_or(1);
                            let _ = db_week.execute("UPDATE kpt_state SET current_week = ?1 WHERE id = 1", rusqlite::params![wid]);
                            current_week_id.set(wid);

                            let mut wk = all_weeks.iter().find(|w| w.id == wid).cloned().unwrap_or(all_weeks[0].clone());
                            for task in wk.tasks.iter_mut() {
                                if let Ok(true) = db_week.query_row("SELECT completed FROM kpt_tasks WHERE task_id = ?1", rusqlite::params![task.id], |r| r.get(0)) {
                                    task.completed = true;
                                }
                            }
                            current_week_data.set(wk);
                        },
                        for w in all_weeks.iter() {
                            option { value: "{w.id}", "{w.title}" }
                        }
                    }
                }

                p { class: "text-sm text-dim mb-4", "{current_week_data().desc}" }

                div { class: "flex flex-col gap-4",
                    for (i, task) in current_week_data().tasks.iter().enumerate() {
                        KptTaskComponent { task: task.clone(), i: i, xp: xp, current_week_data: current_week_data, db: db.clone() }
                    }
                }
            }

            // Bibliotherapy
            div { class: "cyber-border border-emerald h-64",
                h2 { class: "text-sm font-bold text-emerald uppercase mb-4", "Библиотерапия" }
                p { class: "text-sm text-dim mb-4", "Чтение: «Когнитивная терапия», Джудит Бек. +2 XP за каждую новую прочитанную страницу." }

                div { class: "flex-col gap-2 mb-4",
                    label { class: "text-xs font-bold text-dim uppercase", "Текущая страница (из 400)" }
                    input {
                        type: "number",
                        value: "{max_page}",
                        placeholder: "0",
                        class: "text-lg font-bold border-emerald",
                        onchange: move |evt| {
                            let new_page: i32 = evt.value().parse().unwrap_or(0);
                            let old_page = max_page();

                            if new_page > old_page && new_page <= 400 {
                                let diff = new_page - old_page;
                                let current_xp = xp() + (diff * 2);
                                let _ = db_book.execute("UPDATE kpt_state SET xp = ?1, max_page = ?2 WHERE id = 1", rusqlite::params![current_xp, new_page]);
                                xp.set(current_xp);
                                max_page.set(new_page);
                            }
                        }
                    }
                }

                div { class: "w-full bg-surface rounded h-4 border border-accent",
                    div { class: "bg-emerald h-full rounded transition-all", style: "width: {book_pct}%" }
                }
                div { class: "text-right text-xs mono font-bold text-emerald mt-1", "{book_pct}%" }
            }
        }
    }
}

#[component]
fn KptTaskComponent(task: KptTask, i: usize, mut xp: Signal<i32>, mut current_week_data: Signal<KptWeek>, db: Arc<Db>) -> Element {
    let mut is_expanded = use_signal(|| false);

    rsx! {
        div { class: "bg-surface border border-accent rounded",
            div { class: "p-3 flex items-center justify-between cursor-pointer",
                onclick: move |_| is_expanded.set(!is_expanded()),
                div { class: "flex items-center gap-3",
                    div {
                        class: if task.completed { "w-5 h-5 border-2 border-blue rounded-sm bg-blue" } else { "w-5 h-5 border-2 border-blue rounded-sm hover-bg-accent" },
                        onclick: {
                            let db_task = db.clone();
                            move |evt| {
                                evt.stop_propagation();
                                let mut wk = current_week_data();
                                let current_completed = wk.tasks[i].completed;
                                wk.tasks[i].completed = !current_completed;

                                let _ = db_task.execute("INSERT OR REPLACE INTO kpt_tasks (task_id, completed) VALUES (?1, ?2)", rusqlite::params![wk.tasks[i].id, wk.tasks[i].completed]);

                                let mut current_xp = xp();
                                if !current_completed { current_xp += wk.tasks[i].xp; } else { current_xp -= wk.tasks[i].xp; }
                                let _ = db_task.execute("UPDATE kpt_state SET xp = ?1 WHERE id = 1", rusqlite::params![current_xp]);

                                xp.set(current_xp);
                                current_week_data.set(wk);
                            }
                        }
                    }
                    span { class: if task.completed { "text-sm line-through text-dim" } else { "text-sm font-bold" }, "{task.title}" }
                }
                span { class: "text-xs font-bold text-blue", "+{task.xp} XP" }
            }

            if is_expanded() {
                div { class: "p-3 border-t border-accent bg-[rgba(0,0,0,0.2)]",
                    p { class: "text-xs text-dim mb-4", "{task.desc}" }

                    if !task.inputs.is_empty() {
                        div { class: "flex flex-col gap-3",
                            for input in task.inputs {
                                KptTaskInputComponent { task_id: task.id.clone(), input: input, db: db.clone() }
                            }
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn KptTaskInputComponent(task_id: String, input: KptTaskInput, db: Arc<Db>) -> Element {
    let full_id = format!("{}_{}", task_id, input.id);
    let mut val = use_signal(|| {
        db.query_row("SELECT value FROM kpt_inputs WHERE input_id = ?1", rusqlite::params![full_id], |r| r.get::<_, String>(0)).unwrap_or_default()
    });

    rsx! {
        div { class: "flex flex-col gap-1",
            label { class: "text-[10px] uppercase font-bold text-dim", "{input.label}" }
            textarea {
                rows: 2,
                placeholder: "{input.placeholder}",
                class: "text-sm bg-main border-accent",
                value: "{val}",
                onchange: {
                    let db_input = db.clone();
                    let f_id = full_id.clone();
                    move |evt| {
                        let new_val = evt.value();
                        let _ = db_input.execute("INSERT OR REPLACE INTO kpt_inputs (input_id, value) VALUES (?1, ?2)", rusqlite::params![f_id, new_val]);
                        val.set(new_val);
                    }
                }
            }
        }
    }
}
