-- =====================================================
-- Migration: Fix Infinite Recursion in Admin Policy
-- Description: Cria função helper para verificar se usuário é Admin
--              sem causar recursão infinita nas policies
-- Author: Claude
-- Date: 2025-12-29
-- =====================================================

-- PASSO 1: Criar função helper que bypassa RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members m
    INNER JOIN public.roles r ON m.role_id = r.id
    WHERE m.user_id = auth.uid()
    AND r.name = 'Admin'
  );
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.is_admin() IS
'Verifica se o usuário autenticado é Admin. Usa SECURITY DEFINER para evitar recursão infinita nas policies.';

-- PASSO 2: Recriar a policy usando a função
DROP POLICY IF EXISTS "Admin can update all members" ON public.members;

CREATE POLICY "Admin can update all members"
ON public.members
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Comentário da policy
COMMENT ON POLICY "Admin can update all members" ON public.members IS
'Permite que admins atualizem qualquer membro. Usa função is_admin() para evitar recursão.';
