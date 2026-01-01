# Sistema de Alertas de Vagas em Aberto

> **Implementado em**: Janeiro 2026
> **Objetivo**: Notificar automaticamente a equipe sobre vagas de voluntários em eventos futuros

---

## 📋 Visão Geral

Este sistema envia lembretes automáticos para o grupo de WhatsApp da igreja quando há vagas de voluntários em aberto para eventos futuros. Os alertas são enviados em dois momentos:

- **7 dias antes do evento** - Primeiro aviso
- **3 dias antes do evento** - Último aviso (URGENTE)

**Cada mensagem inclui o link direto para o evento**, facilitando o processo de voluntariado!

---

## 🏗️ Arquitetura

### Workflow n8n (Solução Otimizada)

**Arquivo**: `n8n/Viva esperança Bot.json`

**Por que não usamos API route?**
- **Mais eficiente**: Conexão direta n8n → Supabase (sem intermediários)
- **Menos carga**: Sem processamento no servidor Next.js
- **Mais rápido**: Uma chamada ao invés de três (n8n → API → Supabase)

**Fluxo de Execução**:

```
┌─────────────────────────┐
│ Schedule Trigger        │
│ (Todos os dias 9am)     │
└───────────┬─────────────┘
            │
            ├────────────────────────────────────────────────┐
            │                                                │
            ▼                                                ▼
┌────────────────────────┐                    ┌────────────────────────┐
│ Supabase Node          │                    │ Supabase Node          │
│ Busca eventos +7 dias  │                    │ Busca eventos +3 dias  │
│ com event_assignments  │                    │ com event_assignments  │
└───────────┬────────────┘                    └───────────┬────────────┘
            │                                              │
            ▼                                              ▼
┌────────────────────────┐                    ┌────────────────────────┐
│ Code: Filtra apenas    │                    │ Code: Filtra apenas    │
│ vagas em aberto        │                    │ vagas em aberto        │
│ (member_id = null)     │                    │ (member_id = null)     │
└───────────┬────────────┘                    └───────────┬────────────┘
            │                                              │
            ▼                                              ▼
┌────────────────────────┐                    ┌────────────────────────┐
│ IF: tem vagas?         │                    │ IF: tem vagas?         │
│ (length > 0)           │                    │ (length > 0)           │
└───────────┬────────────┘                    └───────────┬────────────┘
            │ [true]                                      │ [true]
            ▼                                              ▼
┌────────────────────────┐                    ┌────────────────────────┐
│ Code: Formata mensagem │                    │ Code: Formata mensagem │
│ + Link direto evento   │                    │ + Link direto evento   │
└───────────┬────────────┘                    └───────────┬────────────┘
            │                                              │
            ▼                                              ▼
┌────────────────────────┐                    ┌────────────────────────┐
│ Evolution API          │                    │ Evolution API          │
│ Envia para grupo       │                    │ Envia para grupo       │
└────────────────────────┘                    └────────────────────────┘
```

**Nodes**:

1. **Schedule Trigger** - Executa diariamente às 9h
2. **Supabase: Busca Vagas 7 dias** - Query direta com filtro de data (+7 dias) e join com `event_assignments` e `tasks`
3. **Supabase: Busca Vagas 3 dias** - Query direta com filtro de data (+3 dias) e join com `event_assignments` e `tasks`
4. **Code: Filtra Vagas em Aberto 7 dias** - Remove eventos sem vagas em aberto (`member_id != null`)
5. **Code: Filtra Vagas em Aberto 3 dias** - Remove eventos sem vagas em aberto (`member_id != null`)
6. **IF (7 dias)** - Verifica se há vagas em aberto
7. **IF (3 dias)** - Verifica se há vagas em aberto
8. **Code: Formata Mensagem 7 dias** - Cria mensagem com link direto para cada evento
9. **Code: Formata Mensagem 3 dias** - Cria mensagem urgente com link direto para cada evento
10. **Evolution API (7 dias)** - Envia mensagem para grupo
11. **Evolution API (3 dias)** - Envia mensagem para grupo

---

### 2. Formato das Mensagens

**🎯 Inteligente por Setor**: Cada setor recebe apenas as tarefas relevantes no seu próprio grupo!

#### Mensagem de 7 dias (Grupo de Mídia):
```
⚠️ *ALERTA - VAGAS EM ABERTO (7 DIAS)* ⚠️
*Ministério Mídia*

Olá equipe! Temos eventos daqui a *7 dias* que ainda precisam de voluntários:

📅 *Culto de Domingo*
🗓️ 15/01/2026 às 10:00h
👉 https://igrejavivaesperanca.com/admin/events/abc-123-uuid

*Vagas em aberto:*
   • Som (1x)
   • Projetor (1x)
   • Transmissão (1x)

---

🙏 Clique no link do evento para se voluntariar!
```

#### Mensagem de 3 dias (Grupo de Louvor):
```
🔴 *ÚLTIMO AVISO - VAGAS EM ABERTO (3 DIAS)* 🔴
*Ministério Louvor*

Olá equipe! Temos eventos daqui a *APENAS 3 DIAS* que ainda precisam de voluntários:

📅 *Culto de Domingo*
🗓️ 15/01/2026 às 10:00h
👉 https://igrejavivaesperanca.com/admin/events/abc-123-uuid

*Vagas em aberto:*
   • Vocal (2x)
   • Guitarra (1x)

---

🙏 *URGENTE:* Clique no link do evento para se voluntariar!
```

**Vantagens da solução:**
- ✅ **Mensagens direcionadas** - Cada setor só vê suas próprias vagas
- ✅ **Links diretos** - 1 clique e já está na página do evento
- ✅ **Múltiplos grupos** - Suporta quantos setores você tiver
- ✅ **Zero spam** - Ninguém recebe notificações irrelevantes
- ✅ **Maior conversão** - Mensagens relevantes = mais voluntários

---

## ⚙️ Configuração

### n8n Credentials

No n8n, configure as seguintes credenciais:

1. **Supabase** (ID: `LHHyhXuKDBW75Iv0`)
   - URL: Mesmo valor de `NEXT_PUBLIC_SUPABASE_URL`
   - Service Role Key: Mesmo valor de `SUPABASE_SERVICE_ROLE_KEY`

2. **Evolution account** (ID: `k2eLu0hxnSIREJNz`)
   - Credenciais da Evolution API para envio de mensagens

### Mapeamento de Setores para Grupos WhatsApp

**IMPORTANTE**: Configure os IDs dos grupos para cada setor nos codes nodes!

Nos nodes **"Formata Mensagem 7 dias"** e **"Formata Mensagem 3 dias"**, edite o `sectorGroupMap`:

```javascript
const sectorGroupMap = {
  'mídia': '120363345789069123@g.us',        // ✅ Configurado
  'geral': 'ID_DO_GRUPO_GERAL@g.us',         // ⚠️ Adicione o ID
  'louvor': 'ID_DO_GRUPO_LOUVOR@g.us',       // ⚠️ Adicione o ID
  'infantil': 'ID_DO_GRUPO_INFANTIL@g.us',   // ⚠️ Adicione o ID
  'social': 'ID_DO_GRUPO_SOCIAL@g.us'        // ⚠️ Adicione o ID
};
```

**Como obter o ID de um grupo:**
1. Abra o WhatsApp Web
2. Entre no grupo desejado
3. O ID está na URL: `https://web.whatsapp.com/send?phone=XXXXXXXXXX@g.us`
4. Copie o formato: `XXXXXXXXXX@g.us`

**Setores sem grupo mapeado** não receberão alertas (silenciosamente ignorados)

---

## 🧪 Testando o Sistema

### 1. Testar no n8n

1. Abra o workflow no n8n
2. Clique no node "Todos os dias 9am"
3. Clique em "Execute Node"
4. Verifique os resultados nos nodes seguintes

### 2. Forçar execução para hoje

Para testar com eventos de hoje, temporariamente altere os nodes Supabase:

**Node "Busca Vagas 7 dias"** - Altere os filtros para:
```javascript
"keyValue": "={{ $now.startOf('day').toISO() }}"  // Primeiro filtro
"keyValue": "={{ $now.endOf('day').toISO() }}"    // Segundo filtro
```

Lembre-se de reverter após o teste!

---

## 🔧 Manutenção

### Alterar horário de envio

Edite o node "Todos os dias 9am" no workflow:
```json
"triggerAtHour": 9  // Altere para a hora desejada (0-23)
```

### Alterar dias de antecedência

Edite os filtros nos nodes Supabase:

**Para alterar de 7 para 5 dias:**
```javascript
"keyValue": "={{ $now.plus(5, 'days').startOf('day').toISO() }}"
"keyValue": "={{ $now.plus(5, 'days').endOf('day').toISO() }}"
```

### Adicionar mais avisos

Para adicionar um terceiro aviso (ex: 1 dia antes):

1. Duplique os nodes de "3 dias"
2. Altere os filtros do Supabase para `plus(1, 'days')`
3. Ajuste a mensagem no Code node de formatação
4. Conecte ao trigger principal
5. Atualize as connections no JSON

### Adicionar novo setor

Para adicionar um novo setor (ex: "dança"):

1. **No Supabase**: Adicione o valor no enum `sector_enum` (se ainda não existir)
2. **Nos Code Nodes**: Adicione o mapeamento em ambos os nodes de formatação:

```javascript
const sectorGroupMap = {
  'mídia': '120363345789069123@g.us',
  'louvor': 'ID_DO_GRUPO_LOUVOR@g.us',
  'dança': 'ID_DO_GRUPO_DANÇA@g.us',  // ✨ Novo setor
  // ...outros setores
};
```

3. **Teste**: Crie um evento com tarefa do novo setor e execute o workflow manualmente

---

## 📊 Logs e Monitoramento

### Verificar execuções no n8n

1. Acesse o n8n
2. Vá em "Executions"
3. Filtre pelo workflow "Viva esperança Bot"
4. Verifique status e output de cada node
5. Clique em cada node para ver os dados retornados

### Debug no Supabase

Para verificar a query diretamente no Supabase:

```sql
-- Eventos daqui a 7 dias com vagas em aberto
SELECT
  e.*,
  json_agg(
    json_build_object(
      'id', ea.id,
      'member_id', ea.member_id,
      'status', ea.status,
      'task', t.*
    )
  ) as assignments
FROM events e
INNER JOIN event_assignments ea ON ea.event_id = e.id
INNER JOIN tasks t ON t.id = ea.task_id
WHERE
  e.event_date >= (NOW() + INTERVAL '7 days')::date
  AND e.event_date < (NOW() + INTERVAL '8 days')::date
  AND ea.member_id IS NULL
  AND ea.status = 'pendente'
GROUP BY e.id;
```

---

## 🐛 Troubleshooting

### Mensagens não estão sendo enviadas

1. Verifique se o workflow está ativo no n8n
2. Confirme que o horário do trigger está correto
3. Verifique as credenciais da Evolution API
4. Execute o workflow manualmente para testar
5. Verifique os logs de execução no n8n

### Node Supabase retorna erro

- Verifique se as credenciais do Supabase estão corretas no n8n
- Confirme que a Service Role Key tem permissões de leitura
- Teste a query diretamente no Supabase SQL Editor

### Não encontra vagas em aberto

- Verifique se existem eventos no range de datas
- Confirme que as `event_assignments` têm `member_id = NULL`
- Verifique o status das assignments (`status = 'pendente'`)
- Execute a query de debug acima no Supabase

### Datas/horários incorretos

- O código de formatação usa timezone `America/Sao_Paulo`
- Verifique se os dados no Supabase estão em UTC
- Use `.toISOString()` ao salvar datas no banco
- Os filtros do n8n usam `$now` que está em UTC

---

## 🚀 Melhorias Futuras

- [ ] **Configuração centralizada** - Mover `sectorGroupMap` para variáveis de ambiente ou DB
- [ ] Dashboard no admin para visualizar histórico de alertas
- [ ] Configuração de horários e grupos via UI (sem editar JSON)
- [ ] Estatísticas de engajamento (quantos se voluntariaram após alerta)
- [ ] Envio de lembretes personalizados por setor (ex: "Faltam 2 vagas de Som!")
- [ ] Integração com sistema de notificações push
- [ ] Configurar múltiplos horários de alerta por dia
- [ ] Adicionar campo de "urgência" em tarefas para priorizar alertas
- [ ] Notificar líder de setor quando todas as vagas forem preenchidas

---

**Mantido por**: Equipe de Desenvolvimento
**Última atualização**: 01/01/2026
