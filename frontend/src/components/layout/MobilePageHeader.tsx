import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  badge?: React.ReactNode;
}

const MobilePageHeader: React.FC<MobilePageHeaderProps> = ({
  title,
  subtitle,
  backTo,
  badge,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-gs-gray-100 bg-white/95 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto sm:max-w-3xl">
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gs-gray-700 hover:bg-gs-gray-100 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-gs-black tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-gs-gray-600 mt-0.5">{subtitle}</p>
          ) : null}
        </div>
        {badge}
      </div>
    </header>
  );
};

export default MobilePageHeader;
