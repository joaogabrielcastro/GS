import { useState } from "react";
import LogoSvg, { type LogoSvgVariant } from "./LogoSvg";

export type LogoVariant = LogoSvgVariant;

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** `onDark` = fundo laranja/escuro (SVG sem caixa branca) */
  variant?: LogoVariant;
}

const sizeConfig = {
  sm: { img: "h-10", svg: 40 },
  md: { img: "h-14", svg: 56 },
  lg: { img: "h-20 sm:h-24", svg: 80 },
  xl: { img: "h-28", svg: 96 },
} as const;

export default function Logo({
  className = "",
  size = "md",
  variant = "default",
}: LogoProps) {
  const cfg = sizeConfig[size];
  const [imgFailed, setImgFailed] = useState(false);

  if (variant === "onDark" || imgFailed) {
    return (
      <LogoSvg
        variant={variant === "onDark" ? "onDark" : "default"}
        height={cfg.svg}
        className={`w-auto shrink-0 ${className}`}
      />
    );
  }

  return (
    <img
      src="/logo.png"
      alt="GS Transportes"
      className={`${cfg.img} w-auto max-w-full object-contain ${className}`}
      onError={() => setImgFailed(true)}
    />
  );
}
