import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Truck, ClipboardCheck, AlertCircle, Bell, ChevronRight } from "lucide-react";
import socketService from "@/services/socket";
import toast from "react-hot-toast";
import { dashboardService, DriverStats } from "@/services/dashboardService";
import { truckService } from "@/services/api";
import {
  OCCURRENCE_STATUS_LABELS,
  OCCURRENCE_TYPE_LABELS,
  type OccurrenceStatus,
  type OccurrenceType,
} from "@/types";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

const DashboardMotorista: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableTrucks, setAvailableTrucks] = useState<any[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDriverStats();
      setStats(data);
      if (!data.truck) {
        loadAvailableTrucks();
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast.error("Erro ao carregar suas informações.");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTrucks = async () => {
    try {
      const trucks = await truckService.getAvailable();
      setAvailableTrucks(trucks);
    } catch (error) {
      console.error("Erro ao carregar caminhões disponíveis", error);
    }
  };

  useEffect(() => {
    fetchStats();

    socketService.on("newNotification", (payload) => {
      const data = payload as { notification: { title: string } };
      toast.success(data.notification.title);
      setNotifications((prev) => [data.notification, ...prev]);
    });

    return () => {
      socketService.off("newNotification");
    };
  }, []);

  const handleSelectTruck = async () => {
    if (!selectedTruckId) return;
    try {
      await truckService.selectTruck(selectedTruckId);
      toast.success("Caminhão selecionado com sucesso!");
      fetchStats();
    } catch {
      toast.error("Erro ao selecionar caminhão.");
    }
  };

  const handleReleaseTruck = async () => {
    if (window.confirm("Deseja entregar o caminhão e encerrar o plantão?")) {
      try {
        await truckService.releaseTruck();
        toast.success("Caminhão entregue.");
        fetchStats();
      } catch {
        toast.error("Erro ao entregar caminhão.");
      }
    }
  };

  const firstName = user?.name?.split(" ")[0] ?? "Motorista";

  return (
    <div className="page-shell-driver">
      <header className="sticky top-0 z-20 border-b border-gs-gray-100 bg-white/95 backdrop-blur-md">
        <div className="max-w-lg mx-auto sm:max-w-3xl px-4 py-3 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size="sm" className="!h-10 shrink-0 hidden sm:block" />
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gs-black tracking-tight truncate">
                Olá, {firstName}
              </h1>
              <p className="text-xs text-gs-gray-600">Área do motorista</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gs-gray-600 hover:bg-gs-gray-100"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gs-orange-500 text-[10px] font-bold text-white px-1">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={logout}
              className="btn-danger-ghost p-2"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto sm:max-w-3xl px-4 py-6 space-y-8">
        {loading ? (
          <Spinner label="Carregando seu painel…" className="min-h-[16rem]" />
        ) : (
          <>
            {stats?.truck ? (
              <div className="brand-hero animate-fade-in">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-gs-orange-100 text-xs font-semibold uppercase tracking-wider">
                      Veículo em uso
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wide mt-1">
                      {stats.truck.plate}
                    </h2>
                    <p className="text-gs-orange-100/90 text-sm mt-1">
                      {stats.truck.brand} {stats.truck.model}
                    </p>
                  </div>
                  <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-sm">
                    <Truck className="w-8 h-8" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                    <p className="text-[10px] uppercase font-semibold text-gs-orange-200">
                      Viagens no mês
                    </p>
                    <p className="text-2xl font-bold mt-0.5">{stats.stats.tripsThisMonth}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                    <p className="text-[10px] uppercase font-semibold text-gs-orange-200">
                      Status
                    </p>
                    <p className="text-xl font-bold mt-0.5">Ativo</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReleaseTruck}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Entregar caminhão / encerrar plantão
                </button>
              </div>
            ) : (
              <div className="card-section animate-fade-in">
                <div className="flex gap-4 items-start mb-5">
                  <div className="bg-gs-orange-100 p-3 rounded-2xl shrink-0">
                    <Truck className="w-8 h-8 text-gs-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gs-black">Nenhum veículo atribuído</h2>
                    <p className="text-sm text-gs-gray-600 mt-1">
                      Selecione um caminhão disponível para iniciar o plantão.
                    </p>
                  </div>
                </div>
                <label className="label-field">Caminhões disponíveis</label>
                <select
                  className="input-field mb-4"
                  value={selectedTruckId}
                  onChange={(e) => setSelectedTruckId(e.target.value)}
                >
                  <option value="">Selecione um caminhão…</option>
                  {availableTrucks.map((truck) => (
                    <option key={truck.id} value={truck.id}>
                      {truck.plate} — {truck.brand} {truck.model}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSelectTruck}
                  disabled={!selectedTruckId}
                  className="w-full btn-primary py-3"
                >
                  <ClipboardCheck className="w-5 h-5" />
                  Confirmar e iniciar plantão
                </button>
              </div>
            )}

            <section>
              <h3 className="text-sm font-bold text-gs-gray-600 uppercase tracking-wider mb-3 px-0.5">
                Acesso rápido
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/checklist/novo"
                  className="card p-4 flex flex-col items-center text-center gap-3 hover:shadow-soft active:scale-[0.98] transition-all group min-h-[7.5rem] justify-center"
                >
                  <div className="bg-emerald-100 p-3 rounded-2xl group-hover:bg-emerald-200/80 transition-colors">
                    <ClipboardCheck className="w-7 h-7 text-emerald-700" />
                  </div>
                  <span className="font-bold text-gs-black text-sm">Novo checklist</span>
                </Link>
                <Link
                  to="/ocorrencias/nova"
                  className="card p-4 flex flex-col items-center text-center gap-3 hover:shadow-soft active:scale-[0.98] transition-all group min-h-[7.5rem] justify-center"
                >
                  <div className="bg-red-100 p-3 rounded-2xl group-hover:bg-red-200/80 transition-colors">
                    <AlertCircle className="w-7 h-7 text-red-700" />
                  </div>
                  <span className="font-bold text-gs-black text-sm">Reportar problema</span>
                </Link>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gs-gray-600 uppercase tracking-wider mb-3 px-0.5">
                Atividades recentes
              </h3>
              <div className="space-y-3">
                {stats?.lastChecklist ? (
                  <div className="card p-4 flex items-center gap-4">
                    <div
                      className={`p-3 rounded-2xl shrink-0 ${
                        stats.lastChecklist.reviewStatus === "APROVADO" ||
                        stats.lastChecklist.isApproved
                          ? "bg-emerald-100"
                          : stats.lastChecklist.reviewStatus === "REJEITADO"
                            ? "bg-red-100"
                            : "bg-amber-100"
                      }`}
                    >
                      <ClipboardCheck
                        className={`w-5 h-5 ${
                          stats.lastChecklist.reviewStatus === "APROVADO" ||
                          stats.lastChecklist.isApproved
                            ? "text-emerald-700"
                            : stats.lastChecklist.reviewStatus === "REJEITADO"
                              ? "text-red-700"
                              : "text-amber-700"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gs-black text-sm">
                        Checklist —{" "}
                        {stats.lastChecklist.reviewStatus === "APROVADO" ||
                        stats.lastChecklist.isApproved
                          ? "Aprovado"
                          : stats.lastChecklist.reviewStatus === "REJEITADO"
                            ? "Rejeitado"
                            : "Aguardando análise"}
                      </h4>
                      <p className="text-xs text-gs-gray-600 mt-0.5">
                        {new Date(stats.lastChecklist.date).toLocaleDateString("pt-BR")} ·{" "}
                        {stats.lastChecklist.truckPlate}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gs-gray-400 shrink-0" />
                  </div>
                ) : (
                  <EmptyState
                    icon={ClipboardCheck}
                    title="Nenhum checklist recente"
                    description="Envie seu primeiro checklist diário pelo acesso rápido acima."
                  />
                )}

                {stats?.recentOccurrences?.map((occ) => (
                  <div key={occ.id} className="card p-4 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-100 shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gs-black text-sm truncate">
                        {OCCURRENCE_TYPE_LABELS[occ.type as OccurrenceType] ??
                          occ.type.replace("_", " ")}
                      </h4>
                      <p className="text-xs text-gs-gray-600 mt-0.5">
                        {new Date(occ.date).toLocaleDateString("pt-BR")} ·{" "}
                        <span className="font-semibold uppercase">
                          {OCCURRENCE_STATUS_LABELS[occ.status as OccurrenceStatus] ?? occ.status}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardMotorista;
