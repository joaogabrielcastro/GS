import { useEffect, useState } from "react";
import { occurrenceService } from "@/services/api";
import { toast } from "react-hot-toast";
import type { Occurrence } from "@/types";

export function useAdminOccurrences(active: boolean) {
  const [items, setItems] = useState<Occurrence[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false);

  const load = async () => {
    const result = await occurrenceService.list({ page, limit: 10 });
    setItems(result.data);
    setTotal(result.total);
    setTotalPages(result.totalPages);
  };

  const updateOccurrenceStatus = async (
    status: string,
    cost?: number,
    notes?: string,
  ) => {
    if (!selectedOccurrence) return;
    await occurrenceService.updateStatus(selectedOccurrence.id, {
      status,
      actualCost: cost,
      resolutionNotes: notes,
    });
    toast.success("Ocorrência atualizada!");
    setIsOccurrenceModalOpen(false);
    await load();
  };

  useEffect(() => {
    if (!active) return;
    load().catch(() => toast.error("Erro ao carregar ocorrências"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, page]);

  return {
    items,
    page,
    total,
    totalPages,
    setPage,
    selectedOccurrence,
    setSelectedOccurrence,
    isOccurrenceModalOpen,
    setIsOccurrenceModalOpen,
    updateOccurrenceStatus,
    reload: load,
  };
}
