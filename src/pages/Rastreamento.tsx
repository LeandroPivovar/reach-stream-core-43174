import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Target,
  Code,
  BarChart3,
  Copy,
  ExternalLink,
  Eye,
  MousePointer,
  Users,
  Check,
  Plus
} from 'lucide-react';
import { CampaignFunnel } from '@/components/tracking/CampaignFunnel';
import { CampaignMetrics } from '@/components/tracking/CampaignMetrics';
import { ClicksBreakdown } from '@/components/tracking/ClicksBreakdown';
import { ConversionDetails } from '@/components/tracking/ConversionDetails';
import { CampaignFilters } from '@/components/tracking/CampaignFilters';
import { api, Pixel } from '@/lib/api';
import { useEffect } from 'react';

export default function Rastreamento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isNewPixelOpen, setIsNewPixelOpen] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<any>(null);
  const [selectedEventType, setSelectedEventType] = useState('PageView');
  const [eventData, setEventData] = useState<any>({});
  const [newPixelType, setNewPixelType] = useState<'facebook' | 'google' | 'custom' | null>(null);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPixelData, setNewPixelData] = useState({
    name: '',
    pixelId: ''
  });
  const [filters, setFilters] = useState<{
    campaigns: string[];
    period: string;
    dateRange: { from?: Date; to?: Date };
  }>({
    campaigns: [],
    period: 'geral',
    dateRange: {}
  });

  const [products, setProducts] = useState<any[]>([]);

  const fetchPixels = async () => {
    try {
      const data = await api.getPixels();
      setPixels(data);
    } catch (error) {
      console.error('Erro ao buscar pixels:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  useEffect(() => {
    fetchPixels();
    fetchProducts();
  }, []);

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id.toString() === productId);
    if (product) {
      setEventData({
        ...eventData,
        content_name: product.name,
        value: Number(product.price),
        content_id: product.id.toString(),
        sku: product.sku || undefined, // Adiciona SKU se disponível
        currency: 'BRL'
      });
    }
  };

  // ... inside render ...

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    console.log('Filtros aplicados:', newFilters);
    // Aqui você faria a chamada para API com os filtros
    toast({
      title: "Filtros aplicados!",
      description: `Mostrando dados para ${newFilters.campaigns.length || 'todas'} campanha(s) no período: ${newFilters.period}`,
    });
  };

  const trackingCodes: any[] = [];

  const handleOpenCode = (pixel: any) => {
    setSelectedPixel(pixel);
    setSelectedEventType('PageView');
    setEventData({});
    setIsCodeModalOpen(true);
  };

  const handleCopyCode = () => {
    if (selectedPixel?.code) {
      navigator.clipboard.writeText(selectedPixel.code);
      toast({
        title: "Código copiado!",
        description: "O código HTML foi copiado para a área de transferência.",
      });
    }
  };

  const handleSelectPixelType = (type: 'facebook' | 'google' | 'custom') => {
    setNewPixelType(type);
  };

  const generateInternalScript = (pixelId: string, event: string = 'PageView', data: any = {}) => {
    const apiBaseUrl = window.location.origin.includes('localhost') ? 'http://localhost:3000' : window.location.origin;

    let eventCall = `internalPixel('${event}')`;
    if (Object.keys(data).length > 0) {
      eventCall = `internalPixel('${event}', ${JSON.stringify(data, null, 2)})`;
    }

    return `<!-- Pixel de Rastreamento Interno -->
        <script>
          (function(w,d,s,l,i){
            w[l] = w[l] || function (event, data) {
              fetch('${apiBaseUrl}/api/pixels/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  pixel_id: i,
                  event: event,
                  data: data,
                  url: w.location.href,
                  page_title: d.title,
                  user_agent: navigator.userAgent,
                  timestamp: Date.now()
                })
              });
            }
          })(window, document, 'script', 'internalPixel', '${pixelId}');

          setTimeout(function() {
            ${eventCall};
  }, 500);
        </script>
        <!-- End Pixel de Rastreamento Interno -->`;
  };

  const handleCreatePixel = async () => {
    setLoading(true);
    try {
      if (newPixelType === 'custom') {
        const pixel = await api.createPixel({ name: newPixelData.name });
        setPixels([...pixels, pixel]);

        toast({
          title: "Pixel criado!",
          description: "Seu pixel interno foi gerado com sucesso.",
        });
      } else {
        // Para tipos externos, manteríamos o mock ou integraríamos conforme necessidade futura
        console.log('Creating external pixel:', { type: newPixelType, ...newPixelData });
        toast({
          title: "Pixel configurado!",
          description: "O pixel externo foi configurado localmente.",
        });
      }

      setIsNewPixelOpen(false);
      setNewPixelType(null);
      setNewPixelData({ name: '', pixelId: '' });
    } catch (error: any) {
      toast({
        title: "Erro ao criar pixel",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const actions = (
    <HeaderActions.Add onClick={() => setIsNewPixelOpen(true)}>
      Novo Pixel
    </HeaderActions.Add>
  );

  const periodDays = filters.period === 'hoje' ? 1 :
    filters.period === '7dias' ? 7 :
      filters.period === '30dias' ? 30 :
        filters.period === '90dias' ? 90 :
          filters.period === 'custom' && filters.dateRange?.from && filters.dateRange?.to
            ? Math.ceil((new Date(filters.dateRange.to).getTime() - new Date(filters.dateRange.from).getTime()) / (1000 * 60 * 60 * 24)) || 1
            : 30;

  return (
    <Layout
      title="Rastreamento"
      subtitle="Configure pixels e formulários para capturar leads"
      actions={actions}
    >
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="pixels">Pixels</TabsTrigger>
            <TabsTrigger value="forms">Formulários</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Filtros de Campanha e Período */}
              <CampaignFilters onFilterChange={handleFilterChange} />

              {/* Métricas e Rankings */}
              <CampaignMetrics periodDays={periodDays} />

              {/* Detalhamento dos Cliques */}
              <ClicksBreakdown periodDays={periodDays} />

              {/* Detalhamento da Taxa de Conversão */}
              <ConversionDetails />

              {/* Funil de Conversão */}
              <CampaignFunnel />
            </div>
          </TabsContent>

          <TabsContent value="pixels">
            <div className="space-y-6">
              {/* Pixel List */}
              <Card className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tipo</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Eventos</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Conversões</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pixels.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            Nenhum pixel configurado. Clique em "Novo Pixel" para começar.
                          </td>
                        </tr>
                      )}
                      {pixels.map((p) => {
                        const code = generateInternalScript(p.pixelId);
                        return (
                          <tr key={p.pixelId} className="border-b border-border last:border-0">
                            <td className="py-4 px-2">
                              <div className="font-medium">{p.name}</div>
                            </td>
                            <td className="py-4 px-2">
                              <Badge variant="default">Interno</Badge>
                            </td>
                            <td className="py-4 px-2">
                              <Badge variant="default">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Ativo
                              </Badge>
                            </td>
                            <td className="py-4 px-2 text-right font-medium">{p.eventsCount || 0}</td>
                            <td className="py-4 px-2 text-right font-medium">{p.conversionsCount || 0}</td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenCode(p)}
                                >
                                  <Code className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forms">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Gerador de Formulários</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="form-name">Nome do Formulário</Label>
                      <Input id="form-name" placeholder="Ex: Newsletter Landing Page" />
                    </div>
                    <div>
                      <Label htmlFor="redirect-url">URL de Redirecionamento</Label>
                      <Input id="redirect-url" placeholder="https://obrigado.com" />
                    </div>
                  </div>

                  <div>
                    <Label>Código HTML Gerado</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <code className="text-sm">
                        {`<form action="https://api.nucleo.com/forms/capture" method="POST">
  <input type="text" name="name" placeholder="Nome" required>
  <input type="email" name="email" placeholder="E-mail" required>
  <input type="tel" name="phone" placeholder="Telefone">
  <button type="submit">Enviar</button>
</form>`}
                      </code>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Código
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Métricas de Tracking</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Eventos por Fonte</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <span>Facebook Ads</span>
                        <span className="font-semibold">1.247</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <span>Google Analytics</span>
                        <span className="font-semibold">3.421</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <span>Landing Pages</span>
                        <span className="font-semibold">892</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Conversões por Canal</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <span>WhatsApp</span>
                        <span className="font-semibold">234 (48.9%)</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <span>E-mail</span>
                        <span className="font-semibold">156 (32.6%)</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <span>SMS</span>
                        <span className="font-semibold">89 (18.5%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Código HTML */}
      <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Código de Rastreamento - {selectedPixel?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-500/10 p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Configuração do Evento</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => navigate('/rastreamento/documentacao')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Guia Modo Avançado
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Select
                      value={selectedEventType}
                      onValueChange={(value) => {
                        setSelectedEventType(value);
                        setEventData({}); // Limpa os dados ao trocar o evento
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o evento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PageView">Page View (Padrão)</SelectItem>
                        <SelectItem value="Purchase">Compra (Purchase)</SelectItem>
                        <SelectItem value="Lead">Lead / Cadastro</SelectItem>
                        <SelectItem value="AddToCart">Adicionar ao Carrinho</SelectItem>
                        <SelectItem value="InitiateCheckout">Iniciado Checkout</SelectItem>
                        <SelectItem value="Contact">Clique em Contato</SelectItem>
                        <SelectItem value="ViewContent">Ver Produto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(selectedEventType === 'Purchase' || selectedEventType === 'ViewContent' || selectedEventType === 'AddToCart' || selectedEventType === 'InitiateCheckout') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {(selectedEventType === 'Purchase' || selectedEventType === 'ViewContent' || selectedEventType === 'AddToCart' || selectedEventType === 'InitiateCheckout') && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Valor"
                            type="number"
                            className="flex-1"
                            value={eventData.value || ''}
                            onChange={(e) => setEventData({ ...eventData, value: parseFloat(e.target.value) || 0 })}
                          />
                          <Input
                            placeholder="BRL"
                            className="w-20"
                            value={eventData.currency || 'BRL'}
                            onChange={(e) => setEventData({ ...eventData, currency: e.target.value })}
                          />
                        </div>
                      )}

                      {(selectedEventType === 'Purchase' || selectedEventType === 'AddToCart' || selectedEventType === 'ViewContent' || selectedEventType === 'InitiateCheckout') && (
                        <div className="flex gap-2">
                          <Input
                            className="flex-1"
                            placeholder="Nome do Produto"
                            value={eventData.content_name || ''}
                            onChange={(e) => setEventData({ ...eventData, content_name: e.target.value })}
                          />
                          <Input
                            className="w-1/3"
                            placeholder="SKU / ID"
                            value={eventData.sku || eventData.content_id || ''}
                            onChange={(e) => setEventData({ ...eventData, sku: e.target.value, content_id: e.target.value })}
                          />
                        </div>
                      )}

                      {selectedEventType === 'Purchase' && (
                        <div className="flex-1">
                          <Input
                            placeholder="Nome do Cliente"
                            onChange={(e) => setEventData({ ...eventData, customer_name: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {(selectedEventType === 'Purchase' || selectedEventType === 'AddToCart' || selectedEventType === 'ViewContent' || selectedEventType === 'InitiateCheckout') && (
                      <div className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                        <Label className="text-xs font-semibold">Preencher via Produto</Label>
                        <Select onValueChange={handleProductSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto para auto-preencher" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} ({Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground">
                          Selecionar um produto preenche automaticamente nome, valor e SKU.
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] text-muted-foreground">
                      Personalize o evento para capturar dados específicos. O snippet abaixo será atualizado automaticamente.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg relative group">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-mono text-muted-foreground">Script de Rastreamento</p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded border border-green-500/20">Código Gerado</span>
                </div>
              </div>
              <pre className="p-4 bg-background/50 border rounded-md overflow-x-auto text-[11px] font-mono leading-relaxed h-[220px]">
                <code>{selectedPixel?.pixelId ? generateInternalScript(selectedPixel.pixelId, selectedEventType, eventData) : '// Selecione um pixel para gerar o código'}</code>
              </pre>
              <Button
                size="sm"
                className="absolute bottom-6 right-6 shadow-lg"
                onClick={() => {
                  const code = generateInternalScript(selectedPixel.pixelId, selectedEventType, eventData);
                  navigator.clipboard.writeText(code);
                  toast({
                    title: "Código copiado!",
                    description: "O código foi copiado. Basta colar no seu site.",
                  });
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Script
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Instruções:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Copie todo o código acima</li>
                <li>Acesse o código-fonte do seu site</li>
                <li>Localize a tag {"<head>"} no início do HTML</li>
                <li>Cole o código logo após a abertura do {"<head>"}</li>
                <li>Salve e publique as alterações</li>
              </ol>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setIsCodeModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Novo Pixel */}
      <Dialog open={isNewPixelOpen} onOpenChange={(open) => {
        setIsNewPixelOpen(open);
        if (!open) {
          setNewPixelType(null);
          setNewPixelData({ name: '', pixelId: '' });
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {!newPixelType ? 'Configurar Novo Pixel' :
                newPixelType === 'facebook' ? 'Facebook Pixel' :
                  newPixelType === 'google' ? 'Google Analytics' :
                    'Pixel Customizado'}
            </DialogTitle>
          </DialogHeader>

          {!newPixelType ? (
            <div className="space-y-6 py-4">
              <p className="text-sm text-muted-foreground">
                Selecione o tipo de pixel que deseja configurar
              </p>

              <div className="grid gap-4">
                <Card
                  className="p-6 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectPixelType('facebook')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">f</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Facebook Pixel</h3>
                      <p className="text-sm text-muted-foreground">
                        Rastreie conversões, otimize anúncios e crie públicos para remarketing
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-6 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectPixelType('google')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">G</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Google Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        Analise o tráfego do site, comportamento dos usuários e conversões
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-6 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectPixelType('custom')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Pixel Customizado</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure um pixel personalizado para outras plataformas
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsNewPixelOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="pixel-name">Nome do Pixel *</Label>
                  <Input
                    id="pixel-name"
                    value={newPixelData.name}
                    onChange={(e) => setNewPixelData({ ...newPixelData, name: e.target.value })}
                    placeholder={
                      newPixelType === 'facebook' ? 'Ex: Facebook Pixel Principal' :
                        newPixelType === 'google' ? 'Ex: Google Analytics Site' :
                          'Ex: Pixel Personalizado'
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pixel-id">
                    {newPixelType === 'facebook' ? 'ID do Pixel Facebook *' :
                      newPixelType === 'google' ? 'ID de Medição (GA4) *' :
                        'ID ou Código do Pixel *'}
                  </Label>
                  <Input
                    id="pixel-id"
                    value={newPixelData.pixelId}
                    onChange={(e) => setNewPixelData({ ...newPixelData, pixelId: e.target.value })}
                    placeholder={
                      newPixelType === 'facebook' ? 'Ex: 1234567890' :
                        newPixelType === 'google' ? 'Ex: G-XXXXXXXXXX' :
                          'Cole o ID ou código completo'
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {newPixelType === 'facebook' && 'Encontre no Gerenciador de Eventos do Facebook'}
                    {newPixelType === 'google' && 'Encontre nas configurações de propriedade do GA4'}
                    {newPixelType === 'custom' && 'Cole o ID fornecido pela plataforma'}
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Próximos passos
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Após criar, copie o código gerado</li>
                  <li>Instale o código no seu site</li>
                  <li>Teste se o pixel está funcionando</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setNewPixelType(null)}>
                  Voltar
                </Button>
                <Button
                  onClick={handleCreatePixel}
                  disabled={loading || !newPixelData.name || (newPixelType !== 'custom' && !newPixelData.pixelId)}
                >
                  {loading ? 'Criando...' : 'Configurar Pixel'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout >
  );
}