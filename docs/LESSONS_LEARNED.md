# 📚 Lições Aprendidas - Viva Esperança

> Documentação de erros, bugs e aprendizados importantes durante o desenvolvimento do sistema.

---

## 🚨 Nov/2024: Rollback do Sistema de Permissões Dinâmicas

### ❌ O Que Aconteceu

Tentativa de implementar sistema de roles, setores e permissões dinâmicas foi **revertida completamente** devido a bugs críticos de integração.

**Status:** REVERTIDO (migration `20251101000002_rollback_permission_system.sql`)

---

### 🔍 Problema Detalhado

#### Sintomas

1. **UI Admin funcionava perfeitamente:**
   - Matrix de permissões salvava corretamente no BD
   - Tabela `page_role_permissions` tinha os registros corretos
   - Ao marcar que role "lider_midia" podia acessar `/admin/tasks`, o BD mostrava o relacionamento

2. **Porém o sistema NÃO respeitava as permissões:**
   - Sidebar não mostrava páginas permitidas
   - Acesso direto às URLs redirecionava para "unauthorized"
   - Permissões salvas eram **ignoradas** pelo código

#### Causa Raiz

**Desconexão entre UI/BD e código de verificação:**

```
┌──────────────────────────────────┐
│ UI ADMIN (✅ Funcionava)         │
│ - Matrix de permissões           │
│ - Salvava em page_role_perms    │
│ - BD tinha dados corretos        │
└──────────────────────────────────┘
             ↓
      SALVAVA NO BD ✅
             ↓
┌──────────────────────────────────┐
│ BANCO DE DADOS                   │
│ page_role_permissions:           │
│ ┌────────────────────────────┐   │
│ │ lider_midia → /admin/tasks│   │
│ └────────────────────────────┘   │
└──────────────────────────────────┘
             ↓
      MAS O CÓDIGO...
             ↓
┌──────────────────────────────────┐
│ VERIFICAÇÕES (❌ Quebradas)      │
│                                  │
│ middleware.ts:                   │
│ → Ainda usava allowed_roles[]   │
│                                  │
│ Sidebar.tsx:                     │
│ → Query antiga (enum)            │
│                                  │
│ Components:                      │
│ → Hardcoded role checks          │
└──────────────────────────────────┘
```

**Resultado:** Permissões salvas mas **nunca consultadas**.

---

### 🐛 Código Problemático

#### Exemplo 1: Middleware (Ainda usava sistema antigo)

```typescript
// ❌ PROBLEMA: Consultava allowed_roles array (deprecated)
const { data: pagePermission } = await supabase
  .from('page_permissions')
  .select('allowed_roles')
  .eq('page_path', pathname)
  .single()

if (pagePermission && !pagePermission.allowed_roles.includes(profile.role)) {
  redirect('/admin/unauthorized')
}
```

**Por que quebrou:** Coluna `allowed_roles` foi marcada como deprecated e não era mais atualizada. O código continuava lendo dela ao invés de consultar `page_role_permissions`.

#### Exemplo 2: Sidebar (Query antiga)

```typescript
// ❌ PROBLEMA: contains() não funcionava com nova estrutura
const { data: pages } = await supabase
  .from('page_permissions')
  .select('*')
  .contains('allowed_roles', [userRole]);
```

**Por que quebrou:** Novo sistema usava junction table `page_role_permissions`, mas sidebar ainda tentava filtrar pelo array antigo.

#### Exemplo 3: Components (Hardcoded)

```typescript
// ❌ PROBLEMA: Verificações hardcoded ignoravam BD
const ALLOWED_ROLES = ['admin', 'pastor(a)', 'lider_midia', 'lider_geral'];

if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
  redirect('/admin/unauthorized');
}
```

**Por que quebrou:** Arrays hardcoded no código. Mesmo que BD tivesse permissões diferentes, o código não consultava.

---

### 💡 Lições Aprendidas

#### 1. **Migração BD ≠ Migração de Código**

✅ **Aprendizado:**
- Criar tabelas no BD é fácil
- **Fazer o código usar essas tabelas é o desafio**
- Precisa atualizar TODOS os pontos de verificação

#### 2. **Faltou Sistema Dual (Feature Flags)**

❌ **Erro:**
- Tentou fazer tudo de uma vez (big bang migration)
- Sem rollback gradual
- Sem teste em staging

✅ **Solução:**
```typescript
// Sistema dual: funciona com AMBOS
if (useFeatureFlag('use_junction_permissions')) {
  // Consulta page_role_permissions (novo)
} else {
  // Consulta allowed_roles array (antigo)
}
```

#### 3. **Faltou Validação de Integração**

❌ **Erro:**
- Testou UI isoladamente ✅
- Testou BD isoladamente ✅
- **Nunca testou end-to-end** ❌

✅ **Solução:**
```typescript
// Teste E2E obrigatório:
// 1. Salvar permissão via UI
// 2. Verificar se código RESPEITA a permissão
// 3. Fazer login e confirmar acesso
```

#### 4. **Faltou Inventário de Pontos de Verificação**

❌ **Erro:**
- Não mapeou todos os lugares que verificam permissões
- Atualizou alguns arquivos, esqueceu outros

✅ **Solução:**
```bash
# Inventário ANTES de começar:
grep -r "allowed_roles" src/
grep -r "ALLOWED_ROLES" src/
grep -r "role === 'admin'" src/

# Checklist de atualização obrigatório
```

#### 5. **Teste Direto em Produção**

❌ **Erro:**
- Sem ambiente staging
- Bugs apareceram em produção
- Rollback emergencial

✅ **Solução:**
- Ambiente staging obrigatório
- Testar TUDO antes de produção
- Migração gradual com feature flags

---

### ✅ Como Evitar na Próxima Tentativa

#### Fase 0: Preparação
- [ ] Criar ambiente staging
- [ ] Copiar dados de produção
- [ ] Testar migrations em staging

#### Fase 1: Migrations BD
- [ ] Criar tabelas novas
- [ ] Manter tabelas antigas (dual compatibility)
- [ ] Popular dados em ambas

#### Fase 2: Helpers Centralizados
- [ ] Criar helpers com feature flags
- [ ] Atualizar TODOS pontos de verificação
- [ ] Testar com flags OFF (sistema antigo funciona)

#### Fase 3: Teste de Integração
```typescript
// Script automatizado:
1. Salvar permissão no BD
2. Consultar via helper
3. VERIFICAR se helper retorna a permissão
4. Se não retornar → BUG DETECTADO ❌
```

#### Fase 4: Teste End-to-End
```
1. Criar role customizada via UI
2. Marcar que pode acessar /admin/tasks
3. Criar membro com essa role
4. Fazer login
5. VERIFICAR: /admin/tasks aparece no sidebar
6. VERIFICAR: Consegue acessar a página
```

#### Fase 5: Ativação Gradual
- [ ] Ativar UMA flag por vez
- [ ] Testar 2-3 dias
- [ ] Monitorar erros
- [ ] Próxima flag

---

### 📊 Checklist Anti-Bug

Use este checklist ANTES de ativar qualquer feature flag:

#### Integração BD ↔ Código
- [ ] Permissão salva no BD?
- [ ] Helper consulta a tabela certa?
- [ ] Helper retorna a permissão salva?
- [ ] Componentes usam o helper?
- [ ] Middleware usa o helper?
- [ ] Server actions usam o helper?

#### Teste Manual
- [ ] Criar permissão via UI
- [ ] Login com role customizada
- [ ] Página aparece no sidebar?
- [ ] Consegue acessar a página?
- [ ] Remover permissão via UI
- [ ] Página desaparece?
- [ ] Acesso direto redireciona?

#### Rollback
- [ ] Feature flag pode ser desativada?
- [ ] Sistema antigo continua funcionando?
- [ ] Nenhuma migration irreversível?

---

### 🔗 Referências

- **Rollback migration:** `supabase/migrations/20251101000002_rollback_permission_system.sql`
- **Plano atual (corrigido):** `C:\Users\Cleyton\.claude\plans\adaptive-imagining-treasure.md`
- **Script de validação:** `scripts/validate-permissions-integration.ts`

---

### 📝 Notas Adicionais

**Data do rollback:** Nov/2024

**Decisão:** Não abandonar o plano, mas fazer **da forma certa**:
- Com staging
- Com feature flags
- Com validações rigorosas
- Com migração gradual

**Próxima tentativa:** Dez/2024 (seguindo novo plano)

---

**Atualizado em:** 06/12/2025
**Mantido por:** Equipe de Desenvolvimento
