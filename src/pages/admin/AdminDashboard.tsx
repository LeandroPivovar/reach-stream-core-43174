import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Users, Terminal, Settings, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminDashboard() {
    const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: api.getAdminUsers });
    const { data: logs } = useQuery({ queryKey: ['webhook-logs'], queryFn: api.getWebhookLogs });

    const stats = [
        { label: 'Total de Usuários', value: users?.length || 0, icon: Users, color: 'text-blue-500' },
        { label: 'Webhooks Recebidos', value: logs?.length || 0, icon: Terminal, color: 'text-purple-500' },
        { label: 'Assinaturas Ativas', value: users?.filter(u => u.currentPlan).length || 0, icon: TrendingUp, color: 'text-green-500' },
        { label: 'Configurações de Sistema', value: '3 Módulos', icon: Settings, color: 'text-amber-500' },
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
                            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Atividade Recente
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Configure alertas e visualize logs de sistema aqui.
                    </p>
                    <div className="mt-4 p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center italic text-slate-400 text-sm">
                        Monitoramento em tempo real (Em breve)
                    </div>
                </Card>

                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" /> Resumo Financeiro
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Acompanhe a receita proveniente de assinaturas Asaas.
                    </p>
                    <div className="mt-4 p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center italic text-slate-400 text-sm">
                        Integração Financeira (Em breve)
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
