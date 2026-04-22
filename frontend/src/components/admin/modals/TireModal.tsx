import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  getTirePositionLabel,
  TIRE_STATUS_LABELS,
  VEHICLE_AXLES,
  VEHICLE_TYPE_LABELS,
  type TireStatus,
  type VehicleType,
} from "@/types";
import type { Tire, Truck } from "@/types";
import {
  axlePositionCodes,
  groupAxlesBySection,
  InteractiveAxleDiagram,
} from "@/components/common/TruckAxleDiagram";

interface TireModalProps {
  isOpen: boolean;
  selectedTire: Tire | null;
  allTrucks: Truck[];
  tireFormTruckId: string;
  tireFormPositions: string[];
  tireEventKm: string;
  tireEventCost: string;
  tireEventNotes: string;
  setTireFormTruckId: (value: string) => void;
  setTireEventKm: (value: string) => void;
  setTireEventCost: (value: string) => void;
  setTireEventNotes: (value: string) => void;
  onClose: () => void;
  onSubmitCreate: (data: Record<string, FormDataEntryValue>) => Promise<void>;
  onRegisterEvent: (eventType: string) => Promise<void>;
}

const TireModal: React.FC<TireModalProps> = ({
  isOpen,
  selectedTire,
  allTrucks,
  tireFormTruckId,
  tireFormPositions,
  tireEventKm,
  tireEventCost,
  tireEventNotes,
  setTireFormTruckId,
  setTireEventKm,
  setTireEventCost,
  setTireEventNotes,
  onClose,
  onSubmitCreate,
  onRegisterEvent,
}) => {
  const [selectedPosition, setSelectedPosition] = useState("");
  const [positionError, setPositionError] = useState("");

  const selectedTruck = useMemo(
    () => allTrucks.find((truck) => truck.id === tireFormTruckId),
    [allTrucks, tireFormTruckId],
  );

  const axleMap = useMemo(() => {
    if (!selectedTruck?.vehicleType) return [];
    return VEHICLE_AXLES[selectedTruck.vehicleType as VehicleType] ?? [];
  }, [selectedTruck]);

  const axleSections = useMemo(() => groupAxlesBySection(axleMap), [axleMap]);

  const occupiedPositions = useMemo(
    () =>
      new Set(
        (selectedTruck?.tires ?? [])
          .filter((tire) => tire.active !== false)
          .map((tire) => tire.position),
      ),
    [selectedTruck],
  );

  useEffect(() => {
    setSelectedPosition("");
    setPositionError("");
  }, [tireFormTruckId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
      <div
        className={`bg-white rounded-lg p-5 w-full animate-fade-in max-h-[92vh] overflow-y-auto shadow-xl ${
          tireFormTruckId && !selectedTire ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {selectedTire ? "Gerenciar Pneu" : "Novo Pneu"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!selectedTire ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedPosition) {
                setPositionError("Toque no desenho do caminhão para escolher a posição do pneu.");
                return;
              }
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              await onSubmitCreate(Object.fromEntries(formData.entries()));
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Caminhão *</label>
                <select
                  name="truckId"
                  required
                  value={tireFormTruckId}
                  onChange={(e) => setTireFormTruckId(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-1 bg-white"
                >
                  <option value="">Selecione o caminhão</option>
                  {allTrucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.plate} — {t.brand} {t.model}
                    </option>
                  ))}
                </select>
              </div>

              {tireFormTruckId && selectedTruck && (
                <>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow">
                    <p className="text-xs text-blue-200 uppercase tracking-wide">Veículo selecionado</p>
                    <p className="text-2xl font-bold tracking-wider">{selectedTruck.plate}</p>
                    <p className="text-sm text-blue-100 mt-0.5">
                      {selectedTruck.brand} {selectedTruck.model}
                    </p>
                    <p className="text-xs text-blue-200 mt-2">
                      {selectedTruck.vehicleType
                        ? (VEHICLE_TYPE_LABELS[selectedTruck.vehicleType as VehicleType] ?? "")
                            .split(" (")[0]
                        : "—"}{" "}
                      · {axleMap.length} eixos — toque nos pneus do desenho
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <label className="text-sm font-medium text-gray-800">Posição no veículo *</label>
                      {selectedPosition && (
                        <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded-full shrink-0">
                          {getTirePositionLabel(selectedPosition)} ({selectedPosition})
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {axleSections.map(({ section, axles: sectionAxles }) => (
                        <div key={section}>
                          {axleSections.length > 1 && (
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
                              {section}
                            </p>
                          )}
                          <div className="space-y-3">
                            {sectionAxles.map((axle) => {
                              const { left, right } = axlePositionCodes(axle);
                              return (
                                <div
                                  key={axle.axleNumber}
                                  className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
                                >
                                  <div className="flex justify-between items-start mb-2 gap-2">
                                    <div>
                                      <p className="text-sm font-bold text-gray-800">{axle.label}</p>
                                      <p className="text-xs text-gray-500">
                                        {axle.tiresPerSide === "double"
                                          ? "4 pneus (duplos) — igual ao checklist"
                                          : "2 pneus (simples) — igual ao checklist"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="px-1 py-2">
                                    <InteractiveAxleDiagram
                                      config={axle}
                                      leftPositions={left}
                                      rightPositions={right}
                                      selectedPosition={selectedPosition}
                                      occupiedPositions={occupiedPositions}
                                      onSelectPosition={(pos) => {
                                        setSelectedPosition(pos);
                                        setPositionError("");
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {tireFormPositions.some((pos) => pos.startsWith("ESTEPE")) && (
                        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                          <p className="text-sm font-bold text-gray-800 mb-1">Estepes</p>
                          <p className="text-xs text-gray-500 mb-3">Fora do desenho de eixo</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {tireFormPositions
                              .filter((pos) => pos.startsWith("ESTEPE"))
                              .map((position) => {
                                const isOccupied = occupiedPositions.has(position);
                                const isSelected = selectedPosition === position;
                                return (
                                  <button
                                    key={position}
                                    type="button"
                                    disabled={isOccupied}
                                    onClick={() => {
                                      setSelectedPosition(position);
                                      setPositionError("");
                                    }}
                                    className={`text-xs px-3 py-2 rounded-lg border font-medium transition ${
                                      isOccupied
                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                        : isSelected
                                          ? "bg-blue-600 text-white border-blue-600"
                                          : "bg-gray-50 text-gray-700 border-gray-300 hover:border-blue-400"
                                    }`}
                                  >
                                    {getTirePositionLabel(position)} ({position})
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>

                    {positionError && (
                      <p className="text-xs text-red-600 mt-3" role="alert">
                        {positionError}
                      </p>
                    )}

                    <input type="hidden" name="position" value={selectedPosition} />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Código / Nº Série *</label>
                <input
                  name="code"
                  placeholder="Ex: PNE-001"
                  className="w-full p-2 border rounded-lg mt-1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Marca</label>
                  <input
                    name="brand"
                    placeholder="Bridgestone"
                    className="w-full p-2 border rounded-lg mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Modelo</label>
                  <input
                    name="model"
                    placeholder="R283"
                    className="w-full p-2 border rounded-lg mt-1"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">KM Inicial *</label>
                  <input
                    name="initialKm"
                    type="number"
                    placeholder="0"
                    className="w-full p-2 border rounded-lg mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Vida útil (km)</label>
                  <input
                    name="lifeExpectancyKm"
                    type="number"
                    placeholder="120000"
                    className="w-full p-2 border rounded-lg mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Custo (R$)</label>
                  <input
                    name="cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full p-2 border rounded-lg mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select name="status" defaultValue="NOVO" className="w-full p-2 border rounded-lg mt-1">
                    <option value="NOVO">Novo</option>
                    <option value="BOM">Bom</option>
                    <option value="RECAPADO">Recapado</option>
                    <option value="DESGASTADO">Desgastado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <input name="notes" placeholder="Opcional" className="w-full p-2 border rounded-lg mt-1" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cadastrar Pneu
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
              <p>
                <strong>Código:</strong> {selectedTire.code}
              </p>
              <p>
                <strong>Marca/Modelo:</strong> {selectedTire.brand} {selectedTire.model}
              </p>
              <p>
                <strong>Posição:</strong> {getTirePositionLabel(selectedTire.position)} (
                {selectedTire.position})
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {TIRE_STATUS_LABELS[selectedTire.status as TireStatus] ?? selectedTire.status}
              </p>
              <p>
                <strong>KM Atual:</strong> {selectedTire.currentKm?.toLocaleString()} km
              </p>
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
                    type="button"
                    onClick={() => void onRegisterEvent("MANUTENCAO")}
                    className="p-2 border rounded hover:bg-blue-50 text-sm text-blue-700 border-blue-200"
                  >
                    Manutenção
                  </button>
                  <button
                    type="button"
                    onClick={() => void onRegisterEvent("RECAPAGEM")}
                    className="p-2 border rounded hover:bg-yellow-50 text-sm text-yellow-700 border-yellow-200"
                  >
                    Recapar
                  </button>
                  <button
                    type="button"
                    onClick={() => void onRegisterEvent("REMOCAO")}
                    className="p-2 border rounded hover:bg-gray-50 text-sm"
                  >
                    Remover
                  </button>
                  <button
                    type="button"
                    onClick={() => void onRegisterEvent("ESTOURO")}
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
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TireModal;
