import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, CheckCircle, XCircle, MoreVertical, ExternalLink } from 'lucide-react';
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

export default function AdminEmailRequests() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Queries
    const { data: requests, isLoading } = useQuery({
        queryKey: ['admin-email-requests'],
        queryFn: () => api.getPendingEmailConnections(),
    });

    // State
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Mutations
    const approveMutation = useMutation({
        mutationFn: (id: number) => api.approveEmailConnection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-email-requests'] });
            toast({ title: 'Sucesso', description: 'Conexão de e-mail aprovada com sucesso.' });
            setIsApproveModalOpen(false);
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao aprovar conexão.', variant: 'destructive' });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number, reason: string }) => api.rejectEmailConnection(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-email-requests'] });
            toast({ title: 'Sucesso', description: 'Conexão de e-mail rejeitada.' });
            setIsRejectModalOpen(false);
            setRejectReason('');
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao rejeitar conexão.', variant: 'destructive' });
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
        if (selectedRequest) {
            approveMutation.mutate(selectedRequest.id);
        }
    };

    const submitReject = () => {
        if (selectedRequest && rejectReason) {
            rejectMutation.mutate({ id: selectedRequest.id, reason: rejectReason });
        }
    };

    return (
        <AdminLayout
            title="Solicitações de Domínio de E-mail"
            subtitle="Revise e aprove as solicitações de verificação de domínio de e-mail dos usuários."
        >
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Domínio</TableHead>
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
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            {request.domain}
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
                                                    Aprovar
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Solicitação</DialogTitle>
                        <DialogDescription>
                            Informações completas para a verificação do domínio de e-mail.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Usuário</Label>
                                <p className="text-sm font-medium">{selectedRequest?.user?.firstName} {selectedRequest?.user?.lastName}</p>
                                <p className="text-xs text-muted-foreground">{selectedRequest?.user?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Domínio</Label>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    {selectedRequest?.domain}
                                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm">Registros DNS Gerados</Label>
                            <div className="space-y-4 font-mono text-xs">
                                <div className="p-3 bg-muted rounded-lg border space-y-2">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">TXT Record (SPF)</p>
                                    <code className="block break-all bg-background p-2 rounded border">{selectedRequest?.dnsTxt}</code>
                                </div>
                                <div className="p-3 bg-muted rounded-lg border space-y-2">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">CNAME Record (DKIM)</p>
                                    <code className="block break-all bg-background p-2 rounded border">{selectedRequest?.dnsCname}</code>
                                </div>
                                <div className="p-3 bg-muted rounded-lg border space-y-2">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">MX Record</p>
                                    <code className="block break-all bg-background p-2 rounded border">{selectedRequest?.dnsMx}</code>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-lg">
                            <p className="text-xs text-amber-600">
                                <b>Atenção:</b> Verifique se os registros acima foram propagados antes de aprovar.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Fechar</Button>
                        <div className="flex gap-2">
                            <Button variant="destructive" onClick={(e) => { setIsDetailsModalOpen(false); handleOpenReject(selectedRequest, e); }}>Rejeitar</Button>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={(e) => { setIsDetailsModalOpen(false); handleOpenApprove(selectedRequest, e); }}>Aprovar Agora</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Modal */}
            <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aprovar Domínio</DialogTitle>
                        <DialogDescription>
                            Deseja aprovar a verificação do domínio <b>{selectedRequest?.domain}</b> para o usuário <b>{selectedRequest?.user?.firstName}</b>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                            <p className="text-sm text-slate-500 mb-2">Certifique-se de que o usuário configurou corretamente os registros DNS.</p>
                            <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">TXT: {selectedRequest?.dnsTxt}</div>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">CNAME: {selectedRequest?.dnsCname}</div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>Cancelar</Button>
                        <Button onClick={submitApprove} disabled={approveMutation.isPending} className="bg-green-600 hover:bg-green-700">
                            {approveMutation.isPending ? 'Processando...' : 'Confirmar Aprovação'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeitar Domínio</DialogTitle>
                        <DialogDescription>
                            Informe o motivo da rejeição para o domínio <b>{selectedRequest?.domain}</b>. O usuário será notificado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Motivo da Rejeição</Label>
                            <Textarea
                                id="reason"
                                placeholder="Ex: Registros DNS não encontrados ou incorretos."
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
