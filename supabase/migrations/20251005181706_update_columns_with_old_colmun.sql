-- supabase/migrations/xxxxxxxxxxxxxx_update_columns_with_old_column.sql

-- Atualiza a coluna role_id na tabela members
-- Esta parte provavelmente já funcionou, mas é bom manter no arquivo.
UPDATE public.members m
SET role_id = r.id
FROM public.roles r
WHERE m.role::TEXT = r.name;

-- Popula a tabela de junção member_sectors (VERSÃO CORRIGIDA)
INSERT INTO public.member_sectors (member_id, sector_id)
SELECT
    m.id,
    s.id
FROM
    public.members m,
    public.sectors s
WHERE
    s.name = ANY(m.sector::text[]); -- Adicionado ::text[] para converter o array de enum para um array de texto

-- Atualiza a coluna sector_id na tabela tasks
UPDATE public.tasks t
SET sector_id = s.id
FROM public.sectors s
WHERE t.sector::TEXT = s.name;