"use client";

import React, { useState } from "react";
import { useGamification } from "@/context/GamificationContext";
import { FACTIONS, FactionId } from "@/lib/factions";
import { Feather, Flame, Hexagon, Shield } from "lucide-react";

const getIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case "Feather": return <Feather className={className} />;
    case "Flame": return <Flame className={className} />;
    case "Hexagon": return <Hexagon className={className} />;
    default: return <Shield className={className} />;
  }
};

export default function FactionSelectionModal() {
  const { rpgClass, faction, selectFaction, isLoaded } = useGamification();
  const [selected, setSelected] = useState<FactionId | null>(null);

  // Só mostra se já escolheu classe, mas ainda não tem facção
  if (!isLoaded || !rpgClass || faction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in text-center">
        <h2 className="text-3xl font-bold mb-2">A Guerra das Guildas</h2>
        <p className="text-muted-foreground mb-8">
          Sua jornada começou, mas você não precisa lutar sozinho. Jure lealdade a uma Facção para contribuir no Leaderboard Global!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(Object.keys(FACTIONS) as FactionId[]).map((fId) => {
            const f = FACTIONS[fId];
            const isSelected = selected === fId;
            return (
              <button
                key={fId}
                onClick={() => setSelected(fId)}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-4 ${
                  isSelected 
                    ? `border-primary bg-primary/10 scale-105 shadow-[0_0_20px_rgba(var(--primary),0.3)]` 
                    : `border-white/10 hover:border-primary/50 hover:bg-white/5`
                }`}
              >
                <div className={`p-6 rounded-full ${f.bgColor}`}>
                  {getIcon(f.icon, `w-12 h-12 ${f.color}`)}
                </div>
                <div>
                  <h3 className={`font-bold text-xl ${f.color}`}>{f.name}</h3>
                  <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{f.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => selected && selectFaction(selected)}
          disabled={!selected}
          className="bg-primary text-white font-bold py-3 px-12 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {selected ? "Jurar Lealdade" : "Selecione uma Facção"}
        </button>
      </div>
    </div>
  );
}
