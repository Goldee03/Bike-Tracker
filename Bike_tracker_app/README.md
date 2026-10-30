# Bike Log

A mileage, fuel, service and expense tracker with individual user accounts.

The application is a static site hosted on Vercel. It uses Supabase Authentication for sign-in and the Supabase `user_data` table for each user's records. Row Level Security (RLS) ensures users can access only their own data.

## Project layout

- `public/index.html` - application UI, authentication and dashboard
- `public/config.js` - Supabase project URL and public publishable key
- `db/phase2_auth.sql` - creates the per-user data table and its RLS policies; retained as the database setup reference

## Setup

1. In Supabase Authentication -> Providers -> Email, enable email sign-up and configure email confirmation as required.
2. In Supabase Authentication -> URL Configuration, set the Site URL to the production Vercel URL and add the required Redirect URLs.
3. In Supabase SQL Editor, run `db/phase2_auth.sql` only when setting up this schema in a new or reset project. It has already been applied to the current production database; do not rerun it without reviewing its statements first.
4. Set the Supabase project URL and public publishable key in `public/config.js`. Never put a secret or service-role key in frontend code.
5. Deploy on Vercel with the Root Directory set to `Bike_tracker_app`. The current frontend talks directly to Supabase, so the retired API's database connection and app-password environment variables are not required.

## User data and backups

- Each authenticated user has a separate row in `public.user_data`, keyed by their Supabase Auth user ID.
- New accounts start with an empty dataset.
- The application loads and saves only the signed-in user's row.
- RLS policies enforce per-user access in the database; frontend filtering alone is not the security boundary.
- Use the application's **Backup** tab to download a JSON backup or restore a backup into the currently signed-in account.
- Keep backups in a secure location outside the repository. A restore replaces the data for the account currently signed in.

## Legacy data

The old shared `public.app_data` table is not used by the current application. It may be retained temporarily as an independent historical copy; do not expose it through public access policies. The current application does not automatically read or migrate data from that table.

## Security

The frontend uses only the Supabase publishable key. Access to `user_data` is controlled by RLS policies that compare each row's `user_id` with `auth.uid()`. Never commit a Supabase secret or service-role key to GitHub or place one in frontend code.
