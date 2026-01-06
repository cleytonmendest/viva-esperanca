# 🛠️ Guia de Desenvolvimento Local - Viva Esperança

> **Configuração completa do ambiente de desenvolvimento local com Supabase**
>
> **Objetivo**: Isolar desenvolvimento de produção, permitindo testes seguros
>
> **Última atualização**: Janeiro 2026

---

## 📋 Índice

1. [Por que Ambiente Local?](#por-que-ambiente-local)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação do Supabase CLI](#instalação-do-supabase-cli)
4. [Configuração Inicial](#configuração-inicial)
5. [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
6. [Comandos Úteis](#comandos-úteis)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Por que Ambiente Local?

### Problemas de Desenvolver Direto em Produção:

❌ **Testes poluem banco de produção** (membros fake, eventos de teste)
❌ **Migrations podem quebrar produção** (sem rollback fácil)
❌ **Impossível testar cenários destrutivos** (deletar tudo, testar erros)
❌ **Dados sensíveis expostos** (CPF, telefones, emails)
❌ **Testes de integração afetam usuários reais**

### Benefícios do Ambiente Local:

✅ **Totalmente isolado** (zero risco para produção)
✅ **Rápido** (sem latência de rede)
✅ **Reseta em segundos** (recria banco limpo)
✅ **Testa migrations localmente** antes de aplicar em prod
✅ **Testes de integração rodam seguros**
✅ **Desenvolve offline** (sem internet)

---

## 🔧 Pré-requisitos

### 1. Docker Desktop

O Supabase local roda via Docker.

**Windows:**
- Download: https://www.docker.com/products/docker-desktop/
- Instale e inicie o Docker Desktop
- Verifique: `docker --version` (deve mostrar versão)

**Configuração recomendada:**
- Memory: 4 GB (mínimo)
- CPUs: 2 (mínimo)
- Disk space: 10 GB

### 2. Node.js

Já instalado (Next.js requer Node.js).

Verifique:
```bash
node --version  # v20.x ou superior
npm --version   # v10.x ou superior
```

---

## 📦 Instalação do Supabase CLI

### Windows (via npm - RECOMENDADO)

```bash
npm install -g supabase
```

Verifique instalação:
```bash
supabase --version
# Deve mostrar: supabase 1.x.x
```

### Alternativa: Scoop (Windows Package Manager)

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

---

## ⚙️ Configuração Inicial

### 1. Login no Supabase (Opcional, mas recomendado)

```bash
supabase login
```

- Abre browser para autenticar
- Permite fazer link com projeto remoto (produção)
- Facilita deploy de migrations

### 2. Link com Projeto de Produção (Opcional)

```bash
supabase link --project-ref <seu-project-id>
```

**Como encontrar project-id:**
- Dashboard do Supabase → Settings → General → Reference ID

**Benefícios:**
- Puxa migrations de produção
- Compara schema local vs prod (`supabase db diff`)
- Deploy de migrations para prod (`supabase db push`)

### 3. Configurar Variáveis de Ambiente

Crie `.env.local` com **duas configurações**:

```bash
# .env.local

# ============================================
# PRODUCTION (comentado por padrão)
# ============================================
# NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# ============================================
# LOCAL DEVELOPMENT (ativo por padrão)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Service Role Key (para testes com permissões de admin)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Db2BOBNFfqCVOCPgs
```

**⚠️ IMPORTANTE:**
- Essas keys são **públicas** (estão na documentação do Supabase)
- Só funcionam localmente (localhost)
- **NUNCA** commit keys de produção

### 4. Criar Arquivo `.env.production` (Para Deploy)

```bash
# .env.production

NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc... (sua key de produção)
```

**Build de produção usará essas variáveis.**

---

## 🚀 Iniciando Ambiente Local

### 1. Start Supabase Local

```bash
npm run supabase:start
```

**Primeira vez:**
- Download de imagens Docker (~2GB)
- Pode demorar 5-10 minutos
- Cria containers: Postgres, Auth, Storage, Realtime, etc.

**Próximas vezes:**
- Inicia em ~30 segundos

**Saída esperada:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Acessar Supabase Studio (UI)

Abra no browser: http://localhost:54323

- Interface igual ao dashboard de produção
- Visualiza tabelas, cria queries, edita dados
- Útil para debug

### 3. Start Next.js

**Em outro terminal:**

```bash
npm run dev
```

Aplicação rodará em http://localhost:3000 conectada ao **banco local**.

---

## 🔄 Workflow de Desenvolvimento

### Fluxo Diário:

```bash
# 1. Inicia Supabase (uma vez por dia)
npm run supabase:start

# 2. Inicia Next.js (em outro terminal)
npm run dev

# 3. Desenvolve normalmente
# - Cria features
# - Roda testes
# - Testa migrations

# 4. Ao finalizar o dia
npm run supabase:stop
```

### Workflow de Migrations:

#### Criar Nova Migration:

```bash
# Opção 1: Migration vazia (escreve SQL manualmente)
supabase migration new add_new_feature

# Opção 2: Diff automático (compara local vs prod)
supabase db diff -f add_new_feature
```

Edita o arquivo em `supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql`:

```sql
-- supabase/migrations/20260105000000_add_cells_table.sql

CREATE TABLE cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leader_id UUID REFERENCES members(id),
  meeting_day TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cells"
ON cells FOR SELECT TO authenticated USING (true);
```

#### Aplicar Migration Localmente:

```bash
# Reset do banco + aplica todas migrations
supabase db reset

# Verifica se funcionou
supabase db diff  # Deve mostrar "No changes"
```

#### Deploy para Produção:

```bash
# 1. Testa localmente primeiro!
supabase db reset
npm run dev  # Verifica se tudo funciona

# 2. Commit migration
git add supabase/migrations/
git commit -m "feat: add cells table"

# 3. Deploy para produção
supabase db push

# 4. Regenera types (atualiza database.types.ts)
npm run gen:types

# 5. Commit types
git add src/lib/supabase/database.types.ts
git commit -m "chore: update database types"
```

---

## 📝 Comandos Úteis

### Supabase

```bash
# Iniciar ambiente local
npm run supabase:start
# ou
supabase start

# Parar ambiente local (mantém dados)
npm run supabase:stop
# ou
supabase stop

# Resetar banco (apaga todos os dados + reaplica migrations)
supabase db reset

# Ver status
supabase status

# Ver logs
supabase logs
supabase logs -f  # Follow (tail)

# Acessar database via CLI
supabase db psql

# Criar migration
supabase migration new <nome>

# Comparar local vs prod
supabase db diff

# Deploy migration para prod
supabase db push

# Backup local
supabase db dump -f backup.sql

# Restore backup
supabase db reset --db-dump backup.sql
```

### Testes

```bash
# Testes unitários (não usam banco)
npm test

# Testes de integração (usam banco LOCAL)
npm run test:integration

# Testes E2E (usam banco LOCAL)
npm run test:e2e

# Rodar testes + resetar banco antes
npm run test:integration:clean
```

### Development

```bash
# Dev (usa banco LOCAL por padrão)
npm run dev

# Build (usa variáveis de produção)
npm run build

# Preview de build local
npm run start

# Gerar types do banco LOCAL
npm run gen:types
```

---

## 🎨 Scripts npm (package.json)

Adicione ao `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",

    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:status": "supabase status",
    "supabase:studio": "supabase studio",

    "gen:types": "supabase gen types typescript --local > src/lib/supabase/database.types.ts",
    "gen:types:prod": "supabase gen types typescript --linked > src/lib/supabase/database.types.ts",

    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testMatch='**/tests/integration/**/*.test.ts'",
    "test:integration:clean": "npm run supabase:reset && npm run test:integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 🗂️ Estrutura de Arquivos

```
viva-esperanca/
├── .env.local                    # Local development (git ignored)
├── .env.production               # Production keys (git ignored)
├── .env.local.example            # Template (committed)
├── supabase/
│   ├── config.toml               # Configuração local
│   ├── migrations/               # Migrations SQL
│   │   ├── 20241101000000_initial.sql
│   │   └── 20260105000000_add_cells.sql
│   ├── seed.sql                  # Dados iniciais (opcional)
│   └── .temp/                    # Dados locais (git ignored)
├── src/
│   └── lib/supabase/
│       └── database.types.ts     # Gerado de local ou prod
└── docs/
    └── LOCAL_DEVELOPMENT.md      # Este arquivo
```

---

## 🌱 Seed Data (Dados Iniciais)

Para ter dados de teste sempre que resetar o banco:

```sql
-- supabase/seed.sql

-- Usuário admin de teste
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'admin@test.com',
  crypt('password123', gen_salt('bf')),
  NOW()
);

-- Membro admin
INSERT INTO members (id, name, phone, role, sector, status, user_id)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Admin Test',
  '11999999999',
  'admin',
  ARRAY['mídia', 'geral'],
  'ativo',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- Eventos de teste
INSERT INTO events (name, event_date, description)
VALUES
  ('Culto de Domingo - Teste', '2026-02-01 10:00:00+00', 'Evento de teste'),
  ('Reunião de Oração - Teste', '2026-02-05 19:00:00+00', 'Evento de teste');

-- Visitantes de teste
INSERT INTO visitors (visitor_name, visitor_whatsapp, visite_date, first_time)
VALUES
  ('João Silva', '11988888888', '2026-01-05', true),
  ('Maria Santos', '11977777777', '2026-01-04', false);
```

**Aplicar seed:**
```bash
supabase db reset  # Já aplica seed.sql automaticamente
```

---

## 🔀 Alternando Entre Local e Produção

### Método 1: Comentar/Descomentar em .env.local

```bash
# .env.local

# LOCAL (ativo)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# PRODUÇÃO (comentado)
# NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

**Para trocar:** comente/descomente e reinicie `npm run dev`.

### Método 2: Usar Variável NODE_ENV (Avançado)

```typescript
// src/lib/supabase/config.ts
const isProduction = process.env.NODE_ENV === 'production';

export const supabaseUrl = isProduction
  ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD!
  : process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL!;

export const supabaseAnonKey = isProduction
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD!
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL!;
```

---

## 🧪 Testes com Banco Local

### Jest (Integration Tests)

```typescript
// jest.setup.js
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'eyJhbGc...';
```

**Rodar testes:**
```bash
# 1. Garante banco limpo
npm run supabase:reset

# 2. Roda testes
npm run test:integration
```

### Playwright (E2E Tests)

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Playwright usará automaticamente .env.local (banco local).**

---

## ❗ Troubleshooting

### Erro: "Cannot connect to Docker daemon"

**Causa:** Docker Desktop não está rodando

**Solução:**
1. Abra Docker Desktop
2. Aguarde iniciar completamente
3. Tente novamente: `supabase start`

---

### Erro: "Port 54321 already in use"

**Causa:** Outra instância do Supabase rodando

**Solução:**
```bash
supabase stop
supabase start
```

---

### Erro: "Migrations out of sync"

**Causa:** Migrations locais diferentes de produção

**Solução:**
```bash
# Puxa migrations de prod
supabase db pull

# Ou reseta local
supabase db reset
```

---

### Banco local está lento

**Causa:** Docker com pouca memória

**Solução:**
1. Docker Desktop → Settings → Resources
2. Aumente Memory para 4-6 GB
3. Restart Docker Desktop

---

### Perdi dados locais

**Não tem problema!** Banco local é descartável.

```bash
supabase db reset  # Recria tudo
```

Se tinha dados importantes, use `seed.sql` para recriar.

---

## 🎯 Checklist de Setup

- [ ] Docker Desktop instalado e rodando
- [ ] Supabase CLI instalado (`supabase --version`)
- [ ] `.env.local` configurado (local)
- [ ] `.env.production` configurado (prod)
- [ ] `supabase start` funcionando
- [ ] Studio acessível (http://localhost:54323)
- [ ] `npm run dev` conectando no banco local
- [ ] Scripts npm adicionados ao `package.json`
- [ ] `seed.sql` criado (opcional)
- [ ] Testado reset: `supabase db reset`

---

## 📚 Recursos

### Documentação Oficial
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

### Vídeos
- [Supabase Local Development Tutorial](https://www.youtube.com/watch?v=vyHyYpvjaks)

### Comunidade
- [Supabase Discord](https://discord.supabase.com/)

---

## 🚀 Próximos Passos

1. ✅ Configurar ambiente local (este guia)
2. ✅ Criar primeira migration
3. ✅ Setup de testes (Jest + Playwright)
4. ✅ Implementar Fase 1 da arquitetura (Zod + Testes)

---

**Mantido por:** Cleyton Mendes + Claude Code
**Última atualização:** Janeiro 2026
