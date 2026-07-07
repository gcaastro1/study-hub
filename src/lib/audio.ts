"use client";

// URLs de sons públicos e curtos para feedback do usuário
const SOUNDS = {
  complete: "https://actions.google.com/sounds/v1/ui/message_notification.ogg",
  levelUp: "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg",
  drop: "https://actions.google.com/sounds/v1/foley/glass_clink.ogg",
  buy: "https://actions.google.com/sounds/v1/foley/cash_register.ogg"
};

const playSound = (type: keyof typeof SOUNDS) => {
  if (typeof window !== "undefined") {
    try {
      const audio = new Audio(SOUNDS[type]);
      audio.volume = 0.5; // Não assustar o usuário
      audio.play().catch(e => {
        // Ignorar erros de autoplay se o usuário não interagiu com a página ainda
        console.log("Audio play blocked", e);
      });
    } catch (e) {
      console.log("Error playing sound", e);
    }
  }
};

export const playTaskComplete = () => playSound("complete");
export const playLevelUp = () => playSound("levelUp");
export const playDrop = () => playSound("drop");
export const playBuy = () => playSound("buy");
