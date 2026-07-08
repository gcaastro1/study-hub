import React from "react";

interface SpriteAnimatorProps {
  src: string;
  frameCount?: number;
  fps?: number;
  className?: string;
  onClick?: () => void;
}

export default function SpriteAnimator({
  src,
  frameCount = 4,
  fps = 8,
  className = "",
  onClick,
}: SpriteAnimatorProps) {
  const duration = frameCount / fps;

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-start ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <img
        src={src}
        alt="Animated Sprite"
        className="max-w-none h-full"
        style={{
          width: `${frameCount * 100}%`,
          imageRendering: "pixelated",
          animation: `spriteTranslate ${duration}s steps(${frameCount}) infinite`,
        }}
        draggable={false}
      />
    </div>
  );
}
