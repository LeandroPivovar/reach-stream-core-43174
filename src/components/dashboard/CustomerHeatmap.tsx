import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  email: string;
  stage: 'leads' | 'engaged' | 'cart' | 'purchase' | 'loyal';
  value: number;
}

interface CustomerHeatmapProps {
  customers: Customer[];
}

export function CustomerHeatmap({ customers }: CustomerHeatmapProps) {
  const stages = [
    { id: 'leads', name: 'Leads', color: 'bg-blue-500' },
    { id: 'engaged', name: 'Engajados', color: 'bg-purple-500' },
    { id: 'cart', name: 'Carrinho', color: 'bg-orange-500' },
    { id: 'purchase', name: 'Compradores', color: 'bg-green-500' },
    { id: 'loyal', name: 'Fiéis', color: 'bg-pink-500' }
  ];

  // Group customers by stage
  const customersByStage = stages.map(stage => ({
    ...stage,
    customers: customers.filter(c => c.stage === stage.id)
  }));

  // Calculate max customers per stage for relative sizing
  const maxCustomers = Math.max(...customersByStage.map(s => s.customers.length));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold">Mapa de Calor - Clientes na Jornada</h3>
          <p className="text-sm text-muted-foreground">
            Visualização da densidade de clientes em cada estágio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {customersByStage.map(stage => {
          const intensity = stage.customers.length / maxCustomers;
          const opacity = Math.max(0.3, intensity);
          
          return (
            <Card key={stage.id} className="p-4 relative overflow-hidden">
              <div 
                className={cn(
                  "absolute inset-0 transition-all",
                  stage.color
                )}
                style={{ opacity: opacity * 0.2 }}
              />
              
              <div className="relative z-10">
                <h4 className="font-semibold mb-2">{stage.name}</h4>
                <p className="text-3xl font-bold mb-2">
                  {stage.customers.length}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {((stage.customers.length / customers.length) * 100).toFixed(1)}% do total
                </p>
                
                {/* Heat indicator bars */}
                <div className="space-y-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 rounded-full transition-all",
                        i < Math.ceil(intensity * 5)
                          ? stage.color
                          : "bg-muted"
                      )}
                      style={{
                        opacity: i < Math.ceil(intensity * 5) ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>

                {/* Top customers preview */}
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Principais clientes:
                  </p>
                  {stage.customers.slice(0, 3).map(customer => (
                    <div
                      key={customer.id}
                      className="text-xs p-1.5 rounded bg-muted/50 truncate"
                      title={customer.email}
                    >
                      {customer.name}
                    </div>
                  ))}
                  {stage.customers.length > 3 && (
                    <p className="text-xs text-muted-foreground italic">
                      +{stage.customers.length - 3} mais...
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="p-4 bg-muted/30">
        <div className="flex flex-wrap gap-6 items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-sm">Baixa densidade</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500 opacity-60" />
            <span className="text-sm">Média densidade</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 opacity-90" />
            <span className="text-sm">Alta densidade</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
