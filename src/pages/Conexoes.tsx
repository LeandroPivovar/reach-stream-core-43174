import React, { useState, useMemo, useCallback } from 'react';
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
  Clock,
  Phone
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, EmailConnection, TwilioConnection } from '@/lib/api';
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
import InternalResponsiveTable from '@/components/common/responsive-table';
const ResponsiveTable = (typeof window !== 'undefined' && (window as any).ResponsiveTable) || InternalResponsiveTable;
import { cn } from '@/lib/utils';

export default function Conexoes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isTwilioModalOpen, setIsTwilioModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<EmailConnection | null>(null);

  const [emailForm, setEmailForm] = useState({
    domain: ''
  });

  const [twilioForm, setTwilioForm] = useState({
    friendlyName: '',
    whatsappFrom: ''
  });

  // Queries
  const { data: emailConnections, isLoading: isLoadingEmails } = useQuery({
    queryKey: ['email-connections'],
    queryFn: () => api.getEmailConnections(),
  });

  const { data: twilioConnections, isLoading: isLoadingTwilio } = useQuery({
    queryKey: ['twilio-requests'],
    queryFn: () => api.twilioConnectionsApi.getMyRequests(),
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

  const createTwilioMutation = useMutation({
    mutationFn: (data: any) => api.twilioConnectionsApi.request(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twilio-requests'] });
      toast({ title: 'Sucesso', description: 'Solicitação de número próprio enviada.' });
      setIsTwilioModalOpen(false);
      resetTwilioForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao enviar solicitação.',
        variant: 'destructive'
      });
    }
  });

  const deleteTwilioMutation = useMutation({
    mutationFn: (id: number) => api.twilioConnectionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twilio-requests'] });
      toast({ title: 'Sucesso', description: 'Solicitação removida.' });
    }
  });

  const resetEmailForm = () => {
    setEmailForm({
      domain: ''
    });
  };

  const resetTwilioForm = () => {
    setTwilioForm({
      friendlyName: '',
      whatsappFrom: ''
    });
  };

  const handleOpenNewConnection = () => setIsNewConnectionOpen(true);

  const handleOpenEmailModal = () => {
    setIsEmailModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado', description: 'Valor copiado para a área de transferência.' });
  };

  const actions = useMemo(() => (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setIsTwilioModalOpen(true)}>
        <MessageSquare className="mr-2 h-4 w-4" />
        Configurar WhatsApp
      </Button>
      <Button variant="outline" onClick={handleOpenEmailModal}>
        <Mail className="mr-2 h-4 w-4" />
        Configurar E-mail
      </Button>
    </div>
  ), []);

  // Unified data for Connections Table
  const connectionsData = useMemo(() => {
    const list: any[] = [];
    
    // WhatsApp (System default)
    list.push({
      id: 'whatsapp-system',
      type: 'whatsapp',
      platform: 'WhatsApp',
      provider: 'Sistema (Núcleo CRM)',
      identifier: 'Global / Compartilhado',
      status: 'verified',
      statusLabel: 'Conectado',
      icon: MessageSquare,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    });

    // WhatsApp (Requests)
    if (twilioConnections) {
      twilioConnections.forEach(conn => {
        list.push({
          id: `twilio-${conn.id}`,
          type: 'twilio',
          platform: 'WhatsApp',
          provider: 'Número Próprio (Twilio)',
          identifier: conn.whatsappFrom,
          status: conn.status,
          statusLabel: conn.status === 'verified' ? 'Verificado' : conn.status === 'pending' ? 'Pendente' : 'Rejeitado',
          icon: Phone,
          color: 'text-green-600',
          bgColor: 'bg-green-600/10',
          original: conn
        });
      });
    }
    
    // Emails
    if (emailConnections) {
      emailConnections.forEach(conn => {
        list.push({
          id: `email-${conn.id}`,
          type: 'email',
          platform: 'E-mail',
          provider: conn.type === 'smtp' ? 'SMTP Customizado' : 'Domínio Próprio',
          identifier: conn.type === 'smtp' ? conn.email : conn.domain,
          status: conn.status,
          statusLabel: conn.status === 'verified' ? 'Verificado' : conn.status === 'pending' ? 'Pendente' : 'Rejeitado',
          icon: Mail,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          original: conn
        });
      });
    }
    
    return list;
  }, [emailConnections, twilioConnections]);

  const connectionColumns = useMemo(() => [
    {
      header: "Canal",
      cell: (conn: any) => {
        const Icon = conn.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", conn.bgColor)}>
              <Icon className={cn("w-5 h-5", conn.color)} />
            </div>
            <div>
              <p className="font-semibold text-sm">{conn.platform}</p>
              <p className="text-xs text-muted-foreground">{conn.provider}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: "Identificador",
      cell: (conn: any) => (
        <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px] inline-block">
          {conn.identifier}
        </code>
      )
    },
    {
      header: "Status",
      cell: (conn: any) => (
        <Badge variant={conn.status === 'verified' ? 'default' : conn.status === 'pending' ? 'secondary' : 'destructive'}>
          <div className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", 
              conn.status === 'verified' ? 'bg-background' : 
              conn.status === 'pending' ? 'bg-muted-foreground' : 'bg-background'
            )} />
            {conn.statusLabel}
          </div>
        </Badge>
      )
    },
    {
      header: "Ações",
      className: "text-right",
      cell: (conn: any) => (
        <div className="flex justify-end gap-2">
          {conn.id === 'whatsapp-system' ? (
             <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">PADRÃO</Badge>
          ) : (
            <>
              {conn.type === 'email' && conn.original.type === 'domain' && (
                <Button variant="outline" size="sm" onClick={() => setSelectedConnection(conn.original)}>
                  Ver DNS
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (conn.type === 'twilio') {
                    deleteTwilioMutation.mutate(conn.original.id);
                  } else {
                    deleteEmailMutation.mutate(conn.original.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ], [deleteEmailMutation, deleteTwilioMutation]);

  const renderConnectionCard = useCallback((conn: any) => {
    const Icon = conn.icon;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", conn.bgColor)}>
              <Icon className={cn("w-6 h-6", conn.color)} />
            </div>
            <div>
              <h3 className="font-bold text-sm">{conn.platform}</h3>
              <p className="text-xs text-muted-foreground">{conn.provider}</p>
            </div>
          </div>
          <Badge variant={conn.status === 'verified' ? 'default' : conn.status === 'pending' ? 'secondary' : 'destructive'}>
            {conn.statusLabel}
          </Badge>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Identificador</p>
          <p className="text-sm font-medium truncate">{conn.identifier}</p>
        </div>

        {conn.type === 'email' && conn.original.type === 'domain' && conn.status !== 'verified' && (
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
            <p className="text-[10px] text-amber-600 font-bold mb-1 flex items-center gap-1">
              <Info className="w-3 h-3" /> AGUARDANDO CONFIGURAÇÃO DNS
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs h-8"
              onClick={() => setSelectedConnection(conn.original)}
            >
              Configurar Registros
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          {conn.id !== 'whatsapp-system' && (
            <div className="flex gap-2 w-full">
               <Button 
                 variant="outline" 
                 size="sm" 
                 className="flex-1 h-9 shadow-sm"
                 onClick={() => {
                   if (conn.type === 'email' && conn.original.type === 'domain') {
                     setSelectedConnection(conn.original);
                   } else {
                     toast({ title: 'Configuração', description: 'Esta conexão não requer configurações adicionais.' });
                   }
                 }}
               >
                 Detalhes
               </Button>
               <Button
                variant="ghost"
                size="sm"
                className="w-10 h-9 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (conn.type === 'twilio') {
                    deleteTwilioMutation.mutate(conn.original.id);
                  } else {
                    deleteEmailMutation.mutate(conn.original.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }, [deleteEmailMutation, deleteTwilioMutation, toast]);

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
                <p className="text-2xl font-bold text-foreground">
                  {(connectionsData.filter(c => c.status === 'verified').length)}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {(connectionsData.filter(c => c.status === 'rejected').length)}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {connectionsData.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Connections List */}
        <Card className="shadow-card overflow-hidden">
          <ResponsiveTable
            columns={connectionColumns}
            data={connectionsData}
            isLoading={isLoadingEmails || isLoadingTwilio}
            emptyMessage="Nenhuma conexão configurada."
            renderMobileCard={renderConnectionCard}
          />
        </Card>

      </div>

      {/* Modal Configurar E-mail */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Configurar Envio de E-mail</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => createEmailMutation.mutate({ ...emailForm, type: 'domain' })}
              disabled={createEmailMutation.isPending || !emailForm.domain}
            >
              {createEmailMutation.isPending ? 'Salvando...' : 'Confirmar Configuração'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Setup Modal */}
      <Dialog open={isTwilioModalOpen} onOpenChange={setIsTwilioModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Uso de Número Próprio</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-lg">
              <p className="text-xs text-green-700 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Deseja utilizar seu próprio número da Twilio para os envios?
              </p>
            </div>

            <p className="text-sm text-muted-foreground p-2">
              Ao clicar em solicitar, nossa equipe entrará em contato ou habilitará a configuração do seu número próprio no painel. O WhatsApp via sistema continua disponível para uso imediato.
            </p>

            <div className="space-y-2">
              <Label htmlFor="friendlyName">Identificação da Conexão (Opcional)</Label>
              <Input 
                id="friendlyName" 
                placeholder="Ex: Comercial WhatsApp" 
                value={twilioForm.friendlyName}
                onChange={(e) => setTwilioForm({ ...twilioForm, friendlyName: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Um nome para você identificar este número futuramente.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsTwilioModalOpen(false)}>Cancelar</Button>
            <Button 
              onClick={() => createTwilioMutation.mutate(twilioForm)}
              disabled={createTwilioMutation.isPending}
            >
              {createTwilioMutation.isPending ? 'Enviando...' : 'Enviar Solicitação'}
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
