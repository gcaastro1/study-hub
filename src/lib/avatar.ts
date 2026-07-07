export interface AvatarConfig {
  sex?: "man" | "woman";
  faceColor?: string;
  earSize?: "small" | "big";
  eyeStyle?: "circle" | "oval" | "smile";
  noseStyle?: "short" | "long" | "round";
  mouthStyle?: "laugh" | "smile" | "peace";
  shirtStyle?: "hoody" | "short" | "polo";
  glassesStyle?: "round" | "square" | "none";
  hairColor?: string;
  hairStyle?: "normal" | "thick" | "mohawk" | "womanLong" | "womanShort";
  hatStyle?: "beanie" | "turban" | "none";
  hatColor?: string;
  eyeBrowStyle?: "up" | "upWoman";
  shirtColor?: string;
  bgColor?: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  sex: "man",
  faceColor: "#F9C9B6",
  earSize: "small",
  eyeStyle: "smile",
  noseStyle: "short",
  mouthStyle: "smile",
  shirtStyle: "hoody",
  glassesStyle: "none",
  hairColor: "#000",
  hairStyle: "normal",
  hatStyle: "none",
  hatColor: "#000",
  eyeBrowStyle: "up",
  shirtColor: "#9287FF",
  bgColor: "#E0DDFF"
};
