import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  DollarSign, 
  TrendingDown,
  TrendingUp,
  FileText,
  Download,
  Bell,
  Calendar
} from 'lucide-react';

const DashboardFinanceiro: React.FC = () => {
  const { user, logout } = useAuth();
  const [periodo, setPeriodo] = useState('mes');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Painel Financeiro
              </h1>
              <p className="text-sm text-gray-600">Olá, {user?.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="input py-2 text-sm"
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mês</option>
                <option value="ano">Este Ano</option>
                <option value="customizado">Personalizado</option>
              </select>

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Custos com Pneus</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">R$ 18.450</p>
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12% vs mês anterior
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Manutenções</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">R$ 8.920</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  -5% vs mês anterior
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ocorrências</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">R$ 5.340</p>
                <p className="text-sm text-gray-500 mt-1">23 ocorrências</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total do Período</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">R$ 32.710</p>
                <p className="text-sm text-gray-500 mt-1">Janeiro 2026</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Análise de Custos com Pneus - DESTAQUE */}
        <div className="card mb-8 border-2 border-orange-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                🛞 Análise Detalhada de Pneus
              </h3>
              <p className="text-sm text-gray-600">
                Foco principal do sistema - Controle e economia
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">Custo Total com Pneus</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">R$ 72.450</p>
              <p className="text-sm text-gray-600 mt-2">48 pneus ativos</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">Custo Médio por Pneu</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">R$ 1.509</p>
              <p className="text-sm text-gray-600 mt-2">Vida útil: 85.000 km</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">Economia Potencial</p>
              <p className="text-4xl font-bold text-green-600 mt-2">R$ 8.230</p>
              <p className="text-sm text-gray-600 mt-2">Com recapagens</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">💡 Insights e Recomendações</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 5 pneus estão próximos do fim da vida útil - planeje substituição</li>
              <li>• Pneu #PN-023 teve 3 eventos nos últimos 30 dias - avaliar qualidade</li>
              <li>• Custo/km está 12% acima da média do setor - oportunidade de otimização</li>
              <li>• Recapagem de 8 pneus pode gerar economia de R$ 8.230</li>
            </ul>
          </div>
        </div>

        {/* Custos por Caminhão */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📊 Top 5 - Maiores Custos por Caminhão
            </h3>
            
            <div className="space-y-4">
              {[
                { placa: 'ABC-1234', custo: 4850, pneus: 3, manutencao: 1500 },
                { placa: 'DEF-5678', custo: 4320, pneus: 2, manutencao: 2100 },
                { placa: 'GHI-9012', custo: 3980, pneus: 4, manutencao: 800 },
                { placa: 'JKL-3456', custo: 3750, pneus: 2, manutencao: 1200 },
                { placa: 'MNO-7890', custo: 3450, pneus: 3, manutencao: 950 },
              ].map((truck, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{truck.placa}</p>
                    <p className="text-sm text-gray-600">
                      Pneus: R$ {truck.pneus.toLocaleString()} | Manutenção: R$ {truck.manutencao.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-orange-600">
                    R$ {truck.custo.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🚨 Ocorrências com Impacto Financeiro
            </h3>
            
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">Pneu Estourado</p>
                    <p className="text-sm text-gray-600">ABC-1234 - Há 2 dias</p>
                  </div>
                  <p className="text-lg font-bold text-red-600">R$ 1.520</p>
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">Problema Mecânico</p>
                    <p className="text-sm text-gray-600">DEF-5678 - Há 5 dias</p>
                  </div>
                  <p className="text-lg font-bold text-yellow-600">R$ 2.100</p>
                </div>
              </div>

              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">Lona Rasgada</p>
                    <p className="text-sm text-gray-600">XYZ-9876 - Há 1 semana</p>
                  </div>
                  <p className="text-lg font-bold text-orange-600">R$ 850</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exportar Relatórios */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📄 Exportar Relatórios
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
              <Download className="w-5 h-5 text-primary-600" />
              <span className="font-medium">Relatório de Pneus (PDF)</span>
            </button>

            <button className="flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="font-medium">Custos Gerais (Excel)</span>
            </button>

            <button className="flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Relatório Mensal (PDF)</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardFinanceiro;
