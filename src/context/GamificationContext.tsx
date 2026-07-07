"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, updateDoc, setDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { checkBadges, Badge } from "@/lib/badges";
import { checkNewTitles, TITLES } from "@/lib/titles";
import { playDrop, playLevelUp, playBuy } from "@/lib/audio";
import { RPG_CLASSES, RPGClassId } from "@/lib/rpgClasses";
import { AvatarConfig, DEFAULT_AVATAR } from "@/lib/avatar";

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
  rpgClass: string | null;
  attributes: {
    strength: number;
    wisdom: number;
    charisma: number;
    dexterity: number;
  };
  faction: string | null;
  dailyDungeonCleared: string | null; // Data da última vez que fechou a dungeon
  clearDungeon: () => Promise<void>;
  equipment: { head: string | null; body: string | null; weapon: string | null };
  equipItem: (slot: "head" | "body" | "weapon", itemId: string | null) => Promise<void>;
  
  // V5 Titles
  activeTitle: string | null;
  unlockedTitles: string[];
  equipTitle: (title: string | null) => Promise<void>;
  
  // V6 Avatar
  avatarConfig: AvatarConfig;
  unlockedAvatarItems: string[];
  updateAvatarConfig: (config: Partial<AvatarConfig>) => Promise<void>;
  buyAvatarItem: (itemId: string, cost: number) => Promise<boolean>;

  addXp: (amount: number, subject?: string, actionType?: string, actionPayload?: any) => Promise<void>;
  updateStats: (updates: Partial<Stats>, actionType?: string, actionPayload?: any) => Promise<void>;
  buyTheme: (themeId: string, cost: number) => Promise<boolean>;
  buyItem: (itemId: string, cost: number) => Promise<boolean>;
  activateItem: (itemId: string, durationHours: number) => Promise<boolean>;
  equipTheme: (themeId: string) => Promise<void>;
  selectClass: (classId: string) => Promise<void>;
  selectFaction: (factionId: string) => Promise<void>;
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
  const [rpgClass, setRpgClass] = useState<string | null>(null);
  const [faction, setFaction] = useState<string | null>(null);
  const [dailyDungeonCleared, setDailyDungeonCleared] = useState<string | null>(null);
  const [attributes, setAttributes] = useState({ strength: 0, wisdom: 0, charisma: 0, dexterity: 0 });
  const [equipment, setEquipment] = useState<{ head: string | null; body: string | null; weapon: string | null }>({ head: null, body: null, weapon: null });
  
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [unlockedTitles, setUnlockedTitles] = useState<string[]>([]);

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [unlockedAvatarItems, setUnlockedAvatarItems] = useState<string[]>([]);

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
      setRpgClass(null);
      setFaction(null);
      setDailyDungeonCleared(null);
      setAttributes({ strength: 0, wisdom: 0, charisma: 0, dexterity: 0 });
      setEquipment({ head: null, body: null, weapon: null });
      setActiveTitle(null);
      setUnlockedTitles([]);
      setAvatarConfig(DEFAULT_AVATAR);
      setUnlockedAvatarItems([]);
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
          setRpgClass(data.rpgClass || null);
          setFaction(data.faction || null);
          setDailyDungeonCleared(data.dailyDungeonCleared || null);
          setAttributes(data.attributes || { strength: 0, wisdom: 0, charisma: 0, dexterity: 0 });
          setEquipment(data.equipment || { head: null, body: null, weapon: null });
          setActiveTitle(data.activeTitle || null);
          setUnlockedTitles(data.unlockedTitles || []);
          setAvatarConfig(data.avatarConfig || DEFAULT_AVATAR);
          setUnlockedAvatarItems(data.unlockedAvatarItems || []);
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
      
      const newEarnedTitles = checkNewTitles(newStats, unlockedTitles);
      if (newEarnedTitles.length > 0) {
        const updatedTitles = [...unlockedTitles, ...newEarnedTitles];
        setUnlockedTitles(updatedTitles);
        await setDoc(docRef, { unlockedTitles: updatedTitles }, { merge: true });
        
        newEarnedTitles.forEach(tId => {
          const tData = TITLES.find(t => t.id === tId);
          if (tData) {
            alert(`📜 Novo Título Desbloqueado: ${tData.name}!\n${tData.description}`);
          }
        });
      }
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
    let newLevel = level;
    
    if (Math.floor(newXp / 500) + 1 > level) {
      newLevel = Math.floor(newXp / 500) + 1;
      setLevel(newLevel);
      playLevelUp(); // Play level up sound
    }
    
    const today = new Date().toISOString().split("T")[0];
    
    setXp(newXp);
    setCoins(newCoins);
    if (!streakLogs.includes(today)) {
      setStreakLogs((prev) => [...prev, today]);
    }
    
    let attrGain = { strength: 0, wisdom: 0, charisma: 0, dexterity: 0 };
    if (subject) {
      const sub = subject.toLowerCase();
      if (sub.includes("mat") || sub.includes("fís") || sub.includes("fis") || sub.includes("quí") || sub.includes("qui") || sub.includes("exa")) {
        attrGain.strength += 1;
      } else if (sub.includes("his") || sub.includes("geo") || sub.includes("filo") || sub.includes("socio") || sub.includes("hum")) {
        attrGain.wisdom += 1;
      } else if (sub.includes("port") || sub.includes("ing") || sub.includes("red") || sub.includes("ling") || sub.includes("lit")) {
        attrGain.charisma += 1;
      } else {
        attrGain.dexterity += 1; // Generic study
      }
    }
    if (actionType === "POMODORO") {
      attrGain.dexterity += 1;
    }

    const newAttributes = {
      strength: attributes.strength + attrGain.strength,
      wisdom: attributes.wisdom + attrGain.wisdom,
      charisma: attributes.charisma + attrGain.charisma,
      dexterity: attributes.dexterity + attrGain.dexterity,
    };

    setAttributes(newAttributes);
    
    if (subject) {
      // Calling updateStats handles its own badge processing, so we shouldn't double-process
      // But we will pass the actionType to updateStats.
      updateStats({ xpPerSubject: { [subject]: finalAmount } }, actionType, actionPayload);
    } else {
      processBadges(stats, newXp, actionType, actionPayload);
    }
    
    // Material Drop Chance (15%)
    let dropMsg = "";
    let newInventory = { ...inventory };
    if (Math.random() < 0.15) {
      const materials = ["iron_fragment", "magic_crystal", "leather_scrap"];
      const dropped = materials[Math.floor(Math.random() * materials.length)];
      newInventory[dropped] = (newInventory[dropped] || 0) + 1;
      setInventory(newInventory);
      
      const matNames: Record<string, string> = {
        iron_fragment: "Fragmento de Ferro",
        magic_crystal: "Cristal Mágico",
        leather_scrap: "Pedaço de Couro",
      };
      dropMsg = `\nVocê encontrou 1x ${matNames[dropped]}!`;
      playDrop();
    }
    
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        xp: newXp,
        coins: newCoins,
        level: newLevel,
        streakLogs: arrayUnion(today),
        attributes: newAttributes,
        inventory: newInventory
      }, { merge: true });
      
      if (dropMsg) {
        alert(dropMsg);
      }
    } catch (error) {
      console.error("Erro ao salvar XP:", error);
    }
    
    // Damage World Boss
    try {
      const bossRef = doc(db, "server", "world_boss");
      await updateDoc(bossRef, { hp: increment(-10) });
    } catch (error) {
      console.error("Erro ao causar dano no Chefão:", error);
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
      await setDoc(docRef, { 
        coins: newCoins,
        unlockedThemes: arrayUnion(themeId)
      }, { merge: true });
      playBuy();
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
      await setDoc(docRef, { coins: newCoins, inventory: newInventory }, { merge: true });
      playBuy();
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
      await setDoc(docRef, { inventory: newInventory, activeBoosts: newBoosts }, { merge: true });
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
      await setDoc(docRef, {
        equippedTheme: themeId
      }, { merge: true });
    } catch (error) {
      console.error("Erro ao equipar tema:", error);
    }
  };

  const selectClass = async (classId: string) => {
    if (!user || rpgClass) return; 
    
    const selectedClass = RPG_CLASSES[classId as RPGClassId];
    if (!selectedClass) return;

    setRpgClass(classId);
    setAttributes(selectedClass.baseAttributes);

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        rpgClass: classId,
        attributes: selectedClass.baseAttributes
      }, { merge: true });
    } catch (error) {
      console.error("Erro ao selecionar classe:", error);
    }
  };

  const selectFaction = async (factionId: string) => {
    if (!user || faction) return;
    setFaction(factionId);
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { faction: factionId }, { merge: true });
    } catch (error) {
      console.error("Erro ao selecionar facção:", error);
    }
  };

  const clearDungeon = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    if (dailyDungeonCleared === today) return; 
    
    setDailyDungeonCleared(today);
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { dailyDungeonCleared: today }, { merge: true });
    } catch (error) {
      console.error("Erro ao limpar dungeon:", error);
    }
  };

  const equipItem = async (slot: "head" | "body" | "weapon", itemId: string | null) => {
    if (!user) return;
    const newEquipment = { ...equipment, [slot]: itemId };
    setEquipment(newEquipment);
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { equipment: newEquipment }, { merge: true });
    } catch (error) {
      console.error("Erro ao equipar item:", error);
    }
  };

  const equipTitle = async (titleId: string | null) => {
    if (!user) return;
    setActiveTitle(titleId);
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { activeTitle: titleId }, { merge: true });
    } catch (error) {
      console.error("Erro ao equipar título:", error);
    }
  };

  const updateAvatarConfig = async (newConfig: Partial<AvatarConfig>) => {
    if (!user) return;
    const updated = { ...avatarConfig, ...newConfig };
    setAvatarConfig(updated);
    
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { avatarConfig: updated }, { merge: true });
    } catch (error) {
      console.error("Erro ao atualizar avatar config:", error);
    }
  };

  const buyAvatarItem = async (itemId: string, cost: number) => {
    if (!user || coins < cost || unlockedAvatarItems.includes(itemId)) return false;

    const newCoins = coins - cost;
    const newUnlocked = [...unlockedAvatarItems, itemId];
    
    setCoins(newCoins);
    setUnlockedAvatarItems(newUnlocked);
    
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { 
        coins: newCoins,
        unlockedAvatarItems: newUnlocked
      }, { merge: true });
      playBuy();
      return true;
    } catch (error) {
      console.error("Erro ao comprar item de avatar:", error);
      return false;
    }
  };

  return (
    <GamificationContext.Provider value={{ 
      xp, level, coins, streakLogs, unlockedThemes, equippedTheme, stats, unlockedBadges, 
      inventory, activeBoosts, rpgClass, attributes, faction, dailyDungeonCleared, equipment, 
      activeTitle, unlockedTitles, equipTitle,
      avatarConfig, unlockedAvatarItems, updateAvatarConfig, buyAvatarItem,
      clearDungeon, equipItem, addXp, updateStats, buyTheme, buyItem, activateItem, equipTheme, selectClass, selectFaction, isLoaded 
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
