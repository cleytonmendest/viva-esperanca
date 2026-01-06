# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Igreja Viva Esperança** is a comprehensive church management system built with Next.js 15, Supabase, and TypeScript. The application manages members, events, tasks, visitors, and event assignments for church operations with role-based access control and sector-based task distribution.

## ⚠️ CRITICAL: Development Workflow

**MANDATORY PROCESS - NO EXCEPTIONS:**

### Before ANY Implementation:
1. **ALWAYS** read `docs/ROADMAP.md` first
2. **VERIFY** if the feature is listed in the roadmap
3. **CONFIRM** the priority level and implementation approach
4. **CHECK** for any dependencies or prerequisites
5. **ONLY THEN** start coding

### After ANY Implementation:
1. **ALWAYS** update `docs/ROADMAP.md`
2. **MOVE** the completed item from "PRÓXIMAS FEATURES" to "HISTÓRICO DE IMPLEMENTAÇÕES"
3. **ADD** completion date and brief description (1 line) in the history table
4. **COMMIT** the roadmap update along with your changes

**Why This Matters:**
- Prevents duplicate work and conflicting implementations
- Ensures alignment with project priorities
- Maintains clear project documentation
- Provides visibility into what's been done vs. what's planned

**This is NOT optional.** Every feature implementation MUST follow this workflow. If a feature is not in the roadmap, discuss with the team before implementing.

## Essential Commands

### Development Workflow
```bash
npm run dev              # Start dev server with Turbopack on http://localhost:3000
npm run build           # Production build (validates types and builds optimized bundle)
npm run start           # Start production server
npm run lint            # Run ESLint with Next.js config
```

### Supabase Type Generation
```bash
npm run gen:types       # Generate TypeScript types from Supabase schema
```
**Important**: Run this command after any database schema changes. It updates `src/lib/supabase/database.types.ts` with type-safe interfaces for all tables, enums, and relationships.

### Initial Setup
```bash
npm install             # Install dependencies
cp .env.example .env.local  # Create environment file (configure Supabase credentials)
npm run gen:types       # Generate TypeScript types from Supabase schema
```

## Architecture Deep Dive

### Route Groups & Authentication Strategy

The app uses **Next.js 15 Route Groups** to separate public and authenticated areas:

#### 1. Public Site: `src/app/(site)/`
- Public-facing pages: homepage, blog, about, offerings
- No authentication required
- Layout: `src/app/(site)/layout.tsx`

#### 2. Admin Panel: `src/app/(admin)/admin/`
- Protected area requiring authentication
- Layout: `src/app/(admin)/admin/layout.tsx`
- **Authentication Flow**:
  1. Server Component fetches user via `createClient()` from `@/lib/supabase/server`
  2. If authenticated, fetches member profile from `members` table using `user.id`
  3. Initializes client-side Zustand store via `<StoreInitializer>` component
  4. Renders different UI based on role:
     - `role: 'pendente'` → Shows "Awaiting Approval" message
     - Other authenticated users → Renders sidebar + main content
     - No user → Shows login/signup pages

#### Key Admin Pages:
- `/admin` - Dashboard with assigned tasks and available tasks
- `/admin/events` - Event management (CRUD)
- `/admin/events/[id]` - Event detail with task assignments
- `/admin/members` - Member management
- `/admin/tasks` - Task templates management
- `/admin/visitors` - Visitor tracking
- `/admin/pending-approval` - Approve new member registrations

### Authentication & Authorization

**Supabase Client Types:**
- **Server-side** (`src/lib/supabase/server.ts`): Use in Server Components, Server Actions, and Route Handlers
  - Creates `createServerClient` with cookie management
  - Always `await createClient()` before use
- **Client-side** (`src/lib/supabase/client.ts`): Use in Client Components
  - Creates `createBrowserClient`
  - Used sparingly; most data fetching is server-side

**Role-Based Access Control (RBAC):**
- Roles defined in `user_role_enum`: `admin`, `pastor(a)`, `lider_midia`, `lider_geral`, `membro`, `pendente`
- Menu items controlled by `page_permissions` table (stores `allowed_roles` array for each page)
- Sidebar (`src/components/Sidebar.tsx`) dynamically filters menu items based on user's role
- Icon mapping in sidebar uses Lucide icons stored as strings in DB and resolved via `iconMap`

### Data Layer Architecture

**Clear Separation of Concerns:**

#### Queries (`src/app/(admin)/admin/queries/index.ts`)
- **Purpose**: Read-only data fetching
- **Usage**: Server Components, initial page loads
- **Pattern**:
  ```typescript
  export async function getMembers() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('members').select('*');
    if (error) {
      console.error("Error:", error);
      return [];
    }
    return data;
  }
  ```
- **Key Functions**:
  - `getProfile()` - Current user's member profile
  - `getAssignedTasks(memberId)` - Tasks assigned to a member
  - `getAvailableTasks(sectors[])` - Unassigned tasks filtered by sectors
  - `getEventById(eventId)` - Event details
  - `getAssignmentsByEventId(eventId)` - All assignments for an event

#### Actions (`src/app/(admin)/admin/actions/index.ts`)
- **Purpose**: Mutations (Create, Update, Delete)
- **Usage**: Form submissions, user interactions
- **Pattern**:
  ```typescript
  'use server';

  export async function addMember(memberData: TablesInsert<'members'>) {
    const supabase = await createClient();
    const { error } = await supabase.from('members').insert([memberData]);

    if (error) {
      console.error('Error:', error);
      return { success: false, message: 'Error message in Portuguese' };
    }

    revalidatePath('/admin/members');  // CRITICAL: Always revalidate after mutations
    return { success: true, message: 'Success message in Portuguese' };
  }
  ```
- **CRITICAL CONVENTION**: Every action must call `revalidatePath()` to update Next.js cache
- **Return Format**: Always `{ success: boolean, message: string }` for consistent UI feedback

### State Management

**Zustand for Authentication State** (`src/stores/authStore.ts`):
```typescript
interface AuthState {
  user: User | null;              // Supabase auth user
  profile: MemberProfile | null;  // Member record from database
  isInitialized: boolean;         // Prevents hydration issues
  initialize: (data) => void;     // Called once on app load
  reset: () => void;              // Called on logout
}
```

**Hydration Strategy:**
1. Server Component (admin layout) fetches user + profile
2. Passes data to `<StoreInitializer>` Client Component
3. `StoreInitializer` uses `useRef` to ensure one-time initialization
4. Client Components access state via `useAuthStore()`

**Why This Pattern?**
- Prevents server/client state mismatch
- Leverages Server Components for initial data fetch (no waterfall)
- Zustand provides reactive updates across client components

### Database Schema & Relationships

**Core Tables:**

#### `members`
- **Fields**: `id`, `name`, `phone`, `birthdate`, `role`, `sector[]`, `status`, `user_id`
- **Enums**:
  - `role`: admin, pastor(a), lider_midia, lider_geral, membro, pendente
  - `sector`: mídia, geral, louvor, infantil, social (array type)
  - `status`: ativo, inativo
- **Relationships**: Links to `user_id` from Supabase Auth
- **Important**: `sector` is an array allowing members to belong to multiple sectors

#### `events`
- **Fields**: `id`, `name`, `description`, `event_date`, `created_by`
- **Purpose**: Represents church events/services requiring volunteers

#### `tasks`
- **Fields**: `id`, `name`, `description`, `sector`, `quantity`, `is_default`
- **Purpose**: Task templates (e.g., "Sound Technician", "Children's Ministry Helper")
- **`is_default`**: Pre-populated tasks vs. custom tasks
- **`quantity`**: How many people needed for this task

#### `event_assignments` (Junction Table)
- **Fields**: `id`, `event_id`, `task_id`, `member_id`, `status`
- **Purpose**: Links events to tasks and optionally to members
- **Flow**:
  1. Admin adds task to event → `member_id` is NULL, `status: 'pendente'`
  2. Member assigns to self → `member_id` populated, `status: 'confirmado'`
  3. Leader assigns to member → Direct assignment
- **Enums**: `status`: pendente, confirmado, recusado
- **Key Queries**:
  - `getAvailableTasks()` finds assignments where `member_id IS NULL`
  - `getAssignedTasks()` finds assignments for specific member

#### `visitors`
- **Fields**: `id`, `visitor_name`, `visitor_whatsapp`, `visite_date`, `first_time`, `visitor_status`, `invited_by`, `event_name`
- **Purpose**: Track church visitors for follow-up
- **Enums**: `visitor_status`: sem_igreja, congregando, membro, desistiu

#### `page_permissions`
- **Fields**: `id`, `page_name`, `page_path`, `icon`, `allowed_roles[]`
- **Purpose**: Database-driven menu and access control
- **Usage**: Sidebar component queries this table to build navigation

#### `message`
- **Fields**: `id`, `phone`, `message`, `status`, `error_message`
- **Purpose**: SMS/WhatsApp message queue
- **Enums**: `status`: pending, processing, sent, failed

### Component Patterns

#### GenericForm System

**Location**: `src/components/forms/GenericForm.tsx`

**Configuration-Driven Form Builder:**
```typescript
type FormConfig = FieldConfig[];

type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'datetime-local' | 'tel' | 'email' | 'password' | 'select' |
        'multiselect' | 'textarea' | 'radio' | 'date' | 'number' | 'combobox';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  empty?: string; // For combobox empty state
};
```

**Features:**
- Powered by `react-hook-form` with Controller pattern
- Phone masking: Uses `applyPhoneMask()` from `@/lib/format`
- Enter key submission (except in textareas)
- Imperative API via `useImperativeHandle` (for dialog triggers)
- Consistent styling across all forms

**Usage Example:**
```typescript
const formConfig: FormConfig = [
  { name: 'name', label: 'Nome', type: 'text', required: true },
  { name: 'phone', label: 'Telefone', type: 'tel', required: true },
  { name: 'sector', label: 'Setor', type: 'multiselect', options: [...] }
];

<GenericForm
  formConfig={formConfig}
  onSubmit={handleSubmit}
  defaultValues={editData}
  isLoading={loading}
/>
```

#### Dialog Pattern (CRUD Operations)

**Standard Structure:**
Every admin feature follows this pattern:

1. **Add Dialog** (`AddXDialog.tsx`)
   - Trigger: Button in page
   - Form: GenericForm with empty `defaultValues`
   - Action: Calls `addX()` server action
   - Feedback: Toast notification via Sonner

2. **Edit Dialog** (`EditXDialog.tsx`)
   - Trigger: Edit button in table row
   - Form: GenericForm with pre-filled `defaultValues`
   - Action: Calls `updateX(id, data)` server action
   - Key difference: Passes existing data to form

3. **Delete Dialog** (`DeleteXDialog.tsx`)
   - Trigger: Delete button in table row
   - Content: Confirmation message (no form)
   - Action: Calls `deleteX(id)` server action
   - Safety: Shows item name/details for confirmation

**Shared Characteristics:**
- All use `Dialog` component from shadcn/ui
- All use `toast()` from Sonner for feedback
- All handle loading states (`isLoading`)
- All use Portuguese for UI strings

#### Sidebar Navigation

**Dynamic Menu from Database:**
- Queries `page_permissions` table on every render
- Filters items by current user's role
- Icon resolution: String (e.g., "Home") → React Component via `iconMap`
- Server Component (no client-side JS for menu logic)

### Utility Libraries

#### Date/Time Formatting (`src/lib/format.ts`)
```typescript
formatDate(dateString)       // "01/12/2024"
formatDateTime(dateString)   // "01/12/2024 14:30"
```
- Uses `Intl.DateTimeFormat` with `pt-BR` locale
- All dates use UTC timezone to prevent off-by-one errors

#### Phone Number Utilities
```typescript
formatPhoneNumber(phone)     // "(21) 99999-8888"
applyPhoneMask(value)        // Real-time masking for inputs
unmaskPhoneNumber(phone)     // "21999998888"
isPhoneNumberValid(phone)    // true if 11 digits
```

#### Tailwind Utilities (`src/lib/utils.ts`)
```typescript
cn(...inputs)                // Merge Tailwind classes with clsx + tailwind-merge
arraysAreEqual(arr1, arr2)   // Compare arrays ignoring order
```

### Styling & UI Components

**shadcn/ui Configuration** (`components.json`):
- Style: `new-york`
- Base color: `neutral`
- CSS variables: Enabled (for theme customization)
- Icon library: Lucide React
- All components in `src/components/ui/`

**Available Components:**
badge, button, calendar, card, collapsible, command, dialog, drawer, dropdown-menu, input, label, popover, radio-group, select, separator, sheet, sidebar, skeleton, sonner (toast), table, textarea, tooltip

**Custom Components:**
- `Combobox` - Searchable select (Command + Popover)
- `MultiSelect` - Multiple selection with badges
- `DatePicker` - Calendar-based date selection
- `GenericForm` - Form builder
- `Sidebar` - App navigation
- `StoreInitializer` - Zustand hydration

### API Routes

**Next.js Route Handlers** (not Supabase Edge Functions):

#### `/api/members-schedules`
- **Purpose**: Retrieve member assignment schedules
- **Use Case**: Calendar views, schedule exports

#### `/api/next-events`
- **Purpose**: Upcoming events endpoint
- **Use Case**: Public-facing "upcoming events" widget

#### `/api/reminders`
- **Purpose**: Task/event reminder notifications
- **Use Case**: Cron job trigger for sending WhatsApp/SMS reminders

### Type Safety & Supabase Integration

**Generated Types** (`src/lib/supabase/database.types.ts`):
```typescript
import { Database, Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

// Type-safe table access
type Member = Tables<'members'>;
type Event = Tables<'events'>;

// Type-safe mutations
const memberData: TablesInsert<'members'> = { ... };
const updateData: TablesUpdate<'events'> = { ... };

// Enum access
type UserRole = Database['public']['Enums']['user_role_enum'];
type Sector = Database['public']['Enums']['sector_enum'];
```

**Important Enums:**
- `user_role_enum`: admin, pastor(a), lider_midia, lider_geral, membro, pendente
- `sector_enum`: mídia, geral, louvor, infantil, social
- `member_status_enum`: ativo, inativo
- `assignment_status`: pendente, confirmado, recusado
- `visitor_status_enum`: sem_igreja, congregando, membro, desistiu
- `status_enum`: pending, processing, sent, failed (for messages)

### Performance & Data Fetching

**Server-First Approach:**
- All initial data fetching happens in Server Components
- Uses `Promise.all()` for parallel queries (see `admin/page.tsx`)
- Client Components only for interactivity (forms, dialogs, toasts)

**Caching Strategy:**
- Next.js automatically caches fetch requests and Supabase queries
- `revalidatePath()` invalidates cache after mutations
- No client-side caching (React Query, SWR) needed for current scale

### Development Workflow & Best Practices

#### When Adding a New Feature:

1. **Database Schema Change:**
   ```bash
   # Make changes in Supabase Dashboard or migrations
   npm run gen:types  # Regenerate types
   ```

2. **Create Query Function** (if reading data):
   - Add to `src/app/(admin)/admin/queries/index.ts`
   - Use proper type annotations
   - Handle errors gracefully (return empty array/null)

3. **Create Action Function** (if mutating data):
   - Add to `src/app/(admin)/admin/actions/index.ts`
   - Mark with `'use server'`
   - Use `TablesInsert<'table'>` or `TablesUpdate<'table'>` for type safety
   - **MUST** call `revalidatePath()` after successful mutation
   - Return `{ success: boolean, message: string }` in Portuguese

4. **Create Page/Component:**
   - Server Component for page (`page.tsx`)
   - Client Components for dialogs (`"use client"`)
   - Use GenericForm for forms
   - Use toast for feedback

5. **Update Permissions** (if new page):
   - Add entry to `page_permissions` table
   - Specify `allowed_roles` array
   - Add icon name (must exist in `iconMap` in `Sidebar.tsx`)

#### Code Style Conventions:

- **Language**: All user-facing strings in Portuguese (Brazil)
- **Naming**: Use descriptive names (`getAssignedTasks` not `getTasks`)
- **Imports**: Use `@/` alias for absolute imports
- **Types**: Always import from `database.types.ts`, never use `any`
- **Error Handling**: Log to console, return safe defaults (empty array/null)
- **Comments**: Use Portuguese for comments (codebase convention)

#### Testing a Feature:

```bash
npm run dev                    # Start dev server
# Make changes
npm run build                  # Ensure build passes
npm run gen:types             # After schema changes
```

### Common Patterns & Recipes

#### Fetching Related Data:
```typescript
const { data } = await supabase
  .from('event_assignments')
  .select(`
    *,
    events (*),
    tasks (*),
    members (*)
  `)
  .eq('event_id', eventId);
```

#### Filtering by Array Contains:
```typescript
// Get tasks for member's sectors
.in('tasks.sector', profile.sector)  // sector is an array
```

#### Conditional Data Fetching:
```typescript
const tasks = profile?.sector?.length > 0
  ? await getAvailableTasks(profile.sector)
  : [];
```

#### Server Action Error Handling:
```typescript
if (error) {
  console.error('Error:', error);
  return {
    success: false,
    message: 'Mensagem de erro amigável em português'
  };
}
revalidatePath('/admin/path');
return {
  success: true,
  message: 'Operação realizada com sucesso!'
};
```

### Supabase Project Structure

- **Migrations**: `supabase/migrations/` - SQL migration files
- **Config**: `supabase/config.toml` - Supabase CLI configuration
- **Backups**: `supabase/backups/` - Database backups

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Important Files Reference

- **Auth Store**: `src/stores/authStore.ts`
- **Supabase Clients**: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
- **Database Types**: `src/lib/supabase/database.types.ts` (auto-generated)
- **Queries**: `src/app/(admin)/admin/queries/index.ts`
- **Actions**: `src/app/(admin)/admin/actions/index.ts`
- **Generic Form**: `src/components/forms/GenericForm.tsx`
- **Form Config Type**: `src/components/forms/form-config.ts`
- **Utilities**: `src/lib/utils.ts`, `src/lib/format.ts`
- **Sidebar**: `src/components/Sidebar.tsx`

### Troubleshooting

**Type errors after schema changes:**
```bash
npm run gen:types
```

**Cache not updating after mutations:**
- Ensure `revalidatePath()` is called in server action
- Check the path matches the page you want to revalidate

**Authentication issues:**
- Verify `.env.local` has correct Supabase credentials
- Check user exists in `auth.users` AND has profile in `members` table
- Confirm `user_id` foreign key is set correctly

**Sidebar not showing pages:**
- Check `page_permissions` table has entry for the page
- Verify `allowed_roles` includes current user's role
- Ensure icon name exists in `iconMap` in `Sidebar.tsx`

---

## 🏗️ Arquitetura e Padrões de Design

> **IMPORTANTE**: A partir de Janeiro/2026, o projeto está em **migração incremental** para uma arquitetura mais robusta.
>
> **Documentação completa**: `docs/ARCHITECTURE.md` + `docs/TESTING_GUIDE.md`

### Status Atual da Arquitetura

**Arquitetura Existente** (código legado):
- Transaction Script Pattern
- Server Actions com lógica misturada
- Acoplamento forte com Supabase
- Validação fragmentada (client vs server)
- Zero testes

**Arquitetura Alvo** (novas features):
- Clean Architecture Light + DDD Tático
- Repository Pattern (desacoplar banco)
- Use Cases (lógica isolada)
- Validação com Zod (client + server)
- Testes (Jest + Playwright)

### Convenções OBRIGATÓRIAS para Novas Features

A partir de agora, **TODA nova feature** deve seguir:

#### 1. Validação com Zod

**SEMPRE** criar schema em `src/shared/schemas/`:

```typescript
// src/shared/schemas/memberSchemas.ts
import { z } from 'zod';

export const CreateMemberSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  phone: z.string().regex(/^\d{11}$/, 'Telefone inválido'),
  role: z.enum(['admin', 'pastor(a)', ...]),
  sector: z.array(z.enum(['mídia', 'geral', ...])).min(1),
});

export type CreateMemberData = z.infer<typeof CreateMemberSchema>;
```

**Usar no client** (form):
```typescript
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(CreateMemberSchema),
});
```

**Usar no server** (action):
```typescript
'use server';

export async function createMemberAction(data: unknown) {
  const parsed = CreateMemberSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Usa parsed.data (type-safe)
}
```

#### 2. Testes (quando Fase 1 estiver completa)

**SEMPRE** escrever testes para:
- ✅ Lógica de negócio (unit tests)
- ✅ Use Cases (unit tests com mocks)
- ✅ Fluxos críticos (E2E com Playwright)

**Estrutura de testes:**
```
src/tests/
├── unit/
│   ├── domain/
│   └── application/
├── integration/
│   └── repositories/
└── e2e/
    └── [feature].spec.ts
```

**Exemplo de teste unitário:**
```typescript
// src/tests/unit/domain/member/Member.test.ts
describe('Member', () => {
  it('deve validar setor compatível', () => {
    const member = new Member(..., ['mídia']);
    const task = new Task('Som', 'mídia');

    expect(member.canBeAssignedTo(task)).toBe(true);
  });
});
```

#### 3. Repository Pattern (quando Fase 2 estiver completa)

Ao invés de acessar Supabase diretamente:

**❌ EVITE (código legado):**
```typescript
const { data } = await supabase.from('members').select('*');
```

**✅ PREFIRA (novo padrão):**
```typescript
// src/domain/member/MemberRepository.ts (interface)
export interface MemberRepository {
  findAll(): Promise<Member[]>;
  findById(id: string): Promise<Member | null>;
  save(member: Member): Promise<void>;
}

// src/infrastructure/supabase/repositories/SupabaseMemberRepository.ts
export class SupabaseMemberRepository implements MemberRepository {
  async findAll(): Promise<Member[]> {
    const { data } = await this.supabase.from('members').select('*');
    return data.map(this.toDomain);
  }

  private toDomain(raw: any): Member {
    return new Member(raw.id, raw.name, ...);
  }
}
```

#### 4. Use Cases (quando Fase 3 estiver completa)

Ao invés de lógica em Server Actions:

**❌ EVITE (código legado):**
```typescript
export async function updateMember(id, data) {
  const supabase = await createClient();

  // Validação
  if (!data.name) { ... }

  // Update
  const { data, error } = await supabase.from('members').update(data);

  // Audit
  await logMemberAction({ ... });

  // Cache
  revalidatePath('/admin/members');

  return { success: true };
}
```

**✅ PREFIRA (novo padrão):**
```typescript
// src/application/member/use-cases/UpdateMemberUseCase.ts
export class UpdateMemberUseCase {
  constructor(
    private memberRepo: MemberRepository,
    private auditLog: AuditLogService,
  ) {}

  async execute(command: UpdateMemberCommand, executedBy: User) {
    const member = await this.memberRepo.findById(command.id);
    if (!member) return Err({ type: 'NOT_FOUND' });

    member.update(command.data);
    await this.memberRepo.save(member);
    await this.auditLog.log({ ... });

    return Ok(member);
  }
}

// src/app/(admin)/admin/members/actions.ts (thin wrapper)
'use server';

export async function updateMemberAction(id, data) {
  const parsed = UpdateMemberSchema.safeParse(data);
  if (!parsed.success) return { success: false, errors: ... };

  const supabase = await createClient();
  const repo = new SupabaseMemberRepository(supabase);
  const useCase = new UpdateMemberUseCase(repo, auditLog);

  const result = await useCase.execute(parsed.data, currentUser);

  if (result.isErr()) return { success: false, error: ... };

  revalidatePath('/admin/members');
  return { success: true, data: result.value };
}
```

### Migração de Código Legado

**Regra geral**: Código legado pode permanecer no padrão antigo. Refatore apenas quando:

1. ✅ Você está implementando uma nova feature relacionada
2. ✅ Você está corrigindo um bug e quer adicionar testes
3. ✅ O código está difícil de manter
4. ❌ Nunca refatore "só por refatorar"

### Estrutura de Pastas (Alvo)

```
src/
├── app/                     # Next.js (Presentation)
├── domain/                  # 🆕 Entities, Repositories (interfaces)
├── application/             # 🆕 Use Cases, Commands, Queries
├── infrastructure/          # 🆕 Supabase, APIs, Services (implementações)
├── shared/                  # 🆕 Schemas, Types, Utils
├── components/              # UI Components
├── stores/                  # Client state
└── tests/                   # 🆕 Unit, Integration, E2E
```

### Roadmap de Arquitetura

Ver seção **"🏗️ REFATORAÇÃO DE ARQUITETURA"** em `docs/ROADMAP.md` para:

- Fase 1: Fundação (Zod + Testes) - **PRIORITÁRIO**
- Fase 2: Repository Pattern
- Fase 3: Use Cases
- Fase 4: Domain Entities (Opcional)

### Recursos de Aprendizado

- **Arquitetura**: `docs/ARCHITECTURE.md` (conceitos, exemplos, estrutura)
- **Testes**: `docs/TESTING_GUIDE.md` (Jest vs Playwright, setup, exemplos)
- **Padrões**: Repository, Use Case, Result Pattern, Validation

### Quando em Dúvida

1. Leia `docs/ARCHITECTURE.md` primeiro
2. Para testes, veja `docs/TESTING_GUIDE.md`
3. Siga exemplos de código existentes (se já houver features migradas)
4. Prefira simplicidade a over-engineering
5. Documente decisões importantes no próprio código
