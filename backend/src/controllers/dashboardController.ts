import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

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
      console.error("Erro ao buscar dados do dashboard:", error);
      res.status(500).json({
        error: "Erro ao buscar dados do dashboard",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  },

  async getDriverStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
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
      console.error("Erro ao buscar dados do dashboard do motorista:", error);
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

      // 1. Custos de Ocorrências (Manutenção)
      const occurrences = await prisma.occurrence.findMany({
        where: {
          status: "RESOLVIDO",
          actualCost: { not: null },
          resolvedAt: dateFilter,
        },
        select: { actualCost: true },
      });

      const totalMaintenanceCost = occurrences.reduce((sum, occ) => {
        return sum + (Number(occ.actualCost) || 0);
      }, 0);

      // 2. Custos de Pneus
      const tireEvents = await prisma.tireEvent.findMany({
        where: {
          cost: { not: null },
          createdAt: dateFilter,
        },
        select: { cost: true },
      });

      const totalTireCost = tireEvents.reduce((sum, evt) => {
        return sum + (Number(evt.cost) || 0);
      }, 0);

      // 3. Resumo por Caminhão
      const trucks = await prisma.truck.findMany({
        include: {
          occurrences: {
            where: { actualCost: { not: null }, resolvedAt: dateFilter },
          },
        },
      });

      const truckCosts = trucks
        .map((truck) => {
          const maintenance = truck.occurrences.reduce(
            (acc, occ) => acc + (Number(occ.actualCost) || 0),
            0,
          );
          return {
            plate: truck.plate,
            model: truck.model,
            totalCost: maintenance,
            km: truck.totalKm,
            costPerKm:
              truck.totalKm > 0 ? (maintenance / truck.totalKm).toFixed(2) : 0,
          };
        })
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, 5); // Top 5 mais custosos

      res.json({
        totalMaintenance: totalMaintenanceCost,
        totalTire: totalTireCost,
        totalCost: totalMaintenanceCost + totalTireCost,
        topCostTrucks: truckCosts,
      });
    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar dados financeiros" });
    }
  },
};
