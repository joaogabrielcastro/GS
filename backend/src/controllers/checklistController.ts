import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checklistController = {
  // Criar checklist diário
  async create(req: Request, res: Response) {
    try {
      const driverId = (req as any).user.id;
      const {
        truckId,
        cabinPhotoUrl,
        tiresPhotoUrl,
        canvasPhotoUrl,
        overallCondition,
        notes,
        location,
        latitude,
        longitude,
      } = req.body;

      // Verificar se o caminhão existe
      const truck = await prisma.truck.findUnique({
        where: { id: truckId },
      });

      if (!truck) {
        return res.status(404).json({ error: 'Caminhão não encontrado' });
      }

      // Verificar se já existe checklist hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingChecklist = await prisma.dailyChecklist.findFirst({
        where: {
          truckId,
          driverId,
          date: {
            gte: today,
          },
        },
      });

      if (existingChecklist) {
        return res.status(409).json({
          error: 'Checklist já foi preenchido hoje para este caminhão',
        });
      }

      const checklist = await prisma.dailyChecklist.create({
        data: {
          truckId,
          driverId,
          cabinPhotoUrl,
          tiresPhotoUrl,
          canvasPhotoUrl,
          overallCondition,
          notes,
          location,
          latitude,
          longitude,
        },
      });

      res.status(201).json({
        message: 'Checklist criado com sucesso',
        checklist,
      });
    } catch (error) {
      console.error('Erro ao criar checklist:', error);
      res.status(500).json({ error: 'Erro ao criar checklist' });
    }
  },

  // Listar checklists
  async list(req: Request, res: Response) {
    try {
      const { truckId, driverId, startDate, endDate } = req.query;
      const userRole = (req as any).user.role;
      const userId = (req as any).user.id;

      const where: any = {};

      // Motorista só vê seus próprios checklists
      if (userRole === 'MOTORISTA') {
        where.driverId = userId;
      } else {
        if (driverId) where.driverId = driverId;
      }

      if (truckId) where.truckId = truckId;

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }

      const checklists = await prisma.dailyChecklist.findMany({
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
        orderBy: { date: 'desc' },
      });

      res.json(checklists);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar checklists' });
    }
  },

  // Buscar checklist por ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const checklist = await prisma.dailyChecklist.findUnique({
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

      if (!checklist) {
        return res.status(404).json({ error: 'Checklist não encontrado' });
      }

      res.json(checklist);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar checklist' });
    }
  },

  // Upload de fotos do checklist
  async uploadPhotos(req: Request, res: Response) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const photoUrls: any = {};

      if (files.cabinPhoto) {
        photoUrls.cabinPhotoUrl = `/uploads/checklist/${files.cabinPhoto[0].filename}`;
      }

      if (files.tiresPhoto) {
        photoUrls.tiresPhotoUrl = `/uploads/checklist/${files.tiresPhoto[0].filename}`;
      }

      if (files.canvasPhoto) {
        photoUrls.canvasPhotoUrl = `/uploads/checklist/${files.canvasPhoto[0].filename}`;
      }

      res.json({ message: 'Fotos enviadas com sucesso', photoUrls });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: 'Erro ao fazer upload das fotos' });
    }
  },
};
