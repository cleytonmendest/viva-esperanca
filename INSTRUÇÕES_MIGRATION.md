# Instruções para Aplicar Migration de Soft Delete

## ⚠️ IMPORTANTE: Execute estas etapas antes de testar

### 1. Aplicar Migration no Supabase

Você precisa aplicar a migration que adiciona o campo `deleted_at` à tabela `members`.

**Opção A: Via Supabase CLI (Recomendado)**
```bash
# Se estiver usando local development
npx supabase db push

# Ou se for direto no projeto remoto
npx supabase db push --db-url "sua-connection-string"
```

**Opção B: Via Dashboard do Supabase**
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole e execute o conteúdo do arquivo: `supabase/migrations/20250101000005_add_soft_delete_to_members.sql`

### 2. Regenerar Types TypeScript

Após aplicar a migration, gere os tipos atualizados:

```bash
npm run gen:types
```

Isso irá adicionar o campo `deleted_at` aos tipos do TypeScript.

### 3. Testar

Após executar os passos acima, teste:

1. Acesse `/admin/members` - deve mostrar botão de aprovação se houver membros pendentes
2. Clique no botão para ir para `/admin/members/pending`
3. Teste aprovar um membro (selecione uma role)
4. Teste negar um membro (soft delete - mantém no banco com `deleted_at` preenchido)

## O Que Foi Implementado

### ✅ Middleware Corrigido
- Líderes (`is_leadership = true`) não são mais redirecionados para pending-approval
- Apenas membros pendentes sem privilégios de liderança são redirecionados

### ✅ Query Corrigida
- `getPendingMembers()` agora considera tanto sistema antigo (`role` enum) quanto novo (`role_id` FK)
- Membros deletados (`deleted_at IS NOT NULL`) são excluídos automaticamente

### ✅ Soft Delete Implementado
- Membros negados não são deletados, apenas marcados com `deleted_at`
- Status é alterado para `inativo`
- Dados mantidos para auditoria

### ✅ UI Melhorada
- Botão na página `/admin/members` mostra quantidade de membros pendentes
- Página `/admin/members/pending` lista todos pendentes com ações
- Dialogs para aprovar (escolher role) e negar (com confirmação)

## Estrutura de Arquivos Criados/Modificados

```
src/app/(admin)/admin/
├── members/
│   ├── page.tsx (✏️ modificado - botão pending)
│   └── pending/
│       ├── page.tsx (✨ novo)
│       └── components/
│           ├── ApproveMemberDialog.tsx (✨ novo)
│           └── DenyMemberDialog.tsx (✨ novo)
├── queries/index.ts (✏️ modificado - getPendingMembers + filters)
└── actions/index.ts (✏️ modificado - approveMember + denyMember)

src/middleware.ts (✏️ modificado - isLeadership check)

supabase/migrations/
└── 20250101000005_add_soft_delete_to_members.sql (✨ novo)
```

## Troubleshooting

### "Column 'deleted_at' does not exist"
- Você não aplicou a migration ainda. Execute o passo 1.

### "Type error: Property 'deleted_at' does not exist"
- Você não regenerou os tipos. Execute o passo 2.

### Membros já aprovados aparecem como pendentes
- A query agora está corrigida. Ela verifica:
  - Sistema antigo: `role = 'pendente' AND role_id IS NULL`
  - Sistema novo: `roles.name = 'Pendente'`
- Se um membro tem `role_id` preenchido apontando para uma role não-pendente, ele não aparece como pendente.
