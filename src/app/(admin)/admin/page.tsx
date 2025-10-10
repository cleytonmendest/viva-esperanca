import MyAssignments from "./components/MyAssignments";
import AvailableTasks from "./components/AvailableTasks";
import { getAssignedTasks, getAvailableTasks, getAllMembers, getProfile } from "./queries";

export default async function Admin() {
  const profile = await getProfile();

  const [assignedTasks, availableTasks, allMembers] = await Promise.all([
    profile ? getAssignedTasks(profile.id) : Promise.resolve([]),
    (profile?.sector && profile.sector.length > 0)
      ? getAvailableTasks(profile.sector)
      : Promise.resolve([]),
    getAllMembers(),
  ]);

  return (
    <main className="p-4">
      <section className="mb-8">
        <h1 className="text-2xl font-bold">Olá, {profile?.name ?? "Membro"}!</h1>
        <p className="text-muted-foreground">Bem-vindo à sua área de membro.</p>
      </section>

      <section className="space-y-6">
        <MyAssignments tasks={assignedTasks} />
        <AvailableTasks tasks={availableTasks} allMembers={allMembers} />
      </section>
    </main>
  );
}
