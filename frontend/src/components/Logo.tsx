import LogoMarkSvg from "@/components/LogoMarkSvg";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** `onDark` — fundo laranja (vetor claro); `default` — PNG oficial em fundos claros */
  variant?: "default" | "onDark";
}

const pngHeights = {
  sm: "h-10",
  md: "h-14",
  lg: "h-20 sm:h-24",
  xl: "h-28",
} as const;

const svgWidths = {
  sm: "w-[7.5rem]",
  md: "w-[9.5rem]",
  lg: "w-[11.5rem] sm:w-[13rem]",
  xl: "w-[15rem]",
} as const;

export default function Logo({
  className = "",
  size = "md",
  variant = "default",
}: LogoProps) {
  if (variant === "onDark") {
    return (
      <LogoMarkSvg
        tone="light"
        className={`${svgWidths[size]} h-auto drop-shadow-md ${className}`}
      />
    );
  }

  const imgClass = `${pngHeights[size]} w-auto max-w-full object-contain`;
  return (
    <img
      src="/logo.png"
      alt="GS Transportes"
      className={`${imgClass} ${className}`}
    />
  );
}
