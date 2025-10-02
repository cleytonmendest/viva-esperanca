-- Substitui a função existente pela nova versão que considera a quantidade.
CREATE OR REPLACE FUNCTION public.create_default_assignments_for_new_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Insere na tabela 'event_assignments' múltiplas vezes com base na 'quantity' da tarefa.
  INSERT INTO public.event_assignments (event_id, task_id)
  SELECT
    NEW.id, -- O ID do novo evento que foi inserido
    t.id    -- O ID da tarefa padrão
  FROM public.tasks AS t
  -- A "mágica" acontece aqui:
  -- generate_series cria uma linha para cada número de 1 até a quantidade da tarefa.
  -- O CROSS JOIN multiplica as tarefas por essas linhas, gerando o número correto de inserções.
  CROSS JOIN LATERAL generate_series(1, t.quantity)
  WHERE t.is_default = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;