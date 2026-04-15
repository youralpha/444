use tauri::{State, Manager, AppHandle, PhysicalPosition, Emitter, WindowEvent};
use std::thread;
mod db;
use db::{Db, GeneralState, NetworkContact, CustomTask, TaskHistory, TimerState, TimerTask, KptState};

#[tauri::command]
fn get_general_state(state: State<'_, Db>) -> Result<GeneralState, String> {
    let conn = state.conn.lock().unwrap();
    let (score, overlay_position): (i32, String) = conn.query_row("SELECT score, overlay_pos FROM perimetr_state WHERE id = 1", [], |r| Ok((r.get(0)?, r.get(1)?))).unwrap_or((0, "bottom".into()));
    let (mission, bullets): (String, String) = conn.query_row("SELECT mission, bullets FROM perimetr_focus WHERE id = 1", [], |r| Ok((r.get(0)?, r.get(1)?))).unwrap_or(("".into(), "".into()));
    let (phase0, phase1): (String, String) = conn.query_row("SELECT phase0, phase1 FROM perimetr_plan WHERE id = 1", [], |r| Ok((r.get(0)?, r.get(1)?))).unwrap_or(("".into(), "".into()));
    Ok(GeneralState { score, mission, bullets, phase0, phase1, overlay_position })
}

#[tauri::command]
fn save_general_state(state: State<'_, Db>, gs: GeneralState, app: AppHandle) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("UPDATE perimetr_state SET score = ?, overlay_pos = ? WHERE id = 1", (gs.score, &gs.overlay_position)).map_err(|e| e.to_string())?;
    conn.execute("UPDATE perimetr_focus SET mission = ?, bullets = ? WHERE id = 1", (gs.mission, gs.bullets.clone())).map_err(|e| e.to_string())?;
    conn.execute("UPDATE perimetr_plan SET phase0 = ?, phase1 = ? WHERE id = 1", (gs.phase0, gs.phase1)).map_err(|e| e.to_string())?;

    // Broadcast update to overlay window if it exists
    let _ = app.emit("bullets_updated", gs.bullets);

    // Also reposition overlay if it changed
    if let Some(overlay_window) = app.get_webview_window("overlay") {
        if let Ok(Some(monitor)) = overlay_window.primary_monitor() {
            let size = monitor.size();
            let scale_factor = monitor.scale_factor();
            let overlay_width = 1000.0 * scale_factor;
            let overlay_height = 50.0 * scale_factor;

            let y_pos = if gs.overlay_position == "top" {
                0.0
            } else {
                (size.height as f64) - overlay_height
            };

            let pos = PhysicalPosition::new(
                ((size.width as f64) / 2.0 - overlay_width / 2.0) as i32,
                y_pos as i32,
            );
            let _ = overlay_window.set_position(tauri::Position::Physical(pos));
        }
    }

    Ok(())
}

#[tauri::command]
fn get_contacts(state: State<'_, Db>) -> Result<Vec<NetworkContact>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links FROM perimetr_network").map_err(|e| e.to_string())?;
    let it = stmt.query_map([], |r| Ok(NetworkContact {
        id: r.get(0)?, name: r.get(1)?, callsign: r.get(2)?, role: r.get(3)?, circle: r.get(4)?, contact: r.get(5)?, last_date: r.get(6)?, next_date: r.get(7)?,
        notes: r.get(8)?, m: r.get(9)?, i: r.get(10)?, c: r.get(11)?, e: r.get(12)?, value: r.get(13)?, give: r.get(14)?, links: r.get(15)?
    })).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for i in it { if let Ok(c) = i { res.push(c); } }
    Ok(res)
}

#[tauri::command]
fn save_contact(state: State<'_, Db>, contact: NetworkContact) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("INSERT OR REPLACE INTO perimetr_network (id, name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (contact.id, contact.name, contact.callsign, contact.role, contact.circle, contact.contact, contact.last_date, contact.next_date, contact.notes, contact.m, contact.i, contact.c, contact.e, contact.value, contact.give, contact.links)
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_contact(state: State<'_, Db>, id: String) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("DELETE FROM perimetr_network WHERE id = ?", [id.clone()]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_custom_tasks(state: State<'_, Db>) -> Result<Vec<CustomTask>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, cycle, title, time, desc, fields_json FROM perimetr_custom_tasks").map_err(|e| e.to_string())?;
    let it = stmt.query_map([], |r| Ok(CustomTask {
        id: r.get(0)?, cycle: r.get(1)?, title: r.get(2)?, time: r.get(3)?, desc: r.get(4)?, fields_json: r.get(5)?
    })).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for i in it { if let Ok(c) = i { res.push(c); } }
    Ok(res)
}

#[tauri::command]
fn save_custom_task(state: State<'_, Db>, task: CustomTask) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("INSERT OR REPLACE INTO perimetr_custom_tasks (id, cycle, title, time, desc, fields_json) VALUES (?, ?, ?, ?, ?, ?)",
        (task.id, task.cycle, task.title, task.time, task.desc, task.fields_json)
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_custom_task(state: State<'_, Db>, id: String) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("DELETE FROM perimetr_custom_tasks WHERE id = ?", [id.clone()]).map_err(|e| e.to_string())?;
    // We also consider that "deleted default tasks" might just be saved to a separate table.
    // Or we just insert them as "deleted" into a generic deleted_tasks list.
    // We will just create a basic table for deleted tasks on the fly if needed.
    let _ = conn.execute("CREATE TABLE IF NOT EXISTS perimetr_deleted_tasks (id TEXT PRIMARY KEY)", []);
    let _ = conn.execute("INSERT OR IGNORE INTO perimetr_deleted_tasks (id) VALUES (?)", [id.clone()]);
    Ok(())
}

#[tauri::command]
fn get_deleted_tasks(state: State<'_, Db>) -> Result<Vec<String>, String> {
    let conn = state.conn.lock().unwrap();
    let _ = conn.execute("CREATE TABLE IF NOT EXISTS perimetr_deleted_tasks (id TEXT PRIMARY KEY)", []);
    let mut stmt = conn.prepare("SELECT id FROM perimetr_deleted_tasks").map_err(|e| e.to_string())?;
    let it = stmt.query_map([], |r| Ok(r.get(0)?)).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for i in it { if let Ok(c) = i { res.push(c); } }
    Ok(res)
}


#[tauri::command]
fn get_task_history(state: State<'_, Db>, task_id: String, date: String) -> Result<TaskHistory, String> {
    let conn = state.conn.lock().unwrap();
    let (completed, field_data): (bool, String) = conn.query_row(
        "SELECT completed, field_data FROM perimetr_task_history WHERE task_id = ? AND date = ?",
        [task_id, date],
        |r| Ok((r.get(0)?, r.get(1)?))
    ).unwrap_or((false, "{}".into()));
    Ok(TaskHistory { completed, field_data })
}

#[tauri::command]
fn save_task_history(state: State<'_, Db>, task_id: String, date: String, completed: bool, field_data: String) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute(
        "INSERT OR REPLACE INTO perimetr_task_history (task_id, date, completed, field_data) VALUES (?, ?, ?, ?)",
        (task_id, date, completed, field_data)
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_timer_state(state: State<'_, Db>) -> Result<TimerState, String> {
    let conn = state.conn.lock().unwrap();
    let (running, elapsed, current_task): (bool, i32, String) = conn.query_row(
        "SELECT running, elapsed, current_task FROM timer_state WHERE id = 1", [],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?))
    ).unwrap_or((false, 0, "".into()));
    Ok(TimerState { running, elapsed, current_task })
}

#[tauri::command]
fn save_timer_state(state: State<'_, Db>, ts: TimerState) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("UPDATE timer_state SET running = ?, elapsed = ?, current_task = ? WHERE id = 1", (ts.running, ts.elapsed, ts.current_task)).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_timer_tasks(state: State<'_, Db>) -> Result<Vec<TimerTask>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, date, duration, description FROM timer_tasks ORDER BY rowid DESC").map_err(|e| e.to_string())?;
    let it = stmt.query_map([], |r| Ok(TimerTask {
        id: r.get(0)?, date: r.get(1)?, duration: r.get(2)?, description: r.get(3)?
    })).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for i in it { if let Ok(c) = i { res.push(c); } }
    Ok(res)
}

#[tauri::command]
fn add_timer_task(state: State<'_, Db>, task: TimerTask) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("INSERT INTO timer_tasks (id, date, duration, description) VALUES (?, ?, ?, ?)", (task.id, task.date, task.duration, task.description)).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_kpt_state(state: State<'_, Db>) -> Result<KptState, String> {
    let conn = state.conn.lock().unwrap();
    let (xp, level, current_week): (i32, i32, i32) = conn.query_row(
        "SELECT xp, level, current_week FROM kpt_state WHERE id = 1", [],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?))
    ).unwrap_or((0, 1, 1));
    Ok(KptState { xp, level, current_week })
}

#[tauri::command]
fn save_kpt_state(state: State<'_, Db>, ks: KptState) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("UPDATE kpt_state SET xp = ?, level = ?, current_week = ? WHERE id = 1", (ks.xp, ks.level, ks.current_week)).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_kpt_task(state: State<'_, Db>, task_id: String) -> Result<bool, String> {
    let conn = state.conn.lock().unwrap();
    let done: bool = conn.query_row("SELECT completed FROM kpt_tasks WHERE task_id = ?", [task_id], |r| r.get(0)).unwrap_or(false);
    Ok(done)
}

#[tauri::command]
fn save_kpt_task(state: State<'_, Db>, task_id: String, completed: bool, date: String) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("INSERT OR REPLACE INTO kpt_tasks (task_id, completed) VALUES (?, ?)", (task_id, completed)).map_err(|e| e.to_string())?;
    if completed {
        conn.execute("INSERT OR IGNORE INTO kpt_calendar (date, has_activity) VALUES (?, 1)", [date]).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_kpt_input(state: State<'_, Db>, input_id: String) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    let v: String = conn.query_row("SELECT value FROM kpt_inputs WHERE input_id = ?", [input_id], |r| r.get(0)).unwrap_or("".into());
    Ok(v)
}

#[tauri::command]
fn save_kpt_input(state: State<'_, Db>, input_id: String, value: String) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("INSERT OR REPLACE INTO kpt_inputs (input_id, value) VALUES (?, ?)", (input_id, value)).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_kpt_calendar(state: State<'_, Db>) -> Result<Vec<String>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT date FROM kpt_calendar WHERE has_activity = 1").map_err(|e| e.to_string())?;
    let it = stmt.query_map([], |r| Ok(r.get(0)?)).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for i in it { if let Ok(c) = i { res.push(c); } }
    Ok(res)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = Db::new().expect("Failed to initialize database");

    tauri::Builder::default()
        .manage(db)
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let overlay_window = tauri::WebviewWindowBuilder::new(app, "overlay", tauri::WebviewUrl::App("index.html?overlay=true".into()))
                .title("Perimetr Overlay")
                .inner_size(1000.0, 50.0)
                .decorations(false)
                .transparent(true)
                .always_on_top(true)
                .skip_taskbar(true)
                .visible(false)
                .build()?;

            let app_handle = app.handle().clone();

            // Set initial position synchronously during setup
            if let Some(state) = app.try_state::<Db>() {
                if let Ok(conn) = state.conn.lock() {
                    let overlay_pos: String = conn.query_row("SELECT overlay_pos FROM perimetr_state WHERE id = 1", [], |r| r.get(0)).unwrap_or("bottom".into());
                    if let Ok(Some(monitor)) = overlay_window.primary_monitor() {
                        let size = monitor.size();
                        let scale_factor = monitor.scale_factor();
                        let overlay_width = 1000.0 * scale_factor;
                        let overlay_height = 50.0 * scale_factor;

                        let y_pos = if overlay_pos == "top" {
                            0.0
                        } else {
                            (size.height as f64) - overlay_height
                        };

                        let pos = PhysicalPosition::new(
                            ((size.width as f64) / 2.0 - overlay_width / 2.0) as i32,
                            y_pos as i32,
                        );
                        let _ = overlay_window.set_position(tauri::Position::Physical(pos));
                    }
                }
            }

            let overlay_clone = overlay_window.clone();

            if let Some(main_window) = app.get_webview_window("main") {
                main_window.on_window_event(move |event| match event {
                    WindowEvent::Focused(focused) => {
                        let overlay_c = overlay_clone.clone();
                        let app_h = app_handle.clone();
                        if *focused {
                            let _ = overlay_c.hide();
                        } else {
                            // Run the position check asynchronously (on Tauri's async runtime)
                            // so it doesn't block the UI thread during the focus event and cause deadlocks.
                            tauri::async_runtime::spawn(async move {
                                let mut overlay_pos = String::from("bottom");
                                if let Some(state) = app_h.try_state::<Db>() {
                                    if let Ok(conn) = state.conn.lock() {
                                        if let Ok(pos) = conn.query_row("SELECT overlay_pos FROM perimetr_state WHERE id = 1", [], |r| r.get(0)) {
                                            overlay_pos = pos;
                                        }
                                    }
                                }

                                // To manipulate windows, we must execute back on the main thread
                                let _ = app_h.run_on_main_thread(move || {
                                    if let Ok(Some(monitor)) = overlay_c.primary_monitor() {
                                        let size = monitor.size();
                                        let scale_factor = monitor.scale_factor();
                                        let overlay_width = 1000.0 * scale_factor;
                                        let overlay_height = 50.0 * scale_factor;

                                        let y_pos = if overlay_pos == "top" {
                                            0.0
                                        } else {
                                            (size.height as f64) - overlay_height
                                        };

                                        let pos = PhysicalPosition::new(
                                            ((size.width as f64) / 2.0 - overlay_width / 2.0) as i32,
                                            y_pos as i32,
                                        );
                                        let _ = overlay_c.set_position(tauri::Position::Physical(pos));
                                    }
                                    let _ = overlay_c.show();
                                });
                            });
                        }
                    }
                    _ => {}
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_general_state, save_general_state,
            get_contacts, save_contact, delete_contact,
            get_custom_tasks, save_custom_task, delete_custom_task, get_deleted_tasks,
            get_task_history, save_task_history,
            get_timer_state, save_timer_state, get_timer_tasks, add_timer_task,
            get_kpt_state, save_kpt_state, get_kpt_task, save_kpt_task,
            get_kpt_input, save_kpt_input, get_kpt_calendar
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
