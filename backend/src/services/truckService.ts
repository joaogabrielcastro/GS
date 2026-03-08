/**
 * TruckService — lógica de negócio de caminhões separada do controller.
 */

import { VehicleType } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface TruckListOpts {
  page?: number;
  limit?: number;
  status?: string;
  active?: boolean;
}

export const truckService = {
  async list(opts: TruckListOpts = {}) {
    const take = Math.min(opts.limit ?? 20, 200);
    const skip = opts.page ? (opts.page - 1) * take : 0;

    const where: any = {};
    if (opts.status) where.status = opts.status;
    if (opts.active !== undefined) where.active = opts.active;

    const [trucks, total] = await Promise.all([
      prisma.truck.findMany({
        where,
        take,
        skip,
        include: {
          currentDriver: { select: { id: true, name: true, email: true } },
          tires: {
            where: { active: true },
            select: { id: true, code: true, position: true, status: true },
          },
          _count: { select: { checklists: true, occurrences: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.truck.count({ where }),
    ]);

    return {
      data: trucks,
      total,
      page: opts.page ?? 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  },

  async listAll() {
    return prisma.truck.findMany({
      where: { active: true },
      select: {
        id: true,
        plate: true,
        model: true,
        brand: true,
        vehicleType: true,
        status: true,
      },
      orderBy: { plate: "asc" },
    });
  },

  async listAvailable() {
    return prisma.truck.findMany({
      where: { active: true, status: "ATIVO", currentDriverId: null },
      orderBy: { plate: "asc" },
    });
  },

  async getById(id: string) {
    return prisma.truck.findUnique({
      where: { id },
      include: {
        currentDriver: {
          select: { id: true, name: true, email: true, phone: true },
        },
        tires: { where: { active: true } },
        _count: { select: { checklists: true, occurrences: true } },
      },
    });
  },

  async create(data: {
    plate: string;
    model: string;
    brand: string;
    year: number;
    vehicleType?: string;
    totalKm?: number;
    acquisitionDate?: Date;
    notes?: string;
  }) {
    return prisma.truck.create({
      data: {
        ...data,
        plate: data.plate.trim().toUpperCase(),
        vehicleType: (data.vehicleType ?? "TOCO") as VehicleType,
        year: Number(data.year),
        totalKm: data.totalKm ? Number(data.totalKm) : 0,
      },
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    return prisma.truck.update({ where: { id }, data: data as any });
  },

  async assignDriver(truckId: string, driverId: string) {
    return prisma.truck.update({
      where: { id: truckId },
      data: { currentDriverId: driverId },
    });
  },

  async releaseDriver(truckId: string) {
    return prisma.truck.update({
      where: { id: truckId },
      data: { currentDriverId: null },
    });
  },
};
