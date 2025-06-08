import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationToast from '../../../components/common/Notification.tsx'; // Renamed to avoid conflict with Notification type
import ErrorMessage from '../../../components/common/ErrorMessage.tsx';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner.tsx';

// Shadcn/UI Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

// Lucide Icons
import { BellRing, CheckCheck, MailWarning } from 'lucide-react';

// Assume a NotificationService and NotificationType (similar to what useNotifications context might provide)
// This is a placeholder for actual service and type definitions.
// Replace with actual imports if they exist.
interface NotificationType {
    id: string;
    title: string;
    message: string;
    createdAt: string; // ISO date string
    isRead: boolean;
    type?: 'info' | 'warning' | 'error' | 'success'; // Optional type for styling
}

interface PageResponse<T> {
    content: T[];
    number: number;
    totalPages: number;
    size: number;
    totalElements: number;
}

// Mock/Placeholder NotificationService - replace with actual service imports
const NotificationService = {
    getAllNotifications: async ({ page, size }: { page: number, size: number }): Promise<PageResponse<NotificationType>> => {
        // This is a mock. Replace with actual API call.
        console.log(`Fetching notifications: page ${page}, size ${size}`);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Sample data structure
        const sampleNotifications: NotificationType[] = [
            {id: "1", title: "Nova Atualização", message: "O sistema foi atualizado para a versão 2.0.", createdAt: new Date().toISOString(), isRead: false, type: 'info'},
            {id: "2", title: "Pagamento Recebido", message: "Pagamento de R$ 150,00 recebido.", createdAt: new Date(Date.now() - 86400000).toISOString(), isRead: true, type: 'success'},
            {id: "3", title: "Aviso Importante", message: "Manutenção programada para amanhã às 02:00.", createdAt: new Date(Date.now() - 172800000).toISOString(), isRead: false, type: 'warning'},
        ];
        const totalElements = sampleNotifications.length * (page + 3); // Mock more pages
        const totalPages = Math.ceil(totalElements / size);
        return {
            content: sampleNotifications.slice(0, size),
            number: page,
            totalPages: totalPages > 0 ? totalPages : 1,
            size,
            totalElements
        };
    },
    markNotificationAsRead: async (id: string): Promise<void> => {
        console.log(`Marking notification ${id} as read`);
        await new Promise(resolve => setTimeout(resolve, 300));
    },
    markAllNotificationsAsRead: async (): Promise<void> => {
        console.log("Marking all notifications as read");
        await new Promise(resolve => setTimeout(resolve, 300));
    }
};
// End Mock/Placeholder

const NotificationsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const {
        data: notificationsPage,
        isLoading,
        error
    } = useQuery<PageResponse<NotificationType>, Error>({
        queryKey: ['notifications', currentPage, pageSize],
        queryFn: () => NotificationService.getAllNotifications({ page: currentPage, size: pageSize }),
        keepPreviousData: true,
    });

    const markAsReadMutation = useMutation<void, Error, string>({
        mutationFn: NotificationService.markNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] }); // Refetch all notification queries
            // notificationToast('Notificação marcada como lida.', 'success'); // Optional: individual toast
        },
        onError: (err: Error) => notificationToast(`Erro: ${err.message}`, 'error'),
    });

    const markAllAsReadMutation = useMutation<void, Error, void>({
        mutationFn: NotificationService.markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            notificationToast('Todas as notificações foram marcadas como lidas.', 'success');
        },
        onError: (err: Error) => notificationToast(`Erro: ${err.message}`, 'error'),
    });

    const handleMarkAsRead = (id: string) => {
        markAsReadMutation.mutate(id);
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    const unreadCount = notificationsPage?.content?.filter(n => !n.isRead).length || 0;

    if (isLoading && !notificationsPage) return <LoadingSpinner fullScreen message="Carregando notificações..." />;
    if (error) return <ErrorMessage message={`Erro ao carregar notificações: ${error.message}`} title="Erro" />;

    return (
        <div className="p-4 md:p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h1 className="text-2xl font-semibold flex items-center">
                    <BellRing className="mr-2 h-6 w-6 text-primary" />
                    Notificações
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                            {unreadCount}
                        </Badge>
                    )}
                </h1>
                {unreadCount > 0 && notificationsPage && notificationsPage.content.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsReadMutation.isPending}
                    >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        {markAllAsReadMutation.isPending ? "Marcando..." : "Marcar todas como lidas"}
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Suas Notificações</CardTitle>
                    <CardDescription>Lista de todas as suas notificações recebidas.</CardDescription>
                </CardHeader>
                <CardContent>
                    {notificationsPage && notificationsPage.content.length > 0 ? (
                        <div className="space-y-3">
                            {notificationsPage.content.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                                        notification.isRead
                                            ? 'bg-card hover:bg-muted/50'
                                            : 'bg-primary/10 hover:bg-primary/20 border-primary/30'
                                    }`}
                                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && !notification.isRead && handleMarkAsRead(notification.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        {!notification.isRead && <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></div>}
                                        <div className={`flex-shrink-0 mt-0.5 ${notification.isRead ? 'opacity-50' : ''}`}>
                                            {notification.type === 'success' ? <CheckCheck className="h-5 w-5 text-green-500" /> :
                                             notification.type === 'warning' ? <MailWarning className="h-5 w-5 text-yellow-500" /> :
                                             notification.type === 'error' ? <XCircle className="h-5 w-5 text-red-500" /> :
                                             <BellRing className="h-5 w-5 text-blue-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h5 className={`font-semibold text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>{notification.title}</h5>
                                                <small className="text-xs text-muted-foreground">
                                                    {new Date(notification.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </small>
                                            </div>
                                            <p className={`text-sm mt-1 ${notification.isRead ? 'text-muted-foreground/80' : 'text-foreground/90'}`}>{notification.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <BellRing size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                            <h3 className="text-lg font-semibold">Nenhuma notificação</h3>
                            <p className="text-muted-foreground text-sm">Você está atualizado!</p>
                        </div>
                    )}

                    {notificationsPage && notificationsPage.totalPages > 1 && (
                        <Pagination className="mt-6">
                            <PaginationContent>
                                <PaginationItem>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(0)}
                                        disabled={notificationsPage.number === 0 || markAsReadMutation.isPending || markAllAsReadMutation.isPending}
                                    >
                                        Primeira
                                    </Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(0, prev - 1)); }}
                                        className={notificationsPage.number === 0 || markAsReadMutation.isPending || markAllAsReadMutation.isPending ? "pointer-events-none opacity-50" : undefined}
                                    />
                                </PaginationItem>

                                {[...Array(notificationsPage.totalPages).keys()].map(pageIdx => (
                                     <PaginationItem key={pageIdx}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(pageIdx);}}
                                            isActive={currentPage === pageIdx}
                                            className={markAsReadMutation.isPending || markAllAsReadMutation.isPending ? "pointer-events-none opacity-50" : undefined}
                                        >
                                            {pageIdx + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(notificationsPage.totalPages - 1, prev + 1));}}
                                        className={notificationsPage.number === notificationsPage.totalPages - 1 || markAsReadMutation.isPending || markAllAsReadMutation.isPending ? "pointer-events-none opacity-50" : undefined}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                     <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(notificationsPage.totalPages - 1)}
                                        disabled={notificationsPage.number === notificationsPage.totalPages - 1 || markAsReadMutation.isPending || markAllAsReadMutation.isPending}
                                     >
                                        Última
                                     </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationsPage;
