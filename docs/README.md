# 📚 Documentação - Igreja Viva Esperança

> **Índice completo da documentação técnica e guias do projeto**
>
> **Última atualização**: Janeiro 2026

---

## 🚀 Início Rápido

### Para Novos Desenvolvedores

1. **[LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)** - Configure seu ambiente local primeiro
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Entenda a arquitetura do projeto
3. **[DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md)** - Leia ANTES do primeiro deploy

### Para Features Novas

1. **[ROADMAP.md](./ROADMAP.md)** - Veja features planejadas
2. **[DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md)** - Workflow de migrations
3. **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Escreva testes para suas features

---

## 📖 Guias Essenciais

### 🛠️ [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)
**Setup de Ambiente Local com Supabase**

Guia completo para configurar desenvolvimento local:

- **Pré-requisitos**: Docker Desktop + Supabase CLI
- **Setup**: Instalação passo-a-passo
- **Workflow**: Desenvolvimento diário (start → dev → stop)
- **Migrations**: Criar, testar e aplicar localmente
- **Seed Data**: Dados de teste automáticos
- **Troubleshooting**: Soluções para erros comuns

**Quando usar**: Primeiro dia no projeto, setup de nova máquina

**Benefícios**:
✅ Isola desenvolvimento de produção (zero risco)
✅ Testes seguros sem poluir dados reais
✅ Desenvolve offline (sem internet)
✅ Reset do banco em segundos

---

### 🗄️ [DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md)
**Guia de Migrations & Deploy Seguro**

Tudo sobre criação, teste e deploy de migrations:

- **Workflow Completo**: 8 passos (criar → testar → deploy)
- **Migrations Seguras**: Operações idempotentes vs destrutivas
- **Deploy para Produção**: Como usar `supabase db push` com segurança
- **Rollback**: 4 cenários de erro + soluções
- **Boas Práticas**: 10 regras de ouro
- **Checklist**: 14 itens obrigatórios antes de deploy
- **Troubleshooting**: 6 erros comuns + soluções
- **Exemplo Completo**: Sistema de células (passo-a-passo)

**Quando usar**: Antes de CADA deploy de migration

**⚠️ LEITURA OBRIGATÓRIA** antes de fazer `supabase db push` em produção!

---

### 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
**Arquitetura e Padrões de Design**

Arquitetura do projeto e migração para Clean Architecture:

- **Arquitetura Atual**: Transaction Script Pattern (código legado)
- **Arquitetura Alvo**: Clean Architecture Light + DDD Tático
- **Migração**: Roadmap de 4 fases (Zod → Repos → Use Cases → Entities)
- **Convenções**: Validação, testes, Repository Pattern
- **Estrutura**: Organização de pastas (domain, application, infrastructure)

**Quando usar**: Entender decisões arquiteturais, planejar novas features

**Status**: Migração em andamento (Fase 1: Fundação com Zod + Testes)

---

### 🧪 [TESTING_GUIDE.md](./TESTING_GUIDE.md)
**Guia Completo de Testes**

Setup e estratégias de testes:

- **Tipos de Teste**: Unit, Integration, E2E (quando usar cada um)
- **Setup**: Jest + Playwright + Supabase local
- **Exemplos**: Testes de validação, repositórios, fluxos E2E
- **Cobertura**: Estratégias para aumentar cobertura
- **CI/CD**: Integração com GitHub Actions

**Quando usar**: Implementar testes para novas features

**Meta**: Cobertura de 80%+ em lógica crítica

---

### 🗺️ [ROADMAP.md](./ROADMAP.md)
**Roadmap de Features Futuras**

Planejamento completo das próximas funcionalidades:

- **🟢 Alta Prioridade** (3 features)
  - Sistema de Notificações WhatsApp
  - Calendário Interativo
  - Relatórios e Exportação

- **🟡 Média Prioridade** (3 features)
  - Check-in de Eventos
  - Gestão Financeira
  - Gestão de Células

- **🔵 Baixa Prioridade** (3 features)
  - Modo Escuro Completo
  - PWA
  - Multi-idioma

- **🟣 Ideias para Estudar** (5+ features)
  - Sistema de Discipulado
  - Gestão de Patrimônio
  - Sistema de Oração
  - Biblioteca/Midiateca
  - Integração com Streaming

**Inclui**: Detalhamento técnico, schemas SQL, stack sugerida, complexidade estimada

**Quando usar**: Planejar sprints, priorizar features

---

## 📝 Features & Decisões

### 🔔 [ALERTAS_VAGAS_ABERTO.md](./ALERTAS_VAGAS_ABERTO.md)
**Sistema de Alertas de Vagas em Aberto**

Documentação da feature de notificações automáticas:

- **Objetivo**: Notificar equipe sobre vagas de voluntários (7d e 3d antes)
- **Arquitetura**: Workflow n8n → Supabase (sem API route)
- **Implementação**: Queries, triggers, agendamento
- **Link Direto**: Mensagens incluem URL para o evento

**Status**: ✅ Implementado (Janeiro 2026)

---

### 📊 [STRIKES_BLACKLIST_SYSTEM.md](./STRIKES_BLACKLIST_SYSTEM.md)
**Sistema de Strikes e Blacklist**

Proposta de sistema de controle de voluntários:

- **Objetivo**: Penalizar membros que confirmam e não aparecem
- **Mecânica**: Sistema de strikes (3 strikes = blacklist temporário)
- **Implementação**: Schema SQL, lógica de negócio, UI
- **Considerações**: Prós, contras, alternativas

**Status**: 📋 Planejado (não implementado)

---

### 🔐 [PLANO_ROLES_SIMPLIFICADO.md](./PLANO_ROLES_SIMPLIFICADO.md)
**Decisão: Simplificação de Roles e Setores**

Documentação da decisão arquitetural:

- **Problema**: Sistema de roles/setores dinâmicos excessivamente complexo
- **Solução**: Voltar para ENUMs simples do PostgreSQL
- **Justificativa**: Requisitos não mudam frequentemente
- **Migração**: SQL de rollback para sistema simplificado

**Status**: ✅ Decisão implementada

---

### 📈 [OBSERVABILIDADE.md](./OBSERVABILIDADE.md)
**Plano de Observabilidade e Monitoramento**

Estratégia de logs, métricas e alertas:

- **Logs**: Estruturados (JSON), níveis (debug/info/error)
- **Métricas**: Performance, uso, erros
- **Alertas**: Threshold, canais (email, Slack)
- **Stack**: OpenTelemetry, Sentry, Vercel Analytics

**Status**: 📋 Planejado

---

### 💡 [LESSONS_LEARNED.md](./LESSONS_LEARNED.md)
**Lições Aprendidas**

Erros e aprendizados durante o desenvolvimento:

- **Erro 1**: Over-engineering (roles/setores dinâmicos)
- **Erro 2**: Falta de testes (bugs em produção)
- **Erro 3**: Migrations sem idempotência
- **Lições**: KISS, TDD, validação client+server

**Quando usar**: Evitar erros do passado, onboarding

---

## 📁 Documentação de Subsistemas

### 📂 [audit/](./audit/)
**Sistema de Audit Logs**

Documentação específica do sistema de auditoria:

- **[API.md](./audit/API.md)** - Endpoints e uso da API
- **[BUGS.md](./audit/BUGS.md)** - Bugs conhecidos e limitações
- **[IMPLEMENTATION.md](./audit/IMPLEMENTATION.md)** - Detalhes de implementação
- **[TESTING.md](./audit/TESTING.md)** - Testes do sistema

**Quando usar**: Manutenção ou extensão do sistema de audit logs

---

## 🔗 Links Úteis

### Documentação do Projeto

- **[README Principal](../README.md)** - Visão geral do projeto
- **[CLAUDE.md](../CLAUDE.md)** - Documentação técnica completa para IA

### Recursos Externos

- **[Supabase Docs](https://supabase.com/docs)** - Documentação oficial
- **[Next.js 15 Docs](https://nextjs.org/docs)** - Framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização

---

## 📊 Estrutura da Documentação

```
docs/
├── README.md                         # Este arquivo (índice)
│
├── 📚 GUIAS ESSENCIAIS
│   ├── ARCHITECTURE.md               # Arquitetura e padrões
│   ├── DATABASE_MIGRATIONS.md        # Migrations & deploy seguro
│   ├── LOCAL_DEVELOPMENT.md          # Setup ambiente local
│   ├── TESTING_GUIDE.md              # Guia de testes
│   └── ROADMAP.md                    # Features planejadas
│
├── 📝 FEATURES & DECISÕES
│   ├── ALERTAS_VAGAS_ABERTO.md       # Feature: Alertas WhatsApp
│   ├── STRIKES_BLACKLIST_SYSTEM.md   # Feature planejada
│   ├── PLANO_ROLES_SIMPLIFICADO.md   # Decisão arquitetural
│   ├── OBSERVABILIDADE.md            # Plano de monitoring
│   └── LESSONS_LEARNED.md            # Lições aprendidas
│
└── 📁 audit/                         # Subsistema: Audit Logs
    ├── API.md
    ├── BUGS.md
    ├── IMPLEMENTATION.md
    └── TESTING.md
```

---

## 💡 Como Contribuir com Documentação

### Adicionando Nova Documentação

1. **Crie arquivo `.md`** nesta pasta
2. **Adicione entrada neste README** (seção apropriada)
3. **Siga template**:
   ```markdown
   # Título

   > Descrição breve
   > Última atualização: Mês/Ano

   ## Seções...
   ```
4. **Commit descritivo**: `docs: adiciona guia de [tema]`
5. **Abra Pull Request** (se projeto tem múltiplos devs)

### Atualizando Documentação Existente

1. **Edite arquivo** diretamente
2. **Atualize "Última atualização"** no cabeçalho
3. **Commit**: `docs: atualiza [arquivo] com [mudança]`

### Dicas

- ✅ Use **Markdown** para formatação
- ✅ Adicione **exemplos práticos** (código, comandos)
- ✅ Mantenha linguagem **clara e objetiva**
- ✅ Inclua **diagramas** quando relevante (Mermaid é suportado)
- ✅ Use **emojis** para facilitar leitura visual
- ✅ Adicione **links internos** entre documentos relacionados

---

## 🎯 Fluxo de Leitura Recomendado

### Para Novo Desenvolvedor

```
1. LOCAL_DEVELOPMENT.md     → Setup do ambiente
2. ARCHITECTURE.md           → Entender arquitetura
3. DATABASE_MIGRATIONS.md    → Antes do primeiro deploy
4. TESTING_GUIDE.md          → Antes da primeira feature
5. ROADMAP.md                → Ver o que está planejado
```

### Para Implementar Nova Feature

```
1. ROADMAP.md                → Verificar se está planejada
2. ARCHITECTURE.md           → Padrões a seguir
3. LOCAL_DEVELOPMENT.md      → Testar localmente
4. TESTING_GUIDE.md          → Escrever testes
5. DATABASE_MIGRATIONS.md    → Deploy seguro (se usar migrations)
```

### Para Resolver Bug em Produção

```
1. audit/BUGS.md             → Ver bugs conhecidos
2. LESSONS_LEARNED.md        → Erros similares do passado
3. LOCAL_DEVELOPMENT.md      → Reproduzir localmente
4. TESTING_GUIDE.md          → Criar teste de regressão
5. DATABASE_MIGRATIONS.md    → Se precisar hotfix no banco
```

---

## 🔍 Buscar na Documentação

### Por Tópico

- **Ambiente**: LOCAL_DEVELOPMENT.md
- **Banco de Dados**: DATABASE_MIGRATIONS.md, ARCHITECTURE.md
- **Testes**: TESTING_GUIDE.md
- **Features**: ROADMAP.md, audit/, ALERTAS_VAGAS_ABERTO.md
- **Decisões**: PLANO_ROLES_SIMPLIFICADO.md, LESSONS_LEARNED.md

### Por Fase do Desenvolvimento

- **Setup Inicial**: LOCAL_DEVELOPMENT.md
- **Desenvolvimento**: ARCHITECTURE.md, TESTING_GUIDE.md
- **Deploy**: DATABASE_MIGRATIONS.md
- **Manutenção**: audit/, LESSONS_LEARNED.md
- **Planejamento**: ROADMAP.md, OBSERVABILIDADE.md

---

## 📈 Status dos Documentos

| Documento | Status | Última Atualização |
|-----------|--------|-------------------|
| LOCAL_DEVELOPMENT.md | ✅ Atualizado | Janeiro 2026 |
| DATABASE_MIGRATIONS.md | ✅ Atualizado | Janeiro 2026 |
| ARCHITECTURE.md | ✅ Atualizado | Janeiro 2026 |
| TESTING_GUIDE.md | ✅ Atualizado | Janeiro 2026 |
| ROADMAP.md | ✅ Atualizado | Janeiro 2026 |
| ALERTAS_VAGAS_ABERTO.md | ✅ Implementado | Janeiro 2026 |
| STRIKES_BLACKLIST_SYSTEM.md | 📋 Planejado | Dezembro 2025 |
| PLANO_ROLES_SIMPLIFICADO.md | ✅ Implementado | Dezembro 2025 |
| OBSERVABILIDADE.md | 📋 Planejado | Dezembro 2025 |
| LESSONS_LEARNED.md | 📝 Em andamento | Dezembro 2025 |
| audit/* | ✅ Implementado | Dezembro 2025 |

**Legenda:**
- ✅ Atualizado/Implementado
- 📋 Planejado (não implementado)
- 📝 Em andamento
- ⚠️ Desatualizado (precisa revisão)

---

**Mantido por:** Cleyton Mendes + Claude Code
**Última revisão**: Janeiro 2026
