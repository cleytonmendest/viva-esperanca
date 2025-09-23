-- Corrige o tipo da coluna de data de visita na tabela de visitantes

-- 1. Remove a coluna 'visite_date' que está com o tipo incorreto
ALTER TABLE public.visitors
DROP COLUMN IF EXISTS visite_date;

-- 2. Adiciona a coluna 'visite_date' novamente com o tipo correto (DATE)
ALTER TABLE public.visitors
ADD COLUMN visite_date date NOT NULL;