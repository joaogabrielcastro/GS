/**
 * ChecklistService — lógica de negócio de checklists separada do controller.
 */

import { prisma } from "../lib/prisma";

export interface ChecklistListOpts {
  page?: number;
  limit?: number;
  driverId?: string;
  truckId?: string;
  isApproved?: boolean;
  /** ISO date string: filtra checklists a partir desta data */
  from?: string;
  /** ISO date string: filtra checklists até esta data */
  to?: string;
}

export const checklistService = {
  async list(opts: ChecklistListOpts = {}) {
    const take = Math.min(opts.limit ?? 20, 200);
    const skip = opts.page ? (opts.page - 1) * take : 0;

    const where: any = {};
    if (opts.driverId) where.driverId = opts.driverId;
    if (opts.truckId) where.truckId = opts.truckId;
    if (opts.isApproved !== undefined) where.isApproved = opts.isApproved;
    if (opts.from || opts.to) {
      where.date = {};
      if (opts.from) where.date.gte = new Date(opts.from);
      if (opts.to) where.date.lte = new Date(opts.to);
    }

    const [checklists, total] = await Promise.all([
      prisma.dailyChecklist.findMany({
        where,
        take,
        skip,
        include: {
          truck: { select: { plate: true, model: true } },
          driver: { select: { name: true } },
          photos: {
            select: { id: true, category: true, photoUrl: true },
          },
        },
        orderBy: { date: "desc" },
      }),
      prisma.dailyChecklist.count({ where }),
    ]);

    return {
      data: checklists,
      total,
      page: opts.page ?? 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  },

  async getById(id: string) {
    return prisma.dailyChecklist.findUnique({
      where: { id },
      include: {
        truck: { select: { plate: true, model: true, brand: true } },
        driver: { select: { name: true, email: true } },
        photos: {
          select: { id: true, category: true, photoUrl: true, notes: true },
        },
      },
    });
  },

  /** Placeholder for future review workflow — fields not yet in schema */
  async review(
    _id: string,
    _reviewerId: string,
    _approved: boolean,
    _notes?: string,
  ) {
    // When review fields are added to schema, implement here.
    throw new Error("Review fields not yet in schema");
  },

  /** Verifica se um motorista já fez checklist hoje para determinado caminhão */
  async existsToday(driverId: string, truckId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await prisma.dailyChecklist.count({
      where: { driverId, truckId, date: { gte: today } },
    });
    return count > 0;
  },
};
