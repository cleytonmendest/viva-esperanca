-- supabase/migrations/xxxxxxxxxxxxxx_allow_insert_for_authenticated_members.sql

-- Garante que o RLS está ativado na tabela 'members'
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Cria a política para permitir a inserção de novos membros
CREATE POLICY "Allow insert for authenticated non-pending members"
ON public.members
FOR INSERT
WITH CHECK (
  -- Verifica se o usuário fazendo a requisição está autenticado
  auth.role() = 'authenticated' AND
  -- Verifica se existe um perfil para o usuário atual E se a role dele NÃO é 'pendente'
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE user_id = auth.uid() AND role <> 'pendente'
  )
);