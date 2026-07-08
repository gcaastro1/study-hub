"use client";

import { useAppSelector } from "@/store";
import { useI18n } from "@/context/I18nContext";

export default function Heatmap() {
  const { streakLogs } = useAppSelector(state => state.player);
  const { t } = useI18n();

  // Generate last 35 days (5 weeks)
  const today = new Date();
  const days = Array.from({ length: 35 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (34 - i));
    return d.toISOString().split("T")[0];
  });

  // Calculate current streak
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (streakLogs.includes(days[i])) {
      currentStreak++;
    } else if (i !== days.length - 1) { // Ignore today if not studied yet
      break;
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-technical tracking-widest text-foreground/50">{t("heatmap.history")}</span>
        <span className="text-[10px] font-mono text-primary border border-primary/30 px-1">
          {t("heatmap.streak")}: {currentStreak.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {days.map((day) => {
          const active = streakLogs.includes(day);
          const colorClass = active ? "bg-primary border border-primary shadow-[0_0_5px_rgba(239,68,68,0.5)]" : "bg-surface-border";

          return (
            <div
              key={day}
              title={day}
              className={`w-3 h-3 ${colorClass}`}
            />
          );
        })}
      </div>
    </div>
  );
}
