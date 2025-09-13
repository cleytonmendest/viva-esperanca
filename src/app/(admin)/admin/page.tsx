import { createClient } from "@/libs/supabase/server";

export default async function Admin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  const user = data.user;
  const member = await supabase.from('members').select('*').eq('user_id', userId).single();

  console.log(member.data.name);

  return (
    <main>
      admi {user?.email} - {member.data.name}
    </main>
  );
}
