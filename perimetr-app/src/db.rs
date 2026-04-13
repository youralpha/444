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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_db_initialization_and_queries() {
        let db = Db::new().expect("Failed to initialize database");

        // Test basic execute and insert
        db.execute("UPDATE perimetr_state SET score = ?1 WHERE id = 1", rusqlite::params![50])
            .expect("Failed to update score");

        // Test basic query_row
        let score: i32 = db.query_row("SELECT score FROM perimetr_state WHERE id = 1", [], |row| row.get(0))
            .expect("Failed to query score");

        assert_eq!(score, 50, "Score was not updated correctly");

        // Test KPT logic
        db.execute("UPDATE kpt_state SET xp = ?1 WHERE id = 1", rusqlite::params![120])
            .expect("Failed to update KPT XP");

        let xp: i32 = db.query_row("SELECT xp FROM kpt_state WHERE id = 1", [], |row| row.get(0))
            .expect("Failed to query XP");

        assert_eq!(xp, 120, "XP was not updated correctly");

        // Test Network table (insert and map)
        db.execute("INSERT OR REPLACE INTO perimetr_network (id, name, callsign, role, circle) VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params!["test_id", "John Doe", "Ghost", "Spy", "3"])
            .expect("Failed to insert contact");

        #[derive(Debug, PartialEq)]
        struct TestContact { name: String, role: String }

        let contacts = db.query_map("SELECT name, role FROM perimetr_network WHERE id = 'test_id'", [], |row| {
            Ok(TestContact { name: row.get(0)?, role: row.get(1)? })
        }).expect("Failed to query map contacts");

        assert_eq!(contacts.len(), 1);
        assert_eq!(contacts[0].name, "John Doe");
        assert_eq!(contacts[0].role, "Spy");
    }
}
