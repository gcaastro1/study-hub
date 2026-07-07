"use client";

import Header from "@/components/Header";
import PomodoroTimer from "@/components/PomodoroTimer";
import KanbanBoard from "@/components/KanbanBoard";
import { GamificationProvider } from "@/context/GamificationContext";

export default function Home() {
  return (
    <GamificationProvider>
      <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Pomodoro */}
          <div className="lg:col-span-1">
            <PomodoroTimer />
          </div>
          
          {/* Main Content: Kanban */}
          <div className="lg:col-span-3">
            <KanbanBoard />
          </div>
        </div>
      </main>
    </GamificationProvider>
  );
}
