# Bike Log

Mileage, fuel, service and expense tracker with per-user accounts.
Static site on Vercel (`public/`) talking directly to Supabase (Auth + Postgres with Row Level Security). No server code.

## Layout
- `public/index.html` - the whole app (login screen + dashboard)
- `public/config.js` - Supabase project URL + publishable key (public by design)
- `db/phase2_auth.sql` - per-user table + RLS policies (run once)
- `db/phase2_migrate_my_data.sql` - moves the original shared data into your account (run once)

## Setup
1. Supabase -> Authentication -> Providers -> Email: enable, and turn **Confirm email** on.
2. Supabase -> Authentication -> URL Configuration: set Site URL to your Vercel URL and add it to Redirect URLs.
3. Supabase -> SQL Editor: run `db/phase2_auth.sql`.
4. Put the publishable key in `public/config.js`.
5. Deploy on Vercel (Root Directory `Bike_tracker_app`). No environment variables are needed.
6. Sign up in the app, confirm the email, then run `db/phase2_migrate_my_data.sql` with your email.

## Security
Every row in `user_data` is tied to `auth.uid()`; policies let a user read/write only their own row. Never put the secret or service_role key in the frontend.
