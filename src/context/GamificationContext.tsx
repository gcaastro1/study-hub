"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { checkBadges, Badge } from "@/lib/badges";

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
  unlockedBadges: Badge[];
  inventory: Record<string, number>; // itemId -> quantity
  activeBoosts: Record<string, string>; // boostId -> ISO expiry string
  stats: Stats;
  addXp: (amount: number, subject?: string, actionType?: string, actionPayload?: any) => Promise<void>;
  updateStats: (updates: Partial<Stats>, actionType?: string, actionPayload?: any) => Promise<void>;
  buyTheme: (themeId: string, cost: number) => Promise<boolean>;
  buyItem: (itemId: string, cost: number) => Promise<boolean>;
  activateItem: (itemId: string, durationHours: number) => Promise<boolean>;
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
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [activeBoosts, setActiveBoosts] = useState<Record<string, string>>({});
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
      setUnlockedBadges([]);
      setInventory({});
      setActiveBoosts({});
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
          setUnlockedBadges(data.unlockedBadges || []);
          setInventory(data.inventory || {});
          setActiveBoosts(data.activeBoosts || {});
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar dados gamificados:", error);
        setIsLoaded(true);
      }
    };
    
    loadData();
  }, [user, authLoading]);

  const processBadges = async (currentStats: Stats, currentXp: number, actionType?: string, actionPayload?: any) => {
    if (!user) return;
    
    const newBadges = checkBadges(
      currentStats,
      currentXp,
      unlockedBadges.map(b => b.id),
      { type: actionType || "GENERAL", payload: actionPayload }
    );

    if (newBadges.length > 0) {
      const updatedBadges = [...unlockedBadges, ...newBadges];
      setUnlockedBadges(updatedBadges);
      
      try {
        const docRef = doc(db, "users", user.uid);
        await setDoc(docRef, { unlockedBadges: updatedBadges }, { merge: true });
        
        // Em um app real, poderíamos disparar um Toast global aqui
        newBadges.forEach(b => {
          console.log(`🏆 Conquista Desbloqueada: ${b.name}!`);
          alert(`🏆 Conquista Desbloqueada: ${b.name}!\n${b.description}`);
        });
      } catch (e) {
        console.error("Erro ao salvar badge:", e);
      }
    }
  };

  const updateStats = async (updates: Partial<Stats>, actionType?: string, actionPayload?: any) => {
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
    
    processBadges(newStats, xp, actionType, actionPayload);
  };

  const addXp = async (amount: number, subject?: string, actionType?: string, actionPayload?: any) => {
    if (!user) return;
    
    // Check for double XP boost
    let finalAmount = amount;
    const doubleXpExpiry = activeBoosts["double_xp"];
    if (doubleXpExpiry && new Date(doubleXpExpiry) > new Date()) {
      finalAmount *= 2;
    }
    
    const newXp = xp + finalAmount;
    const newCoins = coins + finalAmount;
    const newLevel = Math.floor(newXp / 500) + 1;
    const today = new Date().toISOString().split("T")[0];
    
    setXp(newXp);
    setCoins(newCoins);
    if (newLevel > level) setLevel(newLevel);
    if (!streakLogs.includes(today)) {
      setStreakLogs((prev) => [...prev, today]);
    }
    
    if (subject) {
      // Calling updateStats handles its own badge processing, so we shouldn't double-process
      // But we will pass the actionType to updateStats.
      updateStats({ xpPerSubject: { [subject]: finalAmount } }, actionType, actionPayload);
    } else {
      processBadges(stats, newXp, actionType, actionPayload);
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

  const buyItem = async (itemId: string, cost: number) => {
    if (!user || coins < cost) return false;
    
    const newCoins = coins - cost;
    const newInventory = { ...inventory };
    newInventory[itemId] = (newInventory[itemId] || 0) + 1;
    
    setCoins(newCoins);
    setInventory(newInventory);
    
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { coins: newCoins, inventory: newInventory });
      return true;
    } catch (error) {
      console.error("Erro ao comprar item:", error);
      return false;
    }
  };

  const activateItem = async (itemId: string, durationHours: number) => {
    if (!user || !inventory[itemId] || inventory[itemId] <= 0) return false;
    
    const newInventory = { ...inventory };
    newInventory[itemId] -= 1;
    if (newInventory[itemId] === 0) delete newInventory[itemId];
    
    const newBoosts = { ...activeBoosts };
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + durationHours);
    newBoosts[itemId] = expiryDate.toISOString();
    
    setInventory(newInventory);
    setActiveBoosts(newBoosts);
    
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { inventory: newInventory, activeBoosts: newBoosts });
      return true;
    } catch (error) {
      console.error("Erro ao ativar item:", error);
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
    <GamificationContext.Provider value={{ 
      xp, level, coins, streakLogs, unlockedThemes, equippedTheme, stats, unlockedBadges, 
      inventory, activeBoosts, addXp, updateStats, buyTheme, buyItem, activateItem, equipTheme, isLoaded 
    }}>
      <div data-theme={equippedTheme} className="w-full min-h-screen flex flex-col md:flex-row">
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


