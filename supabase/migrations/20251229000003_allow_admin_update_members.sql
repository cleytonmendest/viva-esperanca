-- =====================================================
-- Migration: Allow admins to update any member
-- Description: Adiciona policy para admins poderem editar qualquer membro
--              (não apenas seu próprio perfil)
-- Author: Claude
-- Date: 2025-01-01
-- =====================================================

-- Remove policy antiga se existir
DROP POLICY IF EXISTS "Admin can update all members" ON public.members;

-- Cria policy para admin atualizar QUALQUER membro (incluindo role_id e sector_id)
CREATE POLICY "Admin can update all members"
ON public.members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members m
    INNER JOIN public.roles r ON m.role_id = r.id
    WHERE m.user_id = auth.uid()
    AND r.name = 'Admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members m
    INNER JOIN public.roles r ON m.role_id = r.id
    WHERE m.user_id = auth.uid()
    AND r.name = 'Admin'
  )
);

-- Adiciona comentário
COMMENT ON POLICY "Admin can update all members" ON public.members IS
'Permite que admins atualizem qualquer membro, incluindo role_id e sector_id';