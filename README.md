# Igreja Viva Esperança

Sistema de gerenciamento de igreja desenvolvido com Next.js 15, Supabase e TypeScript. Gerencia membros, eventos, tarefas, visitantes e atribuições de voluntários com controle de acesso baseado em roles e distribuição de tarefas por setores.

## 🚀 Tecnologias

- **Framework**: Next.js 15 com App Router e Turbopack
- **Linguagem**: TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI**: shadcn/ui (Radix UI + Tailwind CSS)
- **Formulários**: React Hook Form
- **State Management**: Zustand
- **Ícones**: Lucide React
- **Estilo**: Tailwind CSS v4

## 📋 Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/viva-esperanca.git
cd viva-esperanca

# Instale as dependências
npm install

# Copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env.local

# Configure as credenciais do Supabase no .env.local
```

## 🔑 Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie a URL do projeto e a chave anon/public
3. Configure o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon
```

4. Execute as migrações do banco de dados (se disponíveis):

```bash
# Se estiver usando Supabase CLI
npx supabase db push

# Ou importe as migrações manualmente pelo Dashboard do Supabase
```

5. Gere os tipos TypeScript do schema:

```bash
npm run gen:types
```

## 🏃 Executando o Projeto

### Desenvolvimento

```bash
npm run dev
```

Acesse:
- Site público: [http://localhost:3000](http://localhost:3000)
- Painel admin: [http://localhost:3000/admin](http://localhost:3000/admin)

### Produção

```bash
# Build
npm run build

# Start
npm start
```

## 📁 Estrutura do Projeto

```
viva-esperanca/
├── src/
│   ├── app/
│   │   ├── (site)/              # Páginas públicas
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── blog/            # Blog
│   │   │   ├── quem-somos/      # Sobre
│   │   │   └── ofertas/         # Ofertas
│   │   ├── (admin)/admin/       # Painel administrativo
│   │   │   ├── actions/         # Server Actions (mutations)
│   │   │   ├── queries/         # Queries (data fetching)
│   │   │   ├── events/          # Gerenciamento de eventos
│   │   │   ├── members/         # Gerenciamento de membros
│   │   │   ├── tasks/           # Gerenciamento de tarefas
│   │   │   ├── visitors/        # Gerenciamento de visitantes
│   │   │   └── page.tsx         # Dashboard
│   │   └── api/                 # API Routes
│   ├── components/
│   │   ├── ui/                  # Componentes shadcn/ui
│   │   ├── forms/               # Sistema de formulários
│   │   ├── layout/              # Componentes de layout
│   │   └── Sidebar.tsx          # Menu lateral
│   ├── lib/
│   │   ├── supabase/            # Configuração Supabase
│   │   ├── format.ts            # Utilitários de formatação
│   │   └── utils.ts             # Utilitários gerais
│   └── stores/
│       └── authStore.ts         # State management (Zustand)
├── supabase/
│   ├── migrations/              # Migrações SQL
│   └── config.toml              # Configuração Supabase
└── public/                      # Assets estáticos
```

## 🎯 Funcionalidades

### 👥 Gerenciamento de Membros
- Cadastro e edição de membros
- Sistema de roles (admin, pastor(a), líder, membro, pendente)
- Aprovação de novos membros
- Organização por setores (mídia, geral, louvor, infantil, social)

### 📅 Gerenciamento de Eventos
- Criação e edição de eventos
- Atribuição de tarefas aos eventos
- Sistema de voluntariado (membros podem assumir tarefas)
- Visualização de escalas

### ✅ Sistema de Tarefas
- Templates de tarefas reutilizáveis
- Organização por setores
- Controle de quantidade de voluntários necessários
- Status de atribuição (pendente, confirmado, recusado)

### 👋 Gerenciamento de Visitantes
- Registro de visitantes
- Controle de primeira visita
- Status de visitante (sem_igreja, congregando, membro, desistiu)
- Rastreamento de quem convidou
- Análise de perfil de visitantes (não crentes vs afastados)

### 📊 Dashboard Executivo
- **Acesso**: Restrito a líderes (admin, pastor(a), lider_midia, lider_geral)
- **KPIs principais**: Membros, visitantes, eventos, tarefas
- **Gráficos**: Funil de conversão, crescimento de membros, tarefas por setor
- **Alertas inteligentes**: Membros pendentes, visitantes sem follow-up, eventos com baixa taxa de preenchimento
- **Ranking**: Top 5 membros mais ativos (últimos 3 meses)
- **Filtros**: Período personalizável (7d, 30d, 3m, 6m, 1y)

#### ⚙️ Setup do Dashboard
Após o primeiro deploy, execute este SQL no Supabase para habilitar o menu:

```sql
INSERT INTO page_permissions (page_name, page_path, icon, allowed_roles)
VALUES (
  'Dashboard',
  '/admin/dashboard',
  'BarChart3',
  ARRAY['admin', 'pastor(a)', 'lider_midia', 'lider_geral']::user_role_enum[]
)
ON CONFLICT (page_path) DO UPDATE
SET allowed_roles = EXCLUDED.allowed_roles;
```

### 🔐 Autenticação e Autorização
- Login via Supabase Auth
- Controle de acesso baseado em roles
- Menu dinâmico conforme permissões
- Proteção de rotas

## 🛠️ Comandos Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint
npm run gen:types    # Gera tipos TypeScript do Supabase
```

## 📊 Schema do Banco de Dados

### Principais Tabelas

- **members**: Membros da igreja com roles e setores
- **events**: Eventos e cultos
- **tasks**: Templates de tarefas/voluntariado
- **event_assignments**: Relaciona eventos, tarefas e membros
- **visitors**: Registro de visitantes
- **page_permissions**: Controle de acesso às páginas
- **message**: Fila de mensagens SMS/WhatsApp

### Roles Disponíveis
- `admin` - Acesso total ao sistema
- `pastor(a)` - Acesso administrativo
- `lider_midia` - Líder do setor de mídia
- `lider_geral` - Líder geral
- `membro` - Membro comum
- `pendente` - Aguardando aprovação

### Setores
- `mídia` - Mídia/tecnologia
- `geral` - Serviços gerais
- `louvor` - Ministério de louvor
- `infantil` - Ministério infantil
- `social` - Ação social

## 🔄 Workflow de Desenvolvimento

### Adicionando uma Nova Feature

1. **Alteração no Schema** (se necessário):
   ```bash
   # Faça as alterações no Supabase Dashboard ou crie migration
   npm run gen:types  # Regenere os tipos
   ```

2. **Criar Query** (para leitura):
   - Adicione em `src/app/(admin)/admin/queries/index.ts`

3. **Criar Action** (para mutations):
   - Adicione em `src/app/(admin)/admin/actions/index.ts`
   - Sempre use `revalidatePath()` após mutations
   - Retorne `{ success: boolean, message: string }`

4. **Criar Componentes**:
   - Use `GenericForm` para formulários
   - Siga o padrão Dialog (Add/Edit/Delete)
   - Use toast do Sonner para feedback

5. **Atualizar Permissões** (se nova página):
   - Adicione entrada na tabela `page_permissions`
   - Configure `allowed_roles`

## 📝 Convenções de Código

- **Idioma**: Todas as strings de UI em Português (Brasil)
- **Imports**: Use alias `@/` para imports absolutos
- **Tipos**: Sempre use tipos do `database.types.ts`, nunca `any`
- **Erros**: Log no console e retorne valores seguros ([], null)
- **Comentários**: Em português

## 🐛 Troubleshooting

### Erros de tipos após mudanças no schema
```bash
npm run gen:types
```

### Cache não atualiza após mutations
- Verifique se `revalidatePath()` está sendo chamado no server action
- Confirme que o path está correto

### Problemas de autenticação
- Verifique as credenciais no `.env.local`
- Confirme que o usuário existe na tabela `members`
- Verifique o `user_id` está correto

### Sidebar não mostra páginas
- Verifique a tabela `page_permissions`
- Confirme que `allowed_roles` inclui a role do usuário
- Verifique se o ícone existe no `iconMap` (`Sidebar.tsx`)

## 🚀 Próximos Passos

Veja todas as features planejadas em **[docs/ROADMAP.md](./docs/ROADMAP.md)**!

### 🔥 Prioridades:
1. Sistema de notificações WhatsApp automáticas
2. Calendário interativo com drag-and-drop
3. Relatórios em PDF/Excel
4. Check-in de eventos via QR Code
5. Gestão financeira

## 📚 Documentação

- **[CLAUDE.md](./CLAUDE.md)** - Documentação técnica completa (arquitetura, padrões, convenções)
- **[docs/ROADMAP.md](./docs/ROADMAP.md)** - Roadmap de features futuras (14 features planejadas)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e destinado ao uso exclusivo da Igreja Viva Esperança.

## 👨‍💻 Autor

Desenvolvido para a Igreja Viva Esperança

---

**Nota**: Este é um sistema de gerenciamento interno. Para suporte ou dúvidas, entre em contato com a equipe de desenvolvimento.
