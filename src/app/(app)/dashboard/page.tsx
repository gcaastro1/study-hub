"use client";

import PomodoroTimer from "@/components/PomodoroTimer";
import KanbanBoard from "@/components/KanbanBoard";
import Heatmap from "@/components/Heatmap";
import { useI18n } from "@/context/I18nContext";

export default function Dashboard() {
  const { t } = useI18n();
  
  return (
    <div className="flex flex-col gap-6 h-full font-sans">
      {/* Dense 3-Column Tactical Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
        
        {/* LEFT COLUMN: Mission Log & Stats (Heatmap) */}
        <div className="xl:col-span-3 flex flex-col gap-6 h-full">
          {/* Mission Log Box */}
          <div className="bg-surface/30 border border-surface-border flex flex-col h-full chamfered-box relative">
            <div className="bg-surface border-b border-surface-border p-2 flex justify-between items-center">
              <span className="text-[10px] font-technical tracking-widest text-foreground/50">[{t("dashboard.missionLog")}]</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-surface-border rounded-full"></div>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <Heatmap />
              
              <div className="mt-6 pt-4 border-t border-surface-border/50">
                <h3 className="text-[10px] font-technical tracking-widest text-foreground/40 mb-3">[{t("dashboard.pastAssignments")}]</h3>
                {/* Fake logs for aesthetics */}
                <div className="font-mono text-[9px] text-foreground/30 flex flex-col gap-1">
                  <p>&gt; ASSIGNMENT_01: CLEARED</p>
                  <p>&gt; ASSIGNMENT_02: CLEARED</p>
                  <p className="text-primary/50">&gt; ASSIGNMENT_03: ABORTED</p>
                  <p>&gt; SYNC_RATE: OPTIMAL</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface/50 border-t border-surface-border p-2">
              <div className="flex justify-between items-center font-technical text-[9px] text-foreground/50">
                <span>{t("dashboard.stamina")}</span>
                <span className="text-primary">{t("dashboard.optimal")}</span>
              </div>
              <div className="flex justify-between items-center font-technical text-[9px] text-foreground/50 mt-1">
                <span>{t("dashboard.focusIndex")}</span>
                <span className="text-emerald-500">98.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Containment Chamber (Timer) */}
        <div className="xl:col-span-4 flex flex-col h-full">
          <div className="bg-surface border border-surface-border flex-1 relative flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            
            <div className="p-2 border-b border-surface-border flex justify-between items-center bg-background/50">
               <span className="text-[10px] font-technical tracking-widest text-primary">{t("dashboard.eventsLog")}</span>
               <span className="text-[9px] font-technical text-foreground/30 border border-foreground/10 px-1">{t("dashboard.synchronization")} {t("dashboard.active")}</span>
            </div>

            <div className="flex-1 p-4 flex flex-col">
              <PomodoroTimer />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pilot Roster (Kanban) */}
        <div className="xl:col-span-5 h-[calc(100vh-140px)] flex flex-col">
          <div className="bg-surface/30 border border-surface-border flex-1 flex flex-col">
            <div className="bg-surface border-b border-surface-border p-2">
               <span className="text-[10px] font-technical tracking-widest text-foreground/50">[{t("dashboard.pilotRoster")}]</span>
            </div>
            <div className="flex-1 p-0 overflow-hidden relative">
              {/* Tactical grid background overlay */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
              <KanbanBoard />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
