import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Clock,
  Download,
  Link2,
  BarChart2,
  Zap,
  Tag,
  Gift
} from 'lucide-react';

export default function Campanhas() {
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    group: '',
    formats: [] as ('wpp' | 'sms' | 'email')[],
    campaignType: '' as 'dispatch' | 'coupon' | 'giftback' | '',
    formatContents: {
      wpp: '',
      sms: '',
      email: { subject: '', content: '', mode: 'text' as 'text' | 'html' }
    },
    tracking: {
      type: '' as 'utm' | 'pixel' | 'shortlink' | '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: ''
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
    return 1 + 1 + newCampaign.formats.length + 1 + 1; // seleção básica + tipo + formatos + tracking + agendamento
  };

  const getCurrentFormatIndex = () => {
    return currentStep - 3; // step 3 = primeiro formato (index 0)
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
      campaignType: '',
      formatContents: {
        wpp: '',
        sms: '',
        email: { subject: '', content: '', mode: 'text' as 'text' | 'html' }
      },
      tracking: {
        type: '',
        utmSource: '',
        utmMedium: '',
        utmCampaign: ''
      },
      scheduleType: 'now',
      scheduleDate: '',
      scheduleTime: ''
    });
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log('Exporting campaigns as:', format);
    setIsExportOpen(false);
  };

  const actions = (
    <>
      <HeaderActions.Filter onClick={() => console.log('Filter clicked')} />
      <HeaderActions.Export onClick={() => setIsExportOpen(true)} />
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
            campaignType: '',
            formatContents: {
              wpp: '',
              sms: '',
              email: { subject: '', content: '', mode: 'text' as 'text' | 'html' }
            },
            tracking: {
              type: '',
              utmSource: '',
              utmMedium: '',
              utmCampaign: ''
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

          {/* Etapa 2: Seleção de Tipo de Campanha */}
          {currentStep === 2 && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Escolha o tipo de campanha que melhor se adequa ao seu objetivo
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Tipo de Campanha *</Label>
                <div className="grid grid-cols-1 gap-4">
                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.campaignType === 'dispatch' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ ...newCampaign, campaignType: 'dispatch' })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Apenas Disparo</h3>
                        <p className="text-sm text-muted-foreground">
                          Envio simples de mensagens, emails ou SMS para seus contatos. Ideal para comunicações diretas, newsletters e avisos.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.campaignType === 'coupon' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ ...newCampaign, campaignType: 'coupon' })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tag className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Cupons de Desconto</h3>
                        <p className="text-sm text-muted-foreground">
                          Crie e distribua cupons promocionais personalizados. Perfeito para campanhas de vendas, promoções sazonais e incentivos.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.campaignType === 'giftback' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ ...newCampaign, campaignType: 'giftback' })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Gift className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Gift Back / Cash Back</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure programas de recompensa e cashback para seus clientes. Estimule a fidelização e o retorno de compras.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!newCampaign.campaignType}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapas 3 a N: Editor de Conteúdo para cada formato */}
          {currentStep > 2 && currentStep <= newCampaign.formats.length + 2 && (
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
                    <div className="flex items-center justify-between mb-2">
                      <Label>Modo de Edição</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {newCampaign.formatContents.email.mode === 'text' ? '✉️ Texto simples' : '💻 HTML avançado'}
                        </span>
                        <Switch
                          checked={newCampaign.formatContents.email.mode === 'html'}
                          onCheckedChange={(checked) => setNewCampaign({ 
                            ...newCampaign, 
                            formatContents: { 
                              ...newCampaign.formatContents, 
                              email: { 
                                ...newCampaign.formatContents.email, 
                                mode: checked ? 'html' : 'text'
                              }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email-content">
                      {newCampaign.formatContents.email.mode === 'html' ? 'Conteúdo HTML *' : 'Conteúdo do E-mail *'}
                    </Label>
                    <Textarea
                      id="email-content"
                      value={newCampaign.formatContents.email.content}
                      onChange={(e) => setNewCampaign({ 
                        ...newCampaign, 
                        formatContents: { 
                          ...newCampaign.formatContents, 
                          email: { ...newCampaign.formatContents.email, content: e.target.value }
                        }
                      })}
                      placeholder={
                        newCampaign.formatContents.email.mode === 'html' 
                          ? 'Digite o HTML do e-mail...' 
                          : 'Digite o conteúdo do e-mail...'
                      }
                      rows={12}
                      className={newCampaign.formatContents.email.mode === 'html' ? 'font-mono text-sm' : ''}
                    />
                  </div>
                  
                  {newCampaign.formatContents.email.mode === 'html' && newCampaign.formatContents.email.content && (
                    <div className="grid gap-2">
                      <Label>Preview</Label>
                      <div 
                        className="border rounded-lg p-4 bg-card"
                        dangerouslySetInnerHTML={{ __html: newCampaign.formatContents.email.content }}
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
                      (!newCampaign.formatContents.email.subject || !newCampaign.formatContents.email.content)) ||
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

          {/* Penúltima Etapa: Trackeamento */}
          {currentStep === getTotalSteps() - 1 && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">Configurar Trackeamento</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Escolha como deseja rastrear os resultados desta campanha
                </p>
              </div>

              <div className="grid gap-4">
                <Label>Tipo de Trackeamento *</Label>
                
                <Card 
                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                    newCampaign.tracking.type === 'utm' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setNewCampaign({ 
                    ...newCampaign, 
                    tracking: { ...newCampaign.tracking, type: 'utm' }
                  })}
                >
                  <div className="flex items-start gap-3">
                    <Link2 className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Parâmetros UTM</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Adicione tags UTM aos seus links para rastreamento no Google Analytics
                      </p>
                      
                      {newCampaign.tracking.type === 'utm' && (
                        <div className="space-y-3 mt-3">
                          <div className="grid gap-2">
                            <Label htmlFor="utm-source">Origem (utm_source)</Label>
                            <Input
                              id="utm-source"
                              value={newCampaign.tracking.utmSource}
                              onChange={(e) => setNewCampaign({ 
                                ...newCampaign, 
                                tracking: { ...newCampaign.tracking, utmSource: e.target.value }
                              })}
                              placeholder="Ex: newsletter, whatsapp, sms"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="utm-medium">Mídia (utm_medium)</Label>
                            <Input
                              id="utm-medium"
                              value={newCampaign.tracking.utmMedium}
                              onChange={(e) => setNewCampaign({ 
                                ...newCampaign, 
                                tracking: { ...newCampaign.tracking, utmMedium: e.target.value }
                              })}
                              placeholder="Ex: email, social, paid"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="utm-campaign">Campanha (utm_campaign)</Label>
                            <Input
                              id="utm-campaign"
                              value={newCampaign.tracking.utmCampaign}
                              onChange={(e) => setNewCampaign({ 
                                ...newCampaign, 
                                tracking: { ...newCampaign.tracking, utmCampaign: e.target.value }
                              })}
                              placeholder="Ex: black-friday, lancamento"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                    newCampaign.tracking.type === 'pixel' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setNewCampaign({ 
                    ...newCampaign, 
                    tracking: { ...newCampaign.tracking, type: 'pixel' }
                  })}
                >
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Pixel de Conversão</p>
                      <p className="text-sm text-muted-foreground">
                        Rastreie conversões usando pixels do Facebook, Google ou outros
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                    newCampaign.tracking.type === 'shortlink' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setNewCampaign({ 
                    ...newCampaign, 
                    tracking: { ...newCampaign.tracking, type: 'shortlink' }
                  })}
                >
                  <div className="flex items-start gap-3">
                    <Link2 className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Link Curto Rastreável</p>
                      <p className="text-sm text-muted-foreground">
                        Crie links curtos personalizados com rastreamento de cliques
                      </p>
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
                  onClick={handleNextStep}
                  disabled={!newCampaign.tracking.type}
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

      {/* Modal Exportar Campanhas */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar Campanhas</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <p className="text-sm text-muted-foreground">
              Escolha o formato para exportar os dados das campanhas
            </p>

            <div className="grid gap-3">
              <Card 
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleExport('csv')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-muted-foreground">
                      Arquivo de valores separados por vírgula
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleExport('excel')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Excel</p>
                    <p className="text-xs text-muted-foreground">
                      Planilha do Microsoft Excel (.xlsx)
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleExport('pdf')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">PDF</p>
                    <p className="text-xs text-muted-foreground">
                      Documento portátil para impressão
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Dados incluídos:</strong> Nome da campanha, canais, status, 
                destinatários, métricas de envio, aberturas e cliques.
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsExportOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}