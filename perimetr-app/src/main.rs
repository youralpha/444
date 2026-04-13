#![allow(non_snake_case)]

mod db;
mod kpt;
mod base_timer;
mod perimetr;

use dioxus::prelude::*;
use dioxus_logger::tracing::{Level, info};
use db::Db;
use std::sync::Arc;
use kpt::KptView;
use base_timer::BaseView;
use perimetr::{get_cycles, ProtocolTask};

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
        style { {include_str!("../assets/style.css")} }
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
    id: String, name: String, callsign: String, role: String, circle: String,
    contact: String, last_date: String, next_date: String, notes: String,
    m: String, i: String, c: String, e: String, value: String, give: String, links: String
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
        db.query_map("SELECT id, name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links FROM perimetr_network", [], |row| {
            Ok(NetworkContact {
                id: row.get(0)?, name: row.get(1)?, callsign: row.get(2)?, role: row.get(3)?, circle: row.get(4)?,
                contact: row.get(5).unwrap_or_default(), last_date: row.get(6).unwrap_or_default(), next_date: row.get(7).unwrap_or_default(),
                notes: row.get(8).unwrap_or_default(), m: row.get(9).unwrap_or_default(), i: row.get(10).unwrap_or_default(),
                c: row.get(11).unwrap_or_default(), e: row.get(12).unwrap_or_default(), value: row.get(13).unwrap_or_default(),
                give: row.get(14).unwrap_or_default(), links: row.get(15).unwrap_or_default()
            })
        }).unwrap_or_default()
    });

    let mut current_tab = use_signal(|| "tasks");
    let mut render_trigger = use_signal(|| 0);

    let mut active_task_modal: Signal<Option<ProtocolTask>> = use_signal(|| None);
    let mut active_asset_modal: Signal<Option<NetworkContact>> = use_signal(|| None);

    let is_task_done = {
        let db_cloned = db.clone();
        move |task_id: &'static str| -> bool {
            let _ = render_trigger();
            let date_key = chrono::Local::now().format("%Y-%m-%d").to_string();
            db_cloned.query_row("SELECT completed FROM perimetr_task_history WHERE date=?1 AND task_id=?2", rusqlite::params![date_key, task_id], |r| r.get(0)).unwrap_or(false)
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
                div { class: "grid grid-2 gap-6",
                    for cycle in get_cycles() {
                        div { class: "cyber-border",
                            h2 { class: "{cycle.color} uppercase text-sm mb-4 border-b border-accent pb-2", "{cycle.title}" }
                            for task in cycle.tasks {
                                div { class: "flex items-center justify-between p-2 hover-bg-accent rounded cursor-pointer mt-2",
                                    onclick: {
                                        let t_clone = task.clone();
                                        move |_| {
                                            active_task_modal.set(Some(t_clone.clone()));
                                        }
                                    },
                                    div { class: "flex items-center gap-3",
                                        div { class: if is_task_done(Box::leak(task.id.clone().into_boxed_str())) { "w-5 h-5 border-2 border-emerald rounded-sm bg-emerald" } else { "w-5 h-5 border-2 border-emerald rounded-sm" } }
                                        span { class: if is_task_done(Box::leak(task.id.clone().into_boxed_str())) { "text-dim line-through text-sm" } else { "text-sm" }, "{task.text}" }
                                    }
                                    span { class: "ml-auto text-[10px] mono text-dim", "{task.time}" }
                                }
                            }
                        }
                    }
                }
            },
            "network" => {
                let current_contacts = contacts();
                rsx! {
                div { class: "cyber-border",
                    div { class: "flex justify-between items-center mb-6 border-b border-accent pb-4",
                        div {
                            h2 { class: "text-md font-bold uppercase", "Инженерия социального капитала" }
                            p { class: "text-[10px] text-dim uppercase mt-1", "Круг 1 (Ближний) | Круг 2 (Оперативный) | Круг 3 (Источники) | Круг 4 (Спящие)" }
                        }
                        button {
                            class: "btn-primary",
                            onclick: { let db = db.clone(); move |_| {
                                let id = format!("n{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs());
                                let _ = db.execute("INSERT INTO perimetr_network (id, name, callsign, role, circle) VALUES (?1, '', '', '', '3')", rusqlite::params![id]);
                                let updated = db.query_map("SELECT id, name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links FROM perimetr_network", [], |row| {
                                    Ok(NetworkContact {
                                        id: row.get(0)?, name: row.get(1)?, callsign: row.get(2)?, role: row.get(3)?, circle: row.get(4)?,
                                        contact: row.get(5).unwrap_or_default(), last_date: row.get(6).unwrap_or_default(), next_date: row.get(7).unwrap_or_default(),
                                        notes: row.get(8).unwrap_or_default(), m: row.get(9).unwrap_or_default(), i: row.get(10).unwrap_or_default(),
                                        c: row.get(11).unwrap_or_default(), e: row.get(12).unwrap_or_default(), value: row.get(13).unwrap_or_default(),
                                        give: row.get(14).unwrap_or_default(), links: row.get(15).unwrap_or_default()
                                    })
                                }).unwrap_or_default();
                                contacts.set(updated);
                            }},
                            "+ Новый Контакт"
                        }
                    }

                    for circle_id in ["1", "2", "3", "4"].iter() {
                        div { class: "mb-6 p-4 bg-tactical-900 border border-accent rounded",
                            h3 { class: "text-sm font-bold uppercase text-emerald mb-4", "Круг {circle_id}" }
                            div { class: "grid-3",
                                for contact in current_contacts.iter().filter(|c| c.circle == **circle_id) {
                                    div { class: "p-4 bg-surface border border-accent rounded flex flex-col cursor-pointer hover-bg-accent transition-all",
                                        onclick: {
                                            let c_clone = contact.clone();
                                            move |_| active_asset_modal.set(Some(c_clone.clone()))
                                        },
                                        div { class: "flex justify-between items-start mb-2",
                                            span { class: "font-bold text-sm", if contact.name.is_empty() { "Без Имени" } else { "{contact.name}" } }
                                            span { class: "text-[10px] text-orange", "«{contact.callsign}»" }
                                        }
                                        p { class: "text-[10px] text-blue uppercase mb-4 border-b border-accent pb-2", "{contact.role}" }
                                        if !contact.m.is_empty() || !contact.i.is_empty() {
                                            div { class: "text-xs text-dim mt-auto",
                                                if !contact.m.is_empty() { span { "M: {contact.m} " } }
                                                if !contact.i.is_empty() { span { "I: {contact.i} " } }
                                            }
                                        }
                                    }
                                }
                            }
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

        // Task Modal
        if let Some(task) = active_task_modal() {
            TaskModal {
                task: task.clone(),
                on_close: move |_| {
                    render_trigger += 1;
                    active_task_modal.set(None);
                },
                db: db.clone()
            }
        }

        // Asset (Contact) Modal
        if let Some(contact) = active_asset_modal() {
            AssetModal {
                contact: contact.clone(),
                contacts: contacts,
                on_close: move |_| active_asset_modal.set(None),
                db: db.clone()
            }
        }
    }
}

#[component]
fn TaskModal(task: ProtocolTask, on_close: EventHandler<MouseEvent>, db: Arc<Db>) -> Element {
    let date_key = chrono::Local::now().format("%Y-%m-%d").to_string();
    let raw_data: String = db.query_row("SELECT field_data FROM perimetr_task_history WHERE date=?1 AND task_id=?2", rusqlite::params![date_key.clone(), task.id.clone()], |r| r.get(0)).unwrap_or("{}".into());
    let saved_answers: std::collections::HashMap<String, String> = serde_json::from_str(&raw_data).unwrap_or_default();

    let mut is_completed = use_signal(|| {
        db.query_row("SELECT completed FROM perimetr_task_history WHERE date=?1 AND task_id=?2", rusqlite::params![date_key.clone(), task.id.clone()], |r| r.get(0)).unwrap_or(false)
    });

    let db_c = db.clone();
    let t_id = task.id.clone();
    let d_key = date_key.clone();

    rsx! {
        div { class: "fixed inset-0 z-50 flex items-center justify-center p-4",
            div { class: "absolute inset-0 bg-black/80 backdrop-blur-sm modal-overlay", onclick: move |evt| on_close.call(evt) }
            div { class: "relative bg-tactical-800 border border-accent rounded w-full max-w-2xl max-h-[90vh] flex flex-col modal-content shadow-2xl",
                div { class: "p-6 border-b border-accent flex justify-between items-start",
                    div { h3 { class: "text-xl font-bold text-white uppercase", "{task.text}" } p { class: "text-sm text-emerald mono mt-1", "Норматив: {task.time}" } }
                }
                div { class: "p-6 overflow-y-auto custom-scrollbar",
                    div { class: "text-dim text-sm mb-6 p-4 bg-tactical-900 border-l-4 border-emerald rounded", "{task.description}" }
                    div { class: "flex flex-col gap-4",
                        for field in task.fields.clone() {
                            div { class: "flex flex-col gap-1",
                                label { class: "text-xs font-bold text-dim uppercase", "{field.label}" }
                                if field.type_ == "textarea" {
                                    textarea {
                                        rows: 3, placeholder: "{field.placeholder.clone().unwrap_or_default()}", class: "text-sm bg-tactical-900",
                                        value: "{saved_answers.get(&field.id).cloned().unwrap_or_default()}",
                                        onchange: {
                                            let db_i = db.clone();
                                            let d_key_i = date_key.clone();
                                            let t_id_i = task.id.clone();
                                            let f_id_i = field.id.clone();
                                            let mut answers = saved_answers.clone();
                                            move |evt| {
                                                answers.insert(f_id_i.clone(), evt.value());
                                                let json_str = serde_json::to_string(&answers).unwrap();
                                                let _ = db_i.execute("INSERT OR REPLACE INTO perimetr_task_history (date, task_id, completed, field_data) VALUES (?1, ?2, ?3, ?4)", rusqlite::params![d_key_i.clone(), t_id_i.clone(), is_completed(), json_str]);
                                            }
                                        }
                                    }
                                } else {
                                    input {
                                        type: "{field.type_}", placeholder: "{field.placeholder.clone().unwrap_or_default()}", class: "text-sm bg-tactical-900",
                                        value: "{saved_answers.get(&field.id).cloned().unwrap_or_default()}",
                                        onchange: {
                                            let db_i = db.clone();
                                            let d_key_i = date_key.clone();
                                            let t_id_i = task.id.clone();
                                            let f_id_i = field.id.clone();
                                            let mut answers = saved_answers.clone();
                                            move |evt| {
                                                answers.insert(f_id_i.clone(), evt.value());
                                                let json_str = serde_json::to_string(&answers).unwrap();
                                                let _ = db_i.execute("INSERT OR REPLACE INTO perimetr_task_history (date, task_id, completed, field_data) VALUES (?1, ?2, ?3, ?4)", rusqlite::params![d_key_i.clone(), t_id_i.clone(), is_completed(), json_str]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                div { class: "p-6 border-t border-accent flex justify-between items-center bg-tactical-900",
                    div { class: "flex items-center gap-3 cursor-pointer",
                        onclick: move |_| {
                            let newly_completed = !is_completed();
                            is_completed.set(newly_completed);
                            let _ = db_c.execute("UPDATE perimetr_task_history SET completed=?1 WHERE date=?2 AND task_id=?3", rusqlite::params![newly_completed, d_key.clone(), t_id.clone()]);
                        },
                        div { class: if is_completed() { "w-6 h-6 border-2 border-emerald rounded bg-emerald" } else { "w-6 h-6 border-2 border-emerald rounded" } }
                        span { class: "font-bold text-sm", if is_completed() { "Выполнено" } else { "Отметить выполненным" } }
                    }
                    button { class: "btn-primary", onclick: move |evt| on_close.call(evt), "Закрыть" }
                }
            }
        }
    }
}

#[component]
fn AssetModal(contact: NetworkContact, mut contacts: Signal<Vec<NetworkContact>>, on_close: EventHandler<MouseEvent>, db: Arc<Db>) -> Element {
    let mut name = use_signal(|| contact.name.clone());
    let mut callsign = use_signal(|| contact.callsign.clone());
    let mut role = use_signal(|| contact.role.clone());
    let mut circle = use_signal(|| contact.circle.clone());
    let mut contact_info = use_signal(|| contact.contact.clone());
    let mut last_date = use_signal(|| contact.last_date.clone());
    let mut next_date = use_signal(|| contact.next_date.clone());
    let mut m = use_signal(|| contact.m.clone());
    let mut i = use_signal(|| contact.i.clone());
    let mut c = use_signal(|| contact.c.clone());
    let mut e = use_signal(|| contact.e.clone());
    let mut notes = use_signal(|| contact.notes.clone());
    let mut value = use_signal(|| contact.value.clone());
    let mut give = use_signal(|| contact.give.clone());

    let c_id = contact.id.clone();
    let c_id_del = contact.id.clone();

    rsx! {
        div { class: "fixed inset-0 z-[60] flex items-center justify-center p-4",
            div { class: "absolute inset-0 bg-black/80 backdrop-blur-sm modal-overlay", onclick: move |evt| on_close.call(evt) }
            div { class: "relative bg-tactical-800 border border-accent rounded w-full max-w-2xl max-h-[90vh] flex flex-col modal-content shadow-2xl",
                div { class: "p-6 border-b border-accent bg-tactical-800",
                    h3 { class: "text-xl font-bold text-white uppercase", "Досье Агента" }
                }

                div { class: "p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5",
                    div { class: "grid-3",
                        div { class: "flex-col", label { class: "text-xs font-bold text-dim uppercase mb-1", "Имя" } input { value: "{name}", class: "bg-tactical-900 text-sm", onchange: move |e| name.set(e.value()) } }
                        div { class: "flex-col", label { class: "text-xs font-bold text-orange uppercase mb-1", "Позывной" } input { value: "{callsign}", class: "bg-tactical-900 text-sm border-orange", onchange: move |e| callsign.set(e.value()) } }
                        div { class: "flex-col", label { class: "text-xs font-bold text-dim uppercase mb-1", "Роль" } input { value: "{role}", class: "bg-tactical-900 text-sm", onchange: move |e| role.set(e.value()) } }
                    }
                    div { class: "grid-2",
                        div { class: "flex-col", label { class: "text-xs font-bold text-dim uppercase mb-1", "Связь" } input { value: "{contact_info}", class: "bg-tactical-900 text-sm", onchange: move |e| contact_info.set(e.value()) } }
                        div { class: "flex-col", label { class: "text-xs font-bold text-dim uppercase mb-1", "Круг доступа" }
                            select { value: "{circle}", class: "bg-tactical-900 text-sm", onchange: move |e| circle.set(e.value()),
                                option { value: "1", "Круг 1: Ближний (Доверие)" }
                                option { value: "2", "Круг 2: Оперативный (Выгода)" }
                                option { value: "3", "Круг 3: Источники (Слухи)" }
                                option { value: "4", "Круг 4: Спящие (Резерв)" }
                            }
                        }
                    }
                    div { class: "grid-2",
                        div { class: "flex-col", label { class: "text-xs font-bold text-dim uppercase mb-1", "Последний контакт" } input { type: "date", value: "{last_date}", class: "bg-tactical-900 text-sm", onchange: move |e| last_date.set(e.value()) } }
                        div { class: "flex-col", label { class: "text-xs font-bold text-blue uppercase mb-1", "Следующий шаг" } input { type: "date", value: "{next_date}", class: "bg-tactical-900 text-sm border-blue", onchange: move |e| next_date.set(e.value()) } }
                    }
                    div { class: "flex-col", label { class: "text-xs font-bold text-dim uppercase mb-1", "Примечание" } textarea { rows: 2, value: "{notes}", class: "bg-tactical-900 text-sm", onchange: move |e| notes.set(e.value()) } }

                    div { class: "bg-tactical-900 border border-accent p-4 rounded-sm",
                        h4 { class: "text-xs font-bold text-emerald uppercase mb-3 border-b border-accent pb-2", "Матрица Мотивации (M.I.C.E.)" }
                        div { class: "grid-2",
                            input { placeholder: "Money (Деньги)", value: "{m}", class: "text-sm", onchange: move |e| m.set(e.value()) }
                            input { placeholder: "Ideology (Идеология)", value: "{i}", class: "text-sm", onchange: move |e| i.set(e.value()) }
                            input { placeholder: "Coercion (Принуждение)", value: "{c}", class: "text-sm", onchange: move |e| c.set(e.value()) }
                            input { placeholder: "Ego (Эго)", value: "{e}", class: "text-sm", onchange: move |evt| e.set(evt.value()) }
                        }
                    }
                    div { class: "flex-col", label { class: "text-xs font-bold text-dim uppercase mb-1", "Асимметричная ценность" } textarea { rows: 2, value: "{value}", class: "bg-tactical-900 text-sm", onchange: move |e| value.set(e.value()) } }
                    div { class: "flex-col", label { class: "text-xs font-bold text-blue uppercase mb-1", "Стратегия \"Дающего\"" } textarea { rows: 2, value: "{give}", class: "bg-tactical-900 text-sm", onchange: move |e| give.set(e.value()) } }
                }

                div { class: "p-6 border-t border-accent flex justify-between items-center bg-tactical-900",
                    button {
                        class: "text-red text-sm hover:underline cursor-pointer",
                        onclick: { let db = db.clone();  move |evt| {
                            let _ = db.execute("DELETE FROM perimetr_network WHERE id = ?1", rusqlite::params![c_id_del.clone()]);
                            let updated = db.query_map("SELECT id, name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links FROM perimetr_network", [], |row| { Ok(NetworkContact { id: row.get(0)?, name: row.get(1)?, callsign: row.get(2)?, role: row.get(3)?, circle: row.get(4)?, contact: row.get(5).unwrap_or_default(), last_date: row.get(6).unwrap_or_default(), next_date: row.get(7).unwrap_or_default(), notes: row.get(8).unwrap_or_default(), m: row.get(9).unwrap_or_default(), i: row.get(10).unwrap_or_default(), c: row.get(11).unwrap_or_default(), e: row.get(12).unwrap_or_default(), value: row.get(13).unwrap_or_default(), give: row.get(14).unwrap_or_default(), links: row.get(15).unwrap_or_default() }) }).unwrap_or_default();
                            contacts.set(updated);
                            on_close.call(evt);
                        }},
                        "Удалить досье"
                    }
                    div { class: "flex gap-3",
                        button { class: "text-dim hover:text-white transition-colors px-4 py-2 text-sm", onclick: move |evt| on_close.call(evt), "Отмена" }
                        button {
                            class: "btn-primary",
                            onclick: { let db = db.clone();  move |evt| {
                                let _ = db.execute("UPDATE perimetr_network SET name=?1, callsign=?2, role=?3, circle=?4, contact=?5, last_date=?6, next_date=?7, notes=?8, m=?9, i=?10, c=?11, e=?12, value=?13, give=?14 WHERE id=?15",
                                    rusqlite::params![name(), callsign(), role(), circle(), contact_info(), last_date(), next_date(), notes(), m(), i(), c(), e(), value(), give(), c_id.clone()]);
                                let updated = db.query_map("SELECT id, name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links FROM perimetr_network", [], |row| { Ok(NetworkContact { id: row.get(0)?, name: row.get(1)?, callsign: row.get(2)?, role: row.get(3)?, circle: row.get(4)?, contact: row.get(5).unwrap_or_default(), last_date: row.get(6).unwrap_or_default(), next_date: row.get(7).unwrap_or_default(), notes: row.get(8).unwrap_or_default(), m: row.get(9).unwrap_or_default(), i: row.get(10).unwrap_or_default(), c: row.get(11).unwrap_or_default(), e: row.get(12).unwrap_or_default(), value: row.get(13).unwrap_or_default(), give: row.get(14).unwrap_or_default(), links: row.get(15).unwrap_or_default() }) }).unwrap_or_default();
                                contacts.set(updated);
                                on_close.call(evt);
                            }},
                            "Сохранить досье"
                        }
                    }
                }
            }
        }
    }
}
