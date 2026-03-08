import React, { useState, useEffect, useMemo } from "react";
import Pagination from "@/components/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService, AdminStats } from "@/services/dashboardService";
import {
  authService,
  truckService,
  occurrenceService,
  checklistService,
  tireService,
  notificationService,
} from "@/services/api";
import {
  VEHICLE_TYPE_LABELS,
  getTirePositions,
  getTirePositionLabel,
  OCCURRENCE_STATUS_LABELS,
  OCCURRENCE_TYPE_LABELS,
  TIRE_STATUS_LABELS,
  TRUCK_STATUS_LABELS,
  type VehicleType,
  type OccurrenceStatus,
  type TireStatus,
  type TruckStatus,
} from "@/types";
import {
  LogOut,
  Truck,
  Users,
  AlertCircle,
  Activity,
  Bell,
  Settings,
  Plus,
  CheckCircle,
  Eye,
  FileText,
  Disc,
  X,
  ImageOff,
} from "lucide-react";
import { toast } from "react-hot-toast";

// URL base da API para imagens
const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://gs-production-8afd.up.railway.app";

// Função para construir URL completa de imagens
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

// Componente de imagem com fallback para quando não carregar
const ImageWithFallback: React.FC<{
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}> = ({ src, alt, className, onClick }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400">
        <ImageOff className="w-8 h-8 mb-1" />
        <span className="text-xs">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setError(true)}
    />
  );
};

const DashboardAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Data states for other tabs
  const [trucks, setTrucks] = useState<any[]>([]);
  const [truckPage, setTruckPage] = useState(1);
  const [truckTotal, setTruckTotal] = useState(0);
  const [truckTotalPages, setTruckTotalPages] = useState(1);
  const [allTrucks, setAllTrucks] = useState<any[]>([]); // full list for form selectors
  const [drivers, setDrivers] = useState<any[]>([]);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);

  // Tire Management State
  const [tires, setTires] = useState<any[]>([]);
  const [tirePage, setTirePage] = useState(1);
  const [tireTotal, setTireTotal] = useState(0);
  const [tireTotalPages, setTireTotalPages] = useState(1);
  const [tireStats, setTireStats] = useState<any>(null);
  const [isTireModalOpen, setIsTireModalOpen] = useState(false);
  const [selectedTire, setSelectedTire] = useState<any>(null);
  const [tireFormTruckId, setTireFormTruckId] = useState("");
  const [tireEventType, setTireEventType] = useState("");
  const [tireEventKm, setTireEventKm] = useState("");
  const [tireEventCost, setTireEventCost] = useState("");
  const [tireEventNotes, setTireEventNotes] = useState("");

  // Dynamic positions for tire form based on selected truck vehicleType
  const tireFormPositions = useMemo(() => {
    const truck = allTrucks.find((t) => t.id === tireFormTruckId);
    if (!truck?.vehicleType) return [];
    return getTirePositions(truck.vehicleType as VehicleType);
  }, [tireFormTruckId, allTrucks]);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Modals state
  const [isTruckModalOpen, setIsTruckModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<any>(null);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<any>(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.list();
        setNotifications(data);
      } catch (error) {
        console.error("Erro ao carregar notificações", error);
      }
    };
    fetchNotifications();
  }, []); // Run once on mount

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === "visao-geral") {
          const data = await dashboardService.getAdminStats();
          setStats(data);
        } else if (activeTab === "caminhoes") {
          const result = await truckService.list({
            page: truckPage,
            limit: 10,
          });
          setTrucks(result.data);
          setTruckTotal(result.total);
          setTruckTotalPages(result.totalPages);
        } else if (activeTab === "motoristas") {
          const data = await authService.listUsers("MOTORISTA");
          setDrivers(data);
        } else if (activeTab === "ocorrencias") {
          const data = await occurrenceService.list();
          setOccurrences(data);
        } else if (activeTab === "checklists") {
          const data = await checklistService.list();
          setChecklists(data);
        } else if (activeTab === "pneus") {
          const [result, stats, truckData] = await Promise.all([
            tireService.list({ page: tirePage, limit: 10 }),
            tireService.getStatistics(),
            allTrucks.length === 0
              ? truckService.listAll()
              : Promise.resolve(allTrucks),
          ]);
          setTires(result.data);
          setTireTotal(result.total);
          setTireTotalPages(result.totalPages);
          setTireStats(stats);
          if (allTrucks.length === 0) setAllTrucks(truckData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, truckPage, tirePage]);

  // Handlers
  const handleSaveTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      if (editingTruck) {
        await truckService.update(editingTruck.id, data);
        toast.success("Caminhão atualizado!");
      } else {
        await truckService.create(data);
        toast.success("Caminhão criado!");
      }
      setIsTruckModalOpen(false);
      setEditingTruck(null);
      // Refresh list
      const updated = await truckService.list({ page: truckPage, limit: 10 });
      setTrucks(updated.data);
      setTruckTotal(updated.total);
      setTruckTotalPages(updated.totalPages);
    } catch (error) {
      toast.error("Erro ao salvar caminhão");
    }
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      // Default role and password for simplicity if not in form
      const payload = { ...data, role: "MOTORISTA" };

      await authService.createUser(payload);
      toast.success("Motorista cadastrado!");
      setIsDriverModalOpen(false);
      const updated = await authService.listUsers("MOTORISTA");
      setDrivers(updated);
    } catch (error) {
      toast.error("Erro ao cadastrar motorista");
    }
  };

  const handleSaveTire = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const data: any = Object.fromEntries(formData.entries());

      // Parse numbers
      if (data.cost) data.cost = parseFloat(data.cost);
      if (data.initialKm) data.initialKm = parseInt(data.initialKm, 10);
      if (data.lifeExpectancyKm)
        data.lifeExpectancyKm = parseInt(data.lifeExpectancyKm, 10);

      await tireService.create(data);
      toast.success("Pneu cadastrado!");

      setIsTireModalOpen(false);
      setTireFormTruckId("");
      const [updated, updatedStats] = await Promise.all([
        tireService.list({ page: tirePage, limit: 10 }),
        tireService.getStatistics(),
      ]);
      setTires(updated.data);
      setTireTotal(updated.total);
      setTireTotalPages(updated.totalPages);
      setTireStats(updatedStats);
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Erro ao salvar pneu";
      toast.error(msg);
    }
  };

  const handleTireEvent = async (eventType: string) => {
    if (!selectedTire) return;
    try {
      const km = parseInt(tireEventKm, 10) || selectedTire.currentKm;
      await tireService.registerEvent(selectedTire.id, {
        eventType,
        description: tireEventNotes || `Evento: ${eventType}`,
        kmAtEvent: km,
        cost: tireEventCost ? parseFloat(tireEventCost) : undefined,
      });
      toast.success("Evento registrado!");
      setIsTireModalOpen(false);
      setSelectedTire(null);
      setTireEventKm("");
      setTireEventCost("");
      setTireEventNotes("");
      const updated = await tireService.list({ page: tirePage, limit: 10 });
      setTires(updated.data);
      setTireTotal(updated.total);
      setTireTotalPages(updated.totalPages);
    } catch {
      toast.error("Erro ao registrar evento");
    }
  };

  const handleUpdateOccurrence = async (
    status: string,
    cost?: number,
    notes?: string,
  ) => {
    try {
      if (!selectedOccurrence) return;
      await occurrenceService.updateStatus(selectedOccurrence.id, {
        status,
        actualCost: cost,
        resolutionNotes: notes,
      });
      toast.success("Ocorrência atualizada!");
      setIsOccurrenceModalOpen(false);
      const updated = await occurrenceService.list();
      setOccurrences(updated);
    } catch (error) {
      toast.error("Erro ao atualizar ocorrência");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.userNotificationId === id ? { ...n, read: true } : n,
        ),
      );
    } catch (error) {
      console.error("Erro ao marcar como lida", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Todas marcadas como lidas");
    } catch (error) {
      toast.error("Erro ao marcar todas como lidas");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-sm text-gray-600">Olá, {user?.name}</p>
            </div>

            <div className="flex items-center gap-4 relative">
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="w-6 h-6" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-sm">Notificações</h3>
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Marcar todas como lidas
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-gray-500 text-sm">
                        Nenhuma notificação
                      </p>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.userNotificationId}
                          className={`p-3 hover:bg-gray-50 transition-colors ${!notification.read ? "bg-blue-50" : ""} cursor-pointer`}
                          onClick={() =>
                            handleMarkAsRead(notification.userNotificationId)
                          }
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: "visao-geral", label: "Visão Geral", icon: Activity },
              { id: "caminhoes", label: "Caminhões", icon: Truck },
              { id: "motoristas", label: "Motoristas", icon: Users },
              { id: "checklists", label: "Checklists", icon: CheckCircle },
              { id: "ocorrencias", label: "Ocorrências", icon: AlertCircle },
              { id: "pneus", label: "Gestão de Pneus", icon: Disc },
              //{ id: "configuracoes", label: "Configurações", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* VISÃO GERAL */}
            {activeTab === "visao-geral" && stats && (
              <div className="animate-fade-in">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <KPICard
                    title="Caminhões Ativos"
                    value={stats.trucks.active}
                    sub="Em operação"
                    icon={Truck}
                    color="blue"
                  />
                  <KPICard
                    title="Motoristas"
                    value={stats.drivers.total}
                    sub="Cadastrados"
                    icon={Users}
                    color="green"
                  />
                  <KPICard
                    title="Ocorrências"
                    value={stats.occurrences.pending}
                    sub="Pendentes"
                    icon={AlertCircle}
                    color="yellow"
                  />
                  <KPICard
                    title="Checklists"
                    value={stats.recentChecklists.length}
                    sub="Hoje"
                    icon={CheckCircle}
                    color="purple"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Últimas Ocorrências */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" /> Últimas
                      Ocorrências
                    </h3>
                    <div className="space-y-4">
                      {stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="border-l-4 border-red-500 pl-4 py-2"
                          >
                            <p className="font-medium text-gray-900">
                              {activity.description}
                            </p>
                            <div className="flex justify-between mt-1">
                              <span className="text-sm text-gray-500">
                                {activity.user}
                              </span>
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
                        <p className="text-gray-500 text-center py-8">
                          Nenhuma ocorrência recente.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Últimos Checklists */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />{" "}
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
                                <p className="font-medium text-gray-900">
                                  {check.description}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {check.user}
                                </p>
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
                        <p className="text-gray-500 text-center py-8">
                          Nenhum checklist recente.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CAMINHÕES */}
            {activeTab === "caminhoes" && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Frota de Caminhões
                  </h2>
                  <button
                    onClick={() => {
                      setEditingTruck(null);
                      setIsTruckModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" /> Novo Caminhão
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Placa
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Modelo
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Tipo / Eixos
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Motorista Atual
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            KM
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {trucks.map((truck) => (
                          <tr
                            key={truck.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {truck.plate}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {truck.brand} {truck.model} ({truck.year})
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                {truck.vehicleType
                                  ? VEHICLE_TYPE_LABELS[
                                      truck.vehicleType as VehicleType
                                    ] || truck.vehicleType
                                  : "—"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  truck.status === "ATIVO"
                                    ? "bg-green-100 text-green-800"
                                    : truck.status === "MANUTENCAO"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {TRUCK_STATUS_LABELS[
                                  truck.status as TruckStatus
                                ] ?? truck.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {truck.currentDriver ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">
                                    {truck.currentDriver.name.charAt(0)}
                                  </div>
                                  {truck.currentDriver.name}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">
                                  Disponível
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {truck.totalKm.toLocaleString()} km
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => {
                                  setEditingTruck(truck);
                                  setIsTruckModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                        {trucks.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              Nenhum caminhão cadastrado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <Pagination
                      page={truckPage}
                      totalPages={truckTotalPages}
                      total={truckTotal}
                      limit={10}
                      onPageChange={(p) => {
                        setTruckPage(p);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MOTORISTAS */}
            {activeTab === "motoristas" && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Equipe de Motoristas
                  </h2>
                  <button
                    onClick={() => setIsDriverModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" /> Novo Motorista
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Telefone
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Cadastro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {drivers.map((driver) => (
                        <tr
                          key={driver.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {driver.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {driver.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  CPF: {driver.cpf || "-"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {driver.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {driver.phone || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                driver.active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {driver.active ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(driver.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {drivers.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            Nenhum motorista encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* OCORRÊNCIAS */}
            {activeTab === "ocorrencias" && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Ocorrências da Frota
                  </h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Veículo
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Motorista
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {occurrences.map((occ) => (
                        <tr
                          key={occ.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(occ.occurredAt).toLocaleDateString()}
                            <br />
                            <span className="text-xs text-gray-400">
                              {new Date(occ.occurredAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">
                              {occ.type}
                            </span>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {occ.description}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {occ.truck?.plate}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {occ.driver?.name}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                occ.status === "PENDENTE"
                                  ? "bg-red-100 text-red-800"
                                  : occ.status === "EM_ANALISE"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {OCCURRENCE_STATUS_LABELS[
                                occ.status as OccurrenceStatus
                              ] ?? occ.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => {
                                setSelectedOccurrence(occ);
                                setIsOccurrenceModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                      {occurrences.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            Nenhuma ocorrência registrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CHECKLISTS TAB */}
            {activeTab === "checklists" && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Checklists Realizados
                  </h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Caminhão
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Motorista
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          KM
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {checklists.map((check) => (
                        <tr
                          key={check.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(check.createdAt).toLocaleDateString()}{" "}
                            <span className="text-xs text-gray-400">
                              {new Date(check.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {check.truck?.plate}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {check.driver?.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {check.odometer?.toLocaleString()} km
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => {
                                setSelectedChecklist(check);
                                setIsChecklistModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" /> Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                      {checklists.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            Nenhum checklist encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PNEUS TAB */}
            {activeTab === "pneus" && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Gestão de Pneus
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedTire(null);
                      setIsTireModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Novo Pneu
                  </button>
                </div>

                {/* Tire Stats */}
                {tireStats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KPICard
                      title="Total de Pneus"
                      value={tireStats.totalTires}
                      sub="Inventário ativo"
                      icon={Disc}
                      color="blue"
                    />
                    <KPICard
                      title="Custo Total"
                      value={`R$ ${Number(tireStats.totalCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
                      sub="Frota"
                      icon={Activity}
                      color="green"
                    />
                    <KPICard
                      title="KM Médio"
                      value={tireStats.averageLifeKm?.toLocaleString()}
                      sub="Vida média"
                      icon={Disc}
                      color="yellow"
                    />
                    <KPICard
                      title="Eventos"
                      value={tireStats.totalEvents}
                      sub="Registrados"
                      icon={FileText}
                      color="purple"
                    />
                  </div>
                )}

                {/* Tires List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Marca/Modelo
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Posição
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Caminhão
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          KM Atual
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tires.map((tire) => (
                        <tr
                          key={tire.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">
                            {tire.code}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {tire.brand} {tire.model}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                              {tire.position}
                            </span>
                            <br />
                            <span className="text-xs text-gray-400">
                              {getTirePositionLabel(tire.position)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                tire.status === "NOVO"
                                  ? "bg-green-100 text-green-800"
                                  : tire.status === "RECAPADO"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : tire.status === "DESGASTADO" ||
                                        tire.status === "SUBSTITUIDO"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {TIRE_STATUS_LABELS[tire.status as TireStatus] ??
                                tire.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {tire.truck ? `${tire.truck.plate}` : "Estoque"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {tire.currentKm?.toLocaleString()} km
                            {tire.lifeExpectancyKm &&
                              (() => {
                                const used =
                                  tire.currentKm - (tire.initialKm ?? 0);
                                const pct = Math.round(
                                  (used / tire.lifeExpectancyKm) * 100,
                                );
                                if (pct >= 90)
                                  return (
                                    <span className="ml-2 text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                                      ⚠️ {pct}%
                                    </span>
                                  );
                                if (pct >= 75)
                                  return (
                                    <span className="ml-2 text-xs font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                                      ⚠ {pct}%
                                    </span>
                                  );
                                return null;
                              })()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => {
                                setSelectedTire(tire);
                                setTireEventKm("");
                                setTireEventCost("");
                                setTireEventNotes("");
                                setIsTireModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              <Settings className="w-4 h-4" /> Gerenciar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {tires.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            Nenhum pneu cadastrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <Pagination
                    page={tirePage}
                    totalPages={tireTotalPages}
                    total={tireTotal}
                    limit={10}
                    onPageChange={(p) => {
                      setTirePage(p);
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {isTruckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTruck ? "Editar Caminhão" : "Novo Caminhão"}
            </h2>
            <form onSubmit={handleSaveTruck}>
              <input type="hidden" name="id" value={editingTruck?.id || ""} />
              <div className="space-y-4">
                <input
                  name="plate"
                  placeholder="Placa"
                  defaultValue={editingTruck?.plate}
                  className="w-full p-2 border rounded"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="brand"
                    placeholder="Marca"
                    defaultValue={editingTruck?.brand}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    name="model"
                    placeholder="Modelo"
                    defaultValue={editingTruck?.model}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="year"
                    type="number"
                    placeholder="Ano"
                    defaultValue={editingTruck?.year}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    name="totalKm"
                    type="number"
                    placeholder="KM Total"
                    defaultValue={editingTruck?.totalKm}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Veículo
                  </label>
                  <select
                    name="vehicleType"
                    defaultValue={editingTruck?.vehicleType || "TOCO"}
                    className="w-full p-2 border rounded"
                  >
                    {(Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[]).map(
                      (vt) => (
                        <option key={vt} value={vt}>
                          {VEHICLE_TYPE_LABELS[vt]}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <select
                  name="status"
                  defaultValue={editingTruck?.status || "ATIVO"}
                  className="w-full p-2 border rounded"
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="MANUTENCAO">Manutenção</option>
                  <option value="PARADO">Parado</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTruckModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Novo Motorista</h2>
            <form onSubmit={handleSaveDriver}>
              <div className="space-y-4">
                <input
                  name="name"
                  placeholder="Nome Completo"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Senha Provisória"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="cpf"
                  placeholder="CPF"
                  className="w-full p-2 border rounded"
                />
                <input
                  name="phone"
                  placeholder="Telefone"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOccurrenceModalOpen && selectedOccurrence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Detalhes da Ocorrência</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium">{selectedOccurrence.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-medium">
                  {new Date(selectedOccurrence.occurredAt).toLocaleString()}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Descrição</p>
                <p className="font-medium">{selectedOccurrence.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Motorista</p>
                <p className="font-medium">{selectedOccurrence.driver?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Caminhão</p>
                <p className="font-medium">{selectedOccurrence.truck?.plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <p className="font-medium">
                  {selectedOccurrence.location || "Não informada"}
                </p>
              </div>
              {selectedOccurrence.estimatedCost != null && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-700 font-medium">
                    Custo estimado pelo motorista
                  </p>
                  <p className="text-lg font-bold text-yellow-800">
                    R${" "}
                    {Number(selectedOccurrence.estimatedCost).toLocaleString(
                      "pt-BR",
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Status Update Section */}
            <div className="border-t pt-4">
              <h3 className="font-bold mb-4">Atualizar Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    id="status-select"
                    defaultValue={selectedOccurrence.status}
                    className="w-full p-2 border rounded"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="EM_ANALISE">Em Análise</option>
                    <option value="RESOLVIDO">Resolvido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Custo Real (R$)
                  </label>
                  <input
                    id="cost-input"
                    type="number"
                    step="0.01"
                    defaultValue={
                      selectedOccurrence.actualCost ??
                      selectedOccurrence.estimatedCost ??
                      ""
                    }
                    placeholder="0.00"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Notas de Resolução
                  </label>
                  <textarea
                    id="notes-input"
                    defaultValue={selectedOccurrence.resolutionNotes}
                    className="w-full p-2 border rounded"
                    rows={3}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsOccurrenceModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const status = (
                    document.getElementById(
                      "status-select",
                    ) as HTMLSelectElement
                  ).value;
                  const cost = (
                    document.getElementById("cost-input") as HTMLInputElement
                  ).value;
                  const notes = (
                    document.getElementById(
                      "notes-input",
                    ) as HTMLTextAreaElement
                  ).value;
                  handleUpdateOccurrence(
                    status,
                    cost ? parseFloat(cost) : undefined,
                    notes,
                  );
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Details Modal */}
      {isChecklistModalOpen && selectedChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in relative">
            <button
              onClick={() => setIsChecklistModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Detalhes do Checklist
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Informações do Veículo
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Placa:</span>
                    <span className="font-medium">
                      {selectedChecklist.truck?.plate}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Hodômetro:</span>
                    <span className="font-medium">
                      {selectedChecklist.odometer?.toLocaleString()} km
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Motorista:</span>
                    <span className="font-medium">
                      {selectedChecklist.driver?.name}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Data:</span>
                    <span className="font-medium">
                      {new Date(selectedChecklist.createdAt).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">
                  Condições Gerais
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-blue-700">Estado Pneus:</span>
                    <span className="font-medium text-blue-900">
                      {selectedChecklist.tiresCondition || "Não informado"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-blue-700">Estado Cabine:</span>
                    <span className="font-medium text-blue-900">
                      {selectedChecklist.cabinCondition || "Não informado"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-blue-700">Estado Lona:</span>
                    <span className="font-medium text-blue-900">
                      {selectedChecklist.canvasCondition || "Não informado"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-blue-700">Geral:</span>
                    <span className="font-medium text-blue-900">
                      {selectedChecklist.overallCondition || "Não informado"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-4 border-b pb-2">
              Fotos e Observações
            </h3>

            <div className="space-y-4">
              {selectedChecklist.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="font-semibold text-gray-700 display-block mb-1">
                    Observações:
                  </span>
                  <p className="text-gray-600 italic">
                    "{selectedChecklist.notes}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {selectedChecklist.tiresPhotoUrl && (
                  <div className="border rounded-lg p-2">
                    <p className="text-center font-semibold mb-2 text-sm text-gray-600">
                      Pneus
                    </p>
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <ImageWithFallback
                        src={getImageUrl(selectedChecklist.tiresPhotoUrl)}
                        alt="Pneus"
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() =>
                          window.open(
                            getImageUrl(selectedChecklist.tiresPhotoUrl),
                            "_blank",
                          )
                        }
                      />
                    </div>
                  </div>
                )}
                {selectedChecklist.cabinPhotoUrl && (
                  <div className="border rounded-lg p-2">
                    <p className="text-center font-semibold mb-2 text-sm text-gray-600">
                      Cabine
                    </p>
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <ImageWithFallback
                        src={getImageUrl(selectedChecklist.cabinPhotoUrl)}
                        alt="Cabine"
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() =>
                          window.open(
                            getImageUrl(selectedChecklist.cabinPhotoUrl),
                            "_blank",
                          )
                        }
                      />
                    </div>
                  </div>
                )}
                {selectedChecklist.canvasPhotoUrl && (
                  <div className="border rounded-lg p-2">
                    <p className="text-center font-semibold mb-2 text-sm text-gray-600">
                      Lonas
                    </p>
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <ImageWithFallback
                        src={getImageUrl(selectedChecklist.canvasPhotoUrl)}
                        alt="Lonas"
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() =>
                          window.open(
                            getImageUrl(selectedChecklist.canvasPhotoUrl),
                            "_blank",
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* New ChecklistPhoto records (axle photos) */}
              {selectedChecklist.photos &&
                selectedChecklist.photos.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">
                      Fotos por Eixo
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedChecklist.photos.map((photo: any) => (
                        <div key={photo.id} className="border rounded-lg p-2">
                          <p className="text-center font-semibold mb-1 text-xs text-gray-600">
                            {photo.category === "EIXO"
                              ? `Eixo ${photo.axleNumber} — ${photo.side === "ESQ" ? "Esquerdo" : photo.side === "DIR" ? "Direito" : ""}`
                              : photo.category}
                          </p>
                          <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                            <ImageWithFallback
                              src={getImageUrl(photo.photoUrl)}
                              alt={photo.category}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() =>
                                window.open(
                                  getImageUrl(photo.photoUrl),
                                  "_blank",
                                )
                              }
                            />
                          </div>
                          {photo.notes && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {photo.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsChecklistModalOpen(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIRE MODAL */}
      {isTireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedTire ? "Gerenciar Pneu" : "Novo Pneu"}
              </h2>
              <button
                onClick={() => {
                  setIsTireModalOpen(false);
                  setSelectedTire(null);
                }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {!selectedTire ? (
              // CREATE FORM
              <form onSubmit={handleSaveTire}>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Caminhão *
                    </label>
                    <select
                      name="truckId"
                      required
                      value={tireFormTruckId}
                      onChange={(e) => setTireFormTruckId(e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                    >
                      <option value="">Selecione o caminhão</option>
                      {allTrucks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.plate} — {t.brand} {t.model}
                        </option>
                      ))}
                    </select>
                  </div>
                  {tireFormTruckId && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Posição *
                      </label>
                      <select
                        name="position"
                        required
                        className="w-full p-2 border rounded mt-1"
                      >
                        <option value="">Selecione a posição</option>
                        {tireFormPositions.map((pos) => (
                          <option key={pos} value={pos}>
                            {getTirePositionLabel(pos)} ({pos})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Código / Nº Série *
                    </label>
                    <input
                      name="code"
                      placeholder="Ex: PNE-001"
                      className="w-full p-2 border rounded mt-1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Marca
                      </label>
                      <input
                        name="brand"
                        placeholder="Bridgestone"
                        className="w-full p-2 border rounded mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Modelo
                      </label>
                      <input
                        name="model"
                        placeholder="R283"
                        className="w-full p-2 border rounded mt-1"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        KM Inicial *
                      </label>
                      <input
                        name="initialKm"
                        type="number"
                        placeholder="0"
                        className="w-full p-2 border rounded mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Vida útil (km)
                      </label>
                      <input
                        name="lifeExpectancyKm"
                        type="number"
                        placeholder="120000"
                        className="w-full p-2 border rounded mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Custo (R$)
                      </label>
                      <input
                        name="cost"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full p-2 border rounded mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        defaultValue="NOVO"
                        className="w-full p-2 border rounded mt-1"
                      >
                        <option value="NOVO">Novo</option>
                        <option value="BOM">Bom</option>
                        <option value="RECAPADO">Recapado</option>
                        <option value="DESGASTADO">Desgastado</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Observações
                    </label>
                    <input
                      name="notes"
                      placeholder="Opcional"
                      className="w-full p-2 border rounded mt-1"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTireModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Cadastrar Pneu
                  </button>
                </div>
              </form>
            ) : (
              // MANAGE EXISTING TIRE
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                  <p>
                    <strong>Código:</strong> {selectedTire.code}
                  </p>
                  <p>
                    <strong>Marca/Modelo:</strong> {selectedTire.brand}{" "}
                    {selectedTire.model}
                  </p>
                  <p>
                    <strong>Posição:</strong>{" "}
                    {getTirePositionLabel(selectedTire.position)} (
                    {selectedTire.position})
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {TIRE_STATUS_LABELS[selectedTire.status as TireStatus] ??
                      selectedTire.status}
                  </p>
                  <p>
                    <strong>KM Atual:</strong>{" "}
                    {selectedTire.currentKm?.toLocaleString()} km
                  </p>
                  {selectedTire.lifeExpectancyKm && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Vida útil</span>
                        <span>
                          {Math.round(
                            ((selectedTire.currentKm - selectedTire.initialKm) /
                              selectedTire.lifeExpectancyKm) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round(((selectedTire.currentKm - selectedTire.initialKm) / selectedTire.lifeExpectancyKm) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Registrar Evento</h3>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="KM no evento"
                      value={tireEventKm}
                      onChange={(e) => setTireEventKm(e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Custo R$ (opcional)"
                        value={tireEventCost}
                        onChange={(e) => setTireEventCost(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      />
                      <input
                        placeholder="Observação"
                        value={tireEventNotes}
                        onChange={(e) => setTireEventNotes(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleTireEvent("MANUTENCAO")}
                        className="p-2 border rounded hover:bg-blue-50 text-sm text-blue-700 border-blue-200"
                      >
                        Manutenção
                      </button>
                      <button
                        onClick={() => handleTireEvent("RECAPAGEM")}
                        className="p-2 border rounded hover:bg-yellow-50 text-sm text-yellow-700 border-yellow-200"
                      >
                        Recapar
                      </button>
                      <button
                        onClick={() => handleTireEvent("REMOCAO")}
                        className="p-2 border rounded hover:bg-gray-50 text-sm"
                      >
                        Remover
                      </button>
                      <button
                        onClick={() => handleTireEvent("ESTOURO")}
                        className="p-2 border rounded hover:bg-red-50 text-sm text-red-600 border-red-200"
                      >
                        Estouro
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTireModalOpen(false);
                      setSelectedTire(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component for KPI Cards
const KPICard = ({ title, value, sub, icon: Icon, color }: any) => {
  const colorClasses: any = {
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
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value !== undefined ? value : "-"}
          </p>
          <p className="text-xs text-gray-400 mt-1 uppercase">{sub}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
