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
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [creditForm, setCreditForm] = useState({ email: 0, sms: 0 });
    const [showCreditInputs, setShowCreditInputs] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    // --- New Mutations ---
    const resetPasswordMutation = useMutation({
        mutationFn: ({ userId, password }: { userId: number, password: string }) => api.resetAdminUserPassword(userId, password),
        onSuccess: () => {
            toast({ title: 'Sucesso', description: 'Senha alterada com sucesso.' });
            setShowPasswordInput(false);
            setNewPassword('');
        },
        onError: () => toast({ title: 'Erro', description: 'Falha ao resetar senha.', variant: 'destructive' })
    });

    const addCreditsMutation = useMutation({
        mutationFn: ({ userId, type, amount }: { userId: number, type: 'email' | 'sms', amount: number }) =>
            api.addAdminUserCredits(userId, type, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-user-stats', selectedUser?.id] });
            toast({ title: 'Sucesso', description: 'Créditos adicionados com sucesso.' });
        },
        onError: () => toast({ title: 'Erro', description: 'Falha ao adicionar créditos.', variant: 'destructive' })
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
        setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '' });
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
                            <TableHead>Último Login</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
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
                                <TableCell>
                                    {user.lastLoginAt ? (
                                        new Date(user.lastLoginAt).toLocaleString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                    ) : (
                                        <span className="text-muted-foreground italic">Nunca</span>
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
                                <DialogTitle className="text-2xl">{selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Email Usage */}
                                <Card className="bg-muted/10">
                                    <CardHeader className="pb-2 border-b mb-4">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-500">
                                            <Mail className="h-4 w-4" /> EMAILS (MÊS ATUAL)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-muted-foreground">Contratado:</span>
                                            <span className="font-mono text-right">{userStats?.usage.emails.contracted.toLocaleString()}</span>

                                            <span className="text-muted-foreground">Extra:</span>
                                            <span className="font-mono text-right text-green-600">+{userStats?.usage.emails.extra.toLocaleString()}</span>

                                            <div className="col-span-2 border-t pt-2 mt-2 flex justify-between font-bold">
                                                <span>Total:</span>
                                                <span className="font-mono">{userStats?.usage.emails.total.toLocaleString()}</span>
                                            </div>

                                            <span className="text-muted-foreground">Usado:</span>
                                            <span className="font-mono text-right text-red-500">-{userStats?.usage.emails.used.toLocaleString()}</span>
                                        </div>

                                        <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 flex justify-between items-center">
                                            <span className="text-xs font-bold text-blue-700 uppercase">Saldo Disponível</span>
                                            <span className="text-xl font-bold font-mono text-blue-700">{userStats?.usage.emails.available.toLocaleString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* SMS Usage */}
                                <Card className="bg-muted/10">
                                    <CardHeader className="pb-2 border-b mb-4">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-500">
                                            <Smartphone className="h-4 w-4" /> SMS (MÊS ATUAL)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-muted-foreground">Contratado:</span>
                                            <span className="font-mono text-right">{userStats?.usage.sms.contracted.toLocaleString()}</span>

                                            <span className="text-muted-foreground">Extra:</span>
                                            <span className="font-mono text-right text-green-600">+{userStats?.usage.sms.extra.toLocaleString()}</span>

                                            <div className="col-span-2 border-t pt-2 mt-2 flex justify-between font-bold">
                                                <span>Total:</span>
                                                <span className="font-mono">{userStats?.usage.sms.total.toLocaleString()}</span>
                                            </div>

                                            <span className="text-muted-foreground">Usado:</span>
                                            <span className="font-mono text-right text-red-500">-{userStats?.usage.sms.used.toLocaleString()}</span>
                                        </div>

                                        <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20 flex justify-between items-center">
                                            <span className="text-xs font-bold text-green-700 uppercase">Saldo Disponível</span>
                                            <span className="text-xl font-bold font-mono text-green-700">{userStats?.usage.sms.available.toLocaleString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* WhatsApp Usage */}
                                <Card className="bg-muted/10">
                                    <CardHeader className="pb-2 border-b mb-4">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-500">
                                            <MessageSquare className="h-4 w-4" /> WHATSAPP
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-col items-center justify-center py-4 text-center">
                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total de Disparos (Mês)</p>
                                            <p className="text-4xl font-bold font-mono text-purple-600">{userStats?.usage.whatsapp.used.toLocaleString()}</p>

                                            <Badge variant="outline" className="mt-4 bg-purple-50 text-purple-700 border-purple-200">
                                                {userStats?.usage.whatsapp.unlimited ? 'Ilimitado no Plano' : 'Limitado'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
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
                                        onClick={() => setShowCreditInputs(!showCreditInputs)}
                                    >
                                        <CreditCard className="h-5 w-5 text-blue-500" />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Adicionar Créditos</p>
                                            <p className="text-xs text-muted-foreground">Email / SMS extras</p>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-auto flex-col gap-2 py-4 items-start"
                                        onClick={() => setShowPasswordInput(!showPasswordInput)}
                                    >
                                        <Key className="h-5 w-5 text-red-500" />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Resetar Senha</p>
                                            <p className="text-xs text-muted-foreground">Definir nova senha</p>
                                        </div>
                                    </Button>

                                </div>

                                {/* Inline Password Reset */}
                                {showPasswordInput && (
                                    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                                        <h4 className="font-semibold text-sm">Redefinir Senha de {selectedUser?.firstName} {selectedUser?.lastName}</h4>
                                        <div className="flex gap-2">
                                            <Input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Digite a nova senha"
                                            />
                                            <Button
                                                disabled={!newPassword || newPassword.length < 6 || resetPasswordMutation.isPending}
                                                onClick={() => resetPasswordMutation.mutate({ userId: selectedUser!.id, password: newPassword })}
                                            >
                                                {resetPasswordMutation.isPending ? 'Salvando...' : 'Salvar'}
                                            </Button>
                                        </div>
                                        {newPassword && newPassword.length < 6 && (
                                            <p className="text-xs text-destructive">A senha deve ter no mínimo 6 caracteres.</p>
                                        )}
                                    </div>
                                )}

                                {/* Inline Credit Inputs */}
                                {showCreditInputs && (
                                    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border space-y-4">
                                        <h4 className="font-semibold text-sm">Adicionar Créditos Extra</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-500" /> Créditos de Email</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={creditForm.email}
                                                        onChange={(e) => setCreditForm(prev => ({ ...prev, email: parseInt(e.target.value) || 0 }))}
                                                        placeholder="Ex: 1000"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        disabled={!creditForm.email || addCreditsMutation.isPending}
                                                        onClick={() => addCreditsMutation.mutate({ userId: selectedUser!.id, type: 'email', amount: creditForm.email })}
                                                    >
                                                        Adicionar
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-green-500" /> Créditos de SMS</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={creditForm.sms}
                                                        onChange={(e) => setCreditForm(prev => ({ ...prev, sms: parseInt(e.target.value) || 0 }))}
                                                        placeholder="Ex: 500"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        disabled={!creditForm.sms || addCreditsMutation.isPending}
                                                        onClick={() => addCreditsMutation.mutate({ userId: selectedUser!.id, type: 'sms', amount: creditForm.sms })}
                                                    >
                                                        Adicionar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                            Atualize as informações básicas de {selectedUser?.firstName} {selectedUser?.lastName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">Nome</Label>
                                <Input
                                    id="firstName"
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Sobrenome</Label>
                                <Input
                                    id="lastName"
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                />
                            </div>
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
                            Selecione o plano desejado para o usuário {selectedUser?.firstName} {selectedUser?.lastName}. Assinaturas anteriores serão canceladas.
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
                            Defina a data de vencimento da assinatura ativa de <b>{selectedUser?.firstName} {selectedUser?.lastName}</b>. Use isto para simular assinaturas expiradas.
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
