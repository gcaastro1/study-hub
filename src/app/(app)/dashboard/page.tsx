"use client";

import PomodoroTimer from "@/components/PomodoroTimer";
import KanbanBoard from "@/components/KanbanBoard";
import Heatmap from "@/components/Heatmap";

export default function Home() {
  return (
    <div className="flex flex-col gap-6 h-full font-sans">
      
      {/* Dense 3-Column Tactical Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
        
        {/* Left Column: MISSION LOG (Heatmap & Stats) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <div className="bg-primary text-white p-2 px-4 chamfered-box">
            <h2 className="text-sm font-technical font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              MISSION LOG
            </h2>
          </div>
          
          <div className="glass-panel p-4 flex-1">
            <h3 className="text-[10px] font-technical text-primary mb-4 border-b border-surface-border pb-2">PAST ASSIGNMENTS</h3>
            <div className="scale-90 origin-top-left w-[110%]">
              <Heatmap />
            </div>
            
            {/* Fake stats for aesthetic */}
            <div className="mt-8 space-y-2 border-t border-surface-border pt-4">
              <h3 className="text-[10px] font-technical text-primary mb-2">RESERVES & RESOURCES</h3>
              <div className="flex justify-between text-xs border-b border-surface-border/50 pb-1">
                <span className="text-foreground/50">[STAMINA]</span>
                <span className="font-mono">OPTIMAL</span>
              </div>
              <div className="flex justify-between text-xs border-b border-surface-border/50 pb-1">
                <span className="text-foreground/50">[FOCUS INDEX]</span>
                <span className="font-mono text-emerald-500">98.4%</span>
              </div>
              <div className="flex justify-between text-xs border-b border-surface-border/50 pb-1">
                <span className="text-foreground/50">[SYNCHRONIZATION]</span>
                <span className="font-mono text-primary">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center Column: EVENTS LOG (Timer & Pet) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-primary text-white p-2 px-4 chamfered-box">
            <h2 className="text-sm font-technical font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              EVENTS LOG // CURRENT
            </h2>
          </div>
          
          <div className="flex-1 w-full flex flex-col">
            <PomodoroTimer />
          </div>
        </div>
        
        {/* Right Column: PILOT ROSTER (Kanban Board) */}
        <div className="xl:col-span-5 flex flex-col gap-6 h-full min-h-[600px]">
          <div className="bg-primary text-white p-2 px-4 chamfered-box flex justify-between items-center">
            <h2 className="text-sm font-technical font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              PILOT ROSTER // CONTRACTS
            </h2>
          </div>
          
          <div className="flex-1 h-full relative">
            <KanbanBoard />
          </div>
        </div>
        
      </div>
      
    </div>
  );
}
