import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { CampaignFunnel } from '@/components/tracking/CampaignFunnel';
import { CampaignMetrics } from '@/components/tracking/CampaignMetrics';
import { ClicksBreakdown } from '@/components/tracking/ClicksBreakdown';
import { ConversionDetails } from '@/components/tracking/ConversionDetails';
import { CampaignFilters } from '@/components/tracking/CampaignFilters';

export default function Rastreamento() {
  const { toast } = useToast();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isNewPixelOpen, setIsNewPixelOpen] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<any>(null);
  const [newPixelType, setNewPixelType] = useState<'facebook' | 'google' | 'custom' | null>(null);
  const [newPixelData, setNewPixelData] = useState({
    name: '',
    pixelId: ''
  });
  const [filters, setFilters] = useState({
    campaigns: [],
    period: 'geral',
    dateRange: {}
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    console.log('Filtros aplicados:', newFilters);
    // Aqui você faria a chamada para API com os filtros
    toast({
      title: "Filtros aplicados!",
      description: `Mostrando dados para ${newFilters.campaigns.length || 'todas'} campanha(s) no período: ${newFilters.period}`,
    });
  };

  const trackingCodes = [
    {
      id: 1,
      name: 'Pixel Facebook Ads',
      type: 'Facebook',
      status: 'Ativo',
      events: 1247,
      conversions: 89,
      code: `<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->`
    },
    {
      id: 2,
      name: 'Google Analytics',
      type: 'Google',
      status: 'Ativo',
      events: 3421,
      conversions: 156,
      code: `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
<!-- End Google Analytics -->`
    },
    {
      id: 3,
      name: 'Formulário Landing Page',
      type: 'Form',
      status: 'Ativo',
      events: 892,
      conversions: 234,
      code: `<!-- Pixel de Conversão -->
<script>
  (function() {
    var img = document.createElement('img');
    img.src = 'https://api.nucleo.com/pixel/track?id=FORM_ID';
    img.style.display = 'none';
    document.body.appendChild(img);
  })();
</script>
<!-- End Pixel de Conversão -->`
    }
  ];

  const handleOpenCode = (pixel: any) => {
    setSelectedPixel(pixel);
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

  const handleCreatePixel = () => {
    console.log('Creating pixel:', { type: newPixelType, ...newPixelData });
    setIsNewPixelOpen(false);
    setNewPixelType(null);
    setNewPixelData({ name: '', pixelId: '' });
    toast({
      title: "Pixel configurado!",
      description: "O novo pixel foi configurado com sucesso.",
    });
  };

  const actions = (
    <HeaderActions.Add onClick={() => setIsNewPixelOpen(true)}>
      Novo Pixel
    </HeaderActions.Add>
  );

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
              <CampaignMetrics />
              
              {/* Detalhamento dos Cliques */}
              <ClicksBreakdown />
              
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
                      {trackingCodes.map((code) => (
                        <tr key={code.id} className="border-b border-border last:border-0">
                          <td className="py-4 px-2">
                            <div className="font-medium">{code.name}</div>
                          </td>
                          <td className="py-4 px-2">
                            <Badge variant="outline">{code.type}</Badge>
                          </td>
                          <td className="py-4 px-2">
                            <Badge variant="default">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              {code.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 text-right font-medium">
                            {code.events.toLocaleString()}
                          </td>
                          <td className="py-4 px-2 text-right font-medium">
                            {code.conversions.toLocaleString()}
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleOpenCode(code)}
                              >
                                <Code className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Código de Rastreamento - {selectedPixel?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Copie o código abaixo e cole no <code className="bg-muted px-1 rounded">{"<head>"}</code> do seu site
              </p>
            </div>

            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs">
                <code>{selectedPixel?.code}</code>
              </pre>
              <Button
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopyCode}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código
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
                  disabled={!newPixelData.name || !newPixelData.pixelId}
                >
                  Configurar Pixel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}