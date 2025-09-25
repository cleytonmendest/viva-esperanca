-- Tabela para armazenar os eventos da igreja
CREATE TABLE public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  event_date DATE NOT NULL, -- Alterado para DATE para simplicidade
  description TEXT,
  created_by uuid REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela "mestra" para todos os tipos de trabalhos/funções
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sector public.sector_enum, -- Vincula a tarefa a um setor específico
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ENUM para o status da escala
CREATE TYPE assignment_status AS ENUM ('pendente', 'confirmado', 'recusado');

-- Tabela "ponte" para escalar membros em tarefas de eventos específicos
CREATE TABLE public.event_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  status assignment_status DEFAULT 'pendente' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_assignments ENABLE ROW LEVEL SECURITY;