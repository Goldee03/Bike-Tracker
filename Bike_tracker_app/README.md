# Bike Log

Mileage, fuel, service and expense tracker with per-user accounts.
Static site on Vercel (`public/`) talking directly to Supabase (Auth + Postgres with Row Level Security). No server code.

## Layout
- `public/index.html` - the whole app (login screen + dashboard)
- `public/config.js` - Supabase project URL + public publishable key
- `db/phase2_auth.sql` - per-user table + RLS policies (run once)
- `db/phase2_migrate_my_data.sql` - one-time copy of the old shared data into the designated owner account

## Setup
1. Supabase -> Authentication -> Providers -> Email: enable, and turn **Confirm email** on.
2. Supabase -> Authentication -> URL Configuration: set Site URL to the production Vercel URL and add it to Redirect URLs.
3. Back up the existing data. Keep an exported JSON backup outside the repository.
4. Supabase -> SQL Editor: run `db/phase2_auth.sql` once.
5. Put the Supabase publishable key in `public/config.js`. Never use the secret/service_role key.
6. Deploy on Vercel (Root Directory `Bike_tracker_app`). No server-side environment variables are needed for this static Supabase client setup.
7. Open the app and submit the sign-up form using the email that should own the existing bike history. With **Confirm email** enabled, Supabase creates the Auth user but does not create an authenticated session yet.
8. **Before clicking the email confirmation link and before signing in for the first time**, run `db/phase2_migrate_my_data.sql` in Supabase SQL Editor after replacing `YOUR_EMAIL_HERE` with the exact owner signup email. This copies the old `app_data` record into that one user's `user_data` row.
9. After the migration succeeds, click the email confirmation link and sign in. The dashboard should load the migrated history.
10. Create a second test account. It should start with empty data and must not be able to read or change the first user's records.

## Important: one-time owner data migration
- The migration script is a manual, one-time copy for the designated owner email only. It does not run when someone registers and is not run by Vercel.
- Run it only once, before the owner account's first authenticated dashboard load. The script uses `ON CONFLICT (user_id) DO NOTHING` so it will not overwrite an existing user row if run again.
- New users do not receive the old shared data. Their first authenticated load starts with an empty dataset and creates only their own row.
- Keep the old `app_data` table and the JSON backup until the owner has verified all history in the new account. Do not drop the old table as part of Phase 2.

## Security
Every row in `user_data` is tied to `auth.uid()`; policies let a user read/write only their own row. The publishable key is intended for frontend use; Row Level Security enforces data access. Never put the secret/service_role key in the frontend or GitHub.
