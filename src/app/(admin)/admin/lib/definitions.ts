import { Tables } from "@/libs/supabase/database.types";

export type Event = Tables<"events">;
export type Task = Tables<"tasks">;

export type AssignedTask = Tables<'event_assignments'> & {
  events: Event | null;
  tasks: Task | null;
};

export type AvailableTask = Tables<'event_assignments'> & {
    events: Tables<'events'> | null;
    tasks: Tables<'tasks'> | null;
};
