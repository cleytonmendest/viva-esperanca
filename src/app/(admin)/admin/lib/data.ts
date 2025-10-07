import { createClient } from "@/libs/supabase/server";
import { Database } from "@/libs/supabase/database.types";

type SectorEnum = Database["public"]["Enums"]["sector_enum"];

export async function getAssignedTasks(memberId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_assignments")
    .select(
      `
      *,
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
      *,
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

export async function getEventById(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }
  return data;
}

export async function getAssignmentsByEventId(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('event_assignments')
    .select(`
      *,
      tasks ( * ),
      members ( * )
    `)
    .eq('event_id', eventId);

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }
  return data;
}

export async function getAllMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('members').select('id, name, sector');

  if (error) {
    console.error("Error fetching members:", error);
    return [];
  }
  return data;
}

export async function getAllTasks() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tasks').select('id, name');

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
  return data;
}

export async function getMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('members').select('*');

  if (error) {
    console.error("Error fetching members:", error);
    return [];
  }
  return data;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("members")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return profile;
}
