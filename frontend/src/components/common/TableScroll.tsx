import React, { type CSSProperties } from "react";

interface TableScrollProps {
  children: React.ReactNode;
  /** Largura mínima da tabela (px) — força rolagem horizontal no celular */
  minWidth?: number;
  showMobileHint?: boolean;
  className?: string;
}

/**
 * Envolve tabelas largas com scroll horizontal e dica no mobile.
 */
export default function TableScroll({
  children,
  minWidth = 720,
  showMobileHint = true,
  className = "",
}: TableScrollProps) {
  const style = {
    ["--table-min-w" as string]: `${minWidth}px`,
  } as CSSProperties;

  return (
    <div className={className}>
      {showMobileHint ? (
        <p className="table-scroll-hint">Deslize a tabela para o lado para ver todas as colunas.</p>
      ) : null}
      <div className="table-scroll" style={style}>
        {children}
      </div>
    </div>
  );
}
