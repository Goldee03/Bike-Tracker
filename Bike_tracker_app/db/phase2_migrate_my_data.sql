-- ONE-TIME OWNER DATA MIGRATION.
-- Run only after the designated owner's sign-up form has been submitted
-- with Confirm email enabled, but BEFORE clicking the confirmation link
-- and BEFORE the owner's first authenticated dashboard load.
--
-- Replace the value below with the exact email used for the OWNER account.
-- Do not run this for other users. New users should start with empty data.
--
-- The old app_data row is retained as a backup. This script copies it;
-- it does not delete or modify the source row.

insert into public.user_data (user_id, data)
select u.id, a.data
from auth.users u
cross join public.app_data a
where lower(u.email) = lower('YOUR_EMAIL_HERE')
  and a.id = 1
on conflict (user_id) do nothing;

-- Verify the owner migration after running:
-- select u.email,
--        jsonb_object_length(d.data->'entries') as ride_days,
--        jsonb_array_length(d.data->'refills') as refuels,
--        jsonb_array_length(d.data->'services') as services,
--        jsonb_array_length(d.data->'expenses') as expenses,
--        d.updated_at
-- from public.user_data d
-- join auth.users u on u.id = d.user_id
-- where lower(u.email) = lower('YOUR_EMAIL_HERE');
