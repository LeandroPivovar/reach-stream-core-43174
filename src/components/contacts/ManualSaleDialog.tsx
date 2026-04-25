import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ShoppingCart, Package, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, Product, Contact } from '@/lib/api';
import { Search, User as UserIcon } from 'lucide-react';

interface ManualSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName?: string;
  contactId?: number;
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedContactId, setSelectedContactId] = useState<string>(contactId?.toString() || '');
  const [quantity, setQuantity] = useState<string>('1');
  const [customValue, setCustomValue] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);

  // Carregar produtos e contatos do backend
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        setIsLoadingProducts(true);
        try {
          const productsList = await api.getProducts();
          setProducts(productsList.filter(p => p.active));
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
          toast.error('Erro ao carregar produtos');
        } finally {
          setIsLoadingProducts(false);
        }

        if (!contactId) {
          setIsLoadingContacts(true);
          try {
            const contactsList = await api.getContacts();
            setContacts(contactsList);
          } catch (error) {
            console.error('Erro ao carregar contatos:', error);
            toast.error('Erro ao carregar contatos');
          } finally {
            setIsLoadingContacts(false);
          }
        }
      };

      loadData();
    }
  }, [open, contactId]);

  // Reset form quando fechar
  useEffect(() => {
    if (!open) {
      setSelectedProductId('');
      setQuantity('1');
      setCustomValue('');
      setPaymentMethod('credit_card');
      if (!contactId) {
        setSelectedContactId('');
        setSearchTerm('');
      } else {
        setSelectedContactId(contactId.toString());
      }
    }
  }, [open, contactId]);

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
    const finalContactId = contactId || parseInt(selectedContactId);
    const finalContactName = contactName || contacts.find(c => c.id === finalContactId)?.name || 'Cliente';

    if (!finalContactId) {
      toast.error('Selecione um cliente');
      return;
    }

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

    const paymentLabels: Record<string, string> = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
      cash: 'Dinheiro',
      other: 'Outro'
    };

    setIsSaving(true);
    try {
      await api.createSale({
        contactId: finalContactId,
        productId: selectedProductId && selectedProductId !== 'custom' ? parseInt(selectedProductId) : undefined,
        quantity: selectedProductId && selectedProductId !== 'custom' ? parseFloat(quantity || '1') : 1,
        totalValue: totalValue,
        unitPrice: selectedProductId && selectedProductId !== 'custom' ? productPrice : totalValue,
        customerName: finalContactName,
        status: 'completed',
        channel: paymentLabels[paymentMethod] || paymentMethod,
        paymentMethod: paymentMethod,
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
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Cliente
            </Label>
            {contactId ? (
              <div className="p-3 bg-muted rounded-lg border">
                <p className="font-medium">{contactName}</p>
              </div>
            ) : (
              <Popover open={isContactSelectOpen} onOpenChange={setIsContactSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isContactSelectOpen}
                    className="w-full justify-between"
                  >
                    {selectedContactId
                      ? contacts.find((c) => c.id.toString() === selectedContactId)?.name
                      : "Selecione o cliente..."}
                    <div className="flex items-center gap-2">
                       {isLoadingContacts && <Loader2 className="h-3 w-3 animate-spin" />}
                       <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Procurar cliente..." />
                    <CommandList>
                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                      <CommandGroup>
                        {contacts.map((contact) => (
                          <CommandItem
                            key={contact.id}
                            value={contact.name + (contact.email || '')}
                            onSelect={() => {
                              setSelectedContactId(contact.id.toString());
                              setIsContactSelectOpen(false);
                            }}
                            className="flex flex-col items-start"
                          >
                            <span className="font-medium">{contact.name}</span>
                            {contact.email && (
                              <span className="text-xs text-muted-foreground">{contact.email}</span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
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
