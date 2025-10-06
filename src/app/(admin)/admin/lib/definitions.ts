import type { Database } from "@/libs/supabase/database.types";

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];

export type AssignedTask = {
  id: string;
  events: Event | null;
  tasks: Task | null;
};

export type AvailableTask = {
  id: string;
  events: Event | null;
  tasks: Task | null;
};
