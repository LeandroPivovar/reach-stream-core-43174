import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import {
    TrendingUp,
    DollarSign,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Target,
    Activity,
    Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    Legend
} from 'recharts';

export default function AdminFinance() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-finance-stats'],
        queryFn: () => api.getAdminFinanceStats()
    });

    if (isLoading) {
        return (
            <AdminLayout title="Análise Financeira" subtitle="Carregando dados consolidados...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const kpis = [
        {
            label: 'Receita Total (12m)',
            value: formatCurrency(stats?.ytdRevenue || 0),
            icon: DollarSign,
            color: 'text-emerald-500',
            trend: stats?.growthRate && stats.growthRate > 0 ? `+${stats.growthRate.toFixed(1)}%` : '0%'
        },
        {
            label: 'MRR Atual',
            value: formatCurrency(stats?.currentMrr || 0),
            icon: TrendingUp,
            color: 'text-blue-500',
            trend: '+5.2%' // Mock MoM for now
        },
        {
            label: 'Margem Média',
            value: `${(stats?.avgMargin || 0).toFixed(1)}%`,
            icon: PieChart,
            color: 'text-purple-500',
            trend: 'Estável'
        },
        {
            label: 'Lucro Líquido (Est.)',
            value: formatCurrency((stats?.ytdRevenue || 0) * 0.7),
            icon: Target,
            color: 'text-amber-500',
            trend: '+12%'
        },
    ];

    return (
        <AdminLayout
            title="Análise Financeira (CFO)"
            subtitle="Visão estratégica de lucros, faturamento e projeções de crescimento."
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi, i) => (
                    <Card key={i} className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${kpi.color}`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {kpi.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                {kpi.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
                            <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{kpi.value}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue vs Costs Chart */}
                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" /> Histórico de Faturamento vs Custos
                        </h3>
                        <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-sm"></div> Receita</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-400 rounded-sm"></div> Custos</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.monthlyData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Area type="monotone" dataKey="totalRevenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                <Area type="monotone" dataKey="costs" stroke="#fb7185" fill="#fb7185" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* MRR Trend Chart */}
                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" /> Tendência de Receita Recorrente (MRR)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Line type="stepAfter" dataKey="subscriptionRevenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Breakdown */}
                <Card className="lg:col-span-1 p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-500" /> Origem da Receita
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.monthlyData.slice(-6)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend />
                                <Bar dataKey="subscriptionRevenue" name="Assinaturas" fill="#8884d8" radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="oneTimeRevenue" name="Vendas Avulsas" fill="#82ca9d" radius={[4, 4, 0, 0]} stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Projections Chart */}
                <Card className="lg:col-span-2 p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" /> Projeção de Crescimento (Próximos 6 meses)
                        </h3>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-amber-500 border-amber-500/20">
                            Algoritmo Preditivo Linear
                        </Badge>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.projections}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${Math.round(value / 1000)}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Line type="monotone" dataKey="revenue" name="Receita Projetada" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="profit" name="Lucro Projetado" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Baseado na taxa de crescimento média de {stats?.growthRate.toFixed(1)}% dos últimos meses.
                        </p>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
