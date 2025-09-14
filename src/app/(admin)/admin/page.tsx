import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";

export default async function Admin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/admin/login');
  }

  // Com os tipos gerados, o TypeScript sabe que `member.data` pode ser `null`
  // ou ter as propriedades `name`, `user_id`, etc.
  // Isso te dá autocomplete e segurança!
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // O TypeScript vai te avisar se `member` for nulo aqui!
  console.log(member?.name);

  return (
    <main className="p-4">
      <h1 className="text-2xl">Painel Administrativo</h1>
      <p>Bem-vindo, {member?.name ?? user.email}</p>
    </main>
  );
}
