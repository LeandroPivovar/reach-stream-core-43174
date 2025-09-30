import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Calendar,
  TrendingUp,
  DollarSign,
  FileText,
  Download,
  Zap,
  Crown
} from 'lucide-react';

export default function Assinaturas() {
  const currentPlan = {
    name: 'Plano Pro',
    price: 'R$ 97,00',
    period: 'mensal',
    nextBilling: '2024-04-22',
    status: 'Ativa',
    features: [
      'Até 10.000 contatos',
      'Campanhas ilimitadas',
      'WhatsApp + E-mail + SMS',
      'Analytics avançados',
      'Suporte prioritário'
    ]
  };

  const availablePlans = [
    {
      id: 1,
      name: 'Starter',
      price: 'R$ 47,00',
      period: 'mensal',
      contacts: '2.000',
      channels: ['E-mail'],
      features: [
        'Até 2.000 contatos',
        'E-mail marketing',
        'Templates básicos',
        'Suporte por e-mail'
      ],
      isPopular: false
    },
    {
      id: 2,
      name: 'Pro',
      price: 'R$ 97,00',
      period: 'mensal',
      contacts: '10.000',
      channels: ['E-mail', 'WhatsApp', 'SMS'],
      features: [
        'Até 10.000 contatos',
        'Todos os canais',
        'Analytics avançados',
        'Automações ilimitadas',
        'Suporte prioritário'
      ],
      isPopular: true,
      isCurrent: true
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 'R$ 247,00',
      period: 'mensal',
      contacts: '50.000',
      channels: ['E-mail', 'WhatsApp', 'SMS'],
      features: [
        'Até 50.000 contatos',
        'Recursos avançados',
        'API completa',
        'White label',
        'Gerente dedicado'
      ],
      isPopular: false
    }
  ];

  const transactions = [
    {
      id: 1,
      date: '2024-03-22',
      description: 'Plano Pro - Março/2024',
      amount: 'R$ 97,00',
      status: 'Pago',
      method: 'Cartão ****1234'
    },
    {
      id: 2,
      date: '2024-02-22',
      description: 'Plano Pro - Fevereiro/2024',
      amount: 'R$ 97,00',
      status: 'Pago',
      method: 'PIX'
    },
    {
      id: 3,
      date: '2024-01-22',
      description: 'Plano Pro - Janeiro/2024',
      amount: 'R$ 97,00',
      status: 'Pago',
      method: 'Cartão ****1234'
    }
  ];

  const actions = (
    <Button variant="outline" onClick={() => console.log('Export invoices')}>
      <Download className="w-4 h-4 mr-2" />
      Exportar Faturas
    </Button>
  );

  return (
    <Layout 
      title="Assinaturas & Pagamentos" 
      subtitle="Gerencie seu plano e histórico de pagamentos"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Current Plan */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                <Badge variant="default">
                  {currentPlan.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{currentPlan.price}</p>
              <p className="text-sm text-muted-foreground">por mês</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-2">Recursos incluídos:</p>
              <ul className="space-y-1">
                {currentPlan.features.map((feature) => (
                  <li key={feature} className="text-sm flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Próxima cobrança</span>
                </div>
                <span className="text-sm font-medium">
                  {new Date(currentPlan.nextBilling).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Alterar Plano
                </Button>
                <Button variant="outline">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Available Plans */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Planos Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`p-6 relative ${
                  plan.isPopular ? 'border-primary shadow-brand' : ''
                } ${plan.isCurrent ? 'bg-muted/30' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h4 className="text-xl font-semibold mb-2">{plan.name}</h4>
                  <div className="text-3xl font-bold mb-1">{plan.price}</div>
                  <p className="text-sm text-muted-foreground">por {plan.period}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Contatos</span>
                    <span className="font-medium">{plan.contacts}</span>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium mb-1">Canais:</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.channels.map((channel) => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.isCurrent ? 'secondary' : 'default'}
                  disabled={plan.isCurrent}
                >
                  {plan.isCurrent ? 'Plano Atual' : 'Selecionar Plano'}
                </Button>
              </Card>
            ))}
          </div>
        </Card>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contatos Utilizados</p>
                <p className="text-2xl font-bold">4.247 / 10.000</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{width: '42.47%'}}></div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Envios Este Mês</p>
                <p className="text-2xl font-bold">12.847</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Mensal</p>
                <p className="text-2xl font-bold">R$ 97,00</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Histórico de Pagamentos</h3>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Baixar Faturas
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Data</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Descrição</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Método</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Valor</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border last:border-0">
                    <td className="py-4 px-2">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-2">
                      <div className="font-medium">{transaction.description}</div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{transaction.method}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant="default">
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      {transaction.amount}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Fatura
                      </Button>
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