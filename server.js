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
