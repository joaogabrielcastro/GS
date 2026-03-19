import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

export const dashboardController = {
  async getAdminStats(req: Request, res: Response) {
    try {
      const [
        activeTrucksCount,
        driversCount,
        pendingOccurrencesCount,
        recentActivities,
        recentChecklists,
      ] = await Promise.all([
        prisma.truck.count({ where: { status: "ATIVO" } }),
        prisma.user.count({ where: { role: "MOTORISTA", active: true } }),
        prisma.occurrence.count({
          where: { status: { in: ["PENDENTE", "EM_ANALISE"] } },
        }),
        prisma.occurrence.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            truck: { select: { plate: true } },
            driver: { select: { name: true } },
          },
        }),
        prisma.dailyChecklist.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            truck: { select: { plate: true } },
            driver: { select: { name: true } },
          },
        }),
      ]);

      res.json({
        trucks: { active: activeTrucksCount },
        drivers: { total: driversCount },
        occurrences: { pending: pendingOccurrencesCount },
        recentActivity: recentActivities.map((occ) => ({
          type: "OCCURRENCE",
          id: occ.id,
          description: `Ocorrência ${occ.type} em ${occ.truck.plate}`,
          user: occ.driver.name,
          date: occ.createdAt,
          status: occ.status,
        })),
        recentChecklists: recentChecklists.map((check) => ({
          type: "CHECKLIST",
          id: check.id,
          description: `Checklist realizado em ${check.truck.plate}`,
          user: check.driver.name,
          date: check.createdAt,
          status:
            check.overallCondition === "BOM"
              ? "APROVADO"
              : check.overallCondition === "REGULAR"
                ? "ATENÇÃO"
                : "REJEITADO",
        })),
      });
    } catch (error) {
      logger.error("Erro ao buscar dados do dashboard", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        error: "Erro ao buscar dados do dashboard",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  },

  async getDriverStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      const [driverTruck, lastChecklist, recentOccurrences, tripsThisMonth] =
        await Promise.all([
          prisma.truck.findFirst({ where: { currentDriverId: userId } }),
          prisma.dailyChecklist.findFirst({
            where: { driverId: userId },
            orderBy: { createdAt: "desc" },
            include: { truck: { select: { plate: true, model: true } } },
          }),
          prisma.occurrence.findMany({
            where: { driverId: userId },
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { truck: { select: { plate: true } } },
          }),
          prisma.dailyChecklist.count({
            where: { driverId: userId, createdAt: { gte: currentMonthStart } },
          }),
        ]);

      res.json({
        truck: driverTruck
          ? {
              id: driverTruck.id,
              plate: driverTruck.plate,
              model: driverTruck.model,
              brand: driverTruck.brand,
              vehicleType: driverTruck.vehicleType,
            }
          : null,
        lastChecklist: lastChecklist
          ? {
              id: lastChecklist.id,
              date: lastChecklist.createdAt,
              truckPlate: lastChecklist.truck.plate,
              isApproved: lastChecklist.overallCondition === "BOM",
            }
          : null,
        recentOccurrences: recentOccurrences.map((occ) => ({
          id: occ.id,
          type: occ.type,
          date: occ.createdAt,
          status: occ.status,
          truckPlate: occ.truck.plate,
        })),
        stats: {
          tripsThisMonth,
        },
      });
    } catch (error) {
      logger.error("Erro ao buscar dashboard do motorista", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return res
        .status(500)
        .json({ error: "Erro ao buscar dados do dashboard do motorista" });
    }
  },

  // Financeiro Stats
  async getFinancialStats(req: Request, res: Response) {
    try {
      const { period } = req.query; // 'mes', 'ano', 'total'

      let dateFilter = {};
      const now = new Date();

      if (period === "mes") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { gte: startOfMonth };
      } else if (period === "ano") {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = { gte: startOfYear };
      }

      // 1. Custos de Ocorrências (Manutenção) agregados no banco
      const occurrenceAgg = await prisma.occurrence.aggregate({
        where: {
          status: "RESOLVIDO",
          actualCost: { not: null },
          resolvedAt: dateFilter,
        },
        _sum: { actualCost: true },
      });

      const totalMaintenanceCost = Number(occurrenceAgg._sum.actualCost || 0);

      // 2. Custos de Pneus agregados no banco
      const tireAgg = await prisma.tireEvent.aggregate({
        where: {
          cost: { not: null },
          createdAt: dateFilter,
        },
        _sum: { cost: true },
      });

      const totalTireCost = Number(tireAgg._sum.cost || 0);

      // 3. Resumo por Caminhão (top 5) com groupBy no banco
      const groupedCosts = await prisma.occurrence.groupBy({
        by: ["truckId"],
        where: {
          status: "RESOLVIDO",
          actualCost: { not: null },
          resolvedAt: dateFilter,
        },
        _sum: { actualCost: true },
        orderBy: {
          _sum: {
            actualCost: "desc",
          },
        },
        take: 5,
      });

      const topTruckIds = groupedCosts.map((g) => g.truckId);
      const trucks = await prisma.truck.findMany({
        where: { id: { in: topTruckIds } },
        select: { id: true, plate: true, model: true, totalKm: true },
      });

      const truckMap = new Map(trucks.map((t) => [t.id, t]));
      const truckCosts = groupedCosts
        .map((g) => {
          const truck = truckMap.get(g.truckId);
          if (!truck) return null;
          const maintenance = Number(g._sum.actualCost || 0);
          return {
            plate: truck.plate,
            model: truck.model,
            totalCost: maintenance,
            km: truck.totalKm,
            costPerKm:
              truck.totalKm > 0 ? (maintenance / truck.totalKm).toFixed(2) : 0,
          };
        })
        .filter(
          (
            value,
          ): value is {
            plate: string;
            model: string;
            totalCost: number;
            km: number;
            costPerKm: string | number;
          } => value !== null,
        );

      res.json({
        totalMaintenance: totalMaintenanceCost,
        totalTire: totalTireCost,
        totalCost: totalMaintenanceCost + totalTireCost,
        topCostTrucks: truckCosts,
      });
    } catch (error) {
      logger.error("Erro ao buscar dados financeiros", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return res
        .status(500)
        .json({ error: "Erro ao buscar dados financeiros" });
    }
  },
};
