# 📊 Sistema de Observabilidade - Igreja Viva Esperança

> **Última atualização**: 29/12/2025
>
> Sistema completo de auditoria para rastrear todas as ações importantes no sistema.

---

## 🎯 Objetivo

Implementar **sistema de auditoria e observabilidade** para:

- ✅ Saber **quem fez o quê** e **quando**
- ✅ Visualizar **atividades recentes** de membros
- ✅ Gerar **relatórios de engajamento**
- ✅ Identificar **padrões de uso** e **membros mais ativos**
- ✅ Auditoria completa para **compliance e gestão**

---

## 🚀 Quick Start

### O que está implementado?

✅ **Fase 1: Infraestrutura Base (COMPLETA)**
- Tabela `audit_logs` no Supabase
- Helper functions para registrar ações
- Integração em todos os actions críticos
- Queries para leitura de logs
- 100% type-safe

✅ **Fase 2: Visualização (COMPLETA)**
- Widget no Dashboard (ActivitiesWidget - últimas 5 atividades)
- Página `/admin/atividades` com timeline completo
- Filtros por tipo de ação e período
- Paginação de logs (50 por página)
- Formatação de tempo relativo

🔮 **Fase 3: Features Avançadas (FUTURO)**
- IP tracking
- Notificações baseadas em logs
- Análise preditiva

---

## 📖 Documentação Detalhada

### Para Implementadores:
- **[📚 Detalhes de Implementação](./audit/IMPLEMENTATION.md)** - Estrutura técnica completa
- **[🔧 API Reference](./audit/API.md)** - Referência das funções disponíveis
- **[🐛 Bugs e Soluções](./audit/BUGS.md)** - Histórico de problemas resolvidos

### Para Testadores:
- **[🧪 Guia de Testes](./audit/TESTING.md)** - Como testar o sistema de auditoria

---

## 🎨 Como Usar

### Registrar uma ação de auditoria:

```typescript
import { logTaskAssignment } from '@/lib/audit';

// Em um Server Action
await logTaskAssignment({
  eventId: "uuid",
  eventName: "Culto de Domingo",
  taskId: "uuid",
  taskName: "Operador de Som",
  memberId: "uuid",
  assignedToMemberName: "João Silva",
  isSelfAssigned: false, // true se auto-atribuição
});
```

### Consultar logs:

```typescript
import { getRecentAuditLogs } from '@/app/(admin)/admin/queries';

// Em um Server Component
const { logs, total } = await getRecentAuditLogs(50, 0);
```

---

## 📊 Tipos de Ações Rastreadas

| Ação | Quando é registrado |
|------|---------------------|
| `task_assigned` | Líder atribui tarefa a membro |
| `task_self_assigned` | Membro assume tarefa disponível |
| `task_removed` | Tarefa removida de atribuição |
| `event_created` | Novo evento criado |
| `event_updated` | Evento editado |
| `event_deleted` | Evento deletado |
| `member_created` | Novo membro cadastrado |
| `member_updated` | Membro editado |
| `member_deleted` | Membro removido |
| `member_approved` | Membro aprovado (saiu de pendente) |
| `visitor_submitted` | Visitante preencheu formulário |
| `visitor_updated` | Visitante editado |
| `visitor_deleted` | Visitante removido |

---

## 📁 Estrutura de Arquivos

```
viva-esperanca/
├── supabase/migrations/
│   ├── 20251229000000_create_audit_logs.sql
│   └── 20251229000001_fix_audit_logs_rls.sql
│
├── src/lib/
│   └── audit.ts                    # Helper functions
│
├── src/app/(admin)/admin/
│   ├── actions/index.ts            # Actions com logs integrados
│   └── queries/index.ts            # Queries de audit logs
│
└── docs/
    ├── OBSERVABILIDADE.md          # Este arquivo (overview)
    └── audit/
        ├── IMPLEMENTATION.md       # Detalhes técnicos
        ├── API.md                  # Referência de funções
        ├── BUGS.md                 # Histórico de bugs
        └── TESTING.md              # Guia de testes
```

---

## ✅ Checklist Rápido

### Após modificar uma ação no sistema:

- [ ] Adicionou chamada para `logAction()` ou helper específico?
- [ ] Testou que o log está sendo criado?
- [ ] Verificou que `member_name` registra quem **fez** a ação?
- [ ] Informações sobre quem **recebeu** estão em `details`?

### Após criar novo tipo de ação:

- [ ] Adicionou o tipo em `ActionType` (audit.ts)?
- [ ] Criou helper específico (opcional)?
- [ ] Documentou no `API.md`?
- [ ] Testou inserção e leitura?

---

## 🏆 Status Atual

### ✅ Implementado:
- Tabela de auditoria com RLS
- 5 helper functions específicas
- Integração em 10+ actions
- 5 queries para leitura de logs
- 100% type-safe (zero `any`)

### ✅ Bugs Resolvidos:
- RLS policy corrigida (permitir authenticated inserir)
- Campo `member_name` registrando pessoa correta

### 🎯 Próximos Passos (Fase 3):
- Exportação de logs em CSV/Excel
- Perfil individual com estatísticas pessoais
- Top 5 membros mais ativos (widget)
- Notificações baseadas em logs
- Relatório de engajamento detalhado
- IP tracking (opcional)

---

## 📞 Suporte

**Dúvidas sobre implementação?**
- Consulte [IMPLEMENTATION.md](./audit/IMPLEMENTATION.md)
- Veja exemplos em `src/app/(admin)/admin/actions/index.ts`

**Problemas com tipos?**
- Rode `npm run gen:types` após mudanças no schema
- Use tipo `JsonValue` para dados flexíveis em `details`

**Bugs ou erros?**
- Consulte [BUGS.md](./audit/BUGS.md) para soluções conhecidas
- Veja console do terminal para logs de debug

---

**Documentação mantida por:** Claude Code + Cleyton Mendes
**Última revisão:** 29/12/2025
