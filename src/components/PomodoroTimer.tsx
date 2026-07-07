"use client";

import { useState, useEffect } from "react";
import { useGamification } from "@/context/GamificationContext";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { motion } from "framer-motion";

export default function PomodoroTimer() {
  const { addXp } = useGamification();
  
  const WORK_TIME = 25 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60; // 5 minutes
  
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer finished!
      setIsRunning(false);
      
      if (!isBreak) {
        // Finished a work session, reward XP!
        addXp(50);
        // Switch to break
        setIsBreak(true);
        setTimeLeft(BREAK_TIME);
      } else {
        // Finished a break, switch to work
        setIsBreak(false);
        setTimeLeft(WORK_TIME);
      }
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, addXp]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = isBreak 
    ? ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100 
    : ((WORK_TIME - timeLeft) / WORK_TIME) * 100;

  return (
    <div className="glass-panel p-6 flex flex-col items-center relative overflow-hidden">
      {/* Background progress indicator */}
      <div 
        className="absolute bottom-0 left-0 w-full bg-primary/10 transition-all duration-1000"
        style={{ height: `${progress}%` }}
      />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6 w-full justify-center">
          <Timer className={isBreak ? "text-emerald-400" : "text-primary"} />
          <h2 className="text-xl font-bold">
            {isBreak ? "Pausa" : "Foco"}
          </h2>
        </div>

        <div className="text-6xl font-black mb-8 tracking-tighter">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
              isRunning 
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
                : "bg-primary text-white hover:bg-primary-hover"
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="w-14 h-14 rounded-full bg-surface-border text-foreground hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>
        </div>
        
        <p className="mt-6 text-sm text-center text-foreground/50">
          {isBreak 
            ? "Descanse sua mente." 
            : "Complete uma sessão de foco para ganhar +50 XP!"}
        </p>
      </div>
    </div>
  );
}
