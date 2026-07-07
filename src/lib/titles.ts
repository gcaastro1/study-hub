export interface Title {
  id: string;
  name: string;
  description: string;
  condition: (stats: any) => boolean;
}

export const TITLES: Title[] = [
  {
    id: "pomodoro_novato",
    name: "Iniciante do Foco",
    description: "Completar 5 Pomodoros",
    condition: (stats) => stats.pomodorosCompleted >= 5,
  },
  {
    id: "pomodoro_mestre",
    name: "Mestre do Tempo",
    description: "Completar 50 Pomodoros",
    condition: (stats) => stats.pomodorosCompleted >= 50,
  },
  {
    id: "boss_slayer",
    name: "Matador de Titãs",
    description: "Vencer 5 Batalhas de Chefe",
    condition: (stats) => stats.bossBattlesWon >= 5,
  },
  {
    id: "estudioso",
    name: "O Inabalável",
    description: "Acumular 10 horas de estudo",
    condition: (stats) => stats.totalStudyTime >= 10 * 3600,
  },
  {
    id: "arquimago",
    name: "Arquimago das Exatas",
    description: "Obter 1000 XP em Matemática ou Física",
    condition: (stats) => (stats.xpPerSubject["Matemática"] || 0) + (stats.xpPerSubject["Física"] || 0) >= 1000,
  }
];

export const checkNewTitles = (stats: any, currentUnlocked: string[]): string[] => {
  const newTitles: string[] = [];
  
  for (const title of TITLES) {
    if (!currentUnlocked.includes(title.id) && title.condition(stats)) {
      newTitles.push(title.id);
    }
  }
  
  return newTitles;
};
