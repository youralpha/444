use rusqlite::{Connection, Result};
use std::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct GeneralState {
    pub score: i32,
    pub mission: String,
    pub bullets: String,
    pub phase0: String,
    pub phase1: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct NetworkContact {
    pub id: String,
    pub name: String,
    pub callsign: String,
    pub role: String,
    pub circle: String,
    pub contact: String,
    pub last_date: String,
    pub next_date: String,
    pub notes: String,
    pub m: String,
    pub i: String,
    pub c: String,
    pub e: String,
    pub value: String,
    pub give: String,
    pub links: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CustomTask {
    pub id: String,
    pub cycle: String,
    pub title: String,
    pub time: String,
    pub desc: String,
    pub fields_json: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TaskHistory {
    pub completed: bool,
    pub field_data: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TimerState {
    pub running: bool,
    pub elapsed: i32,
    pub current_task: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TimerTask {
    pub id: String,
    pub date: String,
    pub duration: i32,
    pub description: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct KptState {
    pub xp: i32,
    pub level: i32,
    pub current_week: i32,
}

pub struct Db {
    pub conn: Mutex<Connection>,
}

impl Db {
    pub fn new() -> Result<Self> {
        let conn = Connection::open("perimetr_tauri.db")?;
        let db = Db { conn: Mutex::new(conn) };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        // Perimetr Global
        conn.execute("CREATE TABLE IF NOT EXISTS perimetr_state (id INTEGER PRIMARY KEY, score INTEGER DEFAULT 0)", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS perimetr_plan (id INTEGER PRIMARY KEY, phase0 TEXT, phase1 TEXT)", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS perimetr_focus (id INTEGER PRIMARY KEY, mission TEXT, bullets TEXT)", [])?;

        // Full Network Contact Schema
        conn.execute(
            "CREATE TABLE IF NOT EXISTS perimetr_network (
                id TEXT PRIMARY KEY, name TEXT, callsign TEXT, role TEXT, circle TEXT, contact TEXT, last_date TEXT, next_date TEXT, notes TEXT, m TEXT, i TEXT, c TEXT, e TEXT, value TEXT, give TEXT, links TEXT
            )", [])?;

        // Task History Schema
        conn.execute(
            "CREATE TABLE IF NOT EXISTS perimetr_task_history (
                date TEXT, task_id TEXT, completed BOOLEAN, field_data TEXT, PRIMARY KEY (date, task_id)
            )", [])?;

        // Custom Tasks
        conn.execute(
            "CREATE TABLE IF NOT EXISTS perimetr_custom_tasks (
                id TEXT PRIMARY KEY, cycle TEXT, title TEXT, time TEXT, desc TEXT, fields_json TEXT
            )", [])?;

        // Timer
        conn.execute("CREATE TABLE IF NOT EXISTS timer_state (id INTEGER PRIMARY KEY, running BOOLEAN DEFAULT 0, elapsed INTEGER DEFAULT 0, current_task TEXT DEFAULT '')", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS timer_tasks (id TEXT PRIMARY KEY, date TEXT, duration INTEGER, description TEXT)", [])?;

        // KPT State
        conn.execute("CREATE TABLE IF NOT EXISTS kpt_state (id INTEGER PRIMARY KEY, xp INTEGER DEFAULT 0, level INTEGER DEFAULT 1, current_week INTEGER DEFAULT 1)", [])?;

        conn.execute("CREATE TABLE IF NOT EXISTS kpt_tasks (task_id TEXT PRIMARY KEY, completed BOOLEAN)", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS kpt_inputs (input_id TEXT PRIMARY KEY, value TEXT)", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS kpt_calendar (date TEXT PRIMARY KEY, has_activity BOOLEAN)", [])?;

        conn.execute("INSERT OR IGNORE INTO perimetr_state (id, score) VALUES (1, 0)", [])?;
        conn.execute("INSERT OR IGNORE INTO perimetr_plan (id, phase0, phase1) VALUES (1, '', '')", [])?;
        conn.execute("INSERT OR IGNORE INTO perimetr_focus (id, mission, bullets) VALUES (1, '', '')", [])?;
        conn.execute("INSERT OR IGNORE INTO timer_state (id, running, elapsed, current_task) VALUES (1, 0, 0, '')", [])?;
        conn.execute("INSERT OR IGNORE INTO kpt_state (id, xp, level, current_week) VALUES (1, 0, 1, 1)", [])?;

        Ok(())
    }
}
