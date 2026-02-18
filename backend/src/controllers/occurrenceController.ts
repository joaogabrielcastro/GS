import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

export const occurrenceController = {
  io: null as Server | null,

  setSocketIO(io: Server) {
    this.io = io;
  },

  // Criar ocorrência
  async create(req: Request, res: Response) {
    try {
      const driverId = (req as any).user.id;
      const {
        type,
        description,
        truckId,
        location,
        latitude,
        longitude,
        photoUrls,
        estimatedCost,
        hasFinalcialImpact,
      } = req.body;

      // Verificar se o caminhão existe
      const truck = await prisma.truck.findUnique({
        where: { id: truckId },
      });

      if (!truck) {
        return res.status(404).json({ error: 'Caminhão não encontrado' });
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
          estimatedCost,
          hasFinalcialImpact: hasFinalcialImpact || false,
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
        where: { role: 'ADMINISTRADOR', active: true },
      });

      // Se tiver impacto financeiro, notificar também o financeiro
      const roles: UserRole[] = ['ADMINISTRADOR'];
      if (hasFinalcialImpact) {
        roles.push('FINANCEIRO');
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
      if (this.io) {
        usersToNotify.forEach((user) => {
          this.io!.to(`user_${user.id}`).emit('newNotification', {
            notification,
            occurrence,
          });
        });
      }

      res.status(201).json({
        message: 'Ocorrência registrada com sucesso',
        occurrence,
      });
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
      res.status(500).json({ error: 'Erro ao registrar ocorrência' });
    }
  },

  // Listar ocorrências
  async list(req: Request, res: Response) {
    try {
      const { truckId, driverId, type, status, startDate, endDate } = req.query;
      const userRole = (req as any).user.role;
      const userId = (req as any).user.id;

      const where: any = {};

      // Motorista só vê suas próprias ocorrências
      if (userRole === 'MOTORISTA') {
        where.driverId = userId;
      } else {
        if (driverId) where.driverId = driverId;
      }

      if (truckId) where.truckId = truckId;
      if (type) where.type = type;
      if (status) where.status = status;

      if (startDate || endDate) {
        where.occurredAt = {};
        if (startDate) where.occurredAt.gte = new Date(startDate as string);
        if (endDate) where.occurredAt.lte = new Date(endDate as string);
      }

      const occurrences = await prisma.occurrence.findMany({
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
        orderBy: { occurredAt: 'desc' },
      });

      res.json(occurrences);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar ocorrências' });
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
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }

      res.json(occurrence);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar ocorrência' });
    }
  },

  // Atualizar status da ocorrência
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, resolutionNotes, actualCost } = req.body;

      const updateData: any = { status };

      if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
      if (actualCost) updateData.actualCost = actualCost;

      if (status === 'RESOLVIDO') {
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
          title: 'Ocorrência Atualizada',
          message: `Sua ocorrência foi atualizada para: ${status}`,
          occurrenceId: id,
          users: {
            create: {
              userId: occurrence.driverId,
            },
          },
        },
      });

      if (this.io) {
        this.io.to(`user_${occurrence.driverId}`).emit('newNotification', {
          notification,
          occurrence,
        });
      }

      res.json({ message: 'Ocorrência atualizada com sucesso', occurrence });
    } catch (error) {
      console.error('Erro ao atualizar ocorrência:', error);
      res.status(500).json({ error: 'Erro ao atualizar ocorrência' });
    }
  },

  // Upload de fotos de ocorrência
  async uploadPhotos(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Nenhuma foto enviada' });
      }

      const photoUrls = files.map(
        (file) => `/uploads/occurrences/${file.filename}`
      );

      res.json({ message: 'Fotos enviadas com sucesso', photoUrls });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: 'Erro ao fazer upload das fotos' });
    }
  },

  // Estatísticas de ocorrências
  async getStatistics(req: Request, res: Response) {
    try {
      const { truckId, startDate, endDate } = req.query;

      const where: any = {};
      if (truckId) where.truckId = truckId;

      if (startDate || endDate) {
        where.occurredAt = {};
        if (startDate) where.occurredAt.gte = new Date(startDate as string);
        if (endDate) where.occurredAt.lte = new Date(endDate as string);
      }

      const occurrences = await prisma.occurrence.findMany({ where });

      const stats = {
        total: occurrences.length,
        byType: {} as any,
        byStatus: {} as any,
        withFinancialImpact: occurrences.filter((o) => o.hasFinalcialImpact)
          .length,
        totalEstimatedCost: occurrences.reduce(
          (sum, o) => sum + Number(o.estimatedCost || 0),
          0
        ),
        totalActualCost: occurrences.reduce(
          (sum, o) => sum + Number(o.actualCost || 0),
          0
        ),
      };

      // Agrupar por tipo
      occurrences.forEach((o) => {
        stats.byType[o.type] = (stats.byType[o.type] || 0) + 1;
        stats.byStatus[o.status] = (stats.byStatus[o.status] || 0) + 1;
      });

      res.json(stats);
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      res.status(500).json({ error: 'Erro ao calcular estatísticas' });
    }
  },
};
