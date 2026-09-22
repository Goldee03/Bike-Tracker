require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// DATABASE_SSL=true is needed for most managed cloud databases (e.g. AWS RDS),
// which require SSL and present a cert not in Node's default CA store.
// Leave unset/false for a plain local/native Postgres install.
const useSSL = process.env.DATABASE_SSL === 'true';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

// Ensure the table exists even if schema.sql wasn't run yet.
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_data (
      id INT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ status: 'db unreachable' });
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const r = await pool.query('SELECT data FROM app_data WHERE id = 1');
    res.json(r.rows[0]?.data ?? null);
  } catch (e) {
    console.error('GET /api/data failed', e);
    res.status(500).json({ error: 'database error' });
  }
});

app.put('/api/data', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO app_data (id, data, updated_at)
       VALUES (1, $1, now())
       ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = now()`,
      [req.body]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('PUT /api/data failed', e);
    res.status(500).json({ error: 'database error' });
  }
});

// Serve the static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

ensureSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`Bike tracker server running on port ${PORT}`));
  })
  .catch((e) => {
    console.error('Failed to ensure schema, starting anyway', e);
    app.listen(PORT, () => console.log(`Bike tracker server running on port ${PORT} (schema check failed)`));
  });
