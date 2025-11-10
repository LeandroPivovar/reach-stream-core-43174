import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, Users, Check, X } from 'lucide-react';

interface SegmentationOption {
  id: string;
  label: string;
  description: string;
  category: 'sales' | 'customers';
}

interface SegmentationPickerProps {
  selectedSegments: string[];
  onSegmentsChange: (segments: string[]) => void;
}

const salesSegments: SegmentationOption[] = [
  { id: 'order_completed', label: 'Pedido concluído', description: 'Cliente finalizou uma compra', category: 'sales' },
  { id: 'order_cancelled', label: 'Pedido cancelado', description: 'Cliente cancelou um pedido', category: 'sales' },
  { id: 'order_delivered', label: 'Pedido entregue', description: 'Pedido foi entregue ao cliente', category: 'sales' },
  { id: 'order_awaiting_payment', label: 'Pedido aguardando pagamento', description: 'Aguardando confirmação de pagamento', category: 'sales' },
  { id: 'cart_abandoned', label: 'Carrinho abandonado', description: 'Cliente adicionou itens mas não finalizou', category: 'sales' },
  { id: 'cart_recovered', label: 'Carrinho recuperado', description: 'Cliente voltou e finalizou compra', category: 'sales' },
  { id: 'first_purchase', label: 'Primeira compra', description: 'Cliente realizou primeira compra', category: 'sales' },
  { id: 'specific_product', label: 'Produto específico', description: 'Comprou produto determinado', category: 'sales' },
  { id: 'checkout_abandoned', label: 'Checkout abandonado', description: 'Iniciou checkout mas não finalizou', category: 'sales' },
];

const customerSegments: SegmentationOption[] = [
  { id: 'by_purchase_count', label: 'Clientes por número de compras', description: 'Segmentar por quantidade de compras', category: 'customers' },
  { id: 'birthday', label: 'Aniversário', description: 'Clientes que fazem aniversário', category: 'customers' },
  { id: 'inactive_customers', label: 'Clientes inativos', description: 'Sem compras por período prolongado', category: 'customers' },
  { id: 'active_coupon', label: 'Clientes com cupom ativo', description: 'Possuem cupons válidos não utilizados', category: 'customers' },
  { id: 'high_ticket', label: 'Clientes com maior ticket médio', description: 'Alto valor por compra', category: 'customers' },
  { id: 'purchase_value_x', label: 'Valor de compra X', description: 'Compras acima de valor específico', category: 'customers' },
  { id: 'lead_captured', label: 'Lead capturado', description: 'Lead obtido por formulário', category: 'customers' },
  { id: 'cart_recovered_customer', label: 'Carrinho recuperado', description: 'Cliente que recuperou carrinho', category: 'customers' },
  { id: 'no_purchase_x_days', label: 'Clientes que não compram há X dias', description: 'Inativos por período específico', category: 'customers' },
  { id: 'gender_male', label: 'Sexo: Masculino', description: 'Clientes do sexo masculino', category: 'customers' },
  { id: 'gender_female', label: 'Sexo: Feminino', description: 'Clientes do sexo feminino', category: 'customers' },
  { id: 'by_state', label: 'Estado', description: 'Segmentar por localização geográfica', category: 'customers' },
];

export function SegmentationPicker({ selectedSegments, onSegmentsChange }: SegmentationPickerProps) {
  const toggleSegment = (segmentId: string) => {
    if (selectedSegments.includes(segmentId)) {
      onSegmentsChange(selectedSegments.filter(id => id !== segmentId));
    } else {
      onSegmentsChange([...selectedSegments, segmentId]);
    }
  };

  const renderSegmentGroup = (title: string, icon: React.ReactNode, segments: SegmentationOption[]) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-base">{title}</h3>
        <Badge variant="secondary" className="ml-auto">
          {segments.filter(s => selectedSegments.includes(s.id)).length} / {segments.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {segments.map((segment) => {
          const isSelected = selectedSegments.includes(segment.id);
          return (
            <Card
              key={segment.id}
              className={`p-4 cursor-pointer hover:border-primary transition-all ${
                isSelected ? 'border-primary bg-primary/5 shadow-md' : ''
              }`}
              onClick={() => toggleSegment(segment.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                  isSelected 
                    ? 'bg-primary border-primary' 
                    : 'border-input'
                }`}>
                  {isSelected && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">{segment.label}</div>
                  <p className="text-xs text-muted-foreground">{segment.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Selecione uma ou mais segmentações para definir o público-alvo da campanha. Você pode combinar gatilhos de vendas e clientes.
        </p>
      </div>

      {renderSegmentGroup(
        'Gatilhos de Vendas',
        <ShoppingCart className="w-5 h-5 text-primary" />,
        salesSegments
      )}

      {renderSegmentGroup(
        'Gatilhos de Clientes',
        <Users className="w-5 h-5 text-primary" />,
        customerSegments
      )}

      {selectedSegments.length > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Badge variant="default" className="mt-0.5">
              {selectedSegments.length}
            </Badge>
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">Segmentações selecionadas:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSegments.map(id => {
                  const segment = [...salesSegments, ...customerSegments].find(s => s.id === id);
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
