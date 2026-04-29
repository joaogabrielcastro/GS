import React from "react";
import { VEHICLE_TYPE_LABELS, type Truck, type VehicleType } from "@/types";

interface TruckModalProps {
  isOpen: boolean;
  editingTruck: Truck | null;
  onClose: () => void;
  onSubmit: (data: Record<string, FormDataEntryValue>) => Promise<void>;
}

const TruckModal: React.FC<TruckModalProps> = ({
  isOpen,
  editingTruck,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {editingTruck ? "Editar Caminhão" : "Novo Caminhão"}
        </h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            await onSubmit(Object.fromEntries(formData.entries()));
          }}
        >
          <input type="hidden" name="id" value={editingTruck?.id || ""} />
          <div className="space-y-4">
            <input
              name="plate"
              placeholder="Placa do cavalo"
              defaultValue={editingTruck?.plate}
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              name="trailerPlates"
              placeholder="Placas das carretas (separadas por vírgula ou quebra de linha)"
              defaultValue={editingTruck?.trailerPlates?.join(", ")}
              className="w-full p-2 border rounded min-h-20"
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
                {(Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[]).map((vt) => (
                  <option key={vt} value={vt}>
                    {VEHICLE_TYPE_LABELS[vt]}
                  </option>
                ))}
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
              onClick={onClose}
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
  );
};

export default TruckModal;
