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
  ArrowLeft,
  Mail,
  Plus,
  Trash2,
  Copy,
  Info,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, EmailConnection } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Conexoes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailConnType, setEmailConnType] = useState<'smtp' | 'domain'>('smtp');
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<EmailConnection | null>(null);

  // Email Connection Form State
  const [emailForm, setEmailForm] = useState({
    email: '',
    smtpHost: '',
    smtpPort: 587,
    username: '',
    password: '',
    secure: true,
    domain: ''
  });

  // Queries
  const { data: emailConnections, isLoading: isLoadingEmails } = useQuery({
    queryKey: ['email-connections'],
    queryFn: () => api.getEmailConnections(),
  });

  // Mutations
  const createEmailMutation = useMutation({
    mutationFn: (data: any) => api.createEmailConnection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-connections'] });
      toast({ title: 'Sucesso', description: 'Conexão de e-mail criada com sucesso.' });
      setIsEmailModalOpen(false);
      resetEmailForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao criar conexão de e-mail.',
        variant: 'destructive'
      });
    }
  });

  const deleteEmailMutation = useMutation({
    mutationFn: (id: number) => api.deleteEmailConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-connections'] });
      toast({ title: 'Sucesso', description: 'Conexão removida.' });
    }
  });

  const resetEmailForm = () => {
    setEmailForm({
      email: '',
      smtpHost: '',
      smtpPort: 587,
      username: '',
      password: '',
      secure: true,
      domain: ''
    });
  };

  const handleOpenNewConnection = () => {
    setIsNewConnectionOpen(true);
  };

  const handleOpenEmailModal = () => {
    setIsEmailModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado', description: 'Valor copiado para a área de transferência.' });
  };

  const actions = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleOpenEmailModal}>
        <Mail className="mr-2 h-4 w-4" />
        Configurar E-mail
      </Button>
      <HeaderActions.Add onClick={handleOpenNewConnection}>
        Nova Conexão
      </HeaderActions.Add>
    </div>
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
          {/* WhatsApp Connection */}
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
            <Card className="p-6 border-dashed bg-muted/20 flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">Nenhum WhatsApp conectado.</p>
              <Button variant="outline" size="sm" onClick={handleOpenNewConnection}>
                Conectar WhatsApp
              </Button>
            </Card>
          )}

          {/* Email Connections */}
          {isLoadingEmails ? (
            <Card className="p-6 animate-pulse">
              <div className="h-12 w-12 bg-muted rounded-lg mb-4"></div>
              <div className="h-4 w-32 bg-muted rounded mb-2"></div>
              <div className="h-3 w-48 bg-muted rounded"></div>
            </Card>
          ) : (
            emailConnections?.map((conn) => (
              <Card key={conn.id} className="p-6 relative group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold truncate max-w-[150px]">
                        {conn.type === 'smtp' ? conn.email : conn.domain}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {conn.type === 'smtp' ? 'SMTP Customizado' : 'Domínio Próprio'}
                      </p>
                    </div>
                  </div>

                  <Badge variant={conn.status === 'verified' ? 'default' : conn.status === 'pending' ? 'secondary' : 'destructive'}>
                    <div className="flex items-center gap-1">
                      {conn.status === 'verified' && <CheckCircle2 className="w-3 h-3" />}
                      {conn.status === 'pending' && <Clock className="w-3 h-3" />}
                      {conn.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {conn.status === 'verified' ? 'Verificado' : conn.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                    </div>
                  </Badge>
                </div>

                {conn.type === 'domain' && conn.status !== 'verified' && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 mb-4">
                    <p className="text-[10px] text-amber-600 font-medium mb-1 flex items-center gap-1">
                      <Info className="w-3 h-3" /> AGUARDANDO CONFIGURAÇÃO DNS
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">TXT Record</span>
                        <Button variant="ghost" className="h-4 px-1 text-[9px]" onClick={() => copyToClipboard(conn.dnsTxt || '')}>
                          <Copy className="w-2 h-2 mr-1" /> Copiar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {conn.status === 'rejected' && conn.adminNote && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 mb-4">
                    <p className="text-[10px] text-red-600 font-medium mb-1">MOTIVO DA REJEIÇÃO:</p>
                    <p className="text-[11px] text-muted-foreground italic">{conn.adminNote}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {conn.type === 'domain' && (
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => {
                      setSelectedConnection(conn);
                    }}>
                      Ver DNS
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteEmailMutation.mutate(conn.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}

          {/* Add Email Placeholder */}
          <Card
            className="p-6 border-dashed bg-muted/5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/10 transition-colors"
            onClick={handleOpenEmailModal}
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Adicionar E-mail</p>
            <p className="text-xs text-muted-foreground">SMTP ou Domínio Próprio</p>
          </Card>
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

      {/* Modal Configurar E-mail */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Configurar Envio de E-mail</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="smtp" value={emailConnType} onValueChange={(v: any) => setEmailConnType(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="smtp">SMTP Customizado</TabsTrigger>
              <TabsTrigger value="domain">Domínio Próprio</TabsTrigger>
            </TabsList>

            <TabsContent value="smtp" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>E-mail de Envio</Label>
                  <Input
                    placeholder="contato@empresa.com"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Servidor SMTP</Label>
                  <Input
                    placeholder="smtp.gmail.com"
                    value={emailForm.smtpHost}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Porta</Label>
                  <Input
                    type="number"
                    placeholder="587"
                    value={emailForm.smtpPort}
                    onChange={(e) => setEmailForm({ ...emailForm, smtpPort: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <Input
                    placeholder="contato@empresa.com"
                    value={emailForm.username}
                    onChange={(e) => setEmailForm({ ...emailForm, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="domain" className="space-y-4 py-4">
              <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-lg mb-4">
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Utilize seu próprio domínio para maior taxa de entrega e autoridade.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Seu Domínio</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="empresa.com"
                    className="flex-1"
                    value={emailForm.domain}
                    onChange={(e) => setEmailForm({ ...emailForm, domain: e.target.value })}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Após adicionar, você precisará configurar registros DNS em seu provedor.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => createEmailMutation.mutate({ ...emailForm, type: emailConnType })}
              disabled={createEmailMutation.isPending}
            >
              {createEmailMutation.isPending ? 'Salvando...' : 'Confirmar Configuração'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DNS Info Modal */}
      <Dialog open={!!selectedConnection} onOpenChange={() => setSelectedConnection(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuração de DNS</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-lg">
              <p className="text-sm text-amber-600 font-medium mb-1">Status: Pendente de Aprovação</p>
              <p className="text-xs text-muted-foreground">
                Insira os registros abaixo no seu editor de DNS (Cloudflare, GoDaddy, etc) e aguarde a aprovação do administrador.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">TXT Record (SPF/Verification)</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-2 rounded border truncate">{selectedConnection?.dnsTxt}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(selectedConnection?.dnsTxt || '')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">CNAME Record (DKIM)</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-2 rounded border truncate">{selectedConnection?.dnsCname}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(selectedConnection?.dnsCname || '')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">MX Record</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-2 rounded border truncate">{selectedConnection?.dnsMx}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(selectedConnection?.dnsMx || '')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={() => setSelectedConnection(null)}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

