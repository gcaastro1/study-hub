"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw, Play, Pause, Settings, Target, Zap, Clock, Disc } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/context/I18nContext";

type SessionType = "work" | "shortBreak" | "longBreak";

export default function PomodoroTimer() {
  const { user } = useAuth();
  const { t } = useI18n();
  
  const WORK_TIME = 25 * 60;
  const SHORT_BREAK_TIME = 5 * 60;
  const LONG_BREAK_TIME = 15 * 60;
  const MAX_CYCLES = 4;
  
  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [cycleProgress, setCycleProgress] = useState(1);
  
  // Dummy stats (in a real app, these would come from the backend/Redux)
  const [stats, setStats] = useState({
    sessionsToday: 0,
    focusTimeToday: 0, // in minutes
    allTimeSessions: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set time when session changes manually
  useEffect(() => {
    if (!isRunning) {
      if (sessionType === "work") setTimeLeft(WORK_TIME);
      if (sessionType === "shortBreak") setTimeLeft(SHORT_BREAK_TIME);
      if (sessionType === "longBreak") setTimeLeft(LONG_BREAK_TIME);
    }
  }, [sessionType, isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Session finished logic
      setIsRunning(false);
      
      if (sessionType === "work") {
        // Increment stats
        setStats(s => ({
          ...s,
          sessionsToday: s.sessionsToday + 1,
          allTimeSessions: s.allTimeSessions + 1,
          focusTimeToday: s.focusTimeToday + 25
        }));

        if (cycleProgress >= MAX_CYCLES) {
          setSessionType("longBreak");
          setTimeLeft(LONG_BREAK_TIME);
          setCycleProgress(1); // Reset cycle after long break
        } else {
          setSessionType("shortBreak");
          setTimeLeft(SHORT_BREAK_TIME);
          setCycleProgress(c => c + 1);
        }
      } else {
        // Break finished, go back to work
        setSessionType("work");
        setTimeLeft(WORK_TIME);
      }
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType, cycleProgress]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    if (sessionType === "work") setTimeLeft(WORK_TIME);
    if (sessionType === "shortBreak") setTimeLeft(SHORT_BREAK_TIME);
    if (sessionType === "longBreak") setTimeLeft(LONG_BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTotalTimeForSession = () => {
    if (sessionType === "work") return WORK_TIME;
    if (sessionType === "shortBreak") return SHORT_BREAK_TIME;
    return LONG_BREAK_TIME;
  };

  const totalTime = getTotalTimeForSession();
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  
  // SVG Circle calculations
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getSessionName = (type: SessionType) => {
    if (type === "work") return "Work";
    if (type === "shortBreak") return "Short Break";
    return "Long Break";
  };

  const getNextSession = () => {
    if (sessionType === "work") {
      return cycleProgress >= MAX_CYCLES ? "Long Break" : "Short Break";
    }
    return "Work";
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Main Timer Card */}
      <div className="glass-panel flex flex-col items-center py-10 relative">
        <h3 className="text-sm font-medium text-foreground/60 mb-6">Session Type</h3>
        
        {/* Mode Toggles */}
        <div className="flex gap-2 p-1 border border-surface-border rounded-full bg-background mb-10">
          <button 
            onClick={() => { setSessionType("work"); setIsRunning(false); }}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors flex items-center gap-2 ${sessionType === "work" ? "bg-primary text-background" : "text-foreground/60 hover:text-foreground"}`}
          >
            <Target className="w-3 h-3" />
            Work (25m)
          </button>
          <button 
            onClick={() => { setSessionType("shortBreak"); setIsRunning(false); }}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors flex items-center gap-2 ${sessionType === "shortBreak" ? "bg-primary text-background" : "text-foreground/60 hover:text-foreground"}`}
          >
            <Zap className="w-3 h-3" />
            Short Break (5m)
          </button>
          <button 
            onClick={() => { setSessionType("longBreak"); setIsRunning(false); }}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors flex items-center gap-2 ${sessionType === "longBreak" ? "bg-primary text-background" : "text-foreground/60 hover:text-foreground"}`}
          >
            <Settings className="w-3 h-3" />
            Long Break (15m)
          </button>
        </div>

        {/* Circular Timer Display */}
        <div className="relative flex flex-col items-center justify-center mb-8 w-[280px] h-[280px]">
          <svg width="280" height="280" className="transform -rotate-90 absolute">
            {/* Background Track */}
            <circle 
              cx="140" cy="140" r={radius} 
              fill="transparent" 
              stroke="var(--surface-border)" 
              strokeWidth="8" 
            />
            {/* Progress Track */}
            <circle 
              cx="140" cy="140" r={radius} 
              fill="transparent" 
              stroke={sessionType === "work" ? "var(--color-danger)" : "var(--color-success)"} 
              strokeWidth="8" 
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: "stroke-dashoffset 1s linear"
              }}
            />
          </svg>
          
          <div className="z-10 flex flex-col items-center">
            <span className={`text-sm font-bold mb-2 ${sessionType === "work" ? "text-red-500" : "text-emerald-500"}`}>
              {sessionType === "work" ? "Focus Time" : "Break Time"}
            </span>
            <div className="text-7xl font-sans font-light tracking-tighter tabular-nums text-foreground">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={toggleTimer}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-background rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-lg"
          >
            {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center justify-center p-3 border border-surface-border text-foreground/60 rounded-xl hover:bg-surface-border hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}
