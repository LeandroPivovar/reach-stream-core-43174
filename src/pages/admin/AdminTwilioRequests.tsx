import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, MoreVertical, ExternalLink, Phone, Hash, Key } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function AdminTwilioRequests() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Queries
    const { data: requests, isLoading } = useQuery({
        queryKey: ['admin-twilio-requests'],
        queryFn: () => api.twilioConnectionsApi.getAdminPending(),
    });

    // State
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    
    const [credentials, setCredentials] = useState({
        accountSid: '',
        authToken: '',
        whatsappFrom: '',
    });

    // Mutations
    const approveMutation = useMutation({
        mutationFn: ({ id, credentials }: { id: number, credentials: { accountSid: string, authToken: string, whatsappFrom: string } }) => 
            api.twilioConnectionsApi.approve(id, credentials),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-twilio-requests'] });
            toast({ title: 'Sucesso', description: 'Número próprio aprovado com sucesso.' });
            setIsApproveModalOpen(false);
            setCredentials({ accountSid: '', authToken: '', whatsappFrom: '' });
        },
        onError: (error: any) => {
            toast({ title: 'Erro', description: error.message || 'Falha ao aprovar número.', variant: 'destructive' });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number, reason: string }) => 
            api.twilioConnectionsApi.reject(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-twilio-requests'] });
            toast({ title: 'Sucesso', description: 'Solicitação rejeitada.' });
            setIsRejectModalOpen(false);
            setRejectReason('');
        },
        onError: (error: any) => {
            toast({ title: 'Erro', description: error.message || 'Falha ao rejeitar solicitação.', variant: 'destructive' });
        }
    });

    // Handlers
    const handleOpenApprove = (request: any, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedRequest(request);
        setIsApproveModalOpen(true);
    };

    const handleOpenReject = (request: any, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedRequest(request);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const handleOpenDetails = (request: any) => {
        setSelectedRequest(request);
        setIsDetailsModalOpen(true);
    };

    const submitApprove = () => {
        if (selectedRequest && credentials.accountSid && credentials.authToken && credentials.whatsappFrom) {
            approveMutation.mutate({ id: selectedRequest.id, credentials });
        }
    };

    const submitReject = () => {
        if (selectedRequest && rejectReason) {
            rejectMutation.mutate({ id: selectedRequest.id, reason: rejectReason });
        }
    };

    return (
        <AdminLayout
            title="Solicitações de Número Próprio (Twilio)"
            subtitle="Revise e configure as solicitações de uso de número próprio via Twilio."
        >
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Nome Amigável</TableHead>
                            <TableHead>Número Solicitado</TableHead>
                            <TableHead>Data Solicitação</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
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
                                    <TableCell>{request.friendlyName || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                            {request.whatsappFrom || (
                                                <span className="text-amber-500 text-xs italic font-medium">Número a definir</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                            Pendente
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={(e) => handleOpenApprove(request, e)}>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                    Configurar e Aprovar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleOpenReject(request, e)} className="text-destructive">
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Rejeitar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
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
                        <DialogTitle>Detalhes da Solicitação</DialogTitle>
                        <DialogDescription>
                            Informações sobre o pedido de número próprio.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Usuário</Label>
                                <p className="text-sm font-medium">{selectedRequest?.user?.firstName} {selectedRequest?.user?.lastName}</p>
                                <p className="text-xs text-muted-foreground">{selectedRequest?.user?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Número</Label>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    {selectedRequest?.whatsappFrom || <span className="text-amber-500 italic">Número a definir</span>}
                                </p>
                            </div>
                        </div>

                        {selectedRequest?.friendlyName && (
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Identificação</Label>
                                <p className="text-sm">{selectedRequest.friendlyName}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Fechar</Button>
                        <div className="flex gap-2">
                            <Button variant="destructive" onClick={(e) => { setIsDetailsModalOpen(false); handleOpenReject(selectedRequest, e); }}>Rejeitar</Button>
                            <Button className="bg-primary" onClick={(e) => { setIsDetailsModalOpen(false); handleOpenApprove(selectedRequest, e); }}>Ativar Número</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Modal */}
            <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configurar e Aprovar Número</DialogTitle>
                        <DialogDescription>
                            Configure os detalhes finais da subconta Twilio para o usuário.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="whatsappFrom">Número de WhatsApp (E.164)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="whatsappFrom"
                                    placeholder="+5511999998888"
                                    className="pl-9"
                                    value={credentials.whatsappFrom}
                                    onChange={(e) => setCredentials({ ...credentials, whatsappFrom: e.target.value })}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Informe o número exatamente como cadastrado na Twilio.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountSid">Account SID</Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="accountSid"
                                    placeholder="AC..."
                                    className="pl-9"
                                    value={credentials.accountSid}
                                    onChange={(e) => setCredentials({ ...credentials, accountSid: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="authToken">Auth Token</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="authToken"
                                    type="password"
                                    placeholder="Auth Token"
                                    className="pl-9"
                                    value={credentials.authToken}
                                    onChange={(e) => setCredentials({ ...credentials, authToken: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>Cancelar</Button>
                        <Button 
                            onClick={submitApprove} 
                            disabled={approveMutation.isPending || !credentials.accountSid || !credentials.authToken || !credentials.whatsappFrom} 
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {approveMutation.isPending ? 'Salvando...' : 'Confirmar e Ativar'}
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
                            Informe o motivo da rejeição. O usuário poderá ver esta nota.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Motivo da Rejeição</Label>
                            <Textarea
                                id="reason"
                                placeholder="Ex: Número inválido ou não suportado."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={submitReject} disabled={rejectMutation.isPending || !rejectReason}>
                            {rejectMutation.isPending ? 'Processando...' : 'Rejeitar Solicitação'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
