-- Cria a política para permitir a atualização de membros existentes
CREATE POLICY "Allow update for authenticated non-pending members"
ON public.members
FOR UPDATE
USING (
  -- A condição USING define QUAIS linhas o usuário pode editar.
  -- Neste caso, estamos permitindo que usuários não pendentes editem QUALQUER linha.
  -- Se você quisesse que eles editassem apenas o próprio perfil, a condição seria: auth.uid() = user_id
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE user_id = auth.uid() AND role <> 'pendente'
  )
)
WITH CHECK (
  -- A condição WITH CHECK garante que a alteração não viole a regra.
  -- É uma boa prática manter a mesma regra do USING aqui.
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE user_id = auth.uid() AND role <> 'pendente'
  )
);