"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-foreground/50 animate-pulse">Carregando seus estudos...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Evita piscar conteúdo antes do redirecionamento
  }

  return <>{children}</>;
}
