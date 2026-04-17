mod db;

use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{Manager, State};

struct DbState {
    conn: Mutex<Connection>,
}

#[derive(Serialize, Deserialize, Default)]
pub struct UserProfile {
    kpt_xp: i32,
    kpt_level: i32,
    kpt_current_week: i32,
    agent_score: i32,
}

// --- KPT STRUCTS ---
#[derive(Serialize, Deserialize, Clone)]
pub struct KptDailyTask {
    date: String,
    task_id: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct KptTaskInput {
    date: String,
    task_id: String,
    input_key: String,
    input_value: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct KptReading {
    date: String,
    page_reached: i32,
}

#[derive(Serialize, Deserialize, Default)]
pub struct KptState {
    xp: i32,
    level: i32,
    current_week: i32,
    daily_progress: Vec<KptDailyTask>,
    task_inputs: Vec<KptTaskInput>,
    reading_history: Vec<KptReading>,
}

// --- PERIMETR STRUCTS ---
#[derive(Serialize, Deserialize, Clone)]
pub struct PerimetrPlan {
    mission: String,
    phase0: String,
    phase1: String,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct NetworkContact {
    pub id: String,
    pub name: String,
    pub callsign: String,
    pub role: String,
    pub circle: String,
    pub contact: Option<String>,
    pub last_date: Option<String>,
    pub next_date: Option<String>,
    pub notes: Option<String>,
    pub m: Option<String>,
    pub i: Option<String>,
    pub c: Option<String>,
    pub e: Option<String>,
    pub value: Option<String>,
    pub give: Option<String>,
    pub links: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Habit {
    id: String,
    name: String,
    streak: i32,
    last_date: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CycleTask {
    id: String,
    text: String,
    time: String,
    completed: Option<bool>,
    #[serde(rename = "type")]
    task_type: Option<String>,
    description: Option<String>,
    fields: Option<serde_json::Value>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Cycle {
    id: String,
    title: String,
    color: String,
    tasks: Vec<CycleTask>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PerimetrHistoryCompleted {
    date: String,
    task_id: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PerimetrHistoryData {
    date: String,
    task_id: String,
    input_key: String,
    input_value: String,
}

#[derive(Serialize, Deserialize, Default)]
pub struct PerimetrState {
    score: i32,
    plan: Option<PerimetrPlan>,
    network: Vec<NetworkContact>,
    habits: Vec<Habit>,
    cycles: Vec<Cycle>,
    history_completed: Vec<PerimetrHistoryCompleted>,
    history_data: Vec<PerimetrHistoryData>,
}

// ---------------- КОМАНДЫ ДЛЯ ПРОФИЛЯ ----------------

#[tauri::command]
fn get_profile(state: State<'_, DbState>) -> Result<UserProfile, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT kpt_xp, kpt_level, kpt_current_week, agent_score FROM user_profile WHERE id = 1").map_err(|e| e.to_string())?;

    let profile = stmt.query_row([], |row| {
        Ok(UserProfile {
            kpt_xp: row.get(0)?,
            kpt_level: row.get(1)?,
            kpt_current_week: row.get(2)?,
            agent_score: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;
    Ok(profile)
}

#[tauri::command]
fn log_base_session(state: State<'_, DbState>, date: String, duration_ms: i32, mode: String) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("INSERT INTO base_sessions_log (date, duration_ms, mode) VALUES (?1, ?2, ?3)", rusqlite::params![date, duration_ms, mode]).map_err(|e| e.to_string())?;
    Ok(())
}

// ---------------- КОМАНДЫ ДЛЯ PERIMETR ----------------

#[tauri::command]
fn get_perimetr_state(state: State<'_, DbState>) -> Result<PerimetrState, String> {
    let conn = state.conn.lock().unwrap();
    let mut result = PerimetrState::default();

    result.score = conn.query_row("SELECT agent_score FROM user_profile WHERE id = 1", [], |row| row.get(0)).unwrap_or(0);

    // Plan
    let mut stmt = conn.prepare("SELECT mission, phase0, phase1 FROM perimetr_plan WHERE id = 1").map_err(|e| e.to_string())?;
    if let Ok(plan) = stmt.query_row([], |row| Ok(PerimetrPlan { mission: row.get(0)?, phase0: row.get(1)?, phase1: row.get(2)? })) {
        result.plan = Some(plan);
    }

    // Network Contacts
    let mut stmt = conn.prepare("SELECT id, name, callsign, role, circle, contact_info, last_date, next_date, notes, m, i, c, e, value_prop, give FROM perimetr_network_contacts").map_err(|e| e.to_string())?;
    let mut contacts_map: std::collections::HashMap<String, NetworkContact> = std::collections::HashMap::new();

    let contacts_iter = stmt.query_map([], |row| {
        Ok(NetworkContact {
            id: row.get(0)?, name: row.get(1)?, callsign: row.get(2)?, role: row.get(3)?, circle: row.get(4)?,
            contact: Some(row.get::<_, String>(5)?), last_date: Some(row.get::<_, String>(6)?), next_date: Some(row.get::<_, String>(7)?), notes: Some(row.get::<_, String>(8)?),
            m: Some(row.get::<_, String>(9)?), i: Some(row.get::<_, String>(10)?), c: Some(row.get::<_, String>(11)?), e: Some(row.get::<_, String>(12)?), value: Some(row.get::<_, String>(13)?), give: Some(row.get::<_, String>(14)?),
            links: Vec::new()
        })
    }).map_err(|e| e.to_string())?;

    for c in contacts_iter {
        if let Ok(contact) = c {
            contacts_map.insert(contact.id.clone(), contact);
        }
    }

    // Network Links
    let mut stmt = conn.prepare("SELECT source_id, target_id FROM perimetr_network_links").map_err(|e| e.to_string())?;
    let links_iter = stmt.query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))).map_err(|e| e.to_string())?;
    for l in links_iter {
        if let Ok((source, target)) = l {
            if let Some(contact) = contacts_map.get_mut(&source) {
                contact.links.push(target);
            }
        }
    }
    result.network = contacts_map.into_values().collect();

    // Habits
    let mut stmt = conn.prepare("SELECT id, name, streak, last_date FROM perimetr_habits").map_err(|e| e.to_string())?;
    let habits_iter = stmt.query_map([], |row| Ok(Habit { id: row.get(0)?, name: row.get(1)?, streak: row.get(2)?, last_date: row.get(3)? })).map_err(|e| e.to_string())?;
    for h in habits_iter { result.habits.push(h.unwrap()); }

    // Cycles
    let mut stmt = conn.prepare("SELECT id, title, color FROM perimetr_cycles").map_err(|e| e.to_string())?;
    let mut cycles_map: std::collections::HashMap<String, Cycle> = std::collections::HashMap::new();

    let cycles_iter = stmt.query_map([], |row| Ok(Cycle { id: row.get(0)?, title: row.get(1)?, color: row.get(2)?, tasks: Vec::new() })).map_err(|e| e.to_string())?;
    for c in cycles_iter {
        if let Ok(cycle) = c {
            cycles_map.insert(cycle.id.clone(), cycle);
        }
    }

    // Cycle Tasks
    let mut stmt = conn.prepare("SELECT id, cycle_id, text, time, completed, task_type, description, fields_json FROM perimetr_cycle_tasks").map_err(|e| e.to_string())?;
    let tasks_iter = stmt.query_map([], |row| {
        let comp: i32 = row.get(4)?;

        let desc: Option<String> = row.get(6)?;
        let fields_str: Option<String> = row.get(7)?;

        let mut fields: Option<serde_json::Value> = None;
        if let Some(fstr) = fields_str {
            if let Ok(fval) = serde_json::from_str(&fstr) {
                fields = Some(fval);
            }
        }

        Ok((row.get::<_, String>(1)?, CycleTask {
            id: row.get(0)?,
            text: row.get(2)?,
            time: row.get(3)?,
            completed: Some(comp == 1),
            task_type: Some(row.get(5)?),
            description: desc,
            fields
        }))
    }).map_err(|e| e.to_string())?;

    for t in tasks_iter {
        if let Ok((cycle_id, task)) = t {
            if let Some(cycle) = cycles_map.get_mut(&cycle_id) {
                cycle.tasks.push(task);
            }
        }
    }
    result.cycles = cycles_map.into_values().collect();

    // History (Completed)
    let mut stmt = conn.prepare("SELECT date, task_id FROM perimetr_history_completed").map_err(|e| e.to_string())?;
    let hist_iter = stmt.query_map([], |row| Ok(PerimetrHistoryCompleted { date: row.get(0)?, task_id: row.get(1)? })).map_err(|e| e.to_string())?;
    for h in hist_iter { result.history_completed.push(h.unwrap()); }

    // History (Task Data)
    let mut stmt = conn.prepare("SELECT date, task_id, input_key, input_value FROM perimetr_history_task_data").map_err(|e| e.to_string())?;
    let data_iter = stmt.query_map([], |row| Ok(PerimetrHistoryData { date: row.get(0)?, task_id: row.get(1)?, input_key: row.get(2)?, input_value: row.get(3)? })).map_err(|e| e.to_string())?;
    for d in data_iter { result.history_data.push(d.unwrap()); }

    Ok(result)
}

#[tauri::command]
fn save_perimetr_state(state: State<'_, DbState>, payload: PerimetrState) -> Result<(), String> {
    let mut conn = state.conn.lock().unwrap();
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // Profile
    tx.execute("UPDATE user_profile SET agent_score = ?1 WHERE id = 1", [payload.score]).map_err(|e| e.to_string())?;

    // Plan
    if let Some(p) = payload.plan {
        tx.execute("INSERT OR REPLACE INTO perimetr_plan (id, mission, phase0, phase1) VALUES (1, ?1, ?2, ?3)", rusqlite::params![p.mission, p.phase0, p.phase1]).map_err(|e| e.to_string())?;
    }

    // Network
    tx.execute("DELETE FROM perimetr_network_contacts", []).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM perimetr_network_links", []).map_err(|e| e.to_string())?;

    for c in payload.network {
        tx.execute(
            "INSERT INTO perimetr_network_contacts (id, name, callsign, role, circle, contact_info, last_date, next_date, notes, m, i, c, e, value_prop, give)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            rusqlite::params![
                c.id, c.name, c.callsign, c.role, c.circle,
                c.contact.unwrap_or_default(),
                c.last_date.unwrap_or_default(),
                c.next_date.unwrap_or_default(),
                c.notes.unwrap_or_default(),
                c.m.unwrap_or_default(),
                c.i.unwrap_or_default(),
                c.c.unwrap_or_default(),
                c.e.unwrap_or_default(),
                c.value.unwrap_or_default(),
                c.give.unwrap_or_default()
            ]
        ).map_err(|e| e.to_string())?;

        for target_id in c.links {
            tx.execute("INSERT INTO perimetr_network_links (source_id, target_id) VALUES (?1, ?2)", rusqlite::params![c.id, target_id]).map_err(|e| e.to_string())?;
        }
    }

    // Habits
    tx.execute("DELETE FROM perimetr_habits", []).map_err(|e| e.to_string())?;
    for h in payload.habits {
        tx.execute("INSERT INTO perimetr_habits (id, name, streak, last_date) VALUES (?1, ?2, ?3, ?4)", rusqlite::params![h.id, h.name, h.streak, h.last_date]).map_err(|e| e.to_string())?;
    }

    // Cycles & Tasks
    tx.execute("DELETE FROM perimetr_cycles", []).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM perimetr_cycle_tasks", []).map_err(|e| e.to_string())?;

    for c in payload.cycles {
        tx.execute("INSERT INTO perimetr_cycles (id, title, color) VALUES (?1, ?2, ?3)", rusqlite::params![c.id, c.title, c.color]).map_err(|e| e.to_string())?;

        for t in c.tasks {
            let comp = if t.completed.unwrap_or(false) { 1 } else { 0 };
            let t_type = t.task_type.unwrap_or_default();

            let mut fields_str: Option<String> = None;
            if let Some(f) = t.fields {
                if let Ok(s) = serde_json::to_string(&f) {
                    fields_str = Some(s);
                }
            }

            tx.execute(
                "INSERT INTO perimetr_cycle_tasks (id, cycle_id, text, time, completed, task_type, description, fields_json) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                rusqlite::params![t.id, c.id, t.text, t.time, comp, t_type, t.description, fields_str]
            ).map_err(|e| e.to_string())?;
        }
    }

    // History (Completed & Data)
    tx.execute("DELETE FROM perimetr_history_completed", []).map_err(|e| e.to_string())?;
    for hc in payload.history_completed {
        tx.execute("INSERT INTO perimetr_history_completed (date, task_id) VALUES (?1, ?2)", rusqlite::params![hc.date, hc.task_id]).map_err(|e| e.to_string())?;
    }

    tx.execute("DELETE FROM perimetr_history_task_data", []).map_err(|e| e.to_string())?;
    for hd in payload.history_data {
        tx.execute("INSERT INTO perimetr_history_task_data (date, task_id, input_key, input_value) VALUES (?1, ?2, ?3, ?4)", rusqlite::params![hd.date, hd.task_id, hd.input_key, hd.input_value]).map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

// ---------------- КОМАНДЫ ДЛЯ KPT ----------------

#[tauri::command]
fn get_kpt_state(state: State<'_, DbState>) -> Result<KptState, String> {
    let conn = state.conn.lock().unwrap();
    let mut result = KptState::default();

    let profile = conn.query_row("SELECT kpt_xp, kpt_level, kpt_current_week FROM user_profile WHERE id = 1", [], |row| Ok((row.get::<_, i32>(0)?, row.get::<_, i32>(1)?, row.get::<_, i32>(2)?))).unwrap_or((0, 1, 1));
    result.xp = profile.0;
    result.level = profile.1;
    result.current_week = profile.2;

    let mut stmt = conn.prepare("SELECT date, task_id FROM kpt_daily_progress").map_err(|e| e.to_string())?;
    let dp_iter = stmt.query_map([], |row| Ok(KptDailyTask { date: row.get(0)?, task_id: row.get(1)? })).map_err(|e| e.to_string())?;
    for d in dp_iter { result.daily_progress.push(d.unwrap()); }

    let mut stmt = conn.prepare("SELECT date, task_id, input_key, input_value FROM kpt_task_inputs").map_err(|e| e.to_string())?;
    let td_iter = stmt.query_map([], |row| Ok(KptTaskInput { date: row.get(0)?, task_id: row.get(1)?, input_key: row.get(2)?, input_value: row.get(3)? })).map_err(|e| e.to_string())?;
    for t in td_iter { result.task_inputs.push(t.unwrap()); }

    let mut stmt = conn.prepare("SELECT date, page_reached FROM kpt_reading_history").map_err(|e| e.to_string())?;
    let rh_iter = stmt.query_map([], |row| Ok(KptReading { date: row.get(0)?, page_reached: row.get(1)? })).map_err(|e| e.to_string())?;
    for r in rh_iter { result.reading_history.push(r.unwrap()); }

    Ok(result)
}

#[tauri::command]
fn save_kpt_state(state: State<'_, DbState>, payload: KptState) -> Result<(), String> {
    let mut conn = state.conn.lock().unwrap();
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    tx.execute("UPDATE user_profile SET kpt_xp = ?1, kpt_level = ?2, kpt_current_week = ?3 WHERE id = 1", [payload.xp, payload.level, payload.current_week]).map_err(|e| e.to_string())?;

    tx.execute("DELETE FROM kpt_daily_progress", []).map_err(|e| e.to_string())?;
    for d in payload.daily_progress {
        tx.execute("INSERT INTO kpt_daily_progress (date, task_id) VALUES (?1, ?2)", rusqlite::params![d.date, d.task_id]).map_err(|e| e.to_string())?;
    }

    tx.execute("DELETE FROM kpt_task_inputs", []).map_err(|e| e.to_string())?;
    for t in payload.task_inputs {
        tx.execute("INSERT INTO kpt_task_inputs (date, task_id, input_key, input_value) VALUES (?1, ?2, ?3, ?4)", rusqlite::params![t.date, t.task_id, t.input_key, t.input_value]).map_err(|e| e.to_string())?;
    }

    tx.execute("DELETE FROM kpt_reading_history", []).map_err(|e| e.to_string())?;
    for r in payload.reading_history {
        tx.execute("INSERT INTO kpt_reading_history (date, page_reached) VALUES (?1, ?2)", rusqlite::params![r.date, r.page_reached]).map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_os::init())
    .setup(|app| {
        let app_dir = app.path().app_data_dir().expect("failed to get app data dir");
        let conn = db::init_db(app_dir).expect("failed to initialize db");
        app.manage(DbState {
            conn: Mutex::new(conn),
        });

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        get_profile,
        log_base_session,
        get_kpt_state,
        save_kpt_state,
        get_perimetr_state,
        save_perimetr_state
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
