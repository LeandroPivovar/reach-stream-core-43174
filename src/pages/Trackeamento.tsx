import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Code, 
  BarChart3,
  Copy,
  ExternalLink,
  Eye,
  MousePointer,
  Users
} from 'lucide-react';

export default function Trackeamento() {
  const trackingCodes = [
    {
      id: 1,
      name: 'Pixel Facebook Ads',
      type: 'Facebook',
      status: 'Ativo',
      events: 1247,
      conversions: 89
    },
    {
      id: 2,
      name: 'Google Analytics',
      type: 'Google',
      status: 'Ativo',
      events: 3421,
      conversions: 156
    },
    {
      id: 3,
      name: 'Formulário Landing Page',
      type: 'Form',
      status: 'Ativo',
      events: 892,
      conversions: 234
    }
  ];

  const actions = (
    <HeaderActions.Add onClick={() => console.log('New tracking')}>
      Novo Pixel
    </HeaderActions.Add>
  );

  return (
    <Layout 
      title="Trackeamento" 
      subtitle="Configure pixels e formulários para capturar leads"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pixels Ativos</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold text-foreground">5.560</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversões</p>
                <p className="text-2xl font-bold text-foreground">479</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                <p className="text-2xl font-bold text-foreground">8.6%</p>
              </div>
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="pixels" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pixels">Pixels</TabsTrigger>
            <TabsTrigger value="forms">Formulários</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

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
                              <Button variant="ghost" size="sm">
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

              {/* New Pixel Setup */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Configurar Novo Pixel</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <div className="w-8 h-8 bg-blue-500 rounded"></div>
                    <span>Facebook Pixel</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <div className="w-8 h-8 bg-red-500 rounded"></div>
                    <span>Google Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <div className="w-8 h-8 bg-gray-500 rounded"></div>
                    <span>Pixel Customizado</span>
                  </Button>
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
    </Layout>
  );
}