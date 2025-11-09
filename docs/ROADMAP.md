# 🗺️ Roadmap - Próximas Features

Este documento contém todas as ideias de features e melhorias futuras para o sistema de gerenciamento da Igreja Viva Esperança.

> **Última atualização**: Janeiro 2025

---

## 📊 Status das Features

- 🟢 **Alta Prioridade** - Impacto alto, implementação recomendada
- 🟡 **Média Prioridade** - Útil mas pode esperar
- 🔵 **Baixa Prioridade** - Melhorias de UX/DX
- 🟣 **Ideias** - Necessita validação/estudo

---

## 🔥 Alta Prioridade

### 1. Sistema de Notificações e Follow-up Automático 🟢

**Problema**: Visitantes e membros não recebem lembretes de eventos/tarefas

**Solução**: Sistema automático de notificações via WhatsApp/SMS

#### Features:
- **Follow-up Automático de Visitantes**
  - Mensagem 2-3 dias após primeira visita
  - Lembrete de retorno 1 semana depois
  - Alerta para líderes se visitante não retornar em 15 dias

- **Lembretes de Eventos**
  - WhatsApp automático 2 dias antes do evento
  - Lembrete 1 dia antes
  - Confirmação de presença (sim/não)

- **Lembretes de Tarefas**
  - Notificação quando tarefa é atribuída
  - Lembrete se tarefa não for confirmada em 3 dias
  - Lembrete 1 dia antes do evento da tarefa

#### Implementação Técnica:
```typescript
// Stack sugerida:
- API: Twilio, MessageBird ou Evolution API (WhatsApp)
- Queue: Tabela 'message' já existe!
- Scheduler: Cron Jobs ou Vercel Cron
- Templates: Armazenar na tabela 'message_templates'
```

#### Schema Sugerido:
```sql
-- Tabela de templates de mensagens
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'visitor_followup', 'event_reminder', etc
  message TEXT NOT NULL,
  variables JSONB, -- {name}, {event}, {date}, etc
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico de envios
CREATE TABLE message_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES message(id),
  recipient_phone VARCHAR(20),
  recipient_name VARCHAR(255),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Fluxo:
1. Visitante é cadastrado → Cria mensagem agendada para +2 dias
2. Sistema checa fila de mensagens a cada hora
3. Envia mensagens pendentes via API
4. Registra status (enviado, entregue, lido)
5. Alerta líder se não houver resposta

**Complexidade**: Média-Alta (requer integração com API externa)
**Impacto**: Alto (aumenta retenção de visitantes e engajamento)

---

### 2. Calendário Interativo 🟢

**Problema**: Difícil visualizar eventos e escalas em formato de calendário

**Solução**: Calendário mensal/semanal com drag-and-drop

#### Features:
- **Visualização de Calendário**
  - Mensal, semanal, diário
  - Eventos coloridos por tipo/setor
  - Clique no evento → Detalhes + Escalas

- **Atribuição por Drag-and-Drop**
  - Arrastar membro para tarefa
  - Arrastar tarefa para evento
  - Reordenar escalas visualmente

- **Exportação**
  - Exportar para Google Calendar (iCal)
  - Exportar para Outlook
  - Sincronizar com calendário pessoal
  - QR Code com link do calendário

- **Filtros**
  - Por setor
  - Por tipo de evento
  - Apenas "Meus Eventos"

#### Stack Sugerida:
```typescript
// Bibliotecas:
- FullCalendar (https://fullcalendar.io/)
- react-big-calendar
- DnD Kit (drag and drop)

// Features:
- Server-side rendering dos eventos
- Atualização otimista (UI instantânea)
- Sincronização em tempo real
```

**Complexidade**: Média
**Impacto**: Alto (melhora muito a UX de visualização)

---

### 3. Relatórios e Exportação 🟢

**Problema**: Dados presos no sistema, difícil gerar relatórios

**Solução**: Sistema de relatórios em PDF/Excel

#### Features:
- **Relatórios Predefinidos**
  - Estatísticas mensais da igreja
  - Relatório de frequência de membros
  - Relatório de visitantes (conversão, follow-up)
  - Relatório de engajamento (ranking de voluntários)
  - Relatório de eventos (taxa de preenchimento)

- **Exportação de Dados**
  - Exportar membros para Excel
  - Exportar visitantes para Excel
  - Exportar escalas para PDF
  - Exportar estatísticas para PDF

- **Geração de Gráficos**
  - Crescimento de membros
  - Funil de visitantes
  - Engajamento por setor
  - Gráficos personalizáveis

#### Stack Sugerida:
```typescript
// PDF:
- jsPDF
- Puppeteer (HTML to PDF)
- @react-pdf/renderer

// Excel:
- xlsx
- exceljs

// Features:
- Templates customizáveis
- Agendamento de relatórios (email semanal/mensal)
- Salvar histórico de relatórios
```

**Complexidade**: Média
**Impacto**: Alto (facilita tomada de decisões)

---

## ⚡ Média Prioridade

### 4. Sistema de Check-in em Eventos 🟡

**Problema**: Difícil controlar presença em eventos

**Solução**: Check-in via QR Code ou lista digital

#### Features:
- **QR Code por Evento**
  - Gerar QR Code único para cada evento
  - Membros escaneiam ao chegar
  - Check-in instantâneo

- **Lista Digital de Presença**
  - Líder marca presença via tablet/celular
  - Offline-first (sincroniza depois)

- **Relatório de Presença**
  - Quem veio, quem faltou
  - Taxa de presença por membro
  - Alertas para membros ausentes

- **Estatísticas**
  - Frequência média por membro
  - Pico de presença por evento
  - Tendências de comparecimento

#### Schema Sugerido:
```sql
CREATE TABLE event_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id),
  member_id UUID REFERENCES members(id),
  checked_in_at TIMESTAMP NOT NULL,
  checked_out_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ou usar a tabela event_assignments e adicionar campo 'attended'
ALTER TABLE event_assignments ADD COLUMN attended BOOLEAN DEFAULT false;
ALTER TABLE event_assignments ADD COLUMN attended_at TIMESTAMP;
```

**Complexidade**: Baixa-Média
**Impacto**: Médio (útil para controle e estatísticas)

---

### 5. Gestão Financeira 🟡

**Problema**: Finanças da igreja não estão no sistema

**Solução**: Módulo de gestão financeira

#### Features:
- **Receitas**
  - Ofertas e dízimos
  - Doações
  - Eventos pagos
  - Categorização (propósito da oferta)

- **Despesas**
  - Contas fixas (água, luz, aluguel)
  - Compras
  - Salários (se aplicável)
  - Categorização

- **Relatórios**
  - Balanço mensal
  - Gráfico de receitas vs despesas
  - Previsão de caixa
  - Relatório anual para assembleia

- **Segurança**
  - Acesso restrito a tesoureiro/pastor
  - Auditoria de alterações
  - Backup automático

#### Schema Sugerido:
```sql
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL, -- 'income' ou 'expense'
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  payment_method VARCHAR(50), -- 'dinheiro', 'pix', 'cartão'
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE financial_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'income' ou 'expense'
  color VARCHAR(20),
  icon VARCHAR(50)
);
```

**Complexidade**: Média-Alta
**Impacto**: Alto (essencial para transparência)

---

### 6. Gestão de Grupos/Células 🟡

**Problema**: Grupos pequenos não são gerenciados no sistema

**Solução**: Módulo de células/grupos

#### Features:
- **Cadastro de Células**
  - Nome, líder, dia/horário
  - Local de reunião
  - Setor/ministério

- **Membros por Célula**
  - Atribuir membros a células
  - Histórico de participação
  - Transferência entre células

- **Relatórios**
  - Crescimento de célula
  - Frequência
  - Multiplicação de células

- **Líderes de Célula**
  - Dashboard específico para líder
  - Lista de membros da célula
  - Registrar estudos/encontros

#### Schema Sugerido:
```sql
CREATE TABLE cells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  leader_id UUID REFERENCES members(id),
  day_of_week VARCHAR(20), -- 'Segunda', 'Terça', etc
  time TIME,
  location TEXT,
  sector sector_enum,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cell_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cell_id UUID REFERENCES cells(id),
  member_id UUID REFERENCES members(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  UNIQUE(cell_id, member_id)
);

CREATE TABLE cell_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cell_id UUID REFERENCES cells(id),
  date DATE NOT NULL,
  topic VARCHAR(255),
  attendance_count INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Complexidade**: Média
**Impacto**: Alto (para igrejas com células)

---

## 🔵 Baixa Prioridade (Melhorias de UX)

### 7. Modo Escuro Completo 🔵

**Status**: Parcialmente implementado (Next Themes configurado)

**Pendente**:
- Testar todas as páginas em dark mode
- Ajustar cores de gráficos
- Garantir contraste adequado
- Toggle no header

**Complexidade**: Baixa
**Impacto**: Baixo-Médio (conforto visual)

---

### 8. PWA (Progressive Web App) 🔵

**Problema**: Precisa abrir navegador toda vez

**Solução**: Instalar como app no celular

#### Features:
- **Instalável**
  - Botão "Adicionar à tela inicial"
  - Funciona offline (básico)
  - Ícone e splash screen

- **Notificações Push**
  - Lembretes de eventos
  - Alertas de novas tarefas
  - Mensagens de líderes

- **Offline First**
  - Cache de dados essenciais
  - Sincronização quando voltar online
  - Indicador de status de conexão

**Complexidade**: Média
**Impacto**: Médio (facilita acesso mobile)

---

### 9. Multi-idioma 🔵

**Problema**: Pode ter membros de outras nacionalidades

**Solução**: Suporte a múltiplos idiomas

#### Idiomas Sugeridos:
- Português (Brasil) - padrão
- Espanhol
- Inglês

**Stack**: Next-intl ou react-i18next

**Complexidade**: Média (muitas strings)
**Impacto**: Baixo (se não houver demanda)

---

## 🟣 Ideias para Estudar

### 10. Sistema de Discipulado 🟣

- Acompanhamento de novos convertidos
- Trilha de estudos
- Acompanhamento mentor-mentoreado
- Certificados de conclusão

**Complexidade**: Alta
**Validação necessária**: Sim

---

### 11. Gestão de Patrimônio 🟣

- Inventário de equipamentos
- Controle de empréstimos
- Manutenção preventiva
- Histórico de reparos

**Complexidade**: Média
**Validação necessária**: Sim

---

### 12. Sistema de Oração 🟣

- Mural de pedidos de oração
- Membros podem orar por pedidos
- Notificar quando alguém ora
- Relatórios de resposta

**Complexidade**: Média
**Validação necessária**: Sim

---

### 13. Biblioteca/Midiateca 🟣

- Catálogo de livros/DVDs
- Sistema de empréstimo
- Histórico de leituras
- Sugestões de leitura

**Complexidade**: Média-Alta
**Validação necessária**: Sim

---

### 14. Integração com Streaming 🟣

- Agendar transmissões ao vivo
- Integração com YouTube/Facebook Live
- Arquivo de pregações
- Download de áudios

**Complexidade**: Alta
**Validação necessária**: Sim

---

## 📝 Correções e Esclarecimentos

### Status de Visitantes - Esclarecimento

**Conforme explicado pelo usuário**, o campo `visitor_status` mapeia:

- **`sem_igreja`**: Não crente ou pessoa sem igreja fixa
- **`congregando`**: Pessoa afastada que voltou a congregar
- **`membro`**: Já é membro de outra igreja
- **`desistiu`**: Visitou mas não retornou

**Objetivo**: Entender que tipo de público a igreja está atraindo (evangelístico vs restauração)

**Não é**: Sistema de follow-up/funil de conversão (como estava sendo usado anteriormente)

---

## 🎯 Como Priorizar?

### Critérios de Priorização:

1. **Impacto** - Quantas pessoas/processos isso afeta?
2. **Urgência** - É um problema crítico agora?
3. **Complexidade** - Quanto tempo/esforço leva?
4. **Dependências** - Bloqueia outras features?
5. **ROI** - Vale o esforço investido?

### Matriz de Decisão:

```
Alto Impacto + Baixa Complexidade = Fazer AGORA (Quick Wins)
Alto Impacto + Alta Complexidade = Planejar bem (Big Bets)
Baixo Impacto + Baixa Complexidade = Fazer quando sobrar tempo
Baixo Impacto + Alta Complexidade = Evitar/Repensar
```

---

## 📅 Sugestão de Roadmap Trimestral

### Q1 2025 (Jan-Mar)
1. ✅ Dashboard Executivo (FEITO)
2. ✅ Refatoração componentes /admin (FEITO)
3. 🔜 Sistema de Notificações WhatsApp
4. 🔜 Calendário Interativo

### Q2 2025 (Abr-Jun)
1. Relatórios e Exportação
2. Check-in de Eventos
3. PWA básico

### Q3 2025 (Jul-Set)
1. Gestão Financeira
2. Gestão de Células
3. Modo Escuro completo

### Q4 2025 (Out-Dez)
1. Features baseadas em feedback dos usuários
2. Refinamentos e otimizações
3. Planejamento para 2026

---

## 💡 Como Contribuir com Ideias

Tem uma ideia? Adicione aqui:

1. Fork o repositório
2. Adicione sua ideia neste arquivo
3. Categorize por prioridade
4. Explique problema + solução
5. Abra um PR

Ou simplesmente crie uma issue no GitHub com a tag `feature-request`!

---

## 📚 Referências e Inspirações

- **Sistemas similares**: Planning Center, Breeze, ChurchTrac
- **Design patterns**: Dashboard padrões SaaS
- **UX**: Material Design, shadcn/ui guidelines

---

## 🌐 MELHORIAS DO SITE PÚBLICO (SITE PRINCIPAL)

> **Adicionado em**: 09/11/2025
> **Status Atual**: Site muito básico, apenas homepage parcial funcionando

### 📊 Estado Atual do Site

**Páginas Existentes:**
- ✅ `/` (Homepage) - Parcialmente completa (hero com vídeo + endereço + placeholders)
- ❌ `/quem-somos` - Página vazia (apenas placeholder)
- ❌ `/blog` - Página vazia (apenas placeholder)
- ❌ `/ofertas` - Página vazia (apenas placeholder)

**Páginas Faltando:**
- ❌ `/programacao` (GC's) - Referenciada no menu mas não existe
- ❌ `/contato` - Referenciada no menu mas não existe

**Componentes:**
- ❌ Menu mobile (hamburger) - Não existe
- ❌ Footer completo - Apenas "Todos os direitos reservados"
- ❌ Componentes reutilizáveis de seções - Nenhum criado

---

### 🎯 FASE 1: FUNDAÇÃO (URGENTE) 🟢

**Objetivo**: Criar estrutura básica funcional do site

#### 1.1 Menu Mobile (Hamburger) 🟢
**Problema**: Navegação quebra em dispositivos móveis

**Solução**:
- Implementar Sheet component (shadcn/ui)
- Menu hamburguer com animação
- Links funcionais para todas as páginas
- Design responsivo

**Complexidade**: Baixa
**Impacto**: Alto (mobile representa 60%+ do tráfego)

---

#### 1.2 Footer Completo 🟢
**Problema**: Footer atual tem apenas copyright

**Solução**: Footer com 3 colunas + rodapé
```
Coluna 1: Sobre
- Logo da igreja
- Descrição curta (1-2 linhas)
- Redes sociais (ícones grandes)

Coluna 2: Links Rápidos
- Quem Somos
- Programação
- Blog
- Contato
- Dízimos e Ofertas

Coluna 3: Contato
- 📍 Endereço
- 📞 Telefone
- ✉️ Email
- 🕐 Horários dos cultos

Rodapé Final:
- © 2025 Igreja Viva Esperança
- "Desenvolvido com ❤️" (opcional)
```

**Complexidade**: Baixa
**Impacto**: Médio-Alto (informações essenciais)

---

#### 1.3 Página de Contato (`/contato`) 🟢
**Problema**: Página não existe mas está no menu

**Elementos**:
- Formulário de contato (Nome, Email, Telefone, Mensagem)
- Server Action para envio (usar tabela `message`)
- Informações de contato (telefone, email, endereço)
- Mapa integrado (reutilizar do home)
- Links para redes sociais

**Complexidade**: Baixa-Média
**Impacto**: Alto (essencial para conversão)

---

#### 1.4 Página de Ofertas (`/ofertas`) 🟢
**Problema**: Página vazia, precisa de informações de doação

**Elementos**:
- Métodos de doação:
  - PIX com QR Code gerado
  - Dados bancários
  - Transferência/TED
- 2-3 versículos sobre generosidade (design visual)
- Mensagem sobre transparência e uso das ofertas
- Link para relatórios (opcional, fase futura)

**Complexidade**: Baixa
**Impacto**: Alto (facilita doações)

---

#### 1.5 Melhorias no Hero (Homepage) 🟢
**Problema**: Hero atual tem apenas texto estático

**Adicionar**:
- **2-3 CTAs (Call-to-Action)**:
  - "Participe dos Cultos" → Link para programação
  - "Conheça Nossa História" → Link para Quem Somos
  - "Faça Parte" → Link para contato/visitantes
- **Horários dos cultos** visíveis no hero
- **Animação de entrada** (fade in) no texto
- Melhorar contraste do overlay

**Complexidade**: Baixa
**Impacto**: Alto (primeiras impressões)

---

### 🚀 FASE 2: CONTEÚDO (IMPORTANTE) 🟡

**Objetivo**: Preencher páginas com conteúdo relevante e criar sections da homepage

#### 2.1 Completar Página "Quem Somos" 🟡

**Seções a criar**:
1. **História da Igreja**
   - Como começou, fundadores, timeline
   - Fotos históricas

2. **Missão, Visão e Valores**
   - Declaração clara do propósito
   - Cards visuais

3. **Nossa Crença**
   - Declaração de fé (doutrina)
   - Accordion/Collapsible para organização

4. **Liderança**
   - Fotos e nomes dos pastores/líderes
   - Grid de cards com foto + nome + cargo

**Complexidade**: Baixa (depende de conteúdo fornecido)
**Impacto**: Alto (essencial para credibilidade)

---

#### 2.2 Section "Próximos Eventos" (Homepage) 🟡

**Integração**: Usar `/api/next-events` (já existe!)

**Design**:
- Card moderno mostrando:
  - Data e hora
  - Nome do evento
  - Descrição curta
  - Botão "Quero Participar" (abre form de visitante)
- Limite: 3-4 próximos eventos
- Grid responsivo

**Complexidade**: Baixa-Média
**Impacto**: Alto (mostra vida ativa da igreja)

---

#### 2.3 Section "Nossos Valores" (Homepage) 🟡

**Design**:
- Grid com 3-4 cards apresentando:
  - 📖 Bíblica
  - 🤝 Acolhedora
  - ❤️ Generosa
  - ✝️ Comunidade
- Cada card: Ícone + Título + Descrição curta
- Hover effects

**Complexidade**: Baixa
**Impacto**: Médio (reforça identidade)

---

#### 2.4 Section "Ministérios/Setores" (Homepage) 🟡

**Showcase dos setores**:
- 🎵 Louvor
- 📹 Mídia
- 👶 Infantil
- 🤝 Social
- 📢 Geral

**Design**:
- Cards com ícone, nome e descrição
- Botão "Saiba Mais" ou "Quero Servir"
- Grid responsivo

**Complexidade**: Baixa
**Impacto**: Médio (engajamento de voluntários)

---

### 🎨 FASE 3: ENGAJAMENTO (MÉDIO PRAZO) 🟡

**Objetivo**: Criar features que aumentam engajamento e conversão

#### 3.1 Sistema de Blog Completo 🟡

**Schema Supabase**:
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES members(id),
  category VARCHAR(100),
  published_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE post_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);
```

**Features**:
- **Homepage do Blog** (`/blog`)
  - Grid de cards com posts recentes
  - Filtro por categoria (pregações, eventos, testemunhos)
  - Pesquisa
  - Paginação

- **Página Individual** (`/blog/[slug]`)
  - Formatação rica (markdown/rich text)
  - Compartilhamento social
  - Posts relacionados
  - Comentários (opcional)

**Complexidade**: Média
**Impacto**: Alto (conteúdo atrai visitantes)

---

#### 3.2 Formulário de Visitante 🟡

**Integração**: Usar tabela `visitors` (já existe!)

**Features**:
- Modal ou página dedicada
- Campos: Nome, WhatsApp, Email, "É primeira vez?", "Como conheceu?"
- Trigger: Botão no hero ou seção CTA
- Confirmação por email/WhatsApp (opcional)

**Complexidade**: Baixa-Média
**Impacto**: Alto (captura leads)

---

#### 3.3 Section "Depoimentos" (Homepage) 🟡

**Design**:
- 2-3 testemunhos de membros
- Card com foto, nome, e citação
- Carrossel ou grid estático
- Humaniza a igreja e cria conexão

**Conteúdo**: Pode ser hardcoded ou vir de tabela Supabase

**Complexidade**: Baixa
**Impacto**: Médio-Alto (prova social)

---

#### 3.4 Integração com Redes Sociais 🟡

**Features**:
- Section "Instagram Feed" (últimos posts)
- Embed de vídeos do YouTube (pregações)
- Botões grandes para redes sociais no footer
- Share buttons em posts do blog

**Complexidade**: Baixa-Média (depende de APIs)
**Impacto**: Médio (aumenta engajamento)

---

### ✨ FASE 4: POLIMENTO (LONGO PRAZO) 🔵

**Objetivo**: Refinamentos e otimizações avançadas

#### 4.1 Animações de Scroll 🔵

**Biblioteca**: AOS, Framer Motion, ou CSS @keyframes

**Efeitos**:
- Fade in ao scroll
- Slide up em sections
- Parallax no hero
- Hover effects em cards

**Complexidade**: Baixa
**Impacto**: Baixo-Médio (polish visual)

---

#### 4.2 Otimização SEO Completa 🔵

**Features**:
- Meta tags em todas as páginas (title, description, keywords)
- Open Graph para compartilhamento social
- JSON-LD structured data (Organization schema)
- Sitemap.xml automático
- robots.txt configurado
- Canonical URLs
- Alt text em todas as imagens

**Complexidade**: Baixa-Média
**Impacto**: Alto (visibilidade no Google)

---

#### 4.3 Toggle Modo Claro/Escuro 🔵

**Status**: Dark mode já é padrão

**Adicionar**:
- Toggle no header (sol/lua icon)
- Persistir preferência (localStorage)
- Testar contraste em ambos os modos
- Smooth transition entre temas

**Complexidade**: Baixa
**Impacto**: Baixo-Médio (preferência do usuário)

---

#### 4.4 Newsletter Signup 🔵

**Features**:
- Input simples (nome + email)
- Integração com serviço de email (Resend, SendGrid)
- Ou salvar em tabela Supabase para envio manual
- Confirmação double opt-in

**Complexidade**: Média
**Impacto**: Médio (construção de lista)

---

#### 4.5 Busca Global 🔵

**Features**:
- Pesquisar blog posts, eventos, páginas
- Componente Command (Cmd+K) do shadcn/ui
- Resultados em tempo real
- Atalhos de teclado

**Complexidade**: Média
**Impacto**: Baixo-Médio (conveniência)

---

#### 4.6 Calendário de Eventos (Página Dedicada) 🔵

**Features**:
- Visualização de calendário mensal
- Integração com tabela `events`
- Componente Calendar do shadcn/ui
- Filtros por tipo de evento
- Exportar para Google Calendar (iCal)

**Complexidade**: Média
**Impacto**: Médio (organização visual)

---

### 🏗️ COMPONENTES A CRIAR

**Estrutura sugerida**:
```
src/components/site/
├── Hero.tsx                 # Hero section com props
├── EventsSection.tsx        # Próximos eventos
├── ValuesSection.tsx        # Valores da igreja
├── MinistriesSection.tsx    # Setores/Ministérios
├── TestimonialsSection.tsx  # Depoimentos
├── SocialFeed.tsx          # Redes sociais
├── CTASection.tsx          # Call-to-action
├── BlogCard.tsx            # Card de post
├── EventCard.tsx           # Card de evento
├── MinistryCard.tsx        # Card de ministério
├── ContactForm.tsx         # Formulário de contato
├── VisitorForm.tsx         # Formulário de visitante
└── Newsletter.tsx          # Signup de newsletter
```

**Padrão**: Server Components por padrão, Client Components apenas quando necessário

---

### 🎨 DESIGN SYSTEM - MELHORIAS

#### Cores

**Atual**: Tema dark neutro (oklch)

**Sugestões**:
1. **Adicionar cor de destaque (accent)**
   - Azul/Verde/Dourado para CTAs
   - Exemplo: `bg-blue-600 hover:bg-blue-700`

2. **Tema duplo (Light/Dark toggle)**
   - Algumas pessoas preferem light mode
   - Implementar switch persistente

#### Tipografia

- ✅ Poppins está ótimo (já configurado)
- ➕ Aumentar tamanhos de headings (H1: 4xl-6xl)
- ➕ Usar `font-bold` consistentemente em títulos

#### Espaçamento

- Aumentar padding entre sections (py-16 ou py-20)
- Usar `max-w-7xl` como container padrão (já configurado)
- Respiração visual adequada

---

### 🔧 MELHORIAS TÉCNICAS

#### Header (HeaderMain.tsx)

**Problemas**:
- ❌ Sem menu mobile (hamburger)
- ❌ Links quebrados (Programação, Contato)

**Melhorias**:
- ✅ Menu hamburguer em mobile (Sheet)
- ✅ Botão "Área Restrita" destacado (→ /admin)
- ✅ Sticky header com blur ao scroll
- ✅ Logo clicável retornando para home
- ✅ Indicador visual de página ativa

#### Performance

- ✅ Lazy load do vídeo do hero
- ✅ Otimizar imagens (Next.js Image component)
- ✅ Prefetch de links importantes
- ✅ Code splitting automático (Next.js)

#### Acessibilidade

- ✅ Alt text em todas as imagens
- ✅ ARIA labels em navegação
- ✅ Contraste adequado (WCAG AA)
- ✅ Navegação por teclado (Tab funcional)
- ✅ Skip to main content link

---

### 📊 PRIORIZAÇÃO - ROADMAP SUGERIDO

#### Sprint 1 (1-2 semanas) - FUNDAÇÃO 🟢
1. Menu mobile (hamburger)
2. Footer completo
3. Página `/contato`
4. Página `/ofertas`
5. Melhorar hero com CTAs

**Objetivo**: Site 100% funcional e navegável

---

#### Sprint 2 (2-3 semanas) - CONTEÚDO 🟡
6. Completar `/quem-somos`
7. Section "Próximos Eventos" (homepage)
8. Section "Valores" (homepage)
9. Section "Ministérios" (homepage)

**Objetivo**: Homepage completa e informativa

---

#### Sprint 3 (3-4 semanas) - ENGAJAMENTO 🟡
10. Sistema de blog completo
11. Formulário de visitante
12. Section de depoimentos
13. Integração com redes sociais

**Objetivo**: Aumentar conversão e engajamento

---

#### Sprint 4 (2-3 semanas) - POLIMENTO 🔵
14. Animações de scroll
15. Otimização SEO completa
16. Toggle dark/light mode
17. Newsletter signup

**Objetivo**: Site profissional e otimizado

---

### 🎯 MÉTRICAS DE SUCESSO

**Como medir impacto**:
- Taxa de conversão de visitante (form submissions)
- Tempo médio no site (Google Analytics)
- Taxa de rejeição (bounce rate)
- Páginas por sessão
- Cliques em CTAs
- Inscrições na newsletter
- Tráfego mobile vs desktop

---

### 💡 REFERÊNCIAS DE DESIGN

**Sites de igrejas modernas para inspiração**:
- **Hillsong**: hillsong.com (design limpo, vídeos)
- **Elevation Church**: elevationchurch.org (CTAs fortes)
- **Life.Church**: life.church (UX excepcional)
- **Bethel Church**: bethel.com (estética moderna)

**Bibliotecas UI**:
- shadcn/ui (já configurado) ✅
- Lucide Icons (já configurado) ✅
- Tailwind CSS (já configurado) ✅

---

### 📝 NOTAS IMPORTANTES

**Convenções do Projeto**:
- Todos os textos em **Português (Brasil)**
- Server Components por padrão
- Client Components apenas quando necessário (`"use client"`)
- Imports absolutos com alias `@/`
- Tailwind para estilização
- shadcn/ui para componentes

**Estrutura de Pastas**:
```
src/
├── app/
│   ├── (site)/          # Páginas públicas
│   │   ├── page.tsx     # Homepage
│   │   ├── blog/
│   │   ├── quem-somos/
│   │   ├── ofertas/
│   │   ├── contato/     # A CRIAR
│   │   └── programacao/ # A CRIAR
│   └── (admin)/         # Painel admin (já existe)
├── components/
│   ├── site/            # A CRIAR (componentes públicos)
│   ├── ui/              # shadcn/ui (já existe)
│   ├── HeaderMain.tsx
│   └── FooterMain.tsx
└── lib/
    ├── format.ts        # Utilitários
    └── utils.ts
```

---

**Última atualização**: 09/11/2025
**Seção adicionada por**: Claude Code
**Status**: Planejamento completo - Pronto para implementação

---

**Última atualização**: 08/01/2025
**Mantido por**: Equipe de Desenvolvimento
