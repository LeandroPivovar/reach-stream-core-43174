import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { GitBranch, Settings, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type ConditionType = 
  | 'order_placed'
  | 'clicked_link'
  | 'responded'
  | 'order_value'
  | 'product_purchased'
  | 'last_purchase_product'
  | 'first_purchase_product'
  | 'payment_method'
  | 'giftback_value'
  | 'min_value'
  | 'total_sales_value'
  | 'date_condition';

type OperatorType = 'greater' | 'less' | 'equal' | 'greater_equal' | 'less_equal' | 'between';

interface ConditionNodeData {
  conditionType?: ConditionType;
  operator?: OperatorType;
  value?: string;
  value2?: string; // for 'between' operator
  productId?: string;
  paymentMethod?: string;
  dateFrom?: Date;
  dateTo?: Date;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

export const ConditionNode: React.FC<NodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [conditionType, setConditionType] = useState<ConditionType>((data as any)?.conditionType || 'order_placed');
  const [operator, setOperator] = useState<OperatorType>((data as any)?.operator || 'equal');
  const [value, setValue] = useState((data as any)?.value || '');
  const [value2, setValue2] = useState((data as any)?.value2 || '');
  const [productId, setProductId] = useState((data as any)?.productId || '');
  const [paymentMethod, setPaymentMethod] = useState((data as any)?.paymentMethod || '');
  const [dateFrom, setDateFrom] = useState<Date | undefined>((data as any)?.dateFrom);
  const [dateTo, setDateTo] = useState<Date | undefined>((data as any)?.dateTo);

  const handleSave = () => {
    (data as any).onUpdate({
      conditionType,
      operator,
      value,
      value2,
      productId,
      paymentMethod,
      dateFrom,
      dateTo,
    });
    setIsEditing(false);
  };

  const getConditionLabel = () => {
    const labels: Record<ConditionType, string> = {
      order_placed: 'Pedido feito',
      clicked_link: 'Clicou no link',
      responded: 'Respondeu',
      order_value: 'Valor do pedido',
      product_purchased: 'Produto comprado',
      last_purchase_product: 'Produto última compra',
      first_purchase_product: 'Produto primeira compra',
      payment_method: 'Forma de pagamento',
      giftback_value: 'Valor do giftback',
      min_value: 'Valor mínimo',
      total_sales_value: 'Valor total das vendas',
      date_condition: 'Condição de data',
    };
    return labels[conditionType] || 'Condição';
  };

  const needsValueInput = ['order_value', 'giftback_value', 'min_value', 'total_sales_value'].includes(conditionType);
  const needsProductSelector = ['product_purchased', 'last_purchase_product', 'first_purchase_product'].includes(conditionType);
  const needsPaymentMethod = conditionType === 'payment_method';
  const needsDateRange = conditionType === 'date_condition';

  return (
    <>
      <Card className="min-w-[200px] p-4 shadow-lg border-amber-500/50 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background hover:shadow-xl transition-shadow">
        <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-5 h-5 text-amber-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">Condição</h4>
            <p className="text-xs text-muted-foreground truncate">
              {getConditionLabel()}
            </p>
          </div>
        </div>

        <div className="flex gap-1 mt-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => (data as any).onDelete()}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="!bg-green-500 !w-3 !h-3 !-bottom-2 !left-[25%]"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="!bg-red-500 !w-3 !h-3 !-bottom-2 !left-[75%]"
        />
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Condição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Tipo de Condição</Label>
              <Select value={conditionType} onValueChange={(value) => setConditionType(value as ConditionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_placed">Pedido feito?</SelectItem>
                  <SelectItem value="clicked_link">Clicou no link?</SelectItem>
                  <SelectItem value="responded">Respondeu?</SelectItem>
                  <SelectItem value="order_value">Valor do pedido</SelectItem>
                  <SelectItem value="product_purchased">Produto comprado</SelectItem>
                  <SelectItem value="last_purchase_product">Produto última compra</SelectItem>
                  <SelectItem value="first_purchase_product">Produto primeira compra</SelectItem>
                  <SelectItem value="payment_method">Forma de pagamento</SelectItem>
                  <SelectItem value="giftback_value">Valor do giftback</SelectItem>
                  <SelectItem value="min_value">Valor mínimo</SelectItem>
                  <SelectItem value="total_sales_value">Valor total das vendas</SelectItem>
                  <SelectItem value="date_condition">Condição de data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {needsValueInput && (
              <>
                <div className="grid gap-2">
                  <Label>Operador</Label>
                  <Select value={operator} onValueChange={(value) => setOperator(value as OperatorType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater">Maior que (&gt;)</SelectItem>
                      <SelectItem value="greater_equal">Maior ou igual (≥)</SelectItem>
                      <SelectItem value="less">Menor que (&lt;)</SelectItem>
                      <SelectItem value="less_equal">Menor ou igual (≤)</SelectItem>
                      <SelectItem value="equal">Igual (=)</SelectItem>
                      <SelectItem value="between">Entre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Ex: 100.00"
                  />
                </div>

                {operator === 'between' && (
                  <div className="grid gap-2">
                    <Label>Valor Máximo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={value2}
                      onChange={(e) => setValue2(e.target.value)}
                      placeholder="Ex: 500.00"
                    />
                  </div>
                )}
              </>
            )}

            {needsProductSelector && (
              <div className="grid gap-2">
                <Label>Selecione o Produto</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prod-1">Produto Demo 1</SelectItem>
                    <SelectItem value="prod-2">Produto Demo 2</SelectItem>
                    <SelectItem value="prod-3">Produto Demo 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {needsPaymentMethod && (
              <div className="grid gap-2">
                <Label>Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {needsDateRange && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Data Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy") : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label>Data Final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "dd/MM/yyyy") : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        disabled={(date) => dateFrom ? date < dateFrom : false}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <p className="font-medium">Saídas:</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Esquerda: Condição verdadeira</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-muted-foreground">Direita: Condição falsa</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
