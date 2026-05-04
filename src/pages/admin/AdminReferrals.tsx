import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
    Users,
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle2,
    Search,
    Filter,
    Download,
    Settings,
    Award,
    MoreHorizontal,
    Plus,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminReferrals() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [commissions, setCommissions] = useState<any[]>([]);
    const [ranking, setRanking] = useState<any[]>([]);
    const [config, setConfig] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, referralsRes, rankingRes, configRes] = await Promise.all([
                api.referralsAdminApi.getStats(),
                api.referralsAdminApi.getList(),
                api.referralsAdminApi.getRanking(),
                api.referralsAdminApi.getRewardsConfig()
            ]);

            setStats(statsRes);
            setReferrals(referralsRes);
            setRanking(rankingRes);
            setConfig(configRes);

            // Fetch commissions separately as they might be many
            const commissionsRes = await api.referralsAdminApi.getCommissions();
            setCommissions(commissionsRes);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            toast({
                title: "Erro ao carregar dados",
                description: "Não foi possível carregar as informações de indicações.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateReferralStatus = async (id: number, status: string) => {
        try {
            await api.referralsAdminApi.updateStatus(id, status);
            toast({
                title: "Status atualizado",
                description: "O status da indicação foi atualizado com sucesso."
            });
            fetchData();
        } catch (error) {
            toast({
                title: "Erro ao atualizar",
                description: "Não foi possível atualizar o status.",
                variant: "destructive"
            });
        }
    };

    const handleUpdateCommissionStatus = async (id: number, status: string) => {
        try {
            await api.referralsAdminApi.updateCommissionStatus(id, status);
            toast({
                title: "Comissão atualizada",
                description: `Comissão marcada como ${status === 'paid' ? 'paga' : status}.`
            });
            fetchData();
        } catch (error) {
            toast({
                title: "Erro ao atualizar",
                description: "Não foi possível atualizar a comissão.",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            received: { label: 'Recebida', variant: 'secondary' },
            contacted: { label: 'Contato realizado', variant: 'outline' },
            meeting_scheduled: { label: 'Reunião marcada', variant: 'outline' },
            negotiating: { label: 'Em negociação', variant: 'outline' },
            converted: { label: 'Convertido', variant: 'default' },
            not_converted: { label: 'Não convertido', variant: 'destructive' },
            pending: { label: 'Pendente', variant: 'secondary' },
            approved: { label: 'Aprovada', variant: 'default' },
            paid: { label: 'Paga', variant: 'default' },
        };

        const style = styles[status] || { label: status, variant: 'secondary' };
        return <Badge variant={style.variant}>{style.label}</Badge>;
    };

    const filteredReferrals = referrals.filter(ref => {
        const matchesSearch = 
            ref.referredName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ref.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ref.referrerName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout title="Módulo de Indicações" subtitle="Gerencie parceiros e comissões do programa">
            <div className="space-y-6">
                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Card className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <Users className="w-4 h-4 text-primary" />
                                <Badge variant="secondary">Total</Badge>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                                <p className="text-xs text-muted-foreground">Indicações recebidas</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <Badge variant="secondary" className="bg-green-500/10 text-green-500">Sucesso</Badge>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.convertedReferrals}</p>
                                <p className="text-xs text-muted-foreground">Clientes fechados</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">Taxa</Badge>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{Number(stats.conversionRate || 0).toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">De conversão</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Receita</Badge>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">R$ {stats.revenueGenerated.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Gerada por indicações</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">Pendente</Badge>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">R$ {stats.pendingCommissions.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Comissões a pagar</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <DollarSign className="w-4 h-4 text-purple-500" />
                                <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">Pago</Badge>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">R$ {stats.paidCommissions.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Comissões pagas</p>
                            </div>
                        </Card>
                    </div>
                )}

                <Tabs defaultValue="referrals" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                        <TabsTrigger value="referrals">Indicações</TabsTrigger>
                        <TabsTrigger value="financial">Financeiro</TabsTrigger>
                        <TabsTrigger value="config">Regras</TabsTrigger>
                        <TabsTrigger value="ranking">Ranking</TabsTrigger>
                    </TabsList>

                    <TabsContent value="referrals" className="space-y-4 mt-6">
                        <Card className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-2 flex-1 max-w-sm">
                                    <div className="relative w-full">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nome ou e-mail..."
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <Filter className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os Status</SelectItem>
                                            <SelectItem value="received">Recebida</SelectItem>
                                            <SelectItem value="contacted">Contatada</SelectItem>
                                            <SelectItem value="converted">Convertida</SelectItem>
                                            <SelectItem value="not_converted">Não Convertida</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" onClick={fetchData}>
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    </Button>
                                    <Button variant="outline">
                                        <Download className="w-4 h-4 mr-2" />
                                        Exportar
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Indicador</TableHead>
                                            <TableHead>Indicado</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Comissão</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredReferrals.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    Nenhuma indicação encontrada.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredReferrals.map((ref) => (
                                                <TableRow key={ref.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{ref.referrerName}</div>
                                                        <div className="text-xs text-muted-foreground">{ref.referrerCompany}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{ref.referredName || ref.email}</div>
                                                        <div className="text-xs text-muted-foreground">{ref.phone}</div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {format(new Date(ref.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(ref.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">R$ {Number(ref.commissionGenerated || 0).toFixed(2)}</div>
                                                        <div className="text-xs text-muted-foreground">{ref.paymentStatus}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Select 
                                                            defaultValue={ref.status} 
                                                            onValueChange={(val) => handleUpdateReferralStatus(ref.id, val)}
                                                        >
                                                            <SelectTrigger className="w-[150px] ml-auto">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="received">Recebida</SelectItem>
                                                                <SelectItem value="contacted">Contato</SelectItem>
                                                                <SelectItem value="meeting_scheduled">Reunião</SelectItem>
                                                                <SelectItem value="negotiating">Negociação</SelectItem>
                                                                <SelectItem value="converted">Convertido</SelectItem>
                                                                <SelectItem value="not_converted">Não Convertido</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-4 mt-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Controle Financeiro de Comissões</h3>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline">
                                        <Download className="w-4 h-4 mr-2" />
                                        Relatório de Pagamentos
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Indicador</TableHead>
                                            <TableHead>Cliente Indicado</TableHead>
                                            <TableHead>Valor Plano</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Comissão</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {commissions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    Nenhuma comissão pendente.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            commissions.map((comm) => (
                                                <TableRow key={comm.id}>
                                                    <TableCell className="font-medium">
                                                        {comm.referrer?.firstName} {comm.referrer?.lastName}
                                                    </TableCell>
                                                    <TableCell>
                                                        {comm.referred?.firstName} {comm.referred?.lastName}
                                                    </TableCell>
                                                    <TableCell>
                                                        R$ {Number(comm.subscription?.amount || 0).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="capitalize text-xs">
                                                        {comm.commissionType}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-emerald-600">
                                                        R$ {Number(comm.amount || 0).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(comm.status)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {comm.status === 'pending' && (
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    onClick={() => handleUpdateCommissionStatus(comm.id, 'approved')}
                                                                >
                                                                    Aprovar
                                                                </Button>
                                                            )}
                                                            {comm.status === 'approved' && (
                                                                <Button 
                                                                    size="sm" 
                                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                                    onClick={() => handleUpdateCommissionStatus(comm.id, 'paid')}
                                                                >
                                                                    Marcar Pago
                                                                </Button>
                                                            )}
                                                            <Button size="icon" variant="ghost">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="config" className="space-y-4 mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-primary" />
                                    Regras de Recompensa Ativas
                                </h3>
                                <div className="space-y-4">
                                    {config.length === 0 ? (
                                        <div className="text-center py-8 bg-muted/30 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Nenhuma regra configurada.</p>
                                            <Button variant="link" className="mt-2">Criar primeira regra</Button>
                                        </div>
                                    ) : (
                                        config.map((rule) => (
                                            <div key={rule.id} className="p-4 border rounded-lg flex items-center justify-between bg-card hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Award className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium capitalize">{rule.type}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {rule.type === 'percentage' ? `${rule.value}% da mensalidade` : `R$ ${rule.value} fixo`}
                                                            {rule.durationMonths ? ` por ${rule.durationMonths} meses` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                                        {rule.isActive ? 'Ativa' : 'Inativa'}
                                                    </Badge>
                                                    <Button variant="ghost" size="icon">
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <Button className="w-full mt-4" variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar Nova Regra
                                    </Button>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-6">Validação Automática</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-5 h-5 mt-1">
                                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                                        </div>
                                        <div>
                                            <Label className="text-base">Validar contratação real</Label>
                                            <p className="text-sm text-muted-foreground">Apenas pagar se o indicado tiver um plano ativo.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-5 h-5 mt-1">
                                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                                        </div>
                                        <div>
                                            <Label className="text-base">Período de carência (30 dias)</Label>
                                            <p className="text-sm text-muted-foreground">Aguardar a primeira mensalidade ser paga e compensada.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-5 h-5 mt-1">
                                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                                        </div>
                                        <div>
                                            <Label className="text-base">Verificar duplicidade</Label>
                                            <p className="text-sm text-muted-foreground">Impedir que a mesma pessoa seja indicada por múltiplos parceiros.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 text-orange-600 bg-orange-50 p-4 rounded-lg border border-orange-200">
                                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                                        <p className="text-sm">
                                            Essas configurações ajudam a evitar fraudes e pagamentos indevidos no programa de parcerias.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="ranking" className="space-y-4 mt-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-6">Ranking de Indicadores</h3>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Posição</TableHead>
                                            <TableHead>Nome do Indicador</TableHead>
                                            <TableHead>Indicações</TableHead>
                                            <TableHead>Conversões</TableHead>
                                            <TableHead>Taxa de Conversão</TableHead>
                                            <TableHead>Receita Gerada</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ranking.map((item, index) => (
                                            <TableRow key={item.referrerId}>
                                                <TableCell className="font-bold text-lg text-center">
                                                    {index + 1}º
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground">ID: {item.referrerId}</div>
                                                </TableCell>
                                                <TableCell>{item.totalReferrals}</TableCell>
                                                <TableCell>{item.conversions}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-full bg-muted rounded-full h-1.5 max-w-[100px]">
                                                            <div 
                                                                className="bg-primary h-1.5 rounded-full" 
                                                                style={{ width: `${item.conversionRate}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium">{Number(item.conversionRate || 0).toFixed(1)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-emerald-600">
                                                    R$ {item.revenueGenerated.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={index < 3 ? 'default' : 'outline'}>
                                                        {index === 0 ? 'Top Partner' : index < 3 ? 'Elite' : 'Ativo'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
