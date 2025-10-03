import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Mail, 
  Smartphone,
  MoreHorizontal,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Users,
  ArrowLeft,
  ArrowRight,
  Send,
  Clock
} from 'lucide-react';

export default function Campanhas() {
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    group: '',
    formats: [] as ('wpp' | 'sms' | 'email')[],
    formatContents: {
      wpp: '',
      sms: '',
      email: { subject: '', html: '' }
    },
    scheduleType: 'now' as 'now' | 'schedule',
    scheduleDate: '',
    scheduleTime: ''
  });

  const contactGroups = ['VIP', 'Regular', 'Novos', 'Inativos'];

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Promoção Black Friday',
      type: ['WhatsApp', 'E-mail'],
      status: 'ativa',
      recipients: 5247,
      sent: 2847,
      opens: 1943,
      clicks: 312,
      responses: 89,
      createdAt: '2024-03-15',
      scheduledAt: '2024-03-20 09:00'
    },
    {
      id: 2,
      name: 'Carrinho Abandonado',
      type: ['E-mail'],
      status: 'pausada',
      recipients: 1254,
      sent: 1254,
      opens: 834,
      clicks: 127,
      responses: 23,
      createdAt: '2024-03-10',
      scheduledAt: null
    },
    {
      id: 3,
      name: 'Novos Produtos - Março',
      type: ['SMS'],
      status: 'agendada',
      recipients: 892,
      sent: 0,
      opens: 0,
      clicks: 0,
      responses: 0,
      createdAt: '2024-03-18',
      scheduledAt: '2024-03-25 14:00'
    },
    {
      id: 4,
      name: 'Newsletter Semanal',
      type: ['E-mail'],
      status: 'finalizada',
      recipients: 3421,
      sent: 3421,
      opens: 2156,
      clicks: 445,
      responses: 67,
      createdAt: '2024-03-12',
      scheduledAt: null
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-500';
      case 'pausada': return 'bg-yellow-500';
      case 'agendada': return 'bg-blue-500';
      case 'finalizada': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ativa': return 'default';
      case 'pausada': return 'secondary';
      case 'agendada': return 'outline';
      case 'finalizada': return 'secondary';
      default: return 'secondary';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp': return MessageSquare;
      case 'E-mail': return Mail;
      case 'SMS': return Smartphone;
      default: return MessageSquare;
    }
  };

  const getTotalSteps = () => {
    return 1 + newCampaign.formats.length + 1; // seleção + formatos + agendamento
  };

  const getCurrentFormatIndex = () => {
    return currentStep - 2; // step 2 = primeiro formato (index 0)
  };

  const getCurrentFormat = () => {
    return newCampaign.formats[getCurrentFormatIndex()];
  };

  const handleNextStep = () => {
    if (currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleFormat = (format: 'wpp' | 'sms' | 'email') => {
    setNewCampaign(prev => ({
      ...prev,
      formats: prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format]
    }));
  };

  const handleCreateCampaign = () => {
    console.log('Creating campaign:', newCampaign);
    setIsNewCampaignOpen(false);
    setCurrentStep(1);
    setNewCampaign({
      name: '',
      group: '',
      formats: [],
      formatContents: {
        wpp: '',
        sms: '',
        email: { subject: '', html: '' }
      },
      scheduleType: 'now',
      scheduleDate: '',
      scheduleTime: ''
    });
  };

  const actions = (
    <>
      <HeaderActions.Filter onClick={() => console.log('Filter clicked')} />
      <HeaderActions.Export onClick={() => console.log('Export clicked')} />
      <HeaderActions.Add onClick={() => setIsNewCampaignOpen(true)}>
        Nova Campanha
      </HeaderActions.Add>
    </>
  );

  return (
    <Layout 
      title="Campanhas" 
      subtitle="Gerencie suas campanhas de marketing multicanal"
      actions={actions}
      showSearch
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enviado</p>
                <p className="text-2xl font-bold text-foreground">7.522</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
                <p className="text-2xl font-bold text-foreground">64.8%</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Campanha</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Canais</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Destinatários</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Enviados</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Aberturas</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Cliques</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-border last:border-0">
                    <td className="py-4 px-2">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Criada em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        {campaign.scheduledAt && (
                          <div className="text-xs text-muted-foreground">
                            Agendada para {new Date(campaign.scheduledAt).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex flex-wrap gap-1">
                        {campaign.type.map((channel) => {
                          const Icon = getChannelIcon(channel);
                          return (
                            <div key={channel} className="flex items-center space-x-1 bg-muted/50 rounded-full px-2 py-1">
                              <Icon className="w-3 h-3" />
                              <span className="text-xs">{channel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant={getStatusVariant(campaign.status)}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(campaign.status)}`}></div>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      {campaign.recipients.toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      {campaign.sent.toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-medium">{campaign.opens.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {campaign.sent > 0 ? ((campaign.opens / campaign.sent) * 100).toFixed(1) : 0}%
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-medium">{campaign.clicks.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {campaign.opens > 0 ? ((campaign.clicks / campaign.opens) * 100).toFixed(1) : 0}%
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ações da Campanha</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-2">
                            <Button variant="ghost" className="justify-start">
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar Relatório
                            </Button>
                            <Button variant="ghost" className="justify-start">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar Campanha
                            </Button>
                            {campaign.status === 'ativa' ? (
                              <Button variant="ghost" className="justify-start">
                                <Pause className="w-4 h-4 mr-2" />
                                Pausar Campanha
                              </Button>
                            ) : campaign.status === 'pausada' ? (
                              <Button variant="ghost" className="justify-start">
                                <Play className="w-4 h-4 mr-2" />
                                Reativar Campanha
                              </Button>
                            ) : null}
                            <Button variant="ghost" className="justify-start text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir Campanha
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Nova Campanha */}
      <Dialog open={isNewCampaignOpen} onOpenChange={(open) => {
        setIsNewCampaignOpen(open);
        if (!open) {
          setCurrentStep(1);
          setNewCampaign({
            name: '',
            group: '',
            formats: [],
            formatContents: {
              wpp: '',
              sms: '',
              email: { subject: '', html: '' }
            },
            scheduleType: 'now',
            scheduleDate: '',
            scheduleTime: ''
          });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Campanha - Etapa {currentStep} de {getTotalSteps()}</DialogTitle>
          </DialogHeader>

          {/* Etapa 1: Seleção de Grupo e Formato */}
          {currentStep === 1 && (
            <div className="space-y-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="campaign-name">Nome da Campanha *</Label>
                <Input
                  id="campaign-name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="Ex: Promoção Black Friday"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact-group">Grupo de Contatos *</Label>
                <Select 
                  value={newCampaign.group} 
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Formatos de Envio * (selecione um ou mais)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Card 
                    className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.formats.includes('wpp') ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => toggleFormat('wpp')}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare className="w-8 h-8 text-green-500" />
                      <span className="font-medium">WhatsApp</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Mensagens de texto diretas
                      </span>
                    </div>
                  </Card>

                  <Card 
                    className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.formats.includes('sms') ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => toggleFormat('sms')}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Smartphone className="w-8 h-8 text-blue-500" />
                      <span className="font-medium">SMS</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Mensagens de texto curtas
                      </span>
                    </div>
                  </Card>

                  <Card 
                    className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.formats.includes('email') ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => toggleFormat('email')}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Mail className="w-8 h-8 text-orange-500" />
                      <span className="font-medium">E-mail</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Emails personalizados em HTML
                      </span>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleNextStep}
                  disabled={!newCampaign.name || !newCampaign.group || newCampaign.formats.length === 0}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapas 2 a N: Editor de Conteúdo para cada formato */}
          {currentStep > 1 && currentStep <= newCampaign.formats.length + 1 && (
            <div className="space-y-6 py-4">
              {getCurrentFormat() === 'wpp' && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Configuração WhatsApp</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wpp-message">Mensagem WhatsApp *</Label>
                    <Textarea
                      id="wpp-message"
                      value={newCampaign.formatContents.wpp}
                      onChange={(e) => setNewCampaign({ 
                        ...newCampaign, 
                        formatContents: { ...newCampaign.formatContents, wpp: e.target.value }
                      })}
                      placeholder="Digite sua mensagem..."
                      rows={8}
                    />
                  </div>
                </div>
              )}

              {getCurrentFormat() === 'sms' && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Configuração SMS</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-message">Mensagem SMS *</Label>
                      <span className="text-xs text-muted-foreground">
                        {newCampaign.formatContents.sms.length}/160 caracteres
                      </span>
                    </div>
                    <Textarea
                      id="sms-message"
                      value={newCampaign.formatContents.sms}
                      onChange={(e) => setNewCampaign({ 
                        ...newCampaign, 
                        formatContents: { ...newCampaign.formatContents, sms: e.target.value }
                      })}
                      placeholder="Digite sua mensagem SMS (máx. 160 caracteres)..."
                      rows={4}
                      maxLength={160}
                    />
                  </div>
                </div>
              )}

              {getCurrentFormat() === 'email' && (
                <div className="space-y-4">
                  <div className="bg-orange-500/10 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">Configuração E-mail</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email-subject">Assunto do E-mail *</Label>
                    <Input
                      id="email-subject"
                      value={newCampaign.formatContents.email.subject}
                      onChange={(e) => setNewCampaign({ 
                        ...newCampaign, 
                        formatContents: { 
                          ...newCampaign.formatContents, 
                          email: { ...newCampaign.formatContents.email, subject: e.target.value }
                        }
                      })}
                      placeholder="Digite o assunto do e-mail..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email-html">Conteúdo HTML *</Label>
                    <Textarea
                      id="email-html"
                      value={newCampaign.formatContents.email.html}
                      onChange={(e) => setNewCampaign({ 
                        ...newCampaign, 
                        formatContents: { 
                          ...newCampaign.formatContents, 
                          email: { ...newCampaign.formatContents.email, html: e.target.value }
                        }
                      })}
                      placeholder="Digite o HTML do e-mail..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  {newCampaign.formatContents.email.html && (
                    <div className="grid gap-2">
                      <Label>Preview</Label>
                      <div 
                        className="border rounded-lg p-4 bg-card"
                        dangerouslySetInnerHTML={{ __html: newCampaign.formatContents.email.html }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={
                    (getCurrentFormat() === 'email' && 
                      (!newCampaign.formatContents.email.subject || !newCampaign.formatContents.email.html)) ||
                    (getCurrentFormat() === 'wpp' && !newCampaign.formatContents.wpp) ||
                    (getCurrentFormat() === 'sms' && !newCampaign.formatContents.sms)
                  }
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Última Etapa: Agendamento */}
          {currentStep === getTotalSteps() && (
            <div className="space-y-6 py-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-2">
                    {newCampaign.formats.includes('wpp') && <MessageSquare className="w-5 h-5 text-green-500" />}
                    {newCampaign.formats.includes('sms') && <Smartphone className="w-5 h-5 text-blue-500" />}
                    {newCampaign.formats.includes('email') && <Mail className="w-5 h-5 text-orange-500" />}
                  </div>
                  <div>
                    <p className="font-medium">{newCampaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Grupo: {newCampaign.group}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <Label>Quando enviar a campanha?</Label>
                
                <Card 
                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                    newCampaign.scheduleType === 'now' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setNewCampaign({ ...newCampaign, scheduleType: 'now' })}
                >
                  <div className="flex items-start gap-3">
                    <Send className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Enviar Agora</p>
                      <p className="text-sm text-muted-foreground">
                        A campanha será enviada imediatamente após a criação
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                    newCampaign.scheduleType === 'schedule' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setNewCampaign({ ...newCampaign, scheduleType: 'schedule' })}
                >
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Agendar Envio</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Escolha data e hora para enviar a campanha
                      </p>
                      
                      {newCampaign.scheduleType === 'schedule' && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="grid gap-2">
                            <Label htmlFor="schedule-date">Data</Label>
                            <Input
                              id="schedule-date"
                              type="date"
                              value={newCampaign.scheduleDate}
                              onChange={(e) => setNewCampaign({ ...newCampaign, scheduleDate: e.target.value })}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="schedule-time">Hora</Label>
                            <Input
                              id="schedule-time"
                              type="time"
                              value={newCampaign.scheduleTime}
                              onChange={(e) => setNewCampaign({ ...newCampaign, scheduleTime: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={
                    newCampaign.scheduleType === 'schedule' && 
                    (!newCampaign.scheduleDate || !newCampaign.scheduleTime)
                  }
                >
                  {newCampaign.scheduleType === 'now' ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Criar e Enviar
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Criar e Agendar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}