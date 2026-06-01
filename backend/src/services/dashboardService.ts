import { prisma } from "../lib/prisma";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getAdminDashboardStats() {
  const todayStart = startOfToday();

  const [
    activeTrucksCount,
    driversCount,
    pendingOccurrencesCount,
    checklistsTodayCount,
    trucksWithChecklistTodayRows,
    pendingReviewCount,
    recentActivities,
    recentChecklists,
  ] = await Promise.all([
    prisma.truck.count({ where: { status: "ATIVO", active: true } }),
    prisma.user.count({ where: { role: "MOTORISTA", active: true } }),
    prisma.occurrence.count({
      where: { status: { in: ["PENDENTE", "EM_ANALISE"] } },
    }),
    prisma.dailyChecklist.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.dailyChecklist.groupBy({
      by: ["truckId"],
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.dailyChecklist.count({
      where: { reviewStatus: "PENDENTE" },
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

  const trucksWithChecklistToday = trucksWithChecklistTodayRows.length;
  const compliancePercent =
    activeTrucksCount > 0
      ? Math.round((trucksWithChecklistToday / activeTrucksCount) * 100)
      : 0;

  return {
    trucks: { active: activeTrucksCount },
    drivers: { total: driversCount },
    occurrences: { pending: pendingOccurrencesCount },
    compliance: {
      percent: compliancePercent,
      trucksWithChecklistToday,
      activeTrucks: activeTrucksCount,
      checklistsToday: checklistsTodayCount,
      pendingReview: pendingReviewCount,
    },
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
      status: check.reviewStatus,
    })),
  };
}
