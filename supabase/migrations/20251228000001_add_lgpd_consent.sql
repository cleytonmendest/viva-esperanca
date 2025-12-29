-- Adiciona campo de consentimento LGPD à tabela visitors
ALTER TABLE public.visitors
ADD COLUMN IF NOT EXISTS consent_lgpd BOOLEAN NOT NULL DEFAULT false;

-- Comentário para documentação
COMMENT ON COLUMN public.visitors.consent_lgpd IS 'Consentimento LGPD para uso dos dados pessoais e contato';
