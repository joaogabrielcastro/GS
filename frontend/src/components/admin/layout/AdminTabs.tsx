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
    <div className="bg-white border-b mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminTabs;
