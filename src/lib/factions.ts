export type FactionId = "owl" | "lion" | "dragon";

export interface Faction {
  id: FactionId;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const FACTIONS: Record<FactionId, Faction> = {
  owl: {
    id: "owl",
    name: "Ordem da Coruja",
    description: "Sábios e estrategistas. Uma guilda que valoriza a paciência, estratégia e o acúmulo de conhecimento.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    icon: "Feather",
  },
  lion: {
    id: "lion",
    name: "Clã do Leão",
    description: "Corajosos e imparáveis. Uma guilda de guerreiros focados que não desistem diante de matérias difíceis.",
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    icon: "Flame",
  },
  dragon: {
    id: "dragon",
    name: "Aliança do Dragão",
    description: "Ambiciosos e dominantes. Procuram ser os melhores em todas as áreas e dominar o pódio.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    icon: "Hexagon",
  }
};
