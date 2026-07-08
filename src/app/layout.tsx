import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import StoreProvider from "@/store/StoreProvider";
import GamificationLoader from "@/store/GamificationLoader";
import { FlashcardProvider } from "@/context/FlashcardContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
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
      <body className={`${inter.variable} ${mono.variable} min-h-full flex flex-col md:flex-row antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <StoreProvider>
            <GamificationLoader />
            <FlashcardProvider>
              {children}
            </FlashcardProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
