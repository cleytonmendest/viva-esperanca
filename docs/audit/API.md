# 🔧 API Reference - Sistema de Auditoria

> Referência completa de todas as funções disponíveis para auditoria.

---

## 📍 Localização

**Arquivo:** `src/lib/audit.ts`

**Imports:**
```typescript
import {
  logAction,
  logTaskAssignment,
  logTaskRemoval,
  logEventAction,
  logMemberAction,
  logVisitorSubmission
} from '@/lib/audit';
```

---

## 🎯 Função Principal

### `logAction()`

Função base para registrar qualquer ação no sistema.

**Assinatura:**
```typescript
async function logAction({
  actionType,
  resourceType,
  resourceId,
  details,
  userId,
  memberName,
}: LogActionParams): Promise<void>
```

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `actionType` | `ActionType` | ✅ Sim | Tipo da ação executada |
| `resourceType` | `ResourceType` | ✅ Sim | Tipo de recurso afetado |
| `resourceId` | `string` | ❌ Não | UUID do recurso afetado |
| `details` | `Record<string, JsonValue>` | ❌ Não | Detalhes adicionais em JSON |
| `userId` | `string` | ❌ Não | UUID do usuário (se omitido, busca automaticamente) |
| `memberName` | `string` | ❌ Não | Nome do membro (se omitido, busca automaticamente) |

**Tipos Disponíveis:**

```typescript
type ActionType =
  | 'task_assigned'        // Líder atribui tarefa
  | 'task_removed'         // Tarefa removida
  | 'task_self_assigned'   // Membro assume tarefa
  | 'event_created'        // Evento criado
  | 'event_updated'        // Evento editado
  | 'event_deleted'        // Evento deletado
  | 'member_created'       // Membro cadastrado
  | 'member_updated'       // Membro editado
  | 'member_deleted'       // Membro removido
  | 'member_approved'      // Membro aprovado
  | 'visitor_submitted'    // Visitante cadastrado
  | 'visitor_updated'      // Visitante editado
  | 'visitor_deleted';     // Visitante removido

type ResourceType =
  | 'event'               // Eventos/cultos
  | 'task'                // Tarefas (templates)
  | 'member'              // Membros
  | 'visitor'             // Visitantes
  | 'event_assignment';   // Atribuições
```

**Exemplo de uso:**

```typescript
await logAction({
  actionType: 'event_created',
  resourceType: 'event',
  resourceId: 'event-uuid',
  details: {
    event_name: 'Culto de Domingo',
    event_date: '2025-01-05',
  },
  // userId e memberName omitidos - busca automaticamente quem está logado
});
```

**Comportamento:**
- ✅ Se `userId` ou `memberName` omitidos, busca automaticamente do usuário autenticado
- ✅ Se falhar, **não quebra a operação principal** (fail-safe)
- ✅ Logs de erro vão para `console.error`

---

## 🎯 Helper Functions

### 1. `logTaskAssignment()`

Registra atribuição de tarefa (manual ou auto-atribuição).

**Assinatura:**
```typescript
async function logTaskAssignment({
  eventId,
  eventName,
  taskId,
  taskName,
  memberId,
  memberName,
  assignedToMemberName,
  assignedBy,
  isSelfAssigned,
}: {
  eventId: string;
  eventName: string;
  taskId: string;
  taskName: string;
  memberId: string;
  memberName?: string;           // Quem FEZ a atribuição (opcional)
  assignedToMemberName?: string; // Quem RECEBEU a tarefa
  assignedBy?: string;           // UUID de quem atribuiu (opcional)
  isSelfAssigned?: boolean;      // Default: false
}): Promise<void>
```

**Exemplo - Atribuição por líder:**

```typescript
await logTaskAssignment({
  eventId: "event-uuid",
  eventName: "Culto de Domingo",
  taskId: "task-uuid",
  taskName: "Operador de Som",
  memberId: "member-uuid",
  assignedToMemberName: "João Silva", // Quem recebeu
  isSelfAssigned: false,
  // memberName omitido → busca automaticamente quem está logado (líder)
});
```

**Exemplo - Auto-atribuição:**

```typescript
await logTaskAssignment({
  eventId: "event-uuid",
  eventName: "Culto de Domingo",
  taskId: "task-uuid",
  taskName: "Operador de Som",
  memberId: "member-uuid",
  memberName: "João Silva",           // Quem fez = quem recebeu
  assignedToMemberName: "João Silva", // Mesma pessoa
  isSelfAssigned: true,
});
```

**Action Type gerado:**
- `isSelfAssigned: true` → `task_self_assigned`
- `isSelfAssigned: false` → `task_assigned`

---

### 2. `logTaskRemoval()`

Registra remoção de tarefa atribuída.

**Assinatura:**
```typescript
async function logTaskRemoval({
  eventId,
  eventName,
  taskId,
  taskName,
  memberId,
  removedFromMemberName,
}: {
  eventId: string;
  eventName: string;
  taskId: string;
  taskName: string;
  memberId: string;
  removedFromMemberName: string; // Nome de quem TINHA a tarefa
}): Promise<void>
```

**Exemplo:**

```typescript
await logTaskRemoval({
  eventId: "event-uuid",
  eventName: "Culto de Domingo",
  taskId: "task-uuid",
  taskName: "Operador de Som",
  memberId: "member-uuid",
  removedFromMemberName: "João Silva", // Quem tinha a tarefa removida
  // memberName omitido → busca quem está logado (quem removeu)
});
```

**Action Type gerado:** `task_removed`

---

### 3. `logEventAction()`

Registra criação, edição ou deleção de evento.

**Assinatura:**
```typescript
async function logEventAction({
  action,
  eventId,
  eventName,
  eventData,
}: {
  action: 'created' | 'updated' | 'deleted';
  eventId: string;
  eventName: string;
  eventData?: Record<string, JsonValue>;
}): Promise<void>
```

**Exemplo - Criação:**

```typescript
await logEventAction({
  action: 'created',
  eventId: "event-uuid",
  eventName: "Culto de Jovens",
  eventData: {
    event_date: '2025-01-10',
    description: 'Culto especial para jovens',
  },
});
```

**Exemplo - Edição:**

```typescript
await logEventAction({
  action: 'updated',
  eventId: "event-uuid",
  eventName: "Culto de Jovens",
  eventData: {
    changes: {
      event_date: '2025-01-15', // Nova data
    },
  },
});
```

**Action Type gerado:**
- `action: 'created'` → `event_created`
- `action: 'updated'` → `event_updated`
- `action: 'deleted'` → `event_deleted`

---

### 4. `logMemberAction()`

Registra ações em membros (criação, edição, deleção, aprovação).

**Assinatura:**
```typescript
async function logMemberAction({
  action,
  memberId,
  memberName,
  changes,
}: {
  action: 'created' | 'updated' | 'deleted' | 'approved';
  memberId: string;
  memberName: string;
  changes?: Record<string, JsonValue>;
}): Promise<void>
```

**Exemplo - Aprovação de membro:**

```typescript
await logMemberAction({
  action: 'approved',
  memberId: "member-uuid",
  memberName: "João Silva",
  changes: {
    role: 'membro',        // Mudou de 'pendente'
    status: 'ativo',
  },
});
```

**Action Type gerado:**
- `action: 'created'` → `member_created`
- `action: 'updated'` → `member_updated`
- `action: 'deleted'` → `member_deleted`
- `action: 'approved'` → `member_approved`

---

### 5. `logVisitorSubmission()`

Registra submissão de formulário de visitante.

**Assinatura:**
```typescript
async function logVisitorSubmission({
  visitorId,
  visitorName,
  visitorData,
}: {
  visitorId: string;
  visitorName: string;
  visitorData?: Record<string, JsonValue>;
}): Promise<void>
```

**Exemplo:**

```typescript
await logVisitorSubmission({
  visitorId: "visitor-uuid",
  visitorName: "Maria Santos",
  visitorData: {
    first_time: true,
    event_name: 'Culto de Domingo',
    how_found_church: 'Instagram',
    visitor_city: 'Rio de Janeiro',
  },
});
```

**Action Type gerado:** `visitor_submitted`

**Observação:**
- `userId` será `null` (visitante não tem conta)
- `memberName` será o nome do visitante

---

## 📊 Queries para Leitura de Logs

**Arquivo:** `src/app/(admin)/admin/queries/index.ts`

### 1. `getRecentAuditLogs()`

Retorna logs mais recentes com paginação.

```typescript
async function getRecentAuditLogs(
  limit: number = 50,
  offset: number = 0
): Promise<{ logs: AuditLog[], total: number }>
```

**Exemplo:**
```typescript
const { logs, total } = await getRecentAuditLogs(50, 0);
// logs = array de 50 logs
// total = total de logs na tabela
```

---

### 2. `getAuditLogsByActionType()`

Filtra logs por tipo de ação.

```typescript
async function getAuditLogsByActionType(
  actionType: string,
  limit: number = 50
): Promise<AuditLog[]>
```

**Exemplo:**
```typescript
const logs = await getAuditLogsByActionType('task_self_assigned', 100);
// Retorna últimas 100 auto-atribuições
```

---

### 3. `getAuditLogsByMember()`

Retorna logs de um membro específico.

```typescript
async function getAuditLogsByMember(
  userId: string,
  limit: number = 50
): Promise<AuditLog[]>
```

**Exemplo:**
```typescript
const logs = await getAuditLogsByMember('user-uuid', 50);
// Últimas 50 ações desse membro
```

---

### 4. `getMemberEngagementStats()`

Estatísticas de engajamento de membros.

```typescript
async function getMemberEngagementStats(
  period: string = '30d'
): Promise<{
  userId: string;
  name: string;
  tasks: number;
  selfAssigned: number;
}[]>
```

**Períodos válidos:** `'7d'`, `'30d'`, `'3m'`, `'6m'`, `'1y'`

**Exemplo:**
```typescript
const stats = await getMemberEngagementStats('30d');
// [
//   { userId: '...', name: 'João Silva', tasks: 15, selfAssigned: 12 },
//   { userId: '...', name: 'Maria Santos', tasks: 10, selfAssigned: 8 },
// ]
```

---

### 5. `getDashboardActivities()`

Atividades recentes para exibir no dashboard.

```typescript
async function getDashboardActivities(
  limit: number = 10
): Promise<AuditLog[]>
```

**Exemplo:**
```typescript
const activities = await getDashboardActivities(5);
// Últimas 5 atividades para widget do dashboard
```

---

## 🔍 Tipos TypeScript

### `JsonValue`

Tipo recursivo para dados JSON flexíveis:

```typescript
type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonValue[]
  | { [key: string]: JsonValue };
```

**Por que usar?**
- ✅ Aceita `undefined` (campos opcionais)
- ✅ Aceita objetos aninhados
- ✅ Aceita arrays
- ✅ 100% compatível com tipo `Json` do Supabase

---

## 💡 Boas Práticas

### ✅ DO (Faça):

```typescript
// ✅ Busque dados antes de logar
const { data: event } = await supabase
  .from('events')
  .select('name')
  .eq('id', eventId)
  .single();

await logEventAction({
  action: 'created',
  eventId,
  eventName: event?.name || 'Evento',
  // ...
});

// ✅ Use helpers específicos quando disponíveis
await logTaskAssignment({ ... }); // Melhor que logAction diretamente

// ✅ Omita userId/memberName (busca automaticamente)
await logAction({
  actionType: 'event_created',
  resourceType: 'event',
  // userId e memberName omitidos
});
```

### ❌ DON'T (Não faça):

```typescript
// ❌ Não passe dados hardcoded
await logAction({
  details: {
    event_name: 'Evento', // Muito genérico
  },
});

// ❌ Não confunda "quem fez" com "quem recebeu"
await logTaskAssignment({
  memberName: assignedToMember, // ❌ Errado!
  assignedToMemberName: assignedToMember, // ✅ Correto
});

// ❌ Não use logAction diretamente se existe helper
await logAction({ actionType: 'task_assigned', ... });
// ✅ Use: await logTaskAssignment({ ... });
```

---

## 🛠️ Adicionar Novo Tipo de Ação

1. **Adicione o tipo em `audit.ts`:**
   ```typescript
   type ActionType =
     | 'task_assigned'
     | 'minha_nova_acao'  // ← Adicione aqui
     | ...
   ```

2. **Crie helper específico (opcional):**
   ```typescript
   export async function logMinhaNovaAcao({ ... }) {
     await logAction({
       actionType: 'minha_nova_acao',
       resourceType: 'tipo_do_recurso',
       details: { ... }
     });
   }
   ```

3. **Integre no action relevante:**
   ```typescript
   export async function minhaAction() {
     // ... lógica ...
     await logMinhaNovaAcao({ ... });
     return { success: true };
   }
   ```

4. **Documente aqui no API.md**

5. **Teste** (veja [TESTING.md](./TESTING.md))

---

**Dúvidas?** Consulte [IMPLEMENTATION.md](./IMPLEMENTATION.md) para detalhes técnicos.
