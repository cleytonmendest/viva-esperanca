-- Cria a política que permite a exclusão de tarefas.
CREATE POLICY "Allow delete for admins"
ON public.tasks
FOR DELETE
USING (
  -- A cláusula USING verifica se o usuário que está tentando deletar
  -- tem a role 'admin' na tabela de membros.
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role = 'admin'
  )
);