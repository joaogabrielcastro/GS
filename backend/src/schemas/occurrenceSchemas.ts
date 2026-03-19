import { z } from "zod";

const uuidSchema = z.string().uuid("ID inválido");
const dateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Data inválida");

export const occurrenceIdParamSchema = z.object({
  id: uuidSchema,
});

export const createOccurrenceBodySchema = z.object({
  type: z.enum([
    "PNEU_ESTOURADO",
    "PROBLEMA_MECANICO",
    "LONA_RASGADA",
    "ACIDENTE",
    "MANUTENCAO",
    "OUTRO",
  ]),
  description: z.string().min(5),
  truckId: uuidSchema,
  location: z.string().max(255).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  photoUrls: z.array(z.string()).optional(),
  estimatedCost: z.coerce.number().nonnegative().optional(),
  hasFinancialImpact: z.boolean().optional(),
});

export const listOccurrencesQuerySchema = z.object({
  truckId: uuidSchema.optional(),
  driverId: uuidSchema.optional(),
  type: z
    .enum([
      "PNEU_ESTOURADO",
      "PROBLEMA_MECANICO",
      "LONA_RASGADA",
      "ACIDENTE",
      "MANUTENCAO",
      "OUTRO",
    ])
    .optional(),
  status: z
    .enum(["PENDENTE", "EM_ANALISE", "APROVADO", "REJEITADO", "RESOLVIDO"])
    .optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const occurrenceStatisticsQuerySchema = z.object({
  truckId: uuidSchema.optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
});

export const updateOccurrenceStatusBodySchema = z.object({
  status: z.enum(["PENDENTE", "EM_ANALISE", "APROVADO", "REJEITADO", "RESOLVIDO"]),
  resolutionNotes: z.string().max(2000).optional(),
  actualCost: z.coerce.number().nonnegative().optional(),
});
