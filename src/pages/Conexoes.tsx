import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Wifi,
  WifiOff,
  Settings,
  QrCode,
  ArrowLeft
} from 'lucide-react';

export default function Conexoes() {
  const { toast } = useToast();
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(false); // Mocked as disconnected

  const handleOpenNewConnection = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Esta ferramenta ainda está em fase de desenvolvimento e estará disponível em breve.",
      variant: "default",
    });
    // setIsNewConnectionOpen(true); // Comentado por enquanto conforme solicitado
  };

  const handleCloseConnection = () => {
    setIsNewConnectionOpen(false);
  };

  const actions = (
    <HeaderActions.Add onClick={handleOpenNewConnection}>
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
                <p className="text-2xl font-bold text-foreground">{isWhatsappConnected ? 1 : 0}</p>
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
                <p className="text-2xl font-bold text-foreground">{isWhatsappConnected ? 0 : 1}</p>
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
                <p className="text-2xl font-bold text-foreground">{isWhatsappConnected ? 1 : 0}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Connections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isWhatsappConnected ? (
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isWhatsappConnected ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                    <MessageSquare className={`w-6 h-6 ${isWhatsappConnected ? 'text-green-500' : 'text-red-500'
                      }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">WhatsApp Business</h3>
                    <p className="text-sm text-muted-foreground">Zenvia API</p>
                  </div>
                </div>

                <Badge variant={isWhatsappConnected ? 'default' : 'secondary'}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${isWhatsappConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  {isWhatsappConnected ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Status da API</p>
                  <p className="text-sm font-medium text-green-600">Serviço operacional</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  O WhatsApp está configurado via Zenvia API para envio automático de campanhas e notificações.
                </p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={handleOpenNewConnection}>
                  <Settings className="w-4 h-4 mr-2" />
                  Sincronizar
                </Button>
              </div>
            </Card>
          ) : (
            <div className="lg:col-span-2 xl:col-span-3 py-12 text-center bg-muted/20 border border-dashed border-border rounded-xl">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground italic">Nenhuma conexão ativa encontrada no momento.</p>
            </div>
          )}
        </div>

        {/* Quick Setup */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Configurações do Canal</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 border-primary/50 bg-primary/5 hover:bg-primary/10"
              onClick={handleOpenNewConnection}
            >
              <MessageSquare className="w-8 h-8 text-primary" />
              <div className="text-center">
                <span className="font-semibold block">Configurar WhatsApp</span>
                <span className="text-xs text-muted-foreground">Conecte via QR Code ou API Token</span>
              </div>
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal Nova Conexão */}
      <Dialog open={isNewConnectionOpen} onOpenChange={setIsNewConnectionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-green-500/10 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <span className="font-medium">Conectar WhatsApp Business</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Escaneie o QR Code abaixo com seu WhatsApp para conectar ou sincronizar sua conta.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center space-y-2">
                  <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Gerando QR Code...
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4 max-w-sm">
                <p className="text-sm font-medium">Como conectar:</p>
                <ol className="text-xs text-muted-foreground space-y-2 text-left bg-muted/30 p-4 rounded-lg">
                  <li>1. Abra o WhatsApp no seu celular</li>
                  <li>2. Toque em Menu (⋮) ou Configurações</li>
                  <li>3. Toque em Aparelhos conectados</li>
                  <li>4. Toque em Conectar um aparelho</li>
                  <li>5. Aponte seu celular para esta tela para escanear o código</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleCloseConnection}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={() => {
                toast({ title: "Sincronizando", description: "Iniciando conexão com a API Zenvia..." });
                handleCloseConnection();
              }}>
                Confirmar Conexão
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
