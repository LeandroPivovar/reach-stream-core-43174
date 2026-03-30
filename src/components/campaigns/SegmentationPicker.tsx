import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Check, X, Search, Loader2, Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api, Contact, SegmentationParam, Group } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SegmentationOption {
  id: string;
  label: string;
  description: string;
  affectedCount: number;
}

interface SegmentationPickerProps {
  selectedSegments: (string | SegmentationParam)[];
  onSegmentsChange: (segments: (string | SegmentationParam)[]) => void;
  availableGroups?: Group[];
  selectedGroups?: string[];
  onGroupsChange?: (groups: string[]) => void;
  selectedContactIds?: number[];
  onSpecificContactsChange?: (contactIds: number[]) => void;
  allContacts?: any[];
  onViewContact?: (contactId: number) => void;
  stats?: Record<string, number>;
}

export function SegmentationPicker({
  selectedSegments,
  onSegmentsChange,
  availableGroups = [],
  selectedGroups = [],
  onGroupsChange,
  selectedContactIds = [],
  onSpecificContactsChange,
  allContacts = [],
  onViewContact,
  stats = {}
}: SegmentationPickerProps) {
  const [previewContacts, setPreviewContacts] = React.useState<any[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);
  const [contactSearch, setContactSearch] = React.useState('');
  const [isContactPopoverOpen, setIsContactPopoverOpen] = React.useState(false);
  const [products, setProducts] = React.useState<any[]>([]);
  const [productSearch, setProductSearch] = React.useState('');
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(false);
  const [activeCoupons, setActiveCoupons] = React.useState<any[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = React.useState(false);

  React.useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadProducts();

    const loadCoupons = async () => {
      setIsLoadingCoupons(true);
      try {
        const data = await api.getActiveCoupons();
        setActiveCoupons(data);
      } catch (error) {
        console.error('Erro ao carregar cupons ativos:', error);
      } finally {
        setIsLoadingCoupons(false);
      }
    };
    loadCoupons();
  }, []);

  const audienceFilters: SegmentationOption[] = [
    { id: 'total', label: 'Todos os Contatos', description: 'Enviar para toda a sua base de contatos', affectedCount: stats['total'] || 0 },
    { id: 'by_purchase_count', label: 'Clientes por número de compras', description: 'Atribua um mínimo de compras', affectedCount: stats['by_purchase_count'] || 0 },
    { id: 'birthday', label: 'Aniversariantes do Mês', description: 'Clientes que fazem aniversário no mês atual', affectedCount: stats['birthday'] || 0 },
    { id: 'inactive_customers', label: 'Clientes inativos', description: 'Defina o período de inatividade (dias)', affectedCount: stats['inactive_customers'] || 0 },
    { id: 'high_ticket', label: 'Clientes com maior ticket médio', description: 'Defina o valor mínimo do ticket', affectedCount: stats['high_ticket'] || 0 },
    { id: 'lead_captured', label: 'Lead capturado', description: 'Lead obtido por formulário', affectedCount: stats['lead_captured'] || 0 },
    { id: 'no_purchase_x_days', label: 'Clientes que não compram há X dias', description: 'Inativos por período específico', affectedCount: stats['no_purchase_x_days'] || 0 },
    { id: 'active_coupon', label: 'Cupom ativo', description: 'Possuem cupons válidos', affectedCount: stats['active_coupon'] || 0 },
    {
      id: 'gender',
      label: 'Sexo',
      description: 'Filtrar por gênero',
      affectedCount: stats['gender'] || 0
    },
    { id: 'by_state', label: 'Estado', description: 'Segmentar por localização geográfica', affectedCount: stats['by_state'] || 0 },

    { id: 'clicked_campaign', label: 'Engajados (cliques)', description: 'Contatos que clicaram em links de campanhas', affectedCount: stats['clicked_campaign'] || 0 },
    { id: 'abandoned_cart', label: 'Carrinho Abandonado', description: 'Contatos com carrinhos não finalizados', affectedCount: stats['abandoned_cart'] || 0 },
    { id: 'cart_recovered_customer', label: 'Cliente Recuperado', description: 'Clientes que voltaram após abandonar o carrinho', affectedCount: stats['cart_recovered_customer'] || 0 },
    { id: 'purchased_product', label: 'Compraram Produto Específico', description: 'Clientes que compraram itens selecionados', affectedCount: stats['purchased_product'] || 0 },
  ];

  const toggleSegment = (segmentId: string) => {
    const isSelected = selectedSegments.some(s => (typeof s === 'string' ? s : s.id) === segmentId);
    if (isSelected) {
      onSegmentsChange(selectedSegments.filter(s => (typeof s === 'string' ? s : s.id) !== segmentId));
    } else {
      onSegmentsChange([...selectedSegments, segmentId]);
    }
  };

  const updateParams = (segmentId: string, params: any) => {
    const newSegments = selectedSegments.map(s => {
      const id = typeof s === 'string' ? s : s.id;
      if (id === segmentId) {
        return { id, params: { ...(typeof s === 'object' ? s.params : {}), ...params } };
      }
      return s;
    });
    onSegmentsChange(newSegments);
  };

  const toggleSpecificContact = (id: number) => {
    if (!onSpecificContactsChange) return;
    if (selectedContactIds.includes(id)) {
      onSpecificContactsChange(selectedContactIds.filter(cid => cid !== id));
    } else {
      onSpecificContactsChange([...selectedContactIds, id]);
    }
  };

  const toggleGroup = (groupId: string) => {
    if (!onGroupsChange) return;
    const isSelected = selectedGroups.includes(groupId);
    if (isSelected) {
      onGroupsChange(selectedGroups.filter(g => g !== groupId));
    } else {
      onGroupsChange([...selectedGroups, groupId]);
    }
  };

  const getSegmentParams = (segmentId: string) => {
    const seg = selectedSegments.find(s => (typeof s === 'string' ? s : s.id) === segmentId);
    return typeof seg === 'object' ? seg.params : {};
  };

  React.useEffect(() => {
    const fetchPreview = async () => {
      if (selectedSegments.length === 0 && selectedGroups.length === 0 && selectedContactIds.length === 0) {
        setPreviewContacts([]);
        return;
      }
      setIsLoadingPreview(true);
      try {
        const groupIds = selectedGroups.map(Number).filter(id => !isNaN(id));
        let data: any[] = [];

        // Só chama API se tiver grupos ou segmentações selecionados
        if (selectedSegments.length > 0 || groupIds.length > 0) {
          data = await api.getContactsBySegments(selectedSegments, groupIds);
        }

        let mergedContacts: any[] = data.map(c => ({
          ...c,
          _origin: c.groupId && groupIds.includes(c.groupId)
            ? 'Grupo'
            : (selectedSegments.length > 0 ? 'Segmentação' : 'Outro')
        }));

        if (selectedContactIds.length > 0 && allContacts && allContacts.length > 0) {
          const specificContactsData = allContacts.filter(c => selectedContactIds.includes(c.id));
          const existingIds = new Set(mergedContacts.map(c => c.id));
          const toAdd = specificContactsData
            .filter(c => !existingIds.has(c.id))
            .map(c => ({ ...c, _origin: 'Pesquisa' }));

          mergedContacts = [...mergedContacts.map(c => {
            if (selectedContactIds.includes(c.id)) {
              return { ...c, _origin: 'Pesquisa' };
            }
            return c;
          }), ...toAdd];
        }

        setPreviewContacts(mergedContacts);
      } catch (error) {
        console.error('Erro ao buscar preview:', error);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    const timeoutId = setTimeout(fetchPreview, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedSegments, selectedGroups, selectedContactIds, allContacts]);

  const renderConfigUI = (segmentId: string) => {
    const params = getSegmentParams(segmentId);

    if (segmentId === 'by_purchase_count') {
      return (
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Mín. Compras:</Label>
          <Input
            type="text"
            className="h-8 w-20 text-xs"
            value={params?.minPurchases !== undefined ? params.minPurchases : ''}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : parseInt(e.target.value);
              updateParams(segmentId, { minPurchases: val === '' || isNaN(val as number) ? '' : val });
            }}
          />
        </div>
      );
    }

    if (segmentId === 'high_ticket') {
      return (
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Ticket Mín. (R$):</Label>
          <Input
            type="text"
            className="h-8 w-24 text-xs"
            value={params?.minTicket !== undefined ? params.minTicket : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(',', '.');
              const val = raw === '' ? '' : parseFloat(raw);
              updateParams(segmentId, { minTicket: val === '' || isNaN(val as number) ? '' : val });
            }}
          />
        </div>
      );
    }

    if (segmentId === 'inactive_customers' || segmentId === 'no_purchase_x_days') {
      return (
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Dias:</Label>
          <Input
            type="text"
            className="h-8 w-20 text-xs"
            value={params?.days !== undefined ? params.days : ''}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : parseInt(e.target.value);
              updateParams(segmentId, { days: val === '' || isNaN(val as number) ? '' : val });
            }}
          />
        </div>
      );
    }

    if (segmentId === 'birthday') {
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return (
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Mês:</Label>
          <select
            className="h-8 w-32 border rounded text-xs px-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            value={params?.month !== undefined ? params.month : ''}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : parseInt(e.target.value);
              updateParams(segmentId, { month: val === '' || isNaN(val as number) ? '' : val });
            }}
          >
            <option value="">Selecione</option>
            {months.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      );
    }

    if (segmentId === 'gender') {
      return (
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Sexo:</Label>
          <select
            className="h-8 w-32 border rounded text-xs px-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            value={params?.gender || ''}
            onChange={(e) => {
              updateParams(segmentId, { gender: e.target.value });
            }}
          >
            <option value="">Ambos</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>
      );
    }

    if (segmentId === 'by_state') {
      const statesList = [
        'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
        'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
      ];
      return (
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Estado:</Label>
          <select
            className="h-8 w-24 border rounded text-xs px-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            value={params?.state || ''}
            onChange={(e) => {
              updateParams(segmentId, { state: e.target.value });
            }}
          >
            <option value="">Todos</option>
            {statesList.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      );
    }

    if (segmentId === 'active_coupon') {
      return (
        <div className="mt-3 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Selecionar Cupom:</Label>
          <select
            className="h-8 w-full border rounded text-xs px-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            value={params?.couponName || ''}
            onChange={(e) => {
              updateParams(segmentId, { couponName: e.target.value });
            }}
          >
            <option value="">Todos os Cupons Ativos</option>
            {activeCoupons.map((c, i) => (
              <option key={i} value={c.name}>{c.name} ({c.campaignName})</option>
            ))}
          </select>
          {activeCoupons.length === 0 && !isLoadingCoupons && (
            <p className="text-[10px] text-orange-500">Nenhum cupom ativo encontrado no momento.</p>
          )}
        </div>
      );
    }

    if (segmentId === 'purchased_product') {
      const selectedProductIds = params?.productIds || [];
      const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
      ).slice(0, 5); // Limit to top 5 for better UI

      return (
        <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Selecionar Produtos:</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                className="h-8 pl-8 text-xs"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
          </div>

          {productSearch && (
            <div className="border rounded-md bg-background overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => {
                  const isProdSelected = selectedProductIds.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer border-b last:border-0"
                      onClick={() => {
                        const newIds = isProdSelected
                          ? selectedProductIds.filter((id: number) => id !== product.id)
                          : [...selectedProductIds, product.id];
                        updateParams(segmentId, { productIds: newIds });
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{product.name}</span>
                        {product.sku && <span className="text-[10px] text-muted-foreground">SKU: {product.sku}</span>}
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isProdSelected ? 'bg-primary border-primary' : 'border-input'}`}>
                        {isProdSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Nenhum produto encontrado
                </div>
              )}
            </div>
          )}

          {selectedProductIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t">
              {selectedProductIds.map((id: number) => {
                const product = products.find(p => p.id === id);
                if (!product) return null;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1 pl-2 pr-1 h-6 text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  >
                    {product.name}
                    <button
                      className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateParams(segmentId, {
                          productIds: selectedProductIds.filter((pid: number) => pid !== id)
                        });
                      }}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderFilters = (segments: SegmentationOption[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {segments.map((segment) => {
        const isSelected = selectedSegments.some(s => (typeof s === 'string' ? s : s.id) === segment.id);
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
                  {isSelected && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {(selectedSegments.length === 1 ? previewContacts.length : segment.affectedCount).toLocaleString('pt-BR')} pessoas
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{segment.description}</p>
                {isSelected && renderConfigUI(segment.id)}
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
        <p className="text-sm text-muted-foreground font-medium">
          Personalize seu público-alvo alternando entre as abas abaixo.
        </p>
      </div>

      <Tabs defaultValue="segmentations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="segmentations" className="gap-2">
            <Filter className="w-4 h-4" />
            Segmentações
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2">
            <Users className="w-4 h-4" />
            Grupos
          </TabsTrigger>
          <TabsTrigger value="specific" className="gap-2">
            <Search className="w-4 h-4" />
            Unitário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="segmentations" className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Filtros de Segmentação</h3>
          </div>
          {renderFilters(audienceFilters)}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Filtros de Grupo</h3>
          </div>
          {availableGroups && availableGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableGroups.map((group) => {
                const isSelected = selectedGroups.includes(group.id.toString());
                return (
                  <Card
                    key={group.id}
                    className={`p-4 cursor-pointer hover:border-primary transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-md' : ''}`}
                    onClick={() => toggleGroup(group.id.toString())}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-input'}`}>
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="font-medium text-sm">{group.name}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
              Nenhum grupo disponível para seleção.
            </div>
          )}
        </TabsContent>

        <TabsContent value="specific" className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Seleção de Contatos Unitários</h3>
          </div>
          <div className="space-y-3">
            <Popover open={isContactPopoverOpen} onOpenChange={setIsContactPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={!allContacts || allContacts.length === 0}>
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  {selectedContactIds.length > 0
                    ? `${selectedContactIds.length} contato(s) selecionado(s)`
                    : "Buscar e adicionar contatos específicos..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <div className="p-2 border-b">
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                  {allContacts && allContacts
                    .filter((c: any) =>
                      c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                      c.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                      c.phone?.includes(contactSearch)
                    )
                    .slice(0, 20)
                    .map((contact: any) => {
                      const isSelected = selectedContactIds.includes(contact.id);
                      return (
                        <div
                          key={contact.id}
                          className={`flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                          onClick={() => toggleSpecificContact(contact.id)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{contact.name}</span>
                            <span className="text-xs text-muted-foreground">{contact.email || contact.phone || 'Sem contato'}</span>
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-input'}`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      );
                    })
                  }
                  {(!allContacts || allContacts.length === 0) && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhum contato disponível
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </TabsContent>
      </Tabs>

      {(selectedSegments.length > 0 || selectedGroups.length > 0 || selectedContactIds.length > 0) && (
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-3">Filtros selecionados:</p>
            <div className="flex flex-wrap gap-2">
              {selectedContactIds.map(contactId => {
                const contact = allContacts.find(c => c.id === contactId);
                return contact ? (
                  <Badge key={`contact-${contactId}`} variant="outline" className="gap-1 pl-2 pr-1 h-7 border-primary text-primary">
                    {contact.name.split(' ')[0]} {/* Primeiro nome */}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-primary/80 ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSpecificContact(contactId);
                      }}
                    />
                  </Badge>
                ) : null;
              })}
              {selectedGroups.map(groupId => {
                const group = availableGroups.find(g => g.id.toString() === groupId);
                return group ? (
                  <Badge key={`group-${groupId}`} variant="default" className="gap-1 pl-2 pr-1 h-7 bg-primary text-primary-foreground">
                    {group.name}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-primary-foreground/80 ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroup(groupId);
                      }}
                    />
                  </Badge>
                ) : null;
              })}
              {selectedSegments.map(s => {
                const id = typeof s === 'string' ? s : s.id;
                const segment = audienceFilters.find(opt => opt.id === id);
                return segment ? (
                  <Badge key={id} variant="secondary" className="gap-1 pl-2 pr-1 h-7">
                    {segment.label}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive ml-1"
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

          <Card className="overflow-hidden border-primary/20 bg-primary/[0.02]">
            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Search className="w-4 h-4 text-primary" />
                Visualização em Tempo Real ({previewContacts.length})
              </div>
              {isLoadingPreview && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-transparent hover:bg-transparent">
                    <TableHead className="py-2 h-auto text-[11px] uppercase">Nome</TableHead>
                    <TableHead className="py-2 h-auto text-[11px] uppercase">E-mail</TableHead>
                    <TableHead className="py-2 h-auto text-[11px] uppercase">Localização</TableHead>
                    <TableHead className="py-2 h-auto text-[11px] uppercase text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPreview && previewContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs italic">
                        Carregando contatos...
                      </TableCell>
                    </TableRow>
                  ) : previewContacts.length > 0 ? (
                    previewContacts.map((contact) => (
                      <TableRow key={contact.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="py-2 text-xs font-medium">
                          <div className="flex flex-col gap-1">
                            <span>{contact.name}</span>
                            {contact._origin && (
                              <Badge variant={contact._origin === 'Pesquisa' ? 'secondary' : contact._origin === 'Grupo' ? 'default' : 'outline'} className="w-fit text-[9px] h-4 py-0 px-1 opacity-80">
                                {contact._origin}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">{contact.email || '-'}</TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between gap-2">
                            <span>{contact.city ? `${contact.city}, ${contact.state}` : contact.state || '-'}</span>
                            {onViewContact && (
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-[10px] py-0 h-5 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewContact(contact.id);
                                }}
                              >
                                Ver detalhes
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Badge variant="outline" className="text-[10px] py-0 h-4 px-1.5 uppercase font-bold">
                            {contact.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs italic">
                        Nenhum contato encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
