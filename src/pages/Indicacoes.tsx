import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Share2, 
  DollarSign,
  Users,
  TrendingUp,
  Copy,
  Gift,
  Star,
  Calendar,
  Info,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

export default function Indicacoes() {
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState(`https://nucleo.com/ref/SEU-CODIGO-123`);

  // Histórico de ganhos dos últimos 6 meses (mock data)
  const historicalEarnings = [
    { month: 'Out/24', earnings: 320 },
    { month: 'Nov/24', earnings: 380 },
    { month: 'Dez/24', earnings: 420 },
    { month: 'Jan/25', earnings: 456 },
    { month: 'Fev/25', earnings: 490 },
    { month: 'Mar/25', earnings: 540 },
  ];

  // Cálculo da previsão
  const forecastData = useMemo(() => {
    // Calcula a tendência dos últimos 3 meses
    const last3Months = historicalEarnings.slice(-3);
    const avgGrowth = (last3Months[2].earnings - last3Months[0].earnings) / 2;
    const currentMonthEarnings = historicalEarnings[historicalEarnings.length - 1].earnings;

    // Gera previsão para os próximos 6 meses
    const forecast = [];
    const monthNames = ['Abr/25', 'Mai/25', 'Jun/25', 'Jul/25', 'Ago/25', 'Set/25'];
    
    for (let i = 0; i < 6; i++) {
      const projectedEarnings = currentMonthEarnings + (avgGrowth * (i + 1));
      forecast.push({
        month: monthNames[i],
        earnings: Math.round(projectedEarnings),
        isProjected: true
      });
    }

    // Combina histórico com previsão
    return [
      ...historicalEarnings.map(item => ({ ...item, isProjected: false })),
      ...forecast
    ];
  }, []);

  // Cálculo de totais da previsão
  const forecastSummary = useMemo(() => {
    const projectedMonths = forecastData.filter(item => item.isProjected);
    const total = projectedMonths.reduce((sum, item) => sum + item.earnings, 0);
    const avgMonthly = Math.round(total / projectedMonths.length);
    
    return { total, avgMonthly };
  }, [forecastData]);
  
  const stats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 456.00,
    pendingEarnings: 97.00
  };

  const referrals = [
    {
      id: 1,
      name: 'Ana Silva',
      email: 'ana.silva@email.com',
      signupDate: '2024-03-15',
      status: 'Ativo',
      plan: 'Pro',
      commission: 48.50,
      commissionStatus: 'Pago'
    },
    {
      id: 2,
      name: 'Carlos Santos',
      email: 'carlos@empresa.com',
      signupDate: '2024-03-10',
      status: 'Ativo',
      plan: 'Enterprise',
      commission: 123.50,
      commissionStatus: 'Pago'
    },
    {
      id: 3,
      name: 'Mariana Costa',
      email: 'mariana@startup.com',
      signupDate: '2024-03-20',
      status: 'Trial',
      plan: 'Pro',
      commission: 48.50,
      commissionStatus: 'Pendente'
    }
  ];

  const commissionRules = [
    { plan: 'Starter', commission: '30%', amount: 'R$ 14,10' },
    { plan: 'Pro', commission: '50%', amount: 'R$ 48,50' },
    { plan: 'Enterprise', commission: '50%', amount: 'R$ 123,50' }
  ];

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link copiado!",
      description: "O link de indicação foi copiado para a área de transferência.",
    });
  };

  return (
    <Layout 
      title="Programa de Indicações" 
      subtitle="Indique amigos e ganhe comissões recorrentes"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Indicações</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalReferrals}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Indicações Ativas</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeReferrals}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ganho</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {stats.totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {stats.pendingEarnings.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Previsão de Ganhos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUpIcon className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Previsão de ganhos nos próximos 6 meses</h3>
                <p className="text-sm text-muted-foreground">
                  Baseado no seu histórico e indicações ativas
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Estimado (6 meses)</p>
                  <p className="text-3xl font-bold text-green-600">
                    R$ {forecastSummary.total.toLocaleString('pt-BR')}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500/30" />
              </div>
            </Card>

            <Card className="p-4 bg-muted/30 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Média Mensal Projetada</p>
                  <p className="text-3xl font-bold text-foreground">
                    R$ {forecastSummary.avgMonthly.toLocaleString('pt-BR')}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-muted-foreground/30" />
              </div>
            </Card>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string, props: any) => [
                    `R$ ${value.toLocaleString('pt-BR')}`,
                    props.payload.isProjected ? 'Projetado' : 'Real'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={payload.isProjected ? 'hsl(var(--green-500))' : 'hsl(var(--primary))'}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <Info className="w-3 h-3 inline mr-1" />
              A previsão é baseada na média de crescimento dos últimos 3 meses e pode variar conforme novas indicações e cancelamentos.
            </p>
          </div>
        </Card>

        {/* Referral Link */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Share2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Seu Link de Indicação</h3>
                <p className="text-sm text-muted-foreground">
                  Compartilhe este link e ganhe comissões recorrentes
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Referral Link Input */}
            <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={copyReferralLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start space-x-3">
              <Gift className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Bônus Especial!</p>
                <p className="text-sm text-muted-foreground">
                  Ganhe R$ 50 extras na primeira indicação que assinar um plano pago.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Como funciona o acordo */}
        <Card className="p-6 border-2 border-primary/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <span>Como funciona o seu acordo</span>
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">Você recebe comissão por cada venda</strong> feita através da sua indicação. 
                  O valor é calculado sobre as vendas confirmadas no mês seguinte.
                </p>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>As comissões são creditadas automaticamente 30 dias após o primeiro pagamento do indicado</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Você continua recebendo enquanto o indicado mantiver a assinatura ativa</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Os pagamentos são processados mensalmente via PIX ou depósito bancário</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Não há limite de indicações - quanto mais você indicar, mais você ganha</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    💡 Dica: Você pode ajustar a porcentagem de comissão que o seu indicado receberá antes de enviar o convite.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Commission Structure */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estrutura de Comissões</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {commissionRules.map((rule) => (
              <Card key={rule.plan} className="p-4 border-2 border-border">
                <div className="text-center">
                  <h4 className="font-semibold mb-2">{rule.plan}</h4>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {rule.commission}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    de comissão recorrente
                  </p>
                  <Badge variant="secondary">
                    {rule.amount}/mês
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Como funciona:</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Você ganha comissão recorrente enquanto o indicado mantiver a assinatura ativa</li>
              <li>• Pagamentos são feitos mensalmente via PIX ou depósito</li>
              <li>• Sem limite de indicações - quanto mais indicar, mais ganha</li>
              <li>• Comissões são creditadas 30 dias após o primeiro pagamento do indicado</li>
            </ul>
          </div>
        </Card>

        {/* Referrals Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Suas Indicações</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">E-mail</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Data Cadastro</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Plano</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Comissão</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Status Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-border last:border-0">
                    <td className="py-4 px-2">
                      <div className="font-medium">{referral.name}</div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-sm text-muted-foreground">{referral.email}</div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-sm">
                        {new Date(referral.signupDate).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant={referral.status === 'Ativo' ? 'default' : 'secondary'}>
                        {referral.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant="outline">{referral.plan}</Badge>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-medium">
                        R$ {referral.commission.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">por mês</div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Badge 
                        variant={referral.commissionStatus === 'Pago' ? 'default' : 'secondary'}
                      >
                        {referral.commissionStatus}
                      </Badge>
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