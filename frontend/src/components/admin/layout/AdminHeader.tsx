import React from "react";
import { Bell, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
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
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 border-b border-gs-gray-100 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden sm:block shrink-0">
              <Logo size="sm" className="!h-12" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gs-black tracking-tight truncate">
                Painel administrativo
              </h1>
              <p className="text-sm text-gs-gray-600 truncate">
                Olá, <span className="font-medium text-gs-black">{userName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 relative shrink-0">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gs-gray-600 hover:bg-gs-gray-100 transition-colors"
              onClick={onToggleNotifications}
              aria-label="Notificações"
              aria-expanded={isNotificationsOpen}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gs-orange-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Fechar notificações"
                  onClick={onToggleNotifications}
                />
                <div className="absolute top-12 right-0 w-[min(20rem,calc(100vw-2rem))] card z-50 max-h-96 overflow-hidden flex flex-col animate-fade-in">
                  <div className="p-3 border-b border-gs-gray-100 flex justify-between items-center bg-gs-gray-50/80">
                    <h3 className="font-semibold text-sm text-gs-black">Notificações</h3>
                    <button
                      type="button"
                      onClick={onMarkAllAsRead}
                      className="text-xs font-medium text-gs-orange-600 hover:text-gs-orange-700"
                    >
                      Marcar todas como lidas
                    </button>
                  </div>
                  <div className="divide-y divide-gs-gray-100 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-gs-gray-500 text-sm">Nenhuma notificação</p>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <button
                          key={notification.userNotificationId}
                          type="button"
                          className={`w-full text-left p-3 hover:bg-gs-orange-50/50 transition-colors ${
                            !notification.read ? "bg-gs-orange-50/80" : ""
                          }`}
                          onClick={() => onMarkAsRead(notification.userNotificationId)}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-medium text-sm text-gs-black">{notification.title}</h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-gs-orange-500 rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-gs-gray-600 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gs-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => void onLogout()}
              className="btn-danger-ghost py-2 px-3 sm:px-4"
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
