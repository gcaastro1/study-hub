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

        {/* Mascot / Radar Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          
          <div className="relative w-48 h-48 flex items-center justify-center border-2 border-dashed border-surface-border rounded-full p-4 mb-6">
            <div className={`absolute inset-0 rounded-full border border-primary/30 ${isRunning && !isBreak ? 'animate-ping opacity-20' : 'opacity-0'}`} />
            
            <div className={`w-full h-full flex items-center justify-center transition-all duration-1000 ${
                isRunning && !isBreak 
                  ? 'animate-bounce scale-125' 
                  : isBreak 
                    ? 'grayscale opacity-70 animate-pulse'
                    : 'grayscale opacity-50'
              }`}>
              <SpriteAnimator 
                src={`/mascots/sprites/${getActiveEvolution(activePetId || "gato_planta", Math.max(1, Math.floor((level || 1) / 2))).id}_${isRunning && !isBreak ? 'attack' : 'idle'}.png`} 
                className="w-32 h-32"
                frameCount={4}
                fps={isRunning && !isBreak ? 12 : 6}
              />
            </div>
            
            {/* Crosshair Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
              <div className="w-full h-[1px] bg-foreground absolute"></div>
              <div className="h-full w-[1px] bg-foreground absolute"></div>
            </div>
          </div>

          <div className={`font-mono font-black mb-8 tracking-widest transition-all duration-700 ${isRunning && !isBreak ? "text-8xl text-primary" : "text-5xl text-foreground"}`}>
            {formatTime(timeLeft)}
          </div>

          <div className="flex gap-4">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3 font-technical font-bold text-sm tracking-widest border transition-colors ${
                isRunning 
                  ? "border-red-500/50 text-red-500 hover:bg-red-500/10" 
                  : "border-primary bg-primary/10 text-primary hover:bg-primary text-white hover:text-white"
              }`}
            >
              {isRunning ? "[ ABORT ]" : "[ EXECUTE ]"}
            </button>
            
            <button
              onClick={resetTimer}
              className="px-4 py-3 font-technical text-sm tracking-widest border border-surface-border text-foreground/50 hover:text-foreground hover:bg-surface-border transition-colors"
            >
              [ RESET ]
            </button>
          </div>
          
          <div className="mt-8 border-t border-surface-border w-full pt-4">
             <p className={`text-[10px] font-technical uppercase tracking-widest text-center transition-all ${isRunning && !isBreak ? "text-primary animate-pulse" : "text-foreground/30"}`}>
               {isRunning && !isBreak 
                 ? ">> NEURAL LINK ACTIVE // TRAINING PROTOCOL ENGAGED" 
                 : isBreak 
                   ? ">> SYSTEM COOLING // AWAITING REBOOT" 
                   : ">> SYSTEM STANDBY // READY FOR EXECUTION"}
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
