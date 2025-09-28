-- Tabela para gerenciar o acesso às páginas do admin
CREATE TABLE public.page_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  page_path TEXT NOT NULL UNIQUE,
  allowed_roles public.user_role_enum[] NOT NULL,
  icon TEXT, -- Opcional: para ícone do menu
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.page_permissions ENABLE ROW LEVEL SECURITY;

-- Política de Acesso: Apenas administradores podem gerenciar as permissões
CREATE POLICY "Allow all for admins"
ON public.page_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.members
    WHERE
      user_id = auth.uid() AND
      role = 'admin'
  )
);

-- Política de Leitura: Todos os usuários autenticados podem ler as permissões
-- Isso é necessário para que o sidebar e as páginas possam verificar o acesso
CREATE POLICY "Allow read for authenticated users"
ON public.page_permissions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Inserir os dados iniciais das páginas existentes
INSERT INTO public.page_permissions (page_name, page_path, allowed_roles, icon) VALUES
('Página Inicial', '/admin', '{"admin", "pastor(a)", "lider_midia", "lider_geral", "membro"}', 'Home'),
('Membros', '/admin/members', '{"admin", "pastor(a)", "lider_midia", "lider_geral"}', 'Church'),
('Visitantes', '/admin/visitors', '{"admin", "pastor(a)", "lider_geral", "lider_midia"}', 'PersonStanding'),
('Eventos', '/admin/events', '{"admin", "pastor(a)", "lider_midia", "lider_geral", "membro"}', 'Calendar'),
('Tarefas', '/admin/tasks', '{"admin", "pastor(a)", "lider_midia", "lider_geral}', 'ListTodo');