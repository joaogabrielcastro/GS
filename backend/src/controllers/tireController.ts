import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const tireController = {
  // Criar pneu
  async create(req: Request, res: Response) {
    try {
      const {
        code,
        brand,
        model,
        position,
        truckId,
        cost,
        initialKm,
        lifeExpectancyKm,
        notes,
      } = req.body;

      // Verificar se o código já existe
      const existingTire = await prisma.tire.findUnique({
        where: { code },
      });

      if (existingTire) {
        return res.status(409).json({ error: 'Código de pneu já cadastrado' });
      }

      // Verificar se o caminhão existe
      const truck = await prisma.truck.findUnique({
        where: { id: truckId },
      });

      if (!truck) {
        return res.status(404).json({ error: 'Caminhão não encontrado' });
      }

      const tire = await prisma.tire.create({
        data: {
          code,
          brand,
          model,
          position,
          truckId,
          cost,
          initialKm,
          currentKm: initialKm,
          lifeExpectancyKm,
          notes,
        },
      });

      // Registrar evento de instalação
      await prisma.tireEvent.create({
        data: {
          tireId: tire.id,
          eventType: 'INSTALACAO',
          description: `Pneu instalado na posição ${position}`,
          kmAtEvent: initialKm,
          cost,
        },
      });

      res.status(201).json({ message: 'Pneu cadastrado com sucesso', tire });
    } catch (error) {
      console.error('Erro ao criar pneu:', error);
      res.status(500).json({ error: 'Erro ao cadastrar pneu' });
    }
  },

  // Listar pneus
  async list(req: Request, res: Response) {
    try {
      const { truckId, status, active } = req.query;

      const where: any = {};
      if (truckId) where.truckId = truckId;
      if (status) where.status = status;
      if (active !== undefined) where.active = active === 'true';

      const tires = await prisma.tire.findMany({
        where,
        include: {
          truck: {
            select: {
              id: true,
              plate: true,
              model: true,
            },
          },
          events: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(tires);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar pneus' });
    }
  },

  // Buscar pneu por ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const tire = await prisma.tire.findUnique({
        where: { id },
        include: {
          truck: {
            select: {
              id: true,
              plate: true,
              model: true,
              brand: true,
            },
          },
          events: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!tire) {
        return res.status(404).json({ error: 'Pneu não encontrado' });
      }

      // Calcular estatísticas
      const kmUsed = tire.currentKm - tire.initialKm;
      const costPerKm = kmUsed > 0 ? Number(tire.cost) / kmUsed : 0;

      res.json({
        ...tire,
        statistics: {
          kmUsed,
          costPerKm: costPerKm.toFixed(4),
          eventCount: tire.events.length,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar pneu' });
    }
  },

  // Atualizar pneu
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const tire = await prisma.tire.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      res.json({ message: 'Pneu atualizado com sucesso', tire });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar pneu' });
    }
  },

  // Registrar evento do pneu
  async registerEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { eventType, description, kmAtEvent, cost, photoUrl } = req.body;

      const tire = await prisma.tire.findUnique({
        where: { id },
      });

      if (!tire) {
        return res.status(404).json({ error: 'Pneu não encontrado' });
      }

      const event = await prisma.tireEvent.create({
        data: {
          tireId: id,
          eventType,
          description,
          kmAtEvent,
          cost,
          photoUrl,
        },
      });

      // Atualizar status do pneu conforme o evento
      let newStatus = tire.status;
      let updateData: any = { currentKm: kmAtEvent };

      if (eventType === 'ESTOURO' || eventType === 'SUBSTITUIDO') {
        newStatus = 'SUBSTITUIDO';
        updateData.active = false;
        updateData.status = newStatus;
      } else if (eventType === 'RECAPAGEM') {
        newStatus = 'RECAPADO';
        updateData.status = newStatus;
      }

      await prisma.tire.update({
        where: { id },
        data: updateData,
      });

      res.status(201).json({ message: 'Evento registrado com sucesso', event });
    } catch (error) {
      console.error('Erro ao registrar evento:', error);
      res.status(500).json({ error: 'Erro ao registrar evento' });
    }
  },

  // Obter estatísticas de pneus
  async getStatistics(req: Request, res: Response) {
    try {
      const { truckId } = req.query;

      const where: any = { active: true };
      if (truckId) where.truckId = truckId;

      const tires = await prisma.tire.findMany({
        where,
        include: {
          events: true,
        },
      });

      // Calcular estatísticas
      const totalCost = tires.reduce(
        (sum, tire) => sum + Number(tire.cost),
        0
      );

      const totalEvents = tires.reduce(
        (sum, tire) => sum + tire.events.length,
        0
      );

      const averageLifeKm =
        tires.length > 0
          ? tires.reduce(
              (sum, tire) => sum + (tire.currentKm - tire.initialKm),
              0
            ) / tires.length
          : 0;

      const eventsByType = await prisma.tireEvent.groupBy({
        by: ['eventType'],
        _count: true,
        where: truckId ? { tire: { truckId: truckId as string } } : {},
      });

      res.json({
        totalTires: tires.length,
        totalCost,
        totalEvents,
        averageLifeKm: Math.round(averageLifeKm),
        eventsByType,
        costPerKm: averageLifeKm > 0 ? (totalCost / (averageLifeKm * tires.length)).toFixed(4) : 0,
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      res.status(500).json({ error: 'Erro ao calcular estatísticas' });
    }
  },

  // Deletar (desativar) pneu
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.tire.update({
        where: { id },
        data: {
          active: false,
          status: 'DESCARTADO',
        },
      });

      res.json({ message: 'Pneu desativado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao desativar pneu' });
    }
  },

  // Alertas de pneus
  async getAlerts(req: Request, res: Response) {
    try {
      const tires = await prisma.tire.findMany({
        where: { active: true },
        include: {
          truck: {
            select: {
              plate: true,
              model: true,
            },
          },
          events: {
            where: {
              eventType: { in: ['ESTOURO', 'MANUTENCAO'] },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      const alerts = [];

      for (const tire of tires) {
        const kmUsed = tire.currentKm - tire.initialKm;

        // Alerta de fim de vida útil
        if (tire.lifeExpectancyKm && kmUsed >= tire.lifeExpectancyKm * 0.9) {
          alerts.push({
            tireId: tire.id,
            tireCode: tire.code,
            truck: tire.truck,
            type: 'VIDA_UTIL',
            severity: kmUsed >= tire.lifeExpectancyKm ? 'CRITICO' : 'ALERTA',
            message: `Pneu próximo do fim da vida útil (${kmUsed}/${tire.lifeExpectancyKm} km)`,
          });
        }

        // Alerta de recorrência de problemas
        const problemEvents = tire.events.filter(
          (e) => e.eventType === 'ESTOURO' || e.eventType === 'MANUTENCAO'
        );

        if (problemEvents.length >= 3) {
          alerts.push({
            tireId: tire.id,
            tireCode: tire.code,
            truck: tire.truck,
            type: 'RECORRENCIA',
            severity: 'ALERTA',
            message: `Pneu com ${problemEvents.length} ocorrências de problemas`,
          });
        }
      }

      res.json({ alerts, count: alerts.length });
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      res.status(500).json({ error: 'Erro ao buscar alertas' });
    }
  },
};
