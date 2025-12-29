-- Tabela de auditoria para rastrear todas as ações importantes no sistema
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Informações do usuário que executou a ação
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  member_name TEXT, -- Denormalizado para preservar histórico mesmo se membro for deletado

  -- Tipo de ação executada
  action_type TEXT NOT NULL,
  -- Exemplos: 'task_assigned', 'task_removed', 'event_created', 'event_updated',
  -- 'event_deleted', 'member_created', 'member_updated', 'visitor_submitted', etc

  -- Recurso afetado
  resource_type TEXT NOT NULL, -- 'event', 'task', 'member', 'visitor', 'event_assignment'
  resource_id UUID, -- ID do recurso afetado (pode ser null para algumas ações)

  -- Detalhes adicionais em formato flexível
  details JSONB DEFAULT '{}'::jsonb,
  -- Exemplos de details:
  -- { "event_name": "Culto de Domingo", "task_name": "Som", "changes": {...} }

  -- Metadados técnicos (opcional, para análise futura)
  ip_address TEXT,
  user_agent TEXT
);

-- Índices para melhorar performance de queries
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON public.audit_logs(resource_id);

-- Índice composto para queries comuns
CREATE INDEX idx_audit_logs_user_action ON public.audit_logs(user_id, action_type, created_at DESC);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas usuários autenticados podem ler logs
CREATE POLICY "Authenticated users can read audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (true);

-- Política: Apenas o sistema pode inserir logs (via service role ou triggers)
-- Não permitimos insert direto de usuários para evitar manipulação
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE public.audit_logs IS 'Registra todas as ações importantes do sistema para auditoria e análise';
COMMENT ON COLUMN public.audit_logs.action_type IS 'Tipo de ação: task_assigned, event_created, member_updated, etc';
COMMENT ON COLUMN public.audit_logs.resource_type IS 'Tipo de recurso afetado: event, task, member, visitor, etc';
COMMENT ON COLUMN public.audit_logs.details IS 'Detalhes adicionais da ação em formato JSON flexível';
COMMENT ON COLUMN public.audit_logs.member_name IS 'Nome do membro denormalizado para preservar histórico';
