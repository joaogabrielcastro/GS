import React from "react";
import { Plus, Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import { TRUCK_STATUS_LABELS, VEHICLE_TYPE_LABELS, type Truck, type TruckStatus, type VehicleType } from "@/types";

function formatPlate(value?: string) {
  if (!value) return "—";
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

interface TrucksTabProps {
  trucks: Truck[];
  page: number;
  total: number;
  totalPages: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onNewTruck: () => void;
  onEditTruck: (truck: Truck) => void;
  onDeleteTruck: (truck: Truck) => void;
}

const TrucksTab: React.FC<TrucksTabProps> = ({
  trucks,
  page,
  total,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  onNewTruck,
  onEditTruck,
  onDeleteTruck,
}) => {
  const searchTrimmed = search.trim();
  const emptyMessage =
    searchTrimmed.length > 0
      ? "Nenhum caminhão encontrado para esta busca."
      : "Nenhum caminhão cadastrado.";

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Frota de Caminhões</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto sm:min-w-0 sm:justify-end">
          <label className="relative flex-1 sm:max-w-md min-w-0">
            <span className="sr-only">Buscar caminhão</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por placa, modelo, motorista…"
              autoComplete="off"
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </label>
          <button
            onClick={onNewTruck}
            className="shrink-0 btn-primary whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Novo Caminhão
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Placa</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Carretas</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modelo</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo / Eixos</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Motorista Atual</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">KM</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trucks.map((truck) => (
                <tr key={truck.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {formatPlate(truck.plate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {truck.trailerPlates && truck.trailerPlates.length > 0
                      ? truck.trailerPlates.map(formatPlate).join(", ")
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {truck.brand} {truck.model} ({truck.year})
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {truck.vehicleType
                        ? VEHICLE_TYPE_LABELS[truck.vehicleType as VehicleType] || truck.vehicleType
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
                      {TRUCK_STATUS_LABELS[truck.status as TruckStatus] ?? truck.status}
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
                      <span className="text-gray-400 italic">Disponível</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{truck.totalKm.toLocaleString()} km</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onEditTruck(truck)}
                        className="link-action"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDeleteTruck(truck)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {trucks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={10}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default TrucksTab;
