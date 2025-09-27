-- 1. Cria a função que será executada pelo gatilho.
CREATE OR REPLACE FUNCTION public.create_default_assignments_for_new_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Insere na tabela 'event_assignments' todas as tarefas marcadas como 'is_default' = true.
  -- Para cada tarefa padrão, ele usa o ID do evento que acabou de ser inserido (NEW.id).
  INSERT INTO public.event_assignments (event_id, task_id)
  SELECT
    NEW.id, -- 'NEW' é uma variável especial dentro de um trigger que se refere à linha que foi inserida.
    tasks.id
  FROM public.tasks
  WHERE tasks.is_default = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Cria o gatilho (trigger) que executa a função após cada inserção na tabela 'events'.
-- Garante que o gatilho não seja criado se já existir um com o mesmo nome.
DROP TRIGGER IF EXISTS on_event_created_create_default_assignments ON public.events;
CREATE TRIGGER on_event_created_create_default_assignments
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.create_default_assignments_for_new_event();