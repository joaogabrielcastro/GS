import React from "react";
import type { AxleConfig } from "@/types";
import { getTirePositionLabel } from "@/types";

type ChecklistAxleDiagramProps = {
  config: AxleConfig;
  leftDone: boolean;
  rightDone: boolean;
};

/** Mesmo desenho usado no checklist do motorista (foto esq/dir por eixo). */
export function ChecklistAxleDiagram({
  config,
  leftDone,
  rightDone,
}: ChecklistAxleDiagramProps) {
  const isDbl = config.tiresPerSide === "double";
  const W = isDbl ? 160 : 110;
  const tireW = isDbl ? 14 : 16;
  const gap = isDbl ? 4 : 0;
  const rightX = isDbl ? W - tireW * 2 - gap : W - tireW;
  const axleX1 = isDbl ? tireW * 2 + gap : tireW;
  const axleX2 = isDbl ? W - tireW * 2 - gap : W - tireW;
  const lc = leftDone ? "#22c55e" : "#94a3b8";
  const rc = rightDone ? "#22c55e" : "#94a3b8";

  return (
    <svg
      viewBox={`0 0 ${W} 46`}
      className="w-full max-w-xs mx-auto"
      style={{ height: 46 }}
      aria-hidden
    >
      <rect x={axleX1} y={18} width={axleX2 - axleX1} height={6} fill="#cbd5e1" rx={3} />
      <rect x={0} y={8} width={tireW} height={26} fill={lc} rx={3} />
      {isDbl && (
        <rect x={tireW + gap} y={8} width={tireW} height={26} fill={lc} rx={3} />
      )}
      <rect x={rightX} y={8} width={tireW} height={26} fill={rc} rx={3} />
      {isDbl && (
        <rect x={rightX + tireW + gap} y={8} width={tireW} height={26} fill={rc} rx={3} />
      )}
      <text
        x={isDbl ? tireW + 2 : tireW / 2}
        y={44}
        textAnchor="middle"
        fontSize="8"
        fill="#64748b"
      >
        ESQ
      </text>
      <text
        x={isDbl ? rightX + tireW + 2 : rightX + tireW / 2}
        y={44}
        textAnchor="middle"
        fontSize="8"
        fill="#64748b"
      >
        DIR
      </text>
    </svg>
  );
}

type InteractiveAxleDiagramProps = {
  config: AxleConfig;
  /** Códigos na ordem dos retângulos à esquerda (fora → dentro em dupla). */
  leftPositions: string[];
  /** Códigos na ordem dos retângulos à direita. */
  rightPositions: string[];
  selectedPosition: string;
  occupiedPositions: ReadonlySet<string>;
  onSelectPosition: (position: string) => void;
};

function tireFill(
  position: string,
  selectedPosition: string,
  occupiedPositions: ReadonlySet<string>,
): string {
  if (occupiedPositions.has(position)) return "#d1d5db";
  if (selectedPosition === position) return "#2563eb";
  return "#94a3b8";
}

function tireStroke(
  position: string,
  selectedPosition: string,
  occupiedPositions: ReadonlySet<string>,
): string {
  if (occupiedPositions.has(position)) return "#9ca3af";
  if (selectedPosition === position) return "#1d4ed8";
  return "#64748b";
}

/** Mesmo layout do checklist; cada pneu é clicável para escolher posição (admin / cadastro). */
export function InteractiveAxleDiagram({
  config,
  leftPositions,
  rightPositions,
  selectedPosition,
  occupiedPositions,
  onSelectPosition,
}: InteractiveAxleDiagramProps) {
  const isDbl = config.tiresPerSide === "double";
  const W = isDbl ? 160 : 110;
  const tireW = isDbl ? 14 : 16;
  const gap = isDbl ? 4 : 0;
  const rightX = isDbl ? W - tireW * 2 - gap : W - tireW;
  const axleX1 = isDbl ? tireW * 2 + gap : tireW;
  const axleX2 = isDbl ? W - tireW * 2 - gap : W - tireW;

  const leftRects: { x: number; position: string }[] = isDbl
    ? [
        { x: 0, position: leftPositions[0] },
        { x: tireW + gap, position: leftPositions[1] },
      ]
    : [{ x: 0, position: leftPositions[0] }];

  const rightRects: { x: number; position: string }[] = isDbl
    ? [
        { x: rightX, position: rightPositions[0] },
        { x: rightX + tireW + gap, position: rightPositions[1] },
      ]
    : [{ x: rightX, position: rightPositions[0] }];

  const renderTire = (x: number, position: string) => {
    const occupied = occupiedPositions.has(position);
    const selected = selectedPosition === position;
    return (
      <rect
        key={position}
        role="button"
        tabIndex={occupied ? -1 : 0}
        x={x}
        y={8}
        width={tireW}
        height={26}
        rx={3}
        fill={tireFill(position, selectedPosition, occupiedPositions)}
        stroke={tireStroke(position, selectedPosition, occupiedPositions)}
        strokeWidth={selected ? 2 : 1}
        className={
          occupied
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
        }
        onClick={() => {
          if (!occupied) onSelectPosition(position);
        }}
        onKeyDown={(e) => {
          if (occupied) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectPosition(position);
          }
        }}
        aria-label={`${getTirePositionLabel(position)} (${position})${occupied ? " — ocupada" : ""}`}
        aria-pressed={selected}
        aria-disabled={occupied}
      />
    );
  };

  return (
    <svg
      viewBox={`0 0 ${W} 46`}
      className="w-full max-w-xs mx-auto touch-manipulation"
      style={{ height: 52 }}
      aria-label={`Eixo ${config.axleNumber}: selecionar posição do pneu`}
    >
      <rect x={axleX1} y={18} width={axleX2 - axleX1} height={6} fill="#cbd5e1" rx={3} />
      {leftRects.map(({ x, position }) => renderTire(x, position))}
      {rightRects.map(({ x, position }) => renderTire(x, position))}
      <text
        x={isDbl ? tireW + 2 : tireW / 2}
        y={44}
        textAnchor="middle"
        fontSize="8"
        fill="#64748b"
      >
        ESQ
      </text>
      <text
        x={isDbl ? rightX + tireW + 2 : rightX + tireW / 2}
        y={44}
        textAnchor="middle"
        fontSize="8"
        fill="#64748b"
      >
        DIR
      </text>
    </svg>
  );
}

/** Agrupa eixos por `section` (igual ao checklist). */
export function groupAxlesBySection(axles: AxleConfig[]): { section: string; axles: AxleConfig[] }[] {
  return axles.reduce<{ section: string; axles: AxleConfig[] }[]>((acc, axle) => {
    const sname = axle.section || "Veículo";
    const found = acc.find((s) => s.section === sname);
    if (found) found.axles.push(axle);
    else acc.push({ section: sname, axles: [axle] });
    return acc;
  }, []);
}

export function axlePositionCodes(axle: AxleConfig): { left: string[]; right: string[] } {
  const n = axle.axleNumber;
  if (axle.tiresPerSide === "double") {
    return {
      left: [`E${n}EE`, `E${n}EI`],
      right: [`E${n}DE`, `E${n}DI`],
    };
  }
  return {
    left: [`E${n}E`],
    right: [`E${n}D`],
  };
}
