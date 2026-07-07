import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { FlashcardProvider } from "@/context/FlashcardContext";

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
              {children}
            </FlashcardProvider>
          </GamificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
