const express = require('express');
const router = express.Router();
const db = require('../db/database');

// --- ЗАДАЧИ И ЦИКЛЫ ---

// Получить все циклы и вложенные в них задачи
router.get('/cycles', (req, res) => {
    try {
        const cycles = db.prepare('SELECT * FROM cycles').all();
        const tasks = db.prepare('SELECT * FROM tasks').all();

        // Вложим задачи в циклы
        const result = cycles.map(cycle => {
            return {
                ...cycle,
                tasks: tasks.filter(task => task.cycle_id === cycle.id)
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Создать новую задачу
router.post('/tasks', (req, res) => {
    try {
        const { id, cycle_id, text, time, description, fields } = req.body;

        if (!id || !cycle_id || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const stmt = db.prepare('INSERT INTO tasks (id, cycle_id, text, time, description, fields) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(id, cycle_id, text, time || '', description || '', fields ? JSON.stringify(fields) : '[]');

        res.status(201).json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удалить задачу
router.delete('/tasks/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
        stmt.run(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Сброс БД задач до "заводских"
router.post('/reset-cycles', (req, res) => {
    try {
        const resetCycles = db.transaction(() => {
            db.prepare('DELETE FROM tasks').run();
            // TODO: Можно здесь добавить базовые задачи, если есть seed-данные для них
        });
        resetCycles();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- БОЕВОЙ РИТМ (ИСТОРИЯ) ---

// Получить историю за день
router.get('/history/:date', (req, res) => {
    try {
        const { date } = req.params;
        const record = db.prepare('SELECT * FROM history WHERE date = ?').get(date);

        if (record) {
            res.json({
                date: record.date,
                completedTasks: JSON.parse(record.completed_tasks || '[]'),
                taskData: JSON.parse(record.task_data || '{}')
            });
        } else {
            res.json({ date, completedTasks: [], taskData: {} });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Обновить историю за день
router.post('/history/:date', (req, res) => {
    try {
        const { date } = req.params;
        const { completedTasks, taskData } = req.body;

        const completedStr = completedTasks ? JSON.stringify(completedTasks) : '[]';
        const dataStr = taskData ? JSON.stringify(taskData) : '{}';

        const stmt = db.prepare(`
            INSERT INTO history (date, completed_tasks, task_data)
            VALUES (?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET
            completed_tasks = excluded.completed_tasks,
            task_data = excluded.task_data
        `);
        stmt.run(date, completedStr, dataStr);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- АГЕНТУРНАЯ СЕТЬ (CRM) ---

router.get('/network', (req, res) => {
    try {
        const contacts = db.prepare('SELECT * FROM network').all();
        // Парсим links обратно в массив для фронтенда
        const result = contacts.map(c => ({
            ...c,
            links: JSON.parse(c.links || '[]')
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/network', (req, res) => {
    try {
        const { id, name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links } = req.body;

        if (!id || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const linksArr = Array.isArray(links) ? links : [];
        const linksStr = JSON.stringify(linksArr);

        const tx = db.transaction(() => {
            const stmt = db.prepare(`
                INSERT INTO network (id, name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(id, name, callsign || '', role || '', circle || 4, contact || '', last_date || '', next_date || '', notes || '', m || '', i || '', c || '', e || '', value || '', give || '', linksStr);

            // Bi-directional linking: добавить этот ID в links связанных контактов
            for (const linkId of linksArr) {
                const target = db.prepare('SELECT links FROM network WHERE id = ?').get(linkId);
                if (target) {
                    const tLinks = JSON.parse(target.links || '[]');
                    if (!tLinks.includes(id)) {
                        tLinks.push(id);
                        db.prepare('UPDATE network SET links = ? WHERE id = ?').run(JSON.stringify(tLinks), linkId);
                    }
                }
            }
        });

        tx();
        res.status(201).json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/network/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links } = req.body;

        const oldContact = db.prepare('SELECT links FROM network WHERE id = ?').get(id);
        if (!oldContact) return res.status(404).json({ error: 'Contact not found' });

        const newLinksArr = Array.isArray(links) ? links : [];
        const oldLinksArr = JSON.parse(oldContact.links || '[]');

        const tx = db.transaction(() => {
            const stmt = db.prepare(`
                UPDATE network SET
                name = ?, callsign = ?, role = ?, circle = ?, contact = ?, last_date = ?, next_date = ?, notes = ?, m = ?, i = ?, c = ?, e = ?, value = ?, give = ?, links = ?
                WHERE id = ?
            `);
            stmt.run(name, callsign || '', role || '', circle || 4, contact || '', last_date || '', next_date || '', notes || '', m || '', i || '', c || '', e || '', value || '', give || '', JSON.stringify(newLinksArr), id);

            // Bi-directional linking (убрать у тех, кто был удален из связей)
            const removedLinks = oldLinksArr.filter(l => !newLinksArr.includes(l));
            for (const linkId of removedLinks) {
                const target = db.prepare('SELECT links FROM network WHERE id = ?').get(linkId);
                if (target) {
                    const tLinks = JSON.parse(target.links || '[]').filter(l => l !== id);
                    db.prepare('UPDATE network SET links = ? WHERE id = ?').run(JSON.stringify(tLinks), linkId);
                }
            }

            // Bi-directional linking (добавить тем, кто был добавлен)
            const addedLinks = newLinksArr.filter(l => !oldLinksArr.includes(l));
            for (const linkId of addedLinks) {
                const target = db.prepare('SELECT links FROM network WHERE id = ?').get(linkId);
                if (target) {
                    const tLinks = JSON.parse(target.links || '[]');
                    if (!tLinks.includes(id)) {
                        tLinks.push(id);
                        db.prepare('UPDATE network SET links = ? WHERE id = ?').run(JSON.stringify(tLinks), linkId);
                    }
                }
            }
        });

        tx();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/network/:id', (req, res) => {
    try {
        const { id } = req.params;
        const oldContact = db.prepare('SELECT links FROM network WHERE id = ?').get(id);

        if (oldContact) {
            const tx = db.transaction(() => {
                const oldLinksArr = JSON.parse(oldContact.links || '[]');
                db.prepare('DELETE FROM network WHERE id = ?').run(id);

                // Вычистить этот ID из всех связей
                for (const linkId of oldLinksArr) {
                    const target = db.prepare('SELECT links FROM network WHERE id = ?').get(linkId);
                    if (target) {
                        const tLinks = JSON.parse(target.links || '[]').filter(l => l !== id);
                        db.prepare('UPDATE network SET links = ? WHERE id = ?').run(JSON.stringify(tLinks), linkId);
                    }
                }
            });
            tx();
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ПЛАН ---

router.get('/plan', (req, res) => {
    try {
        const plan = db.prepare('SELECT * FROM plan WHERE id = 1').get();
        res.json(plan || { phase0: '', phase1: '' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/plan', (req, res) => {
    try {
        const { phase0, phase1 } = req.body;
        db.prepare('UPDATE plan SET phase0 = ?, phase1 = ? WHERE id = 1').run(phase0 || '', phase1 || '');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CBT DATA (КПТ Модуль) ---
router.get('/cbt', (req, res) => {
    try {
        const records = db.prepare('SELECT * FROM cbt_data').all();
        const grouped = {};
        records.forEach(r => {
            if (!grouped[r.type]) grouped[r.type] = [];
            grouped[r.type].push({ id: r.id, ...JSON.parse(r.data) });
        });
        res.json(grouped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/cbt', (req, res) => {
    try {
        const { id, type, data } = req.body;
        if (!id || !type || !data) return res.status(400).json({ error: 'Missing required fields' });

        db.prepare('INSERT INTO cbt_data (id, type, data) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, type = excluded.type').run(id, type, JSON.stringify(data));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/cbt/:id', (req, res) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM cbt_data WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- ТАЙМЕР ---

router.post('/timer/session', (req, res) => {
    try {
        const { id, date, mode, duration_ms, completed } = req.body;
        if (!id || !date || !mode) return res.status(400).json({ error: 'Missing fields' });

        db.prepare('INSERT INTO timer_sessions (id, date, mode, duration_ms, completed) VALUES (?, ?, ?, ?, ?)').run(id, date, mode, duration_ms || 0, completed ? 1 : 0);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/timer/stats/:month', (req, res) => {
    try {
        // month in YYYY-MM format
        const { month } = req.params;
        const sessions = db.prepare('SELECT date, completed FROM timer_sessions WHERE date LIKE ?').all(`${month}%`);
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- IMPORT / EXPORT ---

router.get('/export', (req, res) => {
    try {
        const data = {
            cycles: db.prepare('SELECT * FROM cycles').all(),
            tasks: db.prepare('SELECT * FROM tasks').all(),
            history: db.prepare('SELECT * FROM history').all(),
            network: db.prepare('SELECT * FROM network').all(),
            plan: db.prepare('SELECT * FROM plan WHERE id = 1').get(),
            cbt_data: db.prepare('SELECT * FROM cbt_data').all(),
            timer_sessions: db.prepare('SELECT * FROM timer_sessions').all()
        };
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/import', (req, res) => {
    try {
        const data = req.body;
        const tx = db.transaction(() => {
            // Очищаем таблицы
            db.prepare('DELETE FROM timer_sessions').run();
            db.prepare('DELETE FROM cbt_data').run();
            db.prepare('DELETE FROM plan').run();
            db.prepare('DELETE FROM network').run();
            db.prepare('DELETE FROM history').run();
            db.prepare('DELETE FROM tasks').run();
            db.prepare('DELETE FROM cycles').run();

            // Вставляем данные обратно
            if (data.cycles) {
                const insertCycle = db.prepare('INSERT INTO cycles (id, title, color) VALUES (?, ?, ?)');
                data.cycles.forEach(c => insertCycle.run(c.id, c.title, c.color));
            }
            if (data.tasks) {
                const insertTask = db.prepare('INSERT INTO tasks (id, cycle_id, text, time, description, fields) VALUES (?, ?, ?, ?, ?, ?)');
                data.tasks.forEach(t => insertTask.run(t.id, t.cycle_id, t.text, t.time, t.description, t.fields));
            }
            if (data.history) {
                const insertHistory = db.prepare('INSERT INTO history (date, completed_tasks, task_data) VALUES (?, ?, ?)');
                data.history.forEach(h => insertHistory.run(h.date, h.completed_tasks, h.task_data));
            }
            if (data.network) {
                const insertNetwork = db.prepare('INSERT INTO network (id, name, callsign, role, circle, contact, last_date, next_date, notes, m, i, c, e, value, give, links) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                data.network.forEach(n => insertNetwork.run(n.id, n.name, n.callsign, n.role, n.circle, n.contact, n.last_date, n.next_date, n.notes, n.m, n.i, n.c, n.e, n.value, n.give, n.links));
            }
            if (data.plan) {
                db.prepare('INSERT INTO plan (id, phase0, phase1) VALUES (1, ?, ?)').run(data.plan.phase0, data.plan.phase1);
            } else {
                db.prepare('INSERT INTO plan (id, phase0, phase1) VALUES (1, ?, ?)').run('', '');
            }
            if (data.cbt_data) {
                const insertCbt = db.prepare('INSERT INTO cbt_data (id, type, data) VALUES (?, ?, ?)');
                data.cbt_data.forEach(c => insertCbt.run(c.id, c.type, c.data));
            }
            if (data.timer_sessions) {
                const insertSession = db.prepare('INSERT INTO timer_sessions (id, date, mode, duration_ms, completed) VALUES (?, ?, ?, ?, ?)');
                data.timer_sessions.forEach(s => insertSession.run(s.id, s.date, s.mode, s.duration_ms, s.completed));
            }
        });
        tx();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
