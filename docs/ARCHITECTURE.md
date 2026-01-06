# 🏗️ Arquitetura do Sistema - Viva Esperança

> **Documentação técnica da arquitetura e padrões de design**
>
> **Status**: Em evolução (migração incremental para Clean Architecture Light)
>
> **Última atualização**: Janeiro 2026

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura Atual](#arquitetura-atual)
3. [Arquitetura Alvo](#arquitetura-alvo)
4. [Organização de Pastas](#organização-de-pastas)
5. [Padrões de Design](#padrões-de-design)
6. [Guia de Implementação](#guia-de-implementação)
7. [Testes](#testes)
8. [Roadmap de Migração](#roadmap-de-migração)

---

## 🎯 Visão Geral

### Stack Tecnológica

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Backend**: Next.js Server Actions + Supabase (PostgreSQL + Auth + Storage)
- **UI**: Tailwind CSS + shadcn/ui
- **Validação**: Zod (em implementação)
- **Testes**: Jest (unit) + Playwright (E2E) - em implementação
- **State Management**: Zustand (apenas auth state)

### Princípios Arquiteturais

1. **Server-First**: Máximo de lógica no servidor (Server Components + Actions)
2. **Type-Safety**: 100% TypeScript, zero `any`
3. **Separation of Concerns**: Queries separadas de Mutations
4. **Progressive Enhancement**: Funciona sem JavaScript (Server Components)
5. **Pragmatismo**: Evitar over-engineering, começar simples e evoluir conforme necessário

---

## 📦 Arquitetura Atual

### Estrutura Existente

```
src/
├── app/
│   ├── (admin)/admin/          # Área autenticada
│   │   ├── actions/            # ❌ Server Actions (mutations)
│   │   │   └── index.ts        # PROBLEMA: Tudo em 1 arquivo (~800 linhas)
│   │   ├── queries/            # ✅ Queries (leitura)
│   │   │   └── index.ts        # PROBLEMA: Tudo em 1 arquivo
│   │   ├── [feature]/          # Páginas por feature
│   │   │   ├── page.tsx        # Server Component
│   │   │   └── components/     # Client Components (dialogs, forms)
│   └── (site)/                 # Site público
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── forms/                  # GenericForm
│   └── [feature]/              # Feature-specific components
├── lib/
│   ├── supabase/               # ❌ Acoplamento forte
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── database.types.ts   # Auto-gerado
│   ├── utils.ts                # Helpers gerais
│   ├── format.ts               # Formatação
│   └── audit.ts                # ✅ Audit logs (bem estruturado)
└── stores/
    └── authStore.ts            # Zustand (apenas auth)
```

### Problemas Identificados

#### 1. **Transaction Script Anti-Pattern**

```typescript
// ❌ ATUAL: Tudo misturado em 1 função
export async function updateMember(memberId, memberData) {
  const supabase = await createClient();

  // Validação manual
  if (!memberData.name) {
    return { success: false, message: 'Nome obrigatório' };
  }

  // Acesso direto ao banco
  const { data, error } = await supabase
    .from('members')
    .update(memberData)
    .eq('id', memberId);

  if (error) {
    return { success: false, message: error.message };
  }

  // Audit log
  await logMemberAction({ ... });

  // Cache
  revalidatePath('/admin/members');

  return { success: true };
}
```

**Problemas:**
- Violação do Single Responsibility Principle
- Impossível testar lógica isoladamente
- Acoplamento forte com Supabase
- Validação inconsistente
- Erro handling primitivo

#### 2. **Falta de Camada de Domínio**

- Zero lógica de negócio encapsulada
- Regras espalhadas em múltiplos arquivos
- Difícil entender "o que o sistema faz"

#### 3. **Validação Fragmentada**

- Client: `react-hook-form` no GenericForm
- Server: Validação manual ad-hoc
- Sem schema compartilhado

---

## 🎯 Arquitetura Alvo

### Clean Architecture Light + DDD Tático

Inspirado em **Clean Architecture** (Uncle Bob) e **Domain-Driven Design** (Eric Evans), mas **adaptado para escala do projeto**.

### Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Next.js Pages, Server Actions, API Routes, Components)    │
│                                                               │
│  • Server Components (page.tsx)                              │
│  • Client Components (dialogs, forms)                        │
│  • Server Actions (thin wrappers)                            │
└────────────────────┬────────────────────────────────────────┘
                     │ depends on
┌────────────────────▼────────────────────────────────────────┐
│                   Application Layer                          │
│                    (Use Cases)                               │
│                                                               │
│  • UpdateMemberUseCase                                       │
│  • AssignTaskUseCase                                         │
│  • ApproveVisitorUseCase                                     │
│                                                               │
│  Orquestra: Validação → Domain → Repository → Audit         │
└────────────────────┬────────────────────────────────────────┘
                     │ depends on
┌────────────────────▼────────────────────────────────────────┐
│                    Domain Layer                              │
│              (Entities, Value Objects)                       │
│                                                               │
│  • Member (entity)                                           │
│  • Event (entity)                                            │
│  • Task (entity)                                             │
│  • PhoneNumber (value object)                                │
│                                                               │
│  Regras de negócio: member.canBeAssignedTo(task)            │
└────────────────────┬────────────────────────────────────────┘
                     │ depends on
┌────────────────────▼────────────────────────────────────────┐
│                Infrastructure Layer                          │
│          (Repositories, External Services)                   │
│                                                               │
│  • SupabaseMemberRepository                                  │
│  • SupabaseEventRepository                                   │
│  • SupabaseAuditLogService                                   │
│  • WhatsAppService (Evolution API)                           │
└─────────────────────────────────────────────────────────────┘
```

**Regra de Dependência:**
- Setas sempre apontam **para dentro** (Domain não conhece Infrastructure)
- Domain Layer **não depende de nada**
- Infrastructure depende de Domain (implementa interfaces)

---

## 📁 Organização de Pastas (Alvo)

### Estrutura Completa Detalhada

```
src/
├── app/                                    # Next.js App Router
│   ├── (admin)/admin/                      # Área autenticada
│   │   ├── [feature]/
│   │   │   ├── page.tsx                    # Server Component (UI)
│   │   │   ├── actions.ts                  # Server Actions (porta de entrada)
│   │   │   └── components/                 # Client Components
│   │   │       ├── AddDialog.tsx
│   │   │       ├── EditDialog.tsx
│   │   │       └── DeleteDialog.tsx
│   │   └── layout.tsx
│   ├── (site)/                             # Site público
│   └── api/                                # API Routes (se necessário)
│
├── domain/                                 # 🆕 CAMADA DE DOMÍNIO
│   ├── member/
│   │   ├── Member.ts                       # Entity
│   │   ├── MemberRepository.ts             # Interface (contrato)
│   │   ├── MemberErrors.ts                 # Domain errors
│   │   └── types.ts                        # Types específicos
│   ├── event/
│   │   ├── Event.ts
│   │   ├── EventRepository.ts
│   │   └── types.ts
│   ├── task/
│   │   ├── Task.ts
│   │   ├── TaskRepository.ts
│   │   └── types.ts
│   ├── visitor/
│   │   ├── Visitor.ts
│   │   └── VisitorRepository.ts
│   └── shared/                             # Value Objects compartilhados
│       ├── PhoneNumber.ts                  # Value Object
│       ├── Email.ts
│       └── Result.ts                       # Result<T, E> type
│
├── application/                            # 🆕 CAMADA DE APLICAÇÃO
│   ├── member/
│   │   ├── use-cases/
│   │   │   ├── CreateMemberUseCase.ts
│   │   │   ├── UpdateMemberUseCase.ts
│   │   │   ├── DeleteMemberUseCase.ts
│   │   │   └── ApproveMemberUseCase.ts
│   │   ├── commands/                       # DTOs de entrada
│   │   │   ├── CreateMemberCommand.ts
│   │   │   └── UpdateMemberCommand.ts
│   │   └── queries/                        # Queries (CQRS)
│   │       ├── GetMemberQuery.ts
│   │       └── ListMembersQuery.ts
│   ├── event/
│   │   ├── use-cases/
│   │   │   ├── CreateEventUseCase.ts
│   │   │   ├── AssignTaskUseCase.ts
│   │   │   └── SelfAssignTaskUseCase.ts
│   │   └── queries/
│   │       └── GetEventWithAssignmentsQuery.ts
│   └── shared/
│       ├── AuditLogService.ts              # Interface
│       └── errors/                         # Application errors
│           ├── NotFoundError.ts
│           ├── ForbiddenError.ts
│           └── ValidationError.ts
│
├── infrastructure/                         # 🆕 CAMADA DE INFRAESTRUTURA
│   ├── supabase/
│   │   ├── client.ts                       # Setup do cliente
│   │   ├── server.ts
│   │   ├── database.types.ts               # Auto-gerado
│   │   └── repositories/                   # Implementações
│   │       ├── SupabaseMemberRepository.ts # Implementa MemberRepository
│   │       ├── SupabaseEventRepository.ts
│   │       └── SupabaseAuditLogService.ts
│   ├── whatsapp/
│   │   └── EvolutionAPIService.ts          # Implementa WhatsAppService
│   └── cache/
│       └── NextCacheService.ts             # Wrapper para revalidatePath
│
├── shared/                                 # 🆕 SHARED KERNEL
│   ├── schemas/                            # Zod schemas
│   │   ├── memberSchemas.ts
│   │   ├── eventSchemas.ts
│   │   └── visitorSchemas.ts
│   ├── types/                              # Types globais
│   │   ├── common.ts
│   │   └── result.ts
│   └── utils/                              # Utilitários
│       ├── format.ts                       # Date, phone, etc.
│       └── cn.ts                           # Tailwind merge
│
├── components/                             # UI Components
│   ├── ui/                                 # shadcn/ui
│   ├── forms/
│   │   ├── GenericForm.tsx
│   │   └── fields/                         # Form fields customizados
│   └── [feature]/                          # Feature components
│
├── stores/                                 # Client state (Zustand)
│   └── authStore.ts
│
└── tests/                                  # 🆕 TESTES
    ├── unit/                               # Jest (unit tests)
    │   ├── domain/
    │   │   └── member/
    │   │       └── Member.test.ts
    │   └── application/
    │       └── member/
    │           └── UpdateMemberUseCase.test.ts
    ├── integration/                        # Jest (integration)
    │   └── repositories/
    │       └── SupabaseMemberRepository.test.ts
    └── e2e/                                # Playwright (end-to-end)
        ├── auth.spec.ts
        ├── members.spec.ts
        └── events.spec.ts
```

### Explicação das Pastas

#### `domain/`
- **O QUE**: Núcleo da aplicação, regras de negócio puras
- **PROIBIDO**: Importar Next.js, Supabase, React, etc.
- **PERMITIDO**: Apenas TypeScript puro e lógica de negócio
- **EXEMPLO**: `member.canBeAssignedToTask(task)` retorna true/false

#### `application/`
- **O QUE**: Orquestração de casos de uso
- **PROIBIDO**: Acesso direto a banco (usa repositories)
- **PERMITIDO**: Chamar domain, repositories, services
- **EXEMPLO**: `UpdateMemberUseCase` orquestra validação → update → audit log

#### `infrastructure/`
- **O QUE**: Implementações concretas (banco, APIs, cache)
- **PROIBIDO**: Lógica de negócio
- **PERMITIDO**: Código de integração, mappers, clients
- **EXEMPLO**: `SupabaseMemberRepository` implementa `MemberRepository`

#### `shared/`
- **O QUE**: Código compartilhado entre camadas
- **PROIBIDO**: Lógica específica de feature
- **PERMITIDO**: Schemas, types, utils
- **EXEMPLO**: `MemberSchema` usado no client (form) e server (validation)

---

## 🎨 Padrões de Design

### 1. Repository Pattern

**Interface (Domain):**
```typescript
// src/domain/member/MemberRepository.ts
export interface MemberRepository {
  findById(id: string): Promise<Member | null>;
  findAll(filters?: MemberFilters): Promise<Member[]>;
  save(member: Member): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**Implementação (Infrastructure):**
```typescript
// src/infrastructure/supabase/repositories/SupabaseMemberRepository.ts
import { MemberRepository } from '@/domain/member/MemberRepository';
import { Member } from '@/domain/member/Member';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseMemberRepository implements MemberRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Member | null> {
    const { data, error } = await this.supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.toDomain(data);
  }

  async save(member: Member): Promise<void> {
    const raw = this.toPersistence(member);

    const { error } = await this.supabase
      .from('members')
      .upsert(raw);

    if (error) throw new Error(error.message);
  }

  // Mappers: Domain ↔ Database
  private toDomain(raw: any): Member {
    return new Member(
      raw.id,
      raw.name,
      raw.phone,
      raw.role,
      raw.sector,
      raw.status,
    );
  }

  private toPersistence(member: Member): any {
    return {
      id: member.id,
      name: member.name,
      phone: member.phone,
      role: member.role,
      sector: member.sectors,
      status: member.status,
    };
  }
}
```

**Benefícios:**
- ✅ Desacopla banco de dados
- ✅ Facilita testes (mock do repository)
- ✅ Permite trocar Supabase por Prisma/Drizzle sem quebrar domain

---

### 2. Use Case Pattern

```typescript
// src/application/member/use-cases/UpdateMemberUseCase.ts
import { Member } from '@/domain/member/Member';
import { MemberRepository } from '@/domain/member/MemberRepository';
import { AuditLogService } from '@/application/shared/AuditLogService';
import { UpdateMemberCommand } from '../commands/UpdateMemberCommand';
import { Result, Ok, Err } from '@/shared/types/result';
import { ApplicationError } from '@/application/shared/errors';

export class UpdateMemberUseCase {
  constructor(
    private memberRepo: MemberRepository,
    private auditLog: AuditLogService,
  ) {}

  async execute(
    command: UpdateMemberCommand,
    executedBy: { id: string; name: string },
  ): Promise<Result<Member, ApplicationError>> {
    // 1. Busca membro existente
    const member = await this.memberRepo.findById(command.memberId);

    if (!member) {
      return Err({
        type: 'NOT_FOUND',
        message: 'Membro não encontrado',
      });
    }

    // 2. Valida permissão (pode ser extraído para AuthorizationService)
    if (!this.canUpdate(executedBy, member)) {
      return Err({
        type: 'FORBIDDEN',
        message: 'Sem permissão para atualizar este membro',
      });
    }

    // 3. Aplica mudanças (lógica de domain)
    const updateResult = member.update({
      name: command.name,
      phone: command.phone,
      sectors: command.sectors,
    });

    if (updateResult.isErr()) {
      return updateResult; // Erro de validação
    }

    // 4. Persiste
    await this.memberRepo.save(member);

    // 5. Registra audit log
    await this.auditLog.log({
      action: 'member_updated',
      executedBy: executedBy.id,
      executedByName: executedBy.name,
      resourceType: 'member',
      resourceId: member.id,
      details: {
        member_name: member.name,
        changes: command,
      },
    });

    return Ok(member);
  }

  private canUpdate(user: { id: string }, member: Member): boolean {
    // Lógica de autorização
    return true; // Simplificado
  }
}
```

**Benefícios:**
- ✅ Lógica de aplicação isolada e testável
- ✅ Reutilizável (Server Action, API Route, CLI)
- ✅ Fácil adicionar cross-cutting concerns (logging, cache, eventos)

---

### 3. Result Pattern (Error Handling)

**Tipo:**
```typescript
// src/shared/types/result.ts
export type Result<T, E> = Ok<T> | Err<E>;

export type Ok<T> = {
  isOk: true;
  isErr: false;
  value: T;
};

export type Err<E> = {
  isOk: false;
  isErr: true;
  error: E;
};

export function Ok<T>(value: T): Ok<T> {
  return { isOk: true, isErr: false, value };
}

export function Err<E>(error: E): Err<E> {
  return { isOk: false, isErr: true, error };
}
```

**Uso:**
```typescript
// Em vez de throw exceptions
const result = await updateMemberUseCase.execute(command, user);

if (result.isErr()) {
  // Trata erro
  console.error(result.error);
  return { success: false, error: result.error.message };
}

// Sucesso
const member = result.value;
return { success: true, data: member };
```

**Benefícios:**
- ✅ Erros explícitos no tipo (compile-time safety)
- ✅ Força tratamento de erros
- ✅ Sem try/catch excessivos

---

### 4. Validation com Zod

**Schema:**
```typescript
// src/shared/schemas/memberSchemas.ts
import { z } from 'zod';

export const CreateMemberSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),

  phone: z.string()
    .regex(/^\d{11}$/, 'Telefone deve ter 11 dígitos'),

  role: z.enum([
    'admin',
    'pastor(a)',
    'lider_midia',
    'lider_geral',
    'membro',
  ], { errorMap: () => ({ message: 'Role inválido' }) }),

  sector: z.array(z.enum([
    'mídia',
    'geral',
    'louvor',
    'infantil',
    'social',
  ])).min(1, 'Selecione pelo menos um setor'),
});

export type CreateMemberData = z.infer<typeof CreateMemberSchema>;

// Schema para update (todos os campos opcionais)
export const UpdateMemberSchema = CreateMemberSchema.partial();
```

**Client (Form):**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateMemberSchema } from '@/shared/schemas/memberSchemas';

const form = useForm({
  resolver: zodResolver(CreateMemberSchema),
});
```

**Server (Action):**
```typescript
'use server';

export async function createMemberAction(data: unknown) {
  // Valida
  const parsed = CreateMemberSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Usa dados validados
  const validData = parsed.data;

  // ... chama use case
}
```

**Benefícios:**
- ✅ Mesma validação client + server
- ✅ Type-safe (TypeScript infere tipos)
- ✅ Mensagens de erro customizáveis
- ✅ Validações complexas (refine, transform)

---

## 📝 Guia de Implementação

### Como Criar uma Nova Feature (Passo a Passo)

#### Exemplo: Feature "Células" (Grupos Pequenos)

**1. Domain Layer**

```typescript
// src/domain/cell/Cell.ts
export class Cell {
  constructor(
    public readonly id: string,
    public name: string,
    public leaderId: string,
    public members: string[],
    public meetingDay: DayOfWeek,
  ) {}

  addMember(memberId: string): Result<void, string> {
    if (this.members.includes(memberId)) {
      return Err('Membro já está na célula');
    }

    if (this.members.length >= 15) {
      return Err('Célula cheia (máximo 15 membros)');
    }

    this.members.push(memberId);
    return Ok(undefined);
  }

  isFull(): boolean {
    return this.members.length >= 15;
  }
}

// src/domain/cell/CellRepository.ts
export interface CellRepository {
  findById(id: string): Promise<Cell | null>;
  findAll(): Promise<Cell[]>;
  save(cell: Cell): Promise<void>;
}
```

**2. Validation Schema**

```typescript
// src/shared/schemas/cellSchemas.ts
export const CreateCellSchema = z.object({
  name: z.string().min(3),
  leaderId: z.string().uuid(),
  meetingDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
});
```

**3. Use Case**

```typescript
// src/application/cell/use-cases/CreateCellUseCase.ts
export class CreateCellUseCase {
  constructor(
    private cellRepo: CellRepository,
    private memberRepo: MemberRepository,
  ) {}

  async execute(command: CreateCellCommand): Promise<Result<Cell, ApplicationError>> {
    // Valida que líder existe e tem permissão
    const leader = await this.memberRepo.findById(command.leaderId);

    if (!leader) {
      return Err({ type: 'NOT_FOUND', message: 'Líder não encontrado' });
    }

    // Cria célula
    const cell = new Cell(
      crypto.randomUUID(),
      command.name,
      command.leaderId,
      [],
      command.meetingDay,
    );

    // Persiste
    await this.cellRepo.save(cell);

    return Ok(cell);
  }
}
```

**4. Repository Implementation**

```typescript
// src/infrastructure/supabase/repositories/SupabaseCellRepository.ts
export class SupabaseCellRepository implements CellRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(cell: Cell): Promise<void> {
    const { error } = await this.supabase
      .from('cells')
      .upsert({
        id: cell.id,
        name: cell.name,
        leader_id: cell.leaderId,
        members: cell.members,
        meeting_day: cell.meetingDay,
      });

    if (error) throw new Error(error.message);
  }
}
```

**5. Server Action (Thin Layer)**

```typescript
// src/app/(admin)/admin/cells/actions.ts
'use server';

import { CreateCellSchema } from '@/shared/schemas/cellSchemas';
import { CreateCellUseCase } from '@/application/cell/use-cases/CreateCellUseCase';
import { SupabaseCellRepository } from '@/infrastructure/supabase/repositories/SupabaseCellRepository';

export async function createCellAction(data: unknown) {
  // 1. Validação
  const parsed = CreateCellSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten() };
  }

  // 2. Setup de dependências
  const supabase = await createClient();
  const cellRepo = new SupabaseCellRepository(supabase);
  const memberRepo = new SupabaseMemberRepository(supabase);
  const useCase = new CreateCellUseCase(cellRepo, memberRepo);

  // 3. Executa
  const result = await useCase.execute(parsed.data);

  if (result.isErr()) {
    return { success: false, error: result.error.message };
  }

  // 4. Cache
  revalidatePath('/admin/cells');

  return { success: true, data: result.value };
}
```

**6. UI Component**

```typescript
// src/app/(admin)/admin/cells/components/AddCellDialog.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCellSchema } from '@/shared/schemas/cellSchemas';
import { createCellAction } from '../actions';

export function AddCellDialog() {
  const form = useForm({
    resolver: zodResolver(CreateCellSchema),
  });

  async function onSubmit(data) {
    const result = await createCellAction(data);

    if (result.success) {
      toast.success('Célula criada!');
    } else {
      toast.error(result.error);
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

---

## 🧪 Testes

### Diferença: Jest vs Playwright

| Aspecto | Jest | Playwright |
|---------|------|------------|
| **Tipo** | Unit + Integration | End-to-End (E2E) |
| **O que testa** | Funções, classes, lógica isolada | Fluxo completo do usuário |
| **Ambiente** | Node.js | Browser real (Chromium, Firefox, WebKit) |
| **Velocidade** | ⚡ Rápido (ms) | 🐢 Lento (segundos) |
| **Cobertura** | Código isolado | Sistema completo |
| **Quando usar** | TDD, lógica de negócio | Happy paths, fluxos críticos |
| **Exemplo** | Testar `member.canBeAssignedTo(task)` | Testar login → criar evento → atribuir tarefa |

### Pirâmide de Testes

```
        /\
       /  \        E2E (Playwright)
      /____\       Poucos, lentos, caros
     /      \
    /        \     Integration (Jest)
   /__________\    Médios
  /            \
 /              \  Unit (Jest)
/________________\ Muitos, rápidos, baratos
```

**Regra de Ouro:** 70% unit, 20% integration, 10% E2E

### Exemplo: Unit Test (Jest)

```typescript
// src/tests/unit/domain/member/Member.test.ts
import { Member } from '@/domain/member/Member';
import { Task } from '@/domain/task/Task';

describe('Member', () => {
  describe('canBeAssignedTo', () => {
    it('deve retornar true se membro tem setor da tarefa', () => {
      // Arrange
      const member = new Member(
        '1',
        'João',
        '11999999999',
        'membro',
        ['mídia'], // setor
        'ativo',
      );

      const task = new Task('1', 'Som', 'mídia', 1);

      // Act
      const result = member.canBeAssignedTo(task);

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar false se membro não tem setor da tarefa', () => {
      const member = new Member('1', 'João', '11999999999', 'membro', ['louvor'], 'ativo');
      const task = new Task('1', 'Som', 'mídia', 1);

      const result = member.canBeAssignedTo(task);

      expect(result).toBe(false);
    });

    it('deve retornar false se membro está inativo', () => {
      const member = new Member('1', 'João', '11999999999', 'membro', ['mídia'], 'inativo');
      const task = new Task('1', 'Som', 'mídia', 1);

      const result = member.canBeAssignedTo(task);

      expect(result).toBe(false);
    });
  });
});
```

### Exemplo: Integration Test (Jest)

```typescript
// src/tests/integration/repositories/SupabaseMemberRepository.test.ts
import { SupabaseMemberRepository } from '@/infrastructure/supabase/repositories/SupabaseMemberRepository';
import { createClient } from '@supabase/supabase-js';
import { Member } from '@/domain/member/Member';

describe('SupabaseMemberRepository', () => {
  let repo: SupabaseMemberRepository;

  beforeAll(() => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
    repo = new SupabaseMemberRepository(supabase);
  });

  it('deve salvar e buscar membro', async () => {
    // Arrange
    const member = new Member(
      crypto.randomUUID(),
      'Teste',
      '11999999999',
      'membro',
      ['mídia'],
      'ativo',
    );

    // Act
    await repo.save(member);
    const found = await repo.findById(member.id);

    // Assert
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Teste');
  });
});
```

### Exemplo: E2E Test (Playwright)

```typescript
// src/tests/e2e/members.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Membros', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin');
  });

  test('deve criar novo membro', async ({ page }) => {
    // Navega para membros
    await page.goto('/admin/members');

    // Abre dialog
    await page.click('text=Adicionar Membro');

    // Preenche formulário
    await page.fill('input[name="name"]', 'João da Silva');
    await page.fill('input[name="phone"]', '11999999999');
    await page.selectOption('select[name="role"]', 'membro');

    // Submete
    await page.click('button[type="submit"]');

    // Verifica sucesso
    await expect(page.locator('text=Membro adicionado com sucesso')).toBeVisible();
    await expect(page.locator('text=João da Silva')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/admin/members');
    await page.click('text=Adicionar Membro');
    await page.click('button[type="submit"]'); // Submete vazio

    // Verifica erros
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible();
  });
});
```

---

## 🗺️ Roadmap de Migração

### Fase 1: Fundação (2 semanas) - **PRIORITÁRIO**

**Objetivos:**
- ✅ Setup de testes
- ✅ Validação com Zod
- ✅ Primeiros schemas

**Tarefas:**
1. Instalar dependências:
   ```bash
   npm install zod @hookform/resolvers
   npm install -D jest @testing-library/react @testing-library/jest-dom
   npm install -D @playwright/test
   ```

2. Configurar Jest (`jest.config.js`)
3. Configurar Playwright (`playwright.config.ts`)
4. Criar schemas Zod para Member, Event, Visitor
5. Refatorar 1-2 forms para usar Zod
6. Escrever 5-10 testes de exemplo

**Resultado esperado:**
- Schemas funcionando em 2-3 features
- Testes rodando com `npm test`
- CI configurado (opcional)

---

### Fase 2: Repository Pattern (3 semanas)

**Objetivos:**
- ✅ Desacoplar Supabase
- ✅ Queries testáveis

**Tarefas:**
1. Criar `src/domain/member/MemberRepository.ts` (interface)
2. Criar `src/infrastructure/supabase/repositories/SupabaseMemberRepository.ts`
3. Migrar queries de membros para usar repository
4. Repetir para Event, Task, Visitor
5. Escrever integration tests para repositories

**Resultado esperado:**
- 4 repositories implementados
- Queries usando repositories
- 15-20 testes de integração

---

### Fase 3: Use Cases (4 semanas)

**Objetivos:**
- ✅ Lógica de aplicação isolada
- ✅ Server Actions simplificadas

**Tarefas:**
1. Criar estrutura `src/application/`
2. Implementar Use Cases para operações CRUD de Member
3. Refatorar Server Actions para chamar Use Cases
4. Adicionar Result Pattern
5. Escrever unit tests para Use Cases

**Resultado esperado:**
- 10-15 Use Cases implementados
- Server Actions como thin wrappers
- 50+ unit tests

---

### Fase 4: Domain Entities (Opcional - 2-3 semanas)

**Objetivos:**
- ✅ Regras de negócio encapsuladas
- ✅ Lógica testável isoladamente

**Tarefas:**
1. Criar classes `Member`, `Event`, `Task`
2. Mover validações e regras para entidades
3. Repositories retornam entidades
4. Escrever unit tests para domain logic

**Resultado esperado:**
- Domain layer completo
- 80%+ de code coverage em domain
- Sistema totalmente desacoplado

---

## 📚 Recursos de Aprendizado

### Livros
- **Clean Architecture** - Robert C. Martin
- **Domain-Driven Design Distilled** - Vaughn Vernon
- **Implementing Domain-Driven Design** - Vaughn Vernon

### Artigos
- [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)
- [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Vídeos
- [ITkonekt 2019 | Robert C. Martin (Uncle Bob), Clean Architecture and Design](https://www.youtube.com/watch?v=2dKZ-dWaCiU)

### Exemplos de Código
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [Domain-Driven Hexagon](https://github.com/Sairyss/domain-driven-hexagon)

---

**Mantido por:** Cleyton Mendes + Claude Code
**Última atualização:** Janeiro 2026
