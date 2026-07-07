"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, Droplet, Star, Crown } from "lucide-react";
import { useGamification } from "@/context/GamificationContext";

export default function PetSanctuaryPage() {
  const { xp, level, dailyDungeonCleared } = useGamification();
  const [petLevel, setPetLevel] = useState(1);
  const [affection, setAffection] = useState(50);
  
  useEffect(() => {
    // Basic logic: Pet level scales with user level
    setPetLevel(Math.max(1, Math.floor(level / 2)));
    
    // Affection increases if dungeon was cleared today
    const today = new Date().toISOString().split("T")[0];
    if (dailyDungeonCleared === today) {
      setAffection(100);
    } else {
      setAffection(50);
    }
  }, [level, dailyDungeonCleared]);

  const petStatus = affection > 80 ? "Muito Feliz" : affection > 30 ? "Satisfeito" : "Triste";

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
            <Crown className="text-emerald-400 w-8 h-8" />
            Santuário do Mascote
          </h1>
          <p className="text-foreground/60 mt-1">
            Cuide do seu mascote limpando Masmorras Diárias (Concluindo 3 tarefas por dia).
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Pet Display */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center relative min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-xl" />
          
          <div className="relative w-64 h-64 mb-8">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative w-full h-full animate-bounce-slow">
              <Image 
                src="/pet.png" 
                alt="Mascote Dragão Pixel Art" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            
            {/* Emotes */}
            {affection > 80 && (
              <div className="absolute -top-4 -right-4 animate-bounce">
                <Heart className="w-8 h-8 text-red-400 fill-red-400" />
              </div>
            )}
            {affection <= 30 && (
              <div className="absolute -top-4 -right-4 animate-pulse">
                <Droplet className="w-8 h-8 text-blue-400 fill-blue-400" />
              </div>
            )}
          </div>
          
          <div className="text-center z-10">
            <h2 className="text-2xl font-black mb-1">Ignis, o Dragãozinho</h2>
            <div className="flex items-center justify-center gap-2 text-foreground/60 mb-4">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Nível {petLevel}</span>
              <span className="mx-2">•</span>
              <span className={affection > 80 ? "text-emerald-400 font-bold" : ""}>
                {petStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Pet Stats & Actions */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Afeição
            </h3>
            <div className="h-4 bg-surface-border rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-1000"
                style={{ width: `${affection}%` }}
              />
            </div>
            <p className="text-sm text-foreground/50">
              Complete a Masmorra Diária para manter a afeição do seu mascote em 100%. Mascotes felizes podem trazer bônus de XP no futuro!
            </p>
          </div>

          <div className="glass-panel p-6 flex-1">
            <h3 className="text-lg font-bold mb-4">Evolução do Mascote</h3>
            <p className="text-foreground/60 mb-6 text-sm leading-relaxed">
              Ignis cresce conforme o seu Nível aumenta. Atualmente ele está no estágio Bebê. 
              Ao atingir o Nível 10, ele poderá evoluir para um Dragão Jovem, ganhando novas formas!
            </p>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg border flex items-center justify-between ${petLevel >= 1 ? 'bg-primary/10 border-primary/30' : 'bg-surface-border border-transparent opacity-50'}`}>
                <span className="font-bold">Bebê Dragão</span>
                {petLevel >= 1 ? <span className="text-primary text-sm font-bold">Ativo</span> : <span className="text-sm">Nv. 1</span>}
              </div>
              <div className={`p-4 rounded-lg border flex items-center justify-between ${petLevel >= 10 ? 'bg-primary/10 border-primary/30' : 'bg-surface-border border-transparent opacity-50'}`}>
                <span className="font-bold">Dragão Jovem</span>
                {petLevel >= 10 ? <span className="text-primary text-sm font-bold">Ativo</span> : <span className="text-sm">Requer Nv. 10</span>}
              </div>
              <div className={`p-4 rounded-lg border flex items-center justify-between ${petLevel >= 30 ? 'bg-primary/10 border-primary/30' : 'bg-surface-border border-transparent opacity-50'}`}>
                <span className="font-bold">Dragão Ancião</span>
                {petLevel >= 30 ? <span className="text-primary text-sm font-bold">Ativo</span> : <span className="text-sm">Requer Nv. 30</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
