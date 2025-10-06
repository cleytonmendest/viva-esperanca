import { createClient } from "@/libs/supabase/server";
import { Database } from "@/libs/supabase/database.types";

type SectorEnum = Database["public"]["Enums"]["sector_enum"];

export async function getAssignedTasks(memberId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_assignments")
    .select(
      `
      id,
      events (*),
      tasks (*)
    `
    )
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assigned tasks:", error);
    return [];
  }

  return data;
}

export async function getAvailableTasks(sectors: SectorEnum[]) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_assignments")
    .select(
      `
      id,
      events (*),
      tasks!inner(*)
    `
    )
    .is("member_id", null)
    .in("tasks.sector", sectors)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching available tasks:", error);
    return [];
  }

  return data;
}
