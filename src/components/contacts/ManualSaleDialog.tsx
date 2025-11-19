import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Package, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  price: number;
  sku: string;
}

interface ManualSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  contactId: number;
}

// Mock products - idealmente viria de um contexto/API
const products: Product[] = [
  { id: 1, name: 'Camiseta Premium', price: 89.90, sku: 'CAM-001' },
  { id: 2, name: 'Tênis Esportivo', price: 299.90, sku: 'TEN-001' },
  { id: 3, name: 'Mochila Executiva', price: 599.90, sku: 'MOC-001' },
  { id: 4, name: 'Relógio Smartwatch', price: 179.90, sku: 'REL-001' },
  { id: 5, name: 'Fone Bluetooth', price: 249.90, sku: 'FON-001' },
];

export function ManualSaleDialog({ open, onOpenChange, contactName, contactId }: ManualSaleDialogProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);
  const totalValue = selectedProduct ? selectedProduct.price * parseInt(quantity || '1') : 0;

  const handleSave = () => {
    if (!selectedProductId) {
      toast.error('Selecione um produto');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      toast.error('Informe uma quantidade válida');
      return;
    }

    // Aqui você faria a chamada para salvar a venda
    toast.success('Venda cadastrada com sucesso!');
    
    // Reset form
    setSelectedProductId('');
    setQuantity('1');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cadastrar Venda Manual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cliente Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Cliente</p>
            <p className="font-medium">{contactName}</p>
          </div>

          {/* Produto */}
          <div className="space-y-2">
            <Label htmlFor="product" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produto
            </Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger id="product">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.sku} - R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
            />
          </div>

          {/* Total */}
          {selectedProduct && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valor Total
                </span>
                <span className="text-lg font-bold text-primary">
                  R$ {totalValue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={!selectedProductId}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cadastrar Venda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
