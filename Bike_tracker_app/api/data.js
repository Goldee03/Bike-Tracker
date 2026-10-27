const { getPool, ensureSchema, authorized } = require('./_db');

module.exports = async (req, res) => {
  if (!authorized(req)) return res.status(401).json({ error: 'unauthorized' });
  try {
    const db = getPool();
    await ensureSchema(db);
    if (req.method === 'GET') {
      const r = await db.query('SELECT data FROM app_data WHERE id = 1');
      return res.status(200).json(r.rows[0] ? r.rows[0].data : null);
    }
    if (req.method === 'PUT') {
      const body = req.body;
      if (!body || typeof body !== 'object') return res.status(400).json({ error: 'invalid body' });
      await db.query(
        `INSERT INTO app_data (id, data, updated_at) VALUES (1, $1, now())
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
        [JSON.stringify(body)]
      );
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  }
};
