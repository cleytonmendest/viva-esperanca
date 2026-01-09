# 🗺️ Roadmap - Viva Esperança

> **Última atualização**: Janeiro 2026

---

## 🎯 PRÓXIMAS FEATURES

### 🔴 Crítico (UX)

#### 1. Ordenação do Sidebar
**Problema**: Sidebar aparece em ordem aleatória para usuários. Sem controle de ordenação, a navegação fica inconsistente entre ambientes e usuários.

**Solução**:
- Adicionar coluna `order` (integer) na tabela `page_permissions`
- Atualizar query do Sidebar para ordenar por `order ASC`
- Adicionar ordenação default no seed.sql (10, 20, 30, etc. para permitir inserções futuras)
- Garantir ordenação consistente em todos os ambientes

**Impacto**: Crítico (afeta todos os usuários) | **Complexidade**: Muito Baixa (1-2h)

**SQL**:
```sql
ALTER TABLE page_permissions ADD COLUMN order_position integer DEFAULT 999;
UPDATE page_permissions SET order_position = 10 WHERE page_path = '/admin';
UPDATE page_permissions SET order_position = 20 WHERE page_path = '/admin/dashboard';
-- etc.
```

---

#### 2. Revisão Completa da Página `/admin/tasks`
**Problema**: Página inconsistente com o resto do painel. Usa roles antigas (enum) ao invés da nova tabela `roles`. Visual desatualizado comparado a `/admin/members` e `/admin/events/:detail`.

**Tarefas**:
- [ ] Migrar de `user_role_enum` para tabela `roles` (queries + filters)
- [ ] Atualizar visual para shadcn/ui (cards, dialogs, tables modernos)
- [ ] Alinhar layout com padrão de `/admin/members` e `/admin/events/:detail`
- [ ] Revisar actions e queries (remover código legado)
- [ ] **Auditar outras páginas**: Buscar e documentar outras áreas que ainda usam roles antigas

**Escopo da Auditoria**:
- `/admin/visitors`
- `/admin/pending-approval`
- `/admin/configuracoes` (settings)
- Sidebar e layout (verificar se usam roles antigas em algum lugar)
- Server Actions (buscar `user_role_enum` no código)

**Impacto**: Alto (dívida técnica + inconsistência visual) | **Complexidade**: Média (1-2 dias)

---

#### 3. Melhorias de Navegação e Perfil
**Problema**: Sidebar esconde opções importantes. Falta página de perfil dedicada.

**Arquitetura**: Dashboard = Ação | Perfil = Identidade

**A) Melhorias Visuais no Sidebar**
- **Logo/Branding**: Logo da igreja no topo (substitui "Minha Conta")
- **Identificação do Usuário**:
  - Círculo com iniciais do nome (ex: "CT" para Cleyton)
  - Nome completo + role/setor visível
  - Cores geradas automaticamente por nome (consistência visual)
- **UserAccountMenu Melhorado**:
  - Mover para footer do sidebar (padrão de mercado)
  - Iniciais + Nome + Role visível mesmo quando sidebar colapsa
  - Dropdown: Ver Perfil | Editar Perfil | Alterar Senha | Sair
- **Agrupamento de Menus**:
  - Separar em categorias: "Geral" | "Gestão" | "Configurações"
  - Visual mais organizado (usar `SidebarGroup`)
- **Indicador de Página Ativa**: Destaque visual (borda ou background)
- **Badges/Contadores**:
  - Ex: "Visitantes (3)" para visitantes pendentes
  - Notificações futuras
- **Footer**: Versão do sistema ou link de suporte

**B) Header Principal (fora do sidebar)**
- Círculo com iniciais clicável no canto superior direito
- Dropdown rápido: Perfil | Notificações | Sair
- Sempre visível mesmo em mobile

**C) Dashboard `/admin` - "O que fazer AGORA"** (melhorias incrementais)
- ✅ Saudação personalizada (já existe)
- ✅ Minhas tarefas (já existe)
- ✅ Tarefas disponíveis (já existe)
- ✅ Atividades recentes - geral (já existe)
- ✅ Resumo executivo para líderes (já existe)
- 🆕 **Próximo evento escalado** - card destacado no topo
- 🆕 **Aniversariantes da semana** - widget pequeno (social)

**D) Perfil `/admin/perfil` - "Quem sou EU"** (nova página)
- Header: Círculo com iniciais + Nome + Badge de engajamento (Bronze/Prata/Ouro/Platina)
- **3 Cards de Estatísticas Pessoais**:
  - Total de voluntariados (ano/mês)
  - Posição no ranking
  - Última participação (data + evento)
- **Gráfico de Participação Mensal** (visualização)
- **Timeline Pessoal** (histórico completo filtrado deste membro)
- **Botão "Editar Informações"** (dados pessoais)

**E) Sistema de Avatar (Opcional - Futuro)**
- Upload de foto de perfil
- Crop/resize de imagem
- Storage no Supabase Storage
- Fallback: Iniciais coloridas (já implementado)

**Divisão Clara**:
- Dashboard = trabalho/ação (próximos eventos, tarefas)
- Perfil = identidade/reflexão (estatísticas históricas, progresso pessoal)
- Sem redundância: atividades na dashboard são **gerais**, timeline no perfil é **pessoal**

**Impacto**: Crítico | **Complexidade**: Baixa-Média

---

### 🟢 Alta Prioridade

#### 4. Gestão de Permissões via Painel
**Problema**: Tabela `page_permissions` só é acessível via SQL. Admins não conseguem gerenciar permissões de páginas sem conhecimento técnico.

**Solução**: Criar página `/admin/configuracoes/permissoes`

**Features**:
- **Listagem**: Tabela com todas as páginas (nome, path, ícone, roles permitidas)
- **Edição**: Dialog para editar roles permitidas por página
- **Ordenação**: Drag-and-drop ou campo numérico para reordenar sidebar
- **Visualização**: Preview de como o sidebar aparece para cada role
- **Validação**: Impedir remoção de admin de páginas críticas

**Esquema UI**:
```
┌─────────────────────────────────────────────────┐
│ Gerenciamento de Permissões de Páginas         │
├─────────────────────────────────────────────────┤
│ Página        │ Path      │ Ícone │ Roles       │
│ Dashboard     │ /admin    │ Home  │ [Todos]     │
│ Membros       │ /members  │ Users │ [Admin, Pa…]│
│ Eventos       │ /events   │ Cal…  │ [Admin, Lí…]│
└─────────────────────────────────────────────────┘
```

**Permissões**: Apenas `admin` e `pastor(a)` podem acessar

**Schema Atual**: Já existe, apenas falta UI
```typescript
page_permissions: {
  page_name: string
  page_path: string
  icon: string
  allowed_roles: user_role_enum[]
  order_position: integer // adicionar
}
```

**Impacto**: Alto (autonomia para admins) | **Complexidade**: Média (2-3 dias)

---

#### 5. Calendário Interativo
**Objetivo**: Visualizar eventos e escalas em formato de calendário

**Features**:
- Visualização mensal/semanal/diária
- Eventos coloridos por setor
- Drag-and-drop para atribuição (opcional)
- Exportação para Google Calendar/Outlook (iCal)
- Filtros por setor

**Stack**: FullCalendar ou react-big-calendar

**Impacto**: Alto | **Complexidade**: Média

---

#### 6. Features de Engajamento

**Quick Wins** (1-2 dias cada):
- **Calendário Completo**: Mostrar TODOS os eventos (não só voluntariado)
- **Aniversariantes**: Widget + notificações + envio de mensagem
- **Diretório de Setor**: Lista de membros do mesmo setor com contato

**Médio Prazo** (2-4 dias):
- **Timeline Pessoal**: Histórico cronológico (cadastro, voluntariados, mudanças)
- **Gamificação**: Badges por participação + Ranking mensal
- **Notificações In-App**: Badge no header + centro de notificações

**Impacto**: Alto (engajamento) | **Complexidade**: Baixa-Média

---

### 🟡 Média Prioridade

#### 7. Permissões por Setor (Sector-Based Permissions)
**Contexto**: Atualmente o sistema tem permissões baseadas em **roles** (admin, pastor, lider_midia, etc.). Membros pertencem a **setores** (Mídia, Louvor, Infantil, etc.) mas as permissões não levam isso em conta.

**Problema**:
- Um líder de Mídia vê tarefas de todos os setores (Louvor, Infantil, etc.)
- Não há isolamento de dados por setor onde faz sentido
- Dificulta escalabilidade (ex: igreja com 20 setores)

**Proposta**: Sistema híbrido **Role + Sector**

**Regras de Negócio** (a definir com usuários):
1. **Visualização de Dados**:
   - `admin` e `pastor(a)`: Veem tudo (todos os setores)
   - `lider_midia`: Vê apenas tarefas/eventos do setor Mídia
   - `lider_geral`: Vê tudo? Ou apenas setor Geral?
   - `membro`: Vê apenas tarefas do(s) seu(s) setor(es)

2. **Edição de Dados**:
   - Líderes podem editar apenas dados do seu setor
   - Admin/Pastor podem editar qualquer setor

3. **Criação de Eventos/Tarefas**:
   - Tarefa criada por líder de setor = automaticamente do seu setor
   - Admin/Pastor podem criar para qualquer setor

**Implementação** (quando priorizado):
- [ ] Mapear quais páginas/recursos devem ter filtro por setor
- [ ] Adicionar helpers: `canViewSector(user, sector)`, `canEditSector(user, sector)`
- [ ] Atualizar queries para filtrar por setor quando aplicável
- [ ] Adicionar filtros de setor na UI (dropdowns, tabs)
- [ ] Atualizar RLS policies no Supabase (se necessário)
- [ ] Documentar regras de negócio em `docs/PERMISSIONS.md`

**Nota**: Sistema atual (baseado só em roles) funciona bem para igreja pequena/média. Implementar apenas quando houver **demanda real** de usuários.

**Impacto**: Médio (escalabilidade) | **Complexidade**: Média-Alta (3-5 dias) | **ROI**: Médio

---

#### 8. Check-in em Eventos
**Objetivo**: Controlar presença via QR Code ou lista digital

**Features**:
- QR Code único por evento
- Check-in instantâneo
- Relatório de presença
- Estatísticas de frequência

**Schema**: Campo `attended` em `event_assignments` ou nova tabela

**Impacto**: Médio | **Complexidade**: Baixa

---

#### 9. Gestão Financeira
**Objetivo**: Controle de receitas e despesas

**Features**:
- Registro de ofertas/dízimos e despesas
- Categorização e balanço mensal
- Acesso restrito (pastor/tesoureiro)
- Auditoria de alterações

**Schema**: Tabelas `financial_transactions` e `financial_categories`

**Impacto**: Alto (transparência) | **Complexidade**: Média-Alta

---

#### 10. Gestão de Células/Grupos
**Objetivo**: Gerenciar grupos pequenos e células

**Features**:
- Cadastro de células (líder, local, horário)
- Atribuição de membros
- Registro de encontros
- Relatórios e dashboard para líderes

**Schema**: Tabelas `cells`, `cell_members`, `cell_meetings`

**Impacto**: Alto (para igrejas com células) | **Complexidade**: Média

---

### 🔵 Baixa Prioridade

#### 11. Relatórios e Exportação
- Relatórios predefinidos (frequência, visitantes, engajamento)
- Exportação para PDF/Excel
- Gráficos e templates customizáveis

**Stack**: jsPDF/Puppeteer + xlsx

**Impacto**: Médio | **Complexidade**: Média

---

#### 12. PWA (Progressive Web App)
- Instalável como app no celular
- Notificações push
- Funcionamento offline básico

**Impacto**: Médio | **Complexidade**: Média

---

#### 13. Sistema de Permissões Granulares v2.0
- Permissões por ação (CRUD por recurso)
- Permissões contextuais por setor
- UI para gerenciar permissões

**Nota**: Sistema atual atende bem. Implementar apenas se houver demanda real.

**Impacto**: Médio | **Complexidade**: Alta

---

### 🟣 Ideias para Validar

- **Sistema de Discipulado**: Acompanhamento de novos convertidos + trilha de estudos
- **Sistema de Oração**: Mural de pedidos + notificações
- **Biblioteca/Midiateca**: Catálogo + empréstimo + histórico

---

## 🏗️ REFATORAÇÃO DE ARQUITETURA

> **Status**: Planejado | **Documentação**: `docs/ARCHITECTURE.md` + `docs/TESTING_GUIDE.md`

### Objetivo

Evoluir a arquitetura atual (Transaction Script) para **Clean Architecture Light + DDD Tático**, melhorando:
- ✅ Testabilidade (zero testes → cobertura de 70%+)
- ✅ Manutenibilidade (lógica isolada e reutilizável)
- ✅ Desacoplamento (trocar Supabase sem quebrar tudo)
- ✅ Qualidade (validação consistente, error handling robusto)

### Princípios

1. **Pragmatismo**: Evitar over-engineering, evoluir incrementalmente
2. **Migração Gradual**: Novas features seguem nova arquitetura, código legado migra conforme necessário
3. **Documentação Viva**: Toda mudança documentada em `ARCHITECTURE.md`

---

### Fase 1: Fundação (2 semanas) - **PRIORITÁRIO**

**Objetivo**: Setup de ferramentas essenciais

**Tarefas:**
- [ ] Instalar e configurar **Zod** (validação)
- [ ] Instalar e configurar **Jest** (testes unitários + integração)
- [ ] Instalar e configurar **Playwright** (testes E2E)
- [ ] Criar schemas Zod para Member, Event, Visitor
- [ ] Refatorar 2-3 forms para usar Zod (client + server)
- [ ] Escrever 10 testes de exemplo (unit + E2E)
- [ ] Documentar setup em `docs/TESTING_GUIDE.md` ✅

**Critérios de Sucesso:**
- ✅ `npm test` roda sem erros
- ✅ `npm run test:e2e` roda 3+ testes
- ✅ Validação funcionando em pelo menos 2 features

**Impacto**: Alto | **Complexidade**: Baixa | **ROI**: 🔥 Muito Alto

---

### Fase 2: Repository Pattern (3 semanas)

**Objetivo**: Desacoplar banco de dados

**Tarefas:**
- [ ] Criar estrutura `src/domain/` e `src/infrastructure/`
- [ ] Criar interface `MemberRepository`
- [ ] Implementar `SupabaseMemberRepository`
- [ ] Migrar queries de membros para usar repository
- [ ] Repetir para Event, Task, Visitor
- [ ] Escrever testes de integração para repositories

**Critérios de Sucesso:**
- ✅ Queries não acessam Supabase diretamente
- ✅ Repositories têm 80%+ de cobertura de testes
- ✅ Fácil criar `InMemoryRepository` para testes

**Impacto**: Médio | **Complexidade**: Média | **ROI**: Alto

---

### Fase 3: Use Cases (4 semanas)

**Objetivo**: Isolar lógica de aplicação

**Tarefas:**
- [ ] Criar estrutura `src/application/`
- [ ] Implementar Use Cases para CRUD de Member
- [ ] Implementar Use Cases para Event + Assignments
- [ ] Refatorar Server Actions para chamar Use Cases
- [ ] Adicionar Result Pattern para error handling
- [ ] Escrever testes unitários para Use Cases

**Critérios de Sucesso:**
- ✅ Server Actions são thin wrappers (<20 linhas)
- ✅ Use Cases têm 90%+ de cobertura
- ✅ Lógica de negócio reutilizável (API, CLI, etc.)

**Impacto**: Alto | **Complexidade**: Média-Alta | **ROI**: Alto

---

### Fase 4: Domain Entities (Opcional - 2-3 semanas)

**Objetivo**: Encapsular regras de negócio

**Tarefas:**
- [ ] Criar classes `Member`, `Event`, `Task`
- [ ] Mover validações para entidades
- [ ] Mover regras de negócio (ex: `member.canBeAssignedTo(task)`)
- [ ] Repositories retornam entidades (não objetos brutos)
- [ ] Testes unitários para domain logic

**Critérios de Sucesso:**
- ✅ Domain layer independente de infraestrutura
- ✅ Regras de negócio testáveis isoladamente
- ✅ 95%+ de cobertura em domain

**Impacto**: Médio | **Complexidade**: Alta | **ROI**: Médio

---

### Convenções para Novas Features

**A partir de agora**, toda nova feature DEVE seguir:

1. **Validação**: Criar schema Zod em `src/shared/schemas/`
2. **Testes**: Escrever testes ANTES ou JUNTO com implementação
3. **Estrutura**: Seguir padrão Repository + Use Case (quando Fase 2/3 estiverem completas)
4. **Documentação**: Atualizar `ARCHITECTURE.md` se adicionar novo padrão

**Código legado** pode ser refatorado incrementalmente (não é obrigatório)

---

## 🌐 MELHORIAS DO SITE PÚBLICO

### Páginas Básicas
- [ ] `/contato` - Formulário funcional
- [ ] `/ofertas` - PIX/QR Code
- [ ] Completar `/quem-somos` (História, Missão/Visão, Liderança)

### Homepage
- [ ] Melhorar hero com CTAs claros
- [ ] Section "Próximos Eventos" (usar API `/api/next-events`)
- [ ] Section "Valores"
- [ ] Section "Ministérios/Setores"
- [ ] Section "Depoimentos"

### Blog
- [ ] Página `/blog` com listagem
- [ ] Página `/blog/[slug]` individual
- [ ] Filtros por categoria
- [ ] Compartilhamento social

**Nota**: Admin do blog já implementado ✅

### Engajamento
- [ ] Integração com redes sociais (Instagram feed, YouTube)
- [ ] Newsletter signup

### Polimento (Longo Prazo)
- [ ] Animações de scroll
- [ ] SEO completo (meta tags, Open Graph, sitemap)
- [ ] Toggle dark/light mode
- [ ] Busca global (Cmd+K)
- [ ] Otimização de performance

---

## 🎯 Critérios de Priorização

1. **Impacto** - Quantas pessoas/processos afeta?
2. **Urgência** - É crítico agora?
3. **Complexidade** - Quanto esforço necessário?
4. **ROI** - Vale o investimento?

**Matriz**:
- Alto Impacto + Baixa Complexidade = **Fazer AGORA**
- Alto Impacto + Alta Complexidade = **Planejar bem**
- Baixo Impacto + Baixa Complexidade = **Fazer quando sobrar tempo**
- Baixo Impacto + Alta Complexidade = **Evitar/Repensar**

---

## 📊 HISTÓRICO DE IMPLEMENTAÇÕES

| Feature | Data | Descrição |
|---------|------|-----------|
| Fix: Audit Logs de Membros | Jan/2026 | Corrigido audit log para distinguir quem FEZ vs quem FOI AFETADO em ações de membros |
| Alertas de Vagas (n8n) | Jan/2026 | Notificações automáticas WhatsApp para vagas em eventos (7 e 3 dias antes) |
| Roles e Setores Dinâmicos | Dez/2025 | Sistema completo de gerenciamento em `/admin/configuracoes` |
| Sistema de Observabilidade | Dez/2025 | Audit logs + timeline de atividades + widget dashboard |
| Formulário de Visitante | Dez/2025 | Formulário público em `/visitante` com campos expandidos |
| Dashboard Executivo | Jan/2025 | Métricas e estatísticas principais |
| Sistema de Blog (Admin) | Nov/2024 | CRUD completo com categorias e status |
| Menu Mobile + Footer + Header | Nov/2024 | Site responsivo e navegável |
| Performance + Acessibilidade | Nov/2024 | Otimizações básicas + ARIA + dark mode padrão |

---

## 📝 Notas Importantes

### Sistema de Notificações WhatsApp
**Status**: ✅ Parcialmente implementado

**O que já existe** (via n8n):
- Alertas automáticos de vagas em aberto (7 e 3 dias antes)
- Mensagens direcionadas por setor
- Links diretos para eventos
- Integração Evolution API

**Documentação**: `docs/ALERTAS_VAGAS_ABERTO.md`

**Próximos passos**:
- [ ] Follow-up de visitantes (2-3 dias após visita)
- [ ] Lembretes de eventos (para membros escalados)
- [ ] Notificação de atribuição de tarefas
- [ ] Dashboard para configurar horários e grupos via UI

---

### Campo `visitor_status`
Mapeia o **tipo de visitante**, não funil de conversão:
- `sem_igreja`: Não crente ou sem igreja fixa
- `congregando`: Pessoa afastada que voltou
- `membro`: Já é membro de outra igreja
- `desistiu`: Visitou mas não retornou

**Objetivo**: Entender o público que a igreja atrai

---

**Mantido por**: Equipe de Desenvolvimento
