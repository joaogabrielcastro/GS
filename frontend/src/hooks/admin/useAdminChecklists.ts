import { useEffect, useState } from "react";
import { checklistService } from "@/services/api";
import { toast } from "react-hot-toast";
import type { DailyChecklist } from "@/types";

export function useAdminChecklists(active: boolean) {
  const [items, setItems] = useState<DailyChecklist[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedChecklist, setSelectedChecklist] = useState<DailyChecklist | null>(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  const load = async () => {
    const result = await checklistService.list({ page, limit: 10 });
    setItems(result.data);
    setTotal(result.total);
    setTotalPages(result.totalPages);
  };

  useEffect(() => {
    if (!active) return;
    load().catch(() => toast.error("Erro ao carregar checklists"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, page]);

  return {
    items,
    page,
    total,
    totalPages,
    setPage,
    selectedChecklist,
    setSelectedChecklist,
    isChecklistModalOpen,
    setIsChecklistModalOpen,
    reload: load,
  };
}
