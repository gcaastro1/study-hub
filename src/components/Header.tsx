"use client";

import { useAppSelector } from "@/store";
import { useAuth } from "@/context/AuthContext";
import { Trophy, Flame, User, LogIn, LogOut, Maximize, Minimize } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Header() {
  const { xp, level, isLoaded } = useAppSelector(state => state.player);
  const { user, signInWithGoogle, logout } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const currentLevelXp = xp % 500;
  const progressPercentage = (currentLevelXp / 500) * 100;

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
              <Flame className="w-4 h-4 text-orange-500" />
              {user ? "Focado na Nuvem!" : "Faça login para salvar o XP"}
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

      <div className="flex-1 max-w-md w-full mx-0 md:mx-4">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-lg">Nível {level}</span>
          </div>
          <span className="text-sm font-medium text-foreground/80">
            {xp} XP <span className="text-foreground/40">/ {(level) * 500}</span>
          </span>
        </div>
        
        <div className="h-4 w-full bg-surface-border rounded-full overflow-hidden relative border border-white/5">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
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

