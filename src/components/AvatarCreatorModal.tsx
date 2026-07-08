"use client";

import React, { useState, useEffect } from "react";
import Avatar, { genConfig } from "react-nice-avatar";
import { X, Dices, Save, ShoppingCart, Lock } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store";
import { updateAvatarConfigThunk, buyAvatarItemThunk } from "@/store/thunks";
import { useAuth } from "@/context/AuthContext";
import { AvatarConfig, DEFAULT_AVATAR } from "@/lib/avatar";

interface AvatarCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Opções disponíveis na biblioteca react-nice-avatar
const OPTIONS = {
  sex: ["man", "woman"],
  faceColor: ["#F9C9B6", "#AC6651", "#77311D", "#E0AC69", "#FFD9C4", "#FFC1CC"],
  earSize: ["small", "big"],
  eyeStyle: ["circle", "oval", "smile"],
  noseStyle: ["short", "long", "round"],
  mouthStyle: ["laugh", "smile", "peace"],
  hairColor: ["#000", "#fff", "#77311D", "#FC909F", "#D2EFF3", "#506AF4", "#F48150"],
  hairStyle: ["normal", "thick", "mohawk", "womanLong", "womanShort"],
  eyeBrowStyle: ["up", "upWoman"],
  bgColor: ["#E0DDFF", "#9287FF", "#F4D150", "#FC909F", "#73D13D", "#FF4D4F", "transparent"],
};

// Itens Premium que custam moedas (camisas, óculos, chapéus)
const PREMIUM_ITEMS = {
  shirtStyle: [
    { id: "hoody", name: "Moletom", cost: 0 },
    { id: "short", name: "Camiseta", cost: 0 },
    { id: "polo", name: "Polo", cost: 50 },
  ],
  glassesStyle: [
    { id: "none", name: "Sem Óculos", cost: 0 },
    { id: "round", name: "Óculos Redondo", cost: 30 },
    { id: "square", name: "Óculos Quadrado", cost: 40 },
  ],
  hatStyle: [
    { id: "none", name: "Sem Chapéu", cost: 0 },
    { id: "beanie", name: "Gorro", cost: 60 },
    { id: "turban", name: "Turbante", cost: 80 },
  ]
};

type PremiumCategory = keyof typeof PREMIUM_ITEMS;

export default function AvatarCreatorModal({ isOpen, onClose }: AvatarCreatorModalProps) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { avatarConfig, unlockedAvatarItems } = useAppSelector(state => state.inventory);
  const { coins } = useAppSelector(state => state.player);

  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [activeTab, setActiveTab] = useState<"features" | "colors" | "premium">("features");

  // Sync state with context when opened
  useEffect(() => {
    if (isOpen) {
      setConfig({ ...DEFAULT_AVATAR, ...avatarConfig });
    }
  }, [isOpen, avatarConfig]);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const randomConfig = genConfig();
    // Keep premium items as current so we don't randomly equip locked items
    const newConf = {
      ...randomConfig,
      shirtStyle: config.shirtStyle,
      glassesStyle: config.glassesStyle,
      hatStyle: config.hatStyle,
    };
    setConfig(newConf as any);
  };

  const handleSave = async () => {
    if (user) {
      dispatch(updateAvatarConfigThunk({ uid: user.uid, config }));
    }
    onClose();
  };

  const cycleOption = (key: keyof typeof OPTIONS, direction: 1 | -1) => {
    const arr = OPTIONS[key];
    const currentIndex = arr.indexOf(config[key] as string);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = arr.length - 1;
    if (nextIndex >= arr.length) nextIndex = 0;
    setConfig({ ...config, [key]: arr[nextIndex] });
  };

  const renderCycleControl = (label: string, key: keyof typeof OPTIONS) => (
    <div className="flex items-center justify-between p-2 glass-panel rounded-lg mb-2">
      <span className="text-sm font-bold text-foreground/80">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => cycleOption(key, -1)} className="w-8 h-8 rounded-full bg-surface-border hover:bg-primary/20 flex items-center justify-center font-bold">&lt;</button>
        <span className="text-xs font-mono w-16 text-center truncate">{config[key]}</span>
        <button onClick={() => cycleOption(key, 1)} className="w-8 h-8 rounded-full bg-surface-border hover:bg-primary/20 flex items-center justify-center font-bold">&gt;</button>
      </div>
    </div>
  );

  const renderPremiumList = (category: PremiumCategory, label: string) => {
    return (
      <div className="mb-4">
        <h4 className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">{label}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PREMIUM_ITEMS[category].map((item) => {
            const isUnlocked = item.cost === 0 || unlockedAvatarItems.includes(item.id);
            const isEquipped = config[category] === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isUnlocked) setConfig({ ...config, [category]: item.id });
                }}
                className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                  isEquipped ? "border-primary bg-primary/20" 
                  : isUnlocked ? "border-surface-border hover:border-primary/50" 
                  : "border-surface-border/50 opacity-75 cursor-not-allowed"
                }`}
              >
                <span className="text-xs font-bold text-center leading-tight">{item.name}</span>
                {!isUnlocked && (
                  <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-black/40 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" /> {item.cost}
                  </div>
                )}
                {isUnlocked && !isEquipped && (
                  <span className="text-[10px] text-foreground/50">Equipar</span>
                )}
                {isEquipped && (
                  <span className="text-[10px] text-primary">Equipado</span>
                )}
              </button>
            );
          })}
        </div>
        {/* Render Buy Buttons for locked items */}
        <div className="flex flex-col gap-2 mt-2">
          {PREMIUM_ITEMS[category].map((item) => {
            const isUnlocked = item.cost === 0 || unlockedAvatarItems.includes(item.id);
            if (isUnlocked) return null;
            return (
              <button
                key={`buy-${item.id}`}
                onClick={async () => {
                  if (user) {
                    const result = await dispatch(buyAvatarItemThunk({ uid: user.uid, itemId: item.id, cost: item.cost })).unwrap();
                    if (result) {
                      setConfig({ ...config, [category]: item.id });
                    }
                  }
                }}
                disabled={coins < item.cost}
                className="flex items-center justify-between p-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Comprar {item.name}</span>
                <span className="flex items-center gap-1"><ShoppingCart className="w-4 h-4" /> {item.cost}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-foreground/50 hover:text-foreground bg-surface-border rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row h-full overflow-y-auto">
          {/* Avatar Preview Section */}
          <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center bg-black/10 border-r border-surface-border">
            <h2 className="text-2xl font-black mb-6">Seu Avatar</h2>
            <div className="w-48 h-48 md:w-64 md:h-64 mb-8 relative">
              {/* @ts-ignore */}
              <Avatar className="w-full h-full drop-shadow-2xl" {...config} />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleRandomize}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-border hover:bg-white/10 font-bold transition-all"
              >
                <Dices className="w-5 h-5" />
                Aleatório
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-lg shadow-primary/30"
              >
                <Save className="w-5 h-5" />
                Salvar
              </button>
            </div>
          </div>

          {/* Controls Section */}
          <div className="w-full md:w-1/2 p-6 flex flex-col">
            <div className="flex gap-2 mb-6 p-1 bg-surface-border rounded-xl">
              <button onClick={() => setActiveTab("features")} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === "features" ? "bg-primary text-white shadow-sm" : "text-foreground/60 hover:text-foreground"}`}>
                Rosto & Corpo
              </button>
              <button onClick={() => setActiveTab("colors")} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === "colors" ? "bg-primary text-white shadow-sm" : "text-foreground/60 hover:text-foreground"}`}>
                Cores
              </button>
              <button onClick={() => setActiveTab("premium")} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-1 ${activeTab === "premium" ? "bg-yellow-500 text-black shadow-sm" : "text-foreground/60 hover:text-foreground"}`}>
                <ShoppingCart className="w-4 h-4" /> Loja
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {activeTab === "features" && (
                <div className="space-y-1">
                  {renderCycleControl("Gênero", "sex")}
                  {renderCycleControl("Formato do Olho", "eyeStyle")}
                  {renderCycleControl("Formato do Nariz", "noseStyle")}
                  {renderCycleControl("Formato da Boca", "mouthStyle")}
                  {renderCycleControl("Sobrancelha", "eyeBrowStyle")}
                  {renderCycleControl("Estilo do Cabelo", "hairStyle")}
                  {renderCycleControl("Tamanho da Orelha", "earSize")}
                </div>
              )}
              {activeTab === "colors" && (
                <div className="space-y-1">
                  {renderCycleControl("Cor de Fundo", "bgColor")}
                  {renderCycleControl("Cor da Pele", "faceColor")}
                  {renderCycleControl("Cor do Cabelo", "hairColor")}
                </div>
              )}
              {activeTab === "premium" && (
                <div className="space-y-2">
                  <div className="bg-yellow-500/10 p-4 rounded-xl mb-4 border border-yellow-500/20 text-sm text-yellow-500 font-medium">
                    Use suas moedas para desbloquear cosméticos exclusivos para seu avatar! 
                    Suas Moedas: <span className="font-bold">{coins}</span>
                  </div>
                  {renderPremiumList("shirtStyle", "Roupas")}
                  {renderPremiumList("glassesStyle", "Óculos")}
                  {renderPremiumList("hatStyle", "Chapéus")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
