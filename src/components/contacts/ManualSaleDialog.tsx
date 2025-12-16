import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Package, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, Product } from '@/lib/api';

interface ManualSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  contactId: number;
  onPurchaseCreated?: () => void;
}

export function ManualSaleDialog({ 
  open, 
  onOpenChange, 
  contactName, 
  contactId,
  onPurchaseCreated 
}: ManualSaleDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [customValue, setCustomValue] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [isSaving, setIsSaving] = useState(false);

  // Carregar produtos do backend
  useEffect(() => {
    if (open) {
      const loadProducts = async () => {
        setIsLoadingProducts(true);
        try {
          const productsList = await api.getProducts();
          // Filtrar apenas produtos ativos
          setProducts(productsList.filter(p => p.active));
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
          toast.error('Erro ao carregar produtos');
        } finally {
          setIsLoadingProducts(false);
        }
      };

      loadProducts();
    }
  }, [open]);

  // Reset form quando fechar
  useEffect(() => {
    if (!open) {
      setSelectedProductId('');
      setQuantity('1');
      setCustomValue('');
      setPaymentMethod('credit_card');
    }
  }, [open]);

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);
  const productPrice = selectedProduct 
    ? (typeof selectedProduct.price === 'string' ? parseFloat(selectedProduct.price) : selectedProduct.price)
    : 0;
  const calculatedValue = selectedProduct 
    ? productPrice * parseFloat(quantity || '1')
    : parseFloat(customValue || '0');
  const totalValue = selectedProductId && selectedProductId !== 'custom' 
    ? calculatedValue 
    : selectedProductId === 'custom'
    ? parseFloat(customValue || '0')
    : 0;

  const handleSave = async () => {
    if (!selectedProductId && !customValue) {
      toast.error('Selecione um produto ou informe um valor personalizado');
      return;
    }

    if (selectedProductId && selectedProductId !== 'custom' && (!quantity || parseFloat(quantity) <= 0)) {
      toast.error('Informe uma quantidade válida');
      return;
    }

    if (selectedProductId === 'custom' && (!customValue || parseFloat(customValue) <= 0)) {
      toast.error('Informe um valor válido');
      return;
    }

    if (totalValue <= 0) {
      toast.error('O valor total deve ser maior que zero');
      return;
    }

    setIsSaving(true);
    try {
      await api.createContactPurchase({
        contactId,
        productId: selectedProductId && selectedProductId !== 'custom' ? parseInt(selectedProductId) : undefined,
        value: totalValue,
        quantity: selectedProductId && selectedProductId !== 'custom' ? parseFloat(quantity || '1') : undefined,
        productName: selectedProduct ? selectedProduct.name : undefined,
        paymentMethod,
        status: 'completed',
        purchaseDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      });

      toast.success('Venda cadastrada com sucesso!');
      
      // Notificar componente pai para atualizar dados
      if (onPurchaseCreated) {
        onPurchaseCreated();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao cadastrar venda:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar venda');
    } finally {
      setIsSaving(false);
    }
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
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Carregando produtos...</span>
              </div>
            ) : (
              <>
                <Select value={selectedProductId} onValueChange={(value) => {
                  setSelectedProductId(value);
                  if (value !== 'custom') {
                    setCustomValue(''); // Limpar valor customizado ao selecionar produto
                  }
                }}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="custom">
                      <div className="flex flex-col">
                        <span>Valor Personalizado</span>
                        <span className="text-xs text-muted-foreground">
                          Cadastrar venda sem produto específico
                        </span>
                      </div>
                    </SelectItem>
                    {products.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        Nenhum produto cadastrado
                      </div>
                    ) : (
                      products.map((product) => {
                        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
                        return (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            <div className="flex flex-col">
                              <span>{product.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {product.sku || 'Sem SKU'} - R$ {price.toFixed(2)}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                {selectedProductId === 'custom' && (
                  <div className="mt-2">
                    <Label htmlFor="custom-value">Valor da Venda (R$)</Label>
                    <Input
                      id="custom-value"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quantidade - apenas se produto selecionado */}
          {selectedProductId && selectedProductId !== 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
              />
            </div>
          )}

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Método de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valor Total */}
          {totalValue > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valor Total:
                </span>
                <span className="text-lg font-bold text-primary">
                  R$ {totalValue.toFixed(2)}
                </span>
              </div>
              {selectedProduct && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedProduct.name} × {quantity} unidade(s)
                </p>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedProductId('');
                setQuantity('1');
                setCustomValue('');
                setPaymentMethod('credit_card');
                onOpenChange(false);
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || isLoadingProducts || totalValue <= 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cadastrar Venda
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
