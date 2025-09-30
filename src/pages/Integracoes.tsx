import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Webhook,
  Settings,
  ExternalLink,
  Check,
  X
} from 'lucide-react';

export default function Integracoes() {
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

  const actions = (
    <HeaderActions.Add onClick={() => console.log('New integration')}>
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
                      <Button size="sm" className="flex-1">
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
            <Button variant="outline">
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
    </Layout>
  );
}