export enum Subject {
  MATH = "Matemática",
  HISTORY = "História",
  PORTUGUESE = "Português",
  SCIENCE = "Ciências",
  GEOGRAPHY = "Geografia",
  ENGLISH = "Inglês",
  GENERAL = "Geral"
}

export const getAttributeGainsForSubject = (subject: string): { strength: number, wisdom: number, charisma: number, dexterity: number } => {
  const gains = { strength: 0, wisdom: 0, charisma: 0, dexterity: 0 };
  const sub = subject.toLowerCase();
  
  if (sub.includes("mat") || sub.includes("fís") || sub.includes("fis") || sub.includes("quí") || sub.includes("qui") || sub.includes("exa")) {
    gains.strength += 1;
  } else if (sub.includes("his") || sub.includes("geo") || sub.includes("filo") || sub.includes("socio") || sub.includes("hum")) {
    gains.wisdom += 1;
  } else if (sub.includes("port") || sub.includes("ing") || sub.includes("red") || sub.includes("ling") || sub.includes("lit")) {
    gains.charisma += 1;
  } else {
    gains.dexterity += 1;
  }
  
  return gains;
};
