import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { checklistService } from "@/services/api";
import { dashboardService } from "@/services/dashboardService";
import { VEHICLE_TYPE_LABELS, VEHICLE_AXLES } from "@/types";
import toast from "react-hot-toast";
import { ArrowLeft, Camera, CheckCircle, AlertTriangle } from "lucide-react";
import { ChecklistAxleDiagram } from "@/components/common/TruckAxleDiagram";

// ─── Photo button with camera capture ─────────────────────────────────────────
const PhotoButton = ({ label, fieldName, preview, onChange }: any) => (
  <label className="flex flex-col items-center gap-1 cursor-pointer select-none">
    <div
      className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border-2 transition-colors ${
        preview
          ? "border-green-400 bg-green-50"
          : "border-dashed border-gray-300 bg-gray-50"
      }`}
    >
      {preview ? (
        <img src={preview} alt="" className="w-full h-full object-cover" />
      ) : (
        <Camera className="w-6 h-6 text-gray-400" />
      )}
    </div>
    <span className="text-xs font-medium text-gray-600">{label}</span>
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

// ─── Main Component ─────────────────────────────────────────────────────────────
const ChecklistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [truck, setTruck] = useState<any>(null);

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
        setTruck(stats.truck);
      } catch {
        toast.error("Erro ao verificar caminhão.");
      }
    };
    loadTruck();
  }, [navigate]);

  const axles = truck?.vehicleType
    ? (VEHICLE_AXLES[truck.vehicleType as keyof typeof VEHICLE_AXLES] ?? [])
    : [];

  const axleSections = axles.reduce<{ section: string; axles: typeof axles }[]>(
    (acc, axle) => {
      const sname = axle.section || "Veículo";
      const found = acc.find((s) => s.section === sname);
      if (found) found.axles.push(axle);
      else acc.push({ section: sname, axles: [axle] });
      return acc;
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truck) return;
    setLoading(true);
    try {
      // Upload all photos
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

      // Build checklistPhotos
      const checklistPhotos: any[] = [];
      if (photoUrls["cabinPhoto"])
        checklistPhotos.push({
          category: "CABINE",
          photoUrl: photoUrls["cabinPhoto"],
        });
      if (photoUrls["canvasPhoto"])
        checklistPhotos.push({
          category: "LONA",
          photoUrl: photoUrls["canvasPhoto"],
        });
      for (const axle of axles as any[]) {
        const n = axle.axleNumber;
        if (photoUrls[`axle_${n}_esq`])
          checklistPhotos.push({
            category: "EIXO",
            axleNumber: n,
            side: "ESQ",
            photoUrl: photoUrls[`axle_${n}_esq`],
          });
        if (photoUrls[`axle_${n}_dir`])
          checklistPhotos.push({
            category: "EIXO",
            axleNumber: n,
            side: "DIR",
            photoUrl: photoUrls[`axle_${n}_dir`],
          });
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
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao enviar checklist.");
    } finally {
      setLoading(false);
    }
  };

  const totalRequired = 2 + axles.length * 2;
  const totalDone = Object.keys(photoFiles).length;
  const pct = Math.round((totalDone / Math.max(totalRequired, 1)) * 100);
  const allPhotosComplete = totalDone >= totalRequired;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
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
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {totalDone}/{totalRequired} fotos
          </span>
        )}
      </header>

      {/* Truck banner */}
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
                      VEHICLE_TYPE_LABELS[
                        truck.vehicleType as keyof typeof VEHICLE_TYPE_LABELS
                      ] ?? truck.vehicleType
                    ).split(" (")[0]
                  : "—"}
              </p>
              <p className="text-xs text-blue-300 mt-0.5">
                {axles.length} eixos
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
        {/* Condições Gerais */}
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
            ].map(({ label, v, set, opts }: any) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {label}
                </label>
                <select
                  value={v}
                  onChange={(e) => set(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  {(
                    opts || [
                      { value: "BOM", label: "Bom" },
                      { value: "REGULAR", label: "Regular" },
                      { value: "RUIM", label: "Ruim / Problema" },
                    ]
                  ).map((o: any) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Fotos Gerais */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
            Fotos Gerais
          </h2>
          <div className="flex gap-6 justify-center py-2">
            <PhotoButton
              label="Cabine"
              fieldName="cabinPhoto"
              preview={photoPreviews["cabinPhoto"] ?? null}
              onChange={handlePhotoChange}
            />
            <PhotoButton
              label="Lona / Baú"
              fieldName="canvasPhoto"
              preview={photoPreviews["canvasPhoto"] ?? null}
              onChange={handlePhotoChange}
            />
          </div>
        </section>

        {/* Fotos por Eixo */}
        {axles.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Eixos
              </h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {axles.length} eixos
              </span>
            </div>

            {axleSections.map(({ section, axles: sa }) => (
              <div key={section} className="mb-5">
                {axleSections.length > 1 && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">
                    {section}
                  </p>
                )}
                <div className="space-y-4">
                  {sa.map((axle: any) => {
                    const n = axle.axleNumber;
                    const lk = `axle_${n}_esq`,
                      rk = `axle_${n}_dir`;
                    const ld = !!photoFiles[lk],
                      rd = !!photoFiles[rk];
                    return (
                      <div
                        key={n}
                        className={`border rounded-2xl p-4 transition-colors ${
                          ld && rd
                            ? "border-green-300 bg-green-50"
                            : ld || rd
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
                              {axle.tiresPerSide === "double"
                                ? "4 pneus (duplos)"
                                : "2 pneus (simples)"}
                            </p>
                          </div>
                          {ld && rd ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="mb-4 px-2">
                          <ChecklistAxleDiagram
                            config={axle}
                            leftDone={ld}
                            rightDone={rd}
                          />
                        </div>
                        <div className="flex gap-4 justify-center">
                          <PhotoButton
                            label="Lado Esq."
                            fieldName={lk}
                            preview={photoPreviews[lk] ?? null}
                            onChange={handlePhotoChange}
                          />
                          <PhotoButton
                            label="Lado Dir."
                            fieldName={rk}
                            preview={photoPreviews[rk] ?? null}
                            onChange={handlePhotoChange}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Observações */}
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
              ? `Tire todas as fotos (${totalDone}/${totalRequired})`
              : `Finalizar Checklist (${totalDone} fotos)`}
        </button>

        {!allPhotosComplete && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>
              É necessário tirar todas as fotos antes de enviar o checklist.
              Faltam <strong>{totalRequired - totalDone}</strong>{" "}
              {totalRequired - totalDone === 1 ? "foto" : "fotos"}.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChecklistPage;
