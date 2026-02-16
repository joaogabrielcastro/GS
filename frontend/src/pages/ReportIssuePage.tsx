import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { occurrenceService } from "@/services/api";
import { dashboardService } from "@/services/dashboardService";
import toast from "react-hot-toast";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [truck, setTruck] = useState<any>(null);

  // Form states
  const [type, setType] = useState("OUTRO");
  const [description, setDescription] = useState("");
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
      } catch (error) {
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
      // 1. Upload photos
      let uploadedUrls: string[] = [];
      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((file) => formData.append("photos", file));

        const uploadRes = await occurrenceService.uploadPhotos(formData);
        // Ajustar conforme resposta real do backend. O controller retorna { photoUrls: [...] }?
        // Verificando controller: res.json({ message: '...', photoUrls }); // photoUrls é array de strings
        uploadedUrls = uploadRes.photoUrls || [];
      }

      // 2. Create Occurrence
      await occurrenceService.create({
        truckId: truck.id,
        type,
        description,
        photoUrls: uploadedUrls,
      });

      toast.success("Ocorrência registrada!");
      navigate("/motorista");
    } catch (error: any) {
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
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <header className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 mr-2 text-gray-600 hover:bg-gray-200 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Reportar Problema</h1>
      </header>

      {truck && (
        <div className="bg-red-600 text-white p-4 rounded-xl mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-white" />
            <span className="font-bold">Ocorrência em Veículo</span>
          </div>
          <p className="text-xl font-bold">{truck.plate}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Problema
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option value="OUTRO">Outro</option>
            <option value="PNEU_ESTOURADO">Pneu Estourado</option>
            <option value="PROBLEMA_MECANICO">Problema Mecânico</option>
            <option value="LONA_RASGADA">Lona Rasgada</option>
            <option value="ACIDENTE">Acidente</option>
          </select>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição Detalhada
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-32"
            placeholder="Descreva o que aconteceu, onde e quando..."
            required
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Evidências (Fotos)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoAdd}
            className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-red-50 file:text-red-700
                        hover:file:bg-red-100"
          />
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          {loading ? "Enviando Report..." : "Registrar Ocorrência"}
        </button>
      </form>
    </div>
  );
};

export default ReportIssuePage;
