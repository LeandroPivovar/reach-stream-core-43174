import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Users, Terminal, Settings, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminDashboard() {
    const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: api.getAdminUsers });
    const { data: logs } = useQuery({ queryKey: ['webhook-logs'], queryFn: api.getWebhookLogs });
    const { data: globalStats } = useQuery({ queryKey: ['admin-global-stats'], queryFn: api.getAdminGlobalStats });

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
        { label: 'MAU (30 dias)', value: globalStats?.mau || 0 },
        { label: 'Crescimento', value: `${(globalStats?.growthMoM || 0).toFixed(1)}%` },
        { label: 'Inadimplência', value: `${(globalStats?.defaultRate || 0).toFixed(1)}%` },
        { label: 'LTV Médio', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(globalStats?.averageLtv || 0) },
        { label: 'CAC Médio', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(globalStats?.cac || 0) },
    ];

    return (
        <AdminLayout
            title="Dashboard Administrativo"
            subtitle="Bem-vindo ao centro de comando do Núcleo CRM."
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
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
