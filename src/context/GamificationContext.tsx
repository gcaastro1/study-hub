"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Stats {
  totalStudyTime: number; // in seconds
  pomodorosCompleted: number;
  bossBattlesWon: number;
  bossBattlesLost: number;
  xpPerSubject: Record<string, number>;
}

interface GamificationState {
  xp: number;
  level: number;
  coins: number;
  streakLogs: string[];
  unlockedThemes: string[];
  equippedTheme: string;
  stats: Stats;
  addXp: (amount: number, subject?: string) => Promise<void>;
  updateStats: (updates: Partial<Stats>) => Promise<void>;
  buyTheme: (themeId: string, cost: number) => Promise<boolean>;
  equipTheme: (themeId: string) => Promise<void>;
  isLoaded: boolean;
}

const defaultStats: Stats = {
  totalStudyTime: 0,
  pomodorosCompleted: 0,
  bossBattlesWon: 0,
  bossBattlesLost: 0,
  xpPerSubject: {},
};

const GamificationContext = createContext<GamificationState | undefined>(undefined);

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(0);
  const [streakLogs, setStreakLogs] = useState<string[]>([]);
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(["default"]);
  const [equippedTheme, setEquippedTheme] = useState("default");
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setXp(0);
      setLevel(1);
      setCoins(0);
      setStreakLogs([]);
      setUnlockedThemes(["default"]);
      setEquippedTheme("default");
      setStats(defaultStats);
      setIsLoaded(true);
      return;
    }

    const loadData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setXp(data.xp || 0);
          setLevel(data.level || 1);
          setCoins(data.coins ?? (data.xp || 0));
          setStreakLogs(data.streakLogs || []);
          setUnlockedThemes(data.unlockedThemes || ["default"]);
          setEquippedTheme(data.equippedTheme || "default");
          setStats(data.stats || defaultStats);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar dados gamificados:", error);
      }
    };
    
    loadData();
  }, [user, authLoading]);

  const updateStats = async (updates: Partial<Stats>) => {
    if (!user) return;
    
    const newStats = { ...stats };
    
    if (updates.totalStudyTime) newStats.totalStudyTime += updates.totalStudyTime;
    if (updates.pomodorosCompleted) newStats.pomodorosCompleted += updates.pomodorosCompleted;
    if (updates.bossBattlesWon) newStats.bossBattlesWon += updates.bossBattlesWon;
    if (updates.bossBattlesLost) newStats.bossBattlesLost += updates.bossBattlesLost;
    
    if (updates.xpPerSubject) {
      Object.entries(updates.xpPerSubject).forEach(([subject, amount]) => {
        newStats.xpPerSubject[subject] = (newStats.xpPerSubject[subject] || 0) + amount;
      });
    }

    setStats(newStats);

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { stats: newStats }, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar stats:", error);
    }
  };

  const addXp = async (amount: number, subject?: string) => {
    if (!user) return;
    
    const newXp = xp + amount;
    const newCoins = coins + amount;
    const newLevel = Math.floor(newXp / 500) + 1;
    const today = new Date().toISOString().split("T")[0];
    
    setXp(newXp);
    setCoins(newCoins);
    if (newLevel > level) setLevel(newLevel);
    if (!streakLogs.includes(today)) {
      setStreakLogs((prev) => [...prev, today]);
    }
    
    if (subject) {
      updateStats({ xpPerSubject: { [subject]: amount } });
    }
    
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        xp: newXp,
        coins: newCoins,
        level: newLevel,
        streakLogs: arrayUnion(today)
      });
    } catch (error) {
      console.error("Erro ao salvar XP:", error);
    }
  };

  const buyTheme = async (themeId: string, cost: number) => {
    if (!user || coins < cost || unlockedThemes.includes(themeId)) return false;

    const newCoins = coins - cost;
    const newThemes = [...unlockedThemes, themeId];

    setCoins(newCoins);
    setUnlockedThemes(newThemes);

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        coins: newCoins,
        unlockedThemes: arrayUnion(themeId)
      });
      return true;
    } catch (error) {
      console.error("Erro ao comprar tema:", error);
      return false;
    }
  };

  const equipTheme = async (themeId: string) => {
    if (!user || !unlockedThemes.includes(themeId)) return;

    setEquippedTheme(themeId);

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        equippedTheme: themeId
      });
    } catch (error) {
      console.error("Erro ao equipar tema:", error);
    }
  };

  return (
    <GamificationContext.Provider value={{ xp, level, coins, streakLogs, unlockedThemes, equippedTheme, stats, addXp, updateStats, buyTheme, equipTheme, isLoaded }}>
      <div data-theme={equippedTheme} className="h-full">
        {children}
      </div>
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) throw new Error("useGamification must be used within GamificationProvider");
  return context;
};


