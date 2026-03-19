import React from "react";
import { X } from "lucide-react";
import { getTirePositionLabel, TIRE_STATUS_LABELS, type TireStatus } from "@/types";
import type { Tire, Truck } from "@/types";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {selectedTire ? "Gerenciar Pneu" : "Novo Pneu"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!selectedTire ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              await onSubmitCreate(Object.fromEntries(formData.entries()));
            }}
          >
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Caminhão *</label>
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
                  <label className="text-sm font-medium text-gray-700">Posição *</label>
                  <select name="position" required className="w-full p-2 border rounded mt-1">
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
                <label className="text-sm font-medium text-gray-700">Código / Nº Série *</label>
                <input name="code" placeholder="Ex: PNE-001" className="w-full p-2 border rounded mt-1" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Marca</label>
                  <input name="brand" placeholder="Bridgestone" className="w-full p-2 border rounded mt-1" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Modelo</label>
                  <input name="model" placeholder="R283" className="w-full p-2 border rounded mt-1" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">KM Inicial *</label>
                  <input name="initialKm" type="number" placeholder="0" className="w-full p-2 border rounded mt-1" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Vida útil (km)</label>
                  <input name="lifeExpectancyKm" type="number" placeholder="120000" className="w-full p-2 border rounded mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Custo (R$)</label>
                  <input name="cost" type="number" step="0.01" placeholder="0.00" className="w-full p-2 border rounded mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select name="status" defaultValue="NOVO" className="w-full p-2 border rounded mt-1">
                    <option value="NOVO">Novo</option>
                    <option value="BOM">Bom</option>
                    <option value="RECAPADO">Recapado</option>
                    <option value="DESGASTADO">Desgastado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <input name="notes" placeholder="Opcional" className="w-full p-2 border rounded mt-1" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Cadastrar Pneu
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
              <p><strong>Código:</strong> {selectedTire.code}</p>
              <p><strong>Marca/Modelo:</strong> {selectedTire.brand} {selectedTire.model}</p>
              <p><strong>Posição:</strong> {getTirePositionLabel(selectedTire.position)} ({selectedTire.position})</p>
              <p><strong>Status:</strong> {TIRE_STATUS_LABELS[selectedTire.status as TireStatus] ?? selectedTire.status}</p>
              <p><strong>KM Atual:</strong> {selectedTire.currentKm?.toLocaleString()} km</p>
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
                  <button onClick={() => void onRegisterEvent("MANUTENCAO")} className="p-2 border rounded hover:bg-blue-50 text-sm text-blue-700 border-blue-200">Manutenção</button>
                  <button onClick={() => void onRegisterEvent("RECAPAGEM")} className="p-2 border rounded hover:bg-yellow-50 text-sm text-yellow-700 border-yellow-200">Recapar</button>
                  <button onClick={() => void onRegisterEvent("REMOCAO")} className="p-2 border rounded hover:bg-gray-50 text-sm">Remover</button>
                  <button onClick={() => void onRegisterEvent("ESTOURO")} className="p-2 border rounded hover:bg-red-50 text-sm text-red-600 border-red-200">Estouro</button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
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
