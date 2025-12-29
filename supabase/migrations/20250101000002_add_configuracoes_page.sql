-- =====================================================
-- Migration: Adiciona página Configurações
-- Data: 01/01/2025
-- Descrição: Adiciona página de configurações do sistema
--            acessível apenas para admins
-- =====================================================

INSERT INTO page_permissions (page_name, page_path, icon, allowed_roles)
VALUES (
  'Configurações',
  '/admin/configuracoes',
  'Settings',
  ARRAY['admin']::user_role_enum[]
)
ON CONFLICT (page_path) DO UPDATE
SET
  page_name = EXCLUDED.page_name,
  icon = EXCLUDED.icon,
  allowed_roles = EXCLUDED.allowed_roles;

-- Comentário explicativo
COMMENT ON COLUMN page_permissions.page_path IS 'Caminho da página - /admin/configuracoes acessível apenas para admins';
