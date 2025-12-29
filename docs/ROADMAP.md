# 🗺️ Roadmap - Viva Esperança

> **Última atualização**: Dezembro 2025
>
> Este documento lista as próximas features prioritárias do sistema. Deve ser consultado antes de qualquer implementação e atualizado após cada conclusão.

---

## 🎯 PRÓXIMAS FEATURES (Prioridades)

### 🟢 Alta Prioridade

#### 1. Sistema de Notificações WhatsApp
**Objetivo**: Follow-up automático de visitantes e lembretes de eventos/tarefas

**Features**:
- Mensagem automática 2-3 dias após visita
- Lembrete de eventos (2 dias antes + 1 dia antes)
- Notificação de atribuição de tarefas
- Alerta para líderes quando visitante não retornar

**Implementação**:
- API: Twilio, MessageBird ou Evolution API
- Queue: Usar tabela `message` existente
- Scheduler: Vercel Cron ou similar
- Templates: Nova tabela `message_templates`

**Impacto**: Alto (retenção de visitantes + engajamento)
**Complexidade**: Média-Alta

---

#### 2. Calendário Interativo
**Objetivo**: Visualizar eventos e escalas em formato de calendário

**Features**:
- Visualização mensal/semanal/diária
- Eventos coloridos por setor
- Drag-and-drop para atribuição
- Exportação para Google Calendar/Outlook (iCal)
- Filtros por setor e tipo de evento

**Stack**: FullCalendar ou react-big-calendar + DnD Kit

**Impacto**: Alto (UX de visualização)
**Complexidade**: Média

---

#### 3. Relatórios e Exportação
**Objetivo**: Gerar relatórios em PDF/Excel para análise

**Features**:
- Relatórios predefinidos (frequência, visitantes, engajamento)
- Exportação de dados (membros, escalas, estatísticas)
- Gráficos de crescimento e engajamento
- Templates customizáveis

**Stack**: jsPDF/Puppeteer (PDF) + xlsx/exceljs (Excel)

**Impacto**: Alto (tomada de decisões)
**Complexidade**: Média

---

### 🟡 Média Prioridade

#### 4. Check-in em Eventos
**Objetivo**: Controlar presença em eventos via QR Code ou lista digital

**Features**:
- QR Code único por evento
- Check-in instantâneo
- Relatório de presença (quem veio/faltou)
- Estatísticas de frequência por membro

**Schema**: Nova tabela `event_attendance` ou campo `attended` em `event_assignments`

**Impacto**: Médio (controle e estatísticas)
**Complexidade**: Baixa-Média

---

#### 5. Gestão Financeira
**Objetivo**: Controle de receitas e despesas da igreja

**Features**:
- Registro de ofertas/dízimos e despesas
- Categorização de transações
- Balanço mensal e gráficos
- Acesso restrito (pastor/tesoureiro)
- Auditoria de alterações

**Schema**: Tabelas `financial_transactions` e `financial_categories`

**Impacto**: Alto (transparência)
**Complexidade**: Média-Alta

---

#### 6. Gestão de Células/Grupos
**Objetivo**: Gerenciar grupos pequenos e células

**Features**:
- Cadastro de células (líder, local, horário)
- Atribuição de membros a células
- Registro de encontros
- Relatórios de crescimento e frequência
- Dashboard para líderes de célula

**Schema**: Tabelas `cells`, `cell_members`, `cell_meetings`

**Impacto**: Alto (para igrejas com células)
**Complexidade**: Média

---

### 🔵 Baixa Prioridade (Melhorias)

#### 7. Sistema de Permissões Granulares (v2.0)
**Objetivo**: Expandir sistema de roles/setores para controle fino de ações

**Contexto**:
- Sistema básico (v1.0) já implementado ✅
- Atualmente: permissões por página + `is_leadership` boolean
- Expansão: permissões por ação (CRUD) e contexto (setor)

**Features:**
- Matrix de permissões de ações (Create/Read/Update/Delete por recurso)
- Permissões contextuais por setor (líder só edita seu setor)
- UI para gerenciar permissões granulares

**Nota:** Sistema atual atende bem. Implementar apenas se houver demanda real.

**Impacto**: Médio (controle mais fino)
**Complexidade**: Alta
**Prioridade**: Baixa

---

#### 8. PWA (Progressive Web App)
- Instalável como app no celular
- Notificações push
- Funcionamento offline básico

**Impacto**: Médio (acesso mobile)
**Complexidade**: Média

---

#### 9. Multi-idioma
- Suporte a PT/ES/EN
- Stack: Next-intl ou react-i18next

**Impacto**: Baixo (se não houver demanda)
**Complexidade**: Média

---

### 🟣 Ideias para Validar

#### 10. Sistema de Discipulado
- Acompanhamento de novos convertidos
- Trilha de estudos
- Relação mentor-mentoreado
- Certificados

**Complexidade**: Alta
**Validação**: Necessária

---

#### 11. Sistema de Oração
- Mural de pedidos
- Membros oram por pedidos
- Notificações

**Complexidade**: Média
**Validação**: Necessária

---

#### 12. Biblioteca/Midiateca
- Catálogo de livros/DVDs
- Sistema de empréstimo
- Histórico

**Complexidade**: Média-Alta
**Validação**: Necessária

---

## 🌐 MELHORIAS DO SITE PÚBLICO

> **Status Atual**: Site básico com homepage parcial. Páginas incompletas.

### 🟢 Fundação (Urgente)

#### 1. Estrutura Básica
- [x] Menu mobile responsivo
- [x] Footer completo (3 colunas: Sobre, Links, Contato)
- [ ] Página `/contato` com formulário
- [ ] Página `/ofertas` com PIX/QR Code
- [ ] Melhorar hero com CTAs claros

**Objetivo**: Site 100% navegável

---

### 🟡 Conteúdo (Importante)

#### 2. Páginas e Seções
- [ ] Completar `/quem-somos` (História, Missão/Visão, Liderança)
- [ ] Section "Próximos Eventos" na homepage (usar API `/api/next-events`)
- [ ] Section "Valores" na homepage
- [ ] Section "Ministérios/Setores" na homepage
- [ ] Section "Depoimentos" na homepage

**Objetivo**: Homepage completa e informativa

---

#### 3. Blog Público
- [ ] Página `/blog` com listagem de posts
- [ ] Página `/blog/[slug]` para posts individuais
- [ ] Filtros por categoria
- [ ] Compartilhamento social

**Nota**: Admin do blog já está implementado ✅

**Objetivo**: Conteúdo atrai visitantes

---

#### 4. Engajamento
- [x] Formulário de visitante (integrar com tabela `visitors`)
- [ ] Integração com redes sociais (Instagram feed, YouTube)
- [ ] Newsletter signup

**Objetivo**: Captura de leads e engajamento

---

### 🔵 Polimento (Longo Prazo)

#### 5. Refinamentos
- [ ] Animações de scroll (Framer Motion/AOS)
- [ ] SEO completo (meta tags, Open Graph, sitemap)
- [ ] Toggle dark/light mode
- [ ] Busca global (Command Cmd+K)
- [ ] Otimização de performance (lazy load, code splitting)

**Objetivo**: Site profissional e otimizado

---

## 📅 Roadmap Trimestral Sugerido

### Q1 2025 (Jan-Mar)
1. Sistema de Notificações WhatsApp
2. Calendário Interativo
3. Relatórios e Exportação

### Q2 2025 (Abr-Jun)
1. Check-in de Eventos
2. Blog público completo
3. Gestão Financeira (se necessário)

### Q3 2025 (Jul-Set)
1. Gestão Financeira
2. Gestão de Células
3. PWA básico

### Q4 2025 (Out-Dez)
1. Features baseadas em feedback
2. Refinamentos e otimizações
3. Planejamento 2026

---

## 🎯 Critérios de Priorização

1. **Impacto** - Quantas pessoas/processos afeta?
2. **Urgência** - É crítico agora?
3. **Complexidade** - Quanto esforço necessário?
4. **Dependências** - Bloqueia outras features?
5. **ROI** - Vale o investimento?

**Matriz**:
- Alto Impacto + Baixa Complexidade = **Fazer AGORA**
- Alto Impacto + Alta Complexidade = **Planejar bem**
- Baixo Impacto + Baixa Complexidade = **Fazer quando sobrar tempo**
- Baixo Impacto + Alta Complexidade = **Evitar/Repensar**

---

## 📝 Esclarecimentos Importantes

### Campo `visitor_status`
**Mapeia o tipo de visitante, NÃO funil de conversão**:
- `sem_igreja`: Não crente ou sem igreja fixa
- `congregando`: Pessoa afastada que voltou
- `membro`: Já é membro de outra igreja
- `desistiu`: Visitou mas não retornou

**Objetivo**: Entender o público que a igreja atrai (evangelístico vs restauração)

---

## 📚 Componentes a Criar (Site Público)

```
src/components/site/
├── Hero.tsx                 # Hero section
├── EventsSection.tsx        # Próximos eventos
├── ValuesSection.tsx        # Valores
├── MinistriesSection.tsx    # Ministérios
├── TestimonialsSection.tsx  # Depoimentos
├── BlogCard.tsx            # Card de post
├── EventCard.tsx           # Card de evento
├── ContactForm.tsx         # Form contato
└── VisitorForm.tsx         # Form visitante
```

---

## 💡 Como Contribuir

1. Fork o repositório
2. Adicione sua ideia neste arquivo
3. Categorize por prioridade (🟢🟡🔵🟣)
4. Explique problema + solução + impacto
5. Abra um PR

Ou crie uma issue com tag `feature-request`.

---

## 📊 HISTÓRICO DE IMPLEMENTAÇÕES

### ✅ Concluídas (Q4 2024 - Q1 2025)

| Feature | Data | Descrição |
|---------|------|-----------|
| Sistema de Roles e Setores Dinâmicos (v1) | Dez/2025 | Tabelas roles/sectors, UI de gerenciamento em /admin/configuracoes, migração de enums para FK, helper functions, refatoração completa de verificações de liderança |
| Sistema de Observabilidade (Fase 2) | Dez/2025 | Widget de atividades no dashboard, página /admin/atividades com timeline, filtros e paginação |
| Sistema de Observabilidade (Fase 1) | Dez/2025 | Infraestrutura completa de auditoria: tabela audit_logs, helpers, integração em actions, queries type-safe |
| Formulário de Visitante | Dez/2025 | Formulário público em /visitante com campos expandidos (cidade, como conheceu, pedidos de oração) e página de agradecimento |
| Dashboard Executivo | Jan/2025 | Dashboard admin com métricas e estatísticas principais |
| Refatoração Admin | Jan/2025 | Reestruturação de componentes do painel admin |
| Sistema de Blog (Admin) | Nov/2024 | CRUD completo de posts com categorias e status |
| Menu Mobile | Nov/2024 | Menu hamburger responsivo com Sheet component |
| Footer Completo | Nov/2024 | Footer com 3 colunas (Sobre, Links, Contato) |
| Header Melhorado | Nov/2024 | Sticky header, logo clicável, indicador de página ativa |
| Performance Básica | Nov/2024 | Lazy load, otimização de imagens, code splitting |
| Acessibilidade | Nov/2024 | Alt text, ARIA labels, navegação por teclado |
| Modo Escuro Padrão | Nov/2024 | Dark mode como tema padrão do site |

---

**Mantido por**: Equipe de Desenvolvimento
**Última revisão completa**: 28/12/2025
