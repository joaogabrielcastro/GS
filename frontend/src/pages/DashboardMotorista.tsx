import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Truck, ClipboardCheck, AlertCircle, Bell } from "lucide-react";
import socketService from "@/services/socket";
import toast from "react-hot-toast";
import { dashboardService, DriverStats } from "@/services/dashboardService";
import { truckService } from "@/services/api"; // Importando serviço de caminhões
import { Link } from "react-router-dom";

const DashboardMotorista: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableTrucks, setAvailableTrucks] = useState<any[]>([]);
  const [showTruckSelection, setShowTruckSelection] = useState(false);
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

    // Escutar notificações em tempo real
    socketService.on("newNotification", (data) => {
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
      fetchStats(); // Recarregar dados
      setShowTruckSelection(false);
    } catch (error) {
      toast.error("Erro ao selecionar caminhão.");
    }
  };

  const handleReleaseTruck = async () => {
    if (window.confirm("Deseja entregar o caminhão?")) {
      try {
        await truckService.releaseTruck();
        toast.success("Caminhão entregue.");
        fetchStats();
      } catch (error) {
        toast.error("Erro ao entregar caminhão.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {" "}
      {/* pb-20 para dar espaço no mobile se tiver footer fixo, mas aqui é só espaço mesmo */}
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Olá, {user?.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Boa viagem!</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              <button
                onClick={logout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-md mx-auto sm:max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Status do Caminhão Atribuído */}
            {stats?.truck ? (
              <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg mb-8 transform transition-transform active:scale-95">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Seu Veículo Atual
                    </p>
                    <h2 className="text-3xl font-bold mt-1">
                      {stats.truck.plate}
                    </h2>
                    <p className="text-blue-100 text-sm opacity-90">
                      {stats.truck.brand} {stats.truck.model}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-blue-200 uppercase font-semibold">
                      Viagens Mês
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.stats.tripsThisMonth}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-blue-200 uppercase font-semibold">
                      Status
                    </p>
                    <p className="text-xl font-bold">ATIVO</p>
                  </div>
                </div>

                <button
                  onClick={handleReleaseTruck}
                  className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Entregar Caminhão / Encerrar Plantão
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Nenhum caminhão atribuído
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Selecione um veículo para iniciar.
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <Truck className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Veículos Disponíveis:
                  </label>
                  <select
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={selectedTruckId}
                    onChange={(e) => setSelectedTruckId(e.target.value)}
                  >
                    <option value="">Selecione um caminhão...</option>
                    {availableTrucks.map((truck) => (
                      <option key={truck.id} value={truck.id}>
                        {truck.plate} - {truck.brand} {truck.model}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSelectTruck}
                    disabled={!selectedTruckId}
                    className="w-full py-3 px-4 bg-blue-600 hovered:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    <ClipboardCheck className="w-5 h-5" />
                    Confirmar e Iniciar Plantão
                  </button>
                </div>
              </div>
            )}

            {/* Ações Rápidas - Grid Mobile-First */}
            <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">
              Acesso Rápido
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Checklist Diário */}
              <Link to="/checklist/novo" className="block w-full">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:bg-gray-50 h-[100px] flex flex-col items-center text-center justify-center">
                  <div className="bg-green-100 p-2 rounded-full mb-2">
                    <ClipboardCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Novo Checklist
                  </h3>
                </div>
              </Link>

              {/* Registrar Ocorrência */}
              <Link to="/ocorrencias/nova" className="block w-full">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:bg-gray-50 h-[100px] flex flex-col items-center text-center justify-center">
                  <div className="bg-red-100 p-2 rounded-full mb-2">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Reportar Problema
                  </h3>
                </div>
              </Link>
            </div>

            {/* Resumo Recente */}
            <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">
              Atividades Recentes
            </h3>

            <div className="space-y-4">
              {/* Último Checklist */}
              {stats?.lastChecklist ? (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${stats.lastChecklist.isApproved ? "bg-green-100" : "bg-red-100"}`}
                  >
                    <ClipboardCheck
                      className={`w-5 h-5 ${stats.lastChecklist.isApproved ? "text-green-600" : "text-red-600"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Checklist{" "}
                      {stats.lastChecklist.isApproved
                        ? "Aprovado"
                        : "Com Problemas"}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(stats.lastChecklist.date).toLocaleDateString()}{" "}
                      - {stats.lastChecklist.truckPlate}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center">
                  Nenhum checklist recente.
                </p>
              )}

              {/* Minhas Ocorrências Recentes */}
              {stats?.recentOccurrences &&
                stats.recentOccurrences.length > 0 &&
                stats.recentOccurrences.map((occ) => (
                  <div
                    key={occ.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
                  >
                    <div className="p-3 rounded-full bg-yellow-100">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Ocorrência: {occ.type.replace("_", " ")}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(occ.date).toLocaleDateString()} -{" "}
                        <span className="uppercase text-xs font-bold">
                          {occ.status}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardMotorista;
