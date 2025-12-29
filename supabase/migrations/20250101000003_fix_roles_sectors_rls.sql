-- =====================================================
-- Migration FIX: Adiciona policies de INSERT/UPDATE/DELETE
-- Data: 01/01/2025
-- Descrição: Permite que authenticated users (admins)
--            possam criar/editar/deletar roles e setores
-- =====================================================

-- =====================================================
-- ROLES POLICIES
-- =====================================================

-- Policy para INSERT (criar roles)
CREATE POLICY "Authenticated users podem inserir roles"
  ON public.roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy para UPDATE (editar roles)
CREATE POLICY "Authenticated users podem atualizar roles"
  ON public.roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy para DELETE (deletar roles)
CREATE POLICY "Authenticated users podem deletar roles"
  ON public.roles FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- SECTORS POLICIES
-- =====================================================

-- Policy para INSERT (criar setores)
CREATE POLICY "Authenticated users podem inserir sectors"
  ON public.sectors FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy para UPDATE (editar setores)
CREATE POLICY "Authenticated users podem atualizar sectors"
  ON public.sectors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy para DELETE (deletar setores)
CREATE POLICY "Authenticated users podem deletar sectors"
  ON public.sectors FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON POLICY "Authenticated users podem inserir roles" ON public.roles IS
'Permite que usuários autenticados criem roles - verificação de admin feita na aplicação';

COMMENT ON POLICY "Authenticated users podem inserir sectors" ON public.sectors IS
'Permite que usuários autenticados criem setores - verificação de admin feita na aplicação';
