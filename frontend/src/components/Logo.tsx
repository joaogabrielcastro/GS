interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-18",
  md: "h-19",
  lg: "h-44",
  xl: "h-32",
};

export default function Logo({ className = "", size = "md" }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="GS Transportes"
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
      onError={(e) => {
        // Fallback para SVG caso a imagem não seja encontrada
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `
            <div class="flex items-center gap-2 ${sizeClasses[size]}">
              <div class="relative" style="width: 50px; height: 50px;">
                <svg viewBox="0 0 50 50" class="w-full h-full">
                  <circle cx="25" cy="25" r="20" stroke="#FF6B35" stroke-width="3" fill="none" opacity="0.6"/>
                  <path d="M20 25 L30 25 M27 22 L30 25 L27 28" stroke="#FF6B35" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-2xl font-bold text-gray-800" style="letter-spacing: 2px;">GS</span>
                <span class="text-xs text-gray-500" style="letter-spacing: 2px; margin-top: -4px;">TRANSPORTES</span>
              </div>
            </div>
          `;
        }
      }}
    />
  );
}
