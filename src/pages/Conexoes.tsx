import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mail, 
  Smartphone,
  Wifi,
  WifiOff,
  Settings,
  Trash2
} from 'lucide-react';

export default function Conexoes() {
  const connections = [
    {
      id: 1,
      type: 'WhatsApp',
      name: 'WhatsApp Business',
      status: 'Conectado',
      icon: MessageSquare,
      lastSync: '2024-03-22 14:30',
      phone: '+55 11 99999-9999'
    },
    {
      id: 2,
      type: 'E-mail',
      name: 'Gmail SMTP',
      status: 'Conectado',
      icon: Mail,
      lastSync: '2024-03-22 12:15',
      email: 'contato@empresa.com'
    },
    {
      id: 3,
      type: 'SMS',
      name: 'Zenvia SMS',
      status: 'Desconectado',
      icon: Smartphone,
      lastSync: '2024-03-20 08:45',
      provider: 'Zenvia'
    }
  ];

  const actions = (
    <HeaderActions.Add onClick={() => console.log('New connection')}>
      Nova Conexão
    </HeaderActions.Add>
  );

  return (
    <Layout 
      title="Conexões" 
      subtitle="Gerencie suas integrações com canais de comunicação"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conexões Ativas</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Desconectadas</p>
                <p className="text-2xl font-bold text-foreground">1</p>
              </div>
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Canais</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Connections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {connections.map((connection) => {
            const Icon = connection.icon;
            const isConnected = connection.status === 'Conectado';
            
            return (
              <Card key={connection.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isConnected ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isConnected ? 'text-green-500' : 'text-red-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{connection.name}</h3>
                      <p className="text-sm text-muted-foreground">{connection.type}</p>
                    </div>
                  </div>
                  
                  <Badge variant={isConnected ? 'default' : 'secondary'}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {connection.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {connection.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground">Número</p>
                      <p className="text-sm">{connection.phone}</p>
                    </div>
                  )}
                  {connection.email && (
                    <div>
                      <p className="text-xs text-muted-foreground">E-mail</p>
                      <p className="text-sm">{connection.email}</p>
                    </div>
                  )}
                  {connection.provider && (
                    <div>
                      <p className="text-xs text-muted-foreground">Provedor</p>
                      <p className="text-sm">{connection.provider}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Última sincronização</p>
                    <p className="text-sm">{connection.lastSync}</p>
                  </div>
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
                    <>
                      <Button size="sm" className="flex-1">
                        Reconectar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Setup */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Conectar Novo Canal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <MessageSquare className="w-6 h-6" />
              <span>WhatsApp</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Mail className="w-6 h-6" />
              <span>E-mail</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Smartphone className="w-6 h-6" />
              <span>SMS</span>
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}