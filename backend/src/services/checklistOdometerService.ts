import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type ApplyOdometerResult =
  | { ok: true; truckKm: number; deltaKm: number; tiresUpdated: number }
  | { ok: false; error: string };

type DbClient = Prisma.TransactionClient | typeof prisma;

/**
 * Atualiza o KM do caminhão e incrementa `currentKm` dos pneus ativos
 * conforme a diferença em relação ao último hodômetro registrado.
 * Na primeira leitura (totalKm = 0), só grava a base — não altera pneus já cadastrados em uso.
 */
export async function applyTruckOdometerFromChecklist(
  db: DbClient,
  truckId: string,
  odometerKm: number,
): Promise<ApplyOdometerResult> {
  const truck = await db.truck.findUnique({
    where: { id: truckId },
    select: { totalKm: true },
  });

  if (!truck) {
    return { ok: false, error: "Caminhão não encontrado" };
  }

  const previousKm = truck.totalKm ?? 0;

  if (odometerKm < previousKm) {
    return {
      ok: false,
      error: `Hodômetro (${odometerKm.toLocaleString("pt-BR")} km) não pode ser menor que o último registrado (${previousKm.toLocaleString("pt-BR")} km).`,
    };
  }

  const deltaKm = odometerKm - previousKm;

  await db.truck.update({
    where: { id: truckId },
    data: { totalKm: odometerKm },
  });

  let tiresUpdated = 0;
  if (deltaKm > 0 && previousKm > 0) {
    const result = await db.tire.updateMany({
      where: { truckId, active: true },
      data: { currentKm: { increment: deltaKm } },
    });
    tiresUpdated = result.count;
  }

  return { ok: true, truckKm: odometerKm, deltaKm, tiresUpdated };
}
