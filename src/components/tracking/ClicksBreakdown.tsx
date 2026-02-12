import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  CheckCircle,
  Package,
  Crown,
  ChevronDown,
  ChevronUp,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ExpandableCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
  loading?: boolean;
}

function ExpandableCard({ title, value, subtitle, icon: Icon, color, children, loading }: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={cn("transition-all", isExpanded && "col-span-2")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{loading ? '...' : subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{loading ? '...' : value}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
          disabled={loading}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Ver Menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Ver Detalhes
            </>
          )}
        </Button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ClicksBreakdownProps {
  periodDays?: number;
}

export function ClicksBreakdown({ periodDays = 30 }: ClicksBreakdownProps) {
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['pixel-metrics', periodDays],
    queryFn: () => api.getPixelMetrics(periodDays),
    refetchInterval: 30000,
  });

  const breakdown = metricsData?.clicksBreakdown;

  // Fallback / Skeleton data structure to avoid crashes while loading or if empty
  const defaultBreakdown = {
    abandonedCarts: {
      total: 0,
      value: 'R$ 0,00',
      items: []
    },
    completedPurchases: {
      total: 0,
      value: 'R$ 0,00',
      avgTicket: 'R$ 0,00',
      items: []
    },
    topProducts: [],
    topCustomers: []
  };

  const data = breakdown || defaultBreakdown;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento dos Cliques</CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise completa do comportamento pós-clique
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Carrinhos Abandonados */}
          <ExpandableCard
            title="Carrinhos Abandonados"
            value={data.abandonedCarts.total}
            subtitle={`Valor total: ${data.abandonedCarts.value}`}
            icon={ShoppingCart}
            color="bg-orange-500"
            loading={isLoading}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="font-semibold">Produtos em Carrinhos</span>
                <Badge variant="outline">Top 5</Badge>
              </div>
              {data.abandonedCarts.items.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-2">Sem dados de carrinhos.</div>
              ) : (
                data.abandonedCarts.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-700 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.product}</p>
                        <p className="text-xs text-muted-foreground">{item.count} carrinhos</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">{item.value}</p>
                  </div>
                ))
              )}
              <div className="mt-4 p-3 bg-orange-500/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Oportunidade de Recuperação</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                  {data.abandonedCarts.value}
                </p>
              </div>
            </div>
          </ExpandableCard>

          {/* Compras Realizadas */}
          <ExpandableCard
            title="Compras Realizadas"
            value={data.completedPurchases.total}
            subtitle={`Faturamento: ${data.completedPurchases.value}`}
            icon={CheckCircle}
            color="bg-green-500"
            loading={isLoading}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Ticket Médio</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">
                    {data.completedPurchases.avgTicket}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">
                    {data.completedPurchases.value}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold">Últimas Compras</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.completedPurchases.items.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground py-2">Nenhuma compra registrada.</div>
                ) : (
                  data.completedPurchases.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-muted/30 rounded-lg text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.customer}</span>
                        <Badge variant="default" className="text-xs">
                          {item.value}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.product} • {item.date}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ExpandableCard>

          {/* Produtos Mais Vendidos */}
          <ExpandableCard
            title="Produtos Mais Vendidos"
            value={(data.topProducts[0]?.sales || 0)}
            subtitle={`Líder: ${data.topProducts[0]?.name || 'N/A'}`}
            icon={Package}
            color="bg-blue-500"
            loading={isLoading}
          >
            <div className="space-y-3">
              {data.topProducts.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-2">Sem vendas.</div>
              ) : (
                data.topProducts.map((product: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {product.sales} vendas
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{product.revenue}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ExpandableCard>

          {/* Clientes que Mais Compraram */}
          <ExpandableCard
            title="Top Clientes"
            value={(data.topCustomers[0]?.purchases || 0)}
            subtitle={data.topCustomers[0] ? `${data.topCustomers[0].name} - ${data.topCustomers[0].total}` : 'N/A'}
            icon={Crown}
            color="bg-purple-500"
            loading={isLoading}
          >
            <div className="space-y-3">
              {data.topCustomers.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-2">Sem clientes.</div>
              ) : (
                data.topCustomers.map((customer: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-400 font-bold">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        {index === 0 && (
                          <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{customer.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {customer.purchases} compras
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-purple-700 dark:text-purple-400">
                        {customer.total}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ExpandableCard>
        </div>
      </CardContent>
    </Card>
  );
}
