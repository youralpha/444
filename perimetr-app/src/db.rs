use rusqlite::{Connection, Result};
use std::sync::{Arc, Mutex};

pub struct Db {
    conn: Arc<Mutex<Connection>>,
}

impl PartialEq for Db {
    fn eq(&self, other: &Self) -> bool {
        Arc::ptr_eq(&self.conn, &other.conn)
    }
}

impl Db {
    pub fn new() -> Result<Self> {
        let conn = Connection::open("perimetr.db")?;
        let db = Db {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        // Perimetr
        conn.execute("CREATE TABLE IF NOT EXISTS perimetr_state (id INTEGER PRIMARY KEY, score INTEGER DEFAULT 0)", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS perimetr_plan (id INTEGER PRIMARY KEY, phase0 TEXT, phase1 TEXT)", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS perimetr_focus (id INTEGER PRIMARY KEY, mission TEXT, bullets TEXT)", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS perimetr_network (id TEXT PRIMARY KEY, name TEXT, callsign TEXT, role TEXT, circle TEXT)", [])?;
        conn.execute("CREATE TABLE IF NOT EXISTS perimetr_tasks (id TEXT PRIMARY KEY, completed BOOLEAN)", [])?;

        conn.execute("INSERT OR IGNORE INTO perimetr_state (id, score) VALUES (1, 0)", [])?;
        conn.execute("INSERT OR IGNORE INTO perimetr_plan (id, phase0, phase1) VALUES (1, '', '')", [])?;
        conn.execute("INSERT OR IGNORE INTO perimetr_focus (id, mission, bullets) VALUES (1, '', '')", [])?;

        // KPT
        conn.execute(
            "CREATE TABLE IF NOT EXISTS kpt_state (
                id INTEGER PRIMARY KEY,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                current_week INTEGER DEFAULT 1,
                max_page INTEGER DEFAULT 0
            )",
            [],
        )?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS kpt_tasks (
                task_id TEXT PRIMARY KEY,
                completed BOOLEAN
            )",
            [],
        )?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS kpt_inputs (
                input_id TEXT PRIMARY KEY,
                value TEXT
            )",
            [],
        )?;
        conn.execute(
            "INSERT OR IGNORE INTO kpt_state (id, xp, level, current_week, max_page) VALUES (1, 0, 1, 1, 0)",
            [],
        )?;

        // Base
        conn.execute(
            "CREATE TABLE IF NOT EXISTS base_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                mode TEXT,
                completed_ms INTEGER
            )",
            [],
        )?;
        Ok(())
    }

    pub fn execute<P: rusqlite::Params>(&self, query: &str, params: P) -> Result<usize> {
        let conn = self.conn.lock().unwrap();
        conn.execute(query, params)
    }

    pub fn query_row<T, P, F>(&self, query: &str, params: P, f: F) -> Result<T>
    where
        P: rusqlite::Params,
        F: FnOnce(&rusqlite::Row<'_>) -> Result<T>,
    {
        let conn = self.conn.lock().unwrap();
        conn.query_row(query, params, f)
    }

    pub fn query_map<T, P, F>(&self, query: &str, params: P, mut f: F) -> Result<Vec<T>>
    where
        P: rusqlite::Params,
        F: FnMut(&rusqlite::Row<'_>) -> Result<T>,
    {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(query)?;
        let rows = stmt.query_map(params, |r| f(r))?;
        let mut result = Vec::new();
        for row in rows {
            result.push(row?);
        }
        Ok(result)
    }
}
