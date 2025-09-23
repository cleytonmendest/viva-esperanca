-- Cria uma política única que permite INSERIR, SELECIONAR, ATUALIZAR e DELETAR
-- para qualquer usuário autenticado que não tenha a role 'pendente'.
CREATE POLICY "Allow all access for authenticated members"
ON public.visitors
FOR ALL
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