import { prisma } from "../lib/prisma";
import { buildCsvContent } from "../lib/csv";
import { buildChecklistListWhere, type ChecklistListFilters } from "./checklistQuery";

const EXPORT_LIMIT = 5000;

const REVIEW_LABELS: Record<string, string> = {
  PENDENTE: "Aguardando análise",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
};

export async function exportChecklistsCsv(filters: ChecklistListFilters): Promise<string> {
  const where = buildChecklistListWhere(filters);

  const rows = await prisma.dailyChecklist.findMany({
    where,
    include: {
      truck: { select: { plate: true, trailerPlates: true } },
      driver: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: EXPORT_LIMIT,
  });

  const data = rows.map((c) => [
    new Date(c.createdAt).toLocaleString("pt-BR"),
    c.truck.plate,
    c.truck.trailerPlates?.join(", ") ?? "",
    c.driver.name,
    c.driver.email,
    REVIEW_LABELS[c.reviewStatus] ?? c.reviewStatus,
    c.odometer != null ? String(c.odometer) : "",
    c.tiresCondition ?? "",
    c.cabinCondition ?? "",
    c.canvasCondition ?? "",
    c.overallCondition ?? "",
    c.reviewNotes ?? "",
    c.reviewedBy?.name ?? "",
    c.reviewedAt ? new Date(c.reviewedAt).toLocaleString("pt-BR") : "",
  ]);

  return buildCsvContent(
    [
      "Data",
      "Placa",
      "Carretas",
      "Motorista",
      "Email",
      "Revisão",
      "KM",
      "Pneus",
      "Cabine",
      "Lona",
      "Geral",
      "Obs. revisão",
      "Revisado por",
      "Revisado em",
    ],
    data,
  );
}
