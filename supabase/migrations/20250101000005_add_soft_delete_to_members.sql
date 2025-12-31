-- =====================================================
-- Migration: Add Soft Delete to Members
-- Description: Adds deleted_at column to support soft deletes
-- Author: Claude
-- Date: 2025-01-01
-- =====================================================

-- Add deleted_at column to members table
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_members_deleted_at
ON public.members(deleted_at)
WHERE deleted_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.members.deleted_at IS 'Timestamp when member was soft deleted (NULL = active member)';

-- Update existing policies to exclude deleted members from normal queries
-- (This ensures deleted members don't appear in normal listings)
DROP POLICY IF EXISTS "Allow members to view all non-pending members" ON public.members;
CREATE POLICY "Allow members to view all non-pending members"
ON public.members FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL AND
  (
    role != 'pendente' OR
    auth.uid() = user_id
  )
);

-- Policy for admins to see deleted members
DROP POLICY IF EXISTS "Allow leaders to view deleted members" ON public.members;
CREATE POLICY "Allow leaders to view deleted members"
ON public.members FOR SELECT
TO authenticated
USING (
  deleted_at IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.members m
    LEFT JOIN public.roles r ON m.role_id = r.id
    WHERE m.user_id = auth.uid()
    AND (r.is_leadership = true OR m.role IN ('admin', 'pastor(a)', 'lider_geral'))
  )
);
