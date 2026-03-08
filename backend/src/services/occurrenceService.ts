/**
 * OccurrenceService — lógica de negócio de ocorrências separada do controller.
 */

import { OccurrenceStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface OccurrenceListOpts {
  page?: number;
  limit?: number;
  status?: string;
  driverId?: string;
  truckId?: string;
}

export const occurrenceService = {
  async list(opts: OccurrenceListOpts = {}) {
    const take = Math.min(opts.limit ?? 20, 200);
    const skip = opts.page ? (opts.page - 1) * take : 0;

    const where: any = {};
    if (opts.status) where.status = opts.status;
    if (opts.driverId) where.driverId = opts.driverId;
    if (opts.truckId) where.truckId = opts.truckId;

    const [occurrences, total] = await Promise.all([
      prisma.occurrence.findMany({
        where,
        take,
        skip,
        include: {
          truck: { select: { plate: true, model: true } },
          driver: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.occurrence.count({ where }),
    ]);

    return {
      data: occurrences,
      total,
      page: opts.page ?? 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  },

  async getById(id: string) {
    return prisma.occurrence.findUnique({
      where: { id },
      include: {
        truck: { select: { plate: true, model: true } },
        driver: { select: { name: true, email: true } },
      },
    });
  },

  async updateStatus(
    id: string,
    status: string,
    opts?: {
      resolutionNotes?: string;
      actualCost?: number;
      resolvedById?: string;
    },
  ) {
    return prisma.occurrence.update({
      where: { id },
      data: {
        status: status as OccurrenceStatus,
        resolutionNotes: opts?.resolutionNotes,
        actualCost: opts?.actualCost,
        resolvedAt: status === "RESOLVIDO" ? new Date() : undefined,
      },
    });
  },

  /** Resumo para dashboard: total por status */
  async countByStatus() {
    const rows = await prisma.occurrence.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    return Object.fromEntries(rows.map((r) => [r.status, r._count._all]));
  },

  /** Custo total das ocorrências resolvidas num período */
  async totalCostInPeriod(from: Date, to: Date) {
    const result = await prisma.occurrence.aggregate({
      where: {
        status: "RESOLVIDO",
        resolvedAt: { gte: from, lte: to },
        actualCost: { not: null },
      },
      _sum: { actualCost: true },
    });
    return result._sum.actualCost ?? 0;
  },
};
