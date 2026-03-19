import { z } from "zod";

const uuidSchema = z.string().uuid("ID inválido");
const dateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Data inválida");

export const checklistIdParamSchema = z.object({
  id: uuidSchema,
});

const checklistPhotoSchema = z.object({
  category: z.string().min(1),
  axleNumber: z.coerce.number().int().positive().optional(),
  side: z.string().optional(),
  photoUrl: z.string().min(1),
  notes: z.string().optional(),
});

export const createChecklistBodySchema = z.object({
  truckId: uuidSchema,
  cabinPhotoUrl: z.string().optional(),
  tiresPhotoUrl: z.string().optional(),
  canvasPhotoUrl: z.string().optional(),
  overallCondition: z.string().optional(),
  tiresCondition: z.string().optional(),
  cabinCondition: z.string().optional(),
  canvasCondition: z.string().optional(),
  notes: z.string().max(2000).optional(),
  location: z.string().max(255).optional(),
  latitude: z.union([z.coerce.number(), z.string()]).optional(),
  longitude: z.union([z.coerce.number(), z.string()]).optional(),
  checklistPhotos: z.union([z.string(), z.array(checklistPhotoSchema)]).optional(),
});

export const listChecklistsQuerySchema = z.object({
  truckId: uuidSchema.optional(),
  driverId: uuidSchema.optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
