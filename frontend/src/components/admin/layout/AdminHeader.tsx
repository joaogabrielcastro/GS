import React from "react";
import { Bell, LogOut } from "lucide-react";
import type { AdminNotification } from "@/types";

interface AdminHeaderProps {
  userName?: string;
  notifications: AdminNotification[];
  isNotificationsOpen: boolean;
  onToggleNotifications: () => void;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onLogout: () => Promise<void>;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  userName,
  notifications,
  isNotificationsOpen,
  onToggleNotifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onLogout,
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-sm text-gray-600">Olá, {userName}</p>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative"
              onClick={onToggleNotifications}
            >
              <Bell className="w-6 h-6" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-sm">Notificações</h3>
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-gray-500 text-sm">Nenhuma notificação</p>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.userNotificationId}
                        className={`p-3 hover:bg-gray-50 transition-colors ${!notification.read ? "bg-blue-50" : ""} cursor-pointer`}
                        onClick={() => onMarkAsRead(notification.userNotificationId)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => void onLogout()}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
