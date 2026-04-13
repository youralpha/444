#![allow(non_snake_case)]

mod db;
mod kpt;
mod base_timer;

use dioxus::prelude::*;
use dioxus_logger::tracing::{Level, info};
use db::Db;
use std::sync::Arc;
use kpt::KptView;
use base_timer::BaseView;

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
            button { class: if current_route() == AppRoute::Perimetr { "nav-btn active" } else { "nav-btn" }, onclick: move |_| current_route.set(AppRoute::Perimetr), "Дашборд" }
            button { class: if current_route() == AppRoute::Kpt { "nav-btn active" } else { "nav-btn" }, onclick: move |_| current_route.set(AppRoute::Kpt), "КПТ Протокол" }
            button { class: if current_route() == AppRoute::Base { "nav-btn active" } else { "nav-btn" }, onclick: move |_| current_route.set(AppRoute::Base), "Стрессоустойчивость" }
        }
    }
}

#[derive(Clone, PartialEq)]
struct NetworkContact {
    id: String,
    name: String,
    callsign: String,
    role: String,
    circle: String,
}

#[component]
fn PerimetrView() -> Element {
    let db = use_context::<Arc<Db>>();

    let mut score = use_signal(|| db.query_row("SELECT score FROM perimetr_state WHERE id = 1", [], |row| row.get::<_, i32>(0)).unwrap_or(0));
    let mut mission = use_signal(|| db.query_row("SELECT mission FROM perimetr_focus WHERE id = 1", [], |row| row.get::<_, String>(0)).unwrap_or_default());
    let mut bullets = use_signal(|| db.query_row("SELECT bullets FROM perimetr_focus WHERE id = 1", [], |row| row.get::<_, String>(0)).unwrap_or_default());
    let mut phase0 = use_signal(|| db.query_row("SELECT phase0 FROM perimetr_plan WHERE id = 1", [], |row| row.get::<_, String>(0)).unwrap_or_default());
    let mut phase1 = use_signal(|| db.query_row("SELECT phase1 FROM perimetr_plan WHERE id = 1", [], |row| row.get::<_, String>(0)).unwrap_or_default());

    let mut contacts = use_signal(|| {
        db.query_map("SELECT id, name, callsign, role, circle FROM perimetr_network", [], |row| {
            Ok(NetworkContact { id: row.get(0)?, name: row.get(1)?, callsign: row.get(2)?, role: row.get(3)?, circle: row.get(4)? })
        }).unwrap_or_default()
    });

    let mut current_tab = use_signal(|| "tasks");
    let render_trigger = use_signal(|| 0);

    let is_task_done = {
        let db_cloned = db.clone();
        move |task_id: &'static str| -> bool {
            let _ = render_trigger();
            db_cloned.query_row("SELECT completed FROM perimetr_tasks WHERE id = ?1", rusqlite::params![task_id], |r| r.get(0)).unwrap_or(false)
        }
    };

    rsx! {
        div { class: "view-header",
            div { h1 { class: "view-title", "Оперативный Дашборд" } p { class: "text-dim text-sm mt-1 uppercase", "Объект: Тимофей" } }
            div { class: "flex items-center gap-4",
                div { class: "cyber-border py-1 px-3 flex items-center gap-2",
                    span { class: "mono text-dim", "АГЕНТ 4444:" } span { class: "mono font-bold text-lg text-emerald", "{score}" }
                    div { class: "flex-col border-l border-accent pl-2 ml-2",
                        button { class: "text-[10px] text-emerald hover:text-white block cursor-pointer", onclick: { let db = db.clone(); move |_| { let new_score = score() + 10; let _ = db.execute("UPDATE perimetr_state SET score = ?1 WHERE id = 1", rusqlite::params![new_score]); score.set(new_score); } }, "▲ WIN" }
                        button { class: "text-[10px] text-red hover:text-white block cursor-pointer", onclick: { let db = db.clone(); move |_| { let new_score = score() - 10; let _ = db.execute("UPDATE perimetr_state SET score = ?1 WHERE id = 1", rusqlite::params![new_score]); score.set(new_score); } }, "▼ FAIL" }
                    }
                }
            }
        }

        div { class: "cyber-border mb-6",
            div { class: "grid-2",
                div { label { class: "text-xs font-bold text-emerald uppercase mb-2 block", "Генеральная Цель (Миссия)" }
                    textarea { rows: 4, placeholder: "КТО:\nЧТО:\nКОГДА:\nЗАЧЕМ:", value: "{mission}",
                        onchange: { let db = db.clone(); move |evt| {
                            let val = evt.value();
                            let _ = db.execute("UPDATE perimetr_focus SET mission = ?1 WHERE id = 1", rusqlite::params![val]);
                            mission.set(val);
                        } }
                    }
                }
                div { label { class: "text-xs font-bold text-orange uppercase mb-2 block", "Три Пули (Фокус дня)" }
                    textarea { rows: 4, class: "border-orange", placeholder: "1.\n2.\n3.", value: "{bullets}",
                        onchange: { let db = db.clone(); move |evt| {
                            let val = evt.value();
                            let _ = db.execute("UPDATE perimetr_focus SET bullets = ?1 WHERE id = 1", rusqlite::params![val]);
                            bullets.set(val);
                        } }
                    }
                }
            }
        }

        div { class: "flex gap-4 border-b border-accent mb-6 overflow-x-auto",
            button { class: if current_tab() == "tasks" { "tab-btn active" } else { "tab-btn" }, onclick: move |_| current_tab.set("tasks"), "Боевой Ритм" }
            button { class: if current_tab() == "network" { "tab-btn active" } else { "tab-btn" }, onclick: move |_| current_tab.set("network"), "Агентурная сеть" }
            button { class: if current_tab() == "plan" { "tab-btn active" } else { "tab-btn" }, onclick: move |_| current_tab.set("plan"), "План операции" }
        }

        match current_tab() {
            "tasks" => rsx! {
                div { class: "grid gap-6",
                    div { class: "cyber-border",
                        h2 { class: "text-emerald uppercase text-sm mb-4 border-b border-accent pb-2", "Ежедневно" }
                        TaskItem { id: "d1", title: "Утренний оперативный брифинг (ПОЛНЫЙ SAS)", time: "15 мин", is_done: is_task_done("d1"), db: db.clone(), trigger: render_trigger }
                        TaskItem { id: "d2", title: "OODA Loop (Цикл Бойда)", time: "В моменте", is_done: is_task_done("d2"), db: db.clone(), trigger: render_trigger }
                        TaskItem { id: "d3", title: "Физиологический чек (H2F)", time: "2 мин", is_done: is_task_done("d3"), db: db.clone(), trigger: render_trigger }
                        TaskItem { id: "d4", title: "EOD Дебрифинг (Протокол Отбоя)", time: "10 мин", is_done: is_task_done("d4"), db: db.clone(), trigger: render_trigger }
                    }
                    div { class: "cyber-border",
                        h2 { class: "text-blue uppercase text-sm mb-4 border-b border-accent pb-2", "Еженедельно" }
                        TaskItem { id: "w1", title: "Тактический AAR", time: "30 мин", is_done: is_task_done("w1"), db: db.clone(), trigger: render_trigger }
                        TaskItem { id: "w2", title: "ShadowBox-тренировка", time: "30 мин", is_done: is_task_done("w2"), db: db.clone(), trigger: render_trigger }
                    }
                }
            },
            "network" => {
                let current_contacts = contacts();
                rsx! {
                div { class: "cyber-border",
                    div { class: "flex justify-between items-center mb-6",
                        h2 { class: "text-md font-bold uppercase", "Инженерия социального капитала" }
                        button {
                            class: "btn-primary",
                            onclick: { let db = db.clone(); move |_| {
                                let id = format!("n{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs());
                                let _ = db.execute("INSERT INTO perimetr_network (id, name, callsign, role, circle) VALUES (?1, '', '', '', '3')", rusqlite::params![id]);
                                let updated = db.query_map("SELECT id, name, callsign, role, circle FROM perimetr_network", [], |row| {
                                    Ok(NetworkContact { id: row.get(0)?, name: row.get(1)?, callsign: row.get(2)?, role: row.get(3)?, circle: row.get(4)? })
                                }).unwrap_or_default();
                                contacts.set(updated);
                            }},
                            "+ Новый Контакт"
                        }
                    }

                    div { class: "grid-3",
                        for contact in current_contacts {
                            ContactItem { contact: contact.clone(), contacts: contacts, db: db.clone() }
                        }
                    }
                }
            }},
            "plan" => rsx! {
                div { class: "grid gap-6",
                    div { class: "cyber-border",
                        h3 { class: "text-md font-bold text-emerald uppercase mb-2", "Фаза 0: Рекогносцировка себя (H2F)" }
                        textarea {
                            rows: 6, value: "{phase0}",
                            onchange: { let db = db.clone(); move |evt| {
                                let val = evt.value();
                                let _ = db.execute("UPDATE perimetr_plan SET phase0 = ?1 WHERE id = 1", rusqlite::params![val]);
                                phase0.set(val);
                            }}
                        }
                    }
                    div { class: "cyber-border",
                        h3 { class: "text-md font-bold text-emerald uppercase mb-2", "Фаза 1: Разведка поля операции (IPB)" }
                        textarea {
                            rows: 6, value: "{phase1}",
                            onchange: { let db = db.clone(); move |evt| {
                                let val = evt.value();
                                let _ = db.execute("UPDATE perimetr_plan SET phase1 = ?1 WHERE id = 1", rusqlite::params![val]);
                                phase1.set(val);
                            }}
                        }
                    }
                }
            },
            _ => rsx! { div {} }
        }
    }
}

#[component]
fn TaskItem(id: &'static str, title: &'static str, time: &'static str, is_done: bool, db: Arc<Db>, mut trigger: Signal<i32>) -> Element {
    rsx! {
        div {
            class: "flex items-center gap-3 p-2 hover-bg-accent rounded cursor-pointer mt-2",
            onclick: move |_| {
                let _ = db.execute("INSERT OR REPLACE INTO perimetr_tasks (id, completed) VALUES (?1, ?2)", rusqlite::params![id, !is_done]);
                trigger += 1;
            },
            div {
                class: if is_done { "w-5 h-5 border-2 border-emerald rounded-sm bg-emerald" } else { "w-5 h-5 border-2 border-emerald rounded-sm" },
            }
            span { class: if is_done { "text-dim line-through" } else { "" }, "{title}" }
            span { class: "ml-auto text-[10px] mono text-dim", "{time}" }
        }
    }
}

#[component]
fn ContactItem(contact: NetworkContact, mut contacts: Signal<Vec<NetworkContact>>, db: Arc<Db>) -> Element {
    let mut edit_mode = use_signal(|| false);

    let mut name = use_signal(|| contact.name.clone());
    let mut callsign = use_signal(|| contact.callsign.clone());
    let mut role = use_signal(|| contact.role.clone());

    let c_id = contact.id.clone();


    let c_id4 = contact.id.clone();

    rsx! {
        div { class: "p-4 bg-surface border border-accent rounded",
            if edit_mode() {
                div { class: "flex flex-col gap-2 mb-4",
                    input {
                        placeholder: "Имя", value: "{name}",
                        onchange: move |e| name.set(e.value())
                    }
                    input {
                        placeholder: "Позывной", value: "{callsign}", class: "border-orange",
                        onchange: move |e| callsign.set(e.value())
                    }
                    input {
                        placeholder: "Роль", value: "{role}", class: "border-blue",
                        onchange: move |e| role.set(e.value())
                    }
                    div { class: "flex gap-2 mt-2",
                        button {
                            class: "btn-primary text-xs py-1 px-2",
                            onclick: { let db = db.clone(); move |_| {
                                let _ = db.execute("UPDATE perimetr_network SET name=?1, callsign=?2, role=?3 WHERE id=?4",
                                    rusqlite::params![name(), callsign(), role(), c_id]);

                                let updated = db.query_map("SELECT id, name, callsign, role, circle FROM perimetr_network", [], |row| {
                                    Ok(NetworkContact { id: row.get(0)?, name: row.get(1)?, callsign: row.get(2)?, role: row.get(3)?, circle: row.get(4)? })
                                }).unwrap_or_default();
                                contacts.set(updated);
                                edit_mode.set(false);
                            }},
                            "Сохранить"
                        }
                    }
                }
            } else {
                div { class: "flex justify-between items-start mb-2",
                    span { class: "font-bold text-sm", if contact.name.is_empty() { "Без Имени" } else { "{contact.name}" } }
                    span { class: "text-[10px] text-orange", "«{contact.callsign}»" }
                }
                p { class: "text-[10px] text-blue uppercase mb-4", "{contact.role}" }
            }

            div { class: "flex justify-between items-center border-t border-accent pt-2 mt-2",
                button {
                    class: "text-[10px] text-emerald hover:underline cursor-pointer",
                    onclick: move |_| {
                        edit_mode.set(!edit_mode());
                    },
                    if edit_mode() { "Отмена" } else { "Изменить" }
                }
                button {
                    class: "text-[10px] text-red hover:underline cursor-pointer",
                    onclick: { let db = db.clone(); move |_| {
                        let _ = db.execute("DELETE FROM perimetr_network WHERE id = ?1", rusqlite::params![c_id4]);
                        let updated = db.query_map("SELECT id, name, callsign, role, circle FROM perimetr_network", [], |row| {
                            Ok(NetworkContact { id: row.get(0)?, name: row.get(1)?, callsign: row.get(2)?, role: row.get(3)?, circle: row.get(4)? })
                        }).unwrap_or_default();
                        contacts.set(updated);
                    }},
                    "Удалить"
                }
            }
        }
    }
}
