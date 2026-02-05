import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
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
import {
  api,
  Plan,
  Subscription,
  Invoice,
  SubscriptionStats
} from '@/lib/api';
import { toast } from 'sonner';

export default function Assinaturas() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, subData, invoicesData, statsData] = await Promise.all([
        api.getPlans(),
        api.getCurrentSubscription(),
        api.getInvoices(),
        api.getSubscriptionStats()
      ]);

      setPlans(plansData || []);
      setSubscription(subData);
      setInvoices(invoicesData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar informações da assinatura');
    } finally {
      setLoading(false);
    }
  };

  const currentPlanName = subscription?.plan?.name || 'Gratuito';
  const currentPrice = subscription?.plan?.price
    ? `R$ ${subscription.plan.price.toString().replace('.', ',')}`
    : 'R$ 0,00';
  const status = subscription?.status === 'active' ? 'Ativa' : 'Inativa';

  const actions = (
    <Button variant="outline" onClick={() => console.log('Export invoices')}>
      <Download className="w-4 h-4 mr-2" />
      Exportar Faturas
    </Button>
  );

  if (loading) {
    return (
      <Layout title="Assinaturas & Pagamentos" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

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
                <h3 className="text-xl font-semibold">{currentPlanName}</h3>
                <Badge variant={status === 'Ativa' ? 'default' : 'secondary'}>
                  {status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{currentPrice}</p>
              <p className="text-sm text-muted-foreground">por mês</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-2">Recursos incluídos:</p>
              <ul className="space-y-1">
                {subscription?.plan?.features?.map((feature, i) => (
                  <li key={i} className="text-sm flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                )) || <li className="text-sm text-muted-foreground">Nenhum plano ativo</li>}
              </ul>
            </div>

            <div className="space-y-4">
              {subscription && (
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Próxima cobrança</span>
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Alterar Plano
                </Button>
                {subscription && (
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Available Plans */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Planos Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = subscription?.planId === plan.id;
              const features = Array.isArray(plan.features) ? plan.features : [];
              const limits = plan.limits || { contacts: 0, emails: 0 };

              return (
                <Card
                  key={plan.id}
                  className={`p-6 relative ${isCurrent ? 'bg-muted/30 border-primary' : ''
                    }`}
                >
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-semibold mb-2">{plan.name}</h4>
                    <div className="text-3xl font-bold mb-1">
                      R$ {plan.price.toString().replace('.', ',')}
                    </div>
                    <p className="text-sm text-muted-foreground">por {plan.interval === 'monthly' ? 'mês' : 'ano'}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span>Contatos</span>
                      <span className="font-medium">{limits.contacts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Envios de E-mail</span>
                      <span className="font-medium">{limits.emails.toLocaleString()}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrent ? 'secondary' : 'default'}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Plano Atual' : 'Selecionar Plano'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contatos Utilizados</p>
                <p className="text-2xl font-bold">
                  {stats?.contactsUsed.toLocaleString()} / {stats?.contactsLimit.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(((stats?.contactsUsed || 0) / (stats?.contactsLimit || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Envios Este Mês</p>
                <p className="text-2xl font-bold">{stats?.emailsSent.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">
                  R$ {stats?.price.toString().replace('.', ',')}
                </p>
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
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Valor</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-2">
                        {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status === 'paid' ? 'Pago' : invoice.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-right font-medium">
                        R$ {invoice.amount.toString().replace('.', ',')}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Fatura
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      Nenhuma fatura encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}