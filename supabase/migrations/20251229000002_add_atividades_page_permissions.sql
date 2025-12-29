-- Adiciona página "Atividades" ao menu com acesso para todos os membros
INSERT INTO page_permissions (page_name, page_path, icon, allowed_roles)
VALUES (
  'Atividades',
  '/admin/atividades',
  'Activity',
  ARRAY['admin', 'pastor(a)', 'lider_midia', 'lider_geral', 'membro']::user_role_enum[]
)
ON CONFLICT (page_path) DO UPDATE
SET
  page_name = EXCLUDED.page_name,
  icon = EXCLUDED.icon,
  allowed_roles = EXCLUDED.allowed_roles;

-- Comentário explicativo
COMMENT ON COLUMN page_permissions.page_path IS 'Caminho da página - /admin/atividades acessível para todos os membros';
