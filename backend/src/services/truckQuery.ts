import { Prisma, TruckStatus } from "@prisma/client";
import { normalizePlate } from "../lib/plates";

export function buildTruckListWhere(params: {
  status?: string;
  active?: string;
  search?: string;
}): Prisma.TruckWhereInput {
  const where: Prisma.TruckWhereInput = {};
  if (params.status) where.status = params.status as TruckStatus;
  if (params.active !== undefined) where.active = params.active === "true";

  const searchRaw = params.search?.trim() ?? "";
  if (searchRaw) {
    const normPlate = normalizePlate(searchRaw);
    const orFilters: Prisma.TruckWhereInput[] = [
      { plate: { contains: searchRaw, mode: "insensitive" } },
      { brand: { contains: searchRaw, mode: "insensitive" } },
      { model: { contains: searchRaw, mode: "insensitive" } },
      {
        currentDriver: {
          is: { name: { contains: searchRaw, mode: "insensitive" } },
        },
      },
    ];
    if (normPlate.length >= 5) {
      orFilters.push({ trailerPlates: { has: normPlate } });
    }
    where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { OR: orFilters }];
  }

  return where;
}
