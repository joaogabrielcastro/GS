import React from "react";
import { FileText } from "lucide-react";
import ImageWithFallback from "@/components/common/ImageWithFallback";
import api from "@/services/api";
import type { ChecklistPhoto, DailyChecklist } from "@/types";

interface ChecklistDetailsModalProps {
  isOpen: boolean;
  checklist: DailyChecklist | null;
  onClose: () => void;
  getImageUrl: (path: string | null | undefined) => string;
}

const ChecklistDetailsModal: React.FC<ChecklistDetailsModalProps> = ({
  isOpen,
  checklist,
  onClose,
  getImageUrl,
}) => {
  if (!isOpen || !checklist) return null;

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
      // noop: image preview component already handles unavailable files gracefully
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold text-xl"
        >
          &times;
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 pr-8">
          <FileText className="w-6 h-6 text-blue-600" />
          Detalhes do Checklist
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Informações do Veículo</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between gap-3">
                <span className="text-gray-500">Placa:</span>
                <span className="font-medium text-right">{checklist.truck?.plate}</span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-gray-500">Carretas:</span>
                <span className="font-medium text-right">
                  {checklist.truck?.trailerPlates &&
                  checklist.truck.trailerPlates.length > 0
                    ? checklist.truck.trailerPlates.join(", ")
                    : "Não informado"}
                </span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-gray-500">Hodômetro:</span>
                <span className="font-medium text-right">
                  {checklist.odometer?.toLocaleString()} km
                </span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-gray-500">Motorista:</span>
                <span className="font-medium text-right">{checklist.driver?.name}</span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-gray-500">Data:</span>
                <span className="font-medium text-right">
                  {new Date(checklist.createdAt).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Condições Gerais</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between gap-3">
                <span className="text-blue-700">Estado Pneus:</span>
                <span className="font-medium text-blue-900 text-right">
                  {checklist.tiresCondition || "Não informado"}
                </span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-blue-700">Estado Cabine:</span>
                <span className="font-medium text-blue-900 text-right">
                  {checklist.cabinCondition || "Não informado"}
                </span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-blue-700">Estado Lona:</span>
                <span className="font-medium text-blue-900 text-right">
                  {checklist.canvasCondition || "Não informado"}
                </span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-blue-700">Geral:</span>
                <span className="font-medium text-blue-900 text-right">
                  {checklist.overallCondition || "Não informado"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-lg mb-4 border-b pb-2">Fotos e Observações</h3>
        <div className="space-y-4">
          {checklist.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-semibold text-gray-700 display-block mb-1">
                Observações:
              </span>
              <p className="text-gray-600 italic">"{checklist.notes}"</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {checklist.tiresPhotoUrl && (
              <div className="border rounded-lg p-2">
                <p className="text-center font-semibold mb-2 text-sm text-gray-600">Pneus</p>
                <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <ImageWithFallback
                    src={getImageUrl(checklist.tiresPhotoUrl)}
                    alt="Pneus"
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => void openImageInNewTab(getImageUrl(checklist.tiresPhotoUrl))}
                  />
                </div>
              </div>
            )}
            {checklist.cabinPhotoUrl && (
              <div className="border rounded-lg p-2">
                <p className="text-center font-semibold mb-2 text-sm text-gray-600">Cabine</p>
                <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <ImageWithFallback
                    src={getImageUrl(checklist.cabinPhotoUrl)}
                    alt="Cabine"
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => void openImageInNewTab(getImageUrl(checklist.cabinPhotoUrl))}
                  />
                </div>
              </div>
            )}
            {checklist.canvasPhotoUrl && (
              <div className="border rounded-lg p-2">
                <p className="text-center font-semibold mb-2 text-sm text-gray-600">Lonas</p>
                <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <ImageWithFallback
                    src={getImageUrl(checklist.canvasPhotoUrl)}
                    alt="Lonas"
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => void openImageInNewTab(getImageUrl(checklist.canvasPhotoUrl))}
                  />
                </div>
              </div>
            )}
          </div>

          {checklist.photos && checklist.photos.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Fotos por Eixo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {checklist.photos.map((photo: ChecklistPhoto) => (
                  <div key={photo.id} className="border rounded-lg p-2">
                    <p className="text-center font-semibold mb-1 text-xs text-gray-600">
                      {photo.category === "EIXO"
                        ? `Eixo ${photo.axleNumber} — ${photo.side === "ESQ" ? "Esquerdo" : photo.side === "DIR" ? "Direito" : ""}`
                        : photo.category}
                    </p>
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <ImageWithFallback
                        src={getImageUrl(photo.photoUrl)}
                        alt={photo.category}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => void openImageInNewTab(getImageUrl(photo.photoUrl))}
                      />
                    </div>
                    {photo.notes && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{photo.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistDetailsModal;
