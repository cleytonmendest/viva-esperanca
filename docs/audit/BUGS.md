# 🐛 Bugs e Soluções - Sistema de Auditoria

> Histórico de problemas encontrados e como foram resolvidos.

---

## Bug #1: RLS Policy Impedia Inserção de Logs

**Status:** ✅ Resolvido (29/12/2025)

### Sintoma:
- Ações executadas normalmente (tarefas atribuídas, eventos criados)
- Nenhum log aparecia na tabela `audit_logs`
- Console mostrava erro:
  ```
  new row violates row-level security policy for table "audit_logs"
  code: '42501'
  ```

### Causa Raiz:
- Migration inicial criou política RLS que **só permitia `service_role`** inserir logs
- Código usa **cliente Supabase autenticado** (`createClient()` com anon key)
- Conflito: usuário autenticado tentando inserir onde só service_role pode

### Solução:
**Migration:** `20251229000001_fix_audit_logs_rls.sql`

```sql
-- Remove política antiga
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

-- Nova política: authenticated pode inserir
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Protege contra modificação
CREATE POLICY "Only service role can update audit logs"
ON public.audit_logs
FOR UPDATE
TO service_role
WITH CHECK (true);

CREATE POLICY "Only service role can delete audit logs"
ON public.audit_logs
FOR DELETE
TO service_role
USING (true);
```

### Lições Aprendidas:
- ✅ Sempre testar inserções após criar tabelas com RLS
- ✅ RLS deve estar alinhado com a arquitetura do código
- ✅ Logs são rastreáveis via `user_id`, permitir inserção é seguro
- ✅ Prevenir UPDATE/DELETE para usuários mantém integridade

---

## Bug #2: Campo `member_name` Registrava Membro Errado

**Status:** ✅ Resolvido (29/12/2025)

### Sintoma:
- Logs de atribuição registravam nome de quem **recebeu** no campo `member_name`
- Campo deveria ter nome de quem **fez** a atribuição
- Exemplo incorreto:
  ```json
  {
    "user_id": "cleyton-id",
    "member_name": "Arthur Marins",  // ❌ Errado! Arthur recebeu, Cleyton fez
    "action_type": "task_assigned"
  }
  ```

### Causa Raiz:
- `logTaskAssignment()` recebia `memberName` como quem **recebeu** a tarefa
- Esse `memberName` era passado para `logAction()` que gravava no campo raiz
- Não havia distinção clara entre "ator" (quem fez) e "alvo" (quem recebeu)

### Solução:

**1. Refatorado `logTaskAssignment()`:**

```typescript
export async function logTaskAssignment({
  eventId,
  eventName,
  taskId,
  taskName,
  memberId,
  memberName,           // ← Opcional: quem FEZ
  assignedToMemberName, // ← Quem RECEBEU
  isSelfAssigned = false,
}: { ... }) {
  await logAction({
    actionType: isSelfAssigned ? 'task_self_assigned' : 'task_assigned',
    resourceType: 'event_assignment',
    resourceId: eventId,
    details: {
      assigned_to_member_id: memberId,
      assigned_to_member_name: assignedToMemberName, // Quem recebeu
      // ... outros campos
    },
    memberName, // Quem fez (se omitido, busca automaticamente)
  });
}
```

**2. Aplicado em `updateAssignmentMember()` (atribuição por líder):**

```typescript
await logTaskAssignment({
  // ...
  assignedToMemberName: member?.name, // Arthur (quem recebeu)
  // memberName omitido → logAction busca Cleyton (quem fez)
  isSelfAssigned: false,
});
```

**3. Aplicado em `assignTaskToSelf()` (auto-atribuição):**

```typescript
await logTaskAssignment({
  // ...
  memberName: memberData?.name,        // João (quem fez)
  assignedToMemberName: memberData?.name, // João (quem recebeu)
  isSelfAssigned: true, // Mesma pessoa
});
```

**4. Refatorado também `logTaskRemoval()`:**

```typescript
export async function logTaskRemoval({
  // ...
  removedFromMemberName, // ← Quem TINHA a tarefa
}: { ... }) {
  await logAction({
    actionType: 'task_removed',
    details: {
      removed_from_member_id: memberId,
      removed_from_member_name: removedFromMemberName,
    },
    // memberName omitido → busca automaticamente quem fez a remoção
  });
}
```

### Estrutura Correta do Log:

```json
{
  "user_id": "cleyton-user-id",           // ← Quem FEZ
  "member_name": "Cleyton Mendes",        // ← Quem FEZ
  "action_type": "task_assigned",
  "resource_type": "event_assignment",
  "details": {
    "assigned_to_member_id": "arthur-id", // ← Quem RECEBEU
    "assigned_to_member_name": "Arthur Marins", // ← Quem RECEBEU
    "event_name": "Culto Terça+",
    "task_name": "Telão",
    "is_self_assigned": false
  }
}
```

### Lições Aprendidas:
- ✅ Em auditoria, sempre distinguir "ator" (quem fez) vs. "alvo" (quem/o que foi afetado)
- ✅ Campos raiz (`user_id`, `member_name`) = quem executou a ação
- ✅ Detalhes sobre alvos/destinatários = campo `details` com nomes descritivos
- ✅ Nomear parâmetros claramente: `assignedToMemberName` vs `memberName`
- ✅ Documentar comportamento: "se omitido, busca automaticamente"

---

## Troubleshooting Comum

### Erro: "new row violates row-level security policy"

**Causa:** Políticas RLS não permitem inserção

**Solução:**
1. Verificar se migration `20251229000001_fix_audit_logs_rls.sql` foi executada
2. Executar no Supabase SQL Editor:
   ```sql
   SELECT policyname, cmd, roles
   FROM pg_policies
   WHERE tablename = 'audit_logs';
   ```
3. Deve existir: `Authenticated users can insert audit logs` (INSERT, authenticated)

---

### Logs não aparecem após ações

**Causa possível 1:** RLS bloqueando (ver acima)

**Causa possível 2:** Erro silencioso (log falha mas não quebra operação)

**Solução:**
1. Habilitar logs de debug (temporariamente):
   ```typescript
   // Em src/lib/audit.ts
   console.log('🔍 [AUDIT DEBUG] Log Entry:', logEntry);
   ```
2. Executar ação e verificar console
3. Se não aparecer erro, verificar políticas RLS

---

### Campo `member_name` com valor `null`

**Causa:** Usuário não autenticado OU membro sem perfil na tabela `members`

**Solução:**
1. Verificar se usuário está logado:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User:', user?.id);
   ```
2. Verificar se existe registro em `members`:
   ```sql
   SELECT * FROM members WHERE user_id = 'user-id-aqui';
   ```
3. Se não existir, criar registro ou permitir `null` (visitantes)

---

### TypeScript erro: "Type 'undefined' is not assignable to type 'Json'"

**Causa:** Campos `undefined` no objeto `details`

**Solução:**
Use tipo `JsonValue` que aceita `undefined`:
```typescript
type JsonValue = string | number | boolean | null | undefined | ...;

const details: Record<string, JsonValue> = {
  field: value || undefined, // ✅ OK
};
```

---

**Encontrou um novo bug?** Documente aqui seguindo o padrão:
1. Sintoma
2. Causa Raiz
3. Solução
4. Lições Aprendidas
