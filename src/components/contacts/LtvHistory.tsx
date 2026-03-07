import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar } from 'lucide-react';

interface Purchase {
  id: number;
  date: string;
  value: number;
  product: string;
}

interface LtvHistoryProps {
  purchases: Purchase[];
  totalLtv: number;
}

export function LtvHistory({ purchases, totalLtv }: LtvHistoryProps) {
  // Processar dados para o gráfico - LTV acumulado ao longo do tempo
  const ltvOverTime = purchases
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc: any[], purchase, index) => {
      const previousLtv = index > 0 ? acc[index - 1].ltv : 0;
      acc.push({
        date: new Date(purchase.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        ltv: previousLtv + purchase.value,
        purchase: purchase.value,
        product: purchase.product
      });
      return acc;
    }, []);

  // Calcular métricas
  const averagePurchase = purchases.length > 0
    ? totalLtv / purchases.length
    : 0;

  const firstPurchase = purchases.length > 0
    ? new Date(purchases.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date)
    : null;

  const lastPurchase = purchases.length > 0
    ? new Date(purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)
    : null;

  const daysSinceFirst = firstPurchase
    ? Math.floor((new Date().getTime() - firstPurchase.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const daysSinceLast = lastPurchase
    ? Math.floor((new Date().getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calcular tendência (comparar última compra com a média)
  const lastPurchaseValue = purchases.length > 0
    ? [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value
    : 0;

  const trend = lastPurchaseValue >= averagePurchase ? 'up' : 'down';
  const trendPercentage = averagePurchase > 0
    ? Math.abs(((lastPurchaseValue - averagePurchase) / averagePurchase) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* LTV Total */}
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">LTV Total</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                  R$ {totalLtv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Médio */}
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  R$ {averagePurchase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center gap-1 text-[11px] font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                  {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{trend === 'up' ? '+' : '-'}{trendPercentage}% vs média</span>
                </div>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Compras */}
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total de Compras</p>
                <p className="text-2xl font-bold">{purchases.length}</p>
                <p className="text-[11px] text-muted-foreground">
                  {purchases.length > 0 ? `Primeira há ${daysSinceFirst} dias` : 'Nenhuma compra realizada'}
                </p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Última Compra */}
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Última Compra</p>
              <p className="text-xl font-bold">R$ {lastPurchaseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-[11px] text-muted-foreground">
                {purchases.length > 0 ? `Há ${daysSinceLast} dias` : 'Nenhuma data registrada'}
              </p>
              <div className="pt-1">
                {purchases.length > 0 && daysSinceLast > 30 ? (
                  <Badge variant="destructive" className="text-[10px] h-5 py-0">
                    Risco de churn
                  </Badge>
                ) : purchases.length > 0 ? (
                  <Badge className="text-[10px] h-5 py-0 bg-green-500 hover:bg-green-600 border-none">
                    Cliente ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] h-5 py-0 text-muted-foreground">
                    Sem atividade
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de evolução do LTV */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução do LTV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ltvOverTime}>
                <defs>
                  <linearGradient id="colorLtv" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(value: any, name: string) => {
                    if (name === 'ltv') return [`R$ ${value.toFixed(2)}`, 'LTV Acumulado'];
                    if (name === 'purchase') return [`R$ ${value.toFixed(2)}`, 'Valor da Compra'];
                    return value;
                  }}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="ltv"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorLtv)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="purchase"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Lista de compras */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {purchases
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{purchase.product}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      R$ {purchase.value.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
