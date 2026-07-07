"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface GamificationState {
  xp: number;
  level: number;
  addXp: (amount: number) => void;
}

const GamificationContext = createContext<GamificationState | undefined>(undefined);

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedXp = localStorage.getItem("studyHub_xp");
    const savedLevel = localStorage.getItem("studyHub_level");
    if (savedXp) setXp(Number(savedXp));
    if (savedLevel) setLevel(Number(savedLevel));
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("studyHub_xp", xp.toString());
      localStorage.setItem("studyHub_level", level.toString());
    }
  }, [xp, level, isLoaded]);

  const addXp = (amount: number) => {
    setXp((prev) => {
      const newXp = prev + amount;
      // Calculate level up: Every 500 XP is a new level
      const newLevel = Math.floor(newXp / 500) + 1;
      
      if (newLevel > level) {
        setLevel(newLevel);
        // We could add a level up sound or celebration here!
      }
      
      return newXp;
    });
  };

  return (
    <GamificationContext.Provider value={{ xp, level, addXp }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) throw new Error("useGamification must be used within GamificationProvider");
  return context;
};
