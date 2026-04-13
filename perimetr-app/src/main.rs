#![allow(non_snake_case)]

mod db;

use dioxus::prelude::*;
use dioxus_logger::tracing::{Level, info};
use db::Db;
use std::sync::Arc;

#[derive(Clone, Copy, PartialEq)]
enum AppRoute {
    Perimetr,
    Kpt,
    Base,
}

fn main() {
    dioxus_logger::init(Level::INFO).expect("failed to init logger");
    info!("Starting Perimetr App");

    dioxus::launch(RootApp);
}

#[component]
fn RootApp() -> Element {
    let db = use_signal(|| Arc::new(Db::new().unwrap()));
    use_context_provider(|| db());

    let current_route = use_signal(|| AppRoute::Perimetr);

    rsx! {
        document::Link { rel: "stylesheet", href: asset!("/assets/style.css") }
        div { class: "app-container",
            Sidebar { current_route }
            div { class: "main-content",
                match current_route() {
                    AppRoute::Perimetr => rsx! { PerimetrView {} },
                    AppRoute::Kpt => rsx! { KptView {} },
                    AppRoute::Base => rsx! { BaseView {} },
                }
            }
        }
    }
}

#[component]
fn Sidebar(mut current_route: Signal<AppRoute>) -> Element {
    rsx! {
        nav { class: "sidebar",
            div { class: "logo", "ПЕРИМЕТР 4.0" }
            button {
                class: if current_route() == AppRoute::Perimetr { "nav-btn active" } else { "nav-btn" },
                onclick: move |_| current_route.set(AppRoute::Perimetr),
                "Дашборд"
            }
            button {
                class: if current_route() == AppRoute::Kpt { "nav-btn active" } else { "nav-btn" },
                onclick: move |_| current_route.set(AppRoute::Kpt),
                "КПТ Протокол"
            }
            button {
                class: if current_route() == AppRoute::Base { "nav-btn active" } else { "nav-btn" },
                onclick: move |_| current_route.set(AppRoute::Base),
                "Стрессоустойчивость"
            }
        }
    }
}

#[component]
fn PerimetrView() -> Element {
    let db = use_context::<Arc<Db>>();

    let mut score = use_signal(|| {
        db.query_row("SELECT score FROM perimetr_state WHERE id = 1", [], |row| row.get::<_, i32>(0)).unwrap_or(0)
    });

    let mut phase0 = use_signal(|| {
        db.query_row("SELECT phase0 FROM perimetr_plan WHERE id = 1", [], |row| row.get::<_, String>(0)).unwrap_or_default()
    });

    let mut phase1 = use_signal(|| {
        db.query_row("SELECT phase1 FROM perimetr_plan WHERE id = 1", [], |row| row.get::<_, String>(0)).unwrap_or_default()
    });

    let mut current_tab = use_signal(|| "tasks");

    let db_for_win = db.clone();
    let db_for_fail = db.clone();
    let db_for_phase0 = db.clone();
    let db_for_phase1 = db.clone();

    rsx! {
        div { class: "view-header",
            div {
                h1 { class: "view-title", "Оперативный Дашборд" }
                p { class: "text-dim text-sm mt-1 uppercase", "Объект: Тимофей" }
            }
            div { class: "flex items-center gap-4",
                div { class: "cyber-border py-1 px-3 flex items-center gap-2",
                    span { class: "mono text-dim", "АГЕНТ 4444:" }
                    span { class: "mono font-bold text-lg text-emerald", "{score}" }
                    div { class: "flex-col border-l border-accent pl-2 ml-2",
                        button {
                            class: "text-[10px] text-emerald hover:text-white block cursor-pointer",
                            onclick: move |_| {
                                let new_score = score() + 10;
                                let _ = db_for_win.execute("UPDATE perimetr_state SET score = ?1 WHERE id = 1", rusqlite::params![new_score]);
                                score.set(new_score);
                            },
                            "▲ WIN"
                        }
                        button {
                            class: "text-[10px] text-red hover:text-white block cursor-pointer",
                            onclick: move |_| {
                                let new_score = score() - 10;
                                let _ = db_for_fail.execute("UPDATE perimetr_state SET score = ?1 WHERE id = 1", rusqlite::params![new_score]);
                                score.set(new_score);
                            },
                            "▼ FAIL"
                        }
                    }
                }
            }
        }

        div { class: "cyber-border mb-6",
            div { class: "grid-2",
                div {
                    label { class: "text-xs font-bold text-emerald uppercase mb-2 block", "Генеральная Цель (Миссия)" }
                    textarea { rows: 4, placeholder: "КТО:\nЧТО:\nКОГДА:\nЗАЧЕМ:" }
                }
                div {
                    label { class: "text-xs font-bold text-orange uppercase mb-2 block", "Три Пули (Фокус дня)" }
                    textarea { rows: 4, class: "border-orange", placeholder: "1.\n2.\n3." }
                }
            }
        }

        div { class: "flex gap-4 border-b border-accent mb-6 overflow-x-auto",
            button {
                class: if current_tab() == "tasks" { "tab-btn active" } else { "tab-btn" },
                onclick: move |_| current_tab.set("tasks"),
                "Боевой Ритм"
            }
            button {
                class: if current_tab() == "plan" { "tab-btn active" } else { "tab-btn" },
                onclick: move |_| current_tab.set("plan"),
                "План операции"
            }
        }

        match current_tab() {
            "tasks" => rsx! {
                div { class: "cyber-border",
                    h2 { class: "text-emerald uppercase text-sm mb-4", "Ежедневно" }
                    div { class: "flex items-center gap-3 p-2 hover-bg-accent rounded cursor-pointer",
                        div { class: "w-5 h-5 border-2 border-emerald rounded-sm" }
                        span { "Утренний оперативный брифинг (ПОЛНЫЙ SAS)" }
                        span { class: "ml-auto text-[10px] mono text-dim", "15 мин" }
                    }
                }
            },
            "plan" => rsx! {
                div { class: "grid gap-6",
                    div { class: "cyber-border",
                        h3 { class: "text-md font-bold text-emerald uppercase mb-2", "Фаза 0: Рекогносцировка себя (H2F)" }
                        textarea {
                            rows: 6,
                            value: "{phase0}",
                            onchange: move |evt| {
                                let val = evt.value();
                                let _ = db_for_phase0.execute("UPDATE perimetr_plan SET phase0 = ?1 WHERE id = 1", rusqlite::params![val]);
                                phase0.set(val);
                            }
                        }
                    }
                    div { class: "cyber-border",
                        h3 { class: "text-md font-bold text-emerald uppercase mb-2", "Фаза 1: Разведка поля операции (IPB)" }
                        textarea {
                            rows: 6,
                            value: "{phase1}",
                            onchange: move |evt| {
                                let val = evt.value();
                                let _ = db_for_phase1.execute("UPDATE perimetr_plan SET phase1 = ?1 WHERE id = 1", rusqlite::params![val]);
                                phase1.set(val);
                            }
                        }
                    }
                }
            },
            _ => rsx! { div {} }
        }
    }
}

#[component]
fn KptView() -> Element {
    let db = use_context::<Arc<Db>>();

    let xp = use_signal(|| {
        db.query_row("SELECT xp FROM kpt_state WHERE id = 1", [], |row| row.get::<_, i32>(0)).unwrap_or(0)
    });
    let level = use_signal(|| {
        db.query_row("SELECT level FROM kpt_state WHERE id = 1", [], |row| row.get::<_, i32>(0)).unwrap_or(1)
    });
    let max_page = use_signal(|| {
        db.query_row("SELECT max_page FROM kpt_state WHERE id = 1", [], |row| row.get::<_, i32>(0)).unwrap_or(0)
    });

    let current_level_xp = xp() % 100;
    let xp_left = 100 - current_level_xp;
    let progress_pct = current_level_xp as f32;

    let book_pct = ((max_page() as f32 / 400.0) * 100.0).round() as i32;

    rsx! {
        div { class: "view-header",
            div {
                h1 { class: "view-title text-blue", "КПТ Протокол" }
                p { class: "text-dim text-sm mt-1 uppercase", "Геймифицированный Трекер" }
            }
            div { class: "flex items-center gap-2 cyber-border py-1 px-3 border-blue",
                span { class: "mono font-bold text-blue", "Уровень {level}" }
            }
        }

        div { class: "mb-6",
            div { class: "w-full bg-surface rounded h-2 mb-1 border border-accent",
                div { class: "bg-blue h-full rounded transition-all", style: "width: {progress_pct}%" }
            }
            div { class: "flex justify-between text-xs mono text-dim",
                span { "{xp} Всего XP" }
                span { "До ур. {level() + 1} осталось {xp_left} XP" }
            }
        }

        div { class: "grid grid-2 gap-6",
            div { class: "cyber-border",
                h2 { class: "text-sm font-bold text-blue uppercase mb-4", "Текущая неделя: Мониторинг" }
                p { class: "text-sm text-dim mb-4", "Освоить модель СМЭП (возврат локуса контроля), собрать стартовые данные о связи активности с настроением." }

                div { class: "flex items-center justify-between p-3 bg-surface border border-accent rounded mb-2",
                    div { class: "flex items-center gap-3",
                        div { class: "w-5 h-5 border-2 border-blue rounded-sm cursor-pointer hover-bg-accent" }
                        span { class: "text-sm", "Записать мысль по модели СМЭП" }
                    }
                    span { class: "text-xs font-bold text-blue", "+20 XP" }
                }
                div { class: "flex items-center justify-between p-3 bg-surface border border-accent rounded",
                    div { class: "flex items-center gap-3",
                        div { class: "w-5 h-5 border-2 border-blue rounded-sm cursor-pointer hover-bg-accent" }
                        span { class: "text-sm", "Выполнить одно микродействие" }
                    }
                    span { class: "text-xs font-bold text-blue", "+15 XP" }
                }
            }

            div { class: "cyber-border border-emerald",
                h2 { class: "text-sm font-bold text-emerald uppercase mb-4", "Библиотерапия" }
                p { class: "text-sm text-dim mb-4", "Чтение: «Когнитивная терапия», Джудит Бек. +2 XP за страницу." }

                div { class: "flex-col gap-2 mb-4",
                    label { class: "text-xs font-bold text-dim uppercase", "Текущая страница (из 400)" }
                    input {
                        type: "number",
                        value: "{max_page}",
                        placeholder: "0",
                        class: "text-lg font-bold border-emerald"
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
fn BaseView() -> Element {
    let mut current_mode = use_signal(|| "base");
    let mut is_running = use_signal(|| false);

    rsx! {
        div { class: "view-header",
            div {
                h1 { class: "view-title text-orange", "Стрессоустойчивость" }
                p { class: "text-dim text-sm mt-1 uppercase", "Работа с вегетативной нервной системой" }
            }
        }

        div { class: "flex justify-center mb-6",
            div { class: "bg-surface p-1 rounded-sm border border-accent flex gap-2 w-full max-w-md",
                button {
                    class: if current_mode() == "base" { "tab-btn-pill active" } else { "tab-btn-pill" },
                    onclick: move |_| current_mode.set("base"),
                    "База"
                }
                button {
                    class: if current_mode() == "arsenal" { "tab-btn-pill active" } else { "tab-btn-pill" },
                    onclick: move |_| current_mode.set("arsenal"),
                    "Арсенал"
                }
                button {
                    class: if current_mode() == "full" { "tab-btn-pill active" } else { "tab-btn-pill" },
                    onclick: move |_| current_mode.set("full"),
                    "Максимум"
                }
            }
        }

        div { class: "flex flex-col items-center",
            div { class: "cyber-border w-full max-w-md p-8 flex flex-col items-center",
                h2 { class: "text-lg font-bold uppercase mb-1",
                    if current_mode() == "base" { "Базовая Подготовка" }
                    else if current_mode() == "arsenal" { "Расширенный Арсенал" }
                    else { "Максимум (Слияние)" }
                }
                p { class: "text-sm text-dim mb-8 h-4",
                    if current_mode() == "base" { "Программа 20 минут" }
                    else if current_mode() == "arsenal" { "Авто-комплекс 30 минут" }
                    else { "Полный цикл 50 минут" }
                }

                // Breathing Ring (CSS implementation)
                div { class: "timer-container mb-8",
                    div { class: "progress-ring-bg",
                        div {
                            class: "progress-ring-fg",
                            style: if is_running() { "animation: pulse 4s infinite, rotate-border 60s linear infinite;" } else { "" }
                        }
                    }
                    div { class: "timer-content",
                        span { class: "phase-text", if is_running() { "ВДОХ" } else { "ОЖИДАНИЕ" } }
                        span { class: "time-text", "20:00" }
                    }
                }

                div { class: "flex gap-4 w-full",
                    button {
                        class: "btn-primary flex-1",
                        onclick: move |_| is_running.set(!is_running()),
                        if is_running() { "ПАУЗА" } else { "СТАРТ" }
                    }
                    button {
                        class: "btn-secondary flex-1",
                        onclick: move |_| is_running.set(false),
                        "СБРОС"
                    }
                }
            }
        }
    }
}
