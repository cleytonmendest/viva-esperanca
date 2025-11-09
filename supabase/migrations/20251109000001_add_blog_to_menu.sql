-- Adiciona página de blog ao menu do admin
INSERT INTO public.page_permissions (page_name, page_path, icon, allowed_roles)
VALUES (
  'Blog',
  '/admin/blog',
  'BookOpen',
  ARRAY['admin', 'pastor(a)', 'lider_midia']::user_role_enum[]
)
ON CONFLICT (page_path) DO NOTHING;
