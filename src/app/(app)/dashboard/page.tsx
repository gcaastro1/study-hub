"use client";

import PomodoroTimer from "@/components/PomodoroTimer";
import KanbanBoard from "@/components/KanbanBoard";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, LogOut, LogIn } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const { user, signInWithGoogle, logout } = useAuth();
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
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto font-sans pb-20">
      
      {/* Top Bar: Title, Clock, Theme Toggle, Auth */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold font-technical">Study Hub</h1>
        
        <div className="flex items-center gap-4">
          {mounted && (
            <div className="text-sm font-medium text-foreground/60 border border-surface-border px-3 py-1 rounded-full bg-surface">
              {format(time, "HH:mm:ss", { locale: ptBR })}
            </div>
          )}
          
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-surface-border bg-surface text-foreground/60 hover:text-foreground transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {mounted && user ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 p-2 px-4 rounded-full border border-surface-border bg-surface text-foreground/60 hover:text-red-500 hover:border-red-500/50 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          ) : mounted && !user ? (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 p-2 px-4 rounded-full border border-primary bg-primary text-background hover:bg-primary-hover transition-colors text-sm font-bold"
            >
              <LogIn className="w-4 h-4" /> Entrar
            </button>
          ) : null}
        </div>
      </div>
      
      <p className="text-center text-foreground/50 -mt-6 mb-4">
        Stay focused and productive with the Pomodoro Technique
      </p>

      {/* Pomodoro Timer */}
      <div className="w-full">
        <PomodoroTimer />
      </div>

      {/* Kanban Board */}
      <div className="w-full mt-8">
        <div className="glass-panel overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-4 border-b border-surface-border bg-surface/50">
             <h2 className="text-sm font-semibold tracking-wide">Minhas Tarefas</h2>
          </div>
          <div className="flex-1 p-0 overflow-hidden relative bg-background/20">
            <KanbanBoard />
          </div>
        </div>
      </div>

    </div>
  );
}
