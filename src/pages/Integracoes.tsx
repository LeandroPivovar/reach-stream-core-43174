import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingBag, 
  Webhook,
  Settings,
  ExternalLink,
  Check,
  X,
  ArrowLeft,
  Store,
  Zap
} from 'lucide-react';

export default function Integracoes() {
  const { toast } = useToast();
  const [isNewIntegrationOpen, setIsNewIntegrationOpen] = useState(false);
  const [integrationType, setIntegrationType] = useState<'ecommerce' | 'webhook' | null>(null);
  const [selectedEcommerce, setSelectedEcommerce] = useState<string | null>(null);
  const [ecommerceData, setEcommerceData] = useState({
    apiKey: '',
    storeName: '',
    domain: ''
  });
  const [tryData, setTryData] = useState({
    apiKey: '',
    secretKey: '',
    endpoint: ''
  });
  const [vtexData, setVtexData] = useState({
    accountName: '',
    appKey: '',
    appToken: ''
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [webhookData, setWebhookData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    headers: '',
    payloadExample: ''
  });

  const integrations = [
    {
      id: 1,
      name: 'Shopify',
      description: 'Conecte sua loja Shopify para sincronizar produtos e pedidos',
      icon: ShoppingBag,
      status: 'Conectado',
      color: 'bg-green-500',
      features: ['Sincronização de produtos', 'Carrinho abandonado', 'Pedidos em tempo real']
    },
    {
      id: 2,
      name: 'Nuvemshop',
      description: 'Integração completa com sua loja Nuvemshop',
      icon: ShoppingBag,
      status: 'Disponível',
      color: 'bg-blue-500',
      features: ['Produtos automáticos', 'Status de pedidos', 'Clientes VIP']
    },
    {
      id: 3,
      name: 'Loja Integrada',
      description: 'Conecte com a Loja Integrada para automações avançadas',
      icon: ShoppingBag,
      status: 'Disponível',
      color: 'bg-purple-500',
      features: ['Catálogo sincronizado', 'Remarketing', 'Análise de vendas']
    },
    {
      id: 4,
      name: 'Try',
      description: 'Integração com a plataforma Try para gestão de vendas',
      icon: Zap,
      status: 'Disponível',
      color: 'bg-orange-500',
      features: ['API de produtos', 'Sincronização de pedidos', 'Webhooks em tempo real']
    },
    {
      id: 5,
      name: 'VTEX',
      description: 'Conecte sua loja VTEX para automação completa',
      icon: Store,
      status: 'Disponível',
      color: 'bg-pink-500',
      features: ['Catálogo unificado', 'OMS integrado', 'Checkout personalizado']
    }
  ];

  const webhookIntegrations = [
    {
      id: 1,
      name: 'Webhook Personalizado #1',
      url: 'https://api.minhaempresa.com/webhook',
      events: ['lead_captured', 'campaign_sent'],
      status: 'Ativo',
      lastTrigger: '2024-03-22 14:30'
    },
    {
      id: 2,
      name: 'Sistema CRM',
      url: 'https://crm.empresa.com/api/leads',
      events: ['contact_created', 'tag_added'],
      status: 'Erro',
      lastTrigger: '2024-03-20 10:15'
    }
  ];

  const handleOpenNewIntegration = () => {
    setIntegrationType(null);
    setSelectedEcommerce(null);
    setIsNewIntegrationOpen(true);
  };

  const handleSelectIntegrationType = (type: 'ecommerce' | 'webhook') => {
    setIntegrationType(type);
  };

  const handleSelectEcommerce = (platform: string) => {
    setSelectedEcommerce(platform);
  };

  const handleTestConnection = async (platform: 'try' | 'vtex') => {
    setTestingConnection(true);
    
    // Simulate API test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        toast({
          title: "Conexão bem-sucedida!",
          description: `A conexão com ${platform === 'try' ? 'Try' : 'VTEX'} foi testada com sucesso.`,
        });
      } else {
        toast({
          title: "Erro na conexão",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive",
        });
      }
      setTestingConnection(false);
    }, 2000);
  };

  const handleConnect = () => {
    if (integrationType === 'ecommerce') {
      if (selectedEcommerce === 'Try') {
        console.log('Connecting Try:', tryData);
        // Here you would save to database with encrypted credentials
        toast({
          title: "Try conectado!",
          description: "Credenciais salvas com segurança.",
        });
      } else if (selectedEcommerce === 'VTEX') {
        console.log('Connecting VTEX:', vtexData);
        // Here you would save to database with encrypted credentials
        toast({
          title: "VTEX conectada!",
          description: "Credenciais salvas com segurança.",
        });
      } else {
        console.log('Connecting e-commerce:', { platform: selectedEcommerce, ...ecommerceData });
        toast({
          title: "E-commerce conectado!",
          description: `${selectedEcommerce} foi conectado com sucesso.`,
        });
      }
    } else {
      console.log('Creating webhook:', webhookData);
      toast({
        title: "Webhook criado!",
        description: "O webhook foi configurado com sucesso.",
      });
    }
    setIsNewIntegrationOpen(false);
    setIntegrationType(null);
    setSelectedEcommerce(null);
    setEcommerceData({ apiKey: '', storeName: '', domain: '' });
    setTryData({ apiKey: '', secretKey: '', endpoint: '' });
    setVtexData({ accountName: '', appKey: '', appToken: '' });
    setWebhookData({ name: '', url: '', events: [], headers: '', payloadExample: '' });
  };

  const handleCloseIntegration = () => {
    setIsNewIntegrationOpen(false);
    setIntegrationType(null);
    setSelectedEcommerce(null);
    setEcommerceData({ apiKey: '', storeName: '', domain: '' });
    setTryData({ apiKey: '', secretKey: '', endpoint: '' });
    setVtexData({ accountName: '', appKey: '', appToken: '' });
    setWebhookData({ name: '', url: '', events: [], headers: '', payloadExample: '' });
  };

  const toggleEvent = (event: string) => {
    setWebhookData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const actions = (
    <HeaderActions.Add onClick={handleOpenNewIntegration}>
      Nova Integração
    </HeaderActions.Add>
  );

  return (
    <Layout 
      title="Integrações" 
      subtitle="Conecte o Núcleo com suas ferramentas favoritas"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Integrações Ativas</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Webhooks Configurados</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Webhook className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* E-commerce Integrations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Integrações E-commerce</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              const isConnected = integration.status === 'Conectado';
              
              return (
                <Card key={integration.id} className="p-6 border-2 border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{integration.name}</h4>
                        <Badge variant={isConnected ? 'default' : 'secondary'}>
                          {integration.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground">Recursos:</p>
                    {integration.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2 text-sm">
                        <Check className="w-3 h-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    {isConnected ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar
                        </Button>
                        <Button variant="outline" size="sm">
                          Desconectar
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={handleOpenNewIntegration}
                      >
                        Conectar
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Webhook Integrations */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Webhooks Personalizados</h3>
            <Button 
              variant="outline"
              onClick={handleOpenNewIntegration}
            >
              <Webhook className="w-4 h-4 mr-2" />
              Novo Webhook
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">URL</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Eventos</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Último Trigger</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {webhookIntegrations.map((webhook) => (
                  <tr key={webhook.id} className="border-b border-border last:border-0">
                    <td className="py-4 px-2">
                      <div className="font-medium">{webhook.name}</div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {webhook.url}
                        </code>
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant={webhook.status === 'Ativo' ? 'default' : 'destructive'}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          webhook.status === 'Ativo' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {webhook.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-sm text-muted-foreground">
                        {webhook.lastTrigger}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <X className="w-4 h-4" />
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

      {/* Modal Nova Integração */}
      <Dialog open={isNewIntegrationOpen} onOpenChange={setIsNewIntegrationOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {!integrationType && 'Nova Integração'}
              {integrationType === 'ecommerce' && !selectedEcommerce && 'Conectar E-commerce'}
              {selectedEcommerce && `Conectar ${selectedEcommerce}`}
              {integrationType === 'webhook' && 'Novo Webhook'}
            </DialogTitle>
          </DialogHeader>

          {/* Seleção de Tipo */}
          {!integrationType && (
            <div className="space-y-6 py-4">
              <p className="text-sm text-muted-foreground">
                Escolha o tipo de integração que deseja configurar
              </p>

              <div className="grid gap-4">
                <Card 
                  className="p-6 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectIntegrationType('ecommerce')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Store className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">E-commerce</h3>
                      <p className="text-sm text-muted-foreground">
                        Conecte sua loja online (Shopify, Nuvemshop, Loja Integrada, WooCommerce)
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectIntegrationType('webhook')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Webhook className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Webhook Personalizado</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure webhooks para integrar com qualquer sistema ou API
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={handleCloseIntegration}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Seleção de E-commerce */}
          {integrationType === 'ecommerce' && !selectedEcommerce && (
            <div className="space-y-6 py-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Selecione a plataforma de e-commerce que deseja conectar
                </p>
              </div>

              <div className="grid gap-3">
                <Card 
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectEcommerce('Shopify')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Shopify</p>
                      <p className="text-xs text-muted-foreground">
                        Sincronize produtos e pedidos
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectEcommerce('Nuvemshop')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Nuvemshop</p>
                      <p className="text-xs text-muted-foreground">
                        Integração completa com sua loja
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectEcommerce('Loja Integrada')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Loja Integrada</p>
                      <p className="text-xs text-muted-foreground">
                        Automações avançadas
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectEcommerce('WooCommerce')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">WooCommerce</p>
                      <p className="text-xs text-muted-foreground">
                        Para lojas WordPress
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectEcommerce('Try')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Try</p>
                      <p className="text-xs text-muted-foreground">
                        Gestão de vendas e pedidos
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectEcommerce('VTEX')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">VTEX</p>
                      <p className="text-xs text-muted-foreground">
                        Plataforma e-commerce enterprise
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIntegrationType(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </div>
          )}

          {/* Configuração E-commerce */}
          {selectedEcommerce && selectedEcommerce !== 'Try' && selectedEcommerce !== 'VTEX' && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Preencha os dados para conectar sua loja {selectedEcommerce}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="store-name">Nome da Loja *</Label>
                  <Input
                    id="store-name"
                    value={ecommerceData.storeName}
                    onChange={(e) => setEcommerceData({ ...ecommerceData, storeName: e.target.value })}
                    placeholder="Ex: Minha Loja Exemplo"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="store-domain">Domínio da Loja *</Label>
                  <Input
                    id="store-domain"
                    value={ecommerceData.domain}
                    onChange={(e) => setEcommerceData({ ...ecommerceData, domain: e.target.value })}
                    placeholder={
                      selectedEcommerce === 'Shopify' ? 'minhaloja.myshopify.com' :
                      selectedEcommerce === 'Nuvemshop' ? 'minhaloja.nuvemshop.com.br' :
                      'minhaloja.com.br'
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="api-key">
                    {selectedEcommerce === 'WooCommerce' ? 'Consumer Key' : 'API Key / Token de Acesso'} *
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={ecommerceData.apiKey}
                    onChange={(e) => setEcommerceData({ ...ecommerceData, apiKey: e.target.value })}
                    placeholder="Cole sua chave de API aqui"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre nas configurações da sua loja em Integrações ou Apps
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Recursos incluídos:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Sincronização automática de produtos</li>
                  <li>Rastreamento de pedidos em tempo real</li>
                  <li>Campanhas de carrinho abandonado</li>
                  <li>Segmentação de clientes por compras</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedEcommerce(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleConnect}
                  disabled={!ecommerceData.storeName || !ecommerceData.domain || !ecommerceData.apiKey}
                >
                  Conectar {selectedEcommerce}
                </Button>
              </div>
            </div>
          )}

          {/* Configuração Try */}
          {selectedEcommerce === 'Try' && (
            <div className="space-y-6 py-4">
              <div className="bg-orange-500/10 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Preencha os dados para conectar sua conta Try
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="try-api-key">API Key *</Label>
                  <Input
                    id="try-api-key"
                    type="password"
                    value={tryData.apiKey}
                    onChange={(e) => setTryData({ ...tryData, apiKey: e.target.value })}
                    placeholder="Cole sua API Key da Try"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre nas configurações da sua conta Try em Integrações
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="try-secret-key">Secret Key *</Label>
                  <Input
                    id="try-secret-key"
                    type="password"
                    value={tryData.secretKey}
                    onChange={(e) => setTryData({ ...tryData, secretKey: e.target.value })}
                    placeholder="Cole sua Secret Key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mantenha esta chave em segredo e nunca a compartilhe
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="try-endpoint">Endpoint *</Label>
                  <Input
                    id="try-endpoint"
                    value={tryData.endpoint}
                    onChange={(e) => setTryData({ ...tryData, endpoint: e.target.value })}
                    placeholder="https://api.try.com.br/v1"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL base da API Try (geralmente https://api.try.com.br/v1)
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Recursos incluídos:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>API de produtos e catálogo</li>
                  <li>Sincronização de pedidos</li>
                  <li>Webhooks em tempo real</li>
                  <li>Gestão de estoque integrada</li>
                </ul>
              </div>

              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={() => setSelectedEcommerce(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => handleTestConnection('try')}
                    disabled={!tryData.apiKey || !tryData.secretKey || !tryData.endpoint || testingConnection}
                  >
                    {testingConnection ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                  <Button 
                    onClick={handleConnect}
                    disabled={!tryData.apiKey || !tryData.secretKey || !tryData.endpoint}
                  >
                    Conectar Try
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Configuração VTEX */}
          {selectedEcommerce === 'VTEX' && (
            <div className="space-y-6 py-4">
              <div className="bg-pink-500/10 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Preencha os dados para conectar sua conta VTEX
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="vtex-account">Account Name *</Label>
                  <Input
                    id="vtex-account"
                    value={vtexData.accountName}
                    onChange={(e) => setVtexData({ ...vtexData, accountName: e.target.value })}
                    placeholder="Ex: minhaempresa"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome da sua conta VTEX (encontrado na URL: minhaempresa.vtexcommercestable.com.br)
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="vtex-app-key">App Key *</Label>
                  <Input
                    id="vtex-app-key"
                    type="password"
                    value={vtexData.appKey}
                    onChange={(e) => setVtexData({ ...vtexData, appKey: e.target.value })}
                    placeholder="Cole sua App Key da VTEX"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gere nas configurações da VTEX em Conta &gt; Chaves de aplicação
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="vtex-app-token">App Token *</Label>
                  <Input
                    id="vtex-app-token"
                    type="password"
                    value={vtexData.appToken}
                    onChange={(e) => setVtexData({ ...vtexData, appToken: e.target.value })}
                    placeholder="Cole seu App Token"
                  />
                  <p className="text-xs text-muted-foreground">
                    Token gerado junto com a App Key - mantenha em segredo
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Recursos incluídos:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Catálogo unificado de produtos</li>
                  <li>OMS (Order Management System) integrado</li>
                  <li>Checkout personalizado</li>
                  <li>Rastreamento de pedidos avançado</li>
                </ul>
              </div>

              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={() => setSelectedEcommerce(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => handleTestConnection('vtex')}
                    disabled={!vtexData.accountName || !vtexData.appKey || !vtexData.appToken || testingConnection}
                  >
                    {testingConnection ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                  <Button 
                    onClick={handleConnect}
                    disabled={!vtexData.accountName || !vtexData.appKey || !vtexData.appToken}
                  >
                    Conectar VTEX
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Configuração Webhook */}
          {integrationType === 'webhook' && (
            <div className="space-y-6 py-4">
              <div className="bg-purple-500/10 p-4 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">O que são Webhooks?</h4>
                <p className="text-sm text-muted-foreground">
                  Os webhooks permitem que seu sistema receba notificações automáticas sempre que um evento ocorrer no Núcleo. 
                  Configure a URL do seu sistema que receberá os dados e escolha quais eventos deseja monitorar.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="webhook-name">Nome do Webhook *</Label>
                  <Input
                    id="webhook-name"
                    value={webhookData.name}
                    onChange={(e) => setWebhookData({ ...webhookData, name: e.target.value })}
                    placeholder="Ex: Sistema CRM Principal, Zapier Vendas, Integração Make"
                  />
                  <p className="text-xs text-muted-foreground">
                    Escolha um nome que identifique facilmente esta integração
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="webhook-url">URL do Webhook *</Label>
                  <Input
                    id="webhook-url"
                    value={webhookData.url}
                    onChange={(e) => setWebhookData({ ...webhookData, url: e.target.value })}
                    placeholder="https://api.meusistema.com.br/webhook"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL que receberá as notificações (endereço completo incluindo https://)
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Eventos de Disparo *</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Selecione os eventos que devem acionar este webhook
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'lead_captured', label: 'Lead capturado' },
                      { key: 'contact_created', label: 'Contato criado' },
                      { key: 'campaign_sent', label: 'Campanha enviada' },
                      { key: 'tag_added', label: 'Tag adicionada' },
                      { key: 'form_submitted', label: 'Formulário enviado' },
                      { key: 'purchase_completed', label: 'Compra finalizada' }
                    ].map((event) => (
                      <Card 
                        key={event.key}
                        className={`p-3 cursor-pointer transition-colors ${
                          webhookData.events.includes(event.key) ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => toggleEvent(event.key)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            webhookData.events.includes(event.key) ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}>
                            {webhookData.events.includes(event.key) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm">{event.label}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="webhook-headers">Cabeçalhos Personalizados (Opcional)</Label>
                  <Textarea
                    id="webhook-headers"
                    value={webhookData.headers}
                    onChange={(e) => setWebhookData({ ...webhookData, headers: e.target.value })}
                    placeholder='{"Authorization": "Bearer seu-token-aqui", "Content-Type": "application/json"}'
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adicione cabeçalhos HTTP personalizados em formato JSON (ex: tokens de autenticação)
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="webhook-payload">Exemplo do Corpo da Requisição</Label>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs font-medium mb-2">O webhook enviará dados neste formato:</p>
                    <pre className="text-xs overflow-x-auto">
{`{
  "event_type": "lead_captured",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "lead_id": "12345",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "(11) 98765-4321",
    "source": "formulario_site"
  }
}`}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Os dados enviados variam de acordo com o tipo de evento
                  </p>
                </div>
              </div>

              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Webhook className="w-4 h-4" />
                  Como funciona o Webhook
                </h4>
                <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Quando um dos eventos selecionados ocorrer no Núcleo</li>
                  <li>Enviaremos automaticamente uma requisição POST para a URL configurada</li>
                  <li>Com os dados do evento em formato JSON no corpo da requisição</li>
                  <li>Seu sistema receberá e poderá processar essas informações em tempo real</li>
                </ol>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIntegrationType(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleConnect}
                  disabled={!webhookData.name || !webhookData.url || webhookData.events.length === 0}
                >
                  Criar Webhook
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}