-- supabase/migrations/xxxxxxxxxxxxxx_create_roles_and_sectors_tables.sql

-- Tabela para armazenar os setores/ministérios
CREATE TABLE public.sectors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela para armazenar as roles/funções
CREATE TABLE public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (Exemplo: todos autenticados podem ler)
CREATE POLICY "Allow read for authenticated users on sectors"
ON public.sectors FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read for authenticated users on roles"
ON public.roles FOR SELECT USING (auth.role() = 'authenticated');

-- Populando a tabela sectors
INSERT INTO public.sectors (name) VALUES
('mídia'),
('geral'),
('louvor'),
('infantil'),
('social');

-- Populando a tabela roles
INSERT INTO public.roles (name) VALUES
('admin'),
('pastor(a)'),
('lider_midia'),
('lider_geral'),
('lider_louvor'),  -- Novo
('lider_social'),  -- Novo
('lider_infantil'),-- Novo
('pendente'),
('membro');

-- Adicionar coluna para a chave estrangeira de role na tabela members
ALTER TABLE public.members
ADD COLUMN role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;

-- Adicionar uma tabela de junção para a relação muitos-para-muitos entre members e sectors
CREATE TABLE public.member_sectors (
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, sector_id)
);

-- Adicionar coluna para a chave estrangeira de sector na tabela tasks
ALTER TABLE public.tasks
ADD COLUMN sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL;