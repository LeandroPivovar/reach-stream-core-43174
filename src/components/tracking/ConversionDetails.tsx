import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  MapPin, 
  CreditCard,
  Package,
  ArrowRight
} from 'lucide-react';

export function ConversionDetails() {
  const conversionSources = [
    { source: 'Facebook Ads', conversions: 189, percentage: 39.5, color: 'bg-blue-500' },
    { source: 'Google Ads', conversions: 156, percentage: 32.6, color: 'bg-red-500' },
    { source: 'Instagram', conversions: 89, percentage: 18.6, color: 'bg-pink-500' },
    { source: 'Orgânico', conversions: 45, percentage: 9.3, color: 'bg-green-500' }
  ];

  const convertingProducts = [
    { 
      name: 'Produto Premium', 
      conversions: 234, 
      rate: 5.2,
      from: 'Landing Page Black Friday',
      trend: '+12%'
    },
    { 
      name: 'Bundle Completo', 
      conversions: 156, 
      rate: 4.8,
      from: 'Campanha Newsletter',
      trend: '+8%'
    },
    { 
      name: 'Kit Básico', 
      conversions: 89, 
      rate: 3.9,
      from: 'Facebook Ads',
      trend: '+5%'
    }
  ];

  const paymentMethods = [
    { method: 'PIX', usage: 234, percentage: 48.9, avgTime: '2 min', color: 'bg-teal-500' },
    { method: 'Cartão de Crédito', usage: 156, percentage: 32.6, avgTime: '5 min', color: 'bg-purple-500' },
    { method: 'Boleto', usage: 67, percentage: 14.0, avgTime: '8 min', color: 'bg-orange-500' },
    { method: 'Cartão de Débito', usage: 22, percentage: 4.5, avgTime: '4 min', color: 'bg-blue-500' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Detalhamento da Taxa de Conversão
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise aprofundada do que está convertendo e como
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* O que está convertendo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">O que está convertendo</h3>
            </div>
            
            {convertingProducts.map((product, index) => (
              <div 
                key={index}
                className="p-4 bg-muted/30 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    {product.trend}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Conversões</span>
                  <span className="font-semibold">{product.conversions}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taxa</span>
                  <Badge variant="outline">{product.rate}%</Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                  <MapPin className="w-3 h-3" />
                  <span>Origem:</span>
                  <span className="font-medium text-foreground">{product.from}</span>
                </div>
              </div>
            ))}
          </div>

          {/* De onde veio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">De onde vieram as conversões</h3>
            </div>
            
            <div className="space-y-3">
              {conversionSources.map((source, index) => (
                <div 
                  key={index}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${source.color}`} />
                      <span className="font-medium text-sm">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm">{source.conversions}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({source.percentage}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${source.color} transition-all duration-500`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Meios de Pagamento */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Meios de Pagamento Utilizados</h3>
              </div>
              
              <div className="space-y-3">
                {paymentMethods.map((payment, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${payment.color}`} />
                        <span className="font-medium text-sm">{payment.method}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {payment.percentage}%
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{payment.usage} transações</span>
                      <span>Tempo médio: {payment.avgTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Insights de Conversão */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-1">Insights de Conversão</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  <span>
                    <strong className="text-foreground">PIX</strong> é o método preferido, com <strong className="text-foreground">48.9%</strong> das conversões
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  <span>
                    <strong className="text-foreground">Facebook Ads</strong> gera mais conversões, representando <strong className="text-foreground">39.5%</strong> do total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  <span>
                    <strong className="text-foreground">Produto Premium</strong> lidera com <strong className="text-foreground">234 conversões</strong> e tendência de <strong className="text-green-600">+12%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
