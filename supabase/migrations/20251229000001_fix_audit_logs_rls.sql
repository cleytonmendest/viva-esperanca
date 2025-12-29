-- Corrige política RLS da tabela audit_logs para permitir inserção por usuários autenticados
-- Problema: Política anterior só permitia service_role, mas o código usa cliente autenticado

-- Remove a política antiga que só permitia service_role
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

-- Nova política: Usuários autenticados podem inserir logs
-- Isso permite que o sistema registre ações dos usuários
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Mantém a política de leitura (usuários autenticados podem ler logs)
-- (já existe, não precisa recriar)

-- Adiciona política para prevenir UPDATE e DELETE por usuários
-- Apenas service_role pode modificar/deletar logs (garante integridade)
CREATE POLICY "Only service role can update audit logs"
ON public.audit_logs
FOR UPDATE
TO service_role
WITH CHECK (true);

CREATE POLICY "Only service role can delete audit logs"
ON public.audit_logs
FOR DELETE
TO service_role
USING (true);

-- Comentário explicativo
COMMENT ON POLICY "Authenticated users can insert audit logs" ON public.audit_logs
IS 'Permite que usuários autenticados insiram logs de auditoria. Logs são rastreáveis via user_id.';
