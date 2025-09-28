-- Remove a política antiga para podermos criar uma nova no lugar.
DROP POLICY IF EXISTS "Allow select for leaders and admins" ON public.tasks;

-- Cria a nova política que permite a visualização (SELECT) das tarefas para todos os membros não pendentes.
CREATE POLICY "Allow view on tasks for non-pending members"
ON public.tasks
FOR SELECT
USING (
  -- A condição agora permite que qualquer usuário com uma role diferente de 'pendente' possa ver as tarefas.
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role <> 'pendente'
  )
);