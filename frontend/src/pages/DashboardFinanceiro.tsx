import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import {
  LogOut,
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  Download,
  Bell,
  Calendar,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { toast } from "react-hot-toast";

const DashboardFinanceiro: React.FC = () => {
  const { user, logout } = useAuth();
  const [periodo, setPeriodo] = useState("mes");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getFinancialStats(periodo);
        setStats(data);
      } catch (error) {
        console.error("Erro ao carregar financeiro:", error);
        toast.error("Erro ao carregar dados financeiros");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [periodo]);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Painel Financeiro
              </h1>
              <p className="text-sm text-gray-600">
                Controle de custos e manutenção
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white border rounded-lg flex items-center px-2">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="py-2 text-sm bg-transparent border-none focus:ring-0 text-gray-700 outline-none"
                >
                  <option value="mes">Este Mês</option>
                  <option value="ano">Este Ano</option>
                  <option value="total">Total</option>
                </select>
              </div>

              <button
                onClick={logout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : stats ? (
          <>
            {/* Cards Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Custo Manutenção
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    R${" "}
                    {stats.totalMaintenance.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl text-red-600">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Custo Pneus
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    R${" "}
                    {stats.totalTire.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                  <TrendingDown className="w-8 h-8" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Custo Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    R${" "}
                    {stats.totalCost.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl text-green-600">
                  <DollarSign className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Veículos mais custosos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-gray-500" />
                  Veículos com Maior Custo
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Caminhão
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Modelo
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        KM Rodado
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Custo Total
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Custo/KM
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.topCostTrucks.map((truck: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {truck.plate}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {truck.model}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {truck.km.toLocaleString()} km
                        </td>
                        <td className="px-6 py-4 font-bold text-red-600">
                          R${" "}
                          {truck.totalCost.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          R$ {truck.costPerKm}
                        </td>
                      </tr>
                    ))}
                    {stats.topCostTrucks.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          Nenhum dado financeiro encontrado para este período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default DashboardFinanceiro;
