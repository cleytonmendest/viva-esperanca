import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "../../globals.css";
import { createClient } from "@/lib/supabase/server";
import StoreInitializer from "@/components/StoreInitializer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";

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

// Força renderização dinâmica (evita requisições ao Supabase durante build)
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('members').select(`
        *,
        roles(id, name, description, is_leadership, created_at, updated_at),
        sectors(id, name, description, icon, color, created_at, updated_at)
      `).eq('user_id', user.id).single()
    : { data: null };

  // Detecta role usando sistema novo (roles table) ou fallback para enum antigo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (profile as any)?.roles?.name || (profile as any)?.role;

  return (
    <html lang="pt-BR">
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased dark`}
      >
        <StoreInitializer user={user} profile={profile} />
        {user && userRole !== 'Pendente' && userRole !== 'pendente' ? (
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full flex flex-col px-4">
              <SidebarTrigger />
              {children}
            </main>
          </SidebarProvider>
        ) : (
          children
        )}

        <Toaster />
      </body>
    </html>
  );
}
