import React from "react";
import { Plus } from "lucide-react";
import Pagination from "@/components/Pagination";
import { TRUCK_STATUS_LABELS, VEHICLE_TYPE_LABELS, type Truck, type TruckStatus, type VehicleType } from "@/types";

interface TrucksTabProps {
  trucks: Truck[];
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNewTruck: () => void;
  onEditTruck: (truck: Truck) => void;
}

const TrucksTab: React.FC<TrucksTabProps> = ({
  trucks,
  page,
  total,
  totalPages,
  onPageChange,
  onNewTruck,
  onEditTruck,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Frota de Caminhões</h2>
        <button
          onClick={onNewTruck}
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
                  <td className="px-6 py-4 font-medium text-gray-900">{truck.plate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {truck.trailerPlates && truck.trailerPlates.length > 0
                      ? truck.trailerPlates.join(", ")
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
                    <button
                      onClick={() => onEditTruck(truck)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {trucks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Nenhum caminhão cadastrado.
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
