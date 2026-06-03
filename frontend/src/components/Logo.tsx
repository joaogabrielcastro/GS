interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Fundo laranja: PNG oficial em cartão branco (única combinação que preserva a marca) */
  variant?: "default" | "onDark";
}

const sizeClasses = {
  sm: "h-10",
  md: "h-14",
  lg: "h-20 sm:h-24",
  xl: "h-28",
} as const;

export default function Logo({
  className = "",
  size = "md",
  variant = "default",
}: LogoProps) {
  const imgClass = `${sizeClasses[size]} w-auto max-w-full object-contain`;

  if (variant === "onDark") {
    return (
      <div
        className={`inline-flex rounded-2xl bg-white px-5 py-3.5 shadow-elevated ${className}`}
      >
        <img src="/logo.png" alt="GS Transportes" className={imgClass} />
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="GS Transportes"
      className={`${imgClass} ${className}`}
    />
  );
}
