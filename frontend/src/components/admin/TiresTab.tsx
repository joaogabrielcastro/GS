import React from "react";
import { Activity, Disc, FileText, Plus, Settings } from "lucide-react";
import Pagination from "@/components/Pagination";
import { getTirePositionLabel, TIRE_STATUS_LABELS, type Tire, type TireStatistics, type TireStatus } from "@/types";

interface TiresTabProps {
  tires: Tire[];
  tireStats: TireStatistics | null;
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNewTire: () => void;
  onManageTire: (tire: Tire) => void;
}

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

const TiresTab: React.FC<TiresTabProps> = ({
  tires,
  tireStats,
  page,
  total,
  totalPages,
  onPageChange,
  onNewTire,
  onManageTire,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Gestão de Pneus</h2>
        <button
          onClick={onNewTire}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Pneu
        </button>
      </div>

      {tireStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard title="Total de Pneus" value={tireStats.totalTires} sub="Inventário ativo" icon={Disc} color="blue" />
          <KPICard
            title="Custo Total"
            value={`R$ ${Number(tireStats.totalCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
            sub="Frota"
            icon={Activity}
            color="green"
          />
          <KPICard title="KM Médio" value={tireStats.averageLifeKm?.toLocaleString()} sub="Vida média" icon={Disc} color="yellow" />
          <KPICard title="Eventos" value={tireStats.totalEvents} sub="Registrados" icon={FileText} color="purple" />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Posição</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Caminhão</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">KM Atual</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tires.map((tire) => (
              <tr key={tire.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-gray-900">{tire.code}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{tire.brand} {tire.model}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{tire.position}</span>
                  <br />
                  <span className="text-xs text-gray-400">{getTirePositionLabel(tire.position)}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      tire.status === "NOVO"
                        ? "bg-green-100 text-green-800"
                        : tire.status === "RECAPADO"
                          ? "bg-yellow-100 text-yellow-800"
                          : tire.status === "DESGASTADO" || tire.status === "SUBSTITUIDO"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {TIRE_STATUS_LABELS[tire.status as TireStatus] ?? tire.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{tire.truck ? `${tire.truck.plate}` : "Estoque"}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {tire.currentKm?.toLocaleString()} km
                  {tire.lifeExpectancyKm &&
                    (() => {
                      const used = tire.currentKm - (tire.initialKm ?? 0);
                      const pct = Math.round((used / tire.lifeExpectancyKm) * 100);
                      if (pct >= 90) {
                        return (
                          <span className="ml-2 text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                            ⚠️ {pct}%
                          </span>
                        );
                      }
                      if (pct >= 75) {
                        return (
                          <span className="ml-2 text-xs font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                            ⚠ {pct}%
                          </span>
                        );
                      }
                      return null;
                    })()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onManageTire(tire)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" /> Gerenciar
                  </button>
                </td>
              </tr>
            ))}
            {tires.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhum pneu cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} total={total} limit={10} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default TiresTab;
