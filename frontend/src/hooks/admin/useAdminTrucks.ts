import { useEffect, useState } from "react";
import { truckService } from "@/services/api";
import { toast } from "react-hot-toast";
import type { Truck } from "@/types";

export function useAdminTrucks(active: boolean) {
  const [items, setItems] = useState<Truck[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);

  const load = async () => {
    const result = await truckService.list({ page, limit: 10 });
    setItems(result.data);
    setTotal(result.total);
    setTotalPages(result.totalPages);
  };

  const saveTruck = async (data: Record<string, FormDataEntryValue>) => {
    if (editingTruck?.id) {
      await truckService.update(editingTruck.id, data);
      toast.success("Caminhão atualizado!");
    } else {
      await truckService.create(data);
      toast.success("Caminhão criado!");
    }
    setIsModalOpen(false);
    setEditingTruck(null);
    await load();
  };

  useEffect(() => {
    if (!active) return;
    load().catch(() => toast.error("Erro ao carregar caminhões"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, page]);

  return {
    items,
    page,
    total,
    totalPages,
    setPage,
    isModalOpen,
    setIsModalOpen,
    editingTruck,
    setEditingTruck,
    saveTruck,
    reload: load,
  };
}
