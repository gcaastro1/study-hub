"use client";

import { useGamification } from "@/context/GamificationContext";
import { Trophy, Flame, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  const { xp, level } = useGamification();
  
  // Calculate progress to next level (500 XP per level)
  const currentLevelXp = xp % 500;
  const progressPercentage = (currentLevelXp / 500) * 100;

  return (
    <header className="glass-panel p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
          <User className="text-primary w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Estudante</h1>
          <p className="text-sm text-foreground/60 flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            Focado e pronto!
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-lg">Nível {level}</span>
          </div>
          <span className="text-sm font-medium text-foreground/80">
            {xp} XP <span className="text-foreground/40">/ {(level) * 500}</span>
          </span>
        </div>
        
        {/* XP Bar */}
        <div className="h-4 w-full bg-surface-border rounded-full overflow-hidden relative border border-white/5">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </header>
  );
}
