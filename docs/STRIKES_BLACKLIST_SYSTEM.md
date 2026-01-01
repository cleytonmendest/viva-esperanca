# Sistema de Strikes e Blacklist para WhatsApp

## 🎯 Objetivo

Implementar sistema automático de strikes para proteger número de WhatsApp contra bloqueio por spam, baseado em não-resposta de membros.

## 📋 Requisitos Definidos

1. **Contagem de Strikes**: Ao ENVIAR mensagem, incrementar +1 strike imediatamente (antes de verificar resposta)
2. **Reset de Strikes**: Qualquer resposta do membro zera TODOS os strikes automaticamente
3. **Blacklist Automático**: Aos 3 strikes, membro entra em blacklist e NÃO recebe mais mensagens
4. **Rastreamento**: Webhook recebendo TODAS as mensagens via Evolution API para detectar respostas
5. **Interface Admin**:
   - Botão toggle blacklist na tabela de membros
   - Histórico de strikes no dialog de edição
   - Página dedicada `/admin/blacklist`
   - Notificação automática para líderes quando membro atingir 3 strikes

## 🏗️ Arquitetura

### Fluxo Completo
```
n8n → POST /api/messages/send → Evolution API → Registra message_log → +1 strike
                                                                          ↓
                                                                   (3 strikes?)
                                                                          ↓
                                                              Blacklist + Notifica Líderes

Evolution API → Webhook → POST /api/webhook/whatsapp → Identifica membro → Reseta strikes
```

### Novas Tabelas

**`member_strikes`**
- `member_id` (FK), `strike_count` (0-3), `last_strike_at`, `blacklisted_at`, `blacklist_reason`
- Constraint: `UNIQUE(member_id)`, `CHECK (strike_count >= 0 AND strike_count <= 3)`

**`message_log`**
- `member_id`, `phone`, `message_content`, `whatsapp_message_id`, `status` (sent/responded/failed)
- `sent_at`, `responded_at`, `response_window_end` (GENERATED: sent_at + 48h)
- Rastreia todas as mensagens enviadas e suas respostas

**`incoming_messages`** (Deduplicação de Webhook)
- `whatsapp_message_id` (UNIQUE), `phone`, `message_content`, `is_group`, `processed`
- Evita processar mesma mensagem múltiplas vezes

**`members` (alterações)**
- Adicionar: `is_blacklisted` (BOOLEAN DEFAULT false), `blacklisted_at` (TIMESTAMPTZ)

### Database Functions (PostgreSQL)

```sql
-- Incrementa strike e ativa blacklist aos 3
increment_member_strike(p_member_id UUID)

-- Zera strikes e remove blacklist
reset_member_strikes(p_member_id UUID)

-- Processa resposta recebida via webhook (janela de 48h)
process_member_response(p_phone VARCHAR)

-- Lista membros elegíveis para envio (não blacklisted)
get_members_for_messaging()
```

## 🔌 Endpoints API

### 1. `POST /api/messages/send` (n8n → Next.js)
**Auth**: Bearer token (`N8N_API_SECRET`)

**Request**:
```json
{
  "member_id": "uuid",
  "phone": "5521999998888",
  "message": "Lembrete: culto amanhã 19h"
}
```

**Response**:
```json
{
  "status": "sent" | "blocked",
  "message_id": "whatsapp-id",
  "strike_count": 2,
  "reason": "Member is blacklisted" (se bloqueado)
}
```

**Fluxo**:
1. Validar membro não está em blacklist
2. Enviar via Evolution API
3. Registrar em `message_log`
4. Chamar `increment_member_strike()`
5. Se atingiu 3 strikes → notificar líderes via WhatsApp

### 2. `POST /api/webhook/whatsapp` (Evolution API → Next.js)
**Auth**: Header `x-evolution-api-secret`

**Payload** (Evolution API):
```json
{
  "messageId": "BAE5...",
  "from": "5521999998888@s.whatsapp.net",
  "message": { "conversation": "Oi, confirmado!" },
  "isGroup": false,
  "timestamp": 1234567890
}
```

**Fluxo**:
1. Validar webhook secret
2. Ignorar se `isGroup === true`
3. Extrair número (remover `@s.whatsapp.net`)
4. Deduplicar por `messageId` em `incoming_messages`
5. Chamar `process_member_response(phone)`
6. Marca mensagens pendentes como respondidas
7. Reseta strikes automaticamente

### 3. `GET /api/blacklist`
Listar membros em blacklist (usado pela página `/admin/blacklist`)

## 📁 Arquivos Críticos

### Migrations
- `supabase/migrations/20250101000010_create_strikes_system.sql` - Criar tabelas e índices
- `supabase/migrations/20250101000011_create_strike_functions.sql` - Funções PostgreSQL
- `supabase/migrations/20250101000012_add_blacklist_page_permission.sql` - Adicionar ao menu

### APIs
- `src/app/api/messages/send/route.ts` - Endpoint para n8n enviar mensagens
- `src/app/api/webhook/whatsapp/route.ts` - Webhook Evolution API (Edge Runtime)
- `src/app/api/blacklist/route.ts` - Listar membros bloqueados

### Actions
- `src/app/(admin)/admin/actions/blacklist.ts`:
  - `toggleMemberBlacklist(memberId, reason?)` - Toggle manual
  - `resetMemberStrikes(memberId)` - Reset manual

### Queries
- `src/app/(admin)/admin/queries/blacklist.ts`:
  - `getMemberStrikeHistory(memberId)` - Histórico de mensagens
  - `getBlacklistedMembers()` - Lista de bloqueados
  - `getMemberStrikes(memberId)` - Strikes atuais

### Componentes
- `src/app/(admin)/admin/members/components/MembersTable.tsx` - Adicionar coluna Blacklist + botão toggle
- `src/app/(admin)/admin/members/components/StrikeHistoryDialog.tsx` - Dialog com timeline de mensagens
- `src/app/(admin)/admin/blacklist/page.tsx` - Página dedicada
- `src/app/(admin)/admin/blacklist/components/BlacklistTable.tsx` - Tabela com botão desbloquear

## 🚀 Fases de Implementação

### FASE 1: Fundação (CRÍTICO)
**Objetivo**: Schema do banco + funções

1. Criar migration `20250101000010_create_strikes_system.sql`
   - Tabelas: `member_strikes`, `message_log`, `incoming_messages`
   - Campos: `members.is_blacklisted`, `members.blacklisted_at`
   - Índices e RLS policies

2. Criar migration `20250101000011_create_strike_functions.sql`
   - Funções PostgreSQL (increment, reset, process_response)

3. Rodar `npm run gen:types`

**Entregável**: Schema pronto ✅

---

### FASE 2: APIs (CRÍTICO)
**Objetivo**: Comunicação n8n ↔ Next.js ↔ Evolution API

1. `src/app/api/webhook/whatsapp/route.ts`
   - Edge Runtime
   - Validação de secret
   - Deduplicação
   - Processamento de respostas

2. `src/app/api/messages/send/route.ts`
   - Validação de blacklist
   - Envio via Evolution API
   - Registro em `message_log`
   - Incremento de strikes
   - Notificação para líderes

3. `src/app/api/blacklist/route.ts`
   - Listar bloqueados

**Entregável**: APIs funcionais ✅

---

### FASE 3: Server Actions & Queries (ALTO)
**Objetivo**: Lógica backend para interface

1. `src/app/(admin)/admin/actions/blacklist.ts`
2. `src/app/(admin)/admin/queries/blacklist.ts`

**Entregável**: Actions prontas ✅

---

### FASE 4: Interface Admin (MÉDIO)
**Objetivo**: UI para gerenciar blacklist

1. Atualizar `MembersTable.tsx`
   - Coluna Blacklist
   - Badge status
   - Botão toggle

2. Criar `StrikeHistoryDialog.tsx`
   - Timeline de mensagens
   - Status (respondido/pendente)

3. Atualizar `EditMemberDialog.tsx`
   - Botão "Ver Histórico"

4. Criar `/admin/blacklist`
   - `page.tsx`
   - `BlacklistTable.tsx`

5. Migration de permissões de página

**Entregável**: Interface completa ✅

---

### FASE 5: Integração n8n + Evolution API (CRÍTICO)
**Objetivo**: Conectar fluxo end-to-end

1. **n8n**: Atualizar workflow
   - Trocar endpoint para `/api/messages/send`
   - Ajustar payload e headers
   - Tratar `status: "blocked"`

2. **Evolution API**: Configurar webhook
   - URL: `https://seu-dominio.com/api/webhook/whatsapp`
   - Header: `x-evolution-api-secret: <secret>`
   - Eventos: `message.received`

3. **Env vars**:
   ```bash
   EVOLUTION_API_URL=https://...
   EVOLUTION_API_KEY=key
   EVOLUTION_API_SECRET=secret-webhook
   ```

**Entregável**: Fluxo completo funcionando ✅

---

### FASE 6: Refinamentos (BAIXO)
**Objetivo**: Melhorias UX

1. Badge alerta no dashboard
2. Toast notifications
3. Auditoria (`audit_logs`)
4. Documentação (`CLAUDE.md`, `ROADMAP.md`)

**Entregável**: Sistema polido ✅

## ⚠️ Edge Cases

### 1. Membro responde após blacklist
- Sistema reseta strikes automaticamente
- Remove blacklist
- Próxima mensagem será enviada

### 2. Múltiplas respostas simultâneas
- Deduplicação por `whatsapp_message_id`
- Primeira processa, demais ignoradas

### 3. Número não cadastrado
- Webhook registra mas não processa
- `member_id` NULL em `incoming_messages`

### 4. Evolution API offline
- Catch error ao enviar
- NÃO incrementa strike (mensagem não foi enviada)
- Registra `status: 'failed'` em `message_log`

### 5. Janela de 48h expirada
- Resposta NÃO reseta strikes
- Query filtra por `sent_at > NOW() - INTERVAL '48 hours'`

### 6. Mensagem de grupo
- Webhook filtra `isGroup === true`
- Retorna `{ status: 'ignored' }`

## 🔐 Segurança

### RLS Policies

**`member_strikes`**:
- SELECT: Líderes veem tudo, membros veem apenas seus
- INSERT/UPDATE: Apenas via service role (funções)

**`message_log`**:
- SELECT: Líderes veem tudo, membros veem apenas seus
- Sem INSERT/UPDATE para authenticated

**`incoming_messages`**:
- Apenas service role (webhook usa service role key)

### Authentication

- **n8n → `/api/messages/send`**: Bearer token (`N8N_API_SECRET`)
- **Evolution API → `/api/webhook/whatsapp`**: Header `x-evolution-api-secret`
- **Admin UI**: RLS + `roles.is_leadership = true`

## 📊 Métricas de Sucesso

- [ ] Membros recebem +1 strike ao enviar mensagem
- [ ] Strikes resetam automaticamente quando membro responde
- [ ] Blacklist automático aos 3 strikes
- [ ] Webhook processa respostas em <200ms
- [ ] Líderes recebem notificação WhatsApp ao blacklist
- [ ] Interface permite toggle manual de blacklist
- [ ] Histórico de strikes visível
- [ ] Zero duplicatas de processamento
- [ ] n8n integrado e funcional

## 🔮 Melhorias Futuras (Opcional)

1. **Dashboard de Engajamento**: Taxa de resposta, tempo médio, gráficos
2. **Análise de Sentimento**: IA para detectar desinteresse
3. **Templates Inteligentes**: A/B testing, personalização
4. **Sistema de Appeals**: Membro pode solicitar desbloqueio
5. **Gamificação**: Badges, streaks, ranking de engajamento
6. **Automação de Follow-up**: Mensagens escalonadas (24h, 48h)
7. **Relatórios Exportáveis**: PDF, Excel com métricas

## 📝 Variáveis de Ambiente

```bash
# Evolution API (ADICIONAR)
EVOLUTION_API_URL=https://evolution-api-url.com
EVOLUTION_API_KEY=your-api-key
EVOLUTION_API_SECRET=your-webhook-secret

# N8N (JÁ EXISTE)
N8N_API_SECRET=n8n-api-secret

# Supabase (JÁ EXISTEM)
NEXT_PUBLIC_SUPABASE_URL=supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=publishable-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

## 📚 Documentação a Atualizar

1. **`CLAUDE.md`**: Adicionar seção "Sistema de Strikes e Blacklist"
2. **`ROADMAP.md`**: Mover "Sistema de Notificações WhatsApp" para "Concluídas"

---

## ✅ Pronto para Implementação

Este plano está completo e pronto para execução. As fases estão priorizadas e podem ser implementadas incrementalmente, com testes em cada etapa.
