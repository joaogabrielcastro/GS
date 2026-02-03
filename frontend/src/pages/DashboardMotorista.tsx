import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  Truck, 
  ClipboardCheck, 
  AlertCircle,
  Camera,
  MapPin,
  Bell
} from 'lucide-react';
import socketService from '@/services/socket';
import toast from 'react-hot-toast';

const DashboardMotorista: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Escutar notificações em tempo real
    socketService.on('newNotification', (data) => {
      toast.success(data.notification.title);
      setNotifications(prev => [data.notification, ...prev]);
    });

    return () => {
      socketService.off('newNotification');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Olá, {user?.name}! 👋
              </h1>
              <p className="text-sm text-gray-600">Perfil: Motorista</p>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Ação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Checklist Diário */}
          <div className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary-200">
            <div className="flex items-start gap-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <ClipboardCheck className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Checklist Diário
                </h3>
                <p className="text-gray-600 mb-4">
                  Preencha o checklist do seu caminhão com fotos da cabine, pneus e lona.
                </p>
                <button className="btn btn-primary">
                  Iniciar Checklist
                </button>
              </div>
            </div>
          </div>

          {/* Registrar Ocorrência */}
          <div className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-200">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Registrar Ocorrência
                </h3>
                <p className="text-gray-600 mb-4">
                  Reporte problemas como pneu estourado, problema mecânico, etc.
                </p>
                <button className="btn btn-danger">
                  Nova Ocorrência
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Guia Rápido */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📋 Guia Rápido - Como Usar
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2 mt-1">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">1. Checklist Diário</h4>
                <p className="text-gray-600 text-sm">
                  Todo dia, tire fotos da cabine, dos pneus e da lona. Adicione observações se necessário.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-red-100 text-red-600 rounded-full p-2 mt-1">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">2. Reportar Problemas</h4>
                <p className="text-gray-600 text-sm">
                  Ao identificar qualquer problema, registre imediatamente com fotos. O administrador e financeiro serão notificados.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-600 rounded-full p-2 mt-1">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">3. Localização Automática</h4>
                <p className="text-gray-600 text-sm">
                  Sua localização é registrada automaticamente para rastreamento e segurança.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-100 text-purple-600 rounded-full p-2 mt-1">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">4. Seu Caminhão</h4>
                <p className="text-gray-600 text-sm">
                  Você está vinculado a um caminhão específico. Todos os registros ficam no histórico.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico Recente */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📊 Seu Histórico Recente
          </h3>
          
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum registro ainda hoje.</p>
            <p className="text-sm mt-2">Comece preenchendo o checklist diário!</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardMotorista;
