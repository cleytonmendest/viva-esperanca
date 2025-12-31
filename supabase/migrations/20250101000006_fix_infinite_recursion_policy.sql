-- =====================================================
-- Migration: Fix Infinite Recursion in Members Policy
-- Description: Remove problematic policy that causes recursion
-- Author: Claude
-- Date: 2025-01-01
-- =====================================================

-- Remove a policy problemática que causa recursão infinita
DROP POLICY IF EXISTS "Allow leaders to view deleted members" ON public.members;

-- A proteção de soft delete já funciona pela policy padrão
-- e pelas queries explícitas no código com .is('deleted_at', null)
-- Não precisamos de uma policy separada para líderes verem deletados.

-- Se no futuro precisar de acesso a deletados, fazer do lado da aplicação
-- com service_role key ou RPC function que não cause recursão.
