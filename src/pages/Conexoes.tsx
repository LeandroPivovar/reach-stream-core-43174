import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api, type EmailConnection, type CreateEmailConnectionData } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Mail, 
  Smartphone,
  Wifi,
  WifiOff,
  Settings,
  Trash2,
  QrCode,
  ArrowLeft
} from 'lucide-react';

export default function Conexoes() {
  const { toast } = useToast();
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [connectionType, setConnectionType] = useState<'whatsapp' | 'gmail' | 'sms' | null>(null);
  const [smtpData, setSmtpData] = useState({
    email: '',
    server: '',
    port: '587',
    username: '',
    password: ''
  });
  const [smsNumber, setSmsNumber] = useState('');
  const [emailConnections, setEmailConnections] = useState<EmailConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [savingConnection, setSavingConnection] = useState(false);

  const loadConnections = async () => {
    try {
      setLoadingConnections(true);
      const data = await api.getEmailConnections();
      setEmailConnections(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar conexões';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setLoadingConnections(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const connectedCount = emailConnections.length;
  const disconnectedCount = 0;
  const totalCount = emailConnections.length;

  const handleOpenNewConnection = () => {
    setConnectionType(null);
    setIsNewConnectionOpen(true);
  };

  const handleSelectType = (type: 'whatsapp' | 'gmail' | 'sms') => {
    setConnectionType(type);
  };

  const handleCloseConnection = () => {
    setIsNewConnectionOpen(false);
    setConnectionType(null);
    setSmtpData({
      email: '',
      server: '',
      port: '587',
      username: '',
      password: ''
    });
    setSmsNumber('');
  };

  const handleConnect = async () => {
    if (connectionType !== 'gmail') {
      handleCloseConnection();
      return;
    }

    const payload: CreateEmailConnectionData = {
      email: smtpData.email.trim(),
      smtpHost: smtpData.server.trim(),
      smtpPort: Number(smtpData.port) || 587,
      username: smtpData.username.trim(),
      password: smtpData.password,
      secure: Number(smtpData.port) === 465 ? true : undefined,
    };

    try {
      setSavingConnection(true);
      await api.createEmailConnection(payload);
      toast({ title: 'Conexão criada', description: 'SMTP salvo com sucesso.' });
      await loadConnections();
      handleCloseConnection();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar conexão';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setSavingConnection(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteEmailConnection(id);
      toast({ title: 'Conexão removida', description: 'SMTP desconectado.' });
      await loadConnections();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover conexão';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    }
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
                <p className="text-2xl font-bold text-foreground">{connectedCount}</p>
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
                <p className="text-2xl font-bold text-foreground">{disconnectedCount}</p>
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
                <p className="text-2xl font-bold text-foreground">{totalCount}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Connections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingConnections && (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Carregando conexões...</p>
            </Card>
          )}

          {!loadingConnections && emailConnections.length === 0 && (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">
                Nenhuma conexão SMTP cadastrada. Clique em “Nova Conexão” para adicionar.
              </p>
            </Card>
          )}

          {emailConnections.map((connection) => {
            const Icon = Mail;
            const isConnected = true;
            const lastSync = new Date(connection.updatedAt || connection.createdAt).toLocaleString();

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
                      <h3 className="font-semibold">{connection.email}</h3>
                      <p className="text-sm text-muted-foreground">E-mail (SMTP)</p>
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
                  <div>
                    <p className="text-xs text-muted-foreground">E-mail</p>
                    <p className="text-sm">{connection.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Servidor</p>
                    <p className="text-sm">{connection.smtpHost}:{connection.smtpPort}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Usuário</p>
                    <p className="text-sm">{connection.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Segurança</p>
                    <p className="text-sm">{connection.secure ? 'SSL' : 'TLS/STARTTLS'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Última sincronização</p>
                    <p className="text-sm">{lastSync}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(connection.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Setup */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Conectar Novo Canal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={handleOpenNewConnection}
            >
              <MessageSquare className="w-6 h-6" />
              <span>WhatsApp</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={handleOpenNewConnection}
            >
              <Mail className="w-6 h-6" />
              <span>E-mail</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={handleOpenNewConnection}
            >
              <Smartphone className="w-6 h-6" />
              <span>SMS</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal Nova Conexão */}
      <Dialog open={isNewConnectionOpen} onOpenChange={setIsNewConnectionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {!connectionType && 'Selecione o tipo de conexão'}
              {connectionType === 'whatsapp' && 'Conectar WhatsApp'}
              {connectionType === 'gmail' && 'Conectar Gmail (SMTP)'}
              {connectionType === 'sms' && 'Conectar SMS'}
            </DialogTitle>
          </DialogHeader>

          {/* Seleção de Tipo */}
          {!connectionType && (
            <div className="space-y-6 py-4">
              <p className="text-sm text-muted-foreground">
                Escolha qual canal de comunicação deseja conectar
              </p>

              <div className="grid grid-cols-1 gap-4">
                <Card 
                  className="p-6 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectType('whatsapp')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">WhatsApp Business</h3>
                      <p className="text-sm text-muted-foreground">
                        Conecte sua conta do WhatsApp Business usando QR Code para enviar mensagens aos seus contatos
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectType('gmail')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">E-mail (SMTP)</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure seu servidor SMTP (Gmail, Outlook, etc.) para enviar campanhas de e-mail
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectType('sms')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">SMS</h3>
                      <p className="text-sm text-muted-foreground">
                        Adicione um número de telefone para enviar mensagens SMS aos seus contatos
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={handleCloseConnection}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* WhatsApp - QR Code */}
          {connectionType === 'whatsapp' && (
            <div className="space-y-6 py-4">
              <div className="bg-green-500/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Conectar WhatsApp Business</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Escaneie o QR Code abaixo com seu WhatsApp para conectar
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
                
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Como conectar:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 text-left">
                    <li>1. Abra o WhatsApp no seu celular</li>
                    <li>2. Toque em Menu (⋮) ou Configurações</li>
                    <li>3. Toque em Aparelhos conectados</li>
                    <li>4. Toque em Conectar um aparelho</li>
                    <li>5. Aponte seu celular para esta tela para escanear o código</li>
                  </ol>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setConnectionType(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleConnect}>
                  Conectar
                </Button>
              </div>
            </div>
          )}

          {/* Gmail - SMTP */}
          {connectionType === 'gmail' && (
            <div className="space-y-6 py-4">
              <div className="bg-orange-500/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Configuração SMTP</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure seu servidor SMTP para enviar e-mails
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={smtpData.email}
                    onChange={(e) => setSmtpData({ ...smtpData, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="server">Servidor SMTP *</Label>
                  <Input
                    id="server"
                    value={smtpData.server}
                    onChange={(e) => setSmtpData({ ...smtpData, server: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gmail: smtp.gmail.com | Outlook: smtp-mail.outlook.com
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="port">Porta *</Label>
                  <Input
                    id="port"
                    value={smtpData.port}
                    onChange={(e) => setSmtpData({ ...smtpData, port: e.target.value })}
                    placeholder="587"
                  />
                  <p className="text-xs text-muted-foreground">
                    Porta comum: 587 (TLS) ou 465 (SSL)
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">Usuário *</Label>
                  <Input
                    id="username"
                    value={smtpData.username}
                    onChange={(e) => setSmtpData({ ...smtpData, username: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={smtpData.password}
                    onChange={(e) => setSmtpData({ ...smtpData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Para Gmail, use uma Senha de App específica
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setConnectionType(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleConnect}
                  disabled={savingConnection || !smtpData.email || !smtpData.server || !smtpData.username || !smtpData.password}
                >
                  {savingConnection ? 'Salvando...' : 'Conectar'}
                </Button>
              </div>
            </div>
          )}

          {/* SMS - Número */}
          {connectionType === 'sms' && (
            <div className="space-y-6 py-4">
              <div className="bg-blue-500/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Configurar SMS</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Insira o número que será usado para enviar SMS
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="sms-number">Número de Telefone *</Label>
                  <Input
                    id="sms-number"
                    value={smsNumber}
                    onChange={(e) => setSmsNumber(e.target.value)}
                    placeholder="+55 11 99999-9999"
                  />
                  <p className="text-xs text-muted-foreground">
                    Inclua o código do país (ex: +55 para Brasil)
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Informações importantes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• O número deve estar ativo e habilitado para SMS</li>
                    <li>• Verifique com seu provedor os custos de envio</li>
                    <li>• Certifique-se de ter créditos suficientes</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setConnectionType(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleConnect}
                  disabled={!smsNumber}
                >
                  Conectar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}