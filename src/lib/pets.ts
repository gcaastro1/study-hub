export interface PetEvolution {
  id: string; // e.g. "sprite1"
  name: string; // e.g. "Felinfolha"
  requiredLevel: number;
}

export interface PetSpecies {
  id: string;
  name: string; // Name of the base species
  description: string;
  price: number;
  evolutions: PetEvolution[]; // Must be sorted by requiredLevel ASC
}

export const PET_SPECIES: Record<string, PetSpecies> = {
  gato_planta: {
    id: "gato_planta",
    name: "Felinfolha",
    description: "Um felino ágil coberto de folhagens. Evolui para um majestoso Leão da Floresta.",
    price: 0, // Starter pet
    evolutions: [
      { id: "sprite1", name: "Felinfolha", requiredLevel: 1 },
      { id: "sprite2", name: "Gatronco", requiredLevel: 10 },
      { id: "sprite3", name: "Floreleão", requiredLevel: 30 }
    ]
  },
  capivara: {
    id: "capivara",
    name: "Capiboa",
    description: "O mascote mais relaxado de todos. Fica de boa o tempo todo.",
    price: 1500,
    evolutions: [
      { id: "sprite4", name: "Capiboa", requiredLevel: 1 }
    ]
  },
  passaro: {
    id: "passaro",
    name: "Piuvento",
    description: "Um pássaro veloz que corta os ventos das montanhas.",
    price: 1500,
    evolutions: [
      { id: "sprite5", name: "Piuvento", requiredLevel: 1 }
    ]
  },
  cervo_gelo: {
    id: "cervo_gelo",
    name: "Nevoar",
    description: "Um cervo místico capaz de congelar os rios por onde passa.",
    price: 1500,
    evolutions: [
      { id: "sprite6", name: "Nevoar", requiredLevel: 1 }
    ]
  },
  tatu_fogo: {
    id: "tatu_fogo",
    name: "Tatuísca",
    description: "Um pequeno tatu incandescente. Sua carapaça atinge temperaturas vulcânicas quando evolui.",
    price: 3000,
    evolutions: [
      { id: "sprite7", name: "Tatuísca", requiredLevel: 1 },
      { id: "sprite8", name: "Armabrasa", requiredLevel: 10 },
      { id: "sprite9", name: "Magmatu", requiredLevel: 30 }
    ]
  },
  anta: {
    id: "anta",
    name: "Tapirito",
    description: "Resistente e teimosa, essa anta carrega a força da natureza.",
    price: 1500,
    evolutions: [
      { id: "sprite10", name: "Tapirito", requiredLevel: 1 }
    ]
  },
  cobra_eletrica: {
    id: "cobra_eletrica",
    name: "Chocobra",
    description: "Uma serpente carregada de energia. Pode causar curtos-circuitos se assustada.",
    price: 1500,
    evolutions: [
      { id: "sprite11", name: "Chocobra", requiredLevel: 1 }
    ]
  },
  golfinho_agua: {
    id: "golfinho_agua",
    name: "Gotinho",
    description: "Brincalhão e veloz, esse golfinho controla as marés e evolui para dominar tsunamis.",
    price: 3000,
    evolutions: [
      { id: "sprite12", name: "Gotinho", requiredLevel: 1 },
      { id: "sprite13", name: "Ondalfin", requiredLevel: 10 },
      { id: "sprite14", name: "Tsunalfin", requiredLevel: 30 }
    ]
  },
  inseto_planta: {
    id: "inseto_planta",
    name: "Insetolha",
    description: "Um besouro que se disfarça perfeitamente entre as folhas.",
    price: 2500,
    evolutions: [
      { id: "sprite15", name: "Insetolha", requiredLevel: 1 },
      { id: "sprite16", name: "Besourvore", requiredLevel: 10 }
    ]
  }
};

export const getActiveEvolution = (speciesId: string, currentLevel: number): PetEvolution => {
  const species = PET_SPECIES[speciesId];
  if (!species) throw new Error("Espécie não encontrada");

  // Since evolutions are sorted by requiredLevel, we iterate backwards
  for (let i = species.evolutions.length - 1; i >= 0; i--) {
    if (currentLevel >= species.evolutions[i].requiredLevel) {
      return species.evolutions[i];
    }
  }
  
  // Fallback to first
  return species.evolutions[0];
};
