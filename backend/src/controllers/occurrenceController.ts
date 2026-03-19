import { Request, Response } from "express";
import { OccurrenceStatus, OccurrenceType, Prisma, UserRole } from "@prisma/client";
import { Server } from "socket.io";
import { prisma } from "../lib/prisma";
import { buildPrivateFileUrl } from "../lib/storage";
import { logger } from "../lib/logger";

// Variável de módulo para evitar perda de contexto do 'this'
let socketIO: Server | null = null;

export const occurrenceController = {
  setSocketIO(io: Server) {
    socketIO = io;
  },

  // Criar ocorrência
  async create(req: Request, res: Response) {
    try {
      const driverId = req.user?.id;
      if (!driverId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }
      const {
        type,
        description,
        truckId,
        location,
        latitude,
        longitude,
        photoUrls,
        estimatedCost,
        hasFinancialImpact,
      } = req.body;

      // Verificar se o caminhão existe
      const truck = await prisma.truck.findUnique({
        where: { id: truckId },
      });

      if (!truck) {
        return res.status(404).json({ error: "Caminhão não encontrado" });
      }

      const occurrence = await prisma.occurrence.create({
        data: {
          type,
          description,
          truckId,
          driverId,
          location,
          latitude,
          longitude,
          photoUrls: photoUrls || [],
          estimatedCost: estimatedCost ?? null,
          hasFinancialImpact:
            estimatedCost != null ? true : hasFinancialImpact || false,
        },
        include: {
          truck: {
            select: {
              plate: true,
              model: true,
            },
          },
          driver: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Criar notificação para administradores
      const admins = await prisma.user.findMany({
        where: { role: "ADMINISTRADOR", active: true },
      });

      // Se tiver impacto financeiro, notificar também o financeiro
      const roles: UserRole[] = ["ADMINISTRADOR"];
      if (hasFinancialImpact) {
        roles.push("FINANCEIRO");
      }

      const usersToNotify = await prisma.user.findMany({
        where: {
          role: { in: roles },
          active: true,
        },
      });

      const notification = await prisma.notification.create({
        data: {
          title: `Nova Ocorrência: ${type}`,
          message: `${occurrence.driver.name} reportou: ${description}`,
          occurrenceId: occurrence.id,
          users: {
            create: usersToNotify.map((user) => ({
              userId: user.id,
            })),
          },
        },
        include: {
          users: true,
        },
      });

      // Enviar notificação em tempo real via Socket.IO
      if (socketIO) {
        usersToNotify.forEach((user) => {
          socketIO!.to(`user_${user.id}`).emit("newNotification", {
            notification,
            occurrence,
          });
        });
      }

      res.status(201).json({
        message: "Ocorrência registrada com sucesso",
        occurrence,
      });
    } catch (error) {
      logger.error("Erro ao criar ocorrência", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: "Erro ao registrar ocorrência" });
    }
  },

  // Listar ocorrências
  async list(req: Request, res: Response) {
    try {
      const {
        truckId,
        driverId,
        type,
        status,
        startDate,
        endDate,
        page = "1",
        limit = "10",
      } = req.query;
      const truckIdValue = typeof truckId === "string" ? truckId : undefined;
      const driverIdValue = typeof driverId === "string" ? driverId : undefined;
      const typeValue = typeof type === "string" ? type : undefined;
      const statusValue = typeof status === "string" ? status : undefined;
      const userRole = req.user?.role;
      const userId = req.user?.id;
      if (!userRole || !userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }
      const parsedPage = Math.max(parseInt(page as string, 10) || 1, 1);
      const parsedLimit = Math.min(
        Math.max(parseInt(limit as string, 10) || 10, 1),
        100,
      );
      const skip = (parsedPage - 1) * parsedLimit;

      const where: Prisma.OccurrenceWhereInput = {};

      // Motorista só vê suas próprias ocorrências
      if (userRole === "MOTORISTA") {
        where.driverId = userId;
      } else {
        if (driverIdValue) where.driverId = driverIdValue;
      }

      if (truckIdValue) where.truckId = truckIdValue;
      if (typeValue) where.type = typeValue as OccurrenceType;
      if (statusValue) where.status = statusValue as OccurrenceStatus;

      if (startDate || endDate) {
        where.occurredAt = {};
        if (startDate) where.occurredAt.gte = new Date(startDate as string);
        if (endDate) where.occurredAt.lte = new Date(endDate as string);
      }

      const [total, occurrences] = await Promise.all([
        prisma.occurrence.count({ where }),
        prisma.occurrence.findMany({
          where,
          include: {
            truck: {
              select: {
                id: true,
                plate: true,
                model: true,
              },
            },
            driver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { occurredAt: "desc" },
          skip,
          take: parsedLimit,
        }),
      ]);

      res.json({
        data: occurrences,
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar ocorrências" });
    }
  },

  // Buscar ocorrência por ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const occurrence = await prisma.occurrence.findUnique({
        where: { id },
        include: {
          truck: true,
          driver: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!occurrence) {
        return res.status(404).json({ error: "Ocorrência não encontrada" });
      }

      res.json(occurrence);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar ocorrência" });
    }
  },

  // Atualizar status da ocorrência
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, resolutionNotes, actualCost } = req.body;

      const updateData: Prisma.OccurrenceUpdateInput = { status };

      if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
      if (actualCost) updateData.actualCost = actualCost;

      if (status === "RESOLVIDO") {
        updateData.resolvedAt = new Date();
      }

      const occurrence = await prisma.occurrence.update({
        where: { id },
        data: updateData,
        include: {
          driver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Notificar o motorista sobre a atualização
      const notification = await prisma.notification.create({
        data: {
          title: "Ocorrência Atualizada",
          message: `Sua ocorrência foi atualizada para: ${status}`,
          occurrenceId: id,
          users: {
            create: {
              userId: occurrence.driverId,
            },
          },
        },
      });

      if (socketIO) {
        socketIO.to(`user_${occurrence.driverId}`).emit("newNotification", {
          notification,
          occurrence,
        });
      }

      res.json({ message: "Ocorrência atualizada com sucesso", occurrence });
    } catch (error) {
      logger.error("Erro ao atualizar ocorrência", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: "Erro ao atualizar ocorrência" });
    }
  },

  // Upload de fotos de ocorrência
  async uploadPhotos(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhuma foto enviada" });
      }

      const photoUrls = files.map(
        (file) => buildPrivateFileUrl("occurrences", file.filename),
      );

      res.json({ message: "Fotos enviadas com sucesso", photoUrls });
    } catch (error) {
      logger.error("Erro no upload de ocorrência", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: "Erro ao fazer upload das fotos" });
    }
  },

  // Estatísticas de ocorrências
  async getStatistics(req: Request, res: Response) {
    try {
      const { truckId, startDate, endDate } = req.query;
      const truckIdValue = typeof truckId === "string" ? truckId : undefined;

      const where: Prisma.OccurrenceWhereInput = {};
      if (truckIdValue) where.truckId = truckIdValue;

      if (startDate || endDate) {
        where.occurredAt = {};
        if (startDate) where.occurredAt.gte = new Date(startDate as string);
        if (endDate) where.occurredAt.lte = new Date(endDate as string);
      }

      const occurrences = await prisma.occurrence.findMany({ where });

      const byType: Partial<Record<OccurrenceType, number>> = {};
      const byStatus: Partial<Record<OccurrenceStatus, number>> = {};

      const stats = {
        total: occurrences.length,
        byType,
        byStatus,
        withFinancialImpact: occurrences.filter((o) => o.hasFinancialImpact)
          .length,
        totalEstimatedCost: occurrences.reduce(
          (sum, o) => sum + Number(o.estimatedCost || 0),
          0,
        ),
        totalActualCost: occurrences.reduce(
          (sum, o) => sum + Number(o.actualCost || 0),
          0,
        ),
      };

      // Agrupar por tipo
      occurrences.forEach((o) => {
        byType[o.type] = (byType[o.type] || 0) + 1;
        byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      });

      res.json(stats);
    } catch (error) {
      logger.error("Erro ao calcular estatísticas de ocorrências", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: "Erro ao calcular estatísticas" });
    }
  },
};
