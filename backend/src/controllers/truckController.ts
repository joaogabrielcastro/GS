import { Request, Response } from "express";
import { Prisma, TruckStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

function normalizePlate(value: string) {
  return value.trim().toUpperCase();
}

function parseTrailerPlates(input: unknown): string[] {
  if (Array.isArray(input)) {
    return [...new Set(input.map((item) => normalizePlate(String(item))).filter(Boolean))];
  }
  if (typeof input === "string") {
    return [
      ...new Set(
        input
          .split(/[,\n;]+/)
          .map((item) => normalizePlate(item))
          .filter(Boolean),
      ),
    ];
  }
  return [];
}

export const truckController = {
  // Criar caminhão
  async create(req: Request, res: Response) {
    try {
      const {
        plate,
        trailerPlates,
        rntrc,
        tareKg,
        payloadCapacityKg,
        model,
        brand,
        year,
        status,
        vehicleType,
        acquisitionDate,
        totalKm,
        notes,
      } = req.body;

      const truck = await prisma.truck.create({
        data: {
          plate: String(plate).trim().toUpperCase(),
          trailerPlates: parseTrailerPlates(trailerPlates),
          rntrc: rntrc ? String(rntrc).trim() : null,
          tareKg: tareKg ? parseInt(String(tareKg), 10) : null,
          payloadCapacityKg: payloadCapacityKg
            ? parseInt(String(payloadCapacityKg), 10)
            : null,
          model,
          brand,
          year: parseInt(String(year), 10),
          status: status || "ATIVO",
          vehicleType: vehicleType || "TOCO",
          acquisitionDate: acquisitionDate
            ? new Date(acquisitionDate)
            : undefined,
          totalKm: totalKm ? parseInt(String(totalKm), 10) : 0,
          notes,
        },
      });

      res
        .status(201)
        .json({ message: "Caminhão cadastrado com sucesso", truck });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        return res.status(409).json({ error: "Placa já cadastrada" });
      }
      return res.status(500).json({ error: "Erro ao cadastrar caminhão" });
    }
  },

  // Listar caminhões
  async list(req: Request, res: Response) {
    try {
      const { status, active, page, limit } = req.query;
      const statusValue = typeof status === "string" ? status : undefined;

      const take = limit ? Math.min(Number(limit), 200) : undefined;
      const skip = page && take ? (Number(page) - 1) * take : undefined;

      const where: Prisma.TruckWhereInput = {};
      if (statusValue) where.status = statusValue as TruckStatus;
      if (active !== undefined) where.active = active === "true";

      const [trucks, total] = await Promise.all([
        prisma.truck.findMany({
          where,
          take,
          skip,
          include: {
            currentDriver: { select: { id: true, name: true, email: true } },
            tires: {
              where: { active: true },
              select: { id: true, code: true, position: true, status: true },
            },
            _count: { select: { checklists: true, occurrences: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        page ? prisma.truck.count({ where }) : Promise.resolve(null),
      ]);

      if (page) {
        return res.json({
          data: trucks,
          total,
          page: Number(page),
          limit: take,
          totalPages: Math.ceil((total ?? 0) / (take ?? 1)),
        });
      }
      res.json(trucks);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar caminhões" });
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
            orderBy: { position: "asc" },
          },
          checklists: {
            take: 10,
            orderBy: { date: "desc" },
            include: {
              driver: {
                select: { name: true },
              },
            },
          },
          occurrences: {
            take: 10,
            orderBy: { occurredAt: "desc" },
          },
        },
      });

      if (!truck) {
        return res.status(404).json({ error: "Caminhão não encontrado" });
      }

      res.json(truck);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar caminhão" });
    }
  },

  // Atualizar caminhão
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        plate,
        trailerPlates,
        rntrc,
        tareKg,
        payloadCapacityKg,
        model,
        brand,
        year,
        status,
        vehicleType,
        acquisitionDate,
        totalKm,
        notes,
      } = req.body;

      const updateData: Prisma.TruckUpdateInput = {};
      const existing = await prisma.truck.findUnique({
        where: { id },
        select: { trailerPlates: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Caminhão não encontrado" });
      }
      if (plate !== undefined)
        updateData.plate = String(plate).trim().toUpperCase();
      if (trailerPlates !== undefined) {
        updateData.trailerPlates = parseTrailerPlates(trailerPlates);
      }
      if (rntrc !== undefined) updateData.rntrc = rntrc ? String(rntrc).trim() : null;
      if (tareKg !== undefined)
        updateData.tareKg = tareKg ? parseInt(String(tareKg), 10) : null;
      if (payloadCapacityKg !== undefined)
        updateData.payloadCapacityKg = payloadCapacityKg
          ? parseInt(String(payloadCapacityKg), 10)
          : null;
      if (model !== undefined) updateData.model = model;
      if (brand !== undefined) updateData.brand = brand;
      if (year !== undefined) updateData.year = parseInt(String(year), 10);
      if (status !== undefined) updateData.status = status;
      if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
      if (acquisitionDate !== undefined)
        updateData.acquisitionDate = acquisitionDate
          ? new Date(acquisitionDate)
          : null;
      if (totalKm !== undefined)
        updateData.totalKm = parseInt(String(totalKm), 10);
      if (notes !== undefined) updateData.notes = notes;

      const truck = await prisma.truck.update({
        where: { id },
        data: updateData,
      });

      if (trailerPlates !== undefined) {
        const previous = existing.trailerPlates;
        const next = truck.trailerPlates;
        if (JSON.stringify(previous) !== JSON.stringify(next)) {
          await prisma.truckHistory.create({
            data: {
              truckId: id,
              action: "COMPOSICAO_ATUALIZADA",
              description: `Placas das carretas alteradas: ${
                previous.length > 0 ? previous.join(", ") : "sem carretas"
              } -> ${next.length > 0 ? next.join(", ") : "sem carretas"}`,
            },
          });
        }
      }

      res.json({ message: "Caminhão atualizado com sucesso", truck });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar caminhão" });
    }
  },

  // Listar caminhões disponíveis para motoristas
  async getAvailable(_req: Request, res: Response) {
    try {
      const trucks = await prisma.truck.findMany({
        where: {
          status: "ATIVO",
          currentDriverId: null,
          active: true,
        },
        orderBy: {
          plate: "asc",
        },
      });
      res.json(trucks);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar caminhões disponíveis" });
    }
  },

  // Motorista seleciona caminhão
  async selectTruck(req: Request, res: Response) {
    try {
      const { truckId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      // 1. Verificar se o caminhão está disponível
      const truck = await prisma.truck.findFirst({
        where: {
          id: truckId,
          status: "ATIVO",
          currentDriverId: null,
        },
      });

      if (!truck) {
        return res
          .status(400)
          .json({ error: "Caminhão indisponível ou não encontrado" });
      }

      // 2. Desatribuir qualquer caminhão anterior deste motorista
      await prisma.truck.updateMany({
        where: { currentDriverId: userId },
        data: { currentDriverId: null },
      });

      // 3. Atribuir novo caminhão
      const updatedTruck = await prisma.truck.update({
        where: { id: truckId },
        data: { currentDriverId: userId },
      });

      // 4. Registrar histórico
      await prisma.truckHistory.create({
        data: {
          truckId: updatedTruck.id,
          driverId: userId,
          action: "CHECKIN",
          description: "Motorista assumiu o caminhão",
        },
      });

      res.json({
        message: "Caminhão selecionado com sucesso",
        truck: updatedTruck,
      });
    } catch (error) {
      logger.error("Erro ao selecionar caminhão", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Erro ao selecionar caminhão" });
    }
  },

  // Motorista entrega caminhão
  async releaseTruck(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const truck = await prisma.truck.findFirst({
        where: { currentDriverId: userId },
      });

      if (!truck) {
        return res
          .status(404)
          .json({ error: "Você não possui caminhão atribuído." });
      }

      await prisma.truck.update({
        where: { id: truck.id },
        data: { currentDriverId: null },
      });

      await prisma.truckHistory.create({
        data: {
          truckId: truck.id,
          driverId: userId,
          action: "CHECKOUT",
          description: "Motorista entregou o caminhão",
        },
      });

      res.json({ message: "Caminhão entregue com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao entregar caminhão" });
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
          where: { id: driverId, role: "MOTORISTA", active: true },
        });

        if (!driver) {
          return res.status(404).json({ error: "Motorista não encontrado" });
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
          action: driverId ? "ATRIBUIDO" : "DESATRIBUIDO",
          description: driverId
            ? `Motorista ${truck.currentDriver?.name} atribuído ao caminhão`
            : "Motorista removido do caminhão",
        },
      });

      res.json({ message: "Motorista atribuído com sucesso", truck });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atribuir motorista" });
    }
  },

  // Deletar (desativar) caminhão
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.truck.update({
        where: { id },
        data: { active: false, status: "INATIVO" },
      });

      res.json({ message: "Caminhão desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao desativar caminhão" });
    }
  },

  // Obter histórico do caminhão
  async getHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const history = await prisma.truckHistory.findMany({
        where: { truckId: id },
        orderBy: { createdAt: "desc" },
      });

      res.json(history);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar histórico" });
    }
  },
};
