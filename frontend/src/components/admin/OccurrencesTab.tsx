import React from "react";
import Pagination from "@/components/Pagination";
import { OCCURRENCE_STATUS_LABELS, type Occurrence, type OccurrenceStatus } from "@/types";

interface OccurrencesTabProps {
  occurrences: Occurrence[];
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOpenDetails: (occurrence: Occurrence) => void;
}

const OccurrencesTab: React.FC<OccurrencesTabProps> = ({
  occurrences,
  page,
  total,
  totalPages,
  onPageChange,
  onOpenDetails,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Ocorrências da Frota</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
            {occurrences.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma ocorrência registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
