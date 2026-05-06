delete from public.user_roles ur
using auth.users u
where ur.user_id = u.id
  and ur.role = 'admin'
  and lower(u.email) not in (
    'rufus090420@gmail.com',
    'rufus090400@gmail.com',
    'dynamicmarketing538@gmail.com'
  );

insert into public.user_roles (user_id, role)
select u.id, 'admin'::public.app_role
from auth.users u
where lower(u.email) in (
  'rufus090420@gmail.com',
  'rufus090400@gmail.com',
  'dynamicmarketing538@gmail.com'
)
on conflict (user_id, role) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  if lower(new.email) in (
    'rufus090420@gmail.com',
    'rufus090400@gmail.com',
    'dynamicmarketing538@gmail.com'
  ) then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$$;