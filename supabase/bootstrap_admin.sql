-- Ganti email di bawah dengan email yang sudah dibuat di Supabase Authentication > Users.

insert into public.admin_users (user_id, email, role)
select id, email, 'owner'
from auth.users
where email = 'EMAIL_ADMIN_KAMU'
on conflict (user_id) do update
set email = excluded.email,
    role = excluded.role,
    updated_at = now();

-- Hasil harus menampilkan akun owner kamu.
select user_id, email, role, created_at, updated_at
from public.admin_users
order by created_at;
