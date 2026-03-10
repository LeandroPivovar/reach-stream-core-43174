import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Calendar,
  Crown,
  Check,
  Download,
  DollarSign,
  TrendingUp,
  Zap,
  FileText
} from 'lucide-react';
import {
  api,
  Plan,
  Subscription,
  Invoice,
  SubscriptionStats
} from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { BuyCreditsModal } from '@/components/subscriptions/BuyCreditsModal';
import { cn } from '@/lib/utils';

export default function Assinaturas() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);

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

  const currentPlan = subscription?.plan;
  const currentPlanName = currentPlan?.name || 'Gratuito';
  const currentPriceFormatted = currentPlan?.price
    ? `R$ ${currentPlan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : 'R$ 0,00';

  const isExpired = (subscription as any)?.isExpired === true;
  const statusLabel = subscription?.status === 'active' && !isExpired ? 'Ativa' : isExpired ? 'Vencida' : 'Inativa';

  if (loading) {
    return (
      <Layout title="Assinaturas" subtitle="Gerencie seu plano e recursos">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Assinaturas"
      subtitle="Gerencie seu plano e recursos"
    >
      <div className="space-y-10 max-w-7xl mx-auto pb-10">
        {/* Expired Subscription Warning */}
        {isExpired && (
          <div className="flex items-start space-x-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CreditCard className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-destructive">Assinatura Vencida</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sua assinatura do plano <b>{currentPlanName}</b> está vencida. Regularize sua situação selecionando um novo plano abaixo.
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Redesign */}
        <Card className="p-8 bg-white shadow-sm border-border overflow-hidden relative">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            {/* Left Side: Plan Info & Features */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Crown className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900">{currentPlanName}</h3>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 h-6 px-3 mt-1 uppercase text-[10px] font-bold tracking-wider">
                    {statusLabel}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">Recursos incluídos:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {currentPlan?.features?.map((feature, i) => (
                    <li key={i} className="text-sm text-slate-500 flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  )) || <li className="text-sm text-slate-400 italic">Nenhum recurso listado</li>}
                </ul>
              </div>
            </div>

            {/* Right Side: Price & Next Charge */}
            <div className="flex flex-col items-end space-y-6 min-w-[280px]">
              <div className="text-right">
                <p className="text-4xl font-black text-slate-900">{currentPriceFormatted}</p>
                <p className="text-sm text-slate-400 font-medium">por mês</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 w-full flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Próxima cobrança</p>
                  <p className="text-sm font-bold text-slate-700">
                    {subscription?.currentPeriodEnd
                      ? new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')
                      : '--/--/----'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 w-full pt-2">
                <Button
                  variant="ghost"
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-6 border border-slate-100"
                  onClick={() => {
                    document.getElementById('planos-disponiveis')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Alterar Plano
                </Button>
                {subscription && (
                  <button
                    onClick={() => navigate('/cancelar-assinatura')}
                    className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors px-2"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Available Plans Redesign */}
        <div id="planos-disponiveis" className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Planos Disponíveis</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = subscription?.planId === plan.id;
              const isPro = plan.name.toLowerCase().includes('pro');
              const features = Array.isArray(plan.features) ? plan.features : [];
              const limits = plan.limits || { contacts: 0, emails: 0, sms: 0 };

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "p-8 flex flex-col relative transition-all duration-300",
                    isPro ? "border-indigo-600 border-2 ring-1 ring-indigo-600 shadow-xl scale-[1.02] z-10" : "border-border shadow-sm hover:shadow-md",
                    isCurrent && !isPro && "bg-slate-50 border-indigo-200"
                  )}
                >
                  {isPro && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                      Mais Popular
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h4 className="text-xl font-bold text-slate-800 mb-4">{plan.name}</h4>
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-black text-slate-900 leading-none">R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2 font-medium">por {plan.interval === 'monthly' ? 'mês' : 'ano'}</p>
                  </div>

                  {/* Limits Table-like info */}
                  <div className="space-y-4 mb-8 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">Contatos</span>
                      <span className="text-slate-900 font-black">{limits.contacts.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">Envios de E-mail</span>
                      <span className="text-slate-900 font-black">{limits.emails.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">Envios de SMS</span>
                      <span className="text-slate-900 font-black">{limits.sms?.toLocaleString('pt-BR') || '0'}</span>
                    </div>
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-4 flex-1">
                    {features.map((feature, i) => (
                      <li key={i} className="text-sm text-slate-500 flex items-start space-x-3">
                        <Check className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn(
                      "w-full mt-10 h-12 font-bold transition-all",
                      isCurrent && "bg-slate-100 text-slate-400 hover:bg-slate-100 cursor-default shadow-none",
                      !isCurrent && isPro && "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200",
                      !isCurrent && !isPro && "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                    )}
                    disabled={isCurrent}
                    onClick={() => navigate(`/checkout/${plan.id}`)}
                  >
                    {isCurrent ? 'Plano Atual' : 'Selecionar Plano'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Usage Stats (Keep existing logic but clean up UI slightly) */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900">Consumo do Mês</h3>
            <Button
              variant="outline"
              className="bg-white hover:bg-slate-50 border-slate-200 text-slate-600 font-bold"
              onClick={() => setIsBuyCreditsModalOpen(true)}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Comprar Pacotes Adicionais
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* SMS Card */}
            {(() => {
              const used = (stats as any)?.smsSent ?? 0;
              const limit = (stats as any)?.smsLimit;
              const pct = limit && limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
              return (
                <Card className="p-6 border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">SMS</span>
                  </div>
                  <p className="text-sm font-medium text-slate-400">SMS Enviados</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {used.toLocaleString()}
                    {limit != null && limit !== -1 && (
                      <span className="text-sm font-medium text-slate-400 ml-1"> / {Number(limit).toLocaleString()}</span>
                    )}
                    {limit === -1 && <span className="text-sm font-medium text-slate-400 ml-1"> / ∞</span>}
                  </p>
                  {limit != null && limit !== -1 && (
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
                      <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </Card>
              );
            })()}

            {/* Emails Card */}
            {(() => {
              const used = (stats as any)?.emailsSent ?? 0;
              const limit = (stats as any)?.emailsLimit;
              const pct = limit && limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
              return (
                <Card className="p-6 border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold uppercase">Email</span>
                  </div>
                  <p className="text-sm font-medium text-slate-400">Emails Enviados</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {used.toLocaleString()}
                    {limit != null && limit !== -1 && (
                      <span className="text-sm font-medium text-slate-400 ml-1"> / {Number(limit).toLocaleString()}</span>
                    )}
                    {limit === -1 && <span className="text-sm font-medium text-slate-400 ml-1"> / ∞</span>}
                  </p>
                  {limit != null && limit !== -1 && (
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
                      <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </Card>
              );
            })()}

            {/* WhatsApp Card */}
            {(() => {
              const used = (stats as any)?.whatsappSent ?? 0;
              const limit = (stats as any)?.whatsappLimit;
              const pct = limit && limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
              return (
                <Card className="p-6 border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold uppercase">WhatsApp</span>
                  </div>
                  <p className="text-sm font-medium text-slate-400">WhatsApp Enviados</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {used.toLocaleString()}
                    {limit != null && limit !== -1 && limit !== 0 && (
                      <span className="text-sm font-medium text-slate-400 ml-1"> / {Number(limit).toLocaleString()}</span>
                    )}
                    {(limit === -1 || limit === true) && <span className="text-sm font-medium text-slate-400 ml-1"> / ∞</span>}
                  </p>
                  {limit != null && limit !== -1 && limit !== 0 && (
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </Card>
              );
            })()}

            {/* Campaigns Card */}
            {(() => {
              const used = (stats as any)?.campaignsCreated ?? 0;
              const limit = (stats as any)?.campaignsLimit;
              const pct = limit && limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
              return (
                <Card className="p-6 border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold uppercase">Campanhas</span>
                  </div>
                  <p className="text-sm font-medium text-slate-400">Campanhas Criadas</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {used.toLocaleString()}
                    {limit != null && limit !== -1 && (
                      <span className="text-sm font-medium text-slate-400 ml-1"> / {Number(limit).toLocaleString()}</span>
                    )}
                    {limit === -1 && <span className="text-sm font-medium text-slate-400 ml-1"> / ∞</span>}
                  </p>
                  {limit != null && limit !== -1 && (
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
                      <div className="bg-purple-600 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </Card>
              );
            })()}
          </div>
        </div>

        {/* Transaction History (Cleaned up a bit) */}
        <Card className="p-8 border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Histórico de Pagamentos</h3>
            <Button variant="outline" className="font-bold border-slate-200">
              <Download className="w-4 h-4 mr-2" />
              Baixar Faturas
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-4 font-bold text-xs uppercase tracking-widest text-slate-400">Data</th>
                  <th className="pb-4 font-bold text-xs uppercase tracking-widest text-slate-400">Status</th>
                  <th className="pb-4 font-bold text-xs uppercase tracking-widest text-slate-400 text-right">Valor</th>
                  <th className="pb-4 font-bold text-xs uppercase tracking-widest text-slate-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-5 font-medium text-slate-600 text-sm">
                        {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-5">
                        <Badge
                          variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                          className={cn(
                            "h-6 px-3 uppercase text-[10px] font-bold tracking-wider",
                            invoice.status === 'paid' ? "bg-emerald-500 hover:bg-emerald-500" : "bg-orange-400 text-white"
                          )}
                        >
                          {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </td>
                      <td className="py-5 text-right font-black text-slate-900 text-sm">
                        R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          disabled={!invoice.hostedInvoiceUrl}
                          onClick={() => invoice.hostedInvoiceUrl && window.open(invoice.hostedInvoiceUrl, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Fatura
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                      Nenhuma fatura encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <BuyCreditsModal
        isOpen={isBuyCreditsModalOpen}
        onClose={() => setIsBuyCreditsModalOpen(false)}
        onSuccess={fetchData}
      />
    </Layout>
  );
}
