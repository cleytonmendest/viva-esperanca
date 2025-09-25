-- Cria a política que permite a inserção de novas tarefas.
CREATE POLICY "Allow insert for leaders and admins"
ON public.tasks
FOR INSERT
WITH CHECK (
  -- Verifica se o usuário que está fazendo a requisição está autenticado
  auth.role() = 'authenticated' AND
  -- Verifica se existe um perfil para o usuário atual E se a role dele NÃO é 'membro' E NÃO é 'pendente'.
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role NOT IN ('membro', 'pendente')
  )
);