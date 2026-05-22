import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, MoreVertical, Edit, ShieldAlert, CheckCircle, XCircle, CalendarClock, User, BarChart3, CreditCard, Key, ExternalLink, MessageSquare, Mail, Smartphone, TrendingUp, Link as LinkIcon, FlaskConical, Users, Megaphone, ShoppingCart, BadgeDollarSign, Copy, CheckCheck } from 'lucide-react';
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

    const [planFilter, setPlanFilter] = useState<string>('all');

    // Queries
    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users', planFilter],
        queryFn: () => api.getAdminUsers(planFilter !== 'all' ? parseInt(planFilter) : undefined),
    });

    const { data: plans } = useQuery({
        queryKey: ['admin-plans'],
        queryFn: () => api.getAdminPlans(),
    });

    // State
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
    const [emailConfirm, setEmailConfirm] = useState('');

    // Form State
    const [editForm, setEditForm] = useState({ 
        firstName: '', lastName: '', email: '', phone: '', role: 'user', 
        twilioWhatsappFrom: '', twilioAccountSid: '', twilioAuthToken: '' 
    });
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [creditForm, setCreditForm] = useState({ email: 0, sms: 0, whatsapp: 0 });
    const [showCreditInputs, setShowCreditInputs] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    // --- Test Account State ---
    const [isTestAccountModalOpen, setIsTestAccountModalOpen] = useState(false);
    const [testAccountLevel, setTestAccountLevel] = useState<'low' | 'medium' | 'high'>('low');
    const [testAccountResult, setTestAccountResult] = useState<null | {
        userId: number; email: string; password: string; firstName: string; lastName: string; level: string;
        summary: { contacts: number; campaigns: number; products: number; sales: number; estimatedRevenue: number; };
    }>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isImpersonateModalOpen, setIsImpersonateModalOpen] = useState(false);
    const [impersonateUrl, setImpersonateUrl] = useState('');
    const [impersonateUser, setImpersonateUser] = useState<AdminUser | null>(null);

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

    const generateTestAccountMutation = useMutation({
        mutationFn: (level: 'low' | 'medium' | 'high') => api.generateTestAccount(level),
        onSuccess: (data) => {
            setTestAccountResult(data);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: '✅ Conta Gerada!', description: `Conta ${data.email} criada com sucesso.` });
        },
        onError: (err: any) => toast({ title: 'Erro', description: err.message || 'Falha ao gerar conta.', variant: 'destructive' })
    });

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const addCreditsMutation = useMutation({
        mutationFn: ({ userId, type, amount }: { userId: number, type: 'email' | 'sms' | 'whatsapp', amount: number }) =>
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

    const impersonateMutation = useMutation({
        mutationFn: ({ userId }: { userId: number, user: AdminUser }) => api.impersonateAdminUser(userId),
        onSuccess: (data, variables) => {
            const url = `${window.location.origin}/impersonate?t=${data.token}&u=${btoa(JSON.stringify(data.user))}`;
            setImpersonateUrl(url);
            setImpersonateUser(variables.user);
            setIsImpersonateModalOpen(true);

            // Tenta copiar para a área de transferência
            navigator.clipboard.writeText(url).then(() => {
                toast({
                    title: 'Link Gerado!',
                    description: 'O link de acesso remoto foi copiado para sua área de transferência.'
                });
            }).catch(() => {
                toast({
                    title: 'Link Gerado!',
                    description: 'Não foi possível copiar automaticamente. Use o modal para copiar manualmente.',
                    variant: 'default'
                });
            });
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao gerar o link de impersonate.', variant: 'destructive' });
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId: number) => api.deleteAdminUser(userId),
        onSuccess: () => {
            toast({ title: 'Sucesso', description: 'Usuário excluído permanentemente do banco de dados.' });
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            setEmailConfirm('');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (err: any) => {
            toast({ title: 'Erro', description: err.message || 'Falha ao excluir o usuário.', variant: 'destructive' });
        }
    });

    // --- Details Query ---
    const { data: userStats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['admin-user-stats', selectedUser?.id],
        queryFn: () => api.getAdminUserStats(selectedUser!.id),
        enabled: !!selectedUser && isDetailsModalOpen,
    });

    // Handlers
    const handleOpenDelete = (user: AdminUser) => {
        setUserToDelete(user);
        setEmailConfirm('');
        setIsDeleteModalOpen(true);
    };

    const handleOpenDetails = (user: AdminUser) => {
        setSelectedUser(user);
        setIsDetailsModalOpen(true);
    };

    const handleOpenEdit = (user: AdminUser) => {
        setSelectedUser(user);
        setEditForm({ 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email, 
            phone: user.phone || '',
            role: user.role || 'user',
            twilioWhatsappFrom: user.twilioWhatsappFrom || '',
            twilioAccountSid: user.twilioAccountSid || '',
            twilioAuthToken: user.twilioAuthToken || ''
        });
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
            <div className="flex justify-between items-center mb-4">
                <div className="w-64">
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Filtrar por Plano" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Planos</SelectItem>
                            {plans?.map((plan: any) => (
                                <SelectItem key={plan.id} value={plan.id.toString()}>
                                    {plan.name} {!plan.visible && '(Invisível)'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    onClick={() => { setTestAccountResult(null); setIsTestAccountModalOpen(true); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md"
                >
                    <FlaskConical className="h-4 w-4" />
                    Gerar Conta Teste
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Template ID</TableHead>
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
                                    <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-100">
                                        {user.templateId || '---'}
                                    </Badge>
                                </TableCell>
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
                                                <DropdownMenuItem onClick={() => impersonateMutation.mutate({ userId: user.id, user })}>
                                                    <LinkIcon className="mr-2 h-4 w-4" />
                                                    Gerar Link de Acesso
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                                                    {user.active ? (
                                                        <><XCircle className="mr-2 h-4 w-4 text-destructive" /> Desativar Usuário</>
                                                    ) : (
                                                        <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Ativar Usuário</>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 font-semibold"
                                                    onClick={() => handleOpenDelete(user)}
                                                >
                                                    <XCircle className="mr-2 h-4 w-4 text-rose-600" />
                                                    Excluir Conta (Definitivo)
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
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Template ID:</span>
                                    <Badge variant="outline" className="font-mono text-xs bg-muted/50 border-border">
                                        {selectedUser?.templateId || '---'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    {isLoadingStats ? (
                        <div className="py-12 text-center text-muted-foreground">Carregando estatísticas...</div>
                    ) : (
                        <div className="grid gap-6 py-4">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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
                                <Card className="bg-green-50/50 border-green-100">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" /> Lucro Gerado
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-700">R$ {userStats?.lifetimeProfit.toFixed(2)}</div>
                                        <p className="text-[10px] text-green-600/70 font-medium italic">Faturamento - Custos Ops.</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-primary-50/30 border-primary-100">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" /> Total em Planos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-primary">R$ {(userStats?.subscription?.totalPaidPlanAmount || 0).toFixed(2)}</div>
                                        <p className="text-[10px] text-primary/70 font-medium italic">Faturamento Assinaturas</p>
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
                                            <MessageSquare className="h-4 w-4" /> WHATSAPP (MÊS ATUAL)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-muted-foreground">Contratado:</span>
                                            <span className="font-mono text-right">
                                                {userStats?.usage.whatsapp.unlimited ? 'Ilimitado' : userStats?.usage.whatsapp.contracted?.toLocaleString()}
                                            </span>

                                            <span className="text-muted-foreground">Extra:</span>
                                            <span className="font-mono text-right text-green-600">
                                                +{userStats?.usage.whatsapp.extra?.toLocaleString()}
                                            </span>

                                            <div className="col-span-2 border-t pt-2 mt-2 flex justify-between font-bold">
                                                <span>Total:</span>
                                                <span className="font-mono">
                                                    {userStats?.usage.whatsapp.unlimited ? 'Ilimitado' : userStats?.usage.whatsapp.total?.toLocaleString()}
                                                </span>
                                            </div>

                                            <span className="text-muted-foreground">Usado:</span>
                                            <span className="font-mono text-right text-red-500">
                                                -{userStats?.usage.whatsapp.used?.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 flex justify-between items-center">
                                            <span className="text-xs font-bold text-purple-700 uppercase">Saldo Disponível</span>
                                            <span className="text-xl font-bold font-mono text-purple-700">
                                                {userStats?.usage.whatsapp.unlimited ? 'Ilimitado' : userStats?.usage.whatsapp.available?.toLocaleString()}
                                            </span>
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
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-purple-500" /> Créditos de WhatsApp</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={creditForm.whatsapp}
                                                        onChange={(e) => setCreditForm(prev => ({ ...prev, whatsapp: parseInt(e.target.value) || 0 }))}
                                                        placeholder="Ex: 500"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        disabled={!creditForm.whatsapp || addCreditsMutation.isPending}
                                                        onClick={() => addCreditsMutation.mutate({ userId: selectedUser!.id, type: 'whatsapp', amount: creditForm.whatsapp })}
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
                        <div className="grid gap-2">
                            <Label htmlFor="role">Função (Role)</Label>
                            <Select 
                                value={editForm.role} 
                                onValueChange={(val) => setEditForm(prev => ({ ...prev, role: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a função" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Usuário Comum</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2 border-t pt-4 mt-2">
                            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> Configuração Twilio WhatsApp (Subconta)
                            </h4>
                            <div className="grid gap-2">
                                <Label htmlFor="twilioWhatsappFrom">Número de WhatsApp (ex: +14155238886)</Label>
                                <Input
                                    id="twilioWhatsappFrom"
                                    value={editForm.twilioWhatsappFrom}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, twilioWhatsappFrom: e.target.value }))}
                                    placeholder="Número para envios"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="twilioAccountSid">Account SID</Label>
                                    <Input
                                        id="twilioAccountSid"
                                        value={editForm.twilioAccountSid}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, twilioAccountSid: e.target.value }))}
                                        placeholder="AC..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="twilioAuthToken">Auth Token</Label>
                                    <Input
                                        id="twilioAuthToken"
                                        type="password"
                                        value={editForm.twilioAuthToken}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, twilioAuthToken: e.target.value }))}
                                        placeholder="Token da subconta"
                                    />
                                </div>
                            </div>
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
                                            {plan.name} - R$ {Number(plan.price).toFixed(2)} {!plan.visible && '(Invisível)'}
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

            {/* ── Generate Test Account Modal ───────────────────────────────── */}
            <Dialog open={isTestAccountModalOpen} onOpenChange={(open) => { setIsTestAccountModalOpen(open); if (!open) setTestAccountResult(null); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                                <FlaskConical className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Gerar Conta de Demonstração</DialogTitle>
                                <DialogDescription>Cria uma conta com dados fake realistas para testes e demos.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {!testAccountResult ? (
                        <div className="space-y-6 py-4">
                            {/* Level selector */}
                            <div>
                                <Label className="text-sm font-semibold mb-3 block">Selecione o Volume de Dados</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* LOW */}
                                    <button
                                        onClick={() => setTestAccountLevel('low')}
                                        className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                                            testAccountLevel === 'low'
                                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                                                : 'border-border hover:border-violet-300 bg-card'
                                        }`}
                                    >
                                        {testAccountLevel === 'low' && (
                                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-500" />
                                        )}
                                        <div className="text-2xl mb-2">🟢</div>
                                        <p className="font-bold text-sm">Baixo</p>
                                        <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                                            <div>50 contatos</div>
                                            <div>3 campanhas</div>
                                            <div>30 vendas</div>
                                            <div className="font-semibold text-green-600 mt-1">~R$ 5k–20k</div>
                                        </div>
                                    </button>

                                    {/* MEDIUM */}
                                    <button
                                        onClick={() => setTestAccountLevel('medium')}
                                        className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                                            testAccountLevel === 'medium'
                                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                                                : 'border-border hover:border-violet-300 bg-card'
                                        }`}
                                    >
                                        {testAccountLevel === 'medium' && (
                                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-500" />
                                        )}
                                        <div className="text-2xl mb-2">🟡</div>
                                        <p className="font-bold text-sm">Médio</p>
                                        <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                                            <div>300 contatos</div>
                                            <div>10 campanhas</div>
                                            <div>200 vendas</div>
                                            <div className="font-semibold text-yellow-600 mt-1">~R$ 50k–150k</div>
                                        </div>
                                    </button>

                                    {/* HIGH */}
                                    <button
                                        onClick={() => setTestAccountLevel('high')}
                                        className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                                            testAccountLevel === 'high'
                                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                                                : 'border-border hover:border-violet-300 bg-card'
                                        }`}
                                    >
                                        {testAccountLevel === 'high' && (
                                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-500" />
                                        )}
                                        <div className="text-2xl mb-2">🔴</div>
                                        <p className="font-bold text-sm">Alto</p>
                                        <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                                            <div>1.000 contatos</div>
                                            <div>30 campanhas</div>
                                            <div>1.000 vendas</div>
                                            <div className="font-semibold text-red-600 mt-1">~R$ 300k–1M</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
                                ⚠️ <strong>Atenção:</strong> Níveis Alto podem levar alguns segundos para gerar todos os dados. Aguarde a confirmação.
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsTestAccountModalOpen(false)}>Cancelar</Button>
                                <Button
                                    onClick={() => generateTestAccountMutation.mutate(testAccountLevel)}
                                    disabled={generateTestAccountMutation.isPending}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white min-w-[160px]"
                                >
                                    {generateTestAccountMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Gerando dados...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Gerar Conta</span>
                                    )}
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        /* Result panel */
                        <div className="space-y-5 py-4">
                            <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-bold text-green-700 dark:text-green-400">Conta criada com sucesso!</span>
                                    <Badge variant="outline" className="ml-auto bg-green-100 text-green-700 border-green-300 capitalize">
                                        Nível {testAccountResult.level === 'low' ? 'Baixo' : testAccountResult.level === 'medium' ? 'Médio' : 'Alto'}
                                    </Badge>
                                </div>

                                {/* Credentials */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Email</p>
                                            <p className="font-mono text-sm">{testAccountResult.email}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleCopy(testAccountResult.email, 'email')}>
                                            {copiedField === 'email' ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Senha</p>
                                            <p className="font-mono text-sm tracking-widest">{testAccountResult.password}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleCopy(testAccountResult.password, 'password')}>
                                            {copiedField === 'password' ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Data summary */}
                            <div>
                                <p className="text-sm font-semibold mb-3">📊 Dados Gerados</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-lg border bg-card p-3 text-center">
                                        <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                        <p className="text-2xl font-bold">{testAccountResult.summary.contacts.toLocaleString('pt-BR')}</p>
                                        <p className="text-xs text-muted-foreground">Contatos</p>
                                    </div>
                                    <div className="rounded-lg border bg-card p-3 text-center">
                                        <Megaphone className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                                        <p className="text-2xl font-bold">{testAccountResult.summary.campaigns}</p>
                                        <p className="text-xs text-muted-foreground">Campanhas</p>
                                    </div>
                                    <div className="rounded-lg border bg-card p-3 text-center">
                                        <ShoppingCart className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                                        <p className="text-2xl font-bold">{testAccountResult.summary.sales.toLocaleString('pt-BR')}</p>
                                        <p className="text-xs text-muted-foreground">Vendas</p>
                                    </div>
                                    <div className="rounded-lg border bg-card p-3 text-center">
                                        <BadgeDollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" />
                                        <p className="text-lg font-bold text-green-600">
                                            {testAccountResult.summary.estimatedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Faturamento</p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => { setTestAccountResult(null); }}>
                                    Gerar Outra Conta
                                </Button>
                                <Button onClick={() => setIsTestAccountModalOpen(false)} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                                    Fechar
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Impersonate Access Link Modal */}
            <Dialog open={isImpersonateModalOpen} onOpenChange={setIsImpersonateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                <LinkIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Link de Acesso Gerado</DialogTitle>
                                <DialogDescription>Use o link abaixo para fazer login na conta de <strong>{impersonateUser?.firstName} {impersonateUser?.lastName}</strong>.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-border p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Input 
                                    value={impersonateUrl} 
                                    readOnly 
                                    className="font-mono text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex-1 min-w-0" 
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                />
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="shrink-0 h-9 w-9 flex items-center justify-center" 
                                    onClick={() => handleCopy(impersonateUrl, 'impersonate')}
                                >
                                    {copiedField === 'impersonate' ? (
                                        <CheckCheck className="h-4 w-4 text-green-500 animate-bounce" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    type="button"
                                    className="flex-1 text-xs py-2 h-auto flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => handleCopy(impersonateUrl, 'impersonate')}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    Copiar Link manual
                                </Button>
                                <Button 
                                    asChild
                                    className="flex-1 text-xs py-2 h-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
                                >
                                    <a href={impersonateUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Acessar Conta
                                    </a>
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
                            💡 <strong>Dica:</strong> Para maior segurança, utilize uma janela anônima para acessar o link de forma isolada sem perder a sua sessão administrativa atual.
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsImpersonateModalOpen(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 text-rose-600">
                            <ShieldAlert className="h-6 w-6 text-rose-600 animate-pulse" />
                            <DialogTitle className="text-xl font-bold">Excluir Conta Permanentemente</DialogTitle>
                        </div>
                        <DialogDescription className="pt-2 text-sm text-muted-foreground leading-relaxed">
                            Esta ação é <strong className="text-rose-600">irreversível</strong> e apagará permanentemente a conta de{' '}
                            <span className="font-bold text-slate-800">{userToDelete?.firstName} {userToDelete?.lastName}</span> ({userToDelete?.email}), incluindo todas as suas campanhas, contatos, integrações e vendas vinculadas de forma definitiva do banco de dados.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="confirm-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Confirme digitando o e-mail do usuário:
                            </Label>
                            <Input
                                id="confirm-email"
                                type="email"
                                placeholder={userToDelete?.email}
                                value={emailConfirm}
                                onChange={(e) => setEmailConfirm(e.target.value)}
                                className="font-mono text-sm border-rose-200 focus-visible:ring-rose-500"
                            />
                        </div>

                        {emailConfirm === userToDelete?.email ? (
                            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 leading-relaxed font-semibold">
                                ⚠️ O e-mail confere. Clique no botão abaixo para excluir permanentemente.
                            </div>
                        ) : emailConfirm.length > 0 ? (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed font-semibold">
                                ❌ O e-mail digitado não corresponde ao e-mail do usuário.
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={emailConfirm !== userToDelete?.email || deleteUserMutation.isPending}
                            onClick={() => deleteUserMutation.mutate(userToDelete!.id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white min-w-[120px]"
                        >
                            {deleteUserMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AdminLayout >
    );
}
