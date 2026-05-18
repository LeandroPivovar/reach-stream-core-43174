import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    BarChart3, 
    Search, 
    Filter, 
    ArrowUpDown, 
    Download, 
    Mail, 
    Smartphone, 
    MessageSquare, 
    CreditCard, 
    Users, 
    TrendingUp, 
    CheckCircle, 
    XCircle, 
    Calendar,
    ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function AdminClientsReport() {
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState<'name' | 'totalPaid' | 'createdAt' | 'emailsSent'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['admin-clients-report'],
        queryFn: () => api.getAdminClientsReport(),
    });

    // Statistics calculation
    const stats = useMemo(() => {
        if (!reportData) return {
            totalClients: 0,
            activeClients: 0,
            totalPaid: 0,
            totalEmails: 0,
            totalSms: 0,
            totalWhatsapp: 0
        };

        return reportData.reduce((acc, user) => {
            acc.totalClients += 1;
            if (user.active) acc.activeClients += 1;
            acc.totalPaid += user.totalPaidPlanAmount || 0;
            acc.totalEmails += user.emailsSent || 0;
            acc.totalSms += user.smsSent || 0;
            acc.totalWhatsapp += user.whatsappSent || 0;
            return acc;
        }, {
            totalClients: 0,
            activeClients: 0,
            totalPaid: 0,
            totalEmails: 0,
            totalSms: 0,
            totalWhatsapp: 0
        });
    }, [reportData]);

    // Sorting & Filtering logic
    const filteredAndSortedData = useMemo(() => {
        if (!reportData) return [];

        let result = reportData.filter(user => {
            const matchesSearch = 
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesPlan = planFilter === 'all' || 
                (planFilter === 'none' && user.planName === 'Sem plano') ||
                user.planName.toLowerCase() === planFilter.toLowerCase();
            
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && user.active) ||
                (statusFilter === 'inactive' && !user.active);

            return matchesSearch && matchesPlan && matchesStatus;
        });

        result.sort((a, b) => {
            let valA: any = a[sortField === 'name' ? 'firstName' : sortField === 'totalPaid' ? 'totalPaidPlanAmount' : sortField === 'createdAt' ? 'createdAt' : 'emailsSent'];
            let valB: any = b[sortField === 'name' ? 'firstName' : sortField === 'totalPaid' ? 'totalPaidPlanAmount' : sortField === 'createdAt' ? 'createdAt' : 'emailsSent'];

            if (sortField === 'name') {
                valA = `${a.firstName} ${a.lastName}`.toLowerCase();
                valB = `${b.firstName} ${b.lastName}`.toLowerCase();
            } else if (sortField === 'createdAt') {
                valA = new Date(a.createdAt).getTime();
                valB = new Date(b.createdAt).getTime();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [reportData, searchTerm, planFilter, statusFilter, sortField, sortOrder]);

    // Chart Data (Plan distribution)
    const chartData = useMemo(() => {
        if (!reportData) return [];
        const distribution: Record<string, number> = {};
        
        reportData.forEach(user => {
            const name = user.planName || 'Sem plano';
            distribution[name] = (distribution[name] || 0) + 1;
        });

        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    }, [reportData]);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const exportToCSV = () => {
        if (!filteredAndSortedData.length) return;
        
        const headers = [
            'ID', 'Nome', 'Email', 'Celular', 'Data Cadastro', 'Status', 'Plano Atual', 
            'Status Assinatura', 'Emails Enviados', 'Limite Email', 'SMS Enviados', 
            'Limite SMS', 'WhatsApp Enviados', 'Créditos Extra Email', 'Créditos Extra SMS',
            'Faturamento Total (R$)', 'Integração Shopify', 'Integração Nuvemshop', 
            'Integração VTEX', 'Integração Loja Integrada'
        ];

        const rows = filteredAndSortedData.map(user => [
            user.id,
            `${user.firstName} ${user.lastName}`,
            user.email,
            user.phone || '',
            new Date(user.createdAt).toLocaleDateString('pt-BR'),
            user.active ? 'Ativo' : 'Inativo',
            user.planName,
            user.subscriptionStatus,
            user.emailsSent,
            user.emailLimit,
            user.smsSent,
            user.smsLimit,
            user.whatsappSent,
            user.extraEmails,
            user.extraSms,
            user.totalPaidPlanAmount,
            user.shopifyActive ? 'Sim' : 'Não',
            user.nuvemshopActive ? 'Sim' : 'Não',
            user.vtexActive ? 'Sim' : 'Não',
            user.liActive ? 'Sim' : 'Não'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_consolidado_clientes_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            Relatório de Utilização
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Auditoria consolidada de planos, consumo de recursos e integrações dos clientes.
                        </p>
                    </div>
                    <Button 
                        onClick={exportToCSV}
                        className="bg-primary hover:bg-primary/90 text-white font-medium shadow-sm transition-all flex items-center gap-2"
                        disabled={isLoading || !filteredAndSortedData.length}
                    >
                        <Download className="h-4 w-4" /> Exportar Relatório CSV
                    </Button>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="hover:shadow-md transition-all border-slate-100 bg-gradient-to-br from-white to-slate-50/50">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Clientes Ativos</CardTitle>
                            <Users className="h-5 w-5 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-slate-900">{stats.activeClients} <span className="text-sm font-medium text-muted-foreground">/ {stats.totalClients}</span></div>
                            <p className="text-xs text-muted-foreground mt-1">Taxa de retenção: {stats.totalClients > 0 ? ((stats.activeClients / stats.totalClients) * 100).toFixed(1) : 0}%</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all border-slate-100 bg-gradient-to-br from-white to-slate-50/50">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Faturamento Planos</CardTitle>
                            <CreditCard className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-slate-900">R$ {stats.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Receita total de assinaturas pagas
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all border-slate-100 bg-gradient-to-br from-white to-slate-50/50">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Emails Enviados</CardTitle>
                            <Mail className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-slate-900">{stats.totalEmails.toLocaleString('pt-BR')}</div>
                            <p className="text-xs text-muted-foreground mt-1">Consumo mensal de e-mails ativos</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all border-slate-100 bg-gradient-to-br from-white to-slate-50/50">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SMS Enviados</CardTitle>
                            <Smartphone className="h-5 w-5 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-slate-900">{stats.totalSms.toLocaleString('pt-BR')}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total de disparos móveis SMS realizados</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Charts */}
                {!isLoading && chartData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-slate-100">
                            <CardHeader>
                                <CardTitle className="text-base font-bold text-slate-800">Distribuição de Consumo por Cliente</CardTitle>
                                <CardDescription>Consumo de disparos de e-mail por usuário ativo.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        data={filteredAndSortedData.slice(0, 10).map(u => ({ 
                                            name: u.firstName, 
                                            "E-mails": u.emailsSent,
                                            "SMS": u.smsSent,
                                            "WhatsApp": u.whatsappSent
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" tickLine={false} />
                                        <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="E-mails" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="SMS" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="WhatsApp" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-100">
                            <CardHeader>
                                <CardTitle className="text-base font-bold text-slate-800">Clientes por Plano</CardTitle>
                                <CardDescription>Proporção atual de assinaturas.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-72 flex flex-col justify-center items-center">
                                <div className="w-full h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-slate-700 w-full px-4">
                                    {chartData.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center gap-1.5 truncate">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="truncate">{entry.name}: {entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters & Main List */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800">Métricas Detalhadas dos Clientes</CardTitle>
                        <CardDescription>Consumo, limites e situação cadastral em tempo real.</CardDescription>
                    </CardHeader>
                    
                    {/* Controls Bar */}
                    <div className="px-6 pb-4 flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-slate-100">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou e-mail..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 text-sm"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                            {/* Plan Filter */}
                            <Select value={planFilter} onValueChange={setPlanFilter}>
                                <SelectTrigger className="w-[140px] text-xs font-medium">
                                    <SelectValue placeholder="Plano" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Planos</SelectItem>
                                    <SelectItem value="none">Sem plano</SelectItem>
                                    {Array.from(new Set(reportData?.map(u => u.planName).filter(Boolean) || [])).map(name => (
                                        <SelectItem key={name} value={name}>{name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[120px] text-xs font-medium">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    <SelectItem value="active">Ativos</SelectItem>
                                    <SelectItem value="inactive">Inativos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table View */}
                    {isLoading ? (
                        <div className="py-24 text-center text-muted-foreground text-sm font-medium">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                            Carregando relatório consolidado de clientes...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent bg-slate-50/50">
                                        <TableHead onClick={() => handleSort('name')} className="cursor-pointer font-bold select-none text-slate-700 text-xs py-3">
                                            Nome / Contato <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 text-slate-400" />
                                        </TableHead>
                                        <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer font-bold select-none text-slate-700 text-xs py-3">
                                            Cadastro <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 text-slate-400" />
                                        </TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs py-3">Plano / Status</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs py-3">Integrações Ativas</TableHead>
                                        <TableHead onClick={() => handleSort('emailsSent')} className="cursor-pointer font-bold select-none text-slate-700 text-xs py-3">
                                            Consumo Mensal <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 text-slate-400" />
                                        </TableHead>
                                        <TableHead className="font-bold text-slate-700 text-xs py-3">WhatsApp Templates</TableHead>
                                        <TableHead onClick={() => handleSort('totalPaid')} className="cursor-pointer font-bold select-none text-slate-700 text-xs py-3 text-right">
                                            Faturado Planos <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 text-slate-400" />
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                                                Nenhum cliente correspondente aos filtros foi encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAndSortedData.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-slate-50/40 transition-colors">
                                                {/* Client Name & Profile */}
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                                                            {user.firstName} {user.lastName}
                                                            {!user.active && <Badge variant="destructive" className="h-4 py-0 px-1 text-[9px]">Suspenso</Badge>}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                        {user.phone && <span className="text-[10px] text-slate-400 mt-0.5">{user.phone}</span>}
                                                    </div>
                                                </TableCell>

                                                {/* Registration Date */}
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </TableCell>

                                                {/* Plan & Subscription Status */}
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-100 font-bold text-[10px]">
                                                            {user.planName}
                                                        </Badge>
                                                        <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                                                            user.subscriptionStatus === 'active' ? 'text-green-600' : 'text-slate-500'
                                                        }`}>
                                                            {user.subscriptionStatus === 'active' ? (
                                                                <><CheckCircle className="h-3 w-3 text-green-500" /> Ativa</>
                                                            ) : (
                                                                <><XCircle className="h-3 w-3 text-slate-400" /> Inativa</>
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Active Integrations */}
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {user.shopifyActive && (
                                                            <Badge className="bg-[#96bf48] text-white hover:bg-[#85a83f] font-extrabold text-[9px] px-1.5 py-0.5 shadow-sm">
                                                                Shopify
                                                            </Badge>
                                                        )}
                                                        {user.nuvemshopActive && (
                                                            <Badge className="bg-[#00b2e5] text-white hover:bg-[#009ac7] font-extrabold text-[9px] px-1.5 py-0.5 shadow-sm">
                                                                Nuvemshop
                                                            </Badge>
                                                        )}
                                                        {user.vtexActive && (
                                                            <Badge className="bg-[#f71963] text-white hover:bg-[#de1254] font-extrabold text-[9px] px-1.5 py-0.5 shadow-sm">
                                                                VTEX
                                                            </Badge>
                                                        )}
                                                        {user.liActive && (
                                                            <Badge className="bg-[#38b140] text-white hover:bg-[#2b9032] font-extrabold text-[9px] px-1.5 py-0.5 shadow-sm">
                                                                LI
                                                            </Badge>
                                                        )}
                                                        {!user.shopifyActive && !user.nuvemshopActive && !user.vtexActive && !user.liActive && (
                                                            <span className="text-[10px] text-muted-foreground italic">Nenhuma ativa</span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Usage Metrics */}
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col space-y-1 text-xs">
                                                        {/* Emails */}
                                                        <div className="flex items-center justify-between gap-3 text-slate-700">
                                                            <span className="flex items-center gap-1 font-medium"><Mail className="h-3 w-3 text-slate-400" /> Email</span>
                                                            <span className="font-bold">{user.emailsSent} <span className="text-slate-400 font-normal">/ {user.emailLimit}</span></span>
                                                        </div>
                                                        {/* SMS */}
                                                        <div className="flex items-center justify-between gap-3 text-slate-700">
                                                            <span className="flex items-center gap-1 font-medium"><Smartphone className="h-3 w-3 text-slate-400" /> SMS</span>
                                                            <span className="font-bold">{user.smsSent} <span className="text-slate-400 font-normal">/ {user.smsLimit}</span></span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* WhatsApp Templates */}
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] font-bold" title="Aprovados">
                                                            {user.templatesApproved} A
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold" title="Pendentes">
                                                            {user.templatesPending} P
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold" title="Rejeitados">
                                                            {user.templatesRejected} R
                                                        </Badge>
                                                    </div>
                                                </TableCell>

                                                {/* Total Paid in Plans */}
                                                <TableCell className="py-4 text-right">
                                                    <div className="font-extrabold text-slate-900 text-sm">
                                                        R$ {(user.totalPaidPlanAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    {user.extraEmails > 0 || user.extraSms > 0 ? (
                                                        <div className="text-[9px] text-amber-600 font-semibold mt-0.5">
                                                            + Créditos Extras comprados
                                                        </div>
                                                    ) : null}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
