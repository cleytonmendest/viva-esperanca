# Setup do Dashboard Executivo

## Passo 1: Adicionar permissão no menu

Para que o Dashboard Executivo apareça no menu lateral, você precisa adicionar uma entrada na tabela `page_permissions` do Supabase.

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Table Editor** → **page_permissions**
3. Clique em **Insert** → **Insert row**
4. Preencha os campos:
   - **page_name**: Dashboard
   - **page_path**: /admin/dashboard
   - **icon**: BarChart3
   - **allowed_roles**: Selecione: `admin`, `pastor(a)`, `lider_midia`, `lider_geral`
5. Clique em **Save**

### Opção 2: Via SQL Editor

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Cole e execute o seguinte SQL:

```sql
INSERT INTO page_permissions (page_name, page_path, icon, allowed_roles)
VALUES (
  'Dashboard',
  '/admin/dashboard',
  'BarChart3',
  ARRAY['admin', 'pastor(a)', 'lider_midia', 'lider_geral']::user_role_enum[]
)
ON CONFLICT (page_path) DO UPDATE
SET
  page_name = EXCLUDED.page_name,
  icon = EXCLUDED.icon,
  allowed_roles = EXCLUDED.allowed_roles;
```

## Estrutura Implementada

### Rotas

- **`/admin`** - Dashboard Pessoal
  - Foco no usuário individual
  - Mostra tarefas atribuídas e disponíveis
  - Para líderes: exibe card com resumo executivo e link para dashboard completo

- **`/admin/dashboard`** - Dashboard Executivo
  - Acesso restrito a: admin, pastor(a), lider_midia, lider_geral
  - Métricas completas da igreja
  - Gráficos e analytics
  - Filtro por período (7d, 30d, 3m, 6m, 1y)

### Componentes Criados

- `StatsCard` - Cards de KPIs
- `ConversionFunnel` - Funil de conversão de visitantes
- `UpcomingEvents` - Próximos eventos com taxa de preenchimento
- `TasksBySector` - Tarefas por setor
- `TopMembers` - Ranking de membros mais ativos
- `AlertsCard` - Alertas e ações necessárias
- `MembersGrowthChart` - Crescimento de membros
- `PeriodFilter` - Filtro de período
- `ExecutiveSummaryCard` - Resumo executivo (aparece em /admin para líderes)

### Controle de Acesso (RBAC)

O acesso ao Dashboard Executivo é controlado por:

1. **Roles permitidas**: `admin`, `pastor(a)`, `lider_midia`, `lider_geral`
2. **Validação server-side**: A página `/admin/dashboard` redireciona usuários não autorizados
3. **Menu dinâmico**: Apenas líderes veem o item "Dashboard" no menu

## Testando

1. Faça login como um usuário com role de líder
2. Verifique se o item "Dashboard" aparece no menu lateral
3. Clique em "Dashboard" ou acesse `/admin/dashboard`
4. Verifique se todos os gráficos estão carregando
5. Teste o filtro de período
6. Teste os links nos alertas

## Troubleshooting

**Menu não aparece:**
- Verifique se executou o SQL acima
- Verifique se o usuário tem uma das roles permitidas
- Limpe o cache do navegador

**Erro de permissão ao acessar /admin/dashboard:**
- Verifique se o usuário logado tem role de líder
- Caso não tenha, será redirecionado para `/admin/unauthorized`

**Gráficos não aparecem:**
- Verifique se há dados no banco (membros, visitantes, eventos)
- Abra o console do navegador para ver erros
