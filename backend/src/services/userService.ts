/**
 * Camada de Service — padrão base para separar lógica de negócio dos controllers.
 *
 * Objetivo:
 *   Controllers  → recebem Request/Response, delegam para o Service, retornam HTTP
 *   Services     → lógica de negócio pura, sem Express, testável isoladamente
 *   Repositories → (opcional) queries Prisma isoladas, reutilizáveis entre services
 *
 * Exemplo de usage no controller:
 *   import { userService } from "../services/userService";
 *   const user = await userService.findByEmail(email);
 */

import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

export const userService = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        cpf: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  },

  async create(data: {
    email: string;
    password: string;
    name: string;
    cpf?: string;
    phone?: string;
    role: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing)
      throw Object.assign(new Error("Email já cadastrado"), {
        statusCode: 409,
      });

    const hashed = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: { ...data, password: hashed, role: data.role as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ) {
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;

    if (data.currentPassword && data.newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user)
        throw Object.assign(new Error("Usuário não encontrado"), {
          statusCode: 404,
        });

      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid)
        throw Object.assign(new Error("Senha atual incorreta"), {
          statusCode: 400,
        });

      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, role: true },
    });
  },

  async listByRole(role?: string) {
    return prisma.user.findMany({
      where: role ? { role: role as any } : {},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        phone: true,
        cpf: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  },
};
