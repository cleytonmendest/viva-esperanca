import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "../../globals.css";
import { createClient } from "@/libs/supabase/server";
import StoreInitializer from "@/components/StoreInitializer";

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
        {children}
      </body>
    </html>
  );
}
