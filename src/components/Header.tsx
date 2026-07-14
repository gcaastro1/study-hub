"use client";

import { useAuth } from "@/context/AuthContext";
import { User, LogIn, LogOut, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Header() {
  const { user, signInWithGoogle, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-panel backdrop-blur-md sticky top-0 z-40 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-0 border-x-0 rounded-none sm:rounded-2xl sm:mt-4 sm:mx-6 border-surface-border bg-surface/80">
      
      <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
        <h1 className="text-xl font-bold tracking-tight font-technical flex items-center gap-2">
          Study Hub
        </h1>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
        {mounted && (
          <div className="text-sm font-medium text-foreground/60 border border-surface-border px-3 py-1.5 rounded-full bg-surface/50 shadow-sm hidden md:block">
            {format(time, "HH:mm:ss", { locale: ptBR })}
          </div>
        )}

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full border border-surface-border bg-surface/50 text-foreground/60 hover:text-foreground transition-all hover:bg-surface-border"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {mounted && user ? (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-surface-border" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                <User className="text-primary w-4 h-4" />
              </div>
            )}
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface-border/50 hover:bg-red-500/20 text-foreground/70 hover:text-red-500 border border-surface-border hover:border-red-500/50 rounded-full transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        ) : mounted && !user ? (
          <button 
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-background hover:bg-primary-hover rounded-full transition-all font-bold text-sm shadow-md"
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </button>
        ) : null}
      </div>
    </header>
  );
}
