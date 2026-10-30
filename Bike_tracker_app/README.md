# Bike Log

Mileage, fuel, service and expense tracker.
Frontend: static page in `public/`. Backend: Vercel serverless functions in `api/`. Database: Supabase Postgres.

## Layout
- `public/index.html` - the whole UI
- `api/data.js` - GET/PUT the app data (single JSONB row)
- `api/health.js` - health check
- `api/_db.js` - DB pool + password check
- `db/schema.sql` - creates the table (run once in Supabase). No personal data is stored in the repo; records live only in the database.

## Deploy
1. **Supabase**: SQL Editor -> paste and run `db/schema.sql`.
2. **Vercel**: import this repo, set **Root Directory** to `Bike_tracker_app`, framework preset **Other**.
3. **Environment variables** (Vercel -> Settings -> Environment Variables, Production):
   - `DATABASE_URL` - Supabase connection string (see `.env.example`). Optional if the Supabase integration already added `POSTGRES_URL`.
   - `APP_PASSWORD` - the password the site asks for.
4. Redeploy (env vars only apply to new deployments).
5. Open the site, enter the password. Check `/api/health` returns `{"ok":true}`.

## Notes
- The browser stores the password in localStorage after the first successful entry.
- Export a JSON backup from the Backup tab regularly.
