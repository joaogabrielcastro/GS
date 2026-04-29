import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ASSETS_BASE_URL } from "@/config/env";
import { dashboardService, AdminStats } from "@/services/dashboardService";
import { authService, getApiErrorMessage, notificationService } from "@/services/api";
import OccurrencesTab from "@/components/admin/OccurrencesTab";
import ChecklistsTab from "@/components/admin/ChecklistsTab";
import TrucksTab from "@/components/admin/TrucksTab";
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
import { AlertCircle, CheckCircle, Plus, Truck, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import type { AdminNotification, User } from "@/types";

const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  const normalized = path.replace(/\\/g, "/").trim();

  if (normalized.startsWith("http")) return normalized;

  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;

  if (withLeadingSlash.startsWith("/uploads/checklist/")) {
    return `${ASSETS_BASE_URL}${withLeadingSlash.replace("/uploads/checklist/", "/api/files/checklist/")}`;
  }
  if (withLeadingSlash.startsWith("/uploads/occurrences/")) {
    return `${ASSETS_BASE_URL}${withLeadingSlash.replace("/uploads/occurrences/", "/api/files/occurrences/")}`;
  }
  if (withLeadingSlash.startsWith("/api/files/")) {
    return `${ASSETS_BASE_URL}${withLeadingSlash}`;
  }

  // Compatibilidade com valores legados salvos como "checklist/<arquivo>" ou só "<arquivo>"
  if (withLeadingSlash.startsWith("/checklist/")) {
    return `${ASSETS_BASE_URL}${withLeadingSlash.replace("/checklist/", "/api/files/checklist/")}`;
  }
  if (withLeadingSlash.startsWith("/occurrences/")) {
    return `${ASSETS_BASE_URL}${withLeadingSlash.replace("/occurrences/", "/api/files/occurrences/")}`;
  }

  if (!withLeadingSlash.includes("/")) {
    return `${ASSETS_BASE_URL}/api/files/checklist/${withLeadingSlash.replace(/^\//, "")}`;
  }

  return `${ASSETS_BASE_URL}${withLeadingSlash}`;
};

const AdminDashboardContainer: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("admin.activeTab") || "visao-geral",
  );
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<User[]>([]);
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
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === "visao-geral") {
          const data = await dashboardService.getAdminStats();
          setStats(data);
        } else if (activeTab === "motoristas") {
          const data = await authService.listUsers("MOTORISTA");
          setDrivers(data);
        }
      } catch {
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
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
      const updated = await authService.listUsers("MOTORISTA");
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
      const updated = await authService.listUsers("MOTORISTA");
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

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {activeTab === "visao-geral" && stats && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <KPICard title="Caminhões Ativos" value={stats.trucks.active} sub="Em operação" icon={Truck} color="blue" />
                  <KPICard title="Motoristas" value={stats.drivers.total} sub="Cadastrados" icon={Users} color="green" />
                  <KPICard title="Ocorrências" value={stats.occurrences.pending} sub="Pendentes" icon={AlertCircle} color="yellow" />
                  <KPICard title="Checklists" value={stats.recentChecklists.length} sub="Hoje" icon={CheckCircle} color="purple" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
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
                                    : check.status === "ATENÇÃO"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {check.status}
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
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Equipe de Motoristas</h2>
                  <button
                    onClick={() => {
                      setEditingDriver(null);
                      setIsDriverModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" /> Novo Motorista
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Telefone</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cadastro</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {drivers.map((driver) => (
                        <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {driver.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                                <div className="text-xs text-gray-500">CPF: {driver.cpf || "-"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{driver.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{driver.phone || "-"}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                driver.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {driver.active ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(driver.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setEditingDriver(driver);
                                  setIsDriverModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => void handleDeleteDriver(driver)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {drivers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            Nenhum motorista encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "ocorrencias" && (
              <OccurrencesTab
                occurrences={occurrences.items}
                page={occurrences.page}
                total={occurrences.total}
                totalPages={occurrences.totalPages}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-xl font-bold mb-4">
              {editingDriver ? "Editar Motorista" : "Novo Motorista"}
            </h2>
            <form onSubmit={handleSaveDriver}>
              <div className="space-y-4">
                <input
                  name="name"
                  placeholder="Nome Completo"
                  defaultValue={editingDriver?.name}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  defaultValue={editingDriver?.email}
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                  required={!editingDriver}
                />
                <input
                  name="cpf"
                  placeholder="CPF"
                  defaultValue={editingDriver?.cpf || ""}
                  className="w-full p-2 border rounded"
                />
                <input
                  name="phone"
                  placeholder="Telefone"
                  defaultValue={editingDriver?.phone || ""}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDriverModalOpen(false);
                    setEditingDriver(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
        getImageUrl={getImageUrl}
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value !== undefined ? value : "-"}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase">{sub}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContainer;
