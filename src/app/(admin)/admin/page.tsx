import { createClient } from "@/libs/supabase/server";

export default async function Admin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("members").select("*").eq("user_id", user.id).single()
    : { data: null };

  return (
    <main className="p-4 flex">
      <section className="flex-1 p-4">
        <h1>Admin</h1>
      </section>
    </main>
  );
}
