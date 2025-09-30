import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Eye, 
  MousePointer, 
  MessageCircle,
  TrendingUp,
  Calendar,
  Users,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      title: 'Total de Envios',
      value: '12.847',
      icon: Send,
      trend: { value: 12.5, isPositive: true },
      description: 'Últimos 30 dias'
    },
    {
      title: 'Taxa de Abertura',
      value: '68.2%',
      icon: Eye,
      trend: { value: -2.1, isPositive: false },
      description: 'Média geral'
    },
    {
      title: 'Cliques',
      value: '2.164',
      icon: MousePointer,
      trend: { value: 8.3, isPositive: true },
      description: 'CTR de 16.8%'
    },
    {
      title: 'Respostas',
      value: '534',
      icon: MessageCircle,
      trend: { value: 5.7, isPositive: true },
      description: 'Taxa de resposta 4.2%'
    }
  ];

  const recentCampaigns = [
    {
      name: 'Promoção Black Friday',
      type: 'WhatsApp + E-mail',
      status: 'Ativa',
      sent: 2847,
      opens: 1943,
      clicks: 312
    },
    {
      name: 'Carrinho Abandonado',
      type: 'E-mail',
      status: 'Pausada',
      sent: 1254,
      opens: 834,
      clicks: 127
    },
    {
      name: 'Novos Produtos',
      type: 'SMS',
      status: 'Agendada',
      sent: 0,
      opens: 0,
      clicks: 0
    }
  ];

  return (
    <Layout 
      title="Visão Geral" 
      subtitle="Acompanhe o desempenho das suas campanhas"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Desempenho por Canal</h3>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Últimos 30 dias
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">WhatsApp</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">7.234 envios</p>
                  <p className="text-sm text-muted-foreground">76.3% abertura</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">E-mail</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">4.821 envios</p>
                  <p className="text-sm text-muted-foreground">58.7% abertura</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">SMS</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">792 envios</p>
                  <p className="text-sm text-muted-foreground">94.1% abertura</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Feed */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Atividade Recente</h3>
              <Button variant="ghost" size="sm">
                <Activity className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nova campanha criada</p>
                  <p className="text-xs text-muted-foreground">Promoção Black Friday - há 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Campanha finalizada</p>
                  <p className="text-xs text-muted-foreground">Newsletter Semanal - há 4 horas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novos contatos importados</p>
                  <p className="text-xs text-muted-foreground">1.247 contatos adicionados - há 6 horas</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Campanhas Recentes</h3>
            <Button variant="outline">
              Ver todas
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Enviados</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Aberturas</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Cliques</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((campaign, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-4 px-2">
                      <div className="font-medium">{campaign.name}</div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant="secondary">{campaign.type}</Badge>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant={
                        campaign.status === 'Ativa' ? 'default' :
                        campaign.status === 'Pausada' ? 'secondary' : 'outline'
                      }>
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      {campaign.sent.toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      {campaign.opens.toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      {campaign.clicks.toLocaleString()}
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