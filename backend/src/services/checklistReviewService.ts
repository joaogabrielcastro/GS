import { prisma } from "../lib/prisma";

export async function reviewChecklist(params: {
  checklistId: string;
  reviewStatus: "APROVADO" | "REJEITADO";
  reviewerId: string;
  reviewNotes?: string;
}) {
  const existing = await prisma.dailyChecklist.findUnique({
    where: { id: params.checklistId },
    select: { id: true },
  });
  if (!existing) {
    return null;
  }

  return prisma.dailyChecklist.update({
    where: { id: params.checklistId },
    data: {
      reviewStatus: params.reviewStatus,
      reviewNotes: params.reviewNotes?.trim() || null,
      reviewedById: params.reviewerId,
      reviewedAt: new Date(),
    },
    include: {
      truck: {
        select: {
          id: true,
          plate: true,
          model: true,
          trailerPlates: true,
          vehicleType: true,
          spareCount: true,
        },
      },
      driver: {
        select: { id: true, name: true, email: true },
      },
      reviewedBy: {
        select: { id: true, name: true },
      },
      photos: { orderBy: { axleNumber: "asc" } },
    },
  });
}
