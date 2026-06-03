import React from "react";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import TableScroll from "@/components/common/TableScroll";
import { OCCURRENCE_STATUS_LABELS, type Occurrence, type OccurrenceStatus } from "@/types";

interface OccurrencesTabProps {
  occurrences: Occurrence[];
  page: number;
  total: number;
  totalPages: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onOpenDetails: (occurrence: Occurrence) => void;
}

const OccurrencesTab: React.FC<OccurrencesTabProps> = ({
  occurrences,
  page,
  total,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  onOpenDetails,
}) => {
  const searchTrimmed = search.trim();
  const emptyMessage =
    searchTrimmed.length > 0
      ? "Nenhuma ocorrência encontrada para esta busca."
      : "Nenhuma ocorrência registrada.";

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Ocorrências da Frota</h2>
        <label className="relative w-full sm:max-w-md min-w-0">
          <span className="sr-only">Buscar ocorrência</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Placa, motorista, descrição…"
            autoComplete="off"
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          />
        </label>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <TableScroll minWidth={800} className="px-1 pt-1 sm:px-0 sm:pt-0">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Veículo</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Motorista</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {occurrences.map((occ) => (
              <tr key={occ.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(occ.occurredAt).toLocaleDateString()}
                  <br />
                  <span className="text-xs text-gray-400">
                    {new Date(occ.occurredAt).toLocaleTimeString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{occ.type}</span>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                    {occ.description}
                  </p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{occ.truck?.plate}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{occ.driver?.name}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      occ.status === "PENDENTE"
                        ? "bg-red-100 text-red-800"
                        : occ.status === "EM_ANALISE"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {OCCURRENCE_STATUS_LABELS[occ.status as OccurrenceStatus] ??
                      occ.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onOpenDetails(occ)}
                    className="link-action"
                  >
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
            {occurrences.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </TableScroll>
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

export default OccurrencesTab;
