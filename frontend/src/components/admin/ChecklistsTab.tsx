import React, { useState } from "react";
import { Download, Eye, Search } from "lucide-react";
import { checklistService } from "@/services/api";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import {
  CHECKLIST_REVIEW_LABELS,
  type ChecklistReviewStatus,
  type DailyChecklist,
} from "@/types";

interface ChecklistsTabProps {
  checklists: DailyChecklist[];
  page: number;
  total: number;
  totalPages: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onOpenDetails: (checklist: DailyChecklist) => void;
}

const ChecklistsTab: React.FC<ChecklistsTabProps> = ({
  checklists,
  page,
  total,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  onOpenDetails,
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const searchTrimmed = search.trim();

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await checklistService.exportCsv({
        search: searchTrimmed || undefined,
        startDate: exportStartDate || undefined,
        endDate: exportEndDate || undefined,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `checklists-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Exportação concluída.");
    } catch {
      toast.error("Erro ao exportar checklists.");
    } finally {
      setExporting(false);
    }
  };
  const emptyMessage =
    searchTrimmed.length > 0
      ? "Nenhum checklist encontrado para esta busca."
      : "Nenhum checklist encontrado.";

  const formatKm = (check: DailyChecklist) => {
    const km = check.odometer ?? check.truck?.totalKm;
    if (km == null || Number.isNaN(km)) return "—";
    return `${km.toLocaleString()} km`;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Checklists Realizados</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-0">
          <label className="relative flex-1 sm:max-w-md min-w-0">
            <span className="sr-only">Buscar checklist</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Placa, carreta, motorista…"
              autoComplete="off"
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </label>
          <label className="sr-only" htmlFor="export-start-date">
            Data inicial do export
          </label>
          <input
            id="export-start-date"
            type="date"
            value={exportStartDate}
            onChange={(e) => setExportStartDate(e.target.value)}
            className="shrink-0 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900"
            title="Data inicial (export)"
          />
          <label className="sr-only" htmlFor="export-end-date">
            Data final do export
          </label>
          <input
            id="export-end-date"
            type="date"
            value={exportEndDate}
            onChange={(e) => setExportEndDate(e.target.value)}
            className="shrink-0 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900"
            title="Data final (export)"
          />
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={exporting}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exportando…" : "Exportar CSV"}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4 sm:hidden">
        Deslize a tabela para o lado para ver todas as colunas.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Caminhão
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Carretas
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Motorista
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Revisão
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  KM
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {checklists.map((check) => {
                const rs = (check.reviewStatus || "PENDENTE") as ChecklistReviewStatus;
                return (
                  <tr key={check.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                      {new Date(check.createdAt).toLocaleDateString()}{" "}
                      <span className="text-xs text-gray-400">
                        {new Date(check.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                      {check.truck?.plate}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                      {check.truck?.trailerPlates && check.truck.trailerPlates.length > 0
                        ? check.truck.trailerPlates.join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">{check.driver?.name}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          rs === "APROVADO"
                            ? "bg-green-100 text-green-800"
                            : rs === "PENDENTE"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {CHECKLIST_REVIEW_LABELS[rs]}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">{formatKm(check)}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      <button
                        onClick={() => onOpenDetails(check)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" /> Ver detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
              {checklists.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={10}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default ChecklistsTab;
