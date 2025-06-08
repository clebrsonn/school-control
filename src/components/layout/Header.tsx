import React from 'react';
// import { Badge, Button as BsButton, Container, Dropdown, Navbar } from 'react-bootstrap'; // Replaced
import { Menu as MenuIcon, Bell, Moon, Sun, User as UserIcon, LogOut, Settings } from 'lucide-react'; // Replaced Fa-icons
import { useAuth } from '../../features/auth/contexts/AuthProvider';
import { useNotifications } from '../../features/notifications/contexts/NotificationProvider';
import { useTheme } from '../../hooks/useTheme';
import { Link } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center">
        <Button
            variant="ghost"
            size="icon"
            className="md:hidden" // Only show on small screens
            onClick={toggleSidebar}
            aria-label="Abrir menu lateral"
        >
            <MenuIcon className="h-6 w-6" />
        </Button>
        <Link to="/" className="hidden md:block text-lg font-semibold text-primary ml-2">
            School Control
        </Link>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white" role="status" aria-label={`Você tem ${unreadCount} notificações não lidas`}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel className="flex justify-between items-center px-3 py-2">
                    <span className="font-semibold">Notificações</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-xs"
                            onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                        >
                            Marcar todas como lidas
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <DropdownMenuItem disabled>Não há notificações</DropdownMenuItem>
                ) : (
                    <>
                        {notifications.slice(0, 5).map(notification => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`border-b last:border-b-0 ${!notification.isRead ? 'bg-muted/50' : ''}`}
                                onClick={() => markAsRead(notification.id)}
                                // Prevent dropdown from closing when clicking to mark as read, if desired (might need custom handling)
                            >
                                <div className="flex items-start space-x-2 py-1">
                                    {!notification.isRead ? (
                                        <span className="mt-1 block h-2 w-2 rounded-full bg-primary" />
                                    ) : (
                                        <span className="mt-1 block h-2 w-2 rounded-full bg-gray-400 opacity-50" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground/70">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                         <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/notifications" className="flex justify-center">
                                Ver todas as notificações
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        {/* TODO: Add user avatar image if available */}
                        {/* <AvatarImage src={user?.avatarUrl} alt={user?.name} /> */}
                        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <div className="font-medium">{user?.name || 'Usuário'}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                     <Link to="/settings"> {/* Assuming a settings page */}
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
