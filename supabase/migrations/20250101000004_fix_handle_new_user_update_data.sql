-- =====================================================
-- Migration: Atualiza trigger para atualizar dados do membro
-- Data: 01/01/2025
-- Descrição: Quando um membro se cadastra e já existe um
--            cadastro pré-existente (dados fake), atualiza
--            nome e data de nascimento com dados reais
-- =====================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  member_id uuid;
begin
  -- Verifica se existe um membro com o mesmo telefone que ainda não tem user_id
  select id into member_id
  from public.members
  where phone = new.raw_user_meta_data->>'phone' and user_id is null;

  if member_id is not null then
    -- Se o membro existe, vincula o user_id E atualiza os dados reais
    update public.members
    set
      user_id = new.id,
      name = new.raw_user_meta_data->>'name',
      birthdate = (new.raw_user_meta_data->>'birthdate')::date
    where id = member_id;
  else
    -- Se o membro não existe, cria um novo registro
    insert into public.members (user_id, name, phone, birthdate, role, status)
    values (
      new.id,
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'phone',
      (new.raw_user_meta_data->>'birthdate')::date,
      'pendente', -- Role padrão para novos usuários
      'ativo'     -- Status padrão para novos usuários
    );
  end if;
  return new;
end;
$$;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user() IS
'Trigger que vincula usuários novos a membros pré-existentes via telefone.
Se o membro já existe (cadastrado pelo admin), atualiza nome e birthdate com dados reais.
Se não existe, cria novo registro com status pendente.';
