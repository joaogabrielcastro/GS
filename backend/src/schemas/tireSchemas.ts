import { z } from "zod";

const uuidSchema = z.string().uuid("ID inválido");

export const tireIdParamSchema = z.object({
  id: uuidSchema,
});

export const createTireBodySchema = z.object({
  code: z.string().min(2),
  brand: z.string().min(1),
  model: z.string().min(1),
  position: z.string().min(2),
  truckId: uuidSchema,
  cost: z.coerce.number().nonnegative(),
  initialKm: z.coerce.number().int().nonnegative(),
  lifeExpectancyKm: z.coerce.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateTireBodySchema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  position: z.string().min(2).optional(),
  status: z
    .enum(["NOVO", "BOM", "DESGASTADO", "RECAPADO", "SUBSTITUIDO", "DESCARTADO"])
    .optional(),
  currentKm: z.coerce.number().int().nonnegative().optional(),
  lifeExpectancyKm: z.coerce.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
});

export const listTiresQuerySchema = z.object({
  truckId: uuidSchema.optional(),
  status: z
    .enum(["NOVO", "BOM", "DESGASTADO", "RECAPADO", "SUBSTITUIDO", "DESCARTADO"])
    .optional(),
  active: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const tireStatisticsQuerySchema = z.object({
  truckId: uuidSchema.optional(),
});

export const registerTireEventBodySchema = z.object({
  eventType: z.enum([
    "INSTALACAO",
    "REMOCAO",
    "ESTOURO",
    "TROCA",
    "RECAPAGEM",
    "MANUTENCAO",
    "DESGASTE",
  ]),
  description: z.string().min(1),
  kmAtEvent: z.coerce.number().int().nonnegative(),
  cost: z.coerce.number().nonnegative().optional(),
  photoUrl: z.string().max(500).optional(),
});
