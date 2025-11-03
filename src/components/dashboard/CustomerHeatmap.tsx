import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CustomerSegment {
  name: string;
  leads: number;
  engaged: number;
  cart: number;
  purchase: number;
  loyal: number;
}

interface CustomerHeatmapProps {
  segments: CustomerSegment[];
}

export function CustomerHeatmap({ segments }: CustomerHeatmapProps) {
  const stages = [
    { key: 'leads', name: 'Leads' },
    { key: 'engaged', name: 'Engajados' },
    { key: 'cart', name: 'Carrinho' },
    { key: 'purchase', name: 'Compradores' },
    { key: 'loyal', name: 'Fiéis' }
  ];

  // Encontrar o valor máximo para normalizar as cores
  const allValues = segments.flatMap(seg => [
    seg.leads, seg.engaged, seg.cart, seg.purchase, seg.loyal
  ]);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);

  // Função para obter a cor baseada no valor (vermelho -> amarelo -> verde)
  const getHeatColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    
    if (normalized < 0.33) {
      // Vermelho para valores baixos
      return 'bg-red-500/80 text-white';
    } else if (normalized < 0.66) {
      // Amarelo para valores médios
      return 'bg-yellow-500/80 text-black';
    } else {
      // Verde para valores altos
      return 'bg-green-500/80 text-white';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Mapa de Calor - Clientes na Jornada</h3>
          <p className="text-sm text-muted-foreground">
            Visualização da densidade de clientes em cada estágio
          </p>
        </div>
      </div>

      {/* Tabela com Grid de Calor */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-border rounded-lg">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Segmento
                  </th>
                  {stages.map(stage => (
                    <th key={stage.key} className="px-4 py-3 text-center text-sm font-semibold">
                      {stage.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {segments.map((segment, idx) => (
                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium bg-muted/50">
                      {segment.name}
                    </td>
                    <td className={cn("px-4 py-3 text-center text-sm font-bold", getHeatColor(segment.leads))}>
                      {segment.leads}
                    </td>
                    <td className={cn("px-4 py-3 text-center text-sm font-bold", getHeatColor(segment.engaged))}>
                      {segment.engaged}
                    </td>
                    <td className={cn("px-4 py-3 text-center text-sm font-bold", getHeatColor(segment.cart))}>
                      {segment.cart}
                    </td>
                    <td className={cn("px-4 py-3 text-center text-sm font-bold", getHeatColor(segment.purchase))}>
                      {segment.purchase}
                    </td>
                    <td className={cn("px-4 py-3 text-center text-sm font-bold", getHeatColor(segment.loyal))}>
                      {segment.loyal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <Card className="p-4 bg-muted/30">
        <div className="flex flex-wrap gap-6 items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500/80" />
            <span className="text-sm">Baixa densidade (0-33%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-500/80" />
            <span className="text-sm">Média densidade (34-66%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500/80" />
            <span className="text-sm">Alta densidade (67-100%)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
