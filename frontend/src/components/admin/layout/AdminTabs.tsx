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
  { id: "pneus", label: "Pneus", icon: Disc },
];

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className="bg-white border-b border-gs-gray-100 shadow-sm sticky top-[4.25rem] sm:top-[4.75rem] z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex gap-1 overflow-x-auto py-1 [-webkit-overflow-scrolling:touch] scroll-smooth scrollbar-thin"
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
                className={`flex shrink-0 items-center gap-2 rounded-xl py-3 px-3 sm:px-4 my-1 font-medium text-sm whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gs-orange-500 focus-visible:ring-offset-2 ${
                  selected
                    ? "bg-gs-orange-500 text-white shadow-sm"
                    : "text-gs-gray-600 hover:text-gs-black hover:bg-gs-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <p className="text-xs text-gs-gray-500 pb-2 pt-0.5 sm:hidden">
          Deslize para ver todas as seções.
        </p>
      </div>
    </div>
  );
};

export default AdminTabs;
