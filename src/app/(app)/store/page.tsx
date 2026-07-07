"use client";

import { useGamification } from "@/context/GamificationContext";
import { Coins, Lock, Check, Zap, Shield, Sparkles, Swords, Wand2, Shirt } from "lucide-react";
import { useState } from "react";

const THEMES = [
  { id: "default", name: "Modo Escuro (Padrão)", cost: 0, color: "#1a1a2e" },
  { id: "dracula", name: "Drácula", cost: 100, color: "#282a36" },
  { id: "forest", name: "Floresta Encantada", cost: 250, color: "#14532d" },
  { id: "sunset", name: "Pôr do Sol", cost: 500, color: "#7c2d12" },
];

const POWER_UPS = [
  { 
    id: "double_xp", 
    name: "Poção de XP Dobrado", 
    description: "Ganha o dobro de XP em todas as tarefas e pomodoros por 24 horas.",
    cost: 300, 
    icon: Zap,
    color: "text-amber-400 bg-amber-400/20"
  },
  { 
    id: "streak_freeze", 
    name: "Escudo de Ofensiva", 
    description: "Protege sua contagem de dias seguidos caso você esqueça de estudar amanhã.",
    cost: 500, 
    icon: Shield,
    color: "text-blue-400 bg-blue-400/20"
  }
];

export const EQUIPMENTS = [
  {
    id: "wood_sword",
    name: "Espada de Madeira",
    type: "weapon" as const,
    description: "Uma espada básica de treino.",
    cost: 50,
    icon: Swords,
    color: "text-amber-600 bg-amber-600/20"
  },
  {
    id: "iron_helm",
    name: "Elmo de Ferro",
    type: "head" as const,
    description: "Proteção básica para focar nos estudos.",
    cost: 150,
    icon: Shield,
    color: "text-slate-400 bg-slate-400/20"
  },
  {
    id: "magic_staff",
    name: "Cajado Arcano",
    type: "weapon" as const,
    description: "Cajado de aprendizes de magia.",
    cost: 200,
    icon: Wand2,
    color: "text-purple-400 bg-purple-400/20"
  },
  {
    id: "leather_armor",
    name: "Armadura de Couro",
    type: "body" as const,
    description: "Leve e resistente. Ideal para longas sessões de estudo.",
    cost: 300,
    icon: Shirt,
    color: "text-orange-400 bg-orange-400/20"
  }
];

export default function StorePage() {
  const { 
    coins, 
    unlockedThemes, 
    equippedTheme, 
    buyTheme, 
    equipTheme,
    inventory,
    activeBoosts,
    buyItem,
    activateItem,
    equipment,
    equipItem
  } = useGamification();

  const [activeTab, setActiveTab] = useState<"themes" | "powerups" | "equipments">("themes");

  const handleBuyTheme = async (themeId: string, cost: number) => {
    if (confirm(`Comprar este tema por ${cost} moedas?`)) {
      const success = await buyTheme(themeId, cost);
      if (success) {
        alert("Tema comprado com sucesso!");
      } else {
        alert("Saldo insuficiente ou erro na compra.");
      }
    }
  };

  const handleBuyItem = async (itemId: string, cost: number) => {
    if (confirm(`Comprar este item por ${cost} moedas?`)) {
      const success = await buyItem(itemId, cost);
      if (success) {
        alert("Item adicionado ao seu inventário!");
      } else {
        alert("Saldo insuficiente ou erro na compra.");
      }
    }
  };

  const handleActivateItem = async (itemId: string) => {
    if (confirm(`Deseja usar este item agora?`)) {
      const success = await activateItem(itemId, 24); // Todos duram 24h por enquanto
      if (success) {
        alert("Poder ativado!");
      } else {
        alert("Erro ao ativar.");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="text-yellow-400 w-8 h-8" />
            Loja Mágica
          </h1>
          <p className="text-foreground/60 mt-1">
            Gaste suas moedas suadas em recompensas incríveis.
          </p>
        </div>
        
        <div className="glass-panel px-6 py-3 flex items-center gap-3">
          <Coins className="text-yellow-400 w-6 h-6" />
          <span className="text-xl font-bold text-yellow-400">{coins}</span>
        </div>
      </header>

      <div className="flex gap-4 border-b border-surface-border">
        <button 
          onClick={() => setActiveTab("themes")}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === "themes" ? "text-primary border-b-2 border-primary" : "text-foreground/50 hover:text-foreground"}`}
        >
          Temas Visuais
        </button>
        <button 
          onClick={() => setActiveTab("powerups")}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === "powerups" ? "text-primary border-b-2 border-primary" : "text-foreground/50 hover:text-foreground"}`}
        >
          Power-ups (Inventário)
        </button>
        <button 
          onClick={() => setActiveTab("equipments")}
          className={`pb-4 px-4 font-bold transition-colors ${activeTab === "equipments" ? "text-primary border-b-2 border-primary" : "text-foreground/50 hover:text-foreground"}`}
        >
          Equipamentos
        </button>
      </div>

      {activeTab === "themes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {THEMES.map((theme) => {
            const isUnlocked = unlockedThemes.includes(theme.id);
            const isEquipped = equippedTheme === theme.id;

            return (
              <div key={theme.id} className="glass-panel p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div 
                  className="w-full h-32 rounded-lg mb-4 shadow-inner"
                  style={{ backgroundColor: theme.color }}
                />
                
                <h3 className="text-xl font-bold mb-2">{theme.name}</h3>
                
                {!isUnlocked && (
                  <div className="flex items-center gap-2 text-yellow-400 font-bold mb-4">
                    <Coins className="w-5 h-5" /> {theme.cost}
                  </div>
                )}

                {isEquipped ? (
                  <div className="mt-auto flex items-center gap-2 text-primary font-bold">
                    <Check className="w-5 h-5" /> Equipado
                  </div>
                ) : isUnlocked ? (
                  <button
                    onClick={() => equipTheme(theme.id)}
                    className="mt-auto px-6 py-2 bg-surface-border hover:bg-white/10 rounded-lg font-bold transition-colors w-full"
                  >
                    Equipar
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyTheme(theme.id, theme.cost)}
                    disabled={coins < theme.cost}
                    className="mt-auto px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-surface-border disabled:text-foreground/50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors w-full flex items-center justify-center gap-2"
                  >
                    {coins < theme.cost && <Lock className="w-4 h-4" />}
                    Comprar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "powerups" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {POWER_UPS.map((power) => {
            const qty = inventory[power.id] || 0;
            const boostExpiry = activeBoosts[power.id];
            const isActive = boostExpiry && new Date(boostExpiry) > new Date();

            return (
              <div key={power.id} className="glass-panel p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse" />
                )}

                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 ${power.color}`}>
                  <power.icon className="w-10 h-10" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold mb-1">{power.name}</h3>
                  <p className="text-foreground/60 text-sm mb-4">{power.description}</p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                    <div className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-full">
                      <Coins className="w-4 h-4" /> {power.cost}
                    </div>
                    <div className="text-sm font-medium bg-surface-border px-3 py-1 rounded-full">
                      Possui: {qty}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleBuyItem(power.id, power.cost)}
                      disabled={coins < power.cost}
                      className="flex-1 py-2 bg-surface-border hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
                    >
                      Comprar
                    </button>
                    
                    {qty > 0 && !isActive && (
                      <button
                        onClick={() => handleActivateItem(power.id)}
                        className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold transition-colors"
                      >
                        Usar
                      </button>
                    )}

                    {isActive && (
                      <div className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold text-center border border-emerald-500/50">
                        Ativo!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "equipments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EQUIPMENTS.map((eq) => {
            const hasItem = (inventory[eq.id] || 0) > 0;
            const isEquipped = equipment[eq.type] === eq.id;

            return (
              <div key={eq.id} className="glass-panel p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${eq.color}`}>
                  <eq.icon className="w-10 h-10" />
                </div>
                
                <h3 className="text-lg font-bold mb-1">{eq.name}</h3>
                <p className="text-foreground/60 text-xs mb-4 flex-1">{eq.description}</p>
                
                {!hasItem && (
                  <div className="flex items-center gap-2 text-yellow-400 font-bold mb-4">
                    <Coins className="w-4 h-4" /> {eq.cost}
                  </div>
                )}

                {isEquipped ? (
                  <div className="mt-auto w-full flex items-center justify-center gap-2 text-primary font-bold py-2 bg-primary/10 rounded-lg">
                    <Check className="w-5 h-5" /> Equipado
                  </div>
                ) : hasItem ? (
                  <button
                    onClick={() => equipItem(eq.type, eq.id)}
                    className="mt-auto px-6 py-2 bg-surface-border hover:bg-white/10 rounded-lg font-bold transition-colors w-full"
                  >
                    Equipar
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyItem(eq.id, eq.cost)}
                    disabled={coins < eq.cost}
                    className="mt-auto px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-surface-border disabled:text-foreground/50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors w-full flex items-center justify-center gap-2"
                  >
                    {coins < eq.cost && <Lock className="w-4 h-4" />}
                    Comprar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
