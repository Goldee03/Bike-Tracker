-- Run ONCE, AFTER you have created and confirmed your own account in the app.
-- Replace the email below with the one you signed up with.
insert into public.user_data (user_id, data)
select u.id, a.data
from auth.users u, public.app_data a
where u.email = 'YOUR_EMAIL_HERE' and a.id = 1
on conflict (user_id) do nothing;

-- Check:
-- select u.email, jsonb_array_length(d.data->'refills') as refuels
-- from public.user_data d join auth.users u on u.id = d.user_id;
