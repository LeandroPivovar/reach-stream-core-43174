import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MousePointerClick, UserPlus, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CampaignFunnelProps {
  periodDays?: number;
}

interface FunnelStage {
  name: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

export function CampaignFunnel({ periodDays = 30 }: CampaignFunnelProps) {
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['pixel-metrics', periodDays],
    queryFn: () => api.getPixelMetrics(periodDays),
  });

  const funnelData = (metricsData?.funnelData || []).map((stage: any, idx: number) => {
    const icons = [Users, MousePointerClick, UserPlus];
    return {
      ...stage,
      icon: icons[idx] || Users
    };
  });

  const calculateConversionRate = (current: number, previous: number) => {
    return ((current / previous) * 100).toFixed(1);
  };

  const calculateDropoff = (current: number, previous: number) => {
    return ((1 - current / previous) * 100).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Funil de Conversão
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Acompanhe a jornada dos visitantes até a conversão
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">Carregando funil...</div>
          )}
          {!isLoading && funnelData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Sem dados para o período.</div>
          )}
          {!isLoading && funnelData.map((stage, index) => {
            const Icon = stage.icon;
            const previousValue = index > 0 ? funnelData[index - 1].value : stage.value;
            const conversionRate = calculateConversionRate(stage.value, previousValue);
            const dropoffRate = calculateDropoff(stage.value, previousValue);
            const widthPercentage = (stage.value / funnelData[0].value) * 100;

            return (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${stage.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{stage.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {stage.value.toLocaleString()} {index > 0 && `(${conversionRate}%)`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stage.value.toLocaleString()}</p>
                    {index > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dropoffRate}% perda
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Barra de progresso do funil */}
                <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${stage.color} opacity-70 transition-all duration-500 flex items-center justify-center`}
                    style={{ width: `${widthPercentage}%` }}
                  >
                    <span className="text-white font-semibold text-sm">
                      {widthPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Seta de transição */}
                {index < funnelData.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-muted-foreground/20" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Taxa de conversão geral */}
          {funnelData.length >= 3 && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão Total</p>
                  <p className="text-lg font-semibold">{funnelData[0].name} → {funnelData[funnelData.length - 1].name}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {calculateConversionRate(funnelData[funnelData.length - 1].value, funnelData[0].value)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
