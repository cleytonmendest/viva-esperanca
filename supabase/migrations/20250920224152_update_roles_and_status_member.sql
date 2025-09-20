-- Adiciona o novo valor 'membro' ao ENUM user_role_enum
-- O IF NOT EXISTS garante que o comando não falhe se for executado mais de uma vez.
ALTER TYPE public.user_role_enum ADD VALUE IF NOT EXISTS 'membro';

-- Cria um novo ENUM para o status do membro
-- (Este comando falhará se o tipo já existir, o que é o comportamento esperado para uma nova migração)
CREATE TYPE public.member_status_enum AS ENUM ('ativo', 'inativo');

-- Adiciona a nova coluna 'status' na tabela members
-- A verificação "IF NOT EXISTS" previne erros caso a coluna já tenha sido adicionada manualmente.
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS status public.member_status_enum DEFAULT 'ativo' NOT NULL;

