use tauri::State;
mod db;
use db::{Db, GeneralState, NetworkContact, CustomTask, TaskHistory, TimerState, TimerTask, KptState};

#[tauri::command]
fn get_general_state(state: State<'_, Db>) -> Result<GeneralState, String> {
    let conn = state.conn.lock().unwrap();
    let score: i32 = conn.query_row("SELECT score FROM perimetr_state WHERE id = 1", [], |r| r.get(0)).unwrap_or(0);
    let (mission, bullets): (String, String) = conn.query_row("SELECT mission, bullets FROM perimetr_focus WHERE id = 1", [], |r| Ok((r.get(0)?, r.get(1)?))).unwrap_or(("".into(), "".into()));
    let (phase0, phase1): (String, String) = conn.query_row("SELECT phase0, phase1 FROM perimetr_plan WHERE id = 1", [], |r| Ok((r.get(0)?, r.get(1)?))).unwrap_or(("".into(), "".into()));
    Ok(GeneralState { score, mission, bullets, phase0, phase1 })
}

#[tauri::command]
fn save_general_state(state: State<'_, Db>, gs: GeneralState) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("UPDATE perimetr_state SET score = ? WHERE id = 1", [gs.score]).map_err(|e| e.to_string())?;
    conn.execute("UPDATE perimetr_focus SET mission = ?, bullets = ? WHERE id = 1", [gs.mission, gs.bullets]).map_err(|e| e.to_string())?;
    conn.execute("UPDATE perimetr_plan SET phase0 = ?, phase1 = ? WHERE id = 1", [gs.phase0, gs.phase1]).map_err(|e| e.to_string())?;
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
    conn.execute("DELETE FROM perimetr_network WHERE id = ?", [id]).map_err(|e| e.to_string())?;
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
    conn.execute("DELETE FROM perimetr_custom_tasks WHERE id = ?", [id]).map_err(|e| e.to_string())?;
    Ok(())
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
        .invoke_handler(tauri::generate_handler![
            get_general_state, save_general_state,
            get_contacts, save_contact, delete_contact,
            get_custom_tasks, save_custom_task, delete_custom_task,
            get_task_history, save_task_history,
            get_timer_state, save_timer_state, get_timer_tasks, add_timer_task,
            get_kpt_state, save_kpt_state, get_kpt_task, save_kpt_task,
            get_kpt_input, save_kpt_input, get_kpt_calendar
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
