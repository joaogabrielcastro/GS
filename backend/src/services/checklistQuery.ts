import { Prisma } from "@prisma/client";
import { normalizePlate } from "../lib/plates";

export type ChecklistListFilters = {
  userRole: string;
  userId: string;
  truckId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
};

export function buildChecklistListWhere(
  filters: ChecklistListFilters,
): Prisma.DailyChecklistWhereInput {
  const where: Prisma.DailyChecklistWhereInput = {};

  if (filters.userRole === "MOTORISTA") {
    where.driverId = filters.userId;
  } else if (filters.driverId) {
    where.driverId = filters.driverId;
  }

  if (filters.truckId) where.truckId = filters.truckId;

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }

  const searchRaw = filters.search?.trim() ?? "";
  if (searchRaw) {
    const normPlate = normalizePlate(searchRaw);
    const searchOr: Prisma.DailyChecklistWhereInput[] = [
      { driver: { name: { contains: searchRaw, mode: "insensitive" } } },
      { truck: { plate: { contains: searchRaw, mode: "insensitive" } } },
    ];
    if (normPlate.length >= 5) {
      searchOr.push({ truck: { trailerPlates: { has: normPlate } } });
    }
    const existingAnd = where.AND;
    const andArr = Array.isArray(existingAnd)
      ? [...existingAnd]
      : existingAnd != null
        ? [existingAnd]
        : [];
    where.AND = [...andArr, { OR: searchOr }];
  }

  return where;
}
