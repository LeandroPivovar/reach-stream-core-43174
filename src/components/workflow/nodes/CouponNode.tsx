import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tag, Edit, Trash2 } from 'lucide-react';

interface CouponNodeData {
  label?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: string;
  expirationDays?: string;
  onUpdate?: (data: any) => void;
  onDelete?: () => void;
}

export const CouponNode: React.FC<{ data: CouponNodeData }> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>(data.discountType || 'percentage');
  const [discountValue, setDiscountValue] = useState(data.discountValue || '');
  const [expirationDays, setExpirationDays] = useState(data.expirationDays || '');

  const handleSave = () => {
    if (data.onUpdate) {
      data.onUpdate({
        discountType,
        discountValue,
        expirationDays,
      });
    }
    setIsOpen(false);
  };

  const isConfigured = discountValue && expirationDays;

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#f97316' }} />
      <Card className="w-64 p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
            <Tag className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Cupom de Desconto</h3>
            <p className="text-xs text-muted-foreground">Criar cupom promocional</p>
          </div>
          <div className="flex gap-1">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Edit className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurar Cupom de Desconto</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Desconto *</Label>
                    <Select value={discountType} onValueChange={(value: 'fixed' | 'percentage') => setDiscountType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="discount-value">
                      {discountType === 'percentage' ? 'Percentual de Desconto (%)' : 'Valor do Desconto (R$)'} *
                    </Label>
                    <Input
                      id="discount-value"
                      type="number"
                      min="0"
                      max={discountType === 'percentage' ? '100' : undefined}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === 'percentage' ? 'Ex: 10' : 'Ex: 50.00'}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="expiration-days">Dias para Expirar *</Label>
                    <Input
                      id="expiration-days"
                      type="number"
                      min="1"
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(e.target.value)}
                      placeholder="Ex: 30"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={!discountValue || !expirationDays}>
                    Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {data.onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive"
                onClick={data.onDelete}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {isConfigured ? (
          <div className="mt-3 p-3 bg-background/50 rounded-md border space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Desconto:</span>
              <span className="font-medium">
                {discountType === 'percentage' ? `${discountValue}%` : `R$ ${discountValue}`}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Expira em:</span>
              <span className="font-medium">{expirationDays} dias</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-background/50 rounded-md border">
            <p className="text-xs text-muted-foreground">
              Clique no ícone para configurar o cupom
            </p>
          </div>
        )}
      </Card>
      <Handle type="source" position={Position.Bottom} style={{ background: '#f97316' }} />
    </>
  );
};
