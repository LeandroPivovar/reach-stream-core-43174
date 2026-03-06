import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bell,
    Plus,
    Trash2,
    Info,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Megaphone
} from 'lucide-react';
import { api, Notification } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminNotifications() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Queries
    const { data: notifications, isLoading } = useQuery({
        queryKey: ['admin-notifications'],
        queryFn: () => api.getAdminNotifications(),
    });

    // State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Notification>>({
        title: '',
        message: '',
        type: 'system',
        link: '',
        userId: undefined,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: Partial<Notification>) => api.createAdminNotification(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
            toast({ title: 'Sucesso', description: 'Notificação criada com sucesso.' });
            setIsCreateModalOpen(false);
            setFormData({ title: '', message: '', type: 'system', link: '', userId: undefined });
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao criar notificação.', variant: 'destructive' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.deleteAdminNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
            toast({ title: 'Sucesso', description: 'Notificação excluída com sucesso.' });
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao excluir notificação.', variant: 'destructive' });
        }
    });

    // Handlers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            toast({ title: 'Erro', description: 'Título e mensagem são obrigatórios.', variant: 'destructive' });
            return;
        }
        createMutation.mutate(formData);
    };

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'error': return <XCircle className="w-4 h-4 text-rose-500" />;
            case 'info': return <Info className="w-4 h-4 text-blue-500" />;
            default: return <Megaphone className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <AdminLayout
            title="Gerenciamento de Notificações"
            subtitle="Crie alertas e avisos do sistema para os usuários."
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Todas as Notificações</h2>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Notificação
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Destinatário</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notifications?.map((notification) => (
                            <TableRow key={notification.id}>
                                <TableCell>{getTypeIcon(notification.type)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{notification.title}</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">{notification.message}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {notification.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {notification.userId ? (
                                        <Badge variant="secondary">Usuário #{notification.userId}</Badge>
                                    ) : (
                                        <Badge variant="default" className="bg-blue-600">Todos</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {format(new Date(notification.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                        onClick={() => {
                                            if (confirm('Tem certeza que deseja excluir esta notificação?')) {
                                                deleteMutation.mutate(notification.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}

                        {notifications?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                                    Nenhuma notificação encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Notification Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Nova Notificação do Sistema</DialogTitle>
                        <DialogDescription>
                            Esta notificação aparecerá para os usuários selecionados no ícone de sino.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                placeholder="Ex: Manutenção agendada"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">Mensagem</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                                placeholder="Descreva o aviso detalhadamente..."
                                className="h-24"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val: any) => setFormData(p => ({ ...p, type: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="system">Sistema (Padrão)</SelectItem>
                                        <SelectItem value="info">Informação</SelectItem>
                                        <SelectItem value="success">Sucesso</SelectItem>
                                        <SelectItem value="warning">Aviso</SelectItem>
                                        <SelectItem value="error">Erro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="userId">Destinatário (ID Opcional)</Label>
                                <Input
                                    id="userId"
                                    type="number"
                                    value={formData.userId || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, userId: e.target.value ? parseInt(e.target.value) : undefined }))}
                                    placeholder="Vazio = Todos"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="link">Link de Redirecionamento (Opcional)</Label>
                            <Input
                                id="link"
                                value={formData.link}
                                onChange={(e) => setFormData(p => ({ ...p, link: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Criando...' : 'Criar Notificação'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
