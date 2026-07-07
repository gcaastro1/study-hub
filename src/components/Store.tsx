"use client";

import { useGamification } from "@/context/GamificationContext";
import { Coins, CheckCircle, Lock } from "lucide-react";

export default function Store() {
  const { coins, unlockedThemes, equippedTheme, buyTheme, equipTheme } = useGamification();

  const THEMES = [
    { id: "default", name: "Estudo Noturno", cost: 0, color: "bg-indigo-500" },
    { id: "cyberpunk", name: "Cyberpunk", cost: 500, color: "bg-fuchsia-500" },
    { id: "forest", name: "Floresta", cost: 800, color: "bg-emerald-500" },
    { id: "sunset", name: "Pôr do Sol", cost: 1200, color: "bg-orange-500" },
  ];

  return (
    <div className="glass-panel p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Loja de Recompensas
        </h2>
        <div className="flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-lg font-bold">
          <Coins className="w-5 h-5" />
          {coins} Moedas
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {THEMES.map((theme) => {
          const isUnlocked = unlockedThemes.includes(theme.id);
          const isEquipped = equippedTheme === theme.id;
          
          return (
            <div 
              key={theme.id}
              className={`border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                isEquipped ? "border-primary bg-primary/10" : "border-surface-border bg-surface/50"
              }`}
            >
              <div className={`w-12 h-12 rounded-full ${theme.color} shadow-lg`} />
              <h3 className="font-bold">{theme.name}</h3>
              
              {isEquipped ? (
                <button disabled className="flex items-center gap-1 text-primary font-medium text-sm mt-2">
                  <CheckCircle className="w-4 h-4" /> Equipado
                </button>
              ) : isUnlocked ? (
                <button 
                  onClick={() => equipTheme(theme.id)}
                  className="px-4 py-2 bg-surface hover:bg-surface-border rounded-lg text-sm font-medium transition-colors mt-2"
                >
                  Equipar
                </button>
              ) : (
                <button 
                  onClick={() => buyTheme(theme.id, theme.cost)}
                  disabled={coins < theme.cost}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-2 ${
                    coins >= theme.cost 
                      ? "bg-primary hover:bg-primary-hover text-white" 
                      : "bg-surface-border/50 text-foreground/50 cursor-not-allowed"
                  }`}
                >
                  <Lock className="w-4 h-4" /> {theme.cost} Moedas
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
