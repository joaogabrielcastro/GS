/**
 * TireService — lógica de negócio de pneus separada do controller.
 * Inclui alertas de vida útil por KM.
 */

import { prisma } from "../lib/prisma";

export type TireAlert = {
  tireId: string;
  code: string;
  truckPlate: string;
  position: string;
  usedKm: number;
  lifeExpectancyKm: number;
  usedPercent: number;
  severity: "CRITICO" | "ATENCAO";
};

/**
 * Retorna pneus que atingiram ≥75% da vida esperada.
 * severity = CRITICO quando ≥90%, ATENCAO quando ≥75%.
 */
export const tireService = {
  async getLifeAlerts(): Promise<TireAlert[]> {
    const tires = await prisma.tire.findMany({
      where: {
        active: true,
        lifeExpectancyKm: { not: null },
        status: { notIn: ["SUBSTITUIDO", "DESCARTADO"] },
      },
      select: {
        id: true,
        code: true,
        position: true,
        initialKm: true,
        currentKm: true,
        lifeExpectancyKm: true,
        truck: { select: { plate: true } },
      },
    });

    const alerts: TireAlert[] = [];

    for (const tire of tires) {
      if (!tire.lifeExpectancyKm || !tire.truck) continue;
      const usedKm = tire.currentKm - tire.initialKm;
      const usedPercent = Math.round((usedKm / tire.lifeExpectancyKm) * 100);

      if (usedPercent >= 75) {
        alerts.push({
          tireId: tire.id,
          code: tire.code,
          truckPlate: tire.truck.plate,
          position: tire.position,
          usedKm,
          lifeExpectancyKm: tire.lifeExpectancyKm,
          usedPercent,
          severity: usedPercent >= 90 ? "CRITICO" : "ATENCAO",
        });
      }
    }

    // Críticos primeiro
    return alerts.sort((a, b) => b.usedPercent - a.usedPercent);
  },
};
