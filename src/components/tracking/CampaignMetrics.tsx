import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MousePointerClick,
  UserPlus,
  TrendingUp,
  BarChart3,
  FileText,
  Award
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CampaignMetricsProps {
  periodDays?: number;
}

export function CampaignMetrics({ periodDays = 30 }: CampaignMetricsProps) {
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['pixel-metrics', periodDays],
    queryFn: () => api.getPixelMetrics(periodDays),
  });

  const metrics = [
    {
      label: 'Total de Cliques',
      value: isLoading ? '...' : metricsData?.clicks.value.toLocaleString() || '0',
      change: isLoading ? '...' : `${metricsData?.clicks.change.toFixed(1)}%`,
      isPositive: (metricsData?.clicks.change || 0) >= 0,
      icon: MousePointerClick,
      color: 'text-blue-500'
    },
    {
      label: 'Leads Captados',
      value: isLoading ? '...' : metricsData?.leads.value.toLocaleString() || '0',
      change: isLoading ? '...' : `${metricsData?.leads.change.toFixed(1)}%`,
      isPositive: (metricsData?.leads.change || 0) >= 0,
      icon: UserPlus,
      color: 'text-green-500'
    },
    {
      label: 'Taxa de Conversão',
      value: isLoading ? '...' : `${metricsData?.conversionRate.value.toFixed(1)}%` || '0%',
      change: isLoading ? '...' : `${metricsData?.conversionRate.change.toFixed(1)}%`,
      isPositive: (metricsData?.conversionRate.change || 0) >= 0,
      icon: TrendingUp,
      color: 'text-orange-500'
    }
  ];


  const topForms = [
    { name: 'Formulário Landing Page Principal', submissions: 234, rate: 48.9, efficiency: 'Alta' },
    { name: 'Newsletter Sidebar', submissions: 156, rate: 32.6, efficiency: 'Média' },
    { name: 'Pop-up Exit Intent', submissions: 89, rate: 18.5, efficiency: 'Alta' },
    { name: 'Formulário Footer', submissions: 67, rate: 14.0, efficiency: 'Baixa' }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                    <div className="mt-2">
                      <Badge
                        variant={metric.isPositive ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {metric.change} vs período anterior
                      </Badge>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${metric.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ranking de Páginas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Ranking de Páginas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Páginas com melhor desempenho de conversão
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Carregando ranking...</div>
            ) : metricsData?.topPages?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">Nenhum dado encontrado para o período.</div>
            ) : (
              (metricsData?.topPages || []).map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium truncate max-w-[200px]" title={page.name}>{page.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {page.visits.toLocaleString()} visitas • {page.conversions} conversões
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{page.rate}%</p>
                    <p className="text-xs text-muted-foreground">Taxa conversão</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulários Mais Eficientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Formulários Mais Eficientes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Análise de performance dos formulários de captação
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Formulário
                  </th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                    Submissões
                  </th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                    Taxa
                  </th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                    Eficiência
                  </th>
                </tr>
              </thead>
              <tbody>
                {topForms.map((form, index) => {
                  const getEfficiencyColor = (efficiency: string) => {
                    switch (efficiency) {
                      case 'Alta': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
                      case 'Média': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
                      case 'Baixa': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30';
                      default: return 'bg-muted';
                    }
                  };

                  return (
                    <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                          <span className="font-medium">{form.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center font-semibold">
                        {form.submissions}
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge variant="outline" className="font-semibold">
                          {form.rate}%
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge className={getEfficiencyColor(form.efficiency)}>
                          {form.efficiency}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
