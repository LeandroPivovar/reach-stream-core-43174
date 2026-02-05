import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar as CalendarIcon,
  ChevronRight,
  Lightbulb,
  Package,
  X,
  CreditCard,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';

import { api, DashboardStats, SalesByCampaign, SalesByChannel, TopProduct, PaymentMethodStats, FunnelStage } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

export default function Vendas() {
  const [period, setPeriod] = useState('15');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos dados
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [salesByCampaign, setSalesByCampaign] = useState<SalesByCampaign[]>([]);
  const [salesByChannel, setSalesByChannel] = useState<SalesByChannel[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodStats[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]); // Funnel Data from API

  // Datas de comparação
  const [compareStartDate, setCompareStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 15)));
  const [compareEndDate, setCompareEndDate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const days = parseInt(period);

      const [stats, campaigns, channels, products, payments, funnel] = await Promise.all([
        api.getDashboardStats(days),
        api.getSalesByCampaign(days),
        api.getSalesByChannel(days),
        api.getTopProducts(days),
        api.getPaymentMethods(days),
        api.getFunnelData(days)
      ]);

      setDashboardStats(stats);
      setSalesByCampaign(campaigns);
      setSalesByChannel(channels);
      setTopProducts(products);
      setPaymentMethods(payments);
      setFunnelData(funnel);

    } catch (error) {
      console.error('Erro ao carregar dados de vendas:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as métricas de vendas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const stats = [
    {
      title: 'Faturamento Total',
      value: dashboardStats ? `R$ ${dashboardStats.faturamento.toLocaleString('pt-BR')}` : 'R$ 0,00',
      icon: DollarSign,
      trend: { value: dashboardStats?.trends?.faturamento || 0, isPositive: (dashboardStats?.trends?.faturamento || 0) >= 0 },
      description: `Últimos ${period} dias`
    },
    {
      title: 'Vendas Realizadas',
      value: dashboardStats ? dashboardStats.vendas.toString() : '0',
      icon: ShoppingCart,
      trend: { value: dashboardStats?.trends?.vendas || 0, isPositive: (dashboardStats?.trends?.vendas || 0) >= 0 },
      description: 'Total de transações'
    },
    {
      title: 'Ticket Médio',
      value: dashboardStats ? `R$ ${dashboardStats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
      icon: TrendingUp,
      trend: { value: dashboardStats?.trends?.ticketMedio || 0, isPositive: (dashboardStats?.trends?.ticketMedio || 0) >= 0 },
      description: 'Valor médio por venda'
    }
  ];

  const getChannelColor = (canal: string) => {
    switch (canal?.toLowerCase()) {
      case 'whatsapp':
        return 'bg-green-500';
      case 'email':
      case 'e-mail':
        return 'bg-blue-500';
      case 'sms':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Dados detalhados das campanhas (mock - para manter funcionalidade do dialog enquanto não implementamos detalhe profundo)
  const campaignDetails: Record<string, any> = {
    // ... manter mocks ou deixar vazio ...
    // Vamos deixar vazio e mostrar apenas mensagem por enquanto
  };

  const currentCampaignDetails = selectedCampaign ? campaignDetails[selectedCampaign] : null;

  // Use funnelData from API
  const comparisonFunnelData = funnelData.length > 0 ? funnelData : [
    { stage: 'Leads Gerados', value: 0, percentage: 0 },
    { stage: 'Abriram Campanha', value: 0, percentage: 0 },
    { stage: 'Clicaram Link', value: 0, percentage: 0 },
    { stage: 'Adicionaram Carrinho', value: 0, percentage: 0 },
    { stage: 'Finalizaram Compra', value: 0, percentage: 0 }
  ];

  return (
    <Layout
      title="Vendas"
      subtitle="Acompanhe o faturamento das suas campanhas"
      actions={
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="15">Últimos 15 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Comparison Funnel Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle>Comparação de Funil entre Períodos</CardTitle>

              {/* Seletores de Data */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Selecione o período para análise</p>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal flex-1",
                          !compareStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {compareStartDate ? format(compareStartDate, "dd/MM/yyyy", { locale: ptBR }) : "Data de início"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={compareStartDate}
                        onSelect={(date) => date && setCompareStartDate(date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-muted-foreground">até</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal flex-1",
                          !compareEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {compareEndDate ? format(compareEndDate, "dd/MM/yyyy", { locale: ptBR }) : "Data de fim"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={compareEndDate}
                        onSelect={(date) => date && setCompareEndDate(date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Gráfico de Funil */}
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={comparisonFunnelData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="stage"
                    className="text-xs"
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value, '']}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* Detalhes do Funil */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-sm">Etapa do Funil</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Quantidade</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Taxa de Conversão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFunnelData.map((stage, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="py-3 px-4 font-medium">{stage.stage}</td>
                        <td className="py-3 px-4 text-right">{stage.value.toLocaleString('pt-BR')}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-primary">
                            {stage.percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Insights do Período */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium mb-2">Insights do Período</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Total de {comparisonFunnelData[0].value} leads gerados no período selecionado</li>
                      <li>• Taxa de conversão final de {comparisonFunnelData[4].percentage.toFixed(1)}% (leads para compras)</li>
                      <li>• Maior queda entre "{comparisonFunnelData[1].stage}" e "{comparisonFunnelData[2].stage}"</li>
                      <li>• Ajuste o período para comparar diferentes intervalos de tempo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Campaign */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vendas por Campanha</CardTitle>
              <Badge variant="outline">
                Comparado aos {period} dias anteriores
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Campanha</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Canal</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Vendas</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Faturamento</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByCampaign.map((campanha, index) => {
                    const ticketMedio = campanha.vendas > 0 ? campanha.faturamento / campanha.vendas : 0;
                    return (
                      <tr
                        key={index}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedCampaign(campanha.nome)}
                      >
                        <td className="py-4 px-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{campanha.nome}</div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getChannelColor(campanha.canal)}`}></div>
                            <span className="text-sm">{campanha.canal}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right font-medium">
                          {campanha.vendas}
                        </td>
                        <td className="py-4 px-2 text-right font-semibold text-success">
                          R$ {campanha.faturamento.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-4 px-2 text-right text-muted-foreground">
                          R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-border">
                  <tr className="font-semibold">
                    <td className="py-4 px-2" colSpan={2}>Total</td>
                    <td className="py-4 px-2 text-right">{dashboardStats?.vendas || 0}</td>
                    <td className="py-4 px-2 text-right text-success">
                      R$ {(dashboardStats?.faturamento || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-2 text-right text-muted-foreground">
                      R$ {(dashboardStats?.ticketMedio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Performance by Channel */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesByChannel.map((canalData) => {
                const totalFaturamento = canalData.faturamento;
                const totalVendas = canalData.vendas;
                const percentual = dashboardStats && dashboardStats.faturamento > 0
                  ? (totalFaturamento / dashboardStats.faturamento) * 100
                  : 0;

                return (
                  <div key={canalData.canal} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getChannelColor(canalData.canal)}`}></div>
                        <span className="font-medium">{canalData.canal}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success">
                          R$ {totalFaturamento.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {totalVendas} vendas ({percentual.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getChannelColor(canalData.canal)}`}
                        style={{ width: `${percentual}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Produtos Mais Vendidos e Meios de Pagamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produtos Mais Vendidos */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((produto, index) => {
                  const ticketMedio = produto.vendas > 0 ? produto.faturamento / produto.vendas : 0;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{produto.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {produto.vendas} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success">
                          R$ {produto.faturamento.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /un
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Meios de Pagamento Utilizados */}
          <Card>
            <CardHeader>
              <CardTitle>Meios de Pagamento Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {paymentMethods.map((pagamento, index) => {
                  const colors = ['bg-teal-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500'];
                  const color = colors[index % colors.length];

                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{pagamento.metodo}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{pagamento.transacoes} transações</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Tempo médio: {pagamento.tempoMedio}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{pagamento.percentual.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${pagamento.percentual}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Detalhes da Campanha */}
      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedCampaign}</span>
            </DialogTitle>
          </DialogHeader>

          {currentCampaignDetails && (
            <div className="space-y-6 mt-4">
              {/* Produtos Vendidos */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Produtos Vendidos</h3>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-sm">Produto</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Quantidade</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Faturamento</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Ticket Médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCampaignDetails.produtos.map((produto: any, idx: number) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="py-3 px-4 font-medium">{produto.nome}</td>
                          <td className="py-3 px-4 text-right">{produto.quantidade}</td>
                          <td className="py-3 px-4 text-right text-success font-semibold">
                            R$ {produto.faturamento.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            R$ {produto.ticketMedio.toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gráfico de Evolução */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Evolução de Vendas</h3>
                <div className="border rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={currentCampaignDetails.evolucao}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="dia"
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
                      />
                      <Line
                        type="monotone"
                        dataKey="faturamento"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insights e Dicas */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Insights e Recomendações</h3>
                </div>
                <div className="space-y-3">
                  {currentCampaignDetails.insights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
