import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";

export default async function Admin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/admin/login');
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl">Ive Admin</h1>
      <p>Bem-vindo, {user.email}</p>
    </main>
  );
}
