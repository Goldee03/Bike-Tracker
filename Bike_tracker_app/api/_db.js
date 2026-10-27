const { Pool } = require('pg');
const crypto = require('crypto');

// One small pool per serverless instance (reused across warm invocations)
let pool;
function getPool() {
  if (!pool) {
    // Prefer DATABASE_URL, fall back to the Supabase/Neon integration's POSTGRES_URL
    let url = (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim().replace(/^['"]|['"]$/g, '');
    // Drop sslmode/supa params; SSL is configured explicitly below
    url = url.replace(/[?&](sslmode|supa)=[^&]*/g, (m, k, i) => (m[0] === '?' ? '?' : '')).replace(/\?&/, '?').replace(/\?$/, '');
    pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function ensureSchema(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS app_data (
    id INT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
}

// Password comes only from the APP_PASSWORD env var. Unset = no protection.
function authorized(req) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return true;
  const given = String(req.headers['x-app-password'] || '');
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

module.exports = { getPool, ensureSchema, authorized };
