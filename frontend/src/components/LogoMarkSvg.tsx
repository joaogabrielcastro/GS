type LogoTone = "color" | "light";

interface LogoMarkSvgProps {
  className?: string;
  tone?: LogoTone;
  showWordmark?: boolean;
}

/**
 * Marca GS Transportes em vetor.
 * `light` — fundos laranja/escuros; `color` — fundos claros.
 */
export default function LogoMarkSvg({
  className = "",
  tone = "color",
  showWordmark = true,
}: LogoMarkSvgProps) {
  const isLight = tone === "light";
  const sStroke = isLight ? "#FFFFFF" : "#1F1F1F";
  const textFill = isLight ? "rgba(255,255,255,0.9)" : "#1F1F1F";

  return (
    <svg
      viewBox="0 0 200 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="GS Transportes"
    >
      <defs>
        <linearGradient id="gs-g-brand" x1="4" y1="6" x2="48" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A6E" />
          <stop offset="0.5" stopColor="#FF6B35" />
          <stop offset="1" stopColor="#D94A12" />
        </linearGradient>
        <linearGradient id="gs-g-light" x1="4" y1="6" x2="48" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFD1B8" />
        </linearGradient>
      </defs>

      <g transform="translate(2, 2)">
        {/* G — anel com seta (movimento / logística) */}
        <path
          d="M26 44.5A18.5 18.5 0 1 1 42.2 18.8l-5.8 3.4A12.5 12.5 0 1 0 26 37.5c3.4 0 6.5-1.3 8.8-3.5l4.2 4.8A18.4 18.4 0 0 1 26 44.5Z"
          fill={isLight ? "url(#gs-g-light)" : "url(#gs-g-brand)"}
        />
        <path
          d="M40.8 16.2 33.2 24l7.6 7.6 3.6-3.6-5.2-5.2 5.2-5.2-3.6-3.6Z"
          fill={isLight ? "url(#gs-g-light)" : "url(#gs-g-brand)"}
        />

        {/* S — três faixas paralelas */}
        <path
          d="M58 12c14 0 22 7 22 16.5 0 7.5-5 12.5-14 14.8l-4 1.1c-6 1.5-8 3.5-8 6.5 0 4 3.8 6.5 9.5 6.5 5.2 0 10-2 13.2-5.2l5.8 5.5c-4.8 4.5-11.5 7.2-19.5 7.2-13.5 0-22.5-7.5-22.5-18.5C33 19 39 12 58 12Z"
          fill={sStroke}
        />
        <path
          d="M58 20.5c9.5 0 15.5 4.5 15.5 11.2 0 5.2-3.2 8.8-10 10.5l-4.2 1.1c-5.5 1.4-7.2 3.2-7.2 6 0 3.5 3 5.8 7.8 5.8 4.2 0 8-1.5 10.5-4l4.5 4.2c-3.2 3-7.8 4.8-12.8 4.8-9.2 0-15.2-5-15.2-12.2 0-5.5 3.5-9.2 10.2-10.8l4.2-1.1c5-1.2 6.5-2.8 6.5-5 0-2.8-2.5-4.5-6.5-4.5-3.8 0-7.2 1.3-9.5 3.5l-4-4.5c3.2-2.8 7.8-4.2 12.5-4.2Z"
          fill={sStroke}
          opacity={isLight ? 0.82 : 0.32}
        />
        <path
          d="M58 29c5.5 0 9 2.5 9 6.5 0 3-1.8 5-5.5 6l-2.8.7c-3.2.8-4.2 1.8-4.2 3.5 0 2 1.8 3.2 4.5 3.2 2.5 0 4.8-.9 6.2-2.4l3 2.8c-2 1.8-4.8 2.8-8 2.8-5.5 0-9-2.8-9-6.8 0-2.8 1.8-4.5 5.5-5.5l2.8-.7c2.5-.6 3.2-1.4 3.2-2.5 0-1.2-1-2-2.8-2-1.5 0-2.8.5-3.8 1.4l-2.2-2.5c1.2-1.2 3-1.8 5-1.8Z"
          fill={sStroke}
          opacity={isLight ? 0.65 : 0.18}
        />
      </g>

      {showWordmark ? (
        <text
          x="100"
          y="60"
          textAnchor="middle"
          fill={textFill}
          style={{
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.36em",
          }}
        >
          TRANSPORTES
        </text>
      ) : null}
    </svg>
  );
}
