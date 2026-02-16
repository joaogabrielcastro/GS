import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { checklistService } from "@/services/api";
import { dashboardService } from "@/services/dashboardService";
import toast from "react-hot-toast";
import { ArrowLeft, Camera, Upload } from "lucide-react";

const ChecklistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [truck, setTruck] = useState<any>(null);

  // Form states
  const [overallCondition, setOverallCondition] = useState("BOM");
  const [tiresCondition, setTiresCondition] = useState("BOM");
  const [cabinCondition, setCabinCondition] = useState("BOM");
  const [canvasCondition, setCanvasCondition] = useState("BOM");

  const [notes, setNotes] = useState("");
  const [cabinFile, setCabinFile] = useState<File | null>(null);
  const [tiresFile, setTiresFile] = useState<File | null>(null);
  const [canvasFile, setCanvasFile] = useState<File | null>(null);

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
      } catch (error) {
        console.error("Erro ao carregar caminhão", error);
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
      // 1. Upload photos if any
      let photosData: any = {};
      const formData = new FormData();
      let hasFiles = false;

      if (cabinFile) {
        formData.append("cabinPhoto", cabinFile);
        hasFiles = true;
      }
      if (tiresFile) {
        formData.append("tiresPhoto", tiresFile);
        hasFiles = true;
      }
      if (canvasFile) {
        formData.append("canvasPhoto", canvasFile);
        hasFiles = true;
      }

      if (hasFiles) {
        const uploadRes = await checklistService.uploadPhotos(formData);
        photosData = uploadRes.photoUrls || {};
      }

      // 2. Create Checklist
      const checklistData = {
        truckId: truck.id,
        overallCondition,
        tiresCondition,
        cabinCondition,
        canvasCondition,
        notes,
        ...photosData,
      };

      await checklistService.create(checklistData);
      toast.success("Checklist enviado com sucesso!");
      navigate("/motorista");
    } catch (error: any) {
      console.error("Erro ao enviar checklist:", error);
      const msg = error.response?.data?.error || "Erro ao enviar checklist.";
      toast.error(msg);
    } finally {
      setLoading(false);
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
        <h1 className="text-xl font-bold text-gray-800">Novo Checklist</h1>
      </header>

      {truck && (
        <div className="bg-blue-600 text-white p-4 rounded-xl mb-6 shadow-sm">
          <p className="text-sm text-blue-100">Caminhão</p>
          <p className="text-2xl font-bold">{truck.plate}</p>
          <p className="text-sm">
            {truck.brand} {truck.model}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condição Pneus
            </label>
            <select
              value={tiresCondition}
              onChange={(e) => setTiresCondition(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
            >
              <option value="BOM">Bom</option>
              <option value="REGULAR">Regular</option>
              <option value="RUIM">Ruim</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condição Cabine
            </label>
            <select
              value={cabinCondition}
              onChange={(e) => setCabinCondition(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
            >
              <option value="BOM">Bom</option>
              <option value="REGULAR">Regular</option>
              <option value="RUIM">Ruim</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condição Lona/Baú
            </label>
            <select
              value={canvasCondition}
              onChange={(e) => setCanvasCondition(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
            >
              <option value="BOM">Bom</option>
              <option value="REGULAR">Regular</option>
              <option value="RASGADO">Rasgado/Danificado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação Geral
            </label>
            <select
              value={overallCondition}
              onChange={(e) => setOverallCondition(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="BOM">Bom</option>
              <option value="REGULAR">Regular - Precisa de Atenção</option>
              <option value="RUIM">Ruim - Problemas Críticos</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Fotos (Opcional)
          </label>

          <div className="grid grid-cols-1 gap-4">
            <FileInput label="Foto da Cabine" onChange={setCabinFile} />
            <FileInput label="Foto dos Pneus" onChange={setTiresFile} />
            <FileInput label="Foto da Lona/Baú" onChange={setCanvasFile} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
            placeholder="Descreva qualquer detalhe importante..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Finalizar Checklist"}
        </button>
      </form>
    </div>
  );
};

const FileInput: React.FC<{
  label: string;
  onChange: (file: File | null) => void;
}> = ({ label, onChange }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <label className="flex items-center gap-4 p-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <Camera className="w-6 h-6 text-gray-400" />
        )}
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <p className="text-xs text-gray-500">
          {preview ? "Foto selecionada" : "Toque para adicionar"}
        </p>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </label>
  );
};

export default ChecklistPage;
