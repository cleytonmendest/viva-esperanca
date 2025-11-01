-- ROLLBACK: Remove dynamic permission system and return to original state
-- This reverts all changes made by migrations 20251031000000, 20251031000002,
-- 20251031000003, 20251101000000, and 20251101000001

-- 1. Drop all RLS policies created for the new system FIRST (before dropping function)
DROP POLICY IF EXISTS "Users with manage_roles can insert page_role_permissions" ON public.page_role_permissions;
DROP POLICY IF EXISTS "Users with manage_roles can update page_role_permissions" ON public.page_role_permissions;
DROP POLICY IF EXISTS "Users with manage_roles can delete page_role_permissions" ON public.page_role_permissions;

DROP POLICY IF EXISTS "Users with manage_roles can insert action_role_permissions" ON public.action_role_permissions;
DROP POLICY IF EXISTS "Users with manage_roles can update action_role_permissions" ON public.action_role_permissions;
DROP POLICY IF EXISTS "Users with manage_roles can delete action_role_permissions" ON public.action_role_permissions;

DROP POLICY IF EXISTS "Users with manage_roles can insert role_sector_leadership" ON public.role_sector_leadership;
DROP POLICY IF EXISTS "Users with manage_roles can update role_sector_leadership" ON public.role_sector_leadership;
DROP POLICY IF EXISTS "Users with manage_roles can delete role_sector_leadership" ON public.role_sector_leadership;

DROP POLICY IF EXISTS "Users with manage_roles can insert role_features" ON public.role_features;
DROP POLICY IF EXISTS "Users with manage_roles can update role_features" ON public.role_features;
DROP POLICY IF EXISTS "Users with manage_roles can delete role_features" ON public.role_features;

DROP POLICY IF EXISTS "Anyone authenticated can view action permissions" ON public.action_permissions;
DROP POLICY IF EXISTS "Anyone authenticated can view action role permissions" ON public.action_role_permissions;
DROP POLICY IF EXISTS "Anyone authenticated can view page role permissions" ON public.page_role_permissions;
DROP POLICY IF EXISTS "Anyone authenticated can view role features" ON public.role_features;
DROP POLICY IF EXISTS "Anyone authenticated can view role sector leadership" ON public.role_sector_leadership;

-- 2. Now drop the dynamic permission function (after policies are dropped)
DROP FUNCTION IF EXISTS public.user_has_action_permission(TEXT);

-- 3. Drop all new tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.role_features CASCADE;
DROP TABLE IF EXISTS public.role_sector_leadership CASCADE;
DROP TABLE IF EXISTS public.action_role_permissions CASCADE;
DROP TABLE IF EXISTS public.page_role_permissions CASCADE;
DROP TABLE IF EXISTS public.action_permissions CASCADE;

-- 4. Drop helper function
DROP FUNCTION IF EXISTS public.is_admin();

-- 5. Drop views
DROP VIEW IF EXISTS public.active_roles;
DROP VIEW IF EXISTS public.active_sectors;

-- 6. Remove added columns from roles table
ALTER TABLE public.roles DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE public.roles DROP COLUMN IF EXISTS is_system_role;
ALTER TABLE public.roles DROP COLUMN IF EXISTS description;

-- 7. Remove added columns from sectors table
ALTER TABLE public.sectors DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE public.sectors DROP COLUMN IF EXISTS description;

-- 8. Restore allowed_roles as NOT NULL in page_permissions
-- First, set a default value for any NULL entries
UPDATE public.page_permissions
SET allowed_roles = ARRAY['admin']::public.user_role_enum[]
WHERE allowed_roles IS NULL;

-- Then set back to NOT NULL
ALTER TABLE public.page_permissions
ALTER COLUMN allowed_roles SET NOT NULL;

-- 9. Clean up any pages added by the new system
DELETE FROM public.page_permissions
WHERE page_path IN ('/admin/configuracoes/roles', '/admin/configuracoes/setores');

-- Done! System is back to original state
-- You can now continue with the original enum-based permission system
