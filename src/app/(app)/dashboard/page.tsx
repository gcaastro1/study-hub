"use client";

import PomodoroTimer from "@/components/PomodoroTimer";
import KanbanBoard from "@/components/KanbanBoard";

export default function Dashboard() {
  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full h-full font-sans">
      
      {/* Esquerda: Pomodoro Timer */}
      <div className="w-full xl:w-96 flex-shrink-0">
        <PomodoroTimer />
      </div>

      {/* Direita: Kanban Board */}
      <div className="flex-1 min-w-0 h-full min-h-[600px] flex flex-col">
        <div className="glass-panel overflow-hidden flex-1 flex flex-col border border-surface-border backdrop-blur-md shadow-sm">
          <div className="p-4 border-b border-surface-border bg-surface/80 backdrop-blur-md flex items-center justify-between z-10">
             <h2 className="text-sm font-bold tracking-wide font-technical">Painel de Tarefas</h2>
          </div>
          <div className="flex-1 p-0 overflow-hidden relative bg-background/30">
            <KanbanBoard />
          </div>
        </div>
      </div>

    </div>
  );
}
