import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "../../globals.css";
import { createClient } from "@/libs/supabase/server";
import StoreInitializer from "@/components/StoreInitializer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/Sidebar";
import { redirect } from "next/navigation";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});


export const metadata: Metadata = {
  title: "Igreja Viva Esperança",
  description: "Uma igreja bíblica, acolhedora e generosa",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('members').select('*').eq('user_id', user.id).single()
    : { data: null };

  return (
    <html lang="pt-BR">
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased dark`}
      >
        <StoreInitializer user={user} profile={profile} />
        {profile?.role === 'pendente' && (
          <main className="p-4 h-dvh flex flex-col justify-center items-center">
            <section className="text-center w-fit max-w-md border border-gray-300 rounded-lg p-6 shadow-md">
              <h1 className="text-2xl">Aguardando Aprovação</h1>
              <p>Sua conta está pendente de aprovação. Por favor, contate ou aguarde o administrador/líder aprovar sua conta.</p>
            </section>
          </main>
        )}
        {profile?.role !== 'pendente' && user && (
          <SidebarProvider>
            <AppSidebar />
            <main>
              <SidebarTrigger />
              {children}
            </main>
          </SidebarProvider>
        )}
        {!user && (
          children
        )}
      </body>
    </html>
  );
}
