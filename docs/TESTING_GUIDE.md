# 🧪 Guia de Testes - Viva Esperança

> **Documentação completa sobre estratégia de testes, ferramentas e boas práticas**
>
> **Status**: Em implementação
>
> **Última atualização**: Janeiro 2026

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Jest vs Playwright](#jest-vs-playwright)
3. [Pirâmide de Testes](#pirâmide-de-testes)
4. [Setup e Configuração](#setup-e-configuração)
5. [Testes Unitários (Jest)](#testes-unitários-jest)
6. [Testes de Integração (Jest)](#testes-de-integração-jest)
7. [Testes E2E (Playwright)](#testes-e2e-playwright)
8. [Boas Práticas](#boas-práticas)
9. [CI/CD](#cicd)

---

## 🎯 Visão Geral

### Por que testar?

1. **Confiança**: Deploy sem medo de quebrar algo
2. **Documentação viva**: Testes mostram como o código deve funcionar
3. **Refatoração segura**: Mude a estrutura sem quebrar comportamento
4. **Menos bugs**: Detecta problemas antes de chegarem ao usuário
5. **Desenvolvimento mais rápido**: Menos tempo debugando

### Estratégia de Testes

```
Feature Nova → TDD (Test-Driven Development)
  1. Escreve teste (vermelho)
  2. Implementa mínimo (verde)
  3. Refatora (melhora código)

Feature Existente → Testes antes de mudar
  1. Adiciona testes para comportamento atual
  2. Refatora com confiança
  3. Testes garantem que nada quebrou
```

---

## ⚖️ Jest vs Playwright

### Comparação Detalhada

| Característica | Jest | Playwright |
|----------------|------|------------|
| **Tipo** | Test Runner + Assertion Library | Browser Automation Framework |
| **Propósito** | Testar lógica de negócio, funções, componentes | Testar fluxos de usuário no browser |
| **Ambiente** | Node.js (JSDOM para componentes React) | Browser real (Chromium, Firefox, WebKit) |
| **Velocidade** | ⚡⚡⚡ Muito rápido (milissegundos) | 🐢 Lento (segundos/minutos) |
| **Isolamento** | ✅ Total (cada teste isolado) | ⚠️ Pode ter side effects (banco, cache) |
| **Debugging** | ✅ Fácil (console.log, breakpoints) | ⚠️ Mais complexo (UI, traces, vídeos) |
| **Custo** | 💰 Barato (roda local, CI grátis) | 💰💰 Mais caro (CI precisa de mais recursos) |
| **Cobertura** | 📦 Código isolado | 🌍 Sistema completo (frontend + backend + banco) |
| **Quando usar** | Sempre (TDD, lógica de negócio) | Fluxos críticos, happy paths |

### Exemplo Visual

**Jest:**
```typescript
// Testa FUNÇÃO ISOLADA
function calculateDiscount(price: number, percentage: number): number {
  return price * (percentage / 100);
}

// ✅ Jest é perfeito aqui
test('deve calcular desconto corretamente', () => {
  expect(calculateDiscount(100, 10)).toBe(10);
});
```

**Playwright:**
```typescript
// Testa FLUXO COMPLETO DO USUÁRIO
test('usuário consegue criar evento e atribuir tarefa', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@test.com');
  await page.click('button[type="submit"]');

  await page.goto('/admin/events');
  await page.click('text=Criar Evento');
  await page.fill('[name="name"]', 'Culto de Domingo');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Culto de Domingo')).toBeVisible();
});
```

---

## 🔺 Pirâmide de Testes

### Conceito

```
           /\
          /E2E\          10% - Poucos, lentos, caros
         /______\        Testa: Happy paths críticos
        /        \
       /Integration\     20% - Médios
      /____________\     Testa: Integração entre componentes
     /              \
    /      Unit      \   70% - Muitos, rápidos, baratos
   /__________________\  Testa: Lógica de negócio isolada
```

### Regras de Ouro

1. **Base larga**: Maioria dos testes são unitários (rápidos, baratos)
2. **Topo estreito**: Poucos testes E2E (lentos, caros, mas críticos)
3. **Equilíbrio**: Não exagere em E2E (manutenção cara)

### Distribuição no Projeto

| Tipo | Quantidade | Tempo Execução | Quando Rodar |
|------|------------|----------------|--------------|
| Unit | ~200 testes | < 5 segundos | A cada mudança (watch mode) |
| Integration | ~50 testes | ~30 segundos | Pre-commit hook |
| E2E | ~15 testes | ~3 minutos | Pre-push, CI/CD |

---

## 🛠️ Setup e Configuração

### 1. Instalar Dependências

```bash
# Jest (unit + integration)
npm install -D jest @types/jest ts-jest
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event

# Playwright (E2E)
npm install -D @playwright/test
npx playwright install # Instala browsers
```

### 2. Configurar Jest

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Path para Next.js app (carrega next.config.js e .env)
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/tests/unit/**/*.test.ts',
    '<rootDir>/src/tests/unit/**/*.test.tsx',
    '<rootDir>/src/tests/integration/**/*.test.ts',
  ],
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/application/**/*.ts',
    'src/infrastructure/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.types.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom'

// Mock de environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key'
```

### 3. Configurar Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Inicia servidor de dev antes dos testes
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4. Scripts no package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 🧩 Testes Unitários (Jest)

### O que testar?

- ✅ Lógica de negócio pura (Domain Entities)
- ✅ Funções utilitárias (format.ts, utils.ts)
- ✅ Use Cases (Application Layer)
- ❌ Componentes UI simples (mudam muito)
- ❌ Código gerado (database.types.ts)

### Anatomia de um Teste

```typescript
// AAA Pattern: Arrange, Act, Assert

describe('Member', () => {
  describe('canBeAssignedTo', () => {
    it('deve retornar true quando membro tem setor compatível', () => {
      // ARRANGE (preparação)
      const member = new Member(
        '1',
        'João Silva',
        '11999999999',
        'membro',
        ['mídia'],
        'ativo',
      );

      const task = new Task('1', 'Operador de Som', 'mídia', 1);

      // ACT (ação)
      const result = member.canBeAssignedTo(task);

      // ASSERT (verificação)
      expect(result).toBe(true);
    });
  });
});
```

### Exemplo 1: Testar Domain Entity

```typescript
// src/tests/unit/domain/member/Member.test.ts
import { Member } from '@/domain/member/Member';
import { Task } from '@/domain/task/Task';

describe('Member', () => {
  describe('canBeAssignedTo', () => {
    it('deve retornar true quando membro tem setor da tarefa', () => {
      const member = new Member('1', 'João', '11999999999', 'membro', ['mídia'], 'ativo');
      const task = new Task('1', 'Som', 'mídia', 1);

      expect(member.canBeAssignedTo(task)).toBe(true);
    });

    it('deve retornar false quando membro não tem setor da tarefa', () => {
      const member = new Member('1', 'João', '11999999999', 'membro', ['louvor'], 'ativo');
      const task = new Task('1', 'Som', 'mídia', 1);

      expect(member.canBeAssignedTo(task)).toBe(false);
    });

    it('deve retornar false quando membro está inativo', () => {
      const member = new Member('1', 'João', '11999999999', 'membro', ['mídia'], 'inativo');
      const task = new Task('1', 'Som', 'mídia', 1);

      expect(member.canBeAssignedTo(task)).toBe(false);
    });
  });

  describe('addSector', () => {
    it('deve adicionar setor quando não existe', () => {
      const member = new Member('1', 'João', '11999999999', 'membro', ['mídia'], 'ativo');

      const result = member.addSector('louvor');

      expect(result.isOk).toBe(true);
      expect(member.sectors).toContain('louvor');
    });

    it('deve retornar erro quando setor já existe', () => {
      const member = new Member('1', 'João', '11999999999', 'membro', ['mídia'], 'ativo');

      const result = member.addSector('mídia');

      expect(result.isErr).toBe(true);
      expect(result.error).toBe('Membro já possui este setor');
    });
  });
});
```

### Exemplo 2: Testar Use Case (com Mocks)

```typescript
// src/tests/unit/application/member/UpdateMemberUseCase.test.ts
import { UpdateMemberUseCase } from '@/application/member/use-cases/UpdateMemberUseCase';
import { MemberRepository } from '@/domain/member/MemberRepository';
import { AuditLogService } from '@/application/shared/AuditLogService';
import { Member } from '@/domain/member/Member';

// Mock do repository
const mockMemberRepo: jest.Mocked<MemberRepository> = {
  findById: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
};

// Mock do audit log
const mockAuditLog: jest.Mocked<AuditLogService> = {
  log: jest.fn(),
};

describe('UpdateMemberUseCase', () => {
  let useCase: UpdateMemberUseCase;

  beforeEach(() => {
    useCase = new UpdateMemberUseCase(mockMemberRepo, mockAuditLog);
    jest.clearAllMocks();
  });

  it('deve atualizar membro com sucesso', async () => {
    // Arrange
    const existingMember = new Member(
      '1',
      'João Silva',
      '11999999999',
      'membro',
      ['mídia'],
      'ativo',
    );

    mockMemberRepo.findById.mockResolvedValue(existingMember);
    mockMemberRepo.save.mockResolvedValue();

    const command = {
      memberId: '1',
      name: 'João Santos',
      phone: '11888888888',
      sectors: ['mídia', 'louvor'],
    };

    const executedBy = { id: 'admin-id', name: 'Admin' };

    // Act
    const result = await useCase.execute(command, executedBy);

    // Assert
    expect(result.isOk).toBe(true);
    expect(mockMemberRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'João Santos' })
    );
    expect(mockAuditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'member_updated',
        executedBy: 'admin-id',
      })
    );
  });

  it('deve retornar erro quando membro não existe', async () => {
    // Arrange
    mockMemberRepo.findById.mockResolvedValue(null);

    const command = {
      memberId: '999',
      name: 'João',
      phone: '11999999999',
      sectors: ['mídia'],
    };

    // Act
    const result = await useCase.execute(command, { id: 'admin', name: 'Admin' });

    // Assert
    expect(result.isErr).toBe(true);
    expect(result.error.type).toBe('NOT_FOUND');
    expect(mockMemberRepo.save).not.toHaveBeenCalled();
  });
});
```

### Exemplo 3: Testar Funções Utilitárias

```typescript
// src/tests/unit/shared/utils/format.test.ts
import { formatPhoneNumber, formatDate, formatDateTime } from '@/lib/format';

describe('formatPhoneNumber', () => {
  it('deve formatar telefone com 11 dígitos', () => {
    expect(formatPhoneNumber('11999998888')).toBe('(11) 99999-8888');
  });

  it('deve retornar string original se inválido', () => {
    expect(formatPhoneNumber('123')).toBe('123');
  });

  it('deve lidar com null/undefined', () => {
    expect(formatPhoneNumber(null)).toBe('');
    expect(formatPhoneNumber(undefined)).toBe('');
  });
});

describe('formatDate', () => {
  it('deve formatar data ISO para pt-BR', () => {
    expect(formatDate('2026-01-05T10:00:00Z')).toBe('05/01/2026');
  });

  it('deve lidar com data inválida', () => {
    expect(formatDate('invalid')).toBe('Data inválida');
  });
});
```

---

## 🔗 Testes de Integração (Jest)

### O que testar?

- ✅ Repositories (Domain ↔ Database)
- ✅ Services externos (Evolution API, Supabase Storage)
- ✅ Server Actions (Validation → Use Case → Cache)
- ❌ Queries simples (desnecessário)

### Características

- Usa banco de dados **real** (test environment)
- Setup/Teardown de dados
- Mais lento que unit (mas ainda rápido)

### Exemplo 1: Testar Repository

```typescript
// src/tests/integration/repositories/SupabaseMemberRepository.test.ts
import { SupabaseMemberRepository } from '@/infrastructure/supabase/repositories/SupabaseMemberRepository';
import { createClient } from '@supabase/supabase-js';
import { Member } from '@/domain/member/Member';

describe('SupabaseMemberRepository', () => {
  let repo: SupabaseMemberRepository;
  let supabase: any;

  beforeAll(() => {
    supabase = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_SERVICE_KEY!,
    );
    repo = new SupabaseMemberRepository(supabase);
  });

  afterEach(async () => {
    // Limpa dados de teste
    await supabase.from('members').delete().like('name', 'Test%');
  });

  it('deve salvar e buscar membro', async () => {
    // Arrange
    const member = new Member(
      crypto.randomUUID(),
      'Test Member',
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
    expect(found?.name).toBe('Test Member');
    expect(found?.sectors).toEqual(['mídia']);
  });

  it('deve retornar null quando membro não existe', async () => {
    const found = await repo.findById('non-existent-id');
    expect(found).toBeNull();
  });

  it('deve atualizar membro existente', async () => {
    // Cria
    const member = new Member(
      crypto.randomUUID(),
      'Test Member',
      '11999999999',
      'membro',
      ['mídia'],
      'ativo',
    );
    await repo.save(member);

    // Atualiza
    member.name = 'Updated Name';
    await repo.save(member);

    // Verifica
    const found = await repo.findById(member.id);
    expect(found?.name).toBe('Updated Name');
  });
});
```

### Exemplo 2: Testar Server Action

```typescript
// src/tests/integration/actions/memberActions.test.ts
import { updateMemberAction } from '@/app/(admin)/admin/members/actions';
import { createClient } from '@supabase/supabase-js';

describe('updateMemberAction', () => {
  let supabase: any;
  let testMemberId: string;

  beforeAll(async () => {
    supabase = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_SERVICE_KEY!,
    );

    // Cria membro de teste
    const { data } = await supabase
      .from('members')
      .insert({
        name: 'Test Member',
        phone: '11999999999',
        role: 'membro',
        sector: ['mídia'],
        status: 'ativo',
      })
      .select()
      .single();

    testMemberId = data.id;
  });

  afterAll(async () => {
    await supabase.from('members').delete().eq('id', testMemberId);
  });

  it('deve atualizar membro com dados válidos', async () => {
    const result = await updateMemberAction(testMemberId, {
      name: 'Updated Name',
      phone: '11888888888',
    });

    expect(result.success).toBe(true);

    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('id', testMemberId)
      .single();

    expect(data.name).toBe('Updated Name');
  });

  it('deve retornar erro com dados inválidos', async () => {
    const result = await updateMemberAction(testMemberId, {
      name: 'A', // Muito curto
      phone: '123', // Inválido
    });

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});
```

---

## 🌐 Testes E2E (Playwright)

### O que testar?

- ✅ Fluxos críticos de usuário (happy paths)
- ✅ Jornadas completas (login → criar → editar → deletar)
- ✅ Casos de uso principais
- ❌ Todos os edge cases (use unit tests)
- ❌ Validações simples (use unit tests)

### Características

- Browser **real** (Chromium, Firefox, WebKit)
- Testa UI + Backend + Banco completo
- Lento (3-10 segundos por teste)
- Custoso de manter

### Exemplo 1: Fluxo de Autenticação

```typescript
// src/tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Verifica redirecionamento
    await expect(page).toHaveURL('/admin');

    // Verifica sidebar visível
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Verifica mensagem de erro
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();

    // Não redireciona
    await expect(page).toHaveURL('/login');
  });

  test('deve fazer logout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/admin');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sair');

    // Verifica redirecionamento para login
    await expect(page).toHaveURL('/login');
  });
});
```

### Exemplo 2: CRUD de Membros

```typescript
// src/tests/e2e/members.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Membros', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin');
  });

  test('deve criar novo membro', async ({ page }) => {
    await page.goto('/admin/members');

    // Abre dialog
    await page.click('text=Adicionar Membro');

    // Aguarda dialog aparecer
    await expect(page.locator('dialog')).toBeVisible();

    // Preenche formulário
    await page.fill('input[name="name"]', 'João da Silva E2E');
    await page.fill('input[name="phone"]', '11999999999');
    await page.selectOption('select[name="role"]', 'membro');
    await page.click('input[value="mídia"]'); // Checkbox

    // Submete
    await page.click('dialog button[type="submit"]');

    // Verifica toast de sucesso
    await expect(page.locator('text=Membro adicionado com sucesso')).toBeVisible();

    // Verifica membro na lista
    await expect(page.locator('text=João da Silva E2E')).toBeVisible();
  });

  test('deve editar membro existente', async ({ page }) => {
    await page.goto('/admin/members');

    // Assume que existe um membro "Test Member"
    await page.click('[data-testid="edit-member-btn"]').first();

    await expect(page.locator('dialog')).toBeVisible();

    // Altera nome
    await page.fill('input[name="name"]', 'Nome Editado E2E');
    await page.click('button[type="submit"]');

    // Verifica sucesso
    await expect(page.locator('text=Membro atualizado com sucesso')).toBeVisible();
    await expect(page.locator('text=Nome Editado E2E')).toBeVisible();
  });

  test('deve deletar membro', async ({ page }) => {
    await page.goto('/admin/members');

    const initialCount = await page.locator('[data-testid="member-row"]').count();

    // Clica em deletar
    await page.click('[data-testid="delete-member-btn"]').first();

    // Confirma no dialog
    await page.click('dialog button:has-text("Confirmar")');

    // Verifica toast
    await expect(page.locator('text=Membro removido com sucesso')).toBeVisible();

    // Verifica que contagem diminuiu
    const newCount = await page.locator('[data-testid="member-row"]').count();
    expect(newCount).toBe(initialCount - 1);
  });
});
```

### Exemplo 3: Fluxo Completo (Jornada do Usuário)

```typescript
// src/tests/e2e/event-assignment-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Fluxo Completo: Criar Evento e Atribuir Tarefa', () => {
  test('líder cria evento e atribui tarefa a membro', async ({ page }) => {
    // 1. Login como líder
    await page.goto('/login');
    await page.fill('input[name="email"]', 'lider@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Navega para eventos
    await page.click('text=Eventos');
    await expect(page).toHaveURL('/admin/events');

    // 3. Cria novo evento
    await page.click('text=Criar Evento');
    await page.fill('input[name="name"]', 'Culto de Domingo - E2E');
    await page.fill('input[name="event_date"]', '2026-02-01T10:00');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Evento criado com sucesso')).toBeVisible();

    // 4. Entra no evento
    await page.click('text=Culto de Domingo - E2E');

    // 5. Adiciona tarefa ao evento
    await page.click('text=Adicionar Tarefa');
    await page.selectOption('select[name="task"]', { label: 'Som' });
    await page.click('button:has-text("Adicionar")');

    // 6. Atribui tarefa a membro
    await page.click('[data-testid="assign-task-btn"]');
    await page.selectOption('select[name="member"]', { label: 'João Silva' });
    await page.click('button:has-text("Atribuir")');

    // Verifica sucesso
    await expect(page.locator('text=Tarefa atribuída com sucesso')).toBeVisible();
    await expect(page.locator('text=João Silva')).toBeVisible();

    // 7. Verifica audit log
    await page.goto('/admin/atividades');
    await expect(page.locator('text=Atribuiu tarefa "Som" para João Silva')).toBeVisible();
  });
});
```

---

## ✅ Boas Práticas

### 1. Nomenclatura de Testes

```typescript
// ✅ BOM: Descritivo, em português, lê como frase
describe('Member', () => {
  describe('canBeAssignedTo', () => {
    it('deve retornar true quando membro tem setor compatível', () => {});
    it('deve retornar false quando membro está inativo', () => {});
  });
});

// ❌ RUIM: Genérico, em inglês misturado
describe('Member', () => {
  it('test assign', () => {});
  it('works', () => {});
});
```

### 2. AAA Pattern

```typescript
it('deve adicionar setor ao membro', () => {
  // ARRANGE: Preparação
  const member = new Member(...);

  // ACT: Ação
  const result = member.addSector('louvor');

  // ASSERT: Verificação
  expect(result.isOk).toBe(true);
  expect(member.sectors).toContain('louvor');
});
```

### 3. DRY com beforeEach

```typescript
describe('UpdateMemberUseCase', () => {
  let useCase: UpdateMemberUseCase;
  let mockRepo: jest.Mocked<MemberRepository>;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    useCase = new UpdateMemberUseCase(mockRepo);
  });

  // Todos os testes usam mesma configuração
  it('teste 1', () => { ... });
  it('teste 2', () => { ... });
});
```

### 4. Test Data Builders

```typescript
// src/tests/helpers/builders/MemberBuilder.ts
export class MemberBuilder {
  private id = '1';
  private name = 'Test Member';
  private phone = '11999999999';
  private role = 'membro';
  private sectors = ['mídia'];
  private status = 'ativo';

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withSectors(sectors: string[]): this {
    this.sectors = sectors;
    return this;
  }

  inactive(): this {
    this.status = 'inativo';
    return this;
  }

  build(): Member {
    return new Member(
      this.id,
      this.name,
      this.phone,
      this.role,
      this.sectors,
      this.status,
    );
  }
}

// Uso:
const member = new MemberBuilder()
  .withName('João')
  .withSectors(['mídia', 'louvor'])
  .build();
```

### 5. Mocks vs Stubs vs Spies

```typescript
// MOCK: Objeto fake completo
const mockRepo = {
  findById: jest.fn().mockResolvedValue(member),
  save: jest.fn(),
};

// STUB: Apenas retorna valor fixo
const stubRepo = {
  findById: () => Promise.resolve(member),
};

// SPY: Espiona função real
const spy = jest.spyOn(repo, 'save');
await useCase.execute(...);
expect(spy).toHaveBeenCalledWith(member);
```

### 6. Test Isolation

```typescript
// ✅ BOM: Cada teste independente
describe('Member', () => {
  it('teste 1', () => {
    const member = new Member(...);
    // ...
  });

  it('teste 2', () => {
    const member = new Member(...); // Novo objeto
    // ...
  });
});

// ❌ RUIM: Testes compartilham estado
let sharedMember;

beforeAll(() => {
  sharedMember = new Member(...);
});

it('teste 1', () => {
  sharedMember.addSector('louvor'); // Muda estado
});

it('teste 2', () => {
  // Depende de teste 1 ter rodado antes!
});
```

---

## 🚀 CI/CD

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📚 Recursos

### Documentação Oficial
- [Jest](https://jestjs.io/)
- [Playwright](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

### Cursos
- [Testing JavaScript](https://testingjavascript.com/) - Kent C. Dodds
- [Playwright Tutorial](https://www.youtube.com/watch?v=wawbt1cATsk)

### Livros
- **Test-Driven Development: By Example** - Kent Beck
- **The Art of Unit Testing** - Roy Osherove

---

**Mantido por:** Cleyton Mendes + Claude Code
**Última atualização:** Janeiro 2026
