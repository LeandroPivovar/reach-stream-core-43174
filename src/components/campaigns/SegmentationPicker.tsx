import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Check, X } from 'lucide-react';

interface SegmentationOption {
  id: string;
  label: string;
  description: string;
  affectedCount: number;
}

interface SegmentationPickerProps {
  selectedSegments: string[];
  onSegmentsChange: (segments: string[]) => void;
  stats?: Record<string, number>;
}

export function SegmentationPicker({ selectedSegments, onSegmentsChange, stats = {} }: SegmentationPickerProps) {
  const audienceFilters: SegmentationOption[] = [
    { id: 'by_purchase_count', label: 'Clientes por número de compras', description: 'Segmentar por quantidade de compras', affectedCount: stats['by_purchase_count'] || 0 },
    { id: 'birthday', label: 'Aniversário', description: 'Clientes que fazem aniversário', affectedCount: stats['birthday'] || 0 },
    { id: 'inactive_customers', label: 'Clientes inativos', description: 'Sem compras por período prolongado', affectedCount: stats['inactive_customers'] || 0 },
    { id: 'active_coupon', label: 'Clientes com cupom ativo', description: 'Possuem cupons válidos não utilizados', affectedCount: stats['active_coupon'] || 0 },
    { id: 'high_ticket', label: 'Clientes com maior ticket médio', description: 'Alto valor por compra', affectedCount: stats['high_ticket'] || 0 },
    { id: 'lead_captured', label: 'Lead capturado', description: 'Lead obtido por formulário', affectedCount: stats['lead_captured'] || 0 },
    { id: 'cart_recovered_customer', label: 'Carrinho recuperado', description: 'Cliente que recuperou carrinho', affectedCount: stats['cart_recovered_customer'] || 0 },
    { id: 'no_purchase_x_days', label: 'Clientes que não compram há X dias', description: 'Inativos por período específico', affectedCount: stats['no_purchase_x_days'] || 0 },
    { id: 'gender_male', label: 'Sexo: Masculino', description: 'Clientes do sexo masculino', affectedCount: stats['gender_male'] || 0 },
    { id: 'gender_female', label: 'Sexo: Feminino', description: 'Clientes do sexo feminino', affectedCount: stats['gender_female'] || 0 },
    { id: 'by_state', label: 'Estado', description: 'Segmentar por localização geográfica', affectedCount: stats['total'] || 0 },
  ];

  const toggleSegment = (segmentId: string) => {
    if (selectedSegments.includes(segmentId)) {
      onSegmentsChange(selectedSegments.filter(id => id !== segmentId));
    } else {
      onSegmentsChange([...selectedSegments, segmentId]);
    }
  };

  const renderFilters = (segments: SegmentationOption[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {segments.map((segment) => {
        const isSelected = selectedSegments.includes(segment.id);
        return (
          <Card
            key={segment.id}
            className={`p-4 cursor-pointer hover:border-primary transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-md' : ''
              }`}
            onClick={() => toggleSegment(segment.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${isSelected
                  ? 'bg-primary border-primary'
                  : 'border-input'
                }`}>
                {isSelected && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">{segment.label}</div>
                  <Badge variant="secondary" className="text-xs">
                    {segment.affectedCount.toLocaleString('pt-BR')} pessoas
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{segment.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Selecione um ou mais filtros para definir o tipo de público da campanha.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-base">Tipos de Público</h3>
          <Badge variant="secondary" className="ml-auto">
            {selectedSegments.length} / {audienceFilters.length}
          </Badge>
        </div>
        {renderFilters(audienceFilters)}
      </div>

      {selectedSegments.length > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Badge variant="default" className="mt-0.5">
              {selectedSegments.length}
            </Badge>
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">Filtros selecionados:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSegments.map(id => {
                  const segment = audienceFilters.find(s => s.id === id);
                  return segment ? (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {segment.label}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSegment(id);
                        }}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
