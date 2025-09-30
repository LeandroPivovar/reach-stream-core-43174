import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Share2, 
  DollarSign,
  Users,
  TrendingUp,
  Copy,
  Gift,
  Star,
  Calendar
} from 'lucide-react';

export default function Indicacoes() {
  const [referralLink, setReferralLink] = useState('https://nucleo.com/ref/SEU-CODIGO-123');
  
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
    // Could show a toast here
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