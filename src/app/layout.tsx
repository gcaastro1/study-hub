import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";
import Sidebar from "@/components/Sidebar";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Hub | Gamified Focus",
  description: "A gamified study hub with pomodoro timer and kanban board.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:flex-row">
        <AuthProvider>
          <GamificationProvider>
            <Sidebar />
            <main className="flex-1 pb-20 md:pb-0 md:pl-64 min-h-screen">
              {children}
            </main>
          </GamificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
