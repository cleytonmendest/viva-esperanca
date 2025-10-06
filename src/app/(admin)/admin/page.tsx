import { createClient } from "@/libs/supabase/server";
import MyAssignments from "./components/MyAssignments";
import AvailableTasks from "./components/AvailableTasks";
import { getAssignedTasks, getAvailableTasks } from "./lib/data";

export default async function Admin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("members").select("*").eq("user_id", user.id).single()
    : { data: null };

  const assignedTasks = profile ? await getAssignedTasks(profile.id) : [];
  const availableTasks = (profile?.sector && profile.sector.length > 0)
    ? await getAvailableTasks(profile.sector)
    : [];

  return (
    <main className="p-4">
      <section className="mb-8">
        <h1 className="text-2xl font-bold">Olá, {profile?.name ?? "Membro"}!</h1>
        <p className="text-muted-foreground">Bem-vindo à sua área de membro.</p>
      </section>

      <section className="space-y-6">
        <MyAssignments tasks={assignedTasks} />
        <AvailableTasks tasks={availableTasks} memberId={profile?.id ?? ''} />
      </section>
    </main>
  );
}
