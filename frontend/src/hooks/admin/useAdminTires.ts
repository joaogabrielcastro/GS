import { useEffect, useMemo, useState } from "react";
import { tireService, truckService } from "@/services/api";
import { getTirePositions, type VehicleType } from "@/types";
import { toast } from "react-hot-toast";
import type { Tire, TireStatistics, Truck } from "@/types";

export function useAdminTires(active: boolean) {
  const [items, setItems] = useState<Tire[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<TireStatistics | null>(null);
  const [allTrucks, setAllTrucks] = useState<Truck[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null);
  const [tireFormTruckId, setTireFormTruckId] = useState("");
  const [tireEventKm, setTireEventKm] = useState("");
  const [tireEventCost, setTireEventCost] = useState("");
  const [tireEventNotes, setTireEventNotes] = useState("");

  const tireFormPositions = useMemo(() => {
    const truck = allTrucks.find((t) => t.id === tireFormTruckId);
    if (!truck?.vehicleType) return [];
    return getTirePositions(truck.vehicleType as VehicleType);
  }, [tireFormTruckId, allTrucks]);

  const load = async () => {
    const [result, tireStats, trucks] = await Promise.all([
      tireService.list({ page, limit: 10 }),
      tireService.getStatistics(),
      allTrucks.length === 0 ? truckService.listAll() : Promise.resolve(allTrucks),
    ]);
    setItems(result.data);
    setTotal(result.total);
    setTotalPages(result.totalPages);
    setStats(tireStats);
    if (allTrucks.length === 0) setAllTrucks(trucks);
  };

  const saveTire = async (data: Record<string, FormDataEntryValue>) => {
    const payload: Record<string, string | number> = {
      ...Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)]),
      ),
    };
    if (payload.cost) payload.cost = parseFloat(payload.cost as string);
    if (payload.initialKm) payload.initialKm = parseInt(payload.initialKm as string, 10);
    if (payload.lifeExpectancyKm) {
      payload.lifeExpectancyKm = parseInt(payload.lifeExpectancyKm as string, 10);
    }

    await tireService.create(payload);
    toast.success("Pneu cadastrado!");
    setIsModalOpen(false);
    setTireFormTruckId("");
    await load();
  };

  const registerTireEvent = async (eventType: string) => {
    if (!selectedTire) return;
    const km = parseInt(tireEventKm, 10) || selectedTire.currentKm;
    await tireService.registerEvent(selectedTire.id, {
      eventType,
      description: tireEventNotes || `Evento: ${eventType}`,
      kmAtEvent: km,
      cost: tireEventCost ? parseFloat(tireEventCost) : undefined,
    });
    toast.success("Evento registrado!");
    setIsModalOpen(false);
    setSelectedTire(null);
    setTireEventKm("");
    setTireEventCost("");
    setTireEventNotes("");
    await load();
  };

  useEffect(() => {
    if (!active) return;
    load().catch(() => toast.error("Erro ao carregar pneus"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, page]);

  return {
    items,
    page,
    total,
    totalPages,
    setPage,
    stats,
    allTrucks,
    isModalOpen,
    setIsModalOpen,
    selectedTire,
    setSelectedTire,
    tireFormTruckId,
    setTireFormTruckId,
    tireFormPositions,
    tireEventKm,
    setTireEventKm,
    tireEventCost,
    setTireEventCost,
    tireEventNotes,
    setTireEventNotes,
    saveTire,
    registerTireEvent,
    reload: load,
  };
}
