-- Adicionar página do Dashboard Executivo às permissões
INSERT INTO page_permissions (page_name, page_path, icon, allowed_roles)
VALUES (
  'Dashboard',
  '/admin/dashboard',
  'BarChart3',
  ARRAY['admin', 'pastor(a)', 'lider_midia', 'lider_geral']::user_role_enum[]
)
ON CONFLICT (page_path) DO UPDATE
SET
  page_name = EXCLUDED.page_name,
  icon = EXCLUDED.icon,
  allowed_roles = EXCLUDED.allowed_roles;
