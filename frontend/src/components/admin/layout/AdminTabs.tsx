import React from "react";
import { Activity, AlertCircle, CheckCircle, Disc, Truck, Users } from "lucide-react";

interface AdminTabsProps {
  activeTab: string;
  onChange: (tabId: string) => void;
}

const tabs = [
  { id: "visao-geral", label: "Visão Geral", icon: Activity },
  { id: "caminhoes", label: "Caminhões", icon: Truck },
  { id: "motoristas", label: "Motoristas", icon: Users },
  { id: "checklists", label: "Checklists", icon: CheckCircle },
  { id: "ocorrencias", label: "Ocorrências", icon: AlertCircle },
  { id: "pneus", label: "Gestão de Pneus", icon: Disc },
];

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className="bg-white border-b border-gray-200/80 mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex gap-1 sm:gap-2 overflow-x-auto pb-0 pt-1 [-webkit-overflow-scrolling:touch] scroll-smooth [scrollbar-width:thin]"
          role="tablist"
          aria-label="Seções do painel administrativo"
        >
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onChange(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-t-lg py-3.5 px-3 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ${
                  selected
                    ? "border-primary-600 text-primary-700 bg-primary-50/60"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/80 hover:border-gray-200"
                }`}
              >
                <tab.icon className={`w-5 h-5 shrink-0 ${selected ? "text-primary-600" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <p className="text-xs text-gray-500 pb-2 sm:hidden pt-1">
          Deslize as abas para o lado para acessar todas as opções.
        </p>
      </div>
    </div>
  );
};

export default AdminTabs;
