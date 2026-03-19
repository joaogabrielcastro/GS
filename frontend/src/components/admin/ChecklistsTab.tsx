import React from "react";
import { Eye } from "lucide-react";
import Pagination from "@/components/Pagination";
import type { DailyChecklist } from "@/types";

interface ChecklistsTabProps {
  checklists: DailyChecklist[];
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOpenDetails: (checklist: DailyChecklist) => void;
}

const ChecklistsTab: React.FC<ChecklistsTabProps> = ({
  checklists,
  page,
  total,
  totalPages,
  onPageChange,
  onOpenDetails,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Checklists Realizados</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Caminhão</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Motorista</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">KM</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {checklists.map((check) => (
              <tr key={check.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(check.createdAt).toLocaleDateString()}{" "}
                  <span className="text-xs text-gray-400">
                    {new Date(check.createdAt).toLocaleTimeString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {check.truck?.plate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{check.driver?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {check.odometer?.toLocaleString()} km
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onOpenDetails(check)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" /> Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
            {checklists.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum checklist encontrado.
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

export default ChecklistsTab;
