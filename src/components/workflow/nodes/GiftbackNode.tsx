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
import { Gift, Edit, Trash2 } from 'lucide-react';

interface GiftbackNodeData {
  label?: string;
  giftbackValue?: string;
  minPurchaseValue?: string;
  expirationDays?: string;
  onUpdate?: (data: any) => void;
  onDelete?: () => void;
}

export const GiftbackNode: React.FC<{ data: GiftbackNodeData }> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [giftbackValue, setGiftbackValue] = useState(data.giftbackValue || '');
  const [minPurchaseValue, setMinPurchaseValue] = useState(data.minPurchaseValue || '');
  const [expirationDays, setExpirationDays] = useState(data.expirationDays || '');

  const handleSave = () => {
    if (data.onUpdate) {
      data.onUpdate({
        giftbackValue,
        minPurchaseValue,
        expirationDays,
      });
    }
    setIsOpen(false);
  };

  const isConfigured = giftbackValue && minPurchaseValue && expirationDays;

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#22c55e' }} />
      <Card className="w-64 p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <Gift className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Giftback</h3>
            <p className="text-xs text-muted-foreground">Criar programa de recompensa</p>
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
                  <DialogTitle>Configurar Giftback</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="giftback-value">Valor do Giftback (R$) *</Label>
                    <Input
                      id="giftback-value"
                      type="number"
                      min="0"
                      step="0.01"
                      value={giftbackValue}
                      onChange={(e) => setGiftbackValue(e.target.value)}
                      placeholder="Ex: 10.00"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="min-purchase">Valor Mínimo de Compra (R$) *</Label>
                    <Input
                      id="min-purchase"
                      type="number"
                      min="0"
                      step="0.01"
                      value={minPurchaseValue}
                      onChange={(e) => setMinPurchaseValue(e.target.value)}
                      placeholder="Ex: 50.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Sugestão: {giftbackValue ? `R$ ${(parseFloat(giftbackValue) * 5).toFixed(2)} (5x o valor do giftback)` : '-'}
                    </p>
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
                  <Button onClick={handleSave} disabled={!giftbackValue || !minPurchaseValue || !expirationDays}>
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
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-medium">R$ {giftbackValue}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Compra mínima:</span>
              <span className="font-medium">R$ {minPurchaseValue}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Expira em:</span>
              <span className="font-medium">{expirationDays} dias</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-background/50 rounded-md border">
            <p className="text-xs text-muted-foreground">
              Clique no ícone para configurar o giftback
            </p>
          </div>
        )}
      </Card>
      <Handle type="source" position={Position.Bottom} style={{ background: '#22c55e' }} />
    </>
  );
};
