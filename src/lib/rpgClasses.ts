export type RPGClassId = "warrior" | "mage" | "rogue" | "paladin";

export interface RPGClass {
  id: RPGClassId;
  name: string;
  description: string;
  icon: string; // we will map this in UI
  baseAttributes: {
    strength: number;
    wisdom: number;
    charisma: number;
    dexterity: number;
  };
  color: string;
}

export const RPG_CLASSES: Record<RPGClassId, RPGClass> = {
  warrior: {
    id: "warrior",
    name: "Guerreiro de Exatas",
    description: "Focado em resolver problemas lógicos e matemáticos. Ganha Força ao estudar Exatas.",
    icon: "Swords",
    baseAttributes: { strength: 10, wisdom: 2, charisma: 2, dexterity: 5 },
    color: "text-red-500",
  },
  mage: {
    id: "mage",
    name: "Mago das Humanas",
    description: "Um poço de conhecimento e teoria. Ganha Sabedoria ao ler e estudar Humanas.",
    icon: "BookOpen",
    baseAttributes: { strength: 2, wisdom: 10, charisma: 5, dexterity: 2 },
    color: "text-blue-500",
  },
  rogue: {
    id: "rogue",
    name: "Ladino Poliglota",
    description: "Comunicativo e rápido. Aprende idiomas e artes com extrema facilidade, ganhando Carisma.",
    icon: "Dna", // We can use something like Sparkles or Drama
    baseAttributes: { strength: 2, wisdom: 4, charisma: 10, dexterity: 3 },
    color: "text-emerald-500",
  },
  paladin: {
    id: "paladin",
    name: "Paladino da Produtividade",
    description: "A disciplina em pessoa. Foca na técnica Pomodoro para acumular Destreza e resistência.",
    icon: "Shield",
    baseAttributes: { strength: 5, wisdom: 5, charisma: 3, dexterity: 6 },
    color: "text-yellow-500",
  }
};
