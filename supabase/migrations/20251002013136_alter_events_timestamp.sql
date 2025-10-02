-- Altera o tipo da coluna event_date de DATE para TIMESTAMPTZ (timestamp with time zone)
ALTER TABLE public.events
ALTER COLUMN event_date TYPE TIMESTAMPTZ;

-- NOTA: Após rodar esta migração, todos os eventos existentes terão o horário
-- definido para 00:00:00. Você precisará editá-los manualmente no painel do Supabase
-- ou na sua aplicação para definir os horários corretos.