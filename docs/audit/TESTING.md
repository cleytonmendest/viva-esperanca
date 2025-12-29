# 🧪 Guia de Testes - Sistema de Auditoria

> Como testar e validar o sistema de auditoria.

---

## 📋 Checklist de Testes

### ✅ Testes Básicos (Obrigatórios)

Execute cada ação e verifique se o log foi criado:

#### 1. Atribuição de Tarefas

- [ ] **Auto-atribuição** (`/admin`)
  - Ação: Assumir uma tarefa disponível
  - Log esperado: `task_self_assigned`
  - Validar:
    - `member_name` = Seu nome (quem assumiu)
    - `details.assigned_to_member_name` = Seu nome (mesmo)
    - `details.is_self_assigned` = `true`

- [ ] **Atribuição por líder** (`/admin/events/[id]`)
  - Ação: Atribuir tarefa a outro membro
  - Log esperado: `task_assigned`
  - Validar:
    - `member_name` = Seu nome (quem atribuiu)
    - `details.assigned_to_member_name` = Nome do membro (quem recebeu)
    - `details.is_self_assigned` = `false`

- [ ] **Remoção de tarefa** (`/admin/events/[id]`)
  - Ação: Remover atribuição de tarefa
  - Log esperado: `task_removed`
  - Validar:
    - `member_name` = Seu nome (quem removeu)
    - `details.removed_from_member_name` = Nome de quem tinha a tarefa

#### 2. Gestão de Eventos

- [ ] **Criar evento** (`/admin/events`)
  - Ação: Adicionar novo evento
  - Log esperado: `event_created`
  - Validar:
    - `member_name` = Seu nome
    - `details.event_name` = Nome do evento criado
    - `details.event_date` presente

- [ ] **Editar evento** (`/admin/events`)
  - Ação: Atualizar dados de evento
  - Log esperado: `event_updated`
  - Validar:
    - `member_name` = Seu nome
    - `details.changes` contém as modificações

- [ ] **Deletar evento** (`/admin/events`)
  - Ação: Remover evento
  - Log esperado: `event_deleted`
  - Validar:
    - `member_name` = Seu nome
    - `details.event_name` = Nome do evento deletado

#### 3. Submissão de Visitante

- [ ] **Formulário de visitante** (`/visitante`)
  - Ação: Preencher formulário como visitante
  - Log esperado: `visitor_submitted`
  - Validar:
    - `user_id` = `null` (visitante não tem conta)
    - `member_name` = Nome do visitante
    - `details.first_time`, `details.event_name` presentes

---

## 🔍 Como Verificar os Logs

### Opção 1: Supabase Dashboard (Recomendado)

1. Acesse https://supabase.com/dashboard
2. Database → Table Editor → `audit_logs`
3. Ordene por `created_at DESC` (mais recentes primeiro)
4. Verifique se o último log corresponde à ação executada

### Opção 2: SQL Query

Execute no SQL Editor do Supabase:

```sql
-- Últimos 10 logs
SELECT
  created_at,
  member_name,
  action_type,
  resource_type,
  details->>'event_name' as evento,
  details->>'task_name' as tarefa,
  details->>'assigned_to_member_name' as atribuido_para
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Opção 3: Logs Filtrados por Tipo

```sql
-- Apenas atribuições de tarefas
SELECT *
FROM audit_logs
WHERE action_type IN ('task_assigned', 'task_self_assigned')
ORDER BY created_at DESC
LIMIT 10;

-- Apenas ações de eventos
SELECT *
FROM audit_logs
WHERE action_type LIKE 'event_%'
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Validação de Dados

### Para cada log, verificar:

1. **Campos obrigatórios preenchidos:**
   - ✅ `created_at` (timestamp correto)
   - ✅ `action_type` (corresponde à ação)
   - ✅ `resource_type` (tipo de recurso correto)

2. **Campos de autoria:**
   - ✅ `user_id` preenchido (exceto visitantes)
   - ✅ `member_name` = quem **FEZ** a ação

3. **Dados em `details`:**
   - ✅ Contém informações relevantes (nomes, IDs)
   - ✅ Distingue "quem fez" de "quem recebeu"
   - ✅ Campos específicos por tipo de ação

4. **Integridade:**
   - ✅ Não há logs duplicados para mesma ação
   - ✅ Timestamps fazem sentido (data/hora corretas)

---

## 🧪 Testes Avançados

### Teste de Performance

```sql
-- Verificar quantidade de logs
SELECT COUNT(*) FROM audit_logs;

-- Tempo de consulta (deve ser < 100ms)
EXPLAIN ANALYZE
SELECT * FROM audit_logs
WHERE action_type = 'task_assigned'
ORDER BY created_at DESC
LIMIT 50;
```

### Teste de Índices

```sql
-- Verificar se índices estão sendo usados
EXPLAIN ANALYZE
SELECT * FROM audit_logs
WHERE user_id = 'seu-user-id'
AND action_type = 'task_assigned'
ORDER BY created_at DESC;

-- Deve mostrar "Index Scan using idx_audit_logs_user_action"
```

### Teste de RLS (Row Level Security)

```sql
-- 1. Tentar inserir via client (deve funcionar)
INSERT INTO audit_logs (action_type, resource_type, member_name)
VALUES ('test_action', 'test_resource', 'Test User');
-- Sucesso = ✅ Política RLS correta

-- 2. Tentar atualizar (deve falhar se não for service_role)
UPDATE audit_logs
SET member_name = 'Hacker'
WHERE id = 'algum-id';
-- Erro "permission denied" = ✅ Proteção funcionando

-- 3. Limpar teste
DELETE FROM audit_logs WHERE action_type = 'test_action';
```

---

## 📊 Queries Úteis para Análise

### Top 5 membros mais ativos (últimos 30 dias)

```sql
SELECT
  member_name,
  COUNT(*) as total_acoes,
  COUNT(*) FILTER (WHERE action_type = 'task_self_assigned') as auto_atribuicoes
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND member_name IS NOT NULL
GROUP BY member_name
ORDER BY total_acoes DESC
LIMIT 5;
```

### Atividades por dia (últimos 7 dias)

```sql
SELECT
  DATE(created_at) as dia,
  COUNT(*) as total_acoes
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY dia DESC;
```

### Distribuição por tipo de ação

```sql
SELECT
  action_type,
  COUNT(*) as quantidade
FROM audit_logs
GROUP BY action_type
ORDER BY quantidade DESC;
```

---

## 🚨 Problemas Comuns

### Logs não aparecem

**Checklist de debug:**
1. [ ] Verificou console do terminal? (erros aparecem lá)
2. [ ] Migration RLS foi executada?
3. [ ] Usuário está autenticado?
4. [ ] Tabela `audit_logs` existe no Supabase?

**Comandos para debug:**

```sql
-- Verificar se tabela existe
SELECT EXISTS (
  SELECT FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename = 'audit_logs'
);

-- Verificar políticas RLS
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'audit_logs';
```

### Logs com dados incompletos

**Causas possíveis:**
- Campos opcionais não fornecidos (ex: `assignedBy`)
- Queries não buscando dados relacionados antes do log
- Tipos incorretos sendo passados

**Solução:**
- Sempre buscar dados relacionados (`events(name)`, `tasks(name)`) antes de logar
- Validar que todos os campos obrigatórios estão preenchidos
- Usar `console.log` temporário para debugar dados

---

## 📈 Métricas de Sucesso

Considere o sistema funcionando se:

- ✅ **100% das ações críticas** geram logs
- ✅ **Tempo de inserção** < 50ms (não afeta performance)
- ✅ **Queries de leitura** < 100ms (com índices)
- ✅ **Zero logs duplicados** para mesma ação
- ✅ **Campo `member_name` sempre correto** (quem fez a ação)
- ✅ **`details` contém informações suficientes** para reconstituir o contexto

---

## 🎯 Teste Completo (Passo a Passo)

Execute na ordem:

1. **Prepare:**
   - [ ] Abra Supabase Dashboard → `audit_logs`
   - [ ] Anote quantos logs existem: `______`

2. **Execute ações:**
   - [ ] Auto-atribua 1 tarefa
   - [ ] Atribua 1 tarefa a outro membro
   - [ ] Crie 1 evento
   - [ ] Edite o evento criado
   - [ ] Delete o evento

3. **Verifique:**
   - [ ] Total de logs aumentou em **5**
   - [ ] Todos os `member_name` são **seu nome**
   - [ ] Tipos de ações corretos (task_self_assigned, task_assigned, event_created, etc.)

4. **Valide detalhes:**
   - [ ] Abra cada log individualmente
   - [ ] Verifique campo `details` tem informações completas
   - [ ] Confirme timestamps corretos

✅ **Se tudo passou, sistema está funcionando perfeitamente!**

---

**Encontrou algum problema?** Consulte [BUGS.md](./BUGS.md) para soluções conhecidas.
