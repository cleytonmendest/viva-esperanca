-- Migration to fix the handle_new_user function.

-- This script replaces the existing function with a corrected version
-- that properly extracts the phone number from the user's metadata.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  member_id uuid;
begin
  -- Check if a member with the same phone number already exists and is not linked to a user
  select id into member_id
  from public.members
  where phone = new.raw_user_meta_data->>'phone' and user_id is null;

  if member_id is not null then
    -- If member exists, link the new user to the existing member record
    update public.members
    set user_id = new.id
    where id = member_id;
  else
    -- If member does not exist, create a new member record
    insert into public.members (user_id, name, phone, role, status)
    values (
      new.id,
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'phone',
      'pendente', -- Default role for new users
      'ativo'     -- Default status for new users
    );
  end if;
  return new;
end;
$$;