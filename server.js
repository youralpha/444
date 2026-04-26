const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'kpt.db'), (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            // General info table (e.g., start date)
            db.run(`CREATE TABLE IF NOT EXISTS meta (
                key TEXT PRIMARY KEY,
                value TEXT
            )`);

            // Mood & Activity Diary
            db.run(`CREATE TABLE IF NOT EXISTS mood_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                activity TEXT,
                mood_before INTEGER,
                mood_after INTEGER,
                notes TEXT
            )`);

            // ABC Records
            db.run(`CREATE TABLE IF NOT EXISTS abc_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                situation TEXT,
                thought TEXT,
                emotion TEXT,
                behavior TEXT,
                distortions TEXT
            )`);

            // Cognitive Restructuring
            db.run(`CREATE TABLE IF NOT EXISTS restructuring_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                original_thought TEXT,
                evidence_for TEXT,
                evidence_against TEXT,
                alternative_thought TEXT,
                emotion_before INTEGER,
                emotion_after INTEGER
            )`);

            // Behavioral Experiments
            db.run(`CREATE TABLE IF NOT EXISTS experiments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                experiment TEXT,
                prediction TEXT,
                result TEXT,
                conclusion TEXT
            )`);

            // Exposure Hierarchy
            db.run(`CREATE TABLE IF NOT EXISTS exposures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                situation TEXT,
                suds_expected INTEGER,
                suds_actual INTEGER,
                completed BOOLEAN DEFAULT 0
            )`);

            // Tasks progress
            db.run(`CREATE TABLE IF NOT EXISTS task_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                week INTEGER,
                task_id TEXT,
                completed_date TEXT
            )`);

            // Initialize start_date if not exists
            db.get(`SELECT value FROM meta WHERE key = 'start_date'`, (err, row) => {
                if (!row) {
                    const today = new Date().toISOString().split('T')[0];
                    db.run(`INSERT INTO meta (key, value) VALUES ('start_date', ?)`, [today]);
                }
            });
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;

// --- API Endpoints ---

// Get Meta data (Start Date)
app.get('/api/meta', (req, res) => {
    db.all(`SELECT * FROM meta`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const meta = {};
        rows.forEach(r => meta[r.key] = r.value);
        res.json(meta);
    });
});

// Helper for generic CRUD
const handleDbResponse = (res, err, rows) => {
    if (err) {
        res.status(500).json({ error: err.message });
        return;
    }
    res.json({ data: rows });
};

// --- Mood Logs ---
app.get('/api/mood_logs', (req, res) => {
    db.all(`SELECT * FROM mood_logs ORDER BY id DESC`, [], (err, rows) => handleDbResponse(res, err, rows));
});

app.post('/api/mood_logs', (req, res) => {
    const { date, activity, mood_before, mood_after, notes } = req.body;
    db.run(`INSERT INTO mood_logs (date, activity, mood_before, mood_after, notes) VALUES (?, ?, ?, ?, ?)`,
        [date, activity, mood_before, mood_after, notes],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// --- ABC Logs ---
app.get('/api/abc_logs', (req, res) => {
    db.all(`SELECT * FROM abc_logs ORDER BY id DESC`, [], (err, rows) => handleDbResponse(res, err, rows));
});

app.post('/api/abc_logs', (req, res) => {
    const { date, situation, thought, emotion, behavior, distortions } = req.body;
    db.run(`INSERT INTO abc_logs (date, situation, thought, emotion, behavior, distortions) VALUES (?, ?, ?, ?, ?, ?)`,
        [date, situation, thought, emotion, behavior, distortions],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// --- Restructuring Logs ---
app.get('/api/restructuring_logs', (req, res) => {
    db.all(`SELECT * FROM restructuring_logs ORDER BY id DESC`, [], (err, rows) => handleDbResponse(res, err, rows));
});

app.post('/api/restructuring_logs', (req, res) => {
    const { date, original_thought, evidence_for, evidence_against, alternative_thought, emotion_before, emotion_after } = req.body;
    db.run(`INSERT INTO restructuring_logs (date, original_thought, evidence_for, evidence_against, alternative_thought, emotion_before, emotion_after) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [date, original_thought, evidence_for, evidence_against, alternative_thought, emotion_before, emotion_after],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// --- Experiments ---
app.get('/api/experiments', (req, res) => {
    db.all(`SELECT * FROM experiments ORDER BY id DESC`, [], (err, rows) => handleDbResponse(res, err, rows));
});

app.post('/api/experiments', (req, res) => {
    const { date, experiment, prediction, result, conclusion } = req.body;
    db.run(`INSERT INTO experiments (date, experiment, prediction, result, conclusion) VALUES (?, ?, ?, ?, ?)`,
        [date, experiment, prediction, result, conclusion],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// --- Exposures ---
app.get('/api/exposures', (req, res) => {
    db.all(`SELECT * FROM exposures ORDER BY suds_expected ASC`, [], (err, rows) => handleDbResponse(res, err, rows));
});

app.post('/api/exposures', (req, res) => {
    const { situation, suds_expected, suds_actual } = req.body;
    db.run(`INSERT INTO exposures (situation, suds_expected, suds_actual) VALUES (?, ?, ?)`,
        [situation, suds_expected, suds_actual],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/exposures/:id', (req, res) => {
    const { suds_actual, completed } = req.body;
    db.run(`UPDATE exposures SET suds_actual = ?, completed = ? WHERE id = ?`,
        [suds_actual, completed, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});

// --- Tasks ---
app.get('/api/tasks', (req, res) => {
    db.all(`SELECT * FROM task_progress`, [], (err, rows) => handleDbResponse(res, err, rows));
});

app.post('/api/tasks', (req, res) => {
    const { week, task_id, completed_date } = req.body;
    // Check if task exists to toggle it, or insert it. Simplified to insert/delete
    db.get(`SELECT id FROM task_progress WHERE week = ? AND task_id = ? AND completed_date = ?`, [week, task_id, completed_date], (err, row) => {
        if(err) return res.status(500).json({error: err.message});
        if(row) {
            db.run(`DELETE FROM task_progress WHERE id = ?`, row.id, function(err) {
                 if (err) return res.status(500).json({ error: err.message });
                 res.json({ action: 'deleted', id: row.id });
            });
        } else {
             db.run(`INSERT INTO task_progress (week, task_id, completed_date) VALUES (?, ?, ?)`,
                [week, task_id, completed_date],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ action: 'inserted', id: this.lastID });
                });
        }
    });
});


// === PERIMETR API ===

// PERIMETR Database Setup
db.serialize(() => {
    // Cycles
    db.run(`CREATE TABLE IF NOT EXISTS perimetr_cycles (
        id TEXT PRIMARY KEY,
        title TEXT,
        color TEXT,
        order_idx INTEGER
    )`);

    // Tasks
    db.run(`CREATE TABLE IF NOT EXISTS perimetr_tasks (
        id TEXT PRIMARY KEY,
        cycle_id TEXT,
        text TEXT,
        time TEXT,
        description TEXT,
        fields TEXT,
        order_idx INTEGER,
        FOREIGN KEY (cycle_id) REFERENCES perimetr_cycles(id)
    )`);

    // History
    db.run(`CREATE TABLE IF NOT EXISTS perimetr_history (
        date TEXT PRIMARY KEY,
        completed_tasks TEXT,
        task_data TEXT
    )`);

    // Network
    db.run(`CREATE TABLE IF NOT EXISTS perimetr_network (
        id TEXT PRIMARY KEY,
        name TEXT,
        callsign TEXT,
        role TEXT,
        circle INTEGER,
        contact TEXT,
        last_date TEXT,
        next_date TEXT,
        notes TEXT,
        m TEXT, i TEXT, c TEXT, e TEXT,
        value TEXT,
        give TEXT,
        links TEXT
    )`);

    // Plan (Singleton)
    db.run(`CREATE TABLE IF NOT EXISTS perimetr_plan (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        phase0 TEXT,
        phase1 TEXT
    )`);
    db.run(`INSERT OR IGNORE INTO perimetr_plan (id, phase0, phase1) VALUES (1, '', '')`);
});

const DEFAULT_CYCLES = [
    { id: 'daily', title: 'Ежедневный Цикл (Д)', color: 'border-blue-500' },
    { id: 'weekly', title: 'Еженедельный Цикл (Н)', color: 'border-yellow-500' },
    { id: 'monthly', title: 'Месячный Цикл (М)', color: 'border-purple-500' },
    { id: 'quarterly', title: 'Квартальный Цикл (К)', color: 'border-red-500' }
];

const DEFAULT_TASKS = [
    { id: 'd1', cycle_id: 'daily', text: 'Пуля 1 (Главная миссия дня)', time: '09:00 - 11:00', description: 'Один ключевой результат, двигающий к цели.', fields: JSON.stringify([{ id: 'bullet1', label: 'Описание миссии', type: 'textarea' }]) },
    { id: 'd2', cycle_id: 'daily', text: 'Пуля 2 (Операционка)', time: '11:00 - 13:00', description: 'Важнейшая операционная задача.', fields: JSON.stringify([{ id: 'bullet2', label: 'Суть', type: 'text' }]) },
    { id: 'd3', cycle_id: 'daily', text: 'Пуля 3 (Связи)', time: '15:00 - 16:00', description: 'Один ценный контакт (Дать/Получить).', fields: JSON.stringify([{ id: 'bullet3', label: 'С кем и о чем', type: 'text' }]) },
    { id: 'd4', cycle_id: 'daily', text: 'Отбой в 23:00', time: '23:00', description: 'Жесткий лимит. Гаджеты выключены.', fields: '[]' },
    { id: 'w1', cycle_id: 'weekly', text: 'After Action Review (AAR)', time: 'Воскресенье 20:00', description: 'Что планировал? Что вышло? Что исправить?', fields: JSON.stringify([{ id: 'aar_plan', label: 'Ожидания', type: 'textarea' }, { id: 'aar_fact', label: 'Факт', type: 'textarea' }, { id: 'aar_delta', label: 'Выводы', type: 'textarea' }]) },
    { id: 'w2', cycle_id: 'weekly', text: 'Планирование недели (3x3)', time: 'Воскресенье 21:00', description: 'Записать 3 цели на неделю по 3 сферам (Бизнес, Тело, Связи).', fields: JSON.stringify([{ id: 'plan_b', label: 'Бизнес', type: 'textarea' }, { id: 'plan_t', label: 'Тело', type: 'textarea' }, { id: 'plan_s', label: 'Связи', type: 'textarea' }]) },
    { id: 'm1', cycle_id: 'monthly', text: 'Ревизия Сети', time: '1-е число', description: 'Кого удалить? С кем сблизиться?', fields: JSON.stringify([{ id: 'net_rev', label: 'План по сети', type: 'textarea' }]) },
    { id: 'q1', cycle_id: 'quarterly', text: 'Стратегическая сессия', time: 'Конец квартала', description: 'Анализ Фазы 1. Корректировка целей.', fields: JSON.stringify([{ id: 'strat_q', label: 'Главный инсайт', type: 'textarea' }]) }
];

async function seedPerimetrData() {
    db.get('SELECT COUNT(*) as count FROM perimetr_cycles', (err, row) => {
        if (!err && row.count === 0) {
            DEFAULT_CYCLES.forEach((c, i) => db.run(`INSERT INTO perimetr_cycles VALUES (?, ?, ?, ?)`, [c.id, c.title, c.color, i]));
            DEFAULT_TASKS.forEach((t, i) => db.run(`INSERT INTO perimetr_tasks VALUES (?, ?, ?, ?, ?, ?, ?)`, [t.id, t.cycle_id, t.text, t.time, t.description, t.fields, i]));
        }
    });
}
seedPerimetrData();

// 5.1 Tasks & Cycles
app.get('/api/v1/cycles', (req, res) => {
    db.all(`SELECT * FROM perimetr_cycles ORDER BY order_idx ASC`, [], (err, cycles) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all(`SELECT * FROM perimetr_tasks ORDER BY order_idx ASC`, [], (err, tasks) => {
            if (err) return res.status(500).json({ error: err.message });

            const result = cycles.map(c => ({
                id: c.id, title: c.title, color: c.color,
                tasks: tasks.filter(t => t.cycle_id === c.id).map(t => ({
                    ...t, fields: JSON.parse(t.fields || '[]')
                }))
            }));
            res.json(result);
        });
    });
});

app.post('/api/v1/tasks', (req, res) => {
    const { id, cycle_id, text, time, description, fields } = req.body;
    db.run(`INSERT INTO perimetr_tasks (id, cycle_id, text, time, description, fields, order_idx) VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(order_idx),0)+1 FROM perimetr_tasks))`,
        [id, cycle_id, text, time, description, JSON.stringify(fields || [])],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id });
        });
});

app.delete('/api/v1/tasks/:id', (req, res) => {
    db.run(`DELETE FROM perimetr_tasks WHERE id = ?`, req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

app.post('/api/v1/reset-cycles', (req, res) => {
    db.serialize(() => {
        db.run('DELETE FROM perimetr_tasks');
        db.run('DELETE FROM perimetr_cycles');
        DEFAULT_CYCLES.forEach((c, i) => db.run(`INSERT INTO perimetr_cycles VALUES (?, ?, ?, ?)`, [c.id, c.title, c.color, i]));
        DEFAULT_TASKS.forEach((t, i) => db.run(`INSERT INTO perimetr_tasks VALUES (?, ?, ?, ?, ?, ?, ?)`, [t.id, t.cycle_id, t.text, t.time, t.description, t.fields, i]));
        res.json({ success: true });
    });
});


// 5.2 History
app.get('/api/v1/history/:date', (req, res) => {
    db.get(`SELECT * FROM perimetr_history WHERE date = ?`, req.params.date, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({ date: req.params.date, completed_tasks: [], task_data: {} });
        res.json({
            date: row.date,
            completed_tasks: JSON.parse(row.completed_tasks || '[]'),
            task_data: JSON.parse(row.task_data || '{}')
        });
    });
});

app.post('/api/v1/history/:date', (req, res) => {
    const { completed_tasks, task_data } = req.body;
    db.run(`INSERT INTO perimetr_history (date, completed_tasks, task_data) VALUES (?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET completed_tasks = excluded.completed_tasks, task_data = excluded.task_data`,
        [req.params.date, JSON.stringify(completed_tasks || []), JSON.stringify(task_data || {})],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

// All history for sidebar heatmap
app.get('/api/v1/history', (req, res) => {
    db.all(`SELECT date, completed_tasks FROM perimetr_history`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const result = {};
        rows.forEach(r => {
            const arr = JSON.parse(r.completed_tasks || '[]');
            if(arr.length > 0) result[r.date] = arr;
        });
        res.json(result);
    });
});


// 5.3 Network
app.get('/api/v1/network', (req, res) => {
    db.all(`SELECT * FROM perimetr_network`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => ({ ...r, links: JSON.parse(r.links || '[]') })));
    });
});

app.post('/api/v1/network', (req, res) => {
    const agent = req.body;
    const links = agent.links || [];

    db.run(`INSERT INTO perimetr_network (id, name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [agent.id, agent.name, agent.callsign, agent.role, agent.circle, agent.contact, agent.last_date, agent.next_date, agent.notes, agent.m, agent.i, agent.c, agent.e, agent.value, agent.give, JSON.stringify(links)],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Handle bi-directional linking
            links.forEach(linkId => {
                db.get(`SELECT links FROM perimetr_network WHERE id = ?`, linkId, (err, row) => {
                    if (row) {
                        const tgtLinks = JSON.parse(row.links || '[]');
                        if (!tgtLinks.includes(agent.id)) {
                            tgtLinks.push(agent.id);
                            db.run(`UPDATE perimetr_network SET links = ? WHERE id = ?`, [JSON.stringify(tgtLinks), linkId]);
                        }
                    }
                });
            });
            res.json({ id: agent.id });
        });
});

app.put('/api/v1/network/:id', (req, res) => {
    const agent = req.body;
    const links = agent.links || [];
    const aid = req.params.id;

    // To handle bi-directional linking perfectly, we'd need to diff old and new links.
    // Simplifying: we'll fetch old links, remove this agent from removed links, and add to new links.
    db.get(`SELECT links FROM perimetr_network WHERE id = ?`, aid, (err, oldRow) => {
        if(err) return res.status(500).json({ error: err.message });
        const oldLinks = oldRow ? JSON.parse(oldRow.links || '[]') : [];

        db.run(`UPDATE perimetr_network SET name=?, callsign=?, role=?, circle=?, contact=?, last_date=?, next_date=?, notes=?, m=?, i=?, c=?, e=?, value=?, give=?, links=? WHERE id=?`,
            [agent.name, agent.callsign, agent.role, agent.circle, agent.contact, agent.last_date, agent.next_date, agent.notes, agent.m, agent.i, agent.c, agent.e, agent.value, agent.give, JSON.stringify(links), aid],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });

                // Removals
                oldLinks.forEach(oldId => {
                    if(!links.includes(oldId)) {
                         db.get(`SELECT links FROM perimetr_network WHERE id = ?`, oldId, (e, r) => {
                             if(r) {
                                 let tl = JSON.parse(r.links || '[]');
                                 tl = tl.filter(l => l !== aid);
                                 db.run(`UPDATE perimetr_network SET links = ? WHERE id = ?`, [JSON.stringify(tl), oldId]);
                             }
                         });
                    }
                });

                // Additions
                links.forEach(newId => {
                    if(!oldLinks.includes(newId)) {
                         db.get(`SELECT links FROM perimetr_network WHERE id = ?`, newId, (e, r) => {
                             if(r) {
                                 let tl = JSON.parse(r.links || '[]');
                                 if(!tl.includes(aid)) tl.push(aid);
                                 db.run(`UPDATE perimetr_network SET links = ? WHERE id = ?`, [JSON.stringify(tl), newId]);
                             }
                         });
                    }
                });

                res.json({ updated: true });
            });
    });
});

app.delete('/api/v1/network/:id', (req, res) => {
    const aid = req.params.id;
    db.get(`SELECT links FROM perimetr_network WHERE id = ?`, aid, (err, row) => {
        if(err) return res.status(500).json({ error: err.message });
        const links = row ? JSON.parse(row.links || '[]') : [];

        db.run(`DELETE FROM perimetr_network WHERE id = ?`, aid, function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Clean up bi-directional links
            links.forEach(linkId => {
                db.get(`SELECT links FROM perimetr_network WHERE id = ?`, linkId, (e, r) => {
                    if(r) {
                         let tl = JSON.parse(r.links || '[]');
                         tl = tl.filter(l => l !== aid);
                         db.run(`UPDATE perimetr_network SET links = ? WHERE id = ?`, [JSON.stringify(tl), linkId]);
                    }
                });
            });
            res.json({ deleted: true });
        });
    });
});

// 5.4 Plan
app.get('/api/v1/plan', (req, res) => {
    db.get(`SELECT phase0, phase1 FROM perimetr_plan WHERE id = 1`, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || { phase0: '', phase1: '' });
    });
});

app.put('/api/v1/plan', (req, res) => {
    const { phase0, phase1 } = req.body;
    db.run(`UPDATE perimetr_plan SET phase0 = ?, phase1 = ? WHERE id = 1`, [phase0, phase1], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: true });
    });
});

// 5.5 Export / Import
app.get('/api/v1/export', async (req, res) => {
    try {
        const p_cycles = new Promise(r => db.all(`SELECT * FROM perimetr_cycles`, [], (e,d) => r(d)));
        const p_tasks = new Promise(r => db.all(`SELECT * FROM perimetr_tasks`, [], (e,d) => r(d)));
        const p_hist = new Promise(r => db.all(`SELECT * FROM perimetr_history`, [], (e,d) => r(d)));
        const p_net = new Promise(r => db.all(`SELECT * FROM perimetr_network`, [], (e,d) => r(d)));
        const p_plan = new Promise(r => db.get(`SELECT * FROM perimetr_plan WHERE id=1`, (e,d) => r(d)));

        const [cycles, tasks, history, network, plan] = await Promise.all([p_cycles, p_tasks, p_hist, p_net, p_plan]);
        res.json({ cycles, tasks, history, network, plan });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

app.post('/api/v1/import', (req, res) => {
    const data = req.body;
    if(!data) return res.status(400).json({error: "No data"});

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run('DELETE FROM perimetr_tasks');
        db.run('DELETE FROM perimetr_cycles');
        db.run('DELETE FROM perimetr_history');
        db.run('DELETE FROM perimetr_network');
        db.run('DELETE FROM perimetr_plan');

        if(data.cycles) data.cycles.forEach(c => db.run(`INSERT INTO perimetr_cycles VALUES (?,?,?,?)`, [c.id, c.title, c.color, c.order_idx]));
        if(data.tasks) data.tasks.forEach(t => db.run(`INSERT INTO perimetr_tasks VALUES (?,?,?,?,?,?,?)`, [t.id, t.cycle_id, t.text, t.time, t.description, t.fields, t.order_idx]));
        if(data.history) data.history.forEach(h => db.run(`INSERT INTO perimetr_history VALUES (?,?,?)`, [h.date, h.completed_tasks, h.task_data]));
        if(data.network) data.network.forEach(n => db.run(`INSERT INTO perimetr_network VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [n.id, n.name, n.callsign, n.role, n.circle, n.contact, n.last_date, n.next_date, n.notes, n.m, n.i, n.c, n.e, n.value, n.give, n.links]));
        if(data.plan) db.run(`INSERT INTO perimetr_plan VALUES (1,?,?)`, [data.plan.phase0, data.plan.phase1]);

        db.run('COMMIT', (err) => {
            if(err) return res.status(500).json({error: err.message});
            res.json({success: true});
        });
    });
});
