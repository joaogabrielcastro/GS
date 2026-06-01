import React from "react";

export type LogoSvgVariant = "default" | "onDark";

interface LogoSvgProps {
  variant?: LogoSvgVariant;
  className?: string;
  /** Altura do bloco GS (px aproximado via viewBox scale) */
  height?: number;
}

/**
 * Logo vetorial GS Transportes — sem fundo branco (ideal em gradiente laranja).
 */
export const LogoSvg: React.FC<LogoSvgProps> = ({
  variant = "default",
  className = "",
  height = 88,
}) => {
  const onDark = variant === "onDark";
  const sTop = onDark ? "#FFFFFF" : "#1F1F1F";
  const sMid = onDark ? "rgba(255,255,255,0.55)" : "#4A4A4A";
  const sBot = onDark ? "#FFFFFF" : "#1F1F1F";
  const wordmark = onDark ? "#FFFFFF" : "#1F1F1F";

  const width = Math.round(height * 1.85);

  return (
    <svg
      viewBox="0 0 185 95"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="GS Transportes"
    >
      <defs>
        <linearGradient id="gs-g-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E64E1A" />
          <stop offset="55%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#FFB394" />
        </linearGradient>
      </defs>
      {/* G — setas em arco */}
      <path
        d="M38 72 C18 72 8 58 8 42 C8 22 24 8 44 8 C58 8 68 14 72 22"
        fill="none"
        stroke="url(#gs-g-grad)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M44 42 H28 M28 42 L34 36 M28 42 L34 48"
        fill="none"
        stroke="url(#gs-g-grad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* S — faixas */}
      <path
        d="M88 18 C108 18 118 28 118 38 C118 48 108 52 98 52 C88 52 82 48 82 42"
        fill="none"
        stroke={sTop}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M82 42 C82 52 92 62 112 62 C128 62 138 52 138 42 C138 32 128 22 108 22"
        fill="none"
        stroke={sMid}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M108 22 C88 22 78 32 78 42"
        fill="none"
        stroke={sBot}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <text
        x="92.5"
        y="88"
        textAnchor="middle"
        fill={wordmark}
        style={{
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.35em",
        }}
      >
        TRANSPORTES
      </text>
    </svg>
  );
};

export default LogoSvg;
