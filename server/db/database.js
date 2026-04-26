const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

const initDB = () => {
    // Циклы задач
    db.exec(`
        CREATE TABLE IF NOT EXISTS cycles (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            color TEXT NOT NULL
        )
    `);

    // Задачи / Протоколы
    db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            cycle_id TEXT,
            text TEXT NOT NULL,
            time TEXT,
            description TEXT,
            fields TEXT,
            FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE
        )
    `);

    // История выполнения задач
    db.exec(`
        CREATE TABLE IF NOT EXISTS history (
            date TEXT PRIMARY KEY,
            completed_tasks TEXT,
            task_data TEXT
        )
    `);

    // Агентурная сеть
    db.exec(`
        CREATE TABLE IF NOT EXISTS network (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            callsign TEXT,
            role TEXT,
            circle INTEGER,
            contact TEXT,
            last_date TEXT,
            next_date TEXT,
            notes TEXT,
            m TEXT,
            i TEXT,
            c TEXT,
            e TEXT,
            value TEXT,
            give TEXT,
            links TEXT
        )
    `);

    // Генеральный план
    db.exec(`
        CREATE TABLE IF NOT EXISTS plan (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            phase0 TEXT,
            phase1 TEXT
        )
    `);

    // КПТ Модуль: Данные
    db.exec(`
        CREATE TABLE IF NOT EXISTS cbt_data (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            data TEXT NOT NULL
        )
    `);

    // Таймер: Сессии
    db.exec(`
        CREATE TABLE IF NOT EXISTS timer_sessions (
            id TEXT PRIMARY KEY,
            date TEXT,
            mode TEXT,
            duration_ms INTEGER,
            completed BOOLEAN
        )
    `);

    // Seed default plan if empty
    const planCount = db.prepare('SELECT COUNT(*) as count FROM plan').get().count;
    if (planCount === 0) {
        db.prepare('INSERT INTO plan (id, phase0, phase1) VALUES (1, ?, ?)').run('', '');
    }

    // Seed default cycles if empty
    const cycleCount = db.prepare('SELECT COUNT(*) as count FROM cycles').get().count;
    if (cycleCount === 0) {
        const insertCycle = db.prepare('INSERT INTO cycles (id, title, color) VALUES (?, ?, ?)');
        insertCycle.run('daily', 'Ежедневно', 'text-emerald-500');
        insertCycle.run('weekly', 'Еженедельно', 'text-blue-500');
        insertCycle.run('monthly', 'Ежемесячно', 'text-yellow-500');
        insertCycle.run('quarterly', 'Ежеквартально', 'text-purple-500');
    }
};

initDB();

module.exports = db;
