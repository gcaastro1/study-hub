"use client";

import { useAuth } from "@/context/AuthContext";
import { User, LogIn, LogOut, Maximize, Minimize } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const { user, signInWithGoogle, logout } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Erro ao tentar tela cheia: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="glass-panel p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border border-primary/50" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
              <User className="text-primary w-6 h-6" />
            </div>
          )}
          
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {user ? user.displayName : "Visitante"}
            </h1>
            <p className="text-sm text-foreground/60 flex items-center gap-1">
              {user ? "Focado na Nuvem!" : "Faça login para salvar suas tarefas"}
            </p>
          </div>
        </div>

        {/* Mobile fullscreen toggle */}
        <button 
          onClick={toggleFullscreen}
          className="md:hidden p-2 rounded-lg bg-surface hover:bg-surface-border text-foreground/70 transition-colors"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 max-w-md w-full mx-0 md:mx-4 hidden md:flex">
        {/* Espaço reservado para o Player do Spotify ou algo no futuro */}
      </div>

      <div className="flex items-center gap-3">
        {/* Desktop fullscreen toggle */}
        <button 
          onClick={toggleFullscreen}
          className="hidden md:flex p-2 rounded-lg bg-surface-border hover:bg-white/10 text-foreground/80 transition-colors"
          title="Tela Cheia"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>

        {user ? (
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-surface-border hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm md:text-base"
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}

