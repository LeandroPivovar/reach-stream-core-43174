import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  Send, 
  Layers, 
  Link as LinkIcon, 
  Activity, 
  MousePointer2,
  Globe,
  Monitor
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const AdminSystemOverview = () => {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-system-overview'],
    queryFn: () => api.getAdminSystemOverview(),
  });

  const { data: trends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['admin-event-trends'],
    queryFn: () => api.getAdminEventStats(30),
  });

  if (isLoadingStats || isLoadingTrends) {
    return (
      <AdminLayout title="Visão Geral do Sistema">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const integrationData = [
    { name: 'Shopify', value: stats?.integrationsBreakdown.shopify || 0 },
    { name: 'Nuvemshop', value: stats?.integrationsBreakdown.nuvemshop || 0 },
    { name: 'VTEX', value: stats?.integrationsBreakdown.vtex || 0 },
    { name: 'Loja Integrada', value: stats?.integrationsBreakdown.lojaIntegrada || 0 },
  ].filter(i => i.value > 0);

  return (
    <AdminLayout 
      title="Visão Geral" 
      subtitle="Monitoramento operacional e telemetria de uso global"
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Visão Geral do Sistema</h1>
            <p className="text-muted-foreground">Monitoramento operacional e telemetria de uso global.</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Sistema Online</span>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none bg-gradient-to-br from-blue-500/10 to-transparent shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contatos Criados</p>
                  <h3 className="text-2xl font-bold">{stats?.counts.contacts.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-emerald-500/10 to-transparent shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Campanhas Ativas</p>
                  <h3 className="text-2xl font-bold">{stats?.counts.campaigns.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-600">
                  <Send className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-purple-500/10 to-transparent shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categorias Únicas</p>
                  <h3 className="text-2xl font-bold">{stats?.counts.categories.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-600">
                  <Layers className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-amber-500/10 to-transparent shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interações de Link</p>
                  <h3 className="text-2xl font-bold">{stats?.counts.trackingLinks.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-600">
                  <LinkIcon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Tendência (Atividade do Sistema) */}
          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Atividade do Sistema (30 Dias)
              </CardTitle>
              <CardDescription>Eventos totais processados diariamente.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pr-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Telas Acessadas */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Top 10 Telas (Acessos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5 max-w-[70%]">
                      <span className="text-sm font-medium truncate">{page.name}</span>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(page.count / stats.topPages[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-primary/5 text-primary px-2 py-1 rounded-md">
                      {page.count} views
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funcionalidades Mais Usadas */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer2 className="h-5 w-5 text-primary" />
                Ações e Funcionalidades
              </CardTitle>
              <CardDescription>Funções mais executadas pelos usuários.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.topActions} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11}} 
                    width={120}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Integrações */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Ecossistema de Integrações
              </CardTitle>
              <CardDescription>Distribuição de plataformas conectadas.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-8 h-[300px]">
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={integrationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {integrationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-auto space-y-4 min-w-[150px]">
                {integrationData.map((integ, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{integ.name}</span>
                      <span className="text-xs text-muted-foreground">{integ.value} conexões</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSystemOverview;
