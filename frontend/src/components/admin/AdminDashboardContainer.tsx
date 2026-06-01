import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getPrivateMediaUrl } from "@/lib/mediaUrls";
import { dashboardService, AdminStats } from "@/services/dashboardService";
import { authService, getApiErrorMessage, notificationService } from "@/services/api";
import OccurrencesTab from "@/components/admin/OccurrencesTab";
import ChecklistsTab from "@/components/admin/ChecklistsTab";
import TrucksTab from "@/components/admin/TrucksTab";
import DriversTab from "@/components/admin/DriversTab";
import TiresTab from "@/components/admin/TiresTab";
import TruckModal from "@/components/admin/modals/TruckModal";
import TireModal from "@/components/admin/modals/TireModal";
import OccurrenceDetailsModal from "@/components/admin/modals/OccurrenceDetailsModal";
import ChecklistDetailsModal from "@/components/admin/modals/ChecklistDetailsModal";
import AdminHeader from "@/components/admin/layout/AdminHeader";
import AdminTabs from "@/components/admin/layout/AdminTabs";
import { useAdminOccurrences } from "@/hooks/admin/useAdminOccurrences";
import { useAdminChecklists } from "@/hooks/admin/useAdminChecklists";
import { useAdminTrucks } from "@/hooks/admin/useAdminTrucks";
import { useAdminTires } from "@/hooks/admin/useAdminTires";
import { AlertCircle, CheckCircle, ClipboardList, Truck, Users } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "react-hot-toast";
import {
  CHECKLIST_REVIEW_LABELS,
  type AdminNotification,
  type ChecklistReviewStatus,
  type User,
} from "@/types";

const ADMIN_TAB_META: Record<string, { title: string; description: string }> = {
  "visao-geral": {
    title: "Visão geral",
    description: "Indicadores rápidos e últimas movimentações da frota.",
  },
  caminhoes: {
    title: "Caminhões",
    description: "Cadastro, composição (cavalo + carretas) e status da frota.",
  },
  motoristas: {
    title: "Motoristas",
    description: "Equipe habilitada e vínculo com os veículos.",
  },
  checklists: {
    title: "Checklists",
    description: "Conferência das inspeções diárias e fotos por posição de pneu.",
  },
  ocorrencias: {
    title: "Ocorrências",
    description: "Acompanhamento de eventos e pendências.",
  },
  pneus: {
    title: "Gestão de pneus",
    description: "Posição por eixo, vida útil e histórico por veículo.",
  },
};

const AdminDashboardContainer: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("admin.activeTab") || "visao-geral",
  );
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(() => {
    const t = localStorage.getItem("admin.activeTab") || "visao-geral";
    return t === "visao-geral";
  });
  const [drivers, setDrivers] = useState<User[]>([]);
  const [driverSearch, setDriverSearch] = useState("");
  const debouncedDriverSearch = useDebouncedValue(driverSearch, 350);
  const [driversLoading, setDriversLoading] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<User | null>(null);

  const occurrences = useAdminOccurrences(activeTab === "ocorrencias");
  const checklists = useAdminChecklists(activeTab === "checklists");
  const trucks = useAdminTrucks(activeTab === "caminhoes");
  const tires = useAdminTires(activeTab === "pneus");

  useEffect(() => {
    localStorage.setItem("admin.activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.list();
        setNotifications(data);
      } catch {
        toast.error("Erro ao carregar notificações.");
      }
    };

    void fetchNotifications();
  }, []);

  useEffect(() => {
    if (activeTab !== "visao-geral") return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getAdminStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) toast.error("Erro ao carregar dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "motoristas") return;
    let cancelled = false;
    (async () => {
      try {
        setDriversLoading(true);
        const data = await authService.listUsers(
          "MOTORISTA",
          debouncedDriverSearch.trim() || undefined,
        );
        if (!cancelled) setDrivers(data);
      } catch {
        if (!cancelled) toast.error("Erro ao carregar dados.");
      } finally {
        if (!cancelled) setDriversLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, debouncedDriverSearch]);

  useEffect(() => {
    if (activeTab !== "visao-geral" && activeTab !== "motoristas") {
      setLoading(false);
    }
  }, [activeTab]);

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const rawPassword = String(data.password || "").trim();

      if (!editingDriver && rawPassword.length < 8) {
        toast.error("A senha provisória deve ter no mínimo 8 caracteres.");
        return;
      }
      if (editingDriver && rawPassword.length > 0 && rawPassword.length < 8) {
        toast.error("A nova senha deve ter no mínimo 8 caracteres.");
        return;
      }

      if (editingDriver) {
        await authService.updateUser(editingDriver.id, {
          email: String(data.email || ""),
          name: String(data.name || ""),
          cpf: data.cpf ? String(data.cpf) : undefined,
          phone: data.phone ? String(data.phone) : undefined,
          role: "MOTORISTA",
          ...(rawPassword ? { password: rawPassword } : {}),
        });
        toast.success("Motorista atualizado!");
      } else {
        await authService.createUser({
          email: String(data.email || ""),
          password: rawPassword,
          name: String(data.name || ""),
          cpf: data.cpf ? String(data.cpf) : undefined,
          phone: data.phone ? String(data.phone) : undefined,
          role: "MOTORISTA",
        });
        toast.success("Motorista cadastrado!");
      }
      setIsDriverModalOpen(false);
      setEditingDriver(null);
      const updated = await authService.listUsers(
        "MOTORISTA",
        driverSearch.trim() || undefined,
      );
      setDrivers(updated);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Erro ao cadastrar motorista. Verifique os campos obrigatórios.",
        ),
      );
    }
  };

  const handleDeleteDriver = async (driver: User) => {
    const confirmed = window.confirm(`Deseja desativar o motorista ${driver.name}?`);
    if (!confirmed) return;

    try {
      await authService.deleteUser(driver.id);
      toast.success("Motorista desativado!");
      const updated = await authService.listUsers(
        "MOTORISTA",
        driverSearch.trim() || undefined,
      );
      setDrivers(updated);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao desativar motorista"));
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.userNotificationId === id ? { ...n, read: true } : n)),
      );
    } catch {
      toast.error("Erro ao marcar notificação");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Todas marcadas como lidas");
    } catch {
      toast.error("Erro ao marcar todas como lidas");
    }
  };

  const tabMeta = ADMIN_TAB_META[activeTab] ?? {
    title: "Painel",
    description: "",
  };

  return (
    <div className="page-shell">
      <AdminHeader
        userName={user?.name}
        notifications={notifications}
        isNotificationsOpen={isNotificationsOpen}
        onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
        onMarkAllAsRead={handleMarkAllAsRead}
        onMarkAsRead={handleMarkAsRead}
        onLogout={logout}
      />

      <AdminTabs activeTab={activeTab} onChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6 pt-1 animate-fade-in">
          <h2 className="section-title">{tabMeta.title}</h2>
          {tabMeta.description ? (
            <p className="section-subtitle">{tabMeta.description}</p>
          ) : null}
        </header>

        {loading ? (
          <div className="card min-h-[14rem] flex items-center justify-center">
            <Spinner label="Carregando…" />
          </div>
        ) : (
          <>
            {activeTab === "visao-geral" && stats && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <KPICard
                    title="Conformidade hoje"
                    value={`${stats.compliance?.percent ?? 0}%`}
                    sub={`${stats.compliance?.trucksWithChecklistToday ?? 0} de ${stats.compliance?.activeTrucks ?? 0} caminhões`}
                    icon={ClipboardList}
                    color="purple"
                  />
                  <KPICard title="Caminhões Ativos" value={stats.trucks.active} sub="Em operação" icon={Truck} color="blue" />
                  <KPICard title="Motoristas" value={stats.drivers.total} sub="Cadastrados" icon={Users} color="green" />
                  <KPICard title="Ocorrências" value={stats.occurrences.pending} sub="Pendentes" icon={AlertCircle} color="yellow" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="card px-4 py-3">
                    <p className="text-xs font-semibold text-gs-gray-500 uppercase tracking-wide">
                      Checklists hoje
                    </p>
                    <p className="text-2xl font-bold text-gs-black mt-1">
                      {stats.compliance?.checklistsToday ?? 0}
                    </p>
                  </div>
                  <div className="card px-4 py-3 border-amber-200/80 bg-amber-50/50">
                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                      Aguardando revisão
                    </p>
                    <p className="text-2xl font-bold text-amber-900 mt-1">
                      {stats.compliance?.pendingReview ?? 0}
                    </p>
                  </div>
                  <div className="card px-4 py-3 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-sm text-gs-gray-600">
                      Frota com checklist hoje:{" "}
                      <span className="font-semibold text-gs-black">
                        {stats.compliance?.trucksWithChecklistToday ?? 0}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card-section">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Últimas Ocorrências
                    </h3>
                    <div className="space-y-4">
                      {stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map((activity) => (
                          <div key={activity.id} className="border-l-4 border-red-500 pl-4 py-2">
                            <p className="font-medium text-gray-900">{activity.description}</p>
                            <div className="flex justify-between mt-1">
                              <span className="text-sm text-gray-500">{activity.user}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(activity.date).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="inline-block mt-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              {activity.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">Nenhuma ocorrência recente.</p>
                      )}
                    </div>
                  </div>

                  <div className="card-section">
                    <h3 className="text-lg font-bold text-gs-black mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      Checklists Recentes
                    </h3>
                    <div className="space-y-4">
                      {stats.recentChecklists.length > 0 ? (
                        stats.recentChecklists.map((check) => (
                          <div
                            key={check.id}
                            className="group hover:bg-gray-50 p-3 rounded-lg transition-colors border border-gray-100"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{check.description}</p>
                                <p className="text-sm text-gray-500">{check.user}</p>
                              </div>
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full ${
                                  check.status === "APROVADO"
                                    ? "bg-green-100 text-green-700"
                                    : check.status === "PENDENTE"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {["PENDENTE", "APROVADO", "REJEITADO"].includes(check.status)
                                  ? CHECKLIST_REVIEW_LABELS[check.status as ChecklistReviewStatus]
                                  : check.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-right">
                              {new Date(check.date).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">Nenhum checklist recente.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "caminhoes" && (
              <TrucksTab
                trucks={trucks.items}
                page={trucks.page}
                total={trucks.total}
                totalPages={trucks.totalPages}
                search={trucks.search}
                onSearchChange={trucks.setSearch}
                onPageChange={trucks.setPage}
                onNewTruck={() => {
                  trucks.setEditingTruck(null);
                  trucks.setIsModalOpen(true);
                }}
                onEditTruck={(truck) => {
                  trucks.setEditingTruck(truck);
                  trucks.setIsModalOpen(true);
                }}
                onDeleteTruck={(truck) => {
                  const confirmed = window.confirm(`Deseja desativar o caminhão ${truck.plate}?`);
                  if (!confirmed) return;
                  void trucks.deleteTruck(truck.id).catch((error) => {
                    toast.error(getApiErrorMessage(error, "Erro ao desativar caminhão"));
                  });
                }}
              />
            )}

            {activeTab === "motoristas" && (
              <DriversTab
                drivers={drivers}
                search={driverSearch}
                loading={driversLoading}
                onSearchChange={setDriverSearch}
                onNewDriver={() => {
                  setEditingDriver(null);
                  setIsDriverModalOpen(true);
                }}
                onEditDriver={(driver) => {
                  setEditingDriver(driver);
                  setIsDriverModalOpen(true);
                }}
                onDeleteDriver={(driver) => void handleDeleteDriver(driver)}
              />
            )}

            {activeTab === "ocorrencias" && (
              <OccurrencesTab
                occurrences={occurrences.items}
                page={occurrences.page}
                total={occurrences.total}
                totalPages={occurrences.totalPages}
                search={occurrences.search}
                onSearchChange={occurrences.setSearch}
                onPageChange={occurrences.setPage}
                onOpenDetails={(occ) => {
                  occurrences.setSelectedOccurrence(occ);
                  occurrences.setIsOccurrenceModalOpen(true);
                }}
              />
            )}

            {activeTab === "checklists" && (
              <ChecklistsTab
                checklists={checklists.items}
                page={checklists.page}
                total={checklists.total}
                totalPages={checklists.totalPages}
                search={checklists.search}
                onSearchChange={checklists.setSearch}
                onPageChange={checklists.setPage}
                onOpenDetails={(check) => {
                  checklists.setSelectedChecklist(check);
                  checklists.setIsChecklistModalOpen(true);
                }}
              />
            )}

            {activeTab === "pneus" && (
              <TiresTab
                tires={tires.items}
                tireStats={tires.stats}
                page={tires.page}
                total={tires.total}
                totalPages={tires.totalPages}
                onPageChange={tires.setPage}
                onNewTire={() => {
                  tires.setSelectedTire(null);
                  tires.setIsModalOpen(true);
                }}
                onManageTire={(tire) => {
                  tires.setSelectedTire(tire);
                  tires.setTireEventKm("");
                  tires.setTireEventCost("");
                  tires.setTireEventNotes("");
                  tires.setIsModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      <TruckModal
        isOpen={trucks.isModalOpen}
        editingTruck={trucks.editingTruck}
        onClose={() => trucks.setIsModalOpen(false)}
        onSubmit={trucks.saveTruck}
      />

      {isDriverModalOpen && (
        <div className="modal-overlay z-50">
          <div className="modal-panel-sm">
            <h2 className="text-xl font-bold text-gs-black mb-1">
              {editingDriver ? "Editar motorista" : "Novo motorista"}
            </h2>
            <p className="text-sm text-gs-gray-600 mb-5">
              {editingDriver
                ? "Atualize os dados do motorista. Deixe a senha em branco para não alterá-la."
                : "Preencha os dados para cadastrar um novo motorista."}
            </p>
            <form onSubmit={handleSaveDriver}>
              <div className="space-y-4">
                <input
                  name="name"
                  placeholder="Nome Completo"
                  defaultValue={editingDriver?.name}
                  className="input-field"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  defaultValue={editingDriver?.email}
                  className="input-field"
                  required
                />
                <input
                  name="password"
                  type="password"
                  placeholder={
                    editingDriver
                      ? "Nova senha (opcional, mínimo 8 caracteres)"
                      : "Senha Provisória (mínimo 8 caracteres)"
                  }
                  minLength={8}
                  className="input-field"
                  required={!editingDriver}
                />
                <input
                  name="cpf"
                  placeholder="CPF"
                  defaultValue={editingDriver?.cpf || ""}
                  className="input-field"
                />
                <input
                  name="phone"
                  placeholder="Telefone"
                  defaultValue={editingDriver?.phone || ""}
                  className="input-field"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDriverModalOpen(false);
                    setEditingDriver(null);
                  }}
                  className="btn-ghost"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OccurrenceDetailsModal
        isOpen={occurrences.isOccurrenceModalOpen}
        occurrence={occurrences.selectedOccurrence}
        onClose={() => occurrences.setIsOccurrenceModalOpen(false)}
        onUpdate={occurrences.updateOccurrenceStatus}
      />

      <ChecklistDetailsModal
        isOpen={checklists.isChecklistModalOpen}
        checklist={checklists.selectedChecklist}
        onClose={() => checklists.setIsChecklistModalOpen(false)}
        getImageUrl={getPrivateMediaUrl}
        onReviewed={async () => {
          await checklists.reload();
          if (activeTab === "visao-geral") {
            try {
              const data = await dashboardService.getAdminStats();
              setStats(data);
            } catch {
              toast.error("Erro ao atualizar visão geral.");
            }
          }
        }}
      />

      <TireModal
        isOpen={tires.isModalOpen}
        selectedTire={tires.selectedTire}
        allTrucks={tires.allTrucks}
        tireFormTruckId={tires.tireFormTruckId}
        tireFormPositions={tires.tireFormPositions}
        tireEventKm={tires.tireEventKm}
        tireEventCost={tires.tireEventCost}
        tireEventNotes={tires.tireEventNotes}
        setTireFormTruckId={tires.setTireFormTruckId}
        setTireEventKm={tires.setTireEventKm}
        setTireEventCost={tires.setTireEventCost}
        setTireEventNotes={tires.setTireEventNotes}
        onClose={() => {
          tires.setIsModalOpen(false);
          tires.setSelectedTire(null);
        }}
        onSubmitCreate={tires.saveTire}
        onRegisterEvent={tires.registerTireEvent}
      />
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string | number | undefined;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "yellow" | "purple";
}

const KPICard: React.FC<KPICardProps> = ({ title, value, sub, icon: Icon, color }) => {
  const colorClasses: Record<KPICardProps["color"], string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="kpi-card group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gs-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gs-black mt-2 tracking-tight">
            {value !== undefined ? value : "—"}
          </p>
          <p className="text-xs text-gs-gray-500 mt-1">{sub}</p>
        </div>
        <div
          className={`p-3 rounded-2xl transition-transform group-hover:scale-105 ${colorClasses[color]}`}
        >
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContainer;
