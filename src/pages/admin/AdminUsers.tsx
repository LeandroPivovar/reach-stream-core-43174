import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, MoreVertical, Edit, ShieldAlert, CheckCircle, XCircle, CalendarClock, User, BarChart3, CreditCard, Key, ExternalLink, MessageSquare, Mail, Smartphone } from 'lucide-react';
import { api, AdminUser, Plan, AdminUserStats } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    DropdownMenuSeparator,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function AdminUsers() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Queries
    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => api.getAdminUsers(),
    });

    const { data: plans } = useQuery({
        queryKey: ['plans'],
        queryFn: () => api.getPlans(),
    });

    // State
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');

    // Form State
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');

    // --- New Mutations ---
    const resetPasswordMutation = useMutation({
        mutationFn: (userId: number) => api.resetAdminUserPassword(userId),
        onSuccess: (data) => {
            if (data.tempPassword) {
                toast({
                    title: 'Senha Resetada',
                    description: `A nova senha temporária é: ${data.tempPassword}. Copie-a agora pois não será mostrada novamente.`,
                    duration: 10000,
                });
            } else {
                toast({ title: 'Sucesso', description: 'O usuário recebeu um e-mail para definir a nova senha.' });
            }
        },
        onError: () => toast({ title: 'Erro', description: 'Falha ao resetar senha.', variant: 'destructive' })
    });

    const addCreditsMutation = useMutation({
        mutationFn: ({ userId, type, amount }: { userId: number, type: 'email' | 'sms' | 'whatsapp', amount: number }) =>
            api.addAdminUserCredits(userId, type, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-user-stats', selectedUser?.id] });
            toast({ title: 'Sucesso', description: 'Créditos adicionados com sucesso.' });
        },
        onError: () => toast({ title: 'Erro', description: 'Falha ao adicionar créditos.', variant: 'destructive' })
    });

    const impersonateMutation = useMutation({
        mutationFn: (userId: number) => api.impersonateUser(userId),
        onSuccess: (data) => {
            // Save current admin info if needed, but for now just replace token and redirect
            localStorage.setItem('admin_token', localStorage.getItem('token') || '');
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard';
        },
        onError: () => toast({ title: 'Erro', description: 'Falha ao simular login.', variant: 'destructive' })
    });

    // Mutations
    const updateMutation = useMutation({
        mutationFn: (data: Partial<AdminUser>) => {
            if (!selectedUser) throw new Error('No user selected');
            return api.updateAdminUser(selectedUser.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso.' });
            setIsEditModalOpen(false);
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao atualizar o usuário.', variant: 'destructive' });
        }
    });

    const assignPlanMutation = useMutation({
        mutationFn: (planId: number | null) => {
            if (!selectedUser) throw new Error('No user selected');
            return api.assignAdminUserPlan(selectedUser.id, planId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: 'Sucesso', description: 'Plano atribuído com sucesso.' });
            setIsPlanModalOpen(false);
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao atribuir plano.', variant: 'destructive' });
        }
    });

    const expiryMutation = useMutation({
        mutationFn: (date: string) => {
            if (!selectedUser) throw new Error('No user selected');
            return api.setAdminUserSubscriptionExpiry(selectedUser.id, date);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: 'Sucesso', description: 'Vencimento atualizado com sucesso.' });
            setIsExpiryModalOpen(false);
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao atualizar vencimento. O usuário precisa ter um plano ativo.', variant: 'destructive' });
        }
    });

    // --- Details Query ---
    const { data: userStats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['admin-user-stats', selectedUser?.id],
        queryFn: () => api.getAdminUserStats(selectedUser!.id),
        enabled: !!selectedUser && isDetailsModalOpen,
    });

    // Handlers
    const handleOpenDetails = (user: AdminUser) => {
        setSelectedUser(user);
        setIsDetailsModalOpen(true);
    };

    const handleOpenEdit = (user: AdminUser) => {
        setSelectedUser(user);
        setEditForm({ name: user.name, email: user.email, phone: user.phone || '' });
        setIsEditModalOpen(true);
    };

    const handleOpenPlan = (user: AdminUser) => {
        setSelectedUser(user);
        setSelectedPlanId(user.currentPlan ? user.currentPlan.id.toString() : 'none');
        setIsPlanModalOpen(true);
    };

    const handleToggleActive = (user: AdminUser) => {
        setSelectedUser(user);
        updateMutation.mutate({ active: !user.active });
    };

    const submitEdit = () => {
        updateMutation.mutate(editForm);
    };

    const submitPlan = () => {
        if (!selectedPlanId) return;
        const planId = selectedPlanId === 'none' ? null : parseInt(selectedPlanId);
        assignPlanMutation.mutate(planId);
    };
    const handleOpenExpiry = (user: AdminUser) => {
        setSelectedUser(user);
        // Pre-fill with current expiry if available
        const sub = (user as any).currentSubscription;
        if (sub?.currentPeriodEnd) {
            setExpiryDate(new Date(sub.currentPeriodEnd).toISOString().split('T')[0]);
        } else {
            setExpiryDate('');
        }
        setIsExpiryModalOpen(true);
    };

    const submitExpiry = () => {
        if (!expiryDate) return;
        expiryMutation.mutate(expiryDate);
    };


    return (
        <AdminLayout
            title="Administração de Usuários"
            subtitle="Gerencie os usuários cadastrados na plataforma e seus respectivos planos."
        >
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Plano Atual</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.active ? "default" : "destructive"}>
                                        {user.active ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.currentPlan ? (
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                            {user.currentPlan.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Sem plano</span>
                                    )}
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenDetails(user)}>
                                            Detalhes
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenDetails(user)}>
                                                    <UserCog className="mr-2 h-4 w-4" />
                                                    Visão Geral
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar Usuário
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenPlan(user)}>
                                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                                    Atribuir Plano
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenExpiry(user)}>
                                                    <CalendarClock className="mr-2 h-4 w-4" />
                                                    Alterar Vencimento
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                                                    {user.active ? (
                                                        <><XCircle className="mr-2 h-4 w-4 text-destructive" /> Desativar Usuário</>
                                                    ) : (
                                                        <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Ativar Usuário</>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* User Details Modal (Full Screen-ish) */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl">{selectedUser?.name}</DialogTitle>
                                <DialogDescription>{selectedUser?.email}</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {isLoadingStats ? (
                        <div className="py-12 text-center text-muted-foreground">Carregando estatísticas...</div>
                    ) : (
                        <div className="grid gap-6 py-4">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" /> Faturamento Total
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">R$ {userStats?.billingAmount.toFixed(2)}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <UserCog className="h-4 w-4" /> Contatos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{userStats?.contactsCount}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4" /> Campanhas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{userStats?.campaignsCount}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <ShieldAlert className="h-4 w-4" /> Plano Atual
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-lg font-bold truncate">{userStats?.subscription.planName}</div>
                                        <Badge variant={userStats?.subscription.status.toUpperCase() === 'ACTIVE' ? "default" : "secondary"} className="mt-1">
                                            {userStats?.subscription.status}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Usage Volumes */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                                    <Mail className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Emails Enviados (Mês)</p>
                                        <p className="text-xl font-mono">{userStats?.usage.emailsSent}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                                    <Smartphone className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">SMS Enviados (Mês)</p>
                                        <p className="text-xl font-mono">{userStats?.usage.smsSent}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                                    <MessageSquare className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">WhatsApp (Mês)</p>
                                        <p className="text-xl font-mono">{userStats?.usage.whatsappSent}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Section */}
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Ações Administrativas</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-auto flex-col gap-2 py-4 items-start"
                                        onClick={() => handleOpenPlan(selectedUser!)}
                                    >
                                        <ShieldAlert className="h-5 w-5 text-orange-500" />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Alterar Plano</p>
                                            <p className="text-xs text-muted-foreground">Mudar nível de acesso</p>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-auto flex-col gap-2 py-4 items-start"
                                        onClick={() => {
                                            const amount = prompt('Quantidade de créditos a adicionar (Email):', '1000');
                                            if (amount) addCreditsMutation.mutate({ userId: selectedUser!.id, type: 'email', amount: parseInt(amount) });
                                        }}
                                    >
                                        <CreditCard className="h-5 w-5 text-blue-500" />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Adicionar Créditos</p>
                                            <p className="text-xs text-muted-foreground">Email / SMS / WA</p>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-auto flex-col gap-2 py-4 items-start"
                                        onClick={() => {
                                            if (confirm(`Deseja resetar a senha de ${selectedUser?.name}?`)) {
                                                resetPasswordMutation.mutate(selectedUser!.id);
                                            }
                                        }}
                                    >
                                        <Key className="h-5 w-5 text-red-500" />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Resetar Senha</p>
                                            <p className="text-xs text-muted-foreground">Gerar senha temporária</p>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="default"
                                        className="h-auto flex-col gap-2 py-4 items-start bg-primary hover:bg-primary/90"
                                        onClick={() => {
                                            if (confirm(`Simular login como ${selectedUser?.name}? Você será redirecionado.`)) {
                                                impersonateMutation.mutate(selectedUser!.id);
                                            }
                                        }}
                                    >
                                        <ExternalLink className="h-5 w-5" />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Simular Login</p>
                                            <p className="text-xs opacity-80">Entrar como cliente</p>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDetailsModalOpen(false)}>Fechar Painel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Atualize as informações básicas de {selectedUser?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                value={editForm.phone}
                                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                        <Button onClick={submitEdit} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Plan Modal */}
            <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Atribuir Plano</DialogTitle>
                        <DialogDescription>
                            Selecione o plano desejado para o usuário {selectedUser?.name}. Assinaturas anteriores serão canceladas.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Plano de Assinatura</Label>
                            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um plano" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        Nenhum plano (Gratuito)
                                    </SelectItem>
                                    {plans?.map((plan: Plan) => (
                                        <SelectItem key={plan.id} value={plan.id.toString()}>
                                            {plan.name} - R$ {Number(plan.price).toFixed(2)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPlanModalOpen(false)}>Cancelar</Button>
                        <Button onClick={submitPlan} disabled={assignPlanMutation.isPending || !selectedPlanId}>
                            {assignPlanMutation.isPending ? 'Atribuindo...' : 'Atribuir Plano'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Set Expiry Modal */}
            <Dialog open={isExpiryModalOpen} onOpenChange={setIsExpiryModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alterar Vencimento da Assinatura</DialogTitle>
                        <DialogDescription>
                            Defina a data de vencimento da assinatura ativa de <b>{selectedUser?.name}</b>. Use isto para simular assinaturas expiradas.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="expiry_date">Data de Vencimento</Label>
                            <Input
                                id="expiry_date"
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Coloque uma data no passado para simular uma assinatura expirada.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExpiryModalOpen(false)}>Cancelar</Button>
                        <Button onClick={submitExpiry} disabled={expiryMutation.isPending || !expiryDate}>
                            {expiryMutation.isPending ? 'Salvando...' : 'Salvar Vencimento'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AdminLayout>
    );
}
