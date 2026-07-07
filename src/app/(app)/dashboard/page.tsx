"use client";

import Header from "@/components/Header";
import PomodoroTimer from "@/components/PomodoroTimer";
import KanbanBoard from "@/components/KanbanBoard";
import Heatmap from "@/components/Heatmap";

export default function Home() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <Header />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Pomodoro & Heatmap */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <PomodoroTimer />
          <Heatmap />
        </div>
        
        {/* Main Content: Kanban */}
        <div className="lg:col-span-3 flex flex-col gap-8 h-[calc(100vh-12rem)] min-h-[600px]">
          <KanbanBoard />
        </div>
      </div>
    </div>
  );
}
