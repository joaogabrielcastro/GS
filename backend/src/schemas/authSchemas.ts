import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .max(72, "Senha muito longa");

export const registerBodySchema = z.object({
  email: z.string().email("Email inválido"),
  password: passwordSchema,
  name: z.string().min(2, "Nome obrigatório"),
  cpf: z.string().min(11).max(14).optional(),
  phone: z.string().min(8).max(20).optional(),
});

export const loginBodySchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const createUserBodySchema = z.object({
  email: z.string().email("Email inválido"),
  password: passwordSchema,
  name: z.string().min(2, "Nome obrigatório"),
  cpf: z.string().min(11).max(14).optional(),
  phone: z.string().min(8).max(20).optional(),
  role: z.enum(["MOTORISTA", "ADMINISTRADOR", "FINANCEIRO"]),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const updateUserBodySchema = z.object({
  email: z.string().email("Email inválido").optional(),
  password: passwordSchema.optional(),
  name: z.string().min(2, "Nome obrigatório").optional(),
  cpf: z.string().min(11).max(14).optional(),
  phone: z.string().min(8).max(20).optional(),
  role: z.enum(["MOTORISTA", "ADMINISTRADOR", "FINANCEIRO"]).optional(),
  active: z.boolean().optional(),
});

export const updateProfileBodySchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(8).max(20).optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: passwordSchema.optional(),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(["MOTORISTA", "ADMINISTRADOR", "FINANCEIRO"]).optional(),
});
