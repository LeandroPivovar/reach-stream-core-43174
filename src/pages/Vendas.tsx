import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar as CalendarIcon,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Lightbulb,
  Package,
  X,
  CreditCard,
  Clock,
  Loader2,
  FileUp,
  TrendingDown,
  ArrowUpRight,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ManualSaleDialog } from '@/components/contacts/ManualSaleDialog';
import { ImportSalesDialog } from '@/components/sales/ImportSalesDialog';
import { SaleDetailsDialog } from '@/components/sales/SaleDetailsDialog';
import { api, Sale, DashboardStats, SalesByCampaign, SalesByChannel, TopProduct, PaymentMethodStats, FunnelStage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import InternalResponsiveTable from '@/components/common/responsive-table';
const ResponsiveTable = (typeof window !== 'undefined' && (window as any).ResponsiveTable) || InternalResponsiveTable;
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
import { cn, translatePaymentMethod } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export default function Vendas() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingBackground, setIsSyncingBackground] = useState(false);

  // Estados dos dados
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [salesByCampaign, setSalesByCampaign] = useState<SalesByCampaign[]>([]);
  const [salesByChannel, setSalesByChannel] = useState<SalesByChannel[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodStats[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]); // Funnel Data from API
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  // Estados para Busca e Paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Datas de comparação
  const [isManualSaleOpen, setIsManualSaleOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const days = dateRange?.from && dateRange?.to ? Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))) : 30;
      const filters = {
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString() || dateRange?.from?.toISOString()
      };

      const [stats, campaigns, channels, products, payments, funnel] = await Promise.all([
        api.getDashboardStats(days, filters),
        api.getSalesByCampaign(days, filters),
        api.getSalesByChannel(days, filters),
        api.getTopProducts(days, filters),
        api.getPaymentMethods(days, filters),
        api.getFunnelData(days, filters)
      ]);

      setDashboardStats(stats);
      setSalesByCampaign(campaigns);
      setSalesByChannel(channels);
      setTopProducts(products);
      setPaymentMethods(payments);
      setFunnelData(funnel);

      const sales = await api.getAllSales();
      setRecentSales(sales);

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
    const syncAllPlatforms = async () => {
      setIsSyncingBackground(true);
      try {
        await api.syncAllPlatforms();
        // Atualiza os dados novamente após a sincronização
        await fetchData();
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
      } finally {
        setIsSyncingBackground(false);
      }
    };

    fetchData().then(() => {
      syncAllPlatforms();
    });
  }, [dateRange]);

  const stats = [
    {
      title: 'Faturamento Total',
      value: dashboardStats ? `R$ ${dashboardStats.faturamento.toLocaleString('pt-BR')}` : 'R$ 0,00',
      icon: DollarSign,
      trend: { value: dashboardStats?.trends?.faturamento || 0, isPositive: (dashboardStats?.trends?.faturamento || 0) >= 0 },
      description: `Período selecionado`
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
      case 'venda manual':
      case 'manual':
        return 'bg-purple-500';
      case 'pix':
        return 'bg-cyan-500';
      case 'boleto':
        return 'bg-amber-500';
      case 'dinheiro':
        return 'bg-emerald-500';
      case 'cartão de crédito':
      case 'cartao de credito':
        return 'bg-indigo-500';
      case 'cartão de débito':
      case 'cartao de debito':
        return 'bg-rose-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Lógica de Filtro e Paginação
  const filteredSales = recentSales.filter(venda => {
    const searchLower = searchTerm.toLowerCase();
    return (
      venda.customerName?.toLowerCase().includes(searchLower) ||
      venda.customerEmail?.toLowerCase().includes(searchLower) ||
      venda.couponCode?.toLowerCase().includes(searchLower) ||
      venda.product?.name?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Dados detalhados das campanhas (mock - para manter funcionalidade do dialog enquanto não implementamos detalhe profundo)
  const campaignDetails: Record<string, any> = {
    // ... manter mocks ou deixar vazio ...
    // Vamos deixar vazio e mostrar apenas mensagem por enquanto
  };

  const currentCampaignDetails = selectedCampaign ? campaignDetails[selectedCampaign] : null;

  // Use funnelData from API
  const comparisonFunnelData = funnelData.length > 0 ? funnelData : [];

  return (
    <Layout
      title="Vendas"
      subtitle="Acompanhe o faturamento das suas campanhas"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportOpen(true)}
            className="hidden sm:flex"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button
            size="sm"
            onClick={() => setIsManualSaleOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
          <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />
          <div className="flex items-center gap-3">
            <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant="outline"
                   className={cn(
                     "w-[260px] justify-start text-left font-normal",
                     !dateRange && "text-muted-foreground"
                   )}
                 >
                   <CalendarIcon className="mr-2 h-4 w-4" />
                   {dateRange?.from ? (
                     dateRange.to ? (
                       <>
                         {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                         {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                       </>
                     ) : (
                       format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                     )
                   ) : (
                     <span>Selecione o período</span>
                   )}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="end">
                 <Calendar
                   initialFocus
                   mode="range"
                   defaultMonth={dateRange?.from}
                   selected={dateRange}
                   onSelect={setDateRange}
                   numberOfMonths={2}
                 />
               </PopoverContent>
             </Popover>
          </div>
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

        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento no Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Gráfico de Faturamento Diário */}
              <div className="h-[400px] w-full">
                {dashboardStats?.dailyRevenue && dashboardStats.dailyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dashboardStats.dailyRevenue.map(d => {
                        let formattedDate = 'Inválida';
                        if (d.date) {
                          const parsed = new Date(d.date);
                          if (!isNaN(parsed.getTime())) {
                            formattedDate = format(parsed, 'dd/MM', { locale: ptBR });
                          } else {
                            formattedDate = String(d.date);
                          }
                        }
                        return {
                          date: formattedDate,
                          faturamento: d.faturamento
                        };
                      })}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `R$ ${value}`} 
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--popover-foreground))'
                        }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
                        labelFormatter={(label) => `Data: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="faturamento"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorFaturamento)"
                        name="Faturamento"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                    {isLoading ? 'Carregando gráfico...' : 'Nenhum dado de faturamento no período selecionado.'}
                  </div>
                )}
              </div>

              {/* Insights do Período */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium mb-2">Insights do Período</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Faturamento do período selecionado: R$ {(dashboardStats?.faturamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                      <li>• Faturamento do período anterior: R$ {(dashboardStats?.previousFaturamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                      <li>• Crescimento: {(dashboardStats?.trends?.faturamento || 0).toFixed(1)}% em relação ao período anterior</li>
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
                Comparado ao período anterior
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
                          R$ {campanha.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      R$ {(dashboardStats?.faturamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                          R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {totalVendas} vendas ({(percentual || 0).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getChannelColor(canalData.canal)}`}
                        style={{ width: `${Math.min(percentual, 100)}%` }}
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
                          R$ {produto.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                            <p className="font-medium">{translatePaymentMethod(pagamento.metodo)}</p>
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
                          <p className="text-2xl font-bold">R$ {(pagamento.faturamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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

        {/* Listagem de Vendas com Busca e Paginação */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Histórico de Vendas</CardTitle>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, e-mail ou cupom..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reseta para primeira página na busca
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveTable<Sale>
              columns={[
                {
                  header: "Data",
                  accessorKey: "createdAt",
                  cell: (venda) => format(new Date(venda.createdAt), "dd/MM HH:mm", { locale: ptBR }),
                  className: "w-[120px]"
                },
                {
                  header: "Cliente",
                  cell: (venda) => (
                    <div>
                      <div className="text-sm font-semibold truncate max-w-[150px]">{venda.customerName || 'Sem nome'}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{venda.customerEmail}</div>
                    </div>
                  )
                },
                {
                  header: "Produto",
                  cell: (venda) => (
                    <div className="text-sm font-medium max-w-[180px] truncate">
                      {venda.product?.name || 'Produto Removido'}
                    </div>
                  )
                },
                {
                  header: "Itens",
                  accessorKey: "quantity",
                  className: "text-center w-[60px]",
                  cell: (venda) => venda.quantity || 1
                },
                {
                  header: "Campanha",
                  cell: (venda) => (
                    venda.couponCode ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] w-fit">
                          {venda.couponCode}
                        </Badge>
                        {venda.campaign && (
                          <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-2.5 h-2.5 text-blue-500" />
                            {venda.campaign.name}
                          </div>
                        )}
                      </div>
                    ) : "-"
                  )
                },
                {
                  header: "Valor",
                  className: "text-right",
                  cell: (venda) => (
                    <div className="text-right">
                      <div className="text-sm font-bold text-success">
                        R$ {Number(venda.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        {venda.quantity > 1 && `un. R$ ${Number(venda.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      </div>
                    </div>
                  )
                },
                {
                  header: "Status",
                  className: "text-right w-[100px]",
                  cell: (venda) => (
                    <Badge variant={venda.status === 'completed' ? 'default' : 'secondary'} className="text-[9px] uppercase font-bold">
                      {venda.status === 'completed' ? 'Pago' : 'Pendente'}
                    </Badge>
                  )
                }
              ]}
              data={currentSales}
              onRowClick={(venda) => {
                setSelectedSale(venda);
                setIsDetailsOpen(true);
              }}
              renderMobileCard={(venda) => (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                        {format(new Date(venda.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                      <h4 className="font-bold text-sm mt-0.5">{venda.customerName || 'Sem nome'}</h4>
                      <p className="text-[11px] text-muted-foreground">{venda.customerEmail}</p>
                    </div>
                    <Badge variant={venda.status === 'completed' ? 'default' : 'secondary'} className="text-[9px] uppercase">
                      {venda.status === 'completed' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-md">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                       <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{venda.product?.name || 'Produto Removido'}</p>
                      <p className="text-[10px] text-muted-foreground">{venda.quantity || 1} {venda.quantity > 1 ? 'itens' : 'item'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-success">
                        R$ {Number(venda.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {venda.couponCode && (
                    <div className="flex items-center gap-2">
                       <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px]">
                          {venda.couponCode}
                        </Badge>
                        {venda.campaign && (
                          <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-2.5 h-2.5 text-blue-500" />
                            {venda.campaign.name}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}
            />

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredSales.length)}</span> de <span className="font-medium">{filteredSales.length}</span> resultados
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Próximo
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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

      {isSyncingBackground && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium text-sm">Buscando novas informações...</span>
        </div>
      )}

      <ManualSaleDialog
        open={isManualSaleOpen}
        onOpenChange={setIsManualSaleOpen}
        onPurchaseCreated={() => {
          fetchData();
          toast({
            title: "Venda registrada",
            description: "A venda foi cadastrada com sucesso.",
          });
        }}
      />

      <ImportSalesDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportComplete={() => {
          fetchData();
        }}
      />

      <SaleDetailsDialog
        sale={selectedSale}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </Layout>
  );
}
