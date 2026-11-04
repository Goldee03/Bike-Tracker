# Bike Log

A mileage, fuel, service and expense tracker with individual user accounts.

The application is a static site hosted on Vercel. It uses Supabase Authentication for sign-in and the Supabase `user_data` table for each user's records. Row Level Security (RLS) ensures users can access only their own data.

## Where to find things

```
public/
  index.html            page frame only: lists the CSS and JS files below, in load order
  config.js             Supabase URL + publishable key (and optional login video)
  css/
    base.css            fonts, colours (variables), reset
    components.css      shared pieces: tabs, panels, form fields, buttons, tables, date icon
    dashboard.css       Dashboard page
    pages.css           layout of the other pages (Log Ride, Fuel Log, Service, ...) + spending bars
    layout.css          side menu, page frame, responsive widths, background photo
    auth.css            Login page and its night-ride background
  js/
    core/               shared plumbing, no page-specific code
      state.js          global variables
      utils.js          formatting helpers (money, dates)
      stats.js          ride calculations (odometer, month totals, gaps)
      data.js           default data, migration, load/save to Supabase
      router.js         page URLs (/logride, /fuellog ...), back button
      session.js        auto sign-out after inactivity (IDLE_LIMIT_HOURS)
    auth/auth.js        login, register, reset password, sign out
    features/           ONE FILE PER PAGE
      dashboard.js      /dashboard
      logride.js        /logride
      fuellog.js        /fuellog
      service.js        /service
      expenses.js       /expenses
      spending.js       /spending
      mileage.js        /mileage
      backup.js         /backup
    app.js              side menu + page frame, picks the page, starts the app
  media/                login/background photos and video
db/
  phase2_auth.sql       per-user data table and RLS policies (database setup reference)
```

**Rule of thumb:** to change a page, open `js/features/<page>.js` (what it shows and does) and, if it is about looks, `css/dashboard.css` or `css/pages.css`. Anything every page uses is in `core/` or `css/components.css`.

All files are plain scripts (no build step). They share globals and load in the order listed in `index.html`, so a new file must be added to that list.

## Pages
`/login`, `/dashboard`, `/logride`, `/fuellog` (also `/fuelog`), `/service`, `/expenses`, `/spending`, `/mileage`, `/backup`. `vercel.json` sends every non-file path to `index.html`; `js/core/router.js` reads the path to pick the page.

## Sessions
Users are signed out after `IDLE_LIMIT_HOURS` (default 2, set in `public/js/core/session.js`) without using the app. This is enforced in the browser. For server-side enforcement, Supabase Pro has Auth -> Sessions -> inactivity timeout.

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
