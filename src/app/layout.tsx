import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { FlashcardProvider } from "@/context/FlashcardContext";
import Sidebar from "@/components/Sidebar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Hub | Gamified Learning",
  description: "Transform your study routine into an RPG adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${outfit.variable} min-h-full flex flex-col md:flex-row antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <GamificationProvider>
            <FlashcardProvider>
              <Sidebar />
              <main className="flex-1 pb-20 md:pb-0 md:pl-64 min-h-screen p-4 md:p-8">
                {children}
              </main>
            </FlashcardProvider>
          </GamificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
