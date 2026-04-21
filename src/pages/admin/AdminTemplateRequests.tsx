import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, MoreVertical, ExternalLink, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function AdminTemplateRequests() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Queries
    const { data: requests, isLoading } = useQuery({
        queryKey: ['admin-template-requests'],
        queryFn: () => api.adminTemplateRequestsApi.getRequests(),
    });

    // State
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');

    // Mutations
    const approveMutation = useMutation({
        mutationFn: ({ id, adminNote }: { id: number, adminNote?: string }) =>
            api.adminTemplateRequestsApi.approve(id, adminNote),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-template-requests'] });
            toast({ title: 'Sucesso', description: 'Template marcado como criado e usuário notificado.' });
            setIsApproveModalOpen(false);
            setAdminNote('');
        },
        onError: (error: any) => {
            toast({ title: 'Erro', description: error.message || 'Falha ao processar.', variant: 'destructive' });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number, reason: string }) =>
            api.adminTemplateRequestsApi.reject(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-template-requests'] });
            toast({ title: 'Sucesso', description: 'Solicitação rejeitada.' });
            setIsRejectModalOpen(false);
            setAdminNote('');
        },
        onError: (error: any) => {
            toast({ title: 'Erro', description: error.message || 'Falha ao rejeitar solicitação.', variant: 'destructive' });
        }
    });

    // Handlers
    const handleOpenApprove = (request: any, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedRequest(request);
        setAdminNote('');
        setIsApproveModalOpen(true);
    };

    const handleOpenReject = (request: any, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedRequest(request);
        setAdminNote('');
        setIsRejectModalOpen(true);
    };

    const handleOpenDetails = (request: any) => {
        setSelectedRequest(request);
        setIsDetailsModalOpen(true);
    };

    const submitApprove = () => {
        if (selectedRequest) {
            approveMutation.mutate({ id: selectedRequest.id, adminNote });
        }
    };

    const submitReject = () => {
        if (selectedRequest && adminNote) {
            rejectMutation.mutate({ id: selectedRequest.id, reason: adminNote });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_payment':
                return <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">Aguardando Pg.</Badge>;
            case 'requested':
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pago - Pendente CRIAÇÃO</Badge>;
            case 'created':
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Criado</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejeitado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    }

    return (
        <AdminLayout
            title="Solicitações de Template de WhatsApp"
            subtitle="Revise e crie os templates solicitados e pagos pelos clientes."
        >
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Visualização</TableHead>
                            <TableHead>Data Solicitação</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : requests?.length ? (
                            requests.map((request: any) => (
                                <TableRow
                                    key={request.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleOpenDetails(request)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{request.user?.firstName} {request.user?.lastName}</span>
                                            <span className="text-xs text-muted-foreground">{request.user?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 max-w-[250px] overflow-hidden whitespace-nowrap text-ellipsis">
                                            <MessageSquare className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <span className="truncate text-xs">{request.content}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(request.status)}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={request.status !== 'requested'}>
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={(e) => handleOpenApprove(request, e)}>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                    Marcar como Criado
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleOpenReject(request, e)} className="text-destructive">
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Rejeitar / Devolver
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    Nenhuma solicitação pendente encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Template Solicitado</DialogTitle>
                        <DialogDescription>
                            Leia com atenção as variáveis solicitadas pelo cliente para a criação na Meta.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Conteúdo Desejado</Label>
                                <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap font-mono relative">
                                    {selectedRequest?.content}
                                </div>
                                <Button 
                                    className="mt-2 text-xs h-7" 
                                    variant="secondary" 
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedRequest?.content);
                                        toast({ title: 'Copiado!' });
                                    }}
                                >
                                    Copiar Texto
                                </Button>
                            </div>
                        </div>

                        {selectedRequest?.adminNote && (
                            <div className="space-y-1 p-3 border border-amber-200 bg-amber-50 rounded-md">
                                <Label className="text-xs text-amber-700">Nota do Administrador</Label>
                                <p className="text-sm text-amber-800">{selectedRequest.adminNote}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Fechar</Button>
                        {selectedRequest?.status === 'requested' && (
                            <div className="flex gap-2">
                                <Button variant="destructive" onClick={(e) => { setIsDetailsModalOpen(false); handleOpenReject(selectedRequest, e); }}>Rejeitar</Button>
                                <Button className="bg-primary" onClick={(e) => { setIsDetailsModalOpen(false); handleOpenApprove(selectedRequest, e); }}>Marcar como Criado</Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Modal */}
            <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aprovar Template</DialogTitle>
                        <DialogDescription>
                            Confirma que você já criou este template na Meta/Twilio e ele está disponível para o usuário?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="adminNoteApprove">Nota para o Usuário (Opcional)</Label>
                            <Textarea
                                id="adminNoteApprove"
                                placeholder="Diga que está disponível, informe o nome exato caso ele mude..."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>Cancelar</Button>
                        <Button 
                            onClick={submitApprove} 
                            disabled={approveMutation.isPending} 
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {approveMutation.isPending ? 'Salvando...' : 'Confirmar Criação'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeitar Solicitação</DialogTitle>
                        <DialogDescription>
                            Informe o motivo do por que este template não pode ser criado (ex: viola política).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Motivo da Rejeição (Obrigatório)</Label>
                            <Textarea
                                id="reason"
                                placeholder="Insira o motivo..."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={submitReject} disabled={rejectMutation.isPending || !adminNote}>
                            {rejectMutation.isPending ? 'Processando...' : 'Rejeitar Solicitação'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
