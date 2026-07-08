"use client";

import { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "@/store";
import { addXpThunk, updateStatsThunk } from "@/store/thunks";
import { useAuth } from "@/context/AuthContext";
import { useAppSelector } from "@/store";
import SpriteAnimator from "@/components/SpriteAnimator";
import { PET_SPECIES, getActiveEvolution } from "@/lib/pets";
import { Play, Pause, RotateCcw, Timer, Music, CloudRain, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export default function PomodoroTimer() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { level } = useAppSelector(state => state.player);
  const { activePetId } = useAppSelector(state => state.inventory);
  
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [soundscape, setSoundscape] = useState<"none" | "rain" | "lofi">("none");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const SOUND_URLS = {
    none: "",
    rain: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
    lofi: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      
      if (audioRef.current && soundscape !== "none") {
        audioRef.current.play().catch(e => console.log("Audio autoplay prevented", e));
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      if (isRunning && timeLeft === 0) {
        setIsRunning(false);
        if (!isBreak) {
          if (user) {
            dispatch(addXpThunk({ uid: user.uid, amount: 100, actionType: "POMODORO" }));
            dispatch(updateStatsThunk({ 
              uid: user.uid, 
              updates: { 
                pomodorosCompleted: 1,
                totalStudyTime: WORK_TIME
              } 
            }));
          }
          setIsBreak(true);
          setTimeLeft(BREAK_TIME);
        } else {
          setIsBreak(false);
          setTimeLeft(WORK_TIME);
        }
      }
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, dispatch, soundscape, user]);

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
    <div className={`flex flex-col h-full bg-surface border border-surface-border p-4 relative ${isRunning && !isBreak ? "fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl flex items-center justify-center p-12" : ""}`}>
      {soundscape !== "none" && (
        <audio ref={audioRef} src={SOUND_URLS[soundscape]} loop />
      )}
      
      {/* Background Progress Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full bg-primary/10 transition-all duration-1000 border-t border-primary/20" style={{ height: `${progress}%` }} />
      </div>

      <div className={`relative z-10 flex flex-col h-full w-full ${isRunning && !isBreak ? "max-w-2xl" : ""}`}>
        
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-technical text-foreground/50">MODULE</span>
            <h3 className={`text-sm font-technical font-bold ${isBreak ? "text-emerald-500" : "text-foreground"}`}>
              {isBreak ? "[ COOLING PHASE ]" : "[ SYNCHRONIZATION ]"}
            </h3>
          </div>
          <div className="flex gap-1 border border-surface-border p-1 bg-background">
            <button onClick={() => setSoundscape("none")} className={`px-2 py-1 text-[10px] font-technical transition-colors ${soundscape === "none" ? "bg-primary text-white" : "text-foreground/50 hover:text-foreground"}`}>MUTE</button>
            <button onClick={() => setSoundscape("rain")} className={`px-2 py-1 text-[10px] font-technical transition-colors ${soundscape === "rain" ? "bg-primary text-white" : "text-foreground/50 hover:text-foreground"}`}>NOISE</button>
            <button onClick={() => setSoundscape("lofi")} className={`px-2 py-1 text-[10px] font-technical transition-colors ${soundscape === "lofi" ? "bg-primary text-white" : "text-foreground/50 hover:text-foreground"}`}>BGM</button>
          </div>
        </div>

        <div className="relative group">
          <div className={`absolute -inset-8 bg-gradient-to-r ${isBreak ? 'from-blue-500/10 to-transparent' : 'from-primary/10 to-transparent'} blur-2xl opacity-50`}></div>
          <motion.div 
            className={`text-8xl md:text-9xl font-technical tracking-tighter tabular-nums leading-none ${isBreak ? 'text-blue-400' : 'text-primary'}`}
            animate={{ 
              textShadow: isRunning ? `0 0 20px ${isBreak ? 'rgba(96,165,250,0.5)' : 'rgba(239,68,68,0.5)'}` : '0 0 0px rgba(0,0,0,0)'
            }}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </motion.div>
          <div className="absolute -top-4 -left-8 w-4 h-4 border-t-2 border-l-2 border-surface-border"></div>
          <div className="absolute -bottom-4 -right-8 w-4 h-4 border-b-2 border-r-2 border-surface-border"></div>
        </div>

        <div className="relative w-full max-w-[200px] aspect-square mt-4">
            <div className={`absolute inset-0 rounded-full border border-dashed ${isRunning ? 'border-primary animate-[spin_10s_linear_infinite]' : 'border-surface-border'}`}></div>
            <div className="absolute inset-4 rounded-full border border-surface-border/50"></div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-surface-border/30"></div>
              <div className="h-full w-[1px] bg-surface-border/30 absolute"></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`transition-all duration-500 ${
                  isRunning && !isBreak 
                    ? 'scale-125 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                    : 'grayscale opacity-50'
              }`}>
              <SpriteAnimator 
                src={`/mascots/sprites/${getActiveEvolution(inventoryPetId || activePetId || "gato_planta", Math.max(1, Math.floor((level || 1) / 2))).id}_${isRunning && !isBreak ? 'attack' : 'idle'}.png`} 
                className="w-32 h-32"
                frameCount={4}
                fps={isRunning && !isBreak ? 12 : 6}
              />
              </div>
            </div>
        </div>

        <div className="flex gap-4 mt-4 w-full max-w-xs">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-3 text-xs font-technical font-bold tracking-widest transition-colors ${
              isRunning
                ? "bg-transparent border-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
                : "bg-primary text-white hover:bg-primary/90 border-2 border-primary"
            }`}
          >
            {isRunning ? t("timer.abort") : t("timer.execute")}
          </button>
          
          <button
            onClick={resetTimerState}
            className="w-16 flex items-center justify-center border-2 border-surface-border text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      <div className="mt-auto pt-4 border-t border-surface-border/50 font-mono text-[9px] text-foreground/30 flex flex-col gap-1">
        <p className={isRunning && !isBreak ? "text-primary animate-pulse" : ""}>
          {isRunning 
            ? (!isBreak ? t("timer.msgActive") : t("timer.msgCooling"))
            : t("timer.msgStandby")}
        </p>
      </div>

    </div>
  );
}
