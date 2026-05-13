import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { checklistService } from "@/services/api";
import { dashboardService } from "@/services/dashboardService";
import {
  VEHICLE_TYPE_LABELS,
  VEHICLE_AXLES,
  axlePositionCodes,
  getChecklistTirePhotoSlots,
  getTirePositionLabel,
  groupAxlesBySection,
  type Truck,
  type VehicleType,
} from "@/types";
import toast from "react-hot-toast";
import { ArrowLeft, Camera, CheckCircle, AlertTriangle } from "lucide-react";

const PhotoButton = ({
  label,
  subLabel,
  fieldName,
  preview,
  onChange,
  compact,
}: {
  label: string;
  /** Texto extra abaixo do rótulo (ex.: marca do pneu cadastrado). */
  subLabel?: string;
  fieldName: string;
  preview: string | null;
  onChange: (fieldName: string, file: File) => void;
  compact?: boolean;
}) => (
  <label className="flex flex-col items-center gap-1 cursor-pointer select-none">
    <div
      className={`${compact ? "w-14 h-14" : "w-16 h-16"} rounded-xl flex items-center justify-center overflow-hidden border-2 transition-colors ${
        preview
          ? "border-green-400 bg-green-50"
          : "border-dashed border-gray-300 bg-gray-50"
      }`}
    >
      {preview ? (
        <img src={preview} alt="" className="w-full h-full object-cover" />
      ) : (
        <Camera className={compact ? "w-5 h-5 text-gray-400" : "w-6 h-6 text-gray-400"} />
      )}
    </div>
    <span
      className={`font-medium text-gray-600 ${compact ? "text-[10px] leading-tight text-center max-w-[5.5rem]" : "text-xs"}`}
    >
      {label}
    </span>
    {subLabel ? (
      <span className="text-[9px] leading-tight text-center text-gray-500 max-w-[5.5rem] line-clamp-2">
        {subLabel}
      </span>
    ) : null}
    {preview && <CheckCircle className="w-3 h-3 text-green-500" />}
    <input
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onChange(fieldName, f);
      }}
    />
  </label>
);

const ChecklistPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [truck, setTruck] = useState<Truck | null>(null);

  const [overallCondition, setOverallCondition] = useState("BOM");
  const [tiresCondition, setTiresCondition] = useState("BOM");
  const [cabinCondition, setCabinCondition] = useState("BOM");
  const [canvasCondition, setCanvasCondition] = useState("BOM");
  const [notes, setNotes] = useState("");

  const [photoFiles, setPhotoFiles] = useState<Record<string, File>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>(
    {},
  );

  const handlePhotoChange = useCallback((fieldName: string, file: File) => {
    setPhotoFiles((prev) => ({ ...prev, [fieldName]: file }));
    setPhotoPreviews((prev) => ({
      ...prev,
      [fieldName]: URL.createObjectURL(file),
    }));
  }, []);

  useEffect(() => {
    const loadTruck = async () => {
      try {
        const stats = await dashboardService.getDriverStats();
        if (!stats.truck) {
          toast.error(
            "Você precisa ter um caminhão atribuído para fazer checklist.",
          );
          navigate("/motorista");
          return;
        }
        setTruck({
          ...stats.truck,
          vehicleType: stats.truck.vehicleType as VehicleType,
          spareCount: stats.truck.spareCount ?? 1,
        } as Truck);
      } catch {
        toast.error("Erro ao verificar caminhão.");
      }
    };
    loadTruck();
  }, [navigate]);

  const axles = truck?.vehicleType
    ? (VEHICLE_AXLES[truck.vehicleType] ?? [])
    : [];

  const tireSlots = useMemo(() => {
    if (!truck?.vehicleType) return [];
    return getChecklistTirePhotoSlots(
      truck.vehicleType,
      truck.spareCount ?? 1,
    );
  }, [truck?.vehicleType, truck?.spareCount]);

  const tireBrandByPosition = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of truck?.tires ?? []) {
      const b = typeof t.brand === "string" ? t.brand.trim() : "";
      if (t.position && b) m.set(t.position, b);
    }
    return m;
  }, [truck?.tires]);

  const axleSections = useMemo(() => groupAxlesBySection(axles), [axles]);

  const estepeSlots = useMemo(() => {
    const n = Math.max(0, Math.min(2, Math.floor(truck?.spareCount ?? 1)));
    return Array.from({ length: n }, (_, i) => `ESTEPE${i + 1}`);
  }, [truck?.spareCount]);

  const totalRequired = 2 + tireSlots.length;

  const doneCount = useMemo(() => {
    let n = 0;
    if (photoFiles.cabinPhoto) n += 1;
    if (photoFiles.canvasPhoto) n += 1;
    for (const code of tireSlots) {
      if (photoFiles[`tire_${code}`]) n += 1;
    }
    return n;
  }, [photoFiles, tireSlots]);

  const pct = Math.round((doneCount / Math.max(totalRequired, 1)) * 100);
  const allPhotosComplete = doneCount >= totalRequired;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truck) return;
    setLoading(true);
    try {
      const formData = new FormData();
      let hasFiles = false;
      for (const [fn, file] of Object.entries(photoFiles)) {
        formData.append(fn, file);
        hasFiles = true;
      }

      let photoUrls: Record<string, string> = {};
      if (hasFiles) {
        const res = await checklistService.uploadPhotos(formData);
        photoUrls = res.photoUrls || {};
      }

      const checklistPhotos: {
        category: string;
        photoUrl: string;
        tirePosition?: string;
      }[] = [];
      if (photoUrls.cabinPhoto)
        checklistPhotos.push({ category: "CABINE", photoUrl: photoUrls.cabinPhoto });
      if (photoUrls.canvasPhoto)
        checklistPhotos.push({ category: "LONA", photoUrl: photoUrls.canvasPhoto });

      for (const code of tireSlots) {
        const key = `tire_${code}`;
        const url = photoUrls[key];
        if (url) {
          checklistPhotos.push({
            category: "PNEU",
            tirePosition: code,
            photoUrl: url,
          });
        }
      }

      await checklistService.create({
        truckId: truck.id,
        overallCondition,
        tiresCondition,
        cabinCondition,
        canvasCondition,
        notes,
        checklistPhotos: JSON.stringify(checklistPhotos),
      });

      toast.success("Checklist enviado com sucesso!");
      navigate("/motorista");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Erro ao enviar checklist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10 flex items-center px-4 py-3 gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-800">Novo Checklist</h1>
          {truck && (
            <p className="text-xs text-gray-500">
              {truck.plate} · {truck.brand} {truck.model}
            </p>
          )}
        </div>
        {truck && (
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">
            {doneCount}/{totalRequired} fotos
          </span>
        )}
      </header>

      {truck && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white mx-4 mt-4 p-4 rounded-2xl shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-blue-200 uppercase tracking-wide">
                Veículo
              </p>
              <p className="text-3xl font-bold tracking-wider">{truck.plate}</p>
              <p className="text-sm text-blue-100 mt-0.5">
                {truck.brand} {truck.model}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-200">Tipo</p>
              <p className="text-sm font-semibold text-white">
                {truck.vehicleType
                  ? (
                      VEHICLE_TYPE_LABELS[truck.vehicleType] ?? truck.vehicleType
                    ).split(" (")[0]
                  : "—"}
              </p>
              <p className="text-xs text-blue-300 mt-0.5">
                {axles.length} eixos · {tireSlots.length} pneus/estepe
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-blue-200 mb-1">
              <span>Progresso das fotos</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-blue-500 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4 px-4">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
            Condições Gerais
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Condição Pneus",
                v: tiresCondition,
                set: setTiresCondition,
              },
              {
                label: "Condição Cabine",
                v: cabinCondition,
                set: setCabinCondition,
              },
              {
                label: "Condição Lona/Baú",
                v: canvasCondition,
                set: setCanvasCondition,
                opts: [
                  { value: "BOM", label: "Bom" },
                  { value: "REGULAR", label: "Regular" },
                  { value: "RASGADO", label: "Rasgado/Danificado" },
                ],
              },
              {
                label: "Avaliação Geral",
                v: overallCondition,
                set: setOverallCondition,
              },
            ].map(({ label, v, set, opts }: { label: string; v: string; set: (s: string) => void; opts?: { value: string; label: string }[] }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {label}
                </label>
                <select
                  value={v}
                  onChange={(e) => set(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  {(opts || [
                    { value: "BOM", label: "Bom" },
                    { value: "REGULAR", label: "Regular" },
                    { value: "RUIM", label: "Ruim / Problema" },
                  ]).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
            Fotos Gerais
          </h2>
          <div className="flex gap-6 justify-center py-2">
            <PhotoButton
              label="Cabine"
              fieldName="cabinPhoto"
              preview={photoPreviews.cabinPhoto ?? null}
              onChange={handlePhotoChange}
            />
            <PhotoButton
              label="Lona / Baú"
              fieldName="canvasPhoto"
              preview={photoPreviews.canvasPhoto ?? null}
              onChange={handlePhotoChange}
            />
          </div>
        </section>

        {axles.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Pneus rodando
              </h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                1 foto por pneu
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Cada botão corresponde a uma posição do conjunto (mesmo padrão do cadastro de pneus).
            </p>

            {axleSections.map(({ section, axles: sectionAxles }) => (
              <div key={section} className="mb-5">
                {axleSections.length > 1 && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">
                    {section}
                  </p>
                )}
                <div className="space-y-4">
                  {sectionAxles.map((axle) => {
                    const { left, right } = axlePositionCodes(axle);
                    const positions = [...left, ...right];
                    const allDone = positions.every(
                      (code) => !!photoFiles[`tire_${code}`],
                    );
                    const someDone = positions.some(
                      (code) => !!photoFiles[`tire_${code}`],
                    );
                    return (
                      <div
                        key={axle.axleNumber}
                        className={`border rounded-2xl p-3 transition-colors ${
                          allDone
                            ? "border-green-300 bg-green-50"
                            : someDone
                              ? "border-yellow-300 bg-yellow-50"
                              : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {axle.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {positions.length} foto
                              {positions.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          {allDone ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div
                          className={`grid gap-2 justify-items-center ${
                            positions.length <= 2
                              ? "grid-cols-2"
                              : "grid-cols-4"
                          }`}
                        >
                          {positions.map((code) => (
                            <PhotoButton
                              key={code}
                              label={getTirePositionLabel(code)}
                              subLabel={tireBrandByPosition.get(code)}
                              fieldName={`tire_${code}`}
                              preview={photoPreviews[`tire_${code}`] ?? null}
                              onChange={handlePhotoChange}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {estepeSlots.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Estepe{estepeSlots.length > 1 ? "s" : ""} ({estepeSlots.length})
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {estepeSlots.map((code) => (
                    <PhotoButton
                      key={code}
                      label={getTirePositionLabel(code)}
                      subLabel={tireBrandByPosition.get(code)}
                      fieldName={`tire_${code}`}
                      preview={photoPreviews[`tire_${code}`] ?? null}
                      onChange={handlePhotoChange}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-28 resize-none"
            placeholder="Descreva qualquer detalhe importante..."
          />
        </section>

        <button
          type="submit"
          disabled={loading || !allPhotosComplete}
          className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50 text-base"
        >
          {loading
            ? "Enviando..."
            : !allPhotosComplete
              ? `Tire todas as fotos (${doneCount}/${totalRequired})`
              : `Finalizar Checklist (${doneCount} fotos)`}
        </button>

        {!allPhotosComplete && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>
              É necessário tirar todas as fotos antes de enviar o checklist.
              Faltam <strong>{totalRequired - doneCount}</strong>{" "}
              {totalRequired - doneCount === 1 ? "foto" : "fotos"}.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChecklistPage;
