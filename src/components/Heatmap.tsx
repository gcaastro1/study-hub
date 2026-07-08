"use client";

import { useAppSelector } from "@/store";
import { Flame } from "lucide-react";

export default function Heatmap() {
  const { streakLogs, isLoaded } = useAppSelector(state => state.player);

  if (!isLoaded) return null;

  // Generate last 30 days
  const today = new Date();
  const days = [];
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0];
    
    days.push({
      date: dateString,
      active: streakLogs.includes(dateString)
    });
  }

  // Calculate current streak
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].active) {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-[10px] font-technical tracking-widest text-foreground/50">
          [ SYNCHRONIZATION HISTORY ]
        </h3>
        <span className="text-[10px] font-mono text-primary border border-primary/30 px-1">
          STREAK: {currentStreak.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="grid grid-cols-10 gap-1">
        {days.map((day, idx) => (
          <div
            key={day.date}
            title={day.date}
            className={`w-full aspect-square border ${
              day.active 
                ? "bg-primary/80 border-primary shadow-[0_0_5px_rgba(217,119,6,0.3)]" 
                : "bg-surface border-surface-border/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
