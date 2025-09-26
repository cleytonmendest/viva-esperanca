-- Cria a política que permite INSERIR e ATUALIZAR eventos.
CREATE POLICY "Allow insert and update for leaders and admins"
ON public.events
FOR ALL -- Aplica para INSERT, UPDATE e DELETE
USING (
  -- A cláusula USING se aplica a UPDATE e DELETE, definindo quais linhas podem ser alteradas.
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
  -- A cláusula WITH CHECK se aplica a INSERT e UPDATE, garantindo que a nova linha satisfaça a condição.
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role NOT IN ('membro', 'pendente')
  )
);

CREATE POLICY "Allow select for all non-pending members"
ON public.events
FOR SELECT
USING (
  -- Apenas usuários autenticados com uma role diferente de 'pendente' podem ver os eventos.
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role <> 'pendente'
  )
);