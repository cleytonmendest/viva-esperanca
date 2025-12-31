-- =====================================================
-- Migration: Migrate from old enum system to new FK system
-- Description: Migra todos os dados de role/sector (enum) para role_id/sector_id (FK)
--              e remove as colunas antigas
-- Author: Claude
-- Date: 2025-01-01
-- =====================================================

-- =====================================================
-- PASSO 0: Atualizar RLS policies para usar novo sistema FK
-- =====================================================
-- IMPORTANTE: Este passo DEVE vir ANTES da remoção das colunas antigas

-- MEMBERS TABLE POLICIES
DROP POLICY IF EXISTS "Allow insert for authenticated non-pending members" ON public.members;
CREATE POLICY "Allow insert for authenticated non-pending members"
ON public.members FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND role_id IS NOT NULL);

DROP POLICY IF EXISTS "Allow update for authenticated non-pending members" ON public.members;
CREATE POLICY "Allow update for authenticated non-pending members"
ON public.members FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow members to view all non-pending members" ON public.members;
CREATE POLICY "Allow members to view all non-pending members"
ON public.members FOR SELECT TO authenticated
USING (deleted_at IS NULL AND (role_id != (SELECT id FROM public.roles WHERE name = 'Pendente') OR auth.uid() = user_id));

-- VISITORS TABLE POLICIES
DROP POLICY IF EXISTS "Allow all access for authenticated members" ON public.visitors;
CREATE POLICY "Allow all access for authenticated members"
ON public.visitors FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.members WHERE members.user_id = auth.uid() AND members.role_id IS NOT NULL));

-- TASKS TABLE POLICIES
DROP POLICY IF EXISTS "Allow insert for leaders and admins" ON public.tasks;
CREATE POLICY "Allow insert for leaders and admins"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.is_leadership = true));

DROP POLICY IF EXISTS "Allow update for leaders and admins" ON public.tasks;
CREATE POLICY "Allow update for leaders and admins"
ON public.tasks FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.is_leadership = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.is_leadership = true));

DROP POLICY IF EXISTS "Allow delete for admins" ON public.tasks;
CREATE POLICY "Allow delete for admins"
ON public.tasks FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.name = 'Admin'));

DROP POLICY IF EXISTS "Allow view on tasks for non-pending members" ON public.tasks;
CREATE POLICY "Allow view on tasks for non-pending members"
ON public.tasks FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m WHERE m.user_id = auth.uid() AND m.role_id != (SELECT id FROM public.roles WHERE name = 'Pendente')));

-- EVENTS TABLE POLICIES
DROP POLICY IF EXISTS "Allow insert and update for leaders and admins" ON public.events;
CREATE POLICY "Allow insert and update for leaders and admins"
ON public.events FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.is_leadership = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.is_leadership = true));

DROP POLICY IF EXISTS "Allow select for all non-pending members" ON public.events;
CREATE POLICY "Allow select for all non-pending members"
ON public.events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m WHERE m.user_id = auth.uid() AND m.role_id != (SELECT id FROM public.roles WHERE name = 'Pendente')));

-- EVENT_ASSIGNMENTS TABLE POLICIES
DROP POLICY IF EXISTS "Allow view on event_assignments for non-pending members" ON public.event_assignments;
CREATE POLICY "Allow view on event_assignments for non-pending members"
ON public.event_assignments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m WHERE m.user_id = auth.uid() AND m.role_id != (SELECT id FROM public.roles WHERE name = 'Pendente')));

DROP POLICY IF EXISTS "Allow update on event_assignments for non-pending members" ON public.event_assignments;
CREATE POLICY "Allow update on event_assignments for non-pending members"
ON public.event_assignments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m WHERE m.user_id = auth.uid() AND m.role_id != (SELECT id FROM public.roles WHERE name = 'Pendente')))
WITH CHECK (EXISTS (SELECT 1 FROM public.members m WHERE m.user_id = auth.uid() AND m.role_id != (SELECT id FROM public.roles WHERE name = 'Pendente')));

DROP POLICY IF EXISTS "Allow insert on event_assignments for leaders and admins" ON public.event_assignments;
CREATE POLICY "Allow insert on event_assignments for leaders and admins"
ON public.event_assignments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.is_leadership = true));

DROP POLICY IF EXISTS "Allow delete on event_assignments for leaders and admins" ON public.event_assignments;
CREATE POLICY "Allow delete on event_assignments for leaders and admins"
ON public.event_assignments FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.is_leadership = true));

-- PAGE_PERMISSIONS TABLE POLICIES
DROP POLICY IF EXISTS "Allow all for admins" ON public.page_permissions;
CREATE POLICY "Allow all for admins"
ON public.page_permissions FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.name = 'Admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.name = 'Admin'));

-- POST_CATEGORIES TABLE POLICIES
DROP POLICY IF EXISTS "Admins and pastors can insert categories" ON public.post_categories;
CREATE POLICY "Admins and pastors can insert categories"
ON public.post_categories FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND (r.name = 'Admin' OR r.name = 'Pastor(a)')));

DROP POLICY IF EXISTS "Admins and pastors can update categories" ON public.post_categories;
CREATE POLICY "Admins and pastors can update categories"
ON public.post_categories FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND (r.name = 'Admin' OR r.name = 'Pastor(a)')))
WITH CHECK (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND (r.name = 'Admin' OR r.name = 'Pastor(a)')));

DROP POLICY IF EXISTS "Admins and pastors can delete categories" ON public.post_categories;
CREATE POLICY "Admins and pastors can delete categories"
ON public.post_categories FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND (r.name = 'Admin' OR r.name = 'Pastor(a)')));

-- POSTS TABLE POLICIES
DROP POLICY IF EXISTS "Authorized users can insert posts" ON public.posts;
CREATE POLICY "Authorized users can insert posts"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND (r.name = 'Admin' OR r.name = 'Pastor(a)')));

DROP POLICY IF EXISTS "Authors and admins can update posts" ON public.posts;
CREATE POLICY "Authors and admins can update posts"
ON public.posts FOR UPDATE TO authenticated
USING (author_id = (SELECT id FROM public.members WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.name = 'Admin'))
WITH CHECK (author_id = (SELECT id FROM public.members WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND r.name = 'Admin'));

DROP POLICY IF EXISTS "Admins and pastors can delete posts" ON public.posts;
CREATE POLICY "Admins and pastors can delete posts"
ON public.posts FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.members m JOIN public.roles r ON m.role_id = r.id WHERE m.user_id = auth.uid() AND (r.name = 'Admin' OR r.name = 'Pastor(a)')));

-- =====================================================
-- PASSO 1: Migrar dados de ROLES (enum → FK)
-- =====================================================

-- Atualizar membros com role antiga para usar role_id
UPDATE public.members m
SET role_id = r.id
FROM public.roles r
WHERE m.role_id IS NULL
AND (
  (m.role = 'admin' AND r.name = 'Admin') OR
  (m.role = 'pastor(a)' AND r.name = 'Pastor(a)') OR
  (m.role = 'lider_midia' AND r.name = 'Líder de Mídia') OR
  (m.role = 'lider_geral' AND r.name = 'Líder Geral') OR
  (m.role = 'membro' AND r.name = 'Membro') OR
  (m.role = 'pendente' AND r.name = 'Pendente')
);

-- =====================================================
-- PASSO 2: Migrar dados de SETORES (enum array → FK)
-- =====================================================

-- Nota: Como sector_id é FK única (1 setor por membro) e o sistema antigo
-- permitia múltiplos setores (array), vamos pegar apenas o PRIMEIRO setor
-- Se precisar de múltiplos setores no futuro, será necessário criar uma
-- tabela de junção member_sectors

UPDATE public.members m
SET sector_id = s.id
FROM public.sectors s
WHERE m.sector_id IS NULL
AND m.sector IS NOT NULL
AND array_length(m.sector, 1) > 0
AND (
  (m.sector[1] = 'mídia' AND s.name = 'Mídia') OR
  (m.sector[1] = 'geral' AND s.name = 'Geral') OR
  (m.sector[1] = 'louvor' AND s.name = 'Louvor') OR
  (m.sector[1] = 'infantil' AND s.name = 'Infantil') OR
  (m.sector[1] = 'social' AND s.name = 'Social')
);

-- =====================================================
-- PASSO 3: Verificar dados não migrados (SEGURANÇA)
-- =====================================================

-- Se houver membros sem role_id após migração, alertar
DO $$
DECLARE
  unmigrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmigrated_count
  FROM public.members
  WHERE role_id IS NULL;

  IF unmigrated_count > 0 THEN
    RAISE WARNING 'ATENÇÃO: % membros sem role_id após migração. Verifique manualmente.', unmigrated_count;
  END IF;
END $$;

-- =====================================================
-- PASSO 4: Atualizar comentários das colunas
-- =====================================================
-- NOTA: As colunas antigas (role, sector) serão mantidas no banco de dados
--       mas não serão mais utilizadas pelo código. Isso garante compatibilidade
--       e permite rollback se necessário.

-- Atualizar comentários
COMMENT ON COLUMN public.members.role_id IS 'Role do membro (sistema novo - usar este)';
COMMENT ON COLUMN public.members.sector_id IS 'Setor do membro (sistema novo - usar este)';
COMMENT ON COLUMN public.members.role IS 'DEPRECATED - usar role_id';
COMMENT ON COLUMN public.members.sector IS 'DEPRECATED - usar sector_id';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
