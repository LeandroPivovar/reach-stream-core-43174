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
    ? purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value
    : 0;
  
  const trend = lastPurchaseValue > averagePurchase ? 'up' : 'down';
  const trendPercentage = averagePurchase > 0
    ? Math.abs(((lastPurchaseValue - averagePurchase) / averagePurchase) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LTV Total</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  R$ {totalLtv.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  R$ {averagePurchase.toFixed(2)}
                </p>
                {trend === 'up' ? (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{trendPercentage}% vs média</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1">
                    <TrendingDown className="w-3 h-3" />
                    <span>-{trendPercentage}% vs média</span>
                  </div>
                )}
              </div>
              <ShoppingCart className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Compras</p>
                <p className="text-2xl font-bold">{purchases.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Primeira há {daysSinceFirst} dias
                </p>
              </div>
              <Calendar className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Última Compra</p>
              <p className="text-lg font-bold">R$ {lastPurchaseValue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Há {daysSinceLast} dias
              </p>
              {daysSinceLast > 30 && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  Risco de churn
                </Badge>
              )}
              {daysSinceLast <= 7 && (
                <Badge className="mt-2 text-xs bg-green-500">
                  Cliente ativo
                </Badge>
              )}
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
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
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
