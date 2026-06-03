import React from "react";
import { Plus, Search } from "lucide-react";
import TableScroll from "@/components/common/TableScroll";
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
        <h2 className="section-title">Equipe de motoristas</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto sm:min-w-0 sm:justify-end">
          <label className="search-field sm:max-w-md">
            <span className="sr-only">Buscar motorista</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gs-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nome, e-mail, telefone ou CPF…"
              autoComplete="off"
              className="search-input"
            />
          </label>
          <button type="button" onClick={onNewDriver} className="shrink-0 btn-primary whitespace-nowrap">
            <Plus className="w-5 h-5" /> Novo motorista
          </button>
        </div>
      </div>

      <div className="table-shell relative">
        {loading && (
          <p className="absolute top-2 right-3 text-xs text-gray-400 z-10" aria-live="polite">
            Buscando…
          </p>
        )}
        <TableScroll minWidth={880} className="px-1 pt-1">
        <table className={`w-full text-left ${loading ? "opacity-60" : ""}`}>
          <thead className="table-head-row">
            <tr>
              <th className="table-th">
                Nome
              </th>
              <th className="table-th">
                Email
              </th>
              <th className="table-th">
                Telefone
              </th>
              <th className="table-th">
                Status
              </th>
              <th className="table-th">
                Cadastro
              </th>
              <th className="table-th">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {drivers.map((driver) => (
              <tr key={driver.id} className="table-row-hover">
                <td className="table-td">
                  <div className="flex items-center">
                    <div className="h-10 w-10 shrink-0 bg-gs-orange-100 rounded-full flex items-center justify-center text-gs-orange-700 font-bold">
                      {driver.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                      <div className="text-xs text-gray-500">CPF: {driver.cpf || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="table-td">{driver.email}</td>
                <td className="table-td">{driver.phone || "—"}</td>
                <td className="table-td">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driver.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {driver.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="table-td text-gs-gray-500">
                  {new Date(driver.createdAt).toLocaleDateString()}
                </td>
                <td className="table-td">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => onEditDriver(driver)} className="link-action">
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
        </TableScroll>
      </div>
    </div>
  );
};

export default DriversTab;
