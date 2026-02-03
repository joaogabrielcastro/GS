import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  Truck, 
  Users, 
  AlertCircle,
  TrendingUp,
  Activity,
  Bell,
  Settings
} from 'lucide-react';

const DashboardAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('visao-geral');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-sm text-gray-600">Olá, {user?.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Bell className="w-6 h-6" />
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'visao-geral', label: 'Visão Geral', icon: Activity },
              { id: 'caminhoes', label: 'Caminhões', icon: Truck },
              { id: 'motoristas', label: 'Motoristas', icon: Users },
              { id: 'ocorrencias', label: 'Ocorrências', icon: AlertCircle },
              { id: 'configuracoes', label: 'Configurações', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'visao-geral' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Caminhões Ativos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                    <p className="text-sm text-green-600 mt-1">+2 este mês</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Truck className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Motoristas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">15</p>
                    <p className="text-sm text-gray-500 mt-1">3 disponíveis</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ocorrências Hoje</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
                    <p className="text-sm text-yellow-600 mt-1">2 pendentes</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Checklists Hoje</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">9/12</p>
                    <p className="text-sm text-blue-600 mt-1">75% completo</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ocorrências Recentes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  🚨 Ocorrências Pendentes
                </h3>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">Pneu Estourado</p>
                        <p className="text-sm text-gray-600">Caminhão ABC-1234</p>
                        <p className="text-xs text-gray-500 mt-1">Há 2 horas</p>
                      </div>
                      <button className="btn btn-primary text-sm">
                        Analisar
                      </button>
                    </div>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">Problema Mecânico</p>
                        <p className="text-sm text-gray-600">Caminhão DEF-5678</p>
                        <p className="text-xs text-gray-500 mt-1">Há 5 horas</p>
                      </div>
                      <button className="btn btn-primary text-sm">
                        Analisar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  🛞 Alertas de Pneus
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Fim de vida útil</p>
                        <p className="text-sm text-gray-600">Pneu #PN-001 - ABC-1234</p>
                        <p className="text-xs text-gray-500 mt-1">
                          95,000 / 100,000 km
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Recorrência de problemas</p>
                        <p className="text-sm text-gray-600">Pneu #PN-023 - XYZ-9876</p>
                        <p className="text-xs text-gray-500 mt-1">
                          3 ocorrências nos últimos 30 dias
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas de Pneus */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                📊 Estatísticas de Pneus (Foco Principal)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-600">48</p>
                  <p className="text-sm text-gray-600 mt-1">Total de Pneus</p>
                </div>

                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">R$ 72.450</p>
                  <p className="text-sm text-gray-600 mt-1">Custo Total</p>
                </div>

                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">85.000 km</p>
                  <p className="text-sm text-gray-600 mt-1">Vida Média</p>
                </div>

                <div className="text-center">
                  <p className="text-4xl font-bold text-yellow-600">R$ 0,89/km</p>
                  <p className="text-sm text-gray-600 mt-1">Custo por KM</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'caminhoes' && (
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Gestão de Caminhões
            </h3>
            <p className="text-gray-600">
              Módulo em desenvolvimento - cadastro, edição e acompanhamento de caminhões.
            </p>
          </div>
        )}

        {activeTab === 'motoristas' && (
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Gestão de Motoristas
            </h3>
            <p className="text-gray-600">
              Módulo em desenvolvimento - cadastro, atribuição e histórico de motoristas.
            </p>
          </div>
        )}

        {activeTab === 'ocorrencias' && (
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Todas as Ocorrências
            </h3>
            <p className="text-gray-600">
              Módulo em desenvolvimento - listagem completa e análise de ocorrências.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardAdmin;
