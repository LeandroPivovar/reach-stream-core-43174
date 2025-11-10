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
  Zap
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

export default function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState('semanal');
  
  // Simulação de integração ativa - em produção, isso viria de uma API
  const hasIntegrations = true; // Alterar para false para ver o estado sem integrações
  
  // Dados de segmentação automática quando há integrações
  const leadSegmentation = [
    {
      title: 'Abandono de Carrinho',
      value: 342,
      description: 'Últimas 24 horas',
      icon: ShoppingCart,
      trend: { value: 23, isPositive: false },
      colorClass: 'bg-orange-500/20 text-orange-900 dark:text-orange-100 border-orange-500/30'
    },
    {
      title: 'Compraram Recentemente',
      value: 156,
      description: 'Últimos 7 dias',
      icon: CheckCircle,
      trend: { value: 12, isPositive: true },
      colorClass: 'bg-green-500/20 text-green-900 dark:text-green-100 border-green-500/30'
    },
    {
      title: 'Sem Compras - 60 dias',
      value: 1205,
      description: 'Potencial reengajamento',
      icon: Clock,
      trend: { value: -5, isPositive: false },
      colorClass: 'bg-red-500/20 text-red-900 dark:text-red-100 border-red-500/30'
    }
  ];

  // Dados simulados de segmentos para o mapa de calor
  const customerSegments = [
    { name: 'Novos Leads', leads: 523, engaged: 312, cart: 145, purchase: 67, loyal: 23 },
    { name: 'Engajados', leads: 198, engaged: 567, cart: 289, purchase: 134, loyal: 56 },
    { name: 'Carrinho Ativo', leads: 45, engaged: 123, cart: 456, purchase: 234, loyal: 89 },
    { name: 'Compradores', leads: 23, engaged: 89, cart: 167, purchase: 689, loyal: 312 },
    { name: 'Clientes Fiéis', leads: 12, engaged: 34, cart: 78, purchase: 245, loyal: 823 },
    { name: 'Inativos 30d', leads: 234, engaged: 156, cart: 89, purchase: 45, loyal: 12 },
    { name: 'Inativos 60d', leads: 456, engaged: 234, cart: 112, purchase: 34, loyal: 8 },
    { name: 'Recuperados', leads: 67, engaged: 145, cart: 234, purchase: 178, loyal: 98 },
  ];

  const stats = [
    {
      title: 'Total de Envios',
      value: '12.847',
      icon: Send,
      trend: { value: 12.5, isPositive: true },
      description: 'Últimos 30 dias',
      colorClass: 'bg-blue-500/20 text-blue-900 dark:text-blue-100 border-blue-500/30'
    },
    {
      title: 'Taxa de Abertura',
      value: '68.2%',
      icon: Eye,
      trend: { value: -2.1, isPositive: false },
      description: 'Média geral',
      colorClass: 'bg-purple-500/20 text-purple-900 dark:text-purple-100 border-purple-500/30'
    },
    {
      title: 'Cliques',
      value: '2.164',
      icon: MousePointer,
      trend: { value: 8.3, isPositive: true },
      description: 'CTR de 16.8%',
      colorClass: 'bg-orange-500/20 text-orange-900 dark:text-orange-100 border-orange-500/30'
    },
    {
      title: 'Respostas',
      value: '534',
      icon: MessageCircle,
      trend: { value: 5.7, isPositive: true },
      description: 'Taxa de resposta 4.2%',
      colorClass: 'bg-green-500/20 text-green-900 dark:text-green-100 border-green-500/30'
    },
    {
      title: 'Faturamento Geral',
      value: 'R$ 47.382',
      icon: DollarSign,
      trend: { value: 18.4, isPositive: true },
      description: 'Últimos 30 dias',
      colorClass: 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 border-emerald-500/30'
    }
  ];

  const recentCampaigns = [
    {
      name: 'Promoção Black Friday',
      type: 'WhatsApp + E-mail',
      status: 'Ativa',
      sent: 2847,
      opens: 1943,
      clicks: 312
    },
    {
      name: 'Carrinho Abandonado',
      type: 'E-mail',
      status: 'Pausada',
      sent: 1254,
      opens: 834,
      clicks: 127
    },
    {
      name: 'Novos Produtos',
      type: 'SMS',
      status: 'Agendada',
      sent: 0,
      opens: 0,
      clicks: 0
    }
  ];

  const chartDataDaily = [
    { periodo: '01/12', envios: 1850, aberturas: 1240, cliques: 320 },
    { periodo: '02/12', envios: 2100, aberturas: 1450, cliques: 380 },
    { periodo: '03/12', envios: 1920, aberturas: 1310, cliques: 340 },
    { periodo: '04/12', envios: 2450, aberturas: 1680, cliques: 420 },
    { periodo: '05/12', envios: 2280, aberturas: 1540, cliques: 390 },
    { periodo: '06/12', envios: 1540, aberturas: 1050, cliques: 280 },
    { periodo: '07/12', envios: 1707, aberturas: 1170, cliques: 290 }
  ];

  const chartDataWeekly = [
    { periodo: 'Seg', envios: 1850, aberturas: 1240, cliques: 320 },
    { periodo: 'Ter', envios: 2100, aberturas: 1450, cliques: 380 },
    { periodo: 'Qua', envios: 1920, aberturas: 1310, cliques: 340 },
    { periodo: 'Qui', envios: 2450, aberturas: 1680, cliques: 420 },
    { periodo: 'Sex', envios: 2280, aberturas: 1540, cliques: 390 },
    { periodo: 'Sáb', envios: 1540, aberturas: 1050, cliques: 280 },
    { periodo: 'Dom', envios: 1707, aberturas: 1170, cliques: 290 }
  ];

  const chartDataMonthly = [
    { periodo: 'Jan', envios: 45000, aberturas: 30500, cliques: 7800 },
    { periodo: 'Fev', envios: 52000, aberturas: 35400, cliques: 9200 },
    { periodo: 'Mar', envios: 48000, aberturas: 32800, cliques: 8500 },
    { periodo: 'Abr', envios: 61000, aberturas: 41500, cliques: 10800 },
    { periodo: 'Mai', envios: 58000, aberturas: 39400, cliques: 10200 },
    { periodo: 'Jun', envios: 54000, aberturas: 36800, cliques: 9500 }
  ];

  const getChartData = () => {
    switch (chartPeriod) {
      case 'diario':
        return chartDataDaily;
      case 'mensal':
        return chartDataMonthly;
      default:
        return chartDataWeekly;
    }
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

  return (
    <Layout 
      title="Visão Geral" 
      subtitle="Acompanhe o desempenho das suas campanhas"
    >
      <div className="space-y-6">
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
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAberturas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCliques" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
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

        {/* Segmentação Automática de Leads - Terceira Linha */}
        {hasIntegrations ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leadSegmentation.map((segment, index) => (
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
            <CustomerJourney />
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
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">WhatsApp</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">7.234 envios</p>
                  <p className="text-sm text-muted-foreground">76.3% abertura</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">E-mail</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">4.821 envios</p>
                  <p className="text-sm text-muted-foreground">58.7% abertura</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">SMS</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">792 envios</p>
                  <p className="text-sm text-muted-foreground">94.1% abertura</p>
                </div>
              </div>
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
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nova campanha criada</p>
                  <p className="text-xs text-muted-foreground">Promoção Black Friday - há 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Campanha finalizada</p>
                  <p className="text-xs text-muted-foreground">Newsletter Semanal - há 4 horas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novos contatos importados</p>
                  <p className="text-xs text-muted-foreground">1.247 contatos adicionados - há 6 horas</p>
                </div>
              </div>
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
                {recentCampaigns.map((campaign, index) => (
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