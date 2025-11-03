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

interface ExpandableCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
}

function ExpandableCard({ title, value, subtitle, icon: Icon, color, children }: ExpandableCardProps) {
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
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{value}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
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

export function ClicksBreakdown() {
  const abandonedCarts = {
    total: 342,
    value: 'R$ 48.523,00',
    items: [
      { product: 'Produto Premium', count: 89, value: 'R$ 17.711,00' },
      { product: 'Kit Básico', count: 67, value: 'R$ 10.050,00' },
      { product: 'Upgrade Plus', count: 54, value: 'R$ 10.260,00' },
      { product: 'Bundle Completo', count: 45, value: 'R$ 6.750,00' },
      { product: 'Add-on Extra', count: 87, value: 'R$ 3.752,00' }
    ]
  };

  const completedPurchases = {
    total: 156,
    value: 'R$ 73.840,00',
    avgTicket: 'R$ 473,33',
    items: [
      { date: '2025-01-15', customer: 'Ana Silva', product: 'Produto Premium', value: 'R$ 199,00' },
      { date: '2025-01-15', customer: 'Carlos Santos', product: 'Kit Básico', value: 'R$ 149,90' },
      { date: '2025-01-14', customer: 'Mariana Costa', product: 'Bundle Completo', value: 'R$ 299,00' },
      { date: '2025-01-14', customer: 'João Oliveira', product: 'Upgrade Plus', value: 'R$ 189,90' },
      { date: '2025-01-14', customer: 'Patricia Lima', product: 'Add-on Extra', value: 'R$ 99,90' }
    ]
  };

  const topProducts = [
    { name: 'Produto Premium', sales: 89, revenue: 'R$ 17.711,00', conversion: 5.2 },
    { name: 'Bundle Completo', sales: 67, revenue: 'R$ 20.033,00', conversion: 4.8 },
    { name: 'Kit Básico', sales: 54, revenue: 'R$ 8.095,00', conversion: 3.9 },
    { name: 'Upgrade Plus', sales: 45, revenue: 'R$ 8.546,00', conversion: 3.2 },
    { name: 'Add-on Extra', sales: 34, revenue: 'R$ 3.397,00', conversion: 2.4 }
  ];

  const topCustomers = [
    { name: 'Mariana Costa', purchases: 12, total: 'R$ 3.588,80', avgTicket: 'R$ 299,07' },
    { name: 'Ana Silva', purchases: 8, total: 'R$ 2.288,90', avgTicket: 'R$ 286,11' },
    { name: 'Carlos Santos', purchases: 7, total: 'R$ 1.848,00', avgTicket: 'R$ 264,00' },
    { name: 'João Oliveira', purchases: 6, total: 'R$ 1.671,00', avgTicket: 'R$ 278,50' },
    { name: 'Patricia Lima', purchases: 5, total: 'R$ 1.249,50', avgTicket: 'R$ 249,90' }
  ];

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
            value={abandonedCarts.total}
            subtitle={`Valor total: ${abandonedCarts.value}`}
            icon={ShoppingCart}
            color="bg-orange-500"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="font-semibold">Produtos Abandonados</span>
                <Badge variant="outline">Top 5</Badge>
              </div>
              {abandonedCarts.items.map((item, index) => (
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
              ))}
              <div className="mt-4 p-3 bg-orange-500/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Oportunidade de Recuperação</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                  {abandonedCarts.value}
                </p>
              </div>
            </div>
          </ExpandableCard>

          {/* Compras Realizadas */}
          <ExpandableCard
            title="Compras Realizadas"
            value={completedPurchases.total}
            subtitle={`Faturamento: ${completedPurchases.value}`}
            icon={CheckCircle}
            color="bg-green-500"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Ticket Médio</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">
                    {completedPurchases.avgTicket}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">
                    {completedPurchases.value}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold">Últimas Compras</span>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {completedPurchases.items.map((item, index) => (
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
                ))}
              </div>
            </div>
          </ExpandableCard>

          {/* Produtos Mais Vendidos */}
          <ExpandableCard
            title="Produtos Mais Vendidos"
            value={topProducts[0].sales}
            subtitle={`Líder: ${topProducts[0].name}`}
            icon={Package}
            color="bg-blue-500"
          >
            <div className="space-y-3">
              {topProducts.map((product, index) => (
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
                        <span className="text-xs text-muted-foreground">
                          {product.conversion}% conversão
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </ExpandableCard>

          {/* Clientes que Mais Compraram */}
          <ExpandableCard
            title="Top Clientes"
            value={topCustomers[0].purchases}
            subtitle={`${topCustomers[0].name} - ${topCustomers[0].total}`}
            icon={Crown}
            color="bg-purple-500"
          >
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
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
                        <span className="text-xs text-muted-foreground">
                          Ticket: {customer.avgTicket}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-purple-700 dark:text-purple-400">
                      {customer.total}
                    </p>
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <p className="text-xs text-muted-foreground">
                    Top 5 clientes representam <span className="font-bold text-purple-700 dark:text-purple-400">34%</span> do faturamento
                  </p>
                </div>
              </div>
            </div>
          </ExpandableCard>
        </div>
      </CardContent>
    </Card>
  );
}
