-- Adiciona a coluna 'quantity' na tabela 'tasks'
-- Define um valor padrão de 1 e garante que não pode ser nula.
ALTER TABLE public.tasks
ADD COLUMN quantity INT NOT NULL DEFAULT 1;

-- Adiciona uma restrição (CHECK) para garantir que a quantidade seja sempre um número positivo.
ALTER TABLE public.tasks
ADD CONSTRAINT positive_quantity CHECK (quantity > 0);