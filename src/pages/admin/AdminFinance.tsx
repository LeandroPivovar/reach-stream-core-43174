import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
    TrendingUp,
    DollarSign,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Target,
    Activity,
    Zap,
    Save,
    Settings as SettingsIcon
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-finance-stats'],
        queryFn: () => api.getAdminFinanceStats()
    });

    const [costSms, setCostSms] = useState('0.05');
    const [costEmail, setCostEmail] = useState('0.01');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (stats?.settings) {
            setCostSms(stats.settings.costSms.toString());
            setCostEmail(stats.settings.costEmail.toString());
        }
    }, [stats]);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                api.updateAdminSetting('COST_SMS', costSms, 'Custo unitário por SMS enviado'),
                api.updateAdminSetting('COST_EMAIL', costEmail, 'Custo unitário por E-mail enviado')
            ]);
            queryClient.invalidateQueries({ queryKey: ['admin-finance-stats'] });
            toast({
                title: "Configurações salvas",
                description: "Os custos foram atualizados e o gráfico recalculado.",
            });
        } catch (error) {
            toast({
                title: "Erro ao salvar",
                description: "Ocorreu um problema ao salvar as configurações.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

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
    ];

    return (
        <AdminLayout
            title="Análise Financeira (CFO)"
            subtitle="Visão estratégica de lucros, faturamento e projeções de crescimento."
        >
            {/* Configurações de Custo */}
            <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-slate-500" /> Configurações de Custo Operacional
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-2 block">Custo Unitário SMS (R$)</p>
                        <Input
                            type="number"
                            step="0.01"
                            value={costSms}
                            onChange={(e) => setCostSms(e.target.value)}
                            placeholder="0.05"
                        />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-2 block">Custo Unitário E-mail (R$)</p>
                        <Input
                            type="number"
                            step="0.001"
                            value={costEmail}
                            onChange={(e) => setCostEmail(e.target.value)}
                            placeholder="0.01"
                        />
                    </div>
                    <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2">
                        {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                        Salvar Configurações
                    </Button>
                </div>
                <p className="mt-4 text-[10px] text-slate-400 italic">
                    * Os custos são calculados com base no volume total de envios da plataforma + 5% fixo de taxas (Asaas/Impostos).
                </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
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

            <div className="grid grid-cols-1 gap-8">
                {/* Projections Chart */}
                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" /> Projeção de Crescimento (Próximos 6 meses)
                        </h3>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-amber-500 border-amber-500/20">
                            Algoritmo Preditivo Linear
                        </Badge>
                    </div>
                    <div className="h-[300px] w-full">
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
