"use client";

import React, { useEffect, useState } from "react";
import { X, Gift } from "lucide-react";
import { useAppDispatch } from "@/store";
import { addXpThunk } from "@/store/thunks";
import { useAuth } from "@/context/AuthContext";
interface LootChestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LootChestModal({ isOpen, onClose }: LootChestModalProps) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [opened, setOpened] = useState(false);
  const [reward, setReward] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOpened(false);
      setReward(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const openChest = () => {
    // Generate random XP reward (200 to 500)
    const xpReward = Math.floor(Math.random() * 300) + 200;
    setReward(xpReward);
    setOpened(true);
    if (user) {
      dispatch(addXpThunk({ uid: user.uid, amount: xpReward, subject: "Geral", actionType: "dungeon_clear" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel p-8 max-w-md w-full relative animate-fade-in text-center flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">
          Masmorra Concluída!
        </h2>
        <p className="text-muted-foreground mb-8">
          Você completou 3 tarefas hoje! Isso limpou a Masmorra Diária e você encontrou um baú de tesouro!
        </p>

        {!opened ? (
          <button 
            onClick={openChest}
            className="group relative w-32 h-32 hover:scale-110 transition-transform mb-6 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl group-hover:bg-yellow-400/40 transition-colors animate-pulse" />
            <Gift className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </button>
        ) : (
          <div className="animate-bounce-in flex flex-col items-center mb-6">
            <div className="text-6xl mb-4">✨</div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              +{reward} XP
            </div>
            <p className="text-sm text-muted-foreground mt-2">Bônus Especial de Conclusão</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-surface-border hover:bg-white/10 text-white font-medium py-2 rounded transition-colors mt-4"
        >
          {opened ? "Continuar Jornada" : "Guardar para Depois"}
        </button>
      </div>
    </div>
  );
}
