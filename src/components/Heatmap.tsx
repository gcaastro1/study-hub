"use client";

import { useGamification } from "@/context/GamificationContext";
import { Flame } from "lucide-react";

export default function Heatmap() {
  const { streakLogs, isLoaded } = useGamification();

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
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Frequência (Últimos 30 dias)
        </h3>
        <span className="text-sm font-medium bg-surface px-3 py-1 rounded-full text-orange-400">
          {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'} seguidos
        </span>
      </div>

      <div className="flex gap-1 flex-wrap">
        {days.map((day, idx) => (
          <div
            key={day.date}
            title={day.date}
            className={`w-4 h-4 md:w-5 md:h-5 rounded-sm transition-colors ${
              day.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
