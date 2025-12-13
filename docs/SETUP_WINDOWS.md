# 🪟 Setup de Ambiente de Desenvolvimento - Windows

> Guia completo para configurar ambiente híbrido (Supabase Local + Feature Flags) no Windows

**Data:** Dezembro 2025
**Para:** Projeto Viva Esperança - Sistema de Roles e Setores Dinâmicos

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Passo 1: Docker Desktop](#passo-1-docker-desktop)
4. [Passo 2: Supabase CLI](#passo-2-supabase-cli)
5. [Passo 3: Configurar Projeto](#passo-3-configurar-projeto)
6. [Passo 4: Workflow de Desenvolvimento](#passo-4-workflow-de-desenvolvimento)
7. [Comandos Úteis](#comandos-úteis)
8. [Troubleshooting](#troubleshooting)
9. [Checklist Final](#checklist-final)

---

## 🎯 Visão Geral

### O Que Vamos Configurar

```
┌─────────────────────────────────────────────┐
│ AMBIENTE LOCAL (Desenvolvimento)            │
├─────────────────────────────────────────────┤
│ - Next.js rodando em localhost:3000         │
│ - Supabase rodando em localhost:54321       │
│ - PostgreSQL local em localhost:54322       │
│ - Supabase Studio em localhost:54323        │
│                                              │
│ TOTALMENTE OFFLINE E SEGURO! ✅             │
└─────────────────────────────────────────────┘
          ↓ (Quando estiver pronto)
┌─────────────────────────────────────────────┐
│ PRODUÇÃO (Supabase Cloud)                   │
├─────────────────────────────────────────────┤
│ - Aplicar migrations via supabase db push   │
│ - Feature flags controlam ativação          │
│ - Rollback fácil se necessário              │
└─────────────────────────────────────────────┘
```

### Por Que Essa Abordagem?

✅ **Não gasta projeto Supabase extra** (você tem só 2 no free tier)
✅ **Segurança total** (testa local antes de produção)
✅ **Rollback fácil** (feature flags)
✅ **Dados reais** (quando aplicar em prod com flags OFF)

---

## 🔧 Pré-requisitos

### O Que Você Precisa Ter Instalado

Após formatar o PC, instale na ordem:

1. **Node.js LTS** (v18 ou superior)
   - Download: https://nodejs.org/
   - Verificar: `node --version`

2. **Git**
   - Download: https://git-scm.com/download/win
   - Verificar: `git --version`

3. **VSCode** (Recomendado)
   - Download: https://code.visualstudio.com/

4. **Terminal Moderno** (Opcional mas recomendado)
   - Windows Terminal: Instalar da Microsoft Store
   - Ou usar PowerShell padrão

---

## 📦 Passo 1: Docker Desktop

### 1.1 Download e Instalação

1. **Baixar Docker Desktop:**
   ```
   https://www.docker.com/products/docker-desktop/
   ```
   - Clicar em "Download for Windows"
   - Executar o instalador (`Docker Desktop Installer.exe`)

2. **Durante a Instalação:**
   - ✅ Marcar "Use WSL 2 instead of Hyper-V" (recomendado)
   - ✅ Aceitar os termos
   - Aguardar instalação (pode demorar 5-10 minutos)

3. **Reiniciar o PC** (obrigatório após instalação)

### 1.2 Habilitar WSL 2 (Windows Subsystem for Linux)

**Abrir PowerShell como Administrador:**

```powershell
# 1. Habilitar WSL
wsl --install

# 2. Reiniciar o PC novamente

# 3. Após reiniciar, abrir PowerShell novamente:
wsl --set-default-version 2

# 4. (Opcional) Instalar Ubuntu
wsl --install -d Ubuntu
```

**Por que WSL 2?**
- Muito mais rápido que Hyper-V
- Melhor compatibilidade com Docker
- Recomendado pelo próprio Docker

### 1.3 Verificar Instalação

```powershell
# 1. Abrir terminal normal (PowerShell ou CMD)
docker --version
# Esperado: Docker version 24.x.x ou superior

# 2. Testar Docker
docker ps
# Esperado: Lista vazia (CONTAINER ID   IMAGE   ...)

# 3. Testar com hello-world
docker run hello-world
# Esperado: "Hello from Docker!" mensagem
```

### 1.4 Configurar Docker Desktop

1. Abrir Docker Desktop (ícone na bandeja do sistema)
2. Ir em **Settings** (ícone engrenagem)
3. Configurações recomendadas:

**General:**
- ✅ Start Docker Desktop when you log in
- ✅ Use WSL 2 based engine

**Resources → WSL Integration:**
- ✅ Enable integration with my default WSL distro
- ✅ Ubuntu (se instalou)

**Resources → Advanced:**
- CPUs: 4 (ou metade dos seus cores)
- Memory: 4 GB (ou metade da sua RAM)
- Swap: 1 GB

4. **Apply & Restart**

---

## 📦 Passo 2: Supabase CLI

### 2.1 Instalação via NPM (Recomendado)

```powershell
# Instalar globalmente
npm install -g supabase

# Verificar instalação
supabase --version
# Esperado: 1.x.x
```

### 2.2 Alternativa via Scoop (Opcional)

Se preferir usar Scoop (gerenciador de pacotes Windows):

```powershell
# 1. Instalar Scoop (se não tiver)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 2. Adicionar bucket do Supabase
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

# 3. Instalar Supabase CLI
scoop install supabase
```

### 2.3 Login no Supabase (Necessário para Deploy)

```powershell
# Fazer login (abre navegador)
supabase login

# Vai abrir uma página para autenticar
# Após autorizar, voltar ao terminal
```

---

## 🚀 Passo 3: Configurar Projeto

### 3.1 Clonar/Abrir Projeto

```powershell
# Navegar até o projeto
cd C:\Users\Cleyton\Desktop\Projects\pessoal\viva-esperanca

# Ou clonar do Git (se for após formatar)
git clone [url-do-repositorio]
cd viva-esperanca

# Instalar dependências
npm install
```

### 3.2 Inicializar Supabase no Projeto

```powershell
# Inicializar (cria estrutura supabase/)
supabase init

# Verificar estrutura criada:
dir supabase
# Esperado:
# - config.toml
# - seed.sql
# - migrations/ (suas migrations existentes)
```

**O que foi criado:**

```
viva-esperanca/
└── supabase/
    ├── config.toml          # Configurações do Supabase local
    ├── seed.sql             # Dados iniciais (opcional)
    └── migrations/          # Suas migrations SQL
        ├── 20250928004028_create_page_permission.sql
        ├── ... (existentes)
        └── ... (novas que você criar)
```

### 3.3 Iniciar Supabase Local (Primeira Vez)

```powershell
# ATENÇÃO: Primeira vez vai demorar! (~5-10 min)
# Vai baixar ~2-3 GB de imagens Docker
supabase start
```

**Output esperado:**

```
Applying migration 20250928004028_create_page_permission.sql...
Applying migration ...
Seeding data supabase/seed.sql...

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

**🎉 Parabéns! Supabase está rodando localmente!**

### 3.4 Acessar Supabase Studio Local

1. Abrir navegador
2. Ir em: `http://localhost:54323`
3. Explorar:
   - Tables (ver suas tabelas)
   - SQL Editor (executar queries)
   - Authentication (gerenciar usuários)

### 3.5 Configurar Variáveis de Ambiente

**Criar/Editar `.env.local`:**

```powershell
# Copiar exemplo se não existir
copy .env.example .env.local

# Editar .env.local
code .env.local  # Abre no VSCode
```

**Conteúdo do `.env.local`:**

```env
# ========================================
# DESENVOLVIMENTO LOCAL (Supabase Local)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ☝️ Copiar a "anon key" do output do supabase start
```

**⚠️ NÃO ALTERAR `.env.production`:**

```env
# ========================================
# PRODUÇÃO (Supabase Cloud)
# NÃO MEXER AQUI!
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[sua-key-producao]
```

### 3.6 Testar Next.js com Supabase Local

```powershell
# Rodar aplicação Next.js
npm run dev

# Abrir navegador: http://localhost:3000
```

**Você está rodando:**
- ✅ Next.js: `http://localhost:3000`
- ✅ Supabase API: `http://localhost:54321`
- ✅ Supabase Studio: `http://localhost:54323`
- ✅ PostgreSQL: `localhost:54322`

**Tudo local, offline e isolado!** 🎉

---

## 🔄 Passo 4: Workflow de Desenvolvimento

### 4.1 Workflow Diário

```powershell
# ===============================
# MANHÃ - Começar trabalho
# ===============================
cd C:\Users\Cleyton\Desktop\Projects\pessoal\viva-esperanca

# 1. Iniciar Docker Desktop (se não iniciou automaticamente)
#    Ícone na bandeja do sistema

# 2. Iniciar Supabase local
supabase start  # Rápido após primeira vez (~10 segundos)

# 3. Iniciar Next.js
npm run dev

# 4. Abrir navegadores
#    - App: http://localhost:3000
#    - Studio: http://localhost:54323

# ===============================
# DURANTE - Desenvolver
# ===============================

# Criar nova migration
supabase migration new activate_roles_sectors
# Cria: supabase/migrations/20241206XXXXXX_activate_roles_sectors.sql

# Editar o arquivo .sql (VSCode)
code supabase/migrations/20241206XXXXXX_activate_roles_sectors.sql

# Aplicar migration localmente
supabase db reset  # Aplica TODAS migrations desde o início
# ou
supabase migration up  # Aplica apenas as novas

# Regenerar types TypeScript
npm run gen:types -- --local
# Atualiza src/lib/supabase/database.types.ts

# Testar mudanças
npm run dev  # Se não estiver rodando
# Navegar na app e testar

# Validar (se tiver scripts de validação)
npx tsx scripts/validate-phase1.ts

# ===============================
# FIM DO DIA - Salvar trabalho
# ===============================

# Commit no Git
git add .
git commit -m "feat: adiciona migration de roles/setores"
git push origin feature/dynamic-roles-sectors-permissions

# Parar Supabase (opcional - libera RAM)
supabase stop

# Docker Desktop pode deixar rodando ou fechar
```

### 4.2 Aplicar em Produção (Quando Estiver Pronto)

```powershell
# ===============================
# DEPLOY PARA PRODUÇÃO
# ===============================

# 1. Fazer login no Supabase (se ainda não fez)
supabase login

# 2. Linkar projeto de produção (primeira vez)
supabase link --project-ref [seu-projeto-ref-aqui]
# Exemplo: supabase link --project-ref abcdefghijklmnop

# 3. VERIFICAR migrations que serão aplicadas
supabase db diff

# 4. Aplicar migrations em PRODUÇÃO
supabase db push
# ⚠️ CUIDADO: Isso altera BD de produção!

# 5. Regenerar types de produção
npm run gen:types
# Remove o --local, agora usa produção

# 6. Deploy do código (Vercel automático)
git push origin main
# Ou fazer merge do PR se estiver em branch
```

### 4.3 Ativar Feature Flags em Produção

```powershell
# Conectar ao BD de produção via Studio ou SQL

# Opção 1: Via Supabase Studio
# 1. Ir em https://supabase.com/dashboard
# 2. Abrir seu projeto
# 3. SQL Editor
# 4. Executar:

UPDATE feature_flags
SET is_enabled = TRUE
WHERE flag_name = 'use_junction_permissions';

# Opção 2: Via SQL local conectando em produção
supabase db remote --project-ref [seu-projeto-ref]

# Depois executar SQL acima
```

---

## 🛠️ Comandos Úteis

### Supabase CLI

```powershell
# Iniciar Supabase local
supabase start

# Parar Supabase local
supabase stop

# Parar e LIMPAR todos dados (reset completo)
supabase stop --no-backup

# Ver status
supabase status

# Ver logs em tempo real
supabase logs

# Resetar BD (reaplica todas migrations)
supabase db reset

# Criar nova migration
supabase migration new nome_da_migration

# Aplicar apenas migrations novas
supabase migration up

# Gerar types TypeScript (local)
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# Gerar types TypeScript (produção)
supabase gen types typescript --linked > src/lib/supabase/database.types.ts

# Ver diferenças entre local e produção
supabase db diff

# Fazer backup do BD local
supabase db dump > backup.sql

# Restaurar backup
psql -h localhost -p 54322 -U postgres -d postgres < backup.sql
```

### Docker

```powershell
# Ver containers rodando
docker ps

# Ver TODOS containers (incluindo parados)
docker ps -a

# Parar todos containers Supabase
docker stop $(docker ps -q --filter name=supabase)

# Ver espaço usado pelo Docker
docker system df

# Limpar espaço (remove containers/images não usados)
docker system prune

# Limpar TUDO (cuidado!)
docker system prune -a --volumes
```

### Git (Workflow)

```powershell
# Criar branch para feature
git checkout -b feature/dynamic-roles-sectors-permissions

# Ver status
git status

# Adicionar mudanças
git add .

# Commit
git commit -m "feat: adiciona sistema de permissões granulares"

# Push
git push origin feature/dynamic-roles-sectors-permissions

# Merge (quando pronto)
git checkout main
git merge feature/dynamic-roles-sectors-permissions
git push origin main
```

### Next.js

```powershell
# Desenvolvimento
npm run dev

# Build (teste de produção)
npm run build

# Rodar build local
npm run start

# Lint
npm run lint

# Gerar types Supabase
npm run gen:types
```

---

## 🐛 Troubleshooting

### Problema 1: Docker não inicia

**Sintomas:**
- "Docker Desktop is starting..." infinitamente
- "Cannot connect to Docker daemon"

**Soluções:**

```powershell
# 1. Verificar se WSL está funcionando
wsl --status

# 2. Atualizar WSL
wsl --update

# 3. Reiniciar serviço WSL
wsl --shutdown

# 4. Reiniciar Docker Desktop
# Clicar com direito no ícone > Quit Docker Desktop
# Abrir Docker Desktop novamente

# 5. Se nada funcionar: reinstalar Docker Desktop
```

---

### Problema 2: Supabase não inicia (Porta em uso)

**Sintomas:**
```
Error: Port 54321 is already in use
```

**Soluções:**

```powershell
# Opção 1: Descobrir o que está usando a porta
netstat -ano | findstr :54321

# Ver o PID (última coluna) e matar processo
taskkill /PID [numero_do_pid] /F

# Opção 2: Mudar porta no config
# Editar supabase/config.toml:
[api]
port = 54325  # Nova porta

# Reiniciar
supabase stop
supabase start
```

---

### Problema 3: Migrations não aplicam

**Sintomas:**
```
Error: migration failed
```

**Soluções:**

```powershell
# 1. Ver logs detalhados
supabase db reset --debug

# 2. Reset completo (CUIDADO: apaga dados locais)
supabase stop --no-backup
supabase start

# 3. Verificar sintaxe SQL
# Abrir migration no VSCode e procurar erros

# 4. Testar SQL manualmente no Studio
# http://localhost:54323 > SQL Editor
```

---

### Problema 4: Types não geram

**Sintomas:**
```
Error: Could not generate types
```

**Soluções:**

```powershell
# 1. Verificar se Supabase está rodando
supabase status

# 2. Gerar types localmente (explícito)
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# 3. Se estiver tentando gerar de produção, verificar link
supabase link --project-ref [seu-projeto]
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

---

### Problema 5: Next.js não conecta no Supabase local

**Sintomas:**
- Erros de autenticação
- "Failed to fetch"
- Timeout

**Soluções:**

```powershell
# 1. Verificar .env.local
cat .env.local
# Confirmar que URL é http://localhost:54321

# 2. Verificar se Supabase está rodando
supabase status

# 3. Testar URL manualmente
# Abrir navegador: http://localhost:54321
# Deve mostrar página do Supabase

# 4. Reiniciar Next.js
# Ctrl+C no terminal do npm run dev
npm run dev
```

---

### Problema 6: Docker muito lento

**Sintomas:**
- Comandos demoram muito
- CPU/RAM alto
- PC travando

**Soluções:**

```powershell
# 1. Limpar espaço do Docker
docker system prune -a

# 2. Reduzir recursos no Docker Desktop
# Settings > Resources > Advanced
# - Reduzir CPUs para 2
# - Reduzir Memory para 2 GB

# 3. Parar containers não usados
docker stop $(docker ps -q)

# 4. Reiniciar Docker Desktop
```

---

### Problema 7: WSL consome muita RAM

**Sintomas:**
- `Vmmem` usando muita RAM no Task Manager

**Solução:**

Criar arquivo `.wslconfig` na pasta do usuário:

```powershell
# Criar arquivo
notepad $env:USERPROFILE\.wslconfig
```

Conteúdo:
```ini
[wsl2]
memory=4GB
processors=2
swap=1GB
```

Reiniciar WSL:
```powershell
wsl --shutdown
```

---

## ✅ Checklist Final

### Após Formatação do PC

- [ ] **Windows atualizado** (Windows Update)
- [ ] **Node.js instalado** (`node --version`)
- [ ] **Git instalado** (`git --version`)
- [ ] **VSCode instalado** (opcional)
- [ ] **Windows Terminal instalado** (opcional)

### Setup Docker

- [ ] **Docker Desktop instalado**
- [ ] **WSL 2 habilitado** (`wsl --status`)
- [ ] **Docker rodando** (`docker ps` funciona)
- [ ] **Hello World testado** (`docker run hello-world`)

### Setup Supabase CLI

- [ ] **Supabase CLI instalado** (`supabase --version`)
- [ ] **Login feito** (`supabase login`)

### Setup Projeto

- [ ] **Repositório clonado** (`git clone ...`)
- [ ] **Dependências instaladas** (`npm install`)
- [ ] **Supabase inicializado** (`supabase init`)
- [ ] **Supabase local rodando** (`supabase start`)
- [ ] **`.env.local` configurado** (com keys locais)
- [ ] **Migrations aplicadas** (`supabase db reset`)
- [ ] **Types gerados** (`npm run gen:types -- --local`)
- [ ] **Next.js rodando** (`npm run dev`)
- [ ] **Studio acessível** (`http://localhost:54323`)

### Teste de Funcionamento

- [ ] **App carrega** (`http://localhost:3000`)
- [ ] **Login funciona** (criar usuário teste)
- [ ] **Tabelas aparecem** no Studio local
- [ ] **Queries funcionam** no SQL Editor local
- [ ] **Sem erros no console** do navegador

### Primeiro Desenvolvimento

- [ ] **Branch criada** (`git checkout -b feature/...`)
- [ ] **Migration criada** (`supabase migration new ...`)
- [ ] **Migration aplicada localmente** (`supabase db reset`)
- [ ] **Types regenerados** (`npm run gen:types -- --local`)
- [ ] **Testado na app** (funciona localmente)
- [ ] **Commit feito** (`git commit ...`)
- [ ] **Push feito** (`git push ...`)

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **Docker Desktop:** https://docs.docker.com/desktop/windows/
- **WSL 2:** https://learn.microsoft.com/en-us/windows/wsl/
- **Supabase CLI:** https://supabase.com/docs/guides/cli
- **Supabase Local Dev:** https://supabase.com/docs/guides/local-development

### Vídeos Tutoriais

- **Docker no Windows:** https://www.youtube.com/watch?v=_9AWYlt86B8
- **WSL 2 Setup:** https://www.youtube.com/watch?v=_fntjriRe48
- **Supabase Local:** https://www.youtube.com/watch?v=vyHyYpvjaks

### Comunidade

- **Discord Supabase:** https://discord.supabase.com/
- **Stack Overflow:** Tag `supabase`

---

## 🎯 Próximos Passos

Após formatar o PC e seguir este guia:

1. ✅ **Validar setup** (checklist acima)
2. ✅ **Criar primeira migration** (Fase 1 do plano)
3. ✅ **Testar localmente** (validar tudo funciona)
4. ✅ **Aplicar em produção** (quando estiver 100% seguro)

**Documentos relacionados:**
- `docs/ROADMAP.md` - Planejamento da feature
- `docs/LESSONS_LEARNED.md` - Erros a evitar
- `C:\Users\Cleyton\.claude\plans\adaptive-imagining-treasure.md` - Plano detalhado de implementação

---

**Boa sorte com a formatação do PC! 🚀**

**Qualquer dúvida ao seguir este guia, consulte a seção de Troubleshooting ou peça ajuda no Discord do Supabase.**

---

**Última atualização:** 06/12/2025
**Mantido por:** Equipe de Desenvolvimento
