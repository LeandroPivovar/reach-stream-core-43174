import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Calendar,
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Vendas() {
  const [period, setPeriod] = useState('15');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [comparePeriod1, setComparePeriod1] = useState('15');
  const [comparePeriod2, setComparePeriod2] = useState('30');

  // Dados mock - em produção viriam de uma API
  const salesData = {
    '7': {
      faturamento: 45800,
      vendas: 127,
      ticketMedio: 360.63,
      trends: {
        faturamento: 15.3,
        vendas: 12.8,
        ticketMedio: 2.2
      },
      campanhas: [
        { nome: 'Promoção Black Friday', canal: 'WhatsApp', faturamento: 18500, vendas: 52 },
        { nome: 'E-mail Marketing Semanal', canal: 'E-mail', faturamento: 12300, vendas: 38 },
        { nome: 'Recuperação de Carrinho', canal: 'E-mail', faturamento: 8900, vendas: 24 },
        { nome: 'SMS Flash Sale', canal: 'SMS', faturamento: 6100, vendas: 13 }
      ]
    },
    '15': {
      faturamento: 98700,
      vendas: 284,
      ticketMedio: 347.54,
      trends: {
        faturamento: 22.4,
        vendas: 18.6,
        ticketMedio: 3.2
      },
      campanhas: [
        { nome: 'Promoção Black Friday', canal: 'WhatsApp', faturamento: 38200, vendas: 112 },
        { nome: 'E-mail Marketing Semanal', canal: 'E-mail', faturamento: 26500, vendas: 81 },
        { nome: 'Recuperação de Carrinho', canal: 'E-mail', faturamento: 18900, vendas: 54 },
        { nome: 'SMS Flash Sale', canal: 'SMS', faturamento: 15100, vendas: 37 }
      ]
    },
    '30': {
      faturamento: 187500,
      vendas: 542,
      ticketMedio: 345.94,
      trends: {
        faturamento: 18.7,
        vendas: 15.2,
        ticketMedio: 3.0
      },
      campanhas: [
        { nome: 'Promoção Black Friday', canal: 'WhatsApp', faturamento: 72400, vendas: 218 },
        { nome: 'E-mail Marketing Semanal', canal: 'E-mail', faturamento: 51200, vendas: 156 },
        { nome: 'Recuperação de Carrinho', canal: 'E-mail', faturamento: 38700, vendas: 108 },
        { nome: 'SMS Flash Sale', canal: 'SMS', faturamento: 25200, vendas: 60 }
      ]
    }
  };

  const currentData = salesData[period as keyof typeof salesData];

  const stats = [
    {
      title: 'Faturamento Total',
      value: `R$ ${currentData.faturamento.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      trend: { value: currentData.trends.faturamento, isPositive: true },
      description: `Últimos ${period} dias`
    },
    {
      title: 'Vendas Realizadas',
      value: currentData.vendas.toString(),
      icon: ShoppingCart,
      trend: { value: currentData.trends.vendas, isPositive: true },
      description: 'Total de transações'
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${currentData.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      trend: { value: currentData.trends.ticketMedio, isPositive: true },
      description: 'Valor médio por venda'
    }
  ];

  const getChannelColor = (canal: string) => {
    switch (canal) {
      case 'WhatsApp':
        return 'bg-green-500';
      case 'E-mail':
        return 'bg-blue-500';
      case 'SMS':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Dados detalhados das campanhas (mock)
  const campaignDetails: Record<string, any> = {
    'Promoção Black Friday': {
      produtos: [
        { nome: 'Notebook Dell', quantidade: 45, faturamento: 67500, ticketMedio: 1500 },
        { nome: 'Mouse Logitech', quantidade: 89, faturamento: 4450, ticketMedio: 50 },
        { nome: 'Teclado Mecânico', quantidade: 67, faturamento: 20100, ticketMedio: 300 },
        { nome: 'Monitor Samsung', quantidade: 17, faturamento: 10200, ticketMedio: 600 }
      ],
      evolucao: [
        { dia: 'Dia 1', vendas: 8, faturamento: 2800 },
        { dia: 'Dia 2', vendas: 15, faturamento: 5100 },
        { dia: 'Dia 3', vendas: 22, faturamento: 7800 },
        { dia: 'Dia 4', vendas: 31, faturamento: 10900 },
        { dia: 'Dia 5', vendas: 36, faturamento: 12600 }
      ],
      insights: [
        'Taxa de conversão 23% acima da média - considere estender a campanha',
        'Horário de pico: 19h-21h - programe envios neste período',
        'Produtos com desconto acima de 30% tiveram melhor performance'
      ]
    },
    'E-mail Marketing Semanal': {
      produtos: [
        { nome: 'Curso Online', quantidade: 124, faturamento: 18600, ticketMedio: 150 },
        { nome: 'E-book Premium', quantidade: 89, faturamento: 4450, ticketMedio: 50 },
        { nome: 'Consultoria', quantidade: 12, faturamento: 12000, ticketMedio: 1000 }
      ],
      evolucao: [
        { dia: 'Sem 1', vendas: 12, faturamento: 1800 },
        { dia: 'Sem 2', vendas: 18, faturamento: 2700 },
        { dia: 'Sem 3', vendas: 25, faturamento: 3800 },
        { dia: 'Sem 4', vendas: 26, faturamento: 3900 }
      ],
      insights: [
        'Taxa de abertura de 32% - teste linhas de assunto mais criativas',
        'Segmente por interesse para aumentar conversão',
        'CTR maior em terças e quintas-feiras'
      ]
    },
    'Recuperação de Carrinho': {
      produtos: [
        { nome: 'Tênis Esportivo', quantidade: 78, faturamento: 23400, ticketMedio: 300 },
        { nome: 'Camisa Premium', quantidade: 134, faturamento: 13400, ticketMedio: 100 },
        { nome: 'Jaqueta', quantidade: 45, faturamento: 13500, ticketMedio: 300 }
      ],
      evolucao: [
        { dia: 'Sem 1', vendas: 15, faturamento: 4500 },
        { dia: 'Sem 2', vendas: 18, faturamento: 5400 },
        { dia: 'Sem 3', vendas: 21, faturamento: 6300 },
        { dia: 'Sem 4', vendas: 24, faturamento: 7200 }
      ],
      insights: [
        'Envie lembrete após 1h de abandono - maior taxa de retorno',
        'Ofereça cupom de 10% no segundo e-mail',
        'Taxa de recuperação de 18% - acima da média do setor'
      ]
    },
    'SMS Flash Sale': {
      produtos: [
        { nome: 'Smartphone', quantidade: 34, faturamento: 51000, ticketMedio: 1500 },
        { nome: 'Fone Bluetooth', quantidade: 89, faturamento: 8900, ticketMedio: 100 },
        { nome: 'Carregador Rápido', quantidade: 67, faturamento: 3350, ticketMedio: 50 }
      ],
      evolucao: [
        { dia: '0-2h', vendas: 8, faturamento: 2400 },
        { dia: '2-4h', vendas: 12, faturamento: 3600 },
        { dia: '4-6h', vendas: 9, faturamento: 2700 },
        { dia: '6-8h', vendas: 8, faturamento: 2400 }
      ],
      insights: [
        'Conversão imediata alta - ideal para ofertas urgentes',
        'Limite o número de caracteres para melhor entrega',
        'Taxa de resposta de 15% nos primeiros 30 minutos'
      ]
    }
  };

  const currentCampaignDetails = selectedCampaign ? campaignDetails[selectedCampaign] : null;

  // Dados para comparação de períodos
  const getComparisonData = () => {
    const data1 = salesData[comparePeriod1 as keyof typeof salesData];
    const data2 = salesData[comparePeriod2 as keyof typeof salesData];
    
    return [
      {
        name: `${comparePeriod1} dias`,
        faturamento: data1.faturamento,
        vendas: data1.vendas,
        ticketMedio: data1.ticketMedio
      },
      {
        name: `${comparePeriod2} dias`,
        faturamento: data2.faturamento,
        vendas: data2.vendas,
        ticketMedio: data2.ticketMedio
      }
    ];
  };

  const comparisonData = getComparisonData();

  // Dados do funil de vendas
  const funnelData = [
    {
      stage: 'Leads Gerados',
      value: 1000,
      percentage: 100,
      quantidade: 1000,
      tempoMedio: '0 dias',
      color: 'hsl(var(--chart-1))'
    },
    {
      stage: 'Abriram Campanha',
      value: 650,
      percentage: 65,
      quantidade: 650,
      tempoMedio: '2 horas',
      color: 'hsl(var(--chart-2))'
    },
    {
      stage: 'Clicaram Link',
      value: 420,
      percentage: 42,
      quantidade: 420,
      tempoMedio: '1 dia',
      color: 'hsl(var(--chart-3))'
    },
    {
      stage: 'Adicionaram Carrinho',
      value: 315,
      percentage: 31.5,
      quantidade: 315,
      tempoMedio: '3 dias',
      color: 'hsl(var(--chart-4))'
    },
    {
      stage: 'Finalizaram Compra',
      value: currentData.vendas,
      percentage: (currentData.vendas / 1000) * 100,
      quantidade: currentData.vendas,
      tempoMedio: '5 dias',
      color: 'hsl(var(--primary))'
    }
  ];

  return (
    <Layout 
      title="Vendas" 
      subtitle="Acompanhe o faturamento das suas campanhas"
      actions={
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
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

        {/* Comparison Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Comparação de Vendas entre Períodos</CardTitle>
              <div className="flex items-center gap-3">
                <Select value={comparePeriod1} onValueChange={setComparePeriod1}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-sm">vs</span>
                <Select value={comparePeriod2} onValueChange={setComparePeriod2}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Gráfico de Faturamento */}
              <div>
                <h4 className="text-sm font-medium mb-4">Faturamento</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="faturamento" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Vendas */}
              <div>
                <h4 className="text-sm font-medium mb-4">Número de Vendas</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [value, 'Vendas']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="vendas" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--chart-2))', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Ticket Médio */}
              <div>
                <h4 className="text-sm font-medium mb-4">Ticket Médio</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Ticket Médio']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ticketMedio" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--chart-3))', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Funil */}
              <div className="pt-6 border-t border-border">
                <h4 className="text-lg font-semibold mb-6">Gráfico de Funil de Vendas</h4>
                
                {/* Cards de Métricas do Funil */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {funnelData.map((stage, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: stage.color }}
                        />
                        <p className="text-xs font-medium text-muted-foreground">
                          {stage.stage}
                        </p>
                      </div>
                      <p className="text-xl font-bold mb-1">
                        {stage.quantidade}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Quantidade: <span className="font-medium">{stage.quantidade} leads</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tempo médio: <span className="font-medium">{stage.tempoMedio}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gráfico de Área do Funil */}
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart 
                    data={funnelData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="funnelGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
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
                      formatter={(value: number) => [value, 'Quantidade']}
                      labelFormatter={(label) => `Etapa: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#funnelGradient)"
                      label={{
                        position: 'top',
                        formatter: (value: number, entry: any, index: number) => {
                          const percentage = funnelData[index]?.percentage;
                          return percentage ? `${percentage.toFixed(1)}%` : '';
                        },
                        className: 'fill-foreground text-xs font-medium'
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Insights do Funil */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium mb-2">Insights do Funil</h5>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Taxa de conversão geral: {((currentData.vendas / 1000) * 100).toFixed(1)}%</li>
                        <li>• Maior perda entre "Clicaram Link" e "Adicionaram Carrinho" (10.5%)</li>
                        <li>• Otimize a experiência da página de produto para aumentar conversões</li>
                        <li>• Considere remarketing para os 315 leads com carrinho abandonado</li>
                      </ul>
                    </div>
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
                  {currentData.campanhas.map((campanha, index) => {
                    const ticketMedio = campanha.faturamento / campanha.vendas;
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
                    <td className="py-4 px-2 text-right">{currentData.vendas}</td>
                    <td className="py-4 px-2 text-right text-success">
                      R$ {currentData.faturamento.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-2 text-right text-muted-foreground">
                      R$ {currentData.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              {['WhatsApp', 'E-mail', 'SMS'].map((canal) => {
                const campanhasCanal = currentData.campanhas.filter(c => c.canal === canal);
                const totalFaturamento = campanhasCanal.reduce((acc, c) => acc + c.faturamento, 0);
                const totalVendas = campanhasCanal.reduce((acc, c) => acc + c.vendas, 0);
                const percentual = (totalFaturamento / currentData.faturamento) * 100;
                
                return (
                  <div key={canal} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getChannelColor(canal)}`}></div>
                        <span className="font-medium">{canal}</span>
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
                        className={`h-2 rounded-full ${getChannelColor(canal)}`}
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
                {[
                  { nome: 'Notebook Dell', vendas: 145, faturamento: 217500 },
                  { nome: 'Mouse Logitech', vendas: 289, faturamento: 14450 },
                  { nome: 'Teclado Mecânico', vendas: 234, faturamento: 70200 },
                  { nome: 'Monitor Samsung', vendas: 89, faturamento: 53400 },
                  { nome: 'Webcam HD', vendas: 156, faturamento: 46800 }
                ].map((produto, index) => {
                  const ticketMedio = produto.faturamento / produto.vendas;
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
                {[
                  { 
                    metodo: 'PIX', 
                    percentual: 48.9, 
                    transacoes: 234, 
                    tempoMedio: '2 min',
                    color: 'bg-teal-500'
                  },
                  { 
                    metodo: 'Cartão de Crédito', 
                    percentual: 32.6, 
                    transacoes: 156, 
                    tempoMedio: '5 min',
                    color: 'bg-blue-500'
                  },
                  { 
                    metodo: 'Boleto', 
                    percentual: 14.0, 
                    transacoes: 67, 
                    tempoMedio: '8 min',
                    color: 'bg-orange-500'
                  },
                  { 
                    metodo: 'Cartão de Débito', 
                    percentual: 4.5, 
                    transacoes: 22, 
                    tempoMedio: '3 min',
                    color: 'bg-purple-500'
                  }
                ].map((pagamento, index) => (
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
                        <p className="text-2xl font-bold">{pagamento.percentual}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${pagamento.color}`}
                        style={{ width: `${pagamento.percentual}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
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
