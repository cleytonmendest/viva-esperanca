# 🗄️ Database Migrations & Deploy - Viva Esperança

> **Guia completo sobre criação, teste e deploy de migrations do banco de dados**
>
> **Objetivo**: Garantir deploys seguros, prevenir downtime e manter integridade dos dados
>
> **Última atualização**: Janeiro 2026

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Workflow Completo](#workflow-completo)
3. [Criando Migrations Seguras](#criando-migrations-seguras)
4. [Deploy para Produção](#deploy-para-produção)
5. [Rollback e Recuperação](#rollback-e-recuperação)
6. [Boas Práticas](#boas-práticas)
7. [Checklist de Deploy](#checklist-de-deploy)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### O que é uma Migration?

Uma migration é um arquivo SQL que descreve **mudanças incrementais** no schema do banco de dados:

```
Migration 1: CREATE TABLE members
Migration 2: ALTER TABLE members ADD COLUMN phone
Migration 3: CREATE INDEX idx_members_phone
```

### Como o Supabase Rastreia Migrations?

O Supabase mantém uma **tabela interna** chamada `supabase_migrations.schema_migrations`:

```sql
-- Exemplo de conteúdo:
version             | name
--------------------|--------------------------------
20250919003921      | allow_insert_for_authenticated_members
20250920204747      | allow_member_update
20251229000004      | fix_admin_policy_recursion
```

**IMPORTANTE:** Migrations são identificadas pelo **timestamp no nome do arquivo**, não pelo conteúdo!

---

## 🔄 Workflow Completo

### 1️⃣ Criar Nova Migration

```bash
# Criar arquivo vazio (você escreve SQL manualmente)
supabase migration new add_celulas_table

# OU: Gerar automaticamente comparando local vs produção
supabase db diff -f add_celulas_table

# Resultado: supabase/migrations/20260106123456_add_celulas_table.sql
```

---

### 2️⃣ Escrever SQL Seguro

Edite o arquivo criado:

```sql
-- supabase/migrations/20260106123456_add_celulas_table.sql

-- ✅ SEMPRE use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS celulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leader_id UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ Adicionar coluna com IF NOT EXISTS
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS celula_id UUID
  REFERENCES celulas(id) ON DELETE SET NULL;

-- ✅ Criar índices (idempotente)
CREATE INDEX IF NOT EXISTS idx_members_celula
  ON members(celula_id);

-- ✅ RLS Policies (idempotente)
ALTER TABLE celulas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Células visíveis para autenticados" ON celulas;
CREATE POLICY "Células visíveis para autenticados"
  ON celulas FOR SELECT
  TO authenticated
  USING (true);

-- ✅ Inserções com ON CONFLICT
INSERT INTO page_permissions (page_name, page_path, icon, allowed_roles)
VALUES (
  'Células',
  '/admin/celulas',
  'Users',
  ARRAY['admin', 'pastor(a)']::user_role_enum[]
)
ON CONFLICT (page_path) DO UPDATE
SET
  page_name = EXCLUDED.page_name,
  icon = EXCLUDED.icon,
  allowed_roles = EXCLUDED.allowed_roles;
```

---

### 3️⃣ Testar Localmente (CRÍTICO!)

```bash
# 1. Resetar banco local (aplica TODAS migrations)
npm run supabase:reset

# 2. Verificar se migration foi aplicada
npm run supabase:status

# 3. Testar aplicação
npm run dev
# Navegue para http://localhost:3000 e TESTE a funcionalidade

# 4. Validar TypeScript
npm run build
```

**⚠️ Se der QUALQUER erro aqui, NÃO faça push para produção!**

---

### 4️⃣ Atualizar Types (se necessário)

```bash
# Gerar types do banco LOCAL
npm run gen:types:local

# Verificar mudanças
git diff src/lib/supabase/database.types.ts
```

---

### 5️⃣ Commit da Migration

```bash
git add supabase/migrations/20260106123456_add_celulas_table.sql
git add src/lib/supabase/database.types.ts  # se alterou
git commit -m "feat: adiciona sistema de células

- Cria tabela celulas
- Adiciona celula_id em members
- Configura RLS policies
- Adiciona página ao menu"
```

---

### 6️⃣ Deploy para Produção

```bash
# 1. BACKUP DE PRODUÇÃO (OBRIGATÓRIO!)
npx supabase db dump --linked -f backup_before_celulas_$(date +%Y%m%d_%H%M%S).sql

# 2. Verificar o que será aplicado
npx supabase migration list --linked
# Confirme que apenas a nova migration aparece

# 3. Push para produção
npx supabase db push

# Output esperado:
# ? Apply migration 20260106123456_add_celulas_table? (Y/n)
# (Digite Y para confirmar)

# Applying migration 20260106123456_add_celulas_table.sql...
# Migration applied successfully!
```

---

### 7️⃣ Gerar Types de Produção

```bash
# Gerar types da produção (com nova migration aplicada)
npm run gen:types

# Commit types atualizados
git add src/lib/supabase/database.types.ts
git commit -m "chore: atualiza database types com sistema de células"
```

---

### 8️⃣ Deploy do Código

```bash
# Push para repositório (Vercel/GitHub Actions fará deploy)
git push origin main

# OU deploy manual:
npm run build
vercel --prod
```

---

## 🛡️ Criando Migrations Seguras

### ✅ Operações SEGURAS (Idempotentes)

Migrations idempotentes podem ser executadas **múltiplas vezes** sem erro:

#### 1. Criar Tabelas

```sql
-- ✅ CORRETO
CREATE TABLE IF NOT EXISTS celulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- ❌ ERRADO (falha se rodar 2x)
CREATE TABLE celulas (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);
```

#### 2. Adicionar Colunas

```sql
-- ✅ CORRETO
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS celula_id UUID;

-- ❌ ERRADO
ALTER TABLE members
  ADD COLUMN celula_id UUID;
```

#### 3. Criar Índices

```sql
-- ✅ CORRETO
CREATE INDEX IF NOT EXISTS idx_members_celula
  ON members(celula_id);

-- ❌ ERRADO
CREATE INDEX idx_members_celula ON members(celula_id);
```

#### 4. RLS Policies

```sql
-- ✅ CORRETO (DROP + CREATE)
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name ...;

-- ❌ ERRADO (falha se policy já existe)
CREATE POLICY "policy_name" ON table_name ...;
```

#### 5. Inserções (Seed Data)

```sql
-- ✅ CORRETO
INSERT INTO roles (id, name)
VALUES ('uuid-here', 'Admin')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name;

-- ❌ ERRADO
INSERT INTO roles (id, name)
VALUES ('uuid-here', 'Admin');
```

---

### ⚠️ Operações PERIGOSAS (Destrutivas)

#### 1. Deletar Colunas

```sql
-- ❌ MUITO PERIGOSO: Perde dados permanentemente!
ALTER TABLE members DROP COLUMN old_field;

-- ✅ MELHOR: Migration em 2 etapas
-- Etapa 1 (agora): Adiciona nova coluna
ALTER TABLE members ADD COLUMN new_field TEXT;

-- Etapa 2 (deploy + aguarda semanas): Migra dados
UPDATE members SET new_field = old_field WHERE new_field IS NULL;

-- Etapa 3 (próxima migration): Remove coluna antiga
-- ALTER TABLE members DROP COLUMN old_field;
```

#### 2. Deletar Tabelas

```sql
-- ❌ EXTREMAMENTE PERIGOSO!
DROP TABLE IF EXISTS old_table CASCADE;

-- ✅ ALTERNATIVA: Renomear (permite rollback)
ALTER TABLE old_table RENAME TO old_table_deprecated;
-- (Se tudo OK após semanas, aí sim dropa)
```

#### 3. Alterar Tipos de Colunas

```sql
-- ❌ PERIGOSO: Pode causar perda de dados
ALTER TABLE members
  ALTER COLUMN phone TYPE VARCHAR(15);

-- ✅ MELHOR: Nova coluna + migração + deprecação
ALTER TABLE members ADD COLUMN phone_new VARCHAR(15);
UPDATE members SET phone_new = LEFT(phone, 15);
-- (Depois deprecia phone antiga)
```

#### 4. Constraints Retroativas

```sql
-- ❌ PERIGOSO: Falha se dados existentes violam constraint
ALTER TABLE members
  ADD CONSTRAINT members_phone_unique UNIQUE (phone);

-- ✅ MELHOR: Limpar dados ANTES
-- 1. Remover duplicatas primeiro
DELETE FROM members a USING members b
WHERE a.id > b.id AND a.phone = b.phone;

-- 2. Agora adiciona constraint
ALTER TABLE members
  ADD CONSTRAINT members_phone_unique UNIQUE (phone);
```

---

### 🔄 Migrations Incrementais (Best Practice)

**Regra:** Nunca altere migrations antigas. Sempre crie novas migrations.

#### ❌ ERRADO:
```sql
-- Migration 1 (já aplicada em prod):
CREATE TABLE members (id UUID, name TEXT);

-- (Dev edita Migration 1 - PERIGOSO!)
ALTER TABLE members ADD COLUMN phone TEXT;
```

#### ✅ CORRETO:
```sql
-- Migration 1 (já aplicada):
CREATE TABLE members (id UUID, name TEXT);

-- Migration 2 (nova):
ALTER TABLE members ADD COLUMN phone TEXT;
```

**Por quê?** Migrations já aplicadas em produção **não podem ser alteradas** sem causar conflitos.

---

## 🚀 Deploy para Produção

### Comando: `supabase db push`

#### O que acontece internamente:

1. **Conecta no banco de PRODUÇÃO**
2. **Busca migrations já aplicadas** (tabela `schema_migrations`)
3. **Compara com migrations locais**
4. **Lista migrations pendentes**
5. **Pede confirmação interativa**
6. **Executa SQL em PRODUÇÃO** (⚠️ IRREVERSÍVEL!)
7. **Registra migration como aplicada**

---

### Exemplo de Output:

```bash
$ npx supabase db push

Applying migrations to remote database...

Migrations to apply:
  ✓ 20260106123456_add_celulas_table.sql

? Apply migration 20260106123456_add_celulas_table? (Y/n) Y

Applying migration 20260106123456_add_celulas_table.sql...
✓ Migration applied successfully!

Remote database is up to date.
```

---

### ⚠️ RISCOS do `supabase db push`

#### 1. **Migration com Erro SQL**

```sql
-- Migration com erro de sintaxe:
CREATE TABEL celulas (...);  -- TYPO: TABEL
```

**Resultado:**
```
ERROR: syntax error at or near "TABEL"
Migration failed! Database may be in inconsistent state.
```

**Impacto:** Produção pode ficar indisponível até correção manual.

---

#### 2. **Migration Aplicada Pela Metade**

```sql
-- Migration com 3 operações:
CREATE TABLE celulas (...);           -- ✅ Sucesso
ALTER TABLE members ADD COLUMN ...;   -- ✅ Sucesso
INSERT INTO celulas VALUES (...);     -- ❌ ERRO: constraint violation
```

**Resultado:**
- 2 operações aplicadas
- 1 falhou
- **Migration marcada como APLICADA** (mesmo com falha!)
- **Não há rollback automático**

**Solução:** Migration reversa manual.

---

#### 3. **Conflito com Dados Existentes**

```sql
-- Adiciona constraint, mas dados existentes violam:
ALTER TABLE members
  ADD CONSTRAINT members_phone_unique UNIQUE (phone);
```

**Resultado:**
```
ERROR: duplicate key value violates unique constraint
```

**Solução:** Limpar dados ANTES de criar constraint.

---

### 🛡️ Proteções que você TEM

#### 1. **Confirmação Interativa**

```bash
? Apply migration 20260106123456_add_celulas_table? (Y/n)
# ← Você pode cancelar aqui com Ctrl+C ou digitando 'n'
```

#### 2. **Dry-run (Visualizar Antes)**

```bash
# Ver SQL que SERIA aplicado (sem aplicar):
npx supabase db diff --linked

# Mostra diferenças entre local e produção
```

#### 3. **Migration List (Verificar Antes)**

```bash
# Ver migrations pendentes:
npx supabase migration list --linked

# Output:
#   Local          | Remote
#  ----------------|----------------
#   20260106123456 |                ← Será aplicada
```

#### 4. **Backup ANTES de Push**

```bash
# Backup completo de produção:
npx supabase db dump --linked -f backup.sql

# Se der ruim, restaura:
psql -h <host> -U postgres -d postgres < backup.sql
```

---

## 🔙 Rollback e Recuperação

### Cenário 1: Migration Quebrou Produção

**Sintomas:**
- Aplicação retornando erros 500
- Queries falhando
- Tabelas/colunas não encontradas

**Solução: Migration Reversa**

```bash
# 1. Criar migration reversa
supabase migration new rollback_add_celulas

# 2. Escrever SQL que DESFAZ a migration anterior
cat > supabase/migrations/20260106130000_rollback_add_celulas.sql <<'EOF'
-- Reverter migration 20260106123456_add_celulas_table.sql

-- Dropar constraints primeiro
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_celula_id_fkey;

-- Remover coluna adicionada
ALTER TABLE members DROP COLUMN IF EXISTS celula_id;

-- Dropar tabela
DROP TABLE IF EXISTS celulas CASCADE;

-- Remover do menu
DELETE FROM page_permissions WHERE page_path = '/admin/celulas';
EOF

# 3. Testar LOCAL
npm run supabase:reset
npm run dev

# 4. Push para produção
npx supabase db push
```

---

### Cenário 2: Migration Aplicada Parcialmente

**Sintomas:**
- Migration marcada como aplicada
- Mas algumas operações falharam
- Estado inconsistente

**Solução: Completar Manualmente**

```bash
# 1. Conectar no banco de produção
npx supabase db psql --linked

# 2. Verificar estado atual
\dt  -- Listar tabelas
\d members  -- Descrever tabela members

# 3. Executar operações faltantes manualmente
-- (copiar SQL da migration que falhou)

# 4. OU: Criar migration de correção
supabase migration new fix_celulas_migration
```

---

### Cenário 3: Dados Perdidos

**Sintomas:**
- DROP TABLE/COLUMN executado acidentalmente
- Dados críticos deletados

**Solução: Restaurar Backup**

```bash
# 1. Se você fez backup ANTES:
npx supabase db dump --linked -f backup_before_migration.sql

# 2. Restaurar (⚠️ MUITO CUIDADO!)
psql -h db.xxx.supabase.co \
     -U postgres \
     -d postgres \
     < backup_before_migration.sql

# 3. Se NÃO fez backup:
# - Verifique backups automáticos do Supabase (Dashboard)
# - Point-in-time recovery (planos pagos)
# - Contate suporte do Supabase
```

---

### Cenário 4: Rollback Impossível

**Sintomas:**
- Migration alterou dados (UPDATE/DELETE)
- Impossível reverter sem backup

**Solução: Prevenção**

```sql
-- ✅ SEMPRE faça backups antes de migrations destrutivas:

-- Migration que ALTERA dados:
UPDATE members SET role = 'membro' WHERE role = 'old_role';

-- ❌ Se der errado, dados originais estão PERDIDOS!

-- ✅ MELHOR: Criar nova coluna, migrar, validar, depois dropar antiga
ALTER TABLE members ADD COLUMN role_new user_role_enum;
UPDATE members SET role_new = CASE
  WHEN role = 'old_role' THEN 'membro'::user_role_enum
  ELSE role::user_role_enum
END;
-- (Valida, aguarda semanas, depois dropa role antiga)
```

---

## 📋 Boas Práticas

### 1. **Sempre Teste Localmente PRIMEIRO**

```bash
# ❌ NUNCA:
supabase migration new add_feature
# (edita migration)
supabase db push  # 💀 Aplicando direto em prod!

# ✅ SEMPRE:
supabase migration new add_feature
# (edita migration)
npm run supabase:reset  # Testa LOCAL
npm run dev             # Valida funcionamento
npm run build           # Valida TypeScript
supabase db push        # Agora sim!
```

---

### 2. **Migrations Idempotentes**

```sql
-- ✅ Pode rodar múltiplas vezes sem erro:
CREATE TABLE IF NOT EXISTS celulas (...);
ALTER TABLE members ADD COLUMN IF NOT EXISTS celula_id UUID;
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name ...;

-- ❌ Falha na segunda execução:
CREATE TABLE celulas (...);
ALTER TABLE members ADD COLUMN celula_id UUID;
CREATE POLICY "policy_name" ON table_name ...;
```

---

### 3. **Uma Migration = Uma Responsabilidade**

```bash
# ❌ EVITE migrations "Frankenstein":
# 20260106_everything.sql
CREATE TABLE celulas (...);
ALTER TABLE members ...;
CREATE TABLE eventos_especiais (...);
UPDATE settings SET ...;
DROP TABLE old_deprecated_table;

# ✅ PREFIRA migrations focadas:
# 20260106_add_celulas_table.sql
# 20260107_migrate_members_to_celulas.sql
# 20260108_add_eventos_especiais.sql
```

**Por quê?**
- Mais fácil de entender
- Rollback granular
- Debug mais simples

---

### 4. **Nomes Descritivos**

```bash
# ❌ RUIM:
supabase migration new fix
supabase migration new update_table
supabase migration new changes

# ✅ BOM:
supabase migration new add_celulas_table
supabase migration new fix_members_rls_policy
supabase migration new migrate_roles_to_enum
```

---

### 5. **Comentários em SQL**

```sql
-- ✅ BOM:
-- Adiciona sistema de células à aplicação
-- Relaciona membros às suas respectivas células de discipulado
CREATE TABLE IF NOT EXISTS celulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,  -- Ex: "Célula Centro"
  leader_id UUID REFERENCES members(id),  -- Líder da célula
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ RUIM:
CREATE TABLE celulas (id UUID, name TEXT, leader_id UUID);
```

---

### 6. **Backup Antes de Operações Destrutivas**

```bash
# SEMPRE antes de DROP/ALTER destrutivos:
npx supabase db dump --linked -f backup_$(date +%Y%m%d_%H%M%S).sql
```

---

### 7. **Deploy em Horário de Baixo Tráfego**

- **Evite:** Segunda-feira 9h, Domingo 10h (horário de culto)
- **Prefira:** Terça-feira 2h da madrugada, Sábado tarde

---

### 8. **Migrations Reversíveis**

```sql
-- Ao criar migration, já pense no rollback:

-- Migration UP (add_celulas_table.sql):
CREATE TABLE celulas (...);

-- Rollback DOWN (rollback_add_celulas.sql - se precisar):
DROP TABLE celulas;
```

---

### 9. **Validação de Constraints ANTES de Criar**

```sql
-- ❌ ERRADO: Adiciona constraint sem validar dados
ALTER TABLE members
  ADD CONSTRAINT members_phone_unique UNIQUE (phone);

-- ✅ CORRETO: Valida ANTES
-- 1. Verificar duplicatas
SELECT phone, COUNT(*)
FROM members
GROUP BY phone
HAVING COUNT(*) > 1;

-- 2. Se houver, limpar PRIMEIRO
DELETE FROM members a USING members b
WHERE a.id > b.id AND a.phone = b.phone;

-- 3. AGORA adiciona constraint
ALTER TABLE members
  ADD CONSTRAINT members_phone_unique UNIQUE (phone);
```

---

### 10. **Comunicar Deploy com a Equipe**

```bash
# Antes de deploy em produção:
# 1. Avise no Slack/WhatsApp
# 2. Informe downtime esperado (se houver)
# 3. Tenha plano de rollback documentado
# 4. Monitore aplicação após deploy
```

---

## ✅ Checklist de Deploy

Copie esta checklist antes de cada deploy de migration:

```bash
## PRÉ-DEPLOY

- [ ] Migration testada localmente (`npm run supabase:reset`)
- [ ] Aplicação funciona após migration (`npm run dev`)
- [ ] Build de produção passa (`npm run build`)
- [ ] Migration é idempotente (IF NOT EXISTS, DROP IF EXISTS)
- [ ] Nomes de tabelas/colunas estão corretos
- [ ] Constraints foram validadas com dados existentes
- [ ] Comentários explicativos no SQL
- [ ] Backup de produção criado (`npx supabase db dump --linked`)
- [ ] Migration list revisada (`npx supabase migration list --linked`)
- [ ] Plano de rollback documentado (SQL reverso pronto)
- [ ] Equipe notificada sobre deploy
- [ ] Deploy agendado para horário de baixo tráfego

## DURANTE DEPLOY

- [ ] Executar `npx supabase db push`
- [ ] Revisar output do comando
- [ ] Confirmar aplicação (Y)
- [ ] Aguardar conclusão sem erros

## PÓS-DEPLOY

- [ ] Gerar types de produção (`npm run gen:types`)
- [ ] Commit types atualizados
- [ ] Testar aplicação em produção (https://...)
- [ ] Monitorar logs por 15-30 minutos
- [ ] Verificar se não há erros 500
- [ ] Validar funcionalidade nova
- [ ] Notificar equipe sobre sucesso

## SE DER ERRO

- [ ] Executar plano de rollback
- [ ] Restaurar backup se necessário
- [ ] Documentar problema
- [ ] Criar issue/post-mortem
```

---

## 🐛 Troubleshooting

### Erro: "relation already exists"

```
ERROR: relation "celulas" already exists
```

**Causa:** Migration sem `IF NOT EXISTS`

**Solução:**
```sql
-- ✅ Adicione IF NOT EXISTS:
CREATE TABLE IF NOT EXISTS celulas (...);
```

---

### Erro: "column already exists"

```
ERROR: column "celula_id" of relation "members" already exists
```

**Causa:** Migration sem `IF NOT EXISTS`

**Solução:**
```sql
-- ✅ Adicione IF NOT EXISTS:
ALTER TABLE members ADD COLUMN IF NOT EXISTS celula_id UUID;
```

---

### Erro: "policy already exists"

```
ERROR: policy "policy_name" for table "members" already exists
```

**Causa:** CREATE POLICY sem DROP anterior

**Solução:**
```sql
-- ✅ DROP antes de CREATE:
DROP POLICY IF EXISTS "policy_name" ON members;
CREATE POLICY "policy_name" ON members ...;
```

---

### Erro: "duplicate key value violates unique constraint"

```
ERROR: duplicate key value violates unique constraint
```

**Causa:** Constraint adicionada com dados duplicados existentes

**Solução:**
```sql
-- 1. Remover duplicatas ANTES:
DELETE FROM members a USING members b
WHERE a.id > b.id AND a.phone = b.phone;

-- 2. AGORA adiciona constraint:
ALTER TABLE members
  ADD CONSTRAINT members_phone_unique UNIQUE (phone);
```

---

### Erro: "cannot drop column because other objects depend on it"

```
ERROR: cannot drop column celula_id of table members
because other objects depend on it
```

**Causa:** Tentativa de dropar coluna com FK/policies dependentes

**Solução:**
```sql
-- ✅ Dropar dependências ANTES:
DROP POLICY IF EXISTS "members_celula_policy" ON members;
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_celula_id_fkey;

-- Agora dropa coluna:
ALTER TABLE members DROP COLUMN IF EXISTS celula_id;
```

---

### Migration não aparece em `migration list`

**Causa:** Arquivo no lugar errado ou nome incorreto

**Solução:**
```bash
# 1. Verificar estrutura:
ls -la supabase/migrations/

# 2. Formato correto:
# YYYYMMDDHHMMSS_description.sql
# Ex: 20260106123456_add_celulas_table.sql

# 3. Mover para pasta correta se necessário
mv migration.sql supabase/migrations/20260106123456_migration.sql
```

---

### Produção não sincronizou após `supabase db push`

**Causa:** Cache do Next.js ou tipos não regenerados

**Solução:**
```bash
# 1. Regenerar types
npm run gen:types

# 2. Rebuild aplicação
npm run build

# 3. Invalidar cache do Vercel (se aplicável)
vercel --prod --force

# 4. Verificar migration foi aplicada:
npx supabase migration list --linked
```

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Supabase CLI - Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Supabase Migration Best Practices](https://supabase.com/docs/guides/database/migrations/best-practices)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)

### Documentos Relacionados

- **[LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)** - Setup de ambiente local com Supabase
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura do projeto
- **[ROADMAP.md](./ROADMAP.md)** - Features planejadas

---

## 🎯 Exemplo Completo (Passo a Passo)

Vamos adicionar um sistema de "Células" do zero:

### Passo 1: Criar Migration

```bash
supabase migration new add_celulas_system
```

### Passo 2: Escrever SQL

```sql
-- supabase/migrations/20260106123456_add_celulas_system.sql

-- =====================================================
-- SISTEMA DE CÉLULAS
-- Descrição: Adiciona gestão de células de discipulado
-- =====================================================

-- 1. Criar tabela de células
CREATE TABLE IF NOT EXISTS celulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES members(id) ON DELETE SET NULL,
  meeting_day TEXT,  -- Ex: "Quarta-feira"
  meeting_time TIME,  -- Ex: "19:00"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE celulas IS 'Células de discipulado da igreja';

-- 2. Adicionar coluna em members
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS celula_id UUID
  REFERENCES celulas(id) ON DELETE SET NULL;

COMMENT ON COLUMN members.celula_id IS 'Célula a qual o membro pertence';

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_members_celula ON members(celula_id);
CREATE INDEX IF NOT EXISTS idx_celulas_leader ON celulas(leader_id);

-- 4. RLS Policies
ALTER TABLE celulas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Células visíveis para autenticados" ON celulas;
CREATE POLICY "Células visíveis para autenticados"
  ON celulas FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Líderes podem gerenciar células" ON celulas;
CREATE POLICY "Líderes podem gerenciar células"
  ON celulas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pastor(a)', 'lider_geral')
    )
  );

-- 5. Adicionar ao menu
INSERT INTO page_permissions (page_name, page_path, icon, allowed_roles)
VALUES (
  'Células',
  '/admin/celulas',
  'Users',
  ARRAY['admin', 'pastor(a)', 'lider_geral']::user_role_enum[]
)
ON CONFLICT (page_path) DO UPDATE
SET
  page_name = EXCLUDED.page_name,
  icon = EXCLUDED.icon,
  allowed_roles = EXCLUDED.allowed_roles;

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_celulas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_celulas_updated_at ON celulas;
CREATE TRIGGER trigger_update_celulas_updated_at
  BEFORE UPDATE ON celulas
  FOR EACH ROW
  EXECUTE FUNCTION update_celulas_updated_at();
```

### Passo 3: Testar Localmente

```bash
# Reset banco local
npm run supabase:reset

# Deve mostrar:
# Applying migration 00000000000000_initial_schema.sql...
# Applying migration 20260106123456_add_celulas_system.sql...
# ✓ Migration applied successfully!

# Testar aplicação
npm run dev
# Navegar para http://localhost:3000/admin
# (Menu "Células" deve aparecer para admin/pastor)
```

### Passo 4: Validar Build

```bash
npm run build
# Deve passar sem erros TypeScript
```

### Passo 5: Commit

```bash
git add supabase/migrations/20260106123456_add_celulas_system.sql
git commit -m "feat: adiciona sistema de células de discipulado

- Cria tabela celulas com relacionamento a members
- Adiciona celula_id em members
- Configura RLS policies (visível para todos, gerenciável por líderes)
- Adiciona página ao menu (admin, pastor, lider_geral)
- Inclui triggers para updated_at"
```

### Passo 6: Backup de Produção

```bash
npx supabase db dump --linked -f backup_before_celulas_$(date +%Y%m%d_%H%M%S).sql
# Resultado: backup_before_celulas_20260106_143000.sql
```

### Passo 7: Deploy

```bash
# Verificar o que será aplicado
npx supabase migration list --linked

# Output:
#   Local          | Remote
#  ----------------|----------------
#   20260106123456 |                ← Será aplicada

# Push para produção
npx supabase db push

# Output:
# ? Apply migration 20260106123456_add_celulas_system? (Y/n) Y
# Applying migration 20260106123456_add_celulas_system.sql...
# ✓ Migration applied successfully!
```

### Passo 8: Atualizar Types

```bash
npm run gen:types

git add src/lib/supabase/database.types.ts
git commit -m "chore: atualiza database types com sistema de células"
```

### Passo 9: Deploy do Código

```bash
git push origin main
# Vercel/GitHub Actions fará deploy automaticamente
```

### Passo 10: Validar Produção

```bash
# 1. Acesse aplicação em produção
# https://viva-esperanca.vercel.app/admin

# 2. Verifique menu "Células"
# 3. Teste criar/editar/deletar células
# 4. Monitore logs por 15-30 minutos
```

---

**Pronto!** Sistema de células deployado com segurança! 🎉

---

**Mantido por:** Cleyton Mendes + Claude Code
**Última atualização:** Janeiro 2026
