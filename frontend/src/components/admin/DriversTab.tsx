import React from "react";
import { Plus, Search } from "lucide-react";
import type { User } from "@/types";

interface DriversTabProps {
  drivers: User[];
  search: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onNewDriver: () => void;
  onEditDriver: (driver: User) => void;
  onDeleteDriver: (driver: User) => void;
}

const DriversTab: React.FC<DriversTabProps> = ({
  drivers,
  search,
  loading,
  onSearchChange,
  onNewDriver,
  onEditDriver,
  onDeleteDriver,
}) => {
  const emptyMessage = search.trim()
    ? "Nenhum motorista encontrado para esta busca."
    : "Nenhum motorista encontrado.";

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Equipe de Motoristas</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto sm:min-w-0 sm:justify-end">
          <label className="relative flex-1 sm:max-w-md min-w-0">
            <span className="sr-only">Buscar motorista</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nome, e-mail, telefone ou CPF…"
              autoComplete="off"
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </label>
          <button
            type="button"
            onClick={onNewDriver}
            className="shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Novo Motorista
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        {loading && (
          <p className="absolute top-2 right-3 text-xs text-gray-400 z-10" aria-live="polite">
            Buscando…
          </p>
        )}
        <table className={`w-full text-left ${loading ? "opacity-60" : ""}`}>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cadastro
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {driver.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                      <div className="text-xs text-gray-500">CPF: {driver.cpf || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{driver.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{driver.phone || "—"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driver.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {driver.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(driver.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onEditDriver(driver)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteDriver(driver)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriversTab;
