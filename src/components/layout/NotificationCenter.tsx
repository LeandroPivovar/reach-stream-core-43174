import React, { useState } from 'react';
import {
    Bell,
    Check,
    Info,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Notification } from '@/lib/api';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificationCenter() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => api.getNotifications(),
        enabled: open,
    });

    const { data: unreadData } = useQuery({
        queryKey: ['unread-notifications-count'],
        queryFn: () => api.getUnreadNotificationsCount(),
        refetchInterval: 30000, // Refetch a cada 30 segundos
    });

    const markMutation = useMutation({
        mutationFn: (id: number) => api.markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        },
    });

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'error': return <XCircle className="w-4 h-4 text-rose-500" />;
            case 'info': return <Info className="w-4 h-4 text-blue-500" />;
            default: return <Bell className="w-4 h-4 text-slate-500" />;
        }
    };

    const handleRead = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        markMutation.mutate(id);
    };

    const unreadCount = unreadData?.count || 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white ring-2 ring-background">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="text-sm font-semibold">Notificações</h4>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        {unreadCount} não lidas
                    </span>
                </div>
                <ScrollArea className="h-80">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications && notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col gap-1 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer relative",
                                        !notification.read && "bg-primary/5"
                                    )}
                                    onClick={() => {
                                        if (!notification.read) markMutation.mutate(notification.id);
                                        if (notification.link) window.open(notification.link, '_blank');
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {getIcon(notification.type)}
                                            <span className="text-sm font-semibold leading-none">{notification.title}</span>
                                        </div>
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 rounded-full hover:bg-primary/10"
                                                onClick={(e) => handleRead(notification.id, e)}
                                            >
                                                <Check className="w-3 h-3 text-primary" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                                        </span>
                                        {notification.link && (
                                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <p className="text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
                        </div>
                    )}
                </ScrollArea>
                <div className="border-t p-2">
                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setOpen(false)}>
                        Fechar
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
