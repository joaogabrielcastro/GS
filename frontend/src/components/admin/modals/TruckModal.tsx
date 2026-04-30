import React, { useEffect, useMemo, useState } from "react";
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
  const [vehicleType, setVehicleType] = useState<VehicleType>(
    editingTruck?.vehicleType || "TOCO",
  );
  const [trailerPlates, setTrailerPlates] = useState<string[]>(
    editingTruck?.trailerPlates?.length
      ? editingTruck.trailerPlates
      : [""],
  );

  useEffect(() => {
    setVehicleType(editingTruck?.vehicleType || "TOCO");
    setTrailerPlates(
      editingTruck?.trailerPlates?.length
        ? editingTruck.trailerPlates
        : [""],
    );
  }, [editingTruck, isOpen]);

  const shouldShowTrailers = useMemo(
    () =>
      ["CARRETA_SIMPLES", "CARRETA_LS", "BITREM", "RODOTREM"].includes(
        vehicleType,
      ),
    [vehicleType],
  );

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
            const cleanTrailerPlates = trailerPlates
              .map((plate) => plate.trim().toUpperCase())
              .filter(Boolean);
            formData.set("trailerPlates", cleanTrailerPlates.join(","));
            await onSubmit(Object.fromEntries(formData.entries()));
          }}
        >
          <input type="hidden" name="id" value={editingTruck?.id || ""} />
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Composição (Cavalo + Carretas)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Placa do caminhão (cavalo)
                  </label>
                  <input
                    name="plate"
                    placeholder="Ex.: ABC1D23"
                    defaultValue={editingTruck?.plate}
                    className="w-full p-2 border rounded"
                    pattern="[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}"
                    title="Use o formato Mercosul, ex.: ABC1D23"
                    required
                  />
                </div>
                {shouldShowTrailers && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Placas das carretas
                    </label>
                    <div className="space-y-2">
                      {trailerPlates.map((plate, index) => (
                        <div key={`trailer-${index}`} className="flex items-center gap-2">
                          <input
                            value={plate}
                            onChange={(event) => {
                              const next = [...trailerPlates];
                              next[index] = event.target.value.toUpperCase();
                              setTrailerPlates(next);
                            }}
                            placeholder={`Carreta ${index + 1} (ex.: XYZ9A88)`}
                            className="w-full p-2 border rounded"
                            pattern="[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}"
                            title="Use o formato Mercosul, ex.: ABC1D23"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (trailerPlates.length === 1) {
                                setTrailerPlates([""]);
                                return;
                              }
                              setTrailerPlates((prev) =>
                                prev.filter((_, currentIndex) => currentIndex !== index),
                              );
                            }}
                            className="px-2 py-1 text-red-600 hover:text-red-800"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setTrailerPlates((prev) => [...prev, ""])}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Adicionar carreta
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Dados do Veículo
              </h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <input
                name="rntrc"
                placeholder="RNTRC (ANTT)"
                defaultValue={editingTruck?.rntrc}
                className="w-full p-2 border rounded"
              />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <input
                name="tareKg"
                type="number"
                min={0}
                placeholder="Tara (kg)"
                defaultValue={editingTruck?.tareKg}
                className="w-full p-2 border rounded"
              />
              <input
                name="payloadCapacityKg"
                type="number"
                min={0}
                placeholder="Lotação (kg)"
                defaultValue={editingTruck?.payloadCapacityKg}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Veículo
              </label>
              <select
                name="vehicleType"
                defaultValue={editingTruck?.vehicleType || "TOCO"}
                onChange={(event) => setVehicleType(event.target.value as VehicleType)}
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
