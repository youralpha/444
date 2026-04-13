use dioxus::prelude::*;
use crate::db::Db;
use std::sync::Arc;

#[derive(Clone, PartialEq)]
struct KptTask {
    id: String,
    title: String,
    xp: i32,
    desc: String,
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
                KptTask { id: "w1_1".into(), title: "Записать мысль по модели СМЭП".into(), xp: 20, desc: "Фундаментальная техника для понимания, как ваши мысли вызывают эмоции.".into(), completed: false },
                KptTask { id: "w1_2".into(), title: "Выполнить одно микродействие (2-10 минут)".into(), xp: 15, desc: "Создает стартовый импульс и стимулирует дофаминовую систему подкрепления.".into(), completed: false },
                KptTask { id: "w1_3".into(), title: "Заполнить трекер активности и настроения".into(), xp: 10, desc: "Позволяет собрать объективные данные о влиянии действий на состояние.".into(), completed: false },
            ]
        },
        KptWeek {
            id: 2, title: "Неделя 2: Активация и Сон".into(), desc: "Разорвать цикл депрессивного избегания через поведенческую активацию и закрепить циркадные ритмы (CBT-I).".into(),
            tasks: vec![
                KptTask { id: "w2_1".into(), title: "Запланировать приятное и значимое дело".into(), xp: 20, desc: "Поведенческая активация для получения подкрепления извне.".into(), completed: false },
                KptTask { id: "w2_2".into(), title: "Встать в одно и то же время (протокол BBTI)".into(), xp: 15, desc: "Закрепляет циркадный ритм.".into(), completed: false },
                KptTask { id: "w2_3".into(), title: "Покинуть кровать при бессоннице".into(), xp: 20, desc: "Разрывает условный рефлекс 'Кровать = Тревога'.".into(), completed: false },
            ]
        },
        KptWeek {
            id: 3, title: "Неделя 3: Избегание".into(), desc: "Обнаружить свои скрытые ритуалы спасения, начать систематическое столкновение со страхами (по иерархии).".into(),
            tasks: vec![
                KptTask { id: "w3_1".into(), title: "Отказаться от охранительного поведения".into(), xp: 25, desc: "Отказ от костылей (например, ношение таблеток).".into(), completed: false },
                KptTask { id: "w3_2".into(), title: "Сделать один шаг из Иерархии Страхов".into(), xp: 30, desc: "Систематическое столкновение с пугающим стимулом.".into(), completed: false },
            ]
        },
        KptWeek {
            id: 4, title: "Неделя 4: Тест мыслей".into(), desc: "Научиться проводить поведенческие эксперименты для деконструкции страхов и освоить прагматичный пошаговый алгоритм.".into(),
            tasks: vec![
                KptTask { id: "w4_1".into(), title: "Провести поведенческий эксперимент".into(), xp: 25, desc: "Отношение к негативной мысли как к гипотезе.".into(), completed: false },
                KptTask { id: "w4_2".into(), title: "Пройти шаг Терапии решения проблем (PST)".into(), xp: 20, desc: "Прагматичный подход к реальным стрессорам.".into(), completed: false },
            ]
        },
        KptWeek {
            id: 5, title: "Неделя 5: Экспозиция".into(), desc: "Применить специфический для вашей проблемы экспозиционный протокол.".into(),
            tasks: vec![
                KptTask { id: "w5_1".into(), title: "Выполнить таргетную экспозицию".into(), xp: 30, desc: "Специализированная тренировка под ваш тип тревоги.".into(), completed: false },
                KptTask { id: "w5_2".into(), title: "Соблюдать Время для беспокойства".into(), xp: 20, desc: "Разрыв связи между делами и тревогой.".into(), completed: false },
            ]
        },
        KptWeek {
            id: 6, title: "Неделя 6: Ассертивность".into(), desc: "Научиться выражать потребности и защищать границы без чувства вины.".into(),
            tasks: vec![
                KptTask { id: "w6_1".into(), title: "Поведенческая репетиция скрипта".into(), xp: 20, desc: "Тренировка защиты границ без агрессии.".into(), completed: false },
                KptTask { id: "w6_2".into(), title: "Упражнение 'Действуй так, как если бы'".into(), xp: 25, desc: "Формирование самооценки через реальные действия.".into(), completed: false },
            ]
        },
        KptWeek {
            id: 7, title: "Неделя 7: Убеждения".into(), desc: "Раскопать корневую негативную установку и начать активно собирать поведенческие доказательства для здоровой схемы.".into(),
            tasks: vec![
                KptTask { id: "w7_1".into(), title: "Применить Технику падающей стрелы".into(), xp: 25, desc: "Поиск фундаментального глубинного убеждения.".into(), completed: false },
                KptTask { id: "w7_2".into(), title: "Сделать микродействие для нового убеждения".into(), xp: 20, desc: "Нейропластичность требует реальных поступков.".into(), completed: false },
            ]
        },
        KptWeek {
            id: 8, title: "Неделя 8: Профилактика".into(), desc: "Проанализировать графики и дневники, стать собственным терапевтом, создать жесткий план действий.".into(),
            tasks: vec![
                KptTask { id: "w8_1".into(), title: "Проанализировать графики и дневники".into(), xp: 15, desc: "Переход в позицию собственного терапевта.".into(), completed: false },
                KptTask { id: "w8_2".into(), title: "Обновить Личный план профилактики".into(), xp: 30, desc: "Защита от рецидивов.".into(), completed: false },
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
        // Load completion states
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

    let db_cloned = db.clone();
    let db_book = db.clone();
    let db_week = db.clone();

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
                div { class: "flex justify-between items-center mb-4",
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

                div { class: "flex flex-col gap-3",
                    for (i, task) in current_week_data().tasks.iter().enumerate() {
                        div { class: "p-3 bg-surface border border-accent rounded",
                            div { class: "flex items-center justify-between mb-2 cursor-pointer",
                                onclick: {
                                    let db_task = db_cloned.clone();
                                    move |_| {
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
                                },
                                div { class: "flex items-center gap-3",
                                    div { class: if task.completed { "w-5 h-5 border-2 border-blue rounded-sm bg-blue" } else { "w-5 h-5 border-2 border-blue rounded-sm" } }
                                    span { class: if task.completed { "text-sm line-through text-dim" } else { "text-sm" }, "{task.title}" }
                                }
                                span { class: "text-xs font-bold text-blue", "+{task.xp} XP" }
                            }
                            if !task.completed {
                                p { class: "text-xs text-dim border-t border-accent pt-2 mt-2", "{task.desc}" }
                            }
                        }
                    }
                }
            }

            // Bibliotherapy
            div { class: "cyber-border border-emerald",
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
