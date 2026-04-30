import { z } from "zod";

const uuidSchema = z.string().uuid("ID inválido");

export const truckIdParamSchema = z.object({
  id: uuidSchema,
});

export const createTruckBodySchema = z.object({
  plate: z.string().min(6, "Placa inválida"),
  trailerPlates: z
    .union([z.array(z.string().min(6)), z.string()])
    .optional(),
  model: z.string().min(1, "Modelo obrigatório"),
  brand: z.string().min(1, "Marca obrigatória"),
  year: z.coerce.number().int().min(1950).max(2100),
  status: z.enum(["ATIVO", "MANUTENCAO", "PARADO", "INATIVO"]).optional(),
  vehicleType: z
    .enum([
      "TOCO",
      "TRUCK",
      "BITRUCK",
      "CAVALO_MECANICO",
      "CARRETA_SIMPLES",
      "CARRETA_LS",
      "BITREM",
      "RODOTREM",
    ])
    .optional(),
  acquisitionDate: z.string().datetime().optional(),
  totalKm: z.coerce.number().int().nonnegative().optional(),
  rntrc: z.string().min(8).max(20).optional(),
  tareKg: z.coerce.number().int().nonnegative().optional(),
  payloadCapacityKg: z.coerce.number().int().nonnegative().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateTruckBodySchema = createTruckBodySchema.partial();

export const listTrucksQuerySchema = z.object({
  status: z.enum(["ATIVO", "MANUTENCAO", "PARADO", "INATIVO"]).optional(),
  active: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const selectTruckBodySchema = z.object({
  truckId: uuidSchema,
});

export const assignDriverBodySchema = z.object({
  driverId: uuidSchema.nullable().optional(),
});
