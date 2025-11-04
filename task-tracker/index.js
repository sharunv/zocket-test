require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

const now = () => new Date().toISOString();

// POST /tasks - create a new task
app.post('/tasks', (req, res) => {
  try {
    const { title, description = '', status = 'todo' } = req.body || {};
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'title is required and must be a non-empty string' });
    }
    const allowedStatuses = ['todo', 'in_progress', 'done'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const id = uuidv4();
    const created_at = now();
    const updated_at = created_at;

    const stmt = db.prepare(`INSERT INTO tasks (id, title, description, status, created_at, updated_at)
                             VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(id, title.trim(), description, status, created_at, updated_at);

    const task = { id, title: title.trim(), description, status, created_at, updated_at };
    return res.status(201).json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
});

// GET /tasks - list all tasks
app.get('/tasks', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, title, description, status, created_at, updated_at FROM tasks ORDER BY created_at DESC').all();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ error: 'not_found' }));

app.listen(PORT, () => {
  console.log(`Task Tracker API listening on port ${PORT}`);
});
