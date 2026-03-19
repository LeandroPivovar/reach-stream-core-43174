import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Users, Terminal, Settings, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminDashboard() {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState<string>((now.getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(now.getFullYear().toString());

    const { data: users, isLoading: isLoadingUsers, isError: isErrorUsers } = useQuery({ queryKey: ['admin-users'], queryFn: () => api.getAdminUsers() });
    const { data: logs, isLoading: isLoadingLogs, isError: isErrorLogs } = useQuery({ queryKey: ['webhook-logs'], queryFn: () => api.getWebhookLogs() });
    const { data: globalStats, isLoading: isLoadingStats, isError: isErrorStats } = useQuery({
        queryKey: ['admin-global-stats', selectedMonth, selectedYear],
        queryFn: () => api.getAdminGlobalStats(parseInt(selectedMonth), parseInt(selectedYear))
    });

    if (isLoadingUsers || isLoadingLogs || isLoadingStats) {
        return (
            <AdminLayout title="Dashboard Administrativo" subtitle="Carregando métricas...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    if (isErrorUsers || isErrorLogs || isErrorStats) {
        return (
            <AdminLayout title="Dashboard Administrativo" subtitle="Erro ao carregar dados">
                <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                    <p className="text-red-600 dark:text-red-400 font-medium">Não foi possível conectar ao servidor para buscar as métricas.</p>
                    <p className="text-sm text-red-500 mt-2">Verifique se o backend está rodando e se a conexão com o banco de dados está ativa.</p>
                </div>
            </AdminLayout>
        );
    }

    const months = [
        { value: '1', label: 'Janeiro' },
        { value: '2', label: 'Fevereiro' },
        { value: '3', label: 'Março' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Maio' },
        { value: '6', label: 'Junho' },
        { value: '7', label: 'Julho' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Setembro' },
        { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' },
        { value: '12', label: 'Dezembro' },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => ({
        value: (currentYear - i).toString(),
        label: (currentYear - i).toString(),
    }));

    const headerActions = (
        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 mr-1" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[130px] h-9 bg-slate-900 border-slate-800 text-xs text-white">
                    <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] h-9 bg-slate-900 border-slate-800 text-xs text-white">
                    <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {years.map((y) => (
                        <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    const stats = [
        { label: 'Usuários Ativos (DAU)', value: globalStats?.dau || 0, icon: Users, color: 'text-blue-500' },
        { label: 'Empresas Ativas', value: globalStats?.activeCompanies || 0, icon: TrendingUp, color: 'text-green-500' },
        {
            label: 'MRR (Mensal)',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(globalStats?.mrr || 0),
            icon: DollarSign,
            color: 'text-emerald-500'
        },
        {
            label: 'Churn Rate',
            value: `${(globalStats?.churnRate || 0).toFixed(1)}%`,
            icon: Activity,
            color: 'text-red-500'
        },
    ];

    const secondaryStats = [
        { label: 'MAU (Histórico)', value: globalStats?.mau || 0 },
        { label: 'Crescimento', value: `${(globalStats?.growthMoM || 0).toFixed(1)}%` },
        { label: 'Ticket Médio Global', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(globalStats?.totalAverageTicket || 0) },
        { label: 'Inadimplência', value: `${(globalStats?.defaultRate || 0).toFixed(1)}%` },
        { label: 'LTV Médio', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(globalStats?.averageLtv || 0) },
        { label: 'CAC Médio', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(globalStats?.cac || 0) },
    ];

    return (
        <AdminLayout
            title="Dashboard Administrativo"
            subtitle="Bem-vindo ao centro de comando do Núcleo CRM."
            actions={headerActions}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <Activity className="w-4 h-4 text-slate-400 opacity-30" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{stat.value}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Novas métricas secundárias */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {secondaryStats.map((stat, i) => (
                    <Card key={i} className="p-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                    </Card>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Ticket Médio por Plano
                    </h3>
                    <div className="space-y-4">
                        {globalStats?.ticketByPlan && Object.entries(globalStats.ticketByPlan).map(([name, value]) => (
                            <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{name}</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)}
                                </span>
                            </div>
                        ))}
                        {!globalStats?.ticketByPlan && (
                            <div className="animate-pulse space-y-2">
                                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-amber-500" /> Atividade do Sistema
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Usuários Cadastrados</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{users?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Logs de Webhooks</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{logs?.length || 0}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
