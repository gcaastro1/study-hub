export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
}

export const BADGES: Badge[] = [
  {
    id: "first_blood",
    name: "Primeiro Sangue",
    description: "Complete sua primeira tarefa no Kanban.",
    icon: "Target",
    color: "text-red-400 bg-red-400/20 border-red-400/50",
  },
  {
    id: "focus_machine",
    name: "Máquina de Foco",
    description: "Complete 5 ciclos de Pomodoro.",
    icon: "Timer",
    color: "text-emerald-400 bg-emerald-400/20 border-emerald-400/50",
  },
  {
    id: "boss_slayer",
    name: "Caçador de Chefes",
    description: "Vença 3 Boss Battles.",
    icon: "Swords",
    color: "text-purple-400 bg-purple-400/20 border-purple-400/50",
  },
  {
    id: "night_owl",
    name: "Coruja Noturna",
    description: "Estude depois das 22:00.",
    icon: "Moon",
    color: "text-indigo-400 bg-indigo-400/20 border-indigo-400/50",
  },
  {
    id: "flashcard_master",
    name: "Mestre da Memória",
    description: "Salve 5 flashcards para revisão.",
    icon: "Brain",
    color: "text-cyan-400 bg-cyan-400/20 border-cyan-400/50",
  }
];

export const checkBadges = (
  stats: any, 
  xp: number, 
  unlockedBadges: string[],
  actionContext?: { type: string; payload?: any }
): Badge[] => {
  const newUnlocks: Badge[] = [];
  const hasBadge = (id: string) => unlockedBadges.includes(id);

  // Check First Blood
  if (!hasBadge("first_blood") && (stats.pomodorosCompleted > 0 || stats.bossBattlesWon > 0)) {
    const badge = BADGES.find(b => b.id === "first_blood");
    if (badge) newUnlocks.push({ ...badge, unlockedAt: new Date().toISOString() });
  }

  // Check Focus Machine
  if (!hasBadge("focus_machine") && stats.pomodorosCompleted >= 5) {
    const badge = BADGES.find(b => b.id === "focus_machine");
    if (badge) newUnlocks.push({ ...badge, unlockedAt: new Date().toISOString() });
  }

  // Check Boss Slayer
  if (!hasBadge("boss_slayer") && stats.bossBattlesWon >= 3) {
    const badge = BADGES.find(b => b.id === "boss_slayer");
    if (badge) newUnlocks.push({ ...badge, unlockedAt: new Date().toISOString() });
  }

  // Check Night Owl
  if (!hasBadge("night_owl")) {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 4) {
      // Must be studying to get it, so check if an action triggered this
      if (actionContext?.type === "POMODORO_COMPLETE" || actionContext?.type === "TASK_COMPLETE") {
        const badge = BADGES.find(b => b.id === "night_owl");
        if (badge) newUnlocks.push({ ...badge, unlockedAt: new Date().toISOString() });
      }
    }
  }

  // Flashcard Master
  if (!hasBadge("flashcard_master") && actionContext?.type === "FLASHCARD_SAVED" && actionContext.payload?.total >= 5) {
    const badge = BADGES.find(b => b.id === "flashcard_master");
    if (badge) newUnlocks.push({ ...badge, unlockedAt: new Date().toISOString() });
  }

  return newUnlocks;
};
