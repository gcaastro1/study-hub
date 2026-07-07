"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skull, Swords, Flame } from "lucide-react";

interface WorldBossData {
  name: string;
  hp: number;
  maxHp: number;
  status: "active" | "defeated";
  level: number;
}

export default function WorldBossWidget() {
  const [boss, setBoss] = useState<WorldBossData | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "server", "world_boss"), (doc) => {
      if (doc.exists()) {
        setBoss(doc.data() as WorldBossData);
      } else {
        // Init boss if missing
        setDoc(doc.ref, {
          name: "Titã da Procrastinação",
          hp: 10000,
          maxHp: 10000,
          status: "active",
          level: 99
        });
      }
    });

    return () => unsubscribe();
  }, []);

  if (!boss) return null;

  const hpPercentage = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));

  return (
    <div className="glass-panel p-6 relative overflow-hidden mb-8 border-red-500/30">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-red-950 border-4 border-red-500/50 flex items-center justify-center flex-shrink-0 relative">
          <div className="absolute inset-0 bg-red-500/20 blur-md rounded-full animate-pulse" />
          <Skull className="w-12 h-12 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        </div>
        
        <div className="flex-1 w-full text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Chefão Mundial: {boss.name}
            </h2>
            <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
              Nv. {boss.level}
            </span>
          </div>
          
          <p className="text-foreground/70 text-sm mb-4">
            {boss.status === "active" 
              ? "Toda tarefa concluída no servidor causa 10 de dano ao chefe. Derrotem-no juntos para saques míticos!" 
              : "O chefe foi derrotado! Aguarde o próximo evento."}
          </p>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-red-400">
              <span>HP</span>
              <span>{Math.max(0, boss.hp).toLocaleString()} / {boss.maxHp.toLocaleString()}</span>
            </div>
            <div className="h-4 w-full bg-surface-border rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500"
                style={{ width: `${hpPercentage}%` }}
              />
              {/* Optional fire effect over health bar */}
              {boss.status === "active" && (
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 mix-blend-overlay" />
              )}
            </div>
          </div>
        </div>
        
        {boss.status === "active" && (
          <div className="flex-shrink-0 animate-bounce">
            <Swords className="w-8 h-8 text-orange-400 opacity-50" />
          </div>
        )}
      </div>
    </div>
  );
}
