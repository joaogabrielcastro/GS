import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const truckController = {
  // Criar caminhão
  async create(req: Request, res: Response) {
    try {
      const {
        plate,
        model,
        brand,
        year,
        status,
        acquisitionDate,
        totalKm,
        notes,
      } = req.body;

      const truck = await prisma.truck.create({
        data: {
          plate,
          model,
          brand,
          year,
          status,
          acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : undefined,
          totalKm: totalKm || 0,
          notes,
        },
      });

      res.status(201).json({ message: 'Caminhão cadastrado com sucesso', truck });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Placa já cadastrada' });
      }
      res.status(500).json({ error: 'Erro ao cadastrar caminhão' });
    }
  },

  // Listar caminhões
  async list(req: Request, res: Response) {
    try {
      const { status, active } = req.query;

      const where: any = {};
      if (status) where.status = status;
      if (active !== undefined) where.active = active === 'true';

      const trucks = await prisma.truck.findMany({
        where,
        include: {
          currentDriver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tires: {
            where: { active: true },
            select: {
              id: true,
              code: true,
              position: true,
              status: true,
            },
          },
          _count: {
            select: {
              checklists: true,
              occurrences: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(trucks);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar caminhões' });
    }
  },

  // Buscar caminhão por ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const truck = await prisma.truck.findUnique({
        where: { id },
        include: {
          currentDriver: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          tires: {
            where: { active: true },
            orderBy: { position: 'asc' },
          },
          checklists: {
            take: 10,
            orderBy: { date: 'desc' },
            include: {
              driver: {
                select: { name: true },
              },
            },
          },
          occurrences: {
            take: 10,
            orderBy: { occurredAt: 'desc' },
          },
        },
      });

      if (!truck) {
        return res.status(404).json({ error: 'Caminhão não encontrado' });
      }

      res.json(truck);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar caminhão' });
    }
  },

  // Atualizar caminhão
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const truck = await prisma.truck.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      res.json({ message: 'Caminhão atualizado com sucesso', truck });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar caminhão' });
    }
  },

  // Atribuir motorista
  async assignDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { driverId } = req.body;

      // Verificar se o motorista existe
      if (driverId) {
        const driver = await prisma.user.findFirst({
          where: { id: driverId, role: 'MOTORISTA', active: true },
        });

        if (!driver) {
          return res.status(404).json({ error: 'Motorista não encontrado' });
        }
      }

      const truck = await prisma.truck.update({
        where: { id },
        data: { currentDriverId: driverId || null },
        include: {
          currentDriver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Registrar no histórico
      await prisma.truckHistory.create({
        data: {
          truckId: id,
          driverId,
          action: driverId ? 'ATRIBUIDO' : 'DESATRIBUIDO',
          description: driverId
            ? `Motorista ${truck.currentDriver?.name} atribuído ao caminhão`
            : 'Motorista removido do caminhão',
        },
      });

      res.json({ message: 'Motorista atribuído com sucesso', truck });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atribuir motorista' });
    }
  },

  // Deletar (desativar) caminhão
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.truck.update({
        where: { id },
        data: { active: false, status: 'INATIVO' },
      });

      res.json({ message: 'Caminhão desativado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao desativar caminhão' });
    }
  },

  // Obter histórico do caminhão
  async getHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const history = await prisma.truckHistory.findMany({
        where: { truckId: id },
        orderBy: { createdAt: 'desc' },
      });

      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  },
};
