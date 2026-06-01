import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { occurrenceService } from "@/services/api";
import { dashboardService } from "@/services/dashboardService";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import MobilePageHeader from "@/components/layout/MobilePageHeader";

const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [truck, setTruck] = useState<any>(null);

  const [type, setType] = useState("OUTRO");
  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    const loadTruck = async () => {
      try {
        const stats = await dashboardService.getDriverStats();
        if (!stats.truck) {
          toast.error("Você precisa ter um caminhão atribuído.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truck) return;
    setLoading(true);

    try {
      let uploadedUrls: string[] = [];
      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((file) => formData.append("photos", file));
        const uploadRes = await occurrenceService.uploadPhotos(formData);
        uploadedUrls = uploadRes.photoUrls || [];
      }

      await occurrenceService.create({
        truckId: truck.id,
        type,
        description,
        photoUrls: uploadedUrls,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      });

      toast.success("Ocorrência registrada!");
      navigate("/motorista");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Erro ao registrar ocorrência.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)]);
    }
  };

  return (
    <div className="page-shell-driver">
      <MobilePageHeader
        title="Reportar problema"
        subtitle={truck ? truck.plate : undefined}
        backTo="/motorista"
      />

      <main className="max-w-lg mx-auto sm:max-w-3xl px-4 py-6 space-y-5">
        {truck && (
          <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white p-5 shadow-elevated animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-semibold text-sm uppercase tracking-wide text-red-100">
                Ocorrência em veículo
              </span>
            </div>
            <p className="text-2xl font-bold tracking-wide">{truck.plate}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="card-section">
            <label className="label-field">Tipo de problema</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
              <option value="OUTRO">Outro</option>
              <option value="PNEU_ESTOURADO">Pneu estourado</option>
              <option value="PROBLEMA_MECANICO">Problema mecânico</option>
              <option value="LONA_RASGADA">Lona rasgada</option>
              <option value="ACIDENTE">Acidente</option>
            </select>
          </div>

          <div className="card-section">
            <label className="label-field">Descrição detalhada</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[8rem] resize-y"
              placeholder="Descreva o que aconteceu, onde e quando…"
              required
            />
          </div>

          <div className="card-section">
            <label className="label-field">Custo estimado (opcional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-gs-gray-500 text-sm font-medium">
                R$
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="input-field pl-11"
                placeholder="0,00"
              />
            </div>
            <p className="text-xs text-gs-gray-500 mt-2">
              Valor aproximado de reparo, reboque, etc., se souber.
            </p>
          </div>

          <div className="card-section">
            <label className="label-field">Evidências (fotos)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              capture="environment"
              onChange={handlePhotoAdd}
              className="block w-full text-sm text-gs-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gs-orange-50 file:text-gs-orange-700 hover:file:bg-gs-orange-100"
            />
            {photos.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-gs-gray-200"
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-base">
            {loading ? "Enviando…" : "Registrar ocorrência"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ReportIssuePage;
