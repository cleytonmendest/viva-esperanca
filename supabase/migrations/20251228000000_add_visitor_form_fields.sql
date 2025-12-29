-- Adiciona novos campos à tabela visitors para o formulário público
ALTER TABLE public.visitors
ADD COLUMN IF NOT EXISTS visitor_city TEXT,
ADD COLUMN IF NOT EXISTS how_found_church TEXT,
ADD COLUMN IF NOT EXISTS prayer_requests TEXT;

-- Altera a coluna invited_by para permitir texto livre (não apenas FK)
-- Primeiro remove a constraint de foreign key
ALTER TABLE public.visitors
DROP CONSTRAINT IF EXISTS visitors_invited_by_fkey;

-- Permite que qualquer pessoa (mesmo não autenticada) possa inserir um visitante
CREATE POLICY "Allow public insert visitors"
ON public.visitors
FOR INSERT
TO anon
WITH CHECK (true);

-- Comentários para documentação
COMMENT ON COLUMN public.visitors.visitor_city IS 'Cidade ou bairro do visitante';
COMMENT ON COLUMN public.visitors.how_found_church IS 'Como o visitante conheceu a igreja (rede social, indicação, Google, etc)';
COMMENT ON COLUMN public.visitors.prayer_requests IS 'Pedidos de oração compartilhados pelo visitante';
COMMENT ON COLUMN public.visitors.invited_by IS 'Nome da pessoa que convidou o visitante (texto livre)';
