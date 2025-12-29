# 🎯 Plano Simplificado: Sistema de Roles e Setores Dinâmicos

> **Versão:** Simplificada (80% do benefício, 20% do esforço)
> **Duração:** 1-2 semanas
> **Risco:** Baixo
> **Status:** Aguardando aprovação

---

## 🤔 Por Que Fazer Isso?

### Problema Atual

```typescript
// Hardcoded em 12+ arquivos diferentes:
const LEADER_ROLES = ['admin', 'pastor(a)', 'lider_midia', 'lider_geral'];

// Para adicionar nova role (ex: "lider_louvor"):
// 1. Criar migration para enum
// 2. Atualizar LEADER_ROLES em 12+ lugares
// 3. Atualizar page_permissions
// 4. Deploy completo
// 5. Risco de esquecer algum lugar
```

**Dor real:** Impossível adicionar nova role/setor sem migration + código.

### Solução Simplificada

```typescript
// Helper único:
const isLeader = await checkUserRole(userId, 'is_leadership', true);

// Para adicionar "lider_louvor":
// 1. Acessar /admin/configuracoes
// 2. Criar role "Líder de Louvor" (is_leadership = true)
// 3. Criar setor "Louvor" (icon = Music)
// 4. Pronto! Zero código, zero migration
```

---

## 🏗️ Arquitetura Simplificada

### Tabelas Novas (Apenas 2)

```sql
-- 1. Tabela de Roles Dinâmicas
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_leadership BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Setores Dinâmicos
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Users',
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Mudanças em `members`

```sql
ALTER TABLE members
  ADD COLUMN role_id UUID REFERENCES roles(id),
  ADD COLUMN sector_id UUID REFERENCES sectors(id);

-- Manter enums antigos temporariamente (deprecados)
-- role enum [DEPRECATED]
-- sector enum[] [DEPRECATED]
```

---

## 📦 Seed Inicial (Migra Dados Existentes)

```sql
-- Popula roles com dados atuais
INSERT INTO roles (name, is_leadership) VALUES
  ('Admin', true),
  ('Pastor(a)', true),
  ('Líder', true),  -- Role única de liderança!
  ('Membro', false),
  ('Pendente', false);

-- Popula setores com dados atuais
INSERT INTO sectors (name, icon, color) VALUES
  ('Mídia', 'Video', '#8B5CF6'),
  ('Geral', 'Users', '#3B82F6'),
  ('Louvor', 'Music', '#EC4899'),
  ('Infantil', 'Baby', '#F59E0B'),
  ('Social', 'Heart', '#10B981');

-- Migra dados existentes (preenche role_id e sector_id)
UPDATE members m
SET
  role_id = (SELECT id FROM roles WHERE LOWER(name) = LOWER(m.role::text)),
  sector_id = (
    SELECT id FROM sectors
    WHERE LOWER(name) = LOWER(m.sector[1]::text)
    LIMIT 1
  )
WHERE role_id IS NULL;
```

**Nota:** Enums antigos ficam intocados por enquanto (backwards compatibility).

---

## 🔧 Helper Functions (Substitui Hardcoded)

### Antes (Hardcoded em 12 lugares):
```typescript
const LEADER_ROLES = ['admin', 'pastor(a)', 'lider_midia', 'lider_geral'];
const isLeader = LEADER_ROLES.includes(profile.role);
```

### Depois (Helper único):
```typescript
// src/lib/permissions.ts
export async function isLeader(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('members')
    .select('roles(is_leadership)')
    .eq('user_id', userId)
    .single();

  return data?.roles?.is_leadership || false;
}

export async function getUserRole(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('members')
    .select(`
      id,
      name,
      roles(id, name, is_leadership),
      sectors(id, name, icon, color)
    `)
    .eq('user_id', userId)
    .single();

  return data;
}
```

---

## 🎨 UI Admin (`/admin/configuracoes`)

Nova página de configurações com 3 seções:

### 1. Gestão de Roles
```
┌─────────────────────────────────────────┐
│ 🔐 Roles do Sistema                     │
├─────────────────────────────────────────┤
│ Nome          | Liderança | Ações       │
│ Admin         | ✓         | [Editar]    │
│ Pastor(a)     | ✓         | [Editar]    │
│ Líder         | ✓         | [Editar]    │
│ Membro        | ✗         | [Editar]    │
│ Pendente      | ✗         | [Editar]    │
│                                          │
│ [+ Nova Role]                            │
└─────────────────────────────────────────┘
```

**CRUD:**
- Criar nova role
- Editar nome/descrição
- Toggle `is_leadership`
- Soft delete (não deletar roles em uso)

### 2. Gestão de Setores
```
┌─────────────────────────────────────────┐
│ 🏢 Setores da Igreja                    │
├─────────────────────────────────────────┤
│ Nome      | Ícone  | Cor    | Ações    │
│ Mídia     | Video  | Purple | [Editar] │
│ Geral     | Users  | Blue   | [Editar] │
│ Louvor    | Music  | Pink   | [Editar] │
│ Infantil  | Baby   | Orange | [Editar] │
│ Social    | Heart  | Green  | [Editar] │
│                                          │
│ [+ Novo Setor]                           │
└─────────────────────────────────────────┘
```

**CRUD:**
- Criar novo setor
- Editar nome/descrição/ícone/cor
- Soft delete (não deletar setores em uso)

### 3. Atribuição (Editar Membro)
No formulário de edição de membro, trocar:
```diff
- <MultiSelect options={sectorEnums} />  // Múltiplos setores
+ <Select options={sectors} />            // Setor único
+ <Select options={roles} />              // Role dinâmica
```

---

## 🚀 Fases de Implementação

### **Fase 1: Infraestrutura (Dias 1-3)**

**Dia 1-2: Schema + Migrations**
- [ ] Criar migration `20250101_create_roles_sectors.sql`
- [ ] Tabelas `roles` e `sectors`
- [ ] Alterar `members` (adicionar `role_id` e `sector_id`)
- [ ] Seed inicial (migrar dados dos enums)
- [ ] Testar migration em dev

**Dia 3: Helper Functions**
- [ ] Criar `src/lib/permissions.ts`
- [ ] Funções `isLeader()`, `getUserRole()`, `getSectors()`
- [ ] Testes unitários básicos

---

### **Fase 2: Refatoração Gradual (Dias 4-7)**

**Substituir Hardcoded (12 lugares):**
- [ ] `src/app/(admin)/admin/page.tsx` (dashboard)
- [ ] `src/components/dashboard/ExecutiveSummaryCard.tsx`
- [ ] `src/app/(admin)/admin/events/[id]/page.tsx`
- [ ] `src/app/(admin)/admin/members/page.tsx`
- [ ] `src/app/(admin)/admin/blog/page.tsx`
- [ ] Outros 7 locais (verificar com grep)

**Padrão de mudança:**
```diff
- const LEADER_ROLES = ['admin', 'pastor(a)', 'lider_midia', 'lider_geral'];
- const isLeader = profile ? LEADER_ROLES.includes(profile.role) : false;
+ const isLeader = profile ? profile.roles?.is_leadership : false;
```

---

### **Fase 3: UI Admin (Dias 8-10)**

**Dia 8: Página de Configurações**
- [ ] Criar `/admin/configuracoes/page.tsx`
- [ ] Layout com 2 tabs (Roles | Setores)
- [ ] Adicionar entry em `page_permissions` (só admins)

**Dia 9: CRUD Roles**
- [ ] Componente `RolesManager`
- [ ] Dialog para criar/editar role
- [ ] Server Actions (createRole, updateRole, deleteRole)
- [ ] Validações (não deletar role em uso)

**Dia 10: CRUD Setores**
- [ ] Componente `SectorsManager`
- [ ] Dialog para criar/editar setor
- [ ] Server Actions (createSector, updateSector, deleteSector)
- [ ] Seletor de ícones (lucide-react)
- [ ] Color picker

---

### **Fase 4: Ajustes Finais (Dias 11-14)**

**Dia 11-12: Formulários de Membros**
- [ ] Atualizar `AddMemberDialog` (usar Select de roles/setores)
- [ ] Atualizar `EditMemberDialog`
- [ ] Migrar membros existentes (preencher role_id/sector_id)

**Dia 13: Testes**
- [ ] Criar nova role via UI
- [ ] Criar novo setor via UI
- [ ] Atribuir role/setor a membro
- [ ] Verificar permissões funcionando
- [ ] Testar em produção (staging se tiver)

**Dia 14: Documentação**
- [ ] Atualizar ROADMAP.md
- [ ] Documentar helper functions
- [ ] Criar guia de uso para admins

---

## ✅ Critérios de Sucesso

**Funcional:**
- ✅ Admin consegue criar nova role via UI (sem código)
- ✅ Admin consegue criar novo setor via UI
- ✅ Membros conseguem ser atribuídos a roles/setores dinâmicos
- ✅ Permissões de liderança funcionam (is_leadership)
- ✅ Zero quebra de funcionalidade existente

**Técnico:**
- ✅ Zero hardcoded roles (substituídos por helpers)
- ✅ Enums deprecados mas funcionais
- ✅ Migrations reversíveis
- ✅ Type-safe (zero `any`)

---

## 🚫 O Que NÃO Vamos Fazer (Simplificação)

❌ **Permissões granulares** (Create/Read/Update/Delete por recurso)
- Motivo: Complexidade alta, benefício baixo
- Alternativa: `is_leadership` boolean é suficiente

❌ **Feature flags**
- Motivo: Sem dual system, sem necessidade
- Alternativa: Migration direta com backwards compatibility

❌ **Staging environment**
- Motivo: Testar em dev é suficiente
- Alternativa: Migração reversível + testes cuidadosos

❌ **Múltiplos setores por membro**
- Motivo: Causa confusão, raramente usado
- Alternativa: Um setor principal (simplicidade)

❌ **Sistema de contexto por setor** (líder só edita seu setor)
- Motivo: Adiar para depois se precisar
- Alternativa: Líderes têm acesso geral por ora

---

## 🔄 Plano de Rollback (Se Der Errado)

**Cenário 1: Bug crítico na UI**
- Reverter migration: `supabase db reset --local`
- Remover entry de `page_permissions` (oculta /admin/configuracoes)
- Sistema volta ao estado anterior (enums)

**Cenário 2: Performance ruim nas queries**
- Adicionar índices:
  ```sql
  CREATE INDEX idx_members_role_id ON members(role_id);
  CREATE INDEX idx_members_sector_id ON members(sector_id);
  ```

**Cenário 3: Migração de dados falhou**
- Script de correção manual
- Reprocessar seed com WHERE role_id IS NULL

---

## 📊 Comparação com Plano Original

| Aspecto | Plano Original | Plano Simplificado |
|---------|---------------|-------------------|
| **Duração** | 5-6 semanas | 1-2 semanas |
| **Tabelas novas** | 7 | 2 |
| **Feature flags** | Sim (complexo) | Não |
| **Staging** | Necessário | Opcional |
| **Permissões granulares** | Sim | Não (só is_leadership) |
| **Risco** | Alto | Baixo |
| **Benefício** | 100% | 80% |
| **Manutenção** | Complexa | Simples |
| **ROI** | Baixo (muito esforço) | Alto (pouco esforço) |

---

## 🎯 Benefícios Imediatos

1. ✅ **Adicionar nova role:** UI, 30 segundos
2. ✅ **Adicionar novo setor:** UI, 30 segundos
3. ✅ **Zero migrations** para mudanças de negócio
4. ✅ **Código limpo** (12 hardcodes → 1 helper)
5. ✅ **Escalável** (futuro: adicionar permissões granulares se precisar)

---

## 💰 Custo vs Valor

**Investimento:**
- 1-2 semanas de desenvolvimento
- ~50-60 horas de trabalho

**Retorno:**
- Cada nova role/setor: 5min (ao invés de 2h + deploy)
- Código mais limpo e manutenível
- Base sólida para features futuras
- Zero dívida técnica adicional

---

## 📝 Próximos Passos (Se Aprovado)

1. **Você revisa este plano** e confirma que faz sentido
2. **Criamos branch:** `feature/dynamic-roles-sectors`
3. **Dia 1:** Começamos pela Fase 1 (Schema + Migrations)
4. **Daily check-ins:** Alinhamento diário de progresso
5. **Ao final:** Merge + Deploy + Atualizar ROADMAP.md

---

## ❓ Perguntas Frequentes

**P: E se quisermos permissões granulares no futuro?**
R: Facilmente extensível. Adicionar tabelas de permissões depois sem quebrar nada.

**P: Como fica a compatibilidade com código antigo?**
R: Enums permanecem. Código novo usa FKs. Sem quebra.

**P: Precisa de staging?**
R: Não obrigatório. Migrations são reversíveis e testamos em dev.

**P: Posso adicionar "lider_louvor" amanhã?**
R: Sim, mas com migration. Depois deste plano: sim, via UI em 30s.

**P: Vai quebrar algo em produção?**
R: Baixíssimo risco. Backwards compatible + testes extensivos.

---

## 🎬 Conclusão

**Este plano é:**
- ✅ Simples
- ✅ Rápido (1-2 semanas)
- ✅ Baixo risco
- ✅ Alto valor
- ✅ Escalável

**Evita:**
- ❌ Overengineering
- ❌ Feature flags complexos
- ❌ Dual systems
- ❌ Meses de trabalho

**Pergunta final:** Você aprova este plano simplificado? Vamos começar?

---

**Mantido por:** Claude Code + Cleyton Mendes
**Criado em:** 29/12/2025
**Versão:** 1.0 (Simplificada)
