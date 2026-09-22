# Bike Tracker — Application Code

Application layer only: Express API + Postgres schema + frontend
dashboard. Docker, docker-compose, Nginx, TLS, and cloud provisioning
(Terraform) are owned separately as the infra layer.

## What's in this repo

```
public/index.html    ← frontend (dashboard, charts, all UI logic)
server/index.js       ← Express API (GET/PUT /api/data)
server/schema.sql      ← Postgres table + seed data
server/package.json    ← backend dependencies
.env.example            ← required environment variables
```

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `DATABASE_SSL` | `true` for managed cloud DBs (e.g. RDS), `false` for native Postgres |
| `PORT` | Express server port (defaults to 3000) |

## Database setup

```bash
psql -h <host> -U <user> -d <dbname> -f server/schema.sql
```

Note: on first load, the app also merges in a small set of additional
verified ride/fuel entries (14–21 Aug) via an additive-only migration in
the frontend code — it never overwrites existing data, only fills gaps.
This runs automatically regardless of backend, so nothing extra is
needed in the schema for it.

## API surface

- `GET /api/health` — `{status:'ok'}` if DB reachable
- `GET /api/data` — full tracker data blob
- `PUT /api/data` — replaces it

## Local run (no Docker)

```bash
cd server
npm install
DATABASE_URL="postgres://user:pass@localhost:5432/dbname" node index.js
```

Visit `http://localhost:3000`.
