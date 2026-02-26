import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import {
    Send,
    Eye,
    MousePointer,
    MessageCircle,
    TrendingUp,
    Calendar,
    Users,
    Activity,
    DollarSign,
    AlertCircle,
    ShoppingCart,
    CheckCircle,
    Clock,
    Zap,
    Filter,
    Package,
    Target
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CustomerJourney } from '@/components/dashboard/CustomerJourney';
import { CustomerHeatmap } from '@/components/dashboard/CustomerHeatmap';
import { api } from '@/lib/api';

export default function Dashboard() {
    const [chartPeriod, setChartPeriod] = useState('semanal');

    // Simulação de integração ativa - em produção, isso viria de uma API
    const hasIntegrations = true; // Alterar para false para ver o estado sem integrações

    const [funnelStats, setFunnelStats] = useState<any[]>([]);
    const [segmentationStats, setSegmentationStats] = useState<any>(null);
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [campaignStats, setCampaignStats] = useState<any>({ chartData: [], recentCampaigns: [] });
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Filters
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<string>('all');
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [camps, prods] = await Promise.all([
                    api.getCampaigns(),
                    api.getProducts()
                ]);
                setCampaigns(camps);
                setProducts(prods);
            } catch (error) {
                console.error('Error fetching filters data:', error);
            }
        };
        fetchFiltersData();
    }, []);

    React.useEffect(() => {
        const fetchAdditionalStats = async () => {
            try {
                const filters = {
                    campaignId: selectedCampaign !== 'all' ? selectedCampaign : undefined,
                    productId: selectedProduct !== 'all' ? selectedProduct : undefined,
                };

                const [funnelData, segData, campData, heatData] = await Promise.all([
                    api.getFunnelData(30),
                    api.getSegmentationStats(filters),
                    api.getCampaignDashboardPerformance(chartPeriod),
                    api.getDashboardHeatmap(filters)
                ]);
                setFunnelStats(funnelData);
                setSegmentationStats(segData);
                setCampaignStats(campData);
                setHeatmapData(heatData);
            } catch (error) {
                console.error('Error fetching dashboard extra stats:', error);
            }
        };
        fetchAdditionalStats();
    }, [chartPeriod, selectedCampaign, selectedProduct]);

    // Novos cards de Taxas baseados na imagem do usuário
    const conversionStats = [
        {
            title: 'Taxa de Conversão',
            value: isLoadingStats ? '...' : `${segmentationStats?.conversionRate || 0}%`,
            description: 'Lead → Comprador',
            icon: TrendingUp,
            trend: { value: 0, isPositive: true },
            colorClass: 'bg-green-500/20 text-green-900 dark:text-green-100 border-green-500/30'
        },
        {
            title: 'Taxa de Fidelização',
            value: isLoadingStats ? '...' : `${segmentationStats?.loyaltyRate || 0}%`,
            description: 'Comprador → Fiel',
            icon: CheckCircle,
            trend: { value: 0, isPositive: true },
            colorClass: 'bg-purple-500/20 text-purple-900 dark:text-purple-100 border-purple-500/30'
        },
        {
            title: 'Abandono de Carrinho',
            value: isLoadingStats ? '...' : `${segmentationStats?.abandonmentRate || 0}%`,
            description: 'Carrinho → Não comprou',
            icon: ShoppingCart,
            trend: { value: 0, isPositive: false },
            colorClass: 'bg-orange-500/20 text-orange-900 dark:text-orange-100 border-orange-500/30'
        }
    ];

    // Dados do mapa de calor vindos do backend
    const customerSegments = heatmapData.length > 0 ? heatmapData : [
        { name: 'Novos Leads', leads: 0, engaged: 0, cart: 0, purchase: 0, loyal: 0 },
        { name: 'Engajados', leads: 0, engaged: 0, cart: 0, purchase: 0, loyal: 0 },
        { name: 'Carrinho Ativo', leads: 0, engaged: 0, cart: 0, purchase: 0, loyal: 0 },
        { name: 'Compradores', leads: 0, engaged: 0, cart: 0, purchase: 0, loyal: 0 },
        { name: 'Clientes Fiéis', leads: 0, engaged: 0, cart: 0, purchase: 0, loyal: 0 },
        { name: 'Inativos 30d', leads: 0, engaged: 0, cart: 0, purchase: 0, loyal: 0 },
        { name: 'Inativos 60d', leads: 0, engaged: 0, cart: 0, purchase: 0, loyal: 0 },
        { name: 'Recuperados', leads: 0, engaged: 0, cart: 0, purchase: 0, loyal: 0 },
    ];


    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                // Using 30 days as default for the cards as per design ("Últimos 30 dias")
                const data = await api.get<any>('/sales/dashboard/stats?period=30');
                setDashboardStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const stats = [
        {
            title: 'Total de Envios',
            value: isLoadingStats ? '...' : dashboardStats?.envios?.toLocaleString() || '0',
            icon: Send,
            trend: {
                value: dashboardStats?.trends?.envios || 0,
                isPositive: (dashboardStats?.trends?.envios || 0) >= 0
            },
            description: 'Últimos 30 dias',
            colorClass: 'bg-blue-500/20 text-blue-900 dark:text-blue-100 border-blue-500/30'
        },
        {
            title: 'Taxa de Abertura',
            value: isLoadingStats ? '...' : `${(dashboardStats?.openRate || 0).toFixed(1)}%`,
            icon: Eye,
            trend: {
                value: dashboardStats?.trends?.openRate || 0,
                isPositive: (dashboardStats?.trends?.openRate || 0) >= 0
            },
            description: 'Média geral',
            colorClass: 'bg-purple-500/20 text-purple-900 dark:text-purple-100 border-purple-500/30'
        },
        {
            title: 'Cliques',
            value: isLoadingStats ? '...' : dashboardStats?.cliques?.toLocaleString() || '0',
            icon: MousePointer,
            trend: {
                value: dashboardStats?.trends?.cliques || 0,
                isPositive: (dashboardStats?.trends?.cliques || 0) >= 0
            },
            description: isLoadingStats ? '...' : `CTR de ${(dashboardStats?.ctr || 0).toFixed(1)}%`,
            colorClass: 'bg-orange-500/20 text-orange-900 dark:text-orange-100 border-orange-500/30'
        },
        {
            title: 'Respostas',
            value: isLoadingStats ? '...' : dashboardStats?.respostas?.toLocaleString() || '0',
            icon: MessageCircle,
            trend: { value: 0, isPositive: true },
            description: 'Taxa de resposta -',
            colorClass: 'bg-green-500/20 text-green-900 dark:text-green-100 border-green-500/30'
        },
        {
            title: 'Faturamento Geral',
            value: isLoadingStats ? '...' : formatCurrency(dashboardStats?.faturamento || 0),
            icon: DollarSign,
            trend: {
                value: dashboardStats?.trends?.faturamento || 0,
                isPositive: (dashboardStats?.trends?.faturamento || 0) >= 0
            },
            description: 'Últimos 30 dias',
            colorClass: 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 border-emerald-500/30'
        }
    ];

    const getChartData = () => {
        return campaignStats.chartData || [];
    };

    const getPeriodLabel = () => {
        switch (chartPeriod) {
            case 'diario':
                return 'Últimos 7 dias';
            case 'mensal':
                return 'Últimos 6 meses';
            default:
                return 'Última semana';
        }
    };

    const getRelativeTime = (dateStr: string) => {
        const diff = new Date().getTime() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
        if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'agora mesmo';
    };

    return (
        <Layout
            title="Visão Geral"
            subtitle="Acompanhe o desempenho das suas campanhas"
        >
            <div className="space-y-6">
                {/* Filtros GLOBAIS do Dashboard */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                            <SelectTrigger className="w-full bg-card border-border">
                                <Target className="w-4 h-4 mr-2 text-primary" />
                                <SelectValue placeholder="Todas as Campanhas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Campanhas</SelectItem>
                                {campaigns.map((camp: any) => (
                                    <SelectItem key={camp.id} value={camp.id.toString()}>
                                        {camp.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1">
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                            <SelectTrigger className="w-full bg-card border-border">
                                <Package className="w-4 h-4 mr-2 text-primary" />
                                <SelectValue placeholder="Todos os Produtos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Produtos</SelectItem>
                                {products.map((prod: any) => (
                                    <SelectItem key={prod.id} value={prod.id.toString()}>
                                        {prod.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button variant="outline" className="md:w-auto" onClick={() => {
                        setSelectedCampaign('all');
                        setSelectedProduct('all');
                    }}>
                        <Filter className="w-4 h-4 mr-2" />
                        Limpar Filtros
                    </Button>
                </div>

                {/* Stats Cards - Primeira Linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {stats.map((stat, index) => (
                        <StatsCard key={index} {...stat} />
                    ))}
                </div>

                {/* Performance Chart - Segunda Linha */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Desempenho das Campanhas</CardTitle>
                            <Select value={chartPeriod} onValueChange={setChartPeriod}>
                                <SelectTrigger className="w-[180px]">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Período" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="diario">Diário</SelectItem>
                                    <SelectItem value="semanal">Semanal</SelectItem>
                                    <SelectItem value="mensal">Mensal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{getPeriodLabel()}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={getChartData()}>
                                    <defs>
                                        <linearGradient id="colorEnvios" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorAberturas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorCliques" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="periodo"
                                        stroke="hsl(var(--muted-foreground))"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--popover))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            color: 'hsl(var(--popover-foreground))'
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="envios"
                                        stroke="hsl(var(--primary))"
                                        fill="url(#colorEnvios)"
                                        strokeWidth={2}
                                        name="Envios"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="aberturas"
                                        stroke="hsl(var(--chart-2))"
                                        fill="url(#colorAberturas)"
                                        strokeWidth={2}
                                        name="Aberturas"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cliques"
                                        stroke="hsl(var(--chart-3))"
                                        fill="url(#colorCliques)"
                                        strokeWidth={2}
                                        name="Cliques"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Taxas de Conversão e Fidelização - Terceira Linha */}
                {hasIntegrations ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {conversionStats.map((segment, index) => (
                                <StatsCard key={index} {...segment} />
                            ))}
                        </div>
                    </>
                ) : (
                    <Alert className="border-primary/50 bg-primary/10">
                        <Zap className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary font-semibold">Ative Integrações para Segmentação Automática</AlertTitle>
                        <AlertDescription className="text-muted-foreground">
                            Conecte suas integrações (e-commerce, CRM) para que a plataforma faça a segmentação automática dos seus leads
                            (abandono de carrinho, compraram recentemente, sem compras há 60 dias) e maximize seus resultados.
                            <div className="mt-3">
                                <Button size="sm" className="mt-2">
                                    Configurar Integrações
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Jornada do Cliente */}
                {hasIntegrations && (
                    <Card className="p-6">
                        <CustomerJourney stages={funnelStats} />
                    </Card>
                )}

                {/* Alerta de Clientes Inativos */}
                {hasIntegrations && (
                    <Alert className="border-orange-500/50 bg-orange-500/10">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <AlertTitle className="text-orange-500 font-semibold">Atenção: Clientes Inativos</AlertTitle>
                        <AlertDescription className="text-muted-foreground">
                            Você tem <span className="font-bold text-foreground">1.205</span> clientes inativos (sem compras há mais de 90 dias).
                            Considere criar uma campanha de reengajamento para recuperar esses clientes.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Mapa de Calor dos Clientes na Jornada */}
                {hasIntegrations && (
                    <Card className="p-6">
                        <CustomerHeatmap segments={customerSegments} />
                    </Card>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance by Channel */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Desempenho por Canal</h3>
                            <Button variant="outline" size="sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                Últimos 30 dias
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {(campaignStats?.channelPerformance || []).map((perf: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${perf.channel === 'whatsapp' ? 'bg-green-500' : perf.channel === 'email' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                                        <span className="font-medium capitalize">{perf.channel}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{perf.envios.toLocaleString()} envios</p>
                                        <p className="text-sm text-muted-foreground">{perf.taxaAbertura.toFixed(1)}% abertura</p>
                                    </div>
                                </div>
                            ))}
                            {(!campaignStats?.channelPerformance || campaignStats.channelPerformance.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado no período</p>
                            )}
                        </div>
                    </Card>

                    {/* Activity Feed */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Atividade Recente</h3>
                            <Button variant="ghost" size="sm">
                                <Activity className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {(campaignStats?.recentActivity || []).map((act: any, index: number) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 ${act.type.includes('created') ? 'bg-primary' : act.type.includes('finished') ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{act.title}</p>
                                        <p className="text-xs text-muted-foreground">{act.subtitle} - {getRelativeTime(act.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                            {(!campaignStats?.recentActivity || campaignStats.recentActivity.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Recent Campaigns */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Campanhas Recentes</h3>
                        <Button variant="outline">
                            Ver todas
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tipo</th>
                                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Enviados</th>
                                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Aberturas</th>
                                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Cliques</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(campaignStats.recentCampaigns || []).map((campaign: any, index: number) => (
                                    <tr key={index} className="border-b border-border last:border-0">
                                        <td className="py-4 px-2">
                                            <div className="font-medium">{campaign.name}</div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <Badge variant="secondary">{campaign.type}</Badge>
                                        </td>
                                        <td className="py-4 px-2">
                                            <Badge variant={
                                                campaign.status === 'Ativa' ? 'default' :
                                                    campaign.status === 'Pausada' ? 'secondary' : 'outline'
                                            }>
                                                {campaign.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-2 text-right font-medium">
                                            {campaign.sent.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-2 text-right font-medium">
                                            {campaign.opens.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-2 text-right font-medium">
                                            {campaign.clicks.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    );
}