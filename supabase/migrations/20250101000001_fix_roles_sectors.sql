-- =====================================================
-- Migration FIX: Corrige tabelas roles/sectors existentes
-- Data: 01/01/2025
-- Descrição: Ajusta tabelas que podem ter sido criadas
--            em tentativas anteriores
-- =====================================================

-- =====================================================
-- 1. DROPAR TABELAS ANTIGAS SE EXISTIREM (SEGURO)
-- =====================================================

-- Remover constraints primeiro
ALTER TABLE IF EXISTS public.members DROP CONSTRAINT IF EXISTS members_role_id_fkey;
ALTER TABLE IF EXISTS public.members DROP CONSTRAINT IF EXISTS members_sector_id_fkey;

-- Dropar tabelas antigas
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.sectors CASCADE;

-- Remover colunas antigas em members se existirem
ALTER TABLE public.members DROP COLUMN IF EXISTS role_id;
ALTER TABLE public.members DROP COLUMN IF EXISTS sector_id;

-- =====================================================
-- 2. RECRIAR TABELA DE ROLES
-- =====================================================

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_leadership BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.roles IS 'Roles dinâmicas do sistema - gerenciáveis via UI';
COMMENT ON COLUMN public.roles.name IS 'Nome da role (ex: Admin, Pastor(a), Líder de Mídia)';
COMMENT ON COLUMN public.roles.is_leadership IS 'Indica se a role tem permissões de liderança';

-- =====================================================
-- 3. RECRIAR TABELA DE SETORES
-- =====================================================

CREATE TABLE public.sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Users',
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.sectors IS 'Setores da igreja - gerenciáveis via UI';
COMMENT ON COLUMN public.sectors.name IS 'Nome do setor (ex: Mídia, Louvor, Infantil)';
COMMENT ON COLUMN public.sectors.icon IS 'Nome do ícone Lucide React';
COMMENT ON COLUMN public.sectors.color IS 'Cor em hexadecimal para identificação visual';

-- =====================================================
-- 4. ADICIONAR COLUNAS EM MEMBERS
-- =====================================================

ALTER TABLE public.members
  ADD COLUMN role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  ADD COLUMN sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.members.role_id IS 'Referência à role dinâmica (novo sistema)';
COMMENT ON COLUMN public.members.sector_id IS 'Referência ao setor dinâmico (novo sistema)';
COMMENT ON COLUMN public.members.role IS 'DEPRECATED - Usar role_id';
COMMENT ON COLUMN public.members.sector IS 'DEPRECATED - Usar sector_id';

-- =====================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_members_role_id ON public.members(role_id);
CREATE INDEX idx_members_sector_id ON public.members(sector_id);
CREATE INDEX idx_roles_is_leadership ON public.roles(is_leadership);

-- =====================================================
-- 6. SEED INICIAL - ROLES
-- =====================================================

INSERT INTO public.roles (name, description, is_leadership) VALUES
  ('Admin', 'Administrador do sistema com acesso total', true),
  ('Pastor(a)', 'Pastor(a) da igreja com permissões administrativas', true),
  ('Líder de Mídia', 'Líder do setor de mídia', true),
  ('Líder Geral', 'Líder do setor geral', true),
  ('Membro', 'Membro regular da igreja', false),
  ('Pendente', 'Aguardando aprovação para se tornar membro', false);

-- =====================================================
-- 7. SEED INICIAL - SETORES
-- =====================================================

INSERT INTO public.sectors (name, description, icon, color) VALUES
  ('Mídia', 'Responsável por transmissões, som, imagem e tecnologia', 'Video', '#8B5CF6'),
  ('Geral', 'Atividades gerais e administrativas da igreja', 'Users', '#3B82F6'),
  ('Louvor', 'Ministério de louvor e adoração', 'Music', '#EC4899'),
  ('Infantil', 'Ministério infantil e classes para crianças', 'Baby', '#F59E0B'),
  ('Social', 'Ações sociais e assistência à comunidade', 'Heart', '#10B981');

-- =====================================================
-- 8. MIGRAÇÃO DE DADOS EXISTENTES
-- =====================================================

-- Migrar role enum → role_id
UPDATE public.members m
SET role_id = (
  SELECT r.id FROM public.roles r
  WHERE LOWER(r.name) = CASE
    WHEN m.role::text = 'admin' THEN 'admin'
    WHEN m.role::text = 'pastor(a)' THEN 'pastor(a)'
    WHEN m.role::text = 'lider_midia' THEN 'líder de mídia'
    WHEN m.role::text = 'lider_geral' THEN 'líder geral'
    WHEN m.role::text = 'membro' THEN 'membro'
    WHEN m.role::text = 'pendente' THEN 'pendente'
    ELSE 'membro'
  END
)
WHERE role_id IS NULL;

-- Migrar sector enum[] → sector_id
UPDATE public.members m
SET sector_id = (
  SELECT s.id FROM public.sectors s
  WHERE LOWER(s.name) = CASE
    WHEN 'mídia' = ANY(m.sector) THEN 'mídia'
    WHEN 'geral' = ANY(m.sector) THEN 'geral'
    WHEN 'louvor' = ANY(m.sector) THEN 'louvor'
    WHEN 'infantil' = ANY(m.sector) THEN 'infantil'
    WHEN 'social' = ANY(m.sector) THEN 'social'
    ELSE NULL
  END
  LIMIT 1
)
WHERE sector_id IS NULL AND m.sector IS NOT NULL AND array_length(m.sector, 1) > 0;

-- =====================================================
-- 9. RLS (Row Level Security)
-- =====================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles são visíveis para todos"
  ON public.roles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Sectors são visíveis para todos"
  ON public.sectors FOR SELECT
  TO public
  USING (true);

-- =====================================================
-- 10. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sectors_updated_at
  BEFORE UPDATE ON public.sectors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
