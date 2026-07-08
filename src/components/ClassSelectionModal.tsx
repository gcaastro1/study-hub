"use client";

import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { selectClass } from "@/store/slices/playerSlice";
import { useAuth } from "@/context/AuthContext";
import { RPG_CLASSES, RPGClassId } from "@/lib/rpgClasses";
import { Swords, BookOpen, Dna, Shield, Sparkles } from "lucide-react";

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "Swords": return <Swords className="w-8 h-8" />;
    case "BookOpen": return <BookOpen className="w-8 h-8" />;
    case "Dna": return <Dna className="w-8 h-8" />;
    case "Shield": return <Shield className="w-8 h-8" />;
    default: return <Sparkles className="w-8 h-8" />;
  }
};

export default function ClassSelectionModal() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { rpgClass, isLoaded } = useAppSelector(state => state.player);
  const [selected, setSelected] = useState<RPGClassId | null>(null);

  if (!isLoaded || rpgClass) return null;

  const handleSelectClass = () => {
    if (selected && user) {
      dispatch(selectClass({ uid: user.uid, classId: selected }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in text-center">
        <h2 className="text-3xl font-bold mb-2">Desperte seu Poder</h2>
        <p className="text-muted-foreground mb-8">
          Escolha o seu caminho de estudos. Sua classe determinará seus atributos base e a forma como você enxerga o mundo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(Object.keys(RPG_CLASSES) as RPGClassId[]).map((cId) => {
            const c = RPG_CLASSES[cId];
            const isSelected = selected === cId;
            return (
              <button
                key={cId}
                onClick={() => setSelected(cId)}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-4 ${
                  isSelected 
                    ? `border-primary bg-primary/10 scale-105 shadow-[0_0_20px_rgba(var(--primary),0.3)]` 
                    : `border-white/10 hover:border-primary/50 hover:bg-white/5`
                }`}
              >
                <div className={`p-4 rounded-full bg-white/5 ${c.color}`}>
                  {getIcon(c.icon)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{c.description}</p>
                </div>
                <div className="mt-auto pt-4 w-full grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 p-2 rounded">
                    <span className="block text-muted-foreground">Força</span>
                    <span className="font-bold">{c.baseAttributes.strength}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="block text-muted-foreground">Sabedoria</span>
                    <span className="font-bold">{c.baseAttributes.wisdom}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="block text-muted-foreground">Carisma</span>
                    <span className="font-bold">{c.baseAttributes.charisma}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="block text-muted-foreground">Destreza</span>
                    <span className="font-bold">{c.baseAttributes.dexterity}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSelectClass}
          disabled={!selected}
          className="bg-primary text-white font-bold py-3 px-12 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {selected ? "Confirmar Classe" : "Selecione uma Classe"}
        </button>
      </div>
    </div>
  );
}
