import React, { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import ImageWithFallback from "@/components/common/ImageWithFallback";
import api, { checklistService, getApiErrorMessage } from "@/services/api";
import {
  CHECKLIST_REVIEW_LABELS,
  getTirePositionLabel,
  sortChecklistPhotosForDisplay,
  type ChecklistPhoto,
  type ChecklistReviewStatus,
  type DailyChecklist,
  type VehicleType,
} from "@/types";
import toast from "react-hot-toast";

interface ChecklistDetailsModalProps {
  isOpen: boolean;
  checklist: DailyChecklist | null;
  onClose: () => void;
  getImageUrl: (path: string | null | undefined) => string;
  onReviewed?: () => void | Promise<void>;
}

const ChecklistDetailsModal: React.FC<ChecklistDetailsModalProps> = ({
  isOpen,
  checklist,
  onClose,
  getImageUrl,
  onReviewed,
}) => {
  const [reviewSubmitting, setReviewSubmitting] = useState<false | "APROVADO" | "REJEITADO">(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const sortedPhotos = useMemo(() => {
    if (!checklist?.photos?.length) return [] as ChecklistPhoto[];
    const vt = checklist.truck?.vehicleType as VehicleType | undefined;
    if (vt) {
      return sortChecklistPhotosForDisplay(
        checklist.photos,
        vt,
        checklist.truck?.spareCount ?? 1,
      ) as ChecklistPhoto[];
    }
    return [...checklist.photos];
  }, [checklist]);

  if (!isOpen || !checklist) return null;

  const reviewSt = (checklist.reviewStatus || "PENDENTE") as ChecklistReviewStatus;

  const handleReview = async (next: "APROVADO" | "REJEITADO") => {
    if (!onReviewed) return;
    if (next === "REJEITADO" && !reviewNotes.trim()) {
      toast.error("Informe o motivo da rejeição.");
      return;
    }
    setReviewSubmitting(next);
    try {
      await checklistService.review(checklist.id, {
        reviewStatus: next,
        reviewNotes: reviewNotes.trim() || undefined,
      });
      toast.success(next === "APROVADO" ? "Checklist aprovado." : "Checklist rejeitado.");
      await onReviewed();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao salvar revisão."));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const cabinUrl =
    checklist.cabinPhotoUrl ??
    sortedPhotos.find((p) => p.category === "CABINE")?.photoUrl;
  const lonaUrl =
    checklist.canvasPhotoUrl ??
    sortedPhotos.find((p) => p.category === "LONA")?.photoUrl;

  const tireByPosition = sortedPhotos.filter(
    (p) => p.category === "PNEU" && p.tirePosition,
  );
  const legacyAxlePhotos = sortedPhotos.filter((p) => p.category === "EIXO");
  const legacyPneuSemPosicao = sortedPhotos.filter(
    (p) => p.category === "PNEU" && !p.tirePosition,
  );

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold text-xl"
        >
          &times;
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 pr-8">
          <FileText className="w-6 h-6 text-blue-600" />
          Detalhes do Checklist
        </h2>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/90 px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Revisão administrativa
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">{CHECKLIST_REVIEW_LABELS[reviewSt]}</p>
            {checklist.reviewNotes ? (
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-medium">Observação:</span> {checklist.reviewNotes}
              </p>
            ) : null}
            {checklist.reviewedBy?.name && checklist.reviewedAt ? (
              <p className="text-xs text-gray-400 mt-1">
                Por {checklist.reviewedBy.name} em{" "}
                {new Date(checklist.reviewedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          {reviewSt === "PENDENTE" && onReviewed ? (
            <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto sm:min-w-[220px]">
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Observação (obrigatória ao rejeitar)"
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!!reviewSubmitting}
                onClick={() => void handleReview("APROVADO")}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {reviewSubmitting === "APROVADO" ? "Salvando…" : "Aprovar"}
              </button>
              <button
                type="button"
                disabled={!!reviewSubmitting}
                onClick={() => void handleReview("REJEITADO")}
                className="px-4 py-2 rounded-lg bg-white border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
              >
                {reviewSubmitting === "REJEITADO" ? "Salvando…" : "Rejeitar"}
              </button>
            </div>
            </div>
          ) : null}
        </div>

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
              {(checklist.odometer != null || checklist.truck?.totalKm != null) && (
                <p className="flex justify-between gap-3">
                  <span className="text-gray-500">Hodômetro:</span>
                  <span className="font-medium text-right">
                    {(checklist.odometer ?? checklist.truck?.totalKm ?? 0).toLocaleString()} km
                  </span>
                </p>
              )}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {cabinUrl && (
              <div className="border rounded-lg p-2">
                <p className="text-center font-semibold mb-2 text-sm text-gray-600">Cabine</p>
                <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <ImageWithFallback
                    src={getImageUrl(cabinUrl)}
                    alt="Cabine"
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => void openImageInNewTab(getImageUrl(cabinUrl))}
                  />
                </div>
              </div>
            )}
            {lonaUrl && (
              <div className="border rounded-lg p-2">
                <p className="text-center font-semibold mb-2 text-sm text-gray-600">Lona / Baú</p>
                <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <ImageWithFallback
                    src={getImageUrl(lonaUrl)}
                    alt="Lona"
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => void openImageInNewTab(getImageUrl(lonaUrl))}
                  />
                </div>
              </div>
            )}
            {checklist.tiresPhotoUrl && !tireByPosition.length && (
              <div className="border rounded-lg p-2 sm:col-span-2">
                <p className="text-center font-semibold mb-2 text-sm text-gray-600">Pneus (legado)</p>
                <div className="aspect-video bg-gray-100 rounded overflow-hidden max-w-md mx-auto">
                  <ImageWithFallback
                    src={getImageUrl(checklist.tiresPhotoUrl)}
                    alt="Pneus"
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => void openImageInNewTab(getImageUrl(checklist.tiresPhotoUrl))}
                  />
                </div>
              </div>
            )}
          </div>

          {tireByPosition.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm text-gray-800 mb-2">
                Pneus — uma foto por posição ({tireByPosition.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {tireByPosition.map((photo) => (
                  <div key={photo.id} className="border rounded-lg p-2">
                    <p className="text-center font-semibold mb-1 text-[10px] leading-tight text-gray-700 line-clamp-2 min-h-[2rem]">
                      {photo.tirePosition
                        ? `${getTirePositionLabel(photo.tirePosition)} (${photo.tirePosition})`
                        : photo.category}
                    </p>
                    <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                      <ImageWithFallback
                        src={getImageUrl(photo.photoUrl)}
                        alt={photo.tirePosition || "pneu"}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => void openImageInNewTab(getImageUrl(photo.photoUrl))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {legacyAxlePhotos.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm text-amber-800 mb-2">
                Legado — foto por lado do eixo ({legacyAxlePhotos.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {legacyAxlePhotos.map((photo) => (
                  <div key={photo.id} className="border border-amber-100 rounded-lg p-2">
                    <p className="text-center font-semibold mb-1 text-xs text-gray-600">
                      Eixo {photo.axleNumber} —{" "}
                      {photo.side === "ESQ"
                        ? "Esquerdo"
                        : photo.side === "DIR"
                          ? "Direito"
                          : ""}
                    </p>
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <ImageWithFallback
                        src={getImageUrl(photo.photoUrl)}
                        alt="Eixo"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => void openImageInNewTab(getImageUrl(photo.photoUrl))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {legacyPneuSemPosicao.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Outras fotos (PNEU)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {legacyPneuSemPosicao.map((photo) => (
                  <div key={photo.id} className="border rounded-lg p-2">
                    <p className="text-center text-xs text-gray-600 mb-1">Pneu</p>
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <ImageWithFallback
                        src={getImageUrl(photo.photoUrl)}
                        alt="Pneu"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => void openImageInNewTab(getImageUrl(photo.photoUrl))}
                      />
                    </div>
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
