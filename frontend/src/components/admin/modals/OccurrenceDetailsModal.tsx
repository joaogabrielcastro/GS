import React from "react";
import { ASSETS_BASE_URL } from "@/config/env";
import ImageWithFallback from "@/components/common/ImageWithFallback";
import api from "@/services/api";
import type { Occurrence, OccurrenceStatus } from "@/types";

interface OccurrenceDetailsModalProps {
  isOpen: boolean;
  occurrence: Occurrence | null;
  onClose: () => void;
  onUpdate: (status: string, cost?: number, notes?: string) => Promise<void>;
}

const OccurrenceDetailsModal: React.FC<OccurrenceDetailsModalProps> = ({
  isOpen,
  occurrence,
  onClose,
  onUpdate,
}) => {
  if (!isOpen || !occurrence) return null;

  const normalizePhotoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/occurrences/")) {
      return `${ASSETS_BASE_URL}${url.replace("/uploads/occurrences/", "/api/files/occurrences/")}`;
    }
    return `${ASSETS_BASE_URL}${url}`;
  };

  const photoUrls: string[] = Array.isArray(occurrence.photoUrls)
    ? occurrence.photoUrls
    : [];

  const openImageInNewTab = async (url: string) => {
    try {
      if (!url) return;

      if (url.includes("/api/files/")) {
        const response = await api.get(url, { responseType: "blob" });
        const objectUrl = URL.createObjectURL(response.data);
        window.open(objectUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        return;
      }

      window.open(url, "_blank");
    } catch {
      // noop
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Detalhes da Ocorrência</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Tipo</p>
            <p className="font-medium">{occurrence.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data</p>
            <p className="font-medium">
              {new Date(occurrence.occurredAt).toLocaleString()}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Descrição</p>
            <p className="font-medium">{occurrence.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Motorista</p>
            <p className="font-medium">{occurrence.driver?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Caminhão</p>
            <p className="font-medium">{occurrence.truck?.plate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Localização</p>
            <p className="font-medium">{occurrence.location || "Não informada"}</p>
          </div>
          {occurrence.estimatedCost != null && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700 font-medium">
                Custo estimado pelo motorista
              </p>
              <p className="text-lg font-bold text-yellow-800">
                R${" "}
                {Number(occurrence.estimatedCost).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-4 mb-6">
          <h3 className="font-bold mb-4">Fotos da Ocorrência</h3>
          {photoUrls.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma foto enviada pelo motorista.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {photoUrls.map((photoUrl, index) => (
                <div key={`${photoUrl}-${index}`} className="border rounded-lg p-2">
                  <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                    <ImageWithFallback
                      src={normalizePhotoUrl(photoUrl)}
                      alt={`Foto da ocorrência ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => void openImageInNewTab(normalizePhotoUrl(photoUrl))}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold mb-4">Atualizar Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                id="status-select"
                defaultValue={occurrence.status as OccurrenceStatus}
                className="w-full p-2 border rounded"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANALISE">Em Análise</option>
                <option value="RESOLVIDO">Resolvido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Custo Real (R$)</label>
              <input
                id="cost-input"
                type="number"
                step="0.01"
                defaultValue={occurrence.actualCost ?? occurrence.estimatedCost ?? ""}
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
                defaultValue={occurrence.resolutionNotes}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              const status = (
                document.getElementById("status-select") as HTMLSelectElement
              ).value;
              const cost = (document.getElementById("cost-input") as HTMLInputElement)
                .value;
              const notes = (
                document.getElementById("notes-input") as HTMLTextAreaElement
              ).value;
              void onUpdate(status, cost ? parseFloat(cost) : undefined, notes);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OccurrenceDetailsModal;
