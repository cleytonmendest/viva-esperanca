DROP POLICY IF EXISTS "Allow view and update for non-pending members" ON public.event_assignments;
DROP POLICY IF EXISTS "Allow insert and delete for leaders and admins" ON public.event_assignments;
DROP POLICY IF EXISTS "Allow insert for leaders and admins" ON public.event_assignments;

CREATE POLICY "Allow view on event_assignments for non-pending members"
ON public.event_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role <> 'pendente'
  )
);

CREATE POLICY "Allow update on event_assignments for non-pending members"
ON public.event_assignments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role <> 'pendente'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role <> 'pendente'
  )
);

-- Cria a política que permite CRIAR atribuições.
CREATE POLICY "Allow insert on event_assignments for leaders and admins"
ON public.event_assignments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role NOT IN ('membro', 'pendente')
  )
);

-- Cria a política que permite DELETAR atribuições.
CREATE POLICY "Allow delete on event_assignments for leaders and admins"
ON public.event_assignments
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role NOT IN ('membro', 'pendente')
  )
);