import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    Mail,
    MessageSquare,
    AlertTriangle,
    TrendingUp,
    Calendar,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminCapacity = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-capacity-stats'],
        queryFn: () => api.getAdminCapacityStats(),
        refetchInterval: 60000, // Refresh every minute
    });

    if (isLoading) {
        return (
            <AdminLayout title="Capacidade & Consumo" subtitle="Carregando dados da plataforma...">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    const StatCard = ({ title, icon: Icon, data, label }: { title: string, icon: any, data: any, label: string }) => {
        const isCritical = data.isAlert;

        return (
            <Card className={`border-2 ${isCritical ? 'border-rose-500 bg-rose-500/5' : 'border-border'}`}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-500/20 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{title}</CardTitle>
                                <CardDescription>{label}</CardDescription>
                            </div>
                        </div>
                        {isCritical && (
                            <Badge variant="destructive" className="animate-pulse">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                ALERTA CRÍTICO
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Consumo Atual vs Provedora */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground">Consumo Atual (Mês)</span>
                            <span>{data.consumed.toLocaleString()} / {data.providerLimit.toLocaleString()}</span>
                        </div>
                        <Progress value={data.usagePercent} className={`h-2 ${isCritical ? 'bg-rose-200 dark:bg-rose-900/30' : ''}`}
                            indicatorClassName={isCritical ? 'bg-rose-500' : data.usagePercent > 80 ? 'bg-amber-500' : 'bg-primary'} />
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>{data.usagePercent.toFixed(1)}% utilizado</span>
                            <span>{data.daysRemaining} dias restantes</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                            <div className="text-[11px] text-muted-foreground uppercase flex items-center gap-1 mb-1">
                                <ShieldCheck className="w-3 h-3" />
                                Contratado por Clientes
                            </div>
                            <div className="text-xl font-bold tracking-tight">
                                {data.clientsContracted.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                Total vendido pela Núcleo
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg border ${isCritical ? 'bg-rose-500/10 border-rose-500/20' : 'bg-muted/50 border-border'}`}>
                            <div className="text-[11px] text-muted-foreground uppercase flex items-center gap-1 mb-1">
                                <TrendingUp className="w-3 h-3" />
                                Projeção de Consumo
                            </div>
                            <div className={`text-xl font-bold tracking-tight ${isCritical ? 'text-rose-500' : ''}`}>
                                {Math.round(data.projection).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                Estimado até fim do mês
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${isCritical ? 'bg-rose-500/20 border-rose-500/30' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                        <div className={`p-2 rounded-full ${isCritical ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {isCritical ? <AlertCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                            <div className={`text-xs font-bold ${isCritical ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                {isCritical ? 'CAPACIDADE INSUFICIENTE' : 'DENTRO DA CAPACIDADE'}
                            </div>
                            <div className="text-[11px] text-muted-foreground leading-tight">
                                {isCritical
                                    ? `A projeção excede o limite contratado em ${(Math.round(data.projection) - data.providerLimit).toLocaleString()} disparos.`
                                    : `Margem de segurança de ${Math.round(data.marginOfSafety).toLocaleString()} disparos disponível.`}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <AdminLayout
            title="Capacidade & Consumo"
            subtitle="Monitore a carga da plataforma e a relação entre limites contratados e vendidos."
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatCard
                    title="Plataforma de E-mail"
                    icon={Mail}
                    data={stats?.email}
                    label="Capacidade Global de Envios"
                />
                <StatCard
                    title="Plataforma de SMS"
                    icon={MessageSquare}
                    data={stats?.sms}
                    label="Capacidade Global de Mensagens"
                />
            </div>

            <div className="mt-8">
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Previsão de Ciclo Mensal
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Dados baseados no comportamento de consumo dos últimos {new Date().getDate()} dias.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-400 max-w-2xl">
                            Estimamos o consumo total multiplicando a média diária atual pelos dias restantes do mês.
                            Considere aumentar o pacote com a provedora se a <strong>projeção de consumo</strong> se aproximar de 90% do
                            <strong> limite da provedora</strong>.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminCapacity;
