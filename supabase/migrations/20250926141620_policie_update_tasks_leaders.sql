-- Cria a política para permitir a atualização (UPDATE) das tarefas.
CREATE POLICY "Allow update for leaders and admins"
ON public.tasks
FOR UPDATE
USING (
  -- A cláusula USING verifica quais linhas o usuário tem permissão para atualizar.
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role NOT IN ('membro', 'pendente')
  )
)
WITH CHECK (
  -- A cláusula WITH CHECK garante que a alteração em si também satisfaz a condição.
  -- É uma boa prática manter a mesma regra aqui.
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role NOT IN ('membro', 'pendente')
  )
);