import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import HeaderMain from "@/components/HeaderMain";
import FooterMain from "@/components/FooterMain";


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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased dark`}
      >
        <HeaderMain/>
        {children}
        <FooterMain/>
      </body>
    </html>
  );
}
