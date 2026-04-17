use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;

pub fn init_db(app_dir: PathBuf) -> Result<Connection> {
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    }

    let db_path = app_dir.join("perimetr.db");
    let conn = Connection::open(db_path)?;

    // --- ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ И СТАТИСТИКА ---
    conn.execute(
        "CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY,
            kpt_xp INTEGER NOT NULL DEFAULT 0,
            kpt_level INTEGER NOT NULL DEFAULT 1,
            kpt_current_week INTEGER NOT NULL DEFAULT 1,
            agent_score INTEGER NOT NULL DEFAULT 0
        )",
        [],
    )?;
    conn.execute("INSERT OR IGNORE INTO user_profile (id) VALUES (1)", [])?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS base_sessions_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            duration_ms INTEGER NOT NULL,
            mode TEXT NOT NULL
        )",
        [],
    )?;

    // --- KPT: СТРОГАЯ РЕЛЯЦИОННАЯ СХЕМА ---
    conn.execute(
        "CREATE TABLE IF NOT EXISTS kpt_daily_progress (
            date TEXT NOT NULL,
            task_id TEXT NOT NULL,
            PRIMARY KEY (date, task_id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS kpt_task_inputs (
            date TEXT NOT NULL,
            task_id TEXT NOT NULL,
            input_key TEXT NOT NULL,
            input_value TEXT NOT NULL,
            PRIMARY KEY (date, task_id, input_key)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS kpt_reading_history (
            date TEXT NOT NULL PRIMARY KEY,
            page_reached INTEGER NOT NULL
        )",
        [],
    )?;

    // --- PERIMETR: СТРОГАЯ РЕЛЯЦИОННАЯ СХЕМА ---

    // 1. План операции
    conn.execute(
        "CREATE TABLE IF NOT EXISTS perimetr_plan (
            id INTEGER PRIMARY KEY,
            mission TEXT NOT NULL,
            phase0 TEXT NOT NULL,
            phase1 TEXT NOT NULL
        )",
        [],
    )?;

    // 2. Сеть (Контакты / Узлы)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS perimetr_network_contacts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            callsign TEXT NOT NULL,
            role TEXT NOT NULL,
            circle TEXT NOT NULL,
            contact_info TEXT NOT NULL,
            last_date TEXT NOT NULL,
            next_date TEXT NOT NULL,
            notes TEXT NOT NULL,
            m TEXT NOT NULL,
            i TEXT NOT NULL,
            c TEXT NOT NULL,
            e TEXT NOT NULL,
            value_prop TEXT NOT NULL,
            give TEXT NOT NULL
        )",
        [],
    )?;

    // 3. Сеть (Связи)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS perimetr_network_links (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            PRIMARY KEY (source_id, target_id)
        )",
        [],
    )?;

    // 4. Привычки (Habits)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS perimetr_habits (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            streak INTEGER NOT NULL,
            last_date TEXT NOT NULL
        )",
        [],
    )?;

    // 5. Циклы (Cycles: cycle_id, title)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS perimetr_cycles (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            color TEXT NOT NULL
        )",
        [],
    )?;

    // 6. Задачи в циклах (Tasks inside cycles)
    // Добавлены поля description и fields_json для сохранения инструкций задач и полей ввода
    conn.execute(
        "CREATE TABLE IF NOT EXISTS perimetr_cycle_tasks (
            id TEXT PRIMARY KEY,
            cycle_id TEXT NOT NULL,
            text TEXT NOT NULL,
            time TEXT NOT NULL,
            completed INTEGER NOT NULL,
            task_type TEXT NOT NULL,
            description TEXT,
            fields_json TEXT
        )",
        [],
    )?;

    // 7. История выполнения задач в периметре (Completed Tasks by Date)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS perimetr_history_completed (
            date TEXT NOT NULL,
            task_id TEXT NOT NULL,
            PRIMARY KEY (date, task_id)
        )",
        [],
    )?;

    // 8. Ответы на задачи в периметре (Task Data by Date)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS perimetr_history_task_data (
            date TEXT NOT NULL,
            task_id TEXT NOT NULL,
            input_key TEXT NOT NULL,
            input_value TEXT NOT NULL,
            PRIMARY KEY (date, task_id, input_key)
        )",
        [],
    )?;

    Ok(conn)
}
